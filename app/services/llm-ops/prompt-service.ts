import {
	collection,
	doc,
	getDoc,
	getDocs,
	addDoc,
	updateDoc,
	query,
	where,
	orderBy,
	Timestamp
} from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import type {
	Prompt,
	PromptVersion,
	PromptFormData,
	PromptFilters,
	PromptType
} from '@/types/llm-ops';
import { COLLECTIONS, PROMPT_TYPES } from '@/constants/llm-ops';
import { extractVariables, validatePromptVariables } from '@/utils/template-utils';
import { logActivity } from './activity-log-service';

async function autoDemoteExistingProductionPrompt(
	promptType: PromptType,
	tags: string[],
	currentPromptId?: string
): Promise<void> {
	if (!tags.includes('production')) return;

	const promptsRef = collection(db, COLLECTIONS.PROMPTS);
	const q = query(
		promptsRef,
		where('promptType', '==', promptType),
		where('tags', 'array-contains', 'production')
	);
	const snapshot = await getDocs(q);

	for (const docSnap of snapshot.docs) {
		if (docSnap.id === currentPromptId) continue;

		const data = docSnap.data();

		await updateDoc(doc(db, COLLECTIONS.PROMPTS, docSnap.id), {
			tags: ['development'],
			status: 'draft',
			updatedAt: Timestamp.now()
		});

		await logActivity({
			promptId: docSnap.id,
			promptName: data.name || 'Untitled Prompt',
			action: 'tag_changed',
			description: `Automatically demoted from Production to Development and set to Draft status because another '${
				PROMPT_TYPES[promptType]?.label || promptType
			}' prompt was set to Production.`
		});
	}
}

export async function getPrompts(filters?: Partial<PromptFilters>): Promise<Prompt[]> {
	const promptsRef = collection(db, COLLECTIONS.PROMPTS);
	let q = query(promptsRef, orderBy('updatedAt', 'desc'));

	if (filters?.promptType && filters.promptType !== 'all') {
		q = query(q, where('promptType', '==', filters.promptType));
	}
	if (filters?.status && filters.status !== 'all') {
		q = query(q, where('status', '==', filters.status));
	}
	if (filters?.tags && filters.tags.length > 0) {
		q = query(q, where('tags', 'array-contains-any', filters.tags));
	}
	if (filters?.model && filters.model !== 'all') {
		q = query(q, where('model', '==', filters.model));
	}

	const snapshot = await getDocs(q);
	return snapshot.docs.map(
		(docSnap) => ({ id: docSnap.id, ...docSnap.data() }) as Prompt
	);
}

export async function getPromptById(id: string): Promise<Prompt> {
	const docRef = doc(db, COLLECTIONS.PROMPTS, id);
	const snapshot = await getDoc(docRef);
	if (!snapshot.exists()) {
		throw new Error(`Prompt with ID "${id}" not found.`);
	}
	return { id: snapshot.id, ...snapshot.data() } as Prompt;
}

export async function createPrompt(data: PromptFormData): Promise<string> {
	const user = auth.currentUser;

	// 1. Extract and validate completeness of required runtime variables
	const detectedVariables = extractVariables(data.contentJson);
	const validation = validatePromptVariables(detectedVariables, data.promptType);

	if (!validation.valid) {
		throw new Error(
			`Missing Required Runtime Variables: The template for '${
				PROMPT_TYPES[data.promptType]?.label
			}' is missing required variables:\n- ${validation.missingVariables.join('\n- ')}`
		);
	}

	// 2. Production Status Lock: Production prompts must always be Active
	const finalStatus = data.tags.includes('production') ? 'active' : data.status;

	// 3. Automatically demote any existing Production prompt of the same type
	await autoDemoteExistingProductionPrompt(data.promptType, data.tags);

	const now = Timestamp.now();

	const promptData: Omit<Prompt, 'id'> = {
		name: data.name,
		description: data.description,
		promptType: data.promptType,
		contentJson: data.contentJson,
		contentHtml: data.contentHtml,
		contentTemplate: data.contentTemplate,
		model: data.model,
		tags: data.tags,
		variables: detectedVariables,
		contextUrls: data.contextUrls || [],
		version: 1,
		activeVersionId: '',
		createdBy: user?.uid || 'system',
		createdByName: user?.displayName || 'System User',
		createdAt: now,
		updatedBy: user?.uid || 'system',
		updatedByName: user?.displayName || 'System User',
		updatedAt: now,
		status: finalStatus
	};

	const promptsRef = collection(db, COLLECTIONS.PROMPTS);
	const promptDoc = await addDoc(promptsRef, promptData);

	const versionData: Omit<PromptVersion, 'id'> = {
		version: 1,
		promptType: data.promptType,
		contentJson: data.contentJson,
		contentHtml: data.contentHtml,
		contentTemplate: data.contentTemplate,
		model: data.model,
		variables: detectedVariables,
		tags: data.tags,
		contextUrls: data.contextUrls || [],
		createdBy: user?.uid || 'system',
		createdByName: user?.displayName || 'System User',
		createdAt: now,
		changeNote: 'Initial version'
	};

	const versionsRef = collection(
		db,
		COLLECTIONS.PROMPTS,
		promptDoc.id,
		COLLECTIONS.VERSIONS
	);
	const versionDoc = await addDoc(versionsRef, versionData);

	await updateDoc(doc(db, COLLECTIONS.PROMPTS, promptDoc.id), {
		activeVersionId: versionDoc.id
	});

	return promptDoc.id;
}

export async function updatePrompt(
	id: string,
	data: Partial<PromptFormData>,
	changeNote: string
): Promise<void> {
	const user = auth.currentUser;

	const docRef = doc(db, COLLECTIONS.PROMPTS, id);
	const snapshot = await getDoc(docRef);
	if (!snapshot.exists()) throw new Error('Prompt not found.');

	const currentData = snapshot.data() as Prompt;
	const targetPromptType = data.promptType || currentData.promptType;
	const targetContentJson = data.contentJson || currentData.contentJson;
	const targetTags = data.tags || currentData.tags || [];
	let targetStatus = data.status || currentData.status;
	const targetContextUrls =
		data.contextUrls !== undefined ? data.contextUrls : currentData.contextUrls || [];

	if (targetTags.includes('production')) {
		if (targetStatus !== 'active') {
			throw new Error(
				'Production Status Restriction: A prompt tagged as Production must always be in Active status.'
			);
		}
	}

	if (currentData.tags?.includes('production') && !targetTags.includes('production')) {
		const promptsRef = collection(db, COLLECTIONS.PROMPTS);
		const q = query(
			promptsRef,
			where('promptType', '==', targetPromptType),
			where('tags', 'array-contains', 'production')
		);
		const prodSnapshot = await getDocs(q);
		const otherProdDocs = prodSnapshot.docs.filter((d) => d.id !== id);

		if (otherProdDocs.length === 0) {
			const typeLabel = PROMPT_TYPES[targetPromptType]?.label || targetPromptType;
			throw new Error(
				`Production Tag Protection: Cannot demote this prompt to Development because '${typeLabel}' requires an active Production prompt. To change the Production prompt, set another prompt of this type to Production instead.`
			);
		}
	}

	const detectedVariables = extractVariables(targetContentJson);
	const validation = validatePromptVariables(detectedVariables, targetPromptType);

	if (!validation.valid) {
		throw new Error(
			`Missing Required Runtime Variables: The template for '${
				PROMPT_TYPES[targetPromptType]?.label
			}' is missing required variables:\n- ${validation.missingVariables.join('\n- ')}`
		);
	}

	// 4. Automatically demote any existing Production prompt of the same type to Development & Draft
	await autoDemoteExistingProductionPrompt(targetPromptType, targetTags, id);

	const nextVersion = (currentData.version || 0) + 1;
	const now = Timestamp.now();

	const updatePayload: Record<string, unknown> = {
		...data,
		promptType: targetPromptType,
		status: targetStatus,
		variables: detectedVariables,
		contextUrls: targetContextUrls,
		version: nextVersion,
		updatedBy: user?.uid || 'system',
		updatedByName: user?.displayName || 'System User',
		updatedAt: now
	};

	await updateDoc(docRef, updatePayload);

	const versionData: Omit<PromptVersion, 'id'> = {
		version: nextVersion,
		promptType: targetPromptType,
		contentJson: targetContentJson,
		contentHtml: data.contentHtml ?? currentData.contentHtml,
		contentTemplate: data.contentTemplate ?? currentData.contentTemplate,
		model: data.model ?? currentData.model,
		variables: detectedVariables,
		tags: targetTags,
		contextUrls: targetContextUrls,
		createdBy: user?.uid || 'system',
		createdByName: user?.displayName || 'System User',
		createdAt: now,
		changeNote
	};

	const versionsRef = collection(db, COLLECTIONS.PROMPTS, id, COLLECTIONS.VERSIONS);
	const versionDoc = await addDoc(versionsRef, versionData);

	await updateDoc(docRef, { activeVersionId: versionDoc.id });
}

export async function deletePrompt(id: string): Promise<void> {
	const docRef = doc(db, COLLECTIONS.PROMPTS, id);
	const snapshot = await getDoc(docRef);
	if (!snapshot.exists()) throw new Error('Prompt not found.');
	const data = snapshot.data() as Prompt;

	if (data.tags && data.tags.includes('production')) {
		throw new Error(
			"Production Prompt Protection: Cannot archive a prompt that is currently in Production. Please assign another prompt of this type to Production or change this prompt's tag to Development first."
		);
	}

	await updateDoc(docRef, {
		status: 'archived',
		updatedAt: Timestamp.now()
	});

	await logActivity({
		promptId: id,
		promptName: data.name || 'Untitled Prompt',
		action: 'status_changed',
		description: 'Archived prompt'
	});
}

export async function restorePrompt(id: string): Promise<void> {
	const docRef = doc(db, COLLECTIONS.PROMPTS, id);
	const snapshot = await getDoc(docRef);
	if (!snapshot.exists()) throw new Error('Prompt not found.');
	const data = snapshot.data() as Prompt;

	await updateDoc(docRef, {
		status: 'draft',
		updatedAt: Timestamp.now()
	});

	await logActivity({
		promptId: id,
		promptName: data.name || 'Untitled Prompt',
		action: 'status_changed',
		description: 'Restored prompt from Archived to Draft status'
	});
}

export async function getPromptVersions(promptId: string): Promise<PromptVersion[]> {
	const versionsRef = collection(db, COLLECTIONS.PROMPTS, promptId, COLLECTIONS.VERSIONS);
	const q = query(versionsRef, orderBy('version', 'desc'));
	const snapshot = await getDocs(q);
	return snapshot.docs.map(
		(docSnap) => ({ id: docSnap.id, ...docSnap.data() }) as PromptVersion
	);
}

export async function rollbackToVersion(
	promptId: string,
	versionId: string
): Promise<void> {
	const user = auth.currentUser;

	const versionDocRef = doc(
		db,
		COLLECTIONS.PROMPTS,
		promptId,
		COLLECTIONS.VERSIONS,
		versionId
	);
	const versionSnapshot = await getDoc(versionDocRef);
	if (!versionSnapshot.exists()) throw new Error('Version not found.');

	const versionData = versionSnapshot.data() as PromptVersion;

	const promptRef = doc(db, COLLECTIONS.PROMPTS, promptId);
	const promptSnapshot = await getDoc(promptRef);
	const nextVersion = ((promptSnapshot.data()?.version as number) || 0) + 1;
	const now = Timestamp.now();

	await updateDoc(promptRef, {
		promptType: versionData.promptType,
		contentJson: versionData.contentJson,
		contentHtml: versionData.contentHtml,
		contentTemplate: versionData.contentTemplate,
		model: versionData.model,
		variables: versionData.variables,
		tags: versionData.tags,
		contextUrls: versionData.contextUrls || [],
		version: nextVersion,
		updatedBy: user?.uid || 'system',
		updatedByName: user?.displayName || 'System User',
		updatedAt: now
	});

	const rollbackVersionData: Omit<PromptVersion, 'id'> = {
		version: nextVersion,
		promptType: versionData.promptType,
		contentJson: versionData.contentJson,
		contentHtml: versionData.contentHtml,
		contentTemplate: versionData.contentTemplate,
		model: versionData.model,
		variables: versionData.variables,
		tags: versionData.tags,
		contextUrls: versionData.contextUrls || [],
		createdBy: user?.uid || 'system',
		createdByName: user?.displayName || 'System User',
		createdAt: now,
		changeNote: `Rollback to version ${versionData.version}`
	};

	const versionsRef = collection(db, COLLECTIONS.PROMPTS, promptId, COLLECTIONS.VERSIONS);
	const newVersionDoc = await addDoc(versionsRef, rollbackVersionData);

	await updateDoc(promptRef, { activeVersionId: newVersionDoc.id });
}
