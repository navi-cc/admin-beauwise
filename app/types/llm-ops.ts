import { Timestamp } from 'firebase/firestore';

export type PromptType = 'ingredient_analysis' | 'ocr_ingredient_parser';

export interface PromptTypeVariableSchema {
	name: string;
	path: string;
	label: string;
	type: 'string' | 'array' | 'url_array';
	category: string;
	required: boolean;
	maxLimit?: number;
	description: string;
}

export interface PromptTypeConfig {
	id: PromptType;
	label: string;
	description: string;
	badgeColor: string;
	variables: PromptTypeVariableSchema[];
}

export interface ModelConfig {
	temperature: number;
	maxTokens: number;
	topP: number;
}

export interface ModelOption {
	id: string;
	name: string;
	description: string;
}

export type PromptStatus = 'draft' | 'active' | 'archived';

export interface TagOption {
	label: string;
	value: string;
	color: string;
}

export interface Prompt {
	id: string;
	name: string;
	description: string;
	promptType: PromptType;

	contentJson: Record<string, unknown>;
	contentHtml: string;
	contentTemplate: string;

	model: string;

	tags: string[];
	variables: string[];
	contextUrls?: string[];

	version: number;
	activeVersionId: string;

	createdBy: string;
	createdByName: string;
	createdAt: Timestamp;
	updatedBy: string;
	updatedByName: string;
	updatedAt: Timestamp;

	status: PromptStatus;
}

export interface PromptVersion {
	id: string;
	version: number;
	promptType: PromptType;
	contentJson: Record<string, unknown>;
	contentHtml: string;
	contentTemplate: string;
	model: string;
	variables: string[];
	tags: string[];
	contextUrls?: string[];

	createdBy: string;
	createdByName: string;
	createdAt: Timestamp;
	changeNote: string;
}

export type ActivityAction =
	| 'created'
	| 'updated'
	| 'deleted'
	| 'version_created'
	| 'tag_changed'
	| 'model_changed'
	| 'status_changed'
	| 'tested'
	| 'rollback';

export interface ActivityLog {
	id: string;
	promptId: string;
	promptName: string;
	action: ActivityAction;
	description: string;
	metadata: Record<string, unknown>;

	performedBy: string;
	performedByName: string;
	createdAt: Timestamp;
}

export interface PromptFormData {
	name: string;
	description: string;
	promptType: PromptType;
	contentJson: Record<string, unknown>;
	contentHtml: string;
	contentTemplate: string;
	model: string;
	tags: string[];
	variables: string[];
	contextUrls?: string[];
	status: PromptStatus;
	changeNote?: string;
}

export interface PromptFilters {
	search: string;
	promptType: PromptType | 'all';
	tags: string[];
	status: PromptStatus | 'all';
	model: string | 'all';
	sortBy: 'newest' | 'oldest' | 'name_asc' | 'name_desc';
}

export interface TestVariable {
	name: string;
	value: string;
}

export interface TemplateValidationResult {
	valid: boolean;
	missingVariables: string[];
	totalRequired: number;
	insertedCount: number;
}
