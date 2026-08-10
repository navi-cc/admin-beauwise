import { Node, mergeAttributes, nodeInputRule, nodePasteRule } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import VariableChip from './VariableChip';

export interface VariableOptions {
	HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
	interface Commands<ReturnType> {
		variable: {
			insertVariable: (options: { name: string; label?: string }) => ReturnType;
		};
	}
}

// Regex to match {{variableName}} or {{profiling.path.field}} with trailing space for input
const inputRegex = /(?:^|\s)\{\{([a-zA-Z0-9_.]+)\}\}\s$/;
const pasteRegex = /(?:^|\s)\{\{([a-zA-Z0-9_.]+)\}\}/g;

export const VariableExtension = Node.create<VariableOptions>({
	name: 'variable',
	group: 'inline',
	inline: true,
	atom: true,
	selectable: true,

	addOptions() {
		return {
			HTMLAttributes: {
				class: 'variable-chip'
			}
		};
	},

	addAttributes() {
		return {
			name: {
				default: null,
				parseHTML: (element: HTMLElement) => element.getAttribute('data-variable-name'),
				renderHTML: (attributes) => {
					if (!attributes.name) return {};
					return {
						'data-variable-name': attributes.name
					};
				}
			},
			label: {
				default: null
			}
		};
	},

	parseHTML() {
		return [
			{
				tag: 'span[data-type="variable"]'
			}
		];
	},

	renderHTML({ HTMLAttributes, node }) {
		return [
			'span',
			mergeAttributes(
				{ 'data-type': 'variable' },
				this.options.HTMLAttributes,
				HTMLAttributes
			),
			`{{${node.attrs.name}}}`
		];
	},

	renderText({ node }) {
		return `{{${node.attrs.name}}}`;
	},

	addCommands() {
		return {
			insertVariable:
				({ name, label }) =>
				({ chain }) => {
					return chain()
						.insertContent({
							type: this.name,
							attrs: { name, label }
						})
						.run();
				}
		};
	},

	addInputRules() {
		return [
			nodeInputRule({
				find: inputRegex,
				type: this.type,
				getAttributes: (match) => {
					return {
						name: match[1]
					};
				}
			})
		];
	},

	addPasteRules() {
		return [
			nodePasteRule({
				find: pasteRegex,
				type: this.type,
				getAttributes: (match) => {
					return {
						name: match[1]
					};
				}
			})
		];
	},

	addNodeView() {
		return ReactNodeViewRenderer(VariableChip);
	}
});
