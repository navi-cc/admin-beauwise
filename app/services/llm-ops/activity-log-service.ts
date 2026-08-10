import {
	collection,
	addDoc,
	query,
	where,
	orderBy,
	limit as firestoreLimit,
	getDocs,
	Timestamp
} from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import type { ActivityLog, ActivityAction } from '@/types/llm-ops';
import { COLLECTIONS } from '@/constants/llm-ops';

export async function logActivity(data: {
	promptId: string;
	promptName: string;
	action: ActivityAction;
	description: string;
	metadata?: Record<string, unknown>;
}): Promise<void> {
	const user = auth.currentUser;

	const logData: Omit<ActivityLog, 'id'> = {
		promptId: data.promptId,
		promptName: data.promptName,
		action: data.action,
		description: data.description,
		metadata: data.metadata ?? {},
		performedBy: user?.uid ?? 'system',
		performedByName: user?.displayName ?? 'System',
		createdAt: Timestamp.now()
	};

	const logsRef = collection(db, COLLECTIONS.ACTIVITY_LOGS);
	await addDoc(logsRef, logData);
}

export async function getActivityLogs(
	promptId?: string,
	limitCount: number = 50
): Promise<ActivityLog[]> {
	const logsRef = collection(db, COLLECTIONS.ACTIVITY_LOGS);
	let q;

	if (promptId) {
		q = query(
			logsRef,
			where('promptId', '==', promptId),
			orderBy('createdAt', 'desc'),
			firestoreLimit(limitCount)
		);
	} else {
		q = query(logsRef, orderBy('createdAt', 'desc'), firestoreLimit(limitCount));
	}

	const snapshot = await getDocs(q);
	return snapshot.docs.map(
		(docSnap) => ({ id: docSnap.id, ...docSnap.data() }) as ActivityLog
	);
}

export async function getRecentActivity(limitCount: number = 20): Promise<ActivityLog[]> {
	const logsRef = collection(db, COLLECTIONS.ACTIVITY_LOGS);
	const q = query(logsRef, orderBy('createdAt', 'desc'), firestoreLimit(limitCount));

	const snapshot = await getDocs(q);
	return snapshot.docs.map(
		(docSnap) => ({ id: docSnap.id, ...docSnap.data() }) as ActivityLog
	);
}
