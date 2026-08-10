import Handlebars from 'handlebars';
import { PROMPT_TYPES } from '@/constants/llm-ops';
import type { PromptType, TemplateValidationResult } from '@/types/llm-ops';

export function extractVariables(content: Record<string, any> | string): string[] {
	const variables = new Set<string>();

	if (typeof content === 'string') {
		const matches = content.matchAll(/\{\{([a-zA-Z0-9_.]+)\}\}/g);
		for (const match of matches) {
			if (match[1]) {
				variables.add(match[1].trim());
			}
		}
		return Array.from(variables);
	}

	function walk(node: any) {
		if (node?.type === 'variable' && node?.attrs?.name) {
			variables.add(node.attrs.name.trim());
		}
		if (node?.content && Array.isArray(node.content)) {
			node.content.forEach(walk);
		}
	}

	walk(content);
	return Array.from(variables);
}

export function validatePromptVariables(
	insertedVariables: string[],
	promptType: PromptType
): TemplateValidationResult {
	const typeConfig = PROMPT_TYPES[promptType];
	if (!typeConfig) {
		return {
			valid: true,
			missingVariables: [],
			totalRequired: 0,
			insertedCount: insertedVariables.length
		};
	}

	const insertedSet = new Set(insertedVariables);
	const requiredVariables = typeConfig.variables.filter((v) => v.required);
	const missingVariables = requiredVariables
		.filter((v) => !insertedSet.has(v.name))
		.map((v) => v.name);

	return {
		valid: missingVariables.length === 0,
		missingVariables,
		totalRequired: requiredVariables.length,
		insertedCount: requiredVariables.length - missingVariables.length
	};
}

export function tiptapToTemplate(tiptapJson: Record<string, any>): string {
	if (!tiptapJson) return '';

	let result = '';

	function walk(node: any) {
		if (node.type === 'text') {
			result += node.text || '';
		} else if (node.type === 'variable') {
			result += `{{${node.attrs?.name || ''}}}`;
		} else if (node.type === 'paragraph' || node.type === 'heading') {
			if (node.content && Array.isArray(node.content)) {
				node.content.forEach(walk);
			}
			result += '\n\n';
		} else if (node.content && Array.isArray(node.content)) {
			node.content.forEach(walk);
		}
	}

	walk(tiptapJson);
	return result.trim().replace(/\n\n+/g, '\n\n');
}

function setNestedProperty(obj: Record<string, any>, path: string, value: any) {
	const parts = path.split('.');
	let current = obj;
	for (let i = 0; i < parts.length - 1; i++) {
		const part = parts[i];
		if (!current[part] || typeof current[part] !== 'object') {
			current[part] = {};
		}
		current = current[part];
	}
	current[parts[parts.length - 1]] = value;
}

export function compileTemplate(
	template: string,
	flatVariables: Record<string, any>
): string {
	try {
		const context: Record<string, any> = {};

		Object.entries(flatVariables).forEach(([key, value]) => {
			let processedValue = value;

			// Special auto-formatting for `ingredients`
			if (key === 'ingredients') {
				if (Array.isArray(value)) {
					processedValue = value.join(', ');
				} else if (typeof value === 'string' && value.startsWith('[')) {
					try {
						const parsed = JSON.parse(value);
						if (Array.isArray(parsed)) processedValue = parsed.join(', ');
					} catch {
						processedValue = value;
					}
				}
			}

			// Special limit enforcement for `context_url` (max 20 items)
			if (key === 'context_url') {
				if (Array.isArray(value)) {
					processedValue = value.slice(0, 20).join('\n');
				} else if (typeof value === 'string') {
					const links = value
						.split(/[\n,]/)
						.map((s) => s.trim())
						.filter(Boolean);
					processedValue = links.slice(0, 20).join('\n');
				}
			}

			// Format standard array strings to pretty strings
			if (Array.isArray(processedValue)) {
				processedValue = processedValue.join(', ');
			}

			// Set flat key for simple {{profiling.x.y}} references
			context[key] = processedValue;

			// Also expand nested object for standard object path traversal
			setNestedProperty(context, key, processedValue);
		});

		const compiled = Handlebars.compile(template, { strict: false });
		return compiled(context);
	} catch (error) {
		if (error instanceof Error) {
			return `[Template Error: ${error.message}]`;
		}
		return '[Template Compilation Error]';
	}
}

export function tiptapToHtml(editor: any): string {
	if (!editor) return '';
	return editor.getHTML();
}
