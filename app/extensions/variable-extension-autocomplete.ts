import { Extension, type Dispatch } from '@tiptap/core';
import { Plugin, PluginKey, Transaction } from '@tiptap/pm/state';
import { PROMPT_TYPES } from '@/constants/llm-ops';
import type { PromptType, PromptTypeVariableSchema } from '@/types/llm-ops';

export interface VariableAutocompleteState {
	isOpen: boolean;
	query: string;
	range: { from: number; to: number };
	items: PromptTypeVariableSchema[];
	selectedIndex: number;
	position: { top: number; left: number };
}

export interface VariableAutocompleteOptions {
	promptType: PromptType;
	insertedVariables: string[];
	onStateChange: (state: VariableAutocompleteState) => void;
}

export const VariableAutocompletePluginKey = new PluginKey('variableAutocomplete');

export const VariableAutocompleteExtension =
	Extension.create<VariableAutocompleteOptions>({
		name: 'variableAutocomplete',

		addOptions() {
			return {
				promptType: 'ingredient_analysis',
				insertedVariables: [],
				onStateChange: () => {}
			};
		},

		addProseMirrorPlugins() {
			const extension = this;

			return [
				new Plugin({
					key: VariableAutocompletePluginKey,

					state: {
						init() {
							return {
								isOpen: false,
								query: '',
								range: { from: 0, to: 0 },
								items: [],
								selectedIndex: 0,
								position: { top: 0, left: 0 }
							};
						},
						apply(tr, prev) {
							const meta = tr.getMeta(VariableAutocompletePluginKey);
							if (meta) {
								return { ...prev, ...meta };
							}
							return prev;
						}
					},

					props: {
						handleKeyDown(view, event) {
							const pluginState = VariableAutocompletePluginKey.getState(
								view.state
							) as VariableAutocompleteState;

							if (!pluginState || !pluginState.isOpen) return false;

							if (event.key === 'ArrowDown') {
								event.preventDefault();
								const nextIndex =
									(pluginState.selectedIndex + 1) % pluginState.items.length;
								const nextState = { ...pluginState, selectedIndex: nextIndex };
								view.dispatch(
									view.state.tr.setMeta(VariableAutocompletePluginKey, nextState)
								);
								extension.options.onStateChange(nextState);
								return true;
							}

							if (event.key === 'ArrowUp') {
								event.preventDefault();
								const nextIndex =
									(pluginState.selectedIndex - 1 + pluginState.items.length) %
									pluginState.items.length;
								const nextState = { ...pluginState, selectedIndex: nextIndex };
								view.dispatch(
									view.state.tr.setMeta(VariableAutocompletePluginKey, nextState)
								);
								extension.options.onStateChange(nextState);
								return true;
							}

							if (event.key === 'Enter' || event.key === 'Tab') {
								event.preventDefault();
								const selectedItem = pluginState.items[pluginState.selectedIndex];
								if (selectedItem) {
									const tr = view.state.tr;
									const node = view.state.schema.nodes.variable.create({
										name: selectedItem.name
									});

									tr.replaceWith(pluginState.range.from, pluginState.range.to, node);
									tr.insertText(' ', pluginState.range.from + 1);

									const closedState: VariableAutocompleteState = {
										...pluginState,
										isOpen: false
									};
									tr.setMeta(VariableAutocompletePluginKey, closedState);
									view.dispatch(tr);
									extension.options.onStateChange(closedState);
								}
								return true;
							}

							if (event.key === 'Escape') {
								event.preventDefault();
								const closedState: VariableAutocompleteState = {
									...pluginState,
									isOpen: false
								};
								view.dispatch(
									view.state.tr.setMeta(VariableAutocompletePluginKey, closedState)
								);
								extension.options.onStateChange(closedState);
								return true;
							}

							return false;
						}
					},

					view() {
						return {
							update(view) {
								const { selection } = view.state;
								if (!selection.empty) {
									return;
								}

								const pos = selection.from;
								const textBefore = view.state.doc.textBetween(
									Math.max(0, pos - 40),
									pos,
									'\n',
									'\n'
								);

								// Match pattern 1: {{query
								const braceMatch = textBefore.match(/\{\{([a-zA-Z0-9_.]*)$/);
								// Match pattern 2: /variable query or /var query or /query
								const slashMatch = textBefore.match(
									/(?:\/variable|\/var|\/)([a-zA-Z0-9_.]*)$/
								);

								const match = braceMatch || slashMatch;

								if (!match) {
									const pluginState = VariableAutocompletePluginKey.getState(
										view.state
									) as VariableAutocompleteState;
									if (pluginState && pluginState.isOpen) {
										const closedState = { ...pluginState, isOpen: false };
										view.dispatch(
											view.state.tr.setMeta(VariableAutocompletePluginKey, closedState)
										);
										extension.options.onStateChange(closedState);
									}
									return;
								}

								const matchedText = match[0];
								const query = match[1] || '';
								const from = pos - matchedText.length;
								const to = pos;

								// Dynamically lookup variables for the current active promptType
								const activeType = extension.options.promptType || 'ingredient_analysis';

								const typeConfig =
									PROMPT_TYPES[activeType] || PROMPT_TYPES.ingredient_analysis;
								const insertedSet = new Set(extension.options.insertedVariables || []);

								const lowerQuery = query.toLowerCase();

								const filtered = typeConfig.variables.filter((v) => {
									if (!lowerQuery) return true;
									return (
										v.name.toLowerCase().includes(lowerQuery) ||
										v.label.toLowerCase().includes(lowerQuery) ||
										v.category.toLowerCase().includes(lowerQuery)
									);
								});

								filtered.sort((a, b) => {
									const aInserted = insertedSet.has(a.name) ? 1 : 0;
									const bInserted = insertedSet.has(b.name) ? 1 : 0;
									return aInserted - bInserted;
								});

								const coords = view.coordsAtPos(from);
								const position = {
									top: coords.bottom + 4,
									left: Math.max(16, coords.left)
								};

								const newState: VariableAutocompleteState = {
									isOpen: true,
									query,
									range: { from, to },
									items: filtered,
									selectedIndex: 0,
									position
								};

								// Update ProseMirror state and React listener
								const pluginState = VariableAutocompletePluginKey.getState(
									view.state
								) as VariableAutocompleteState;

								if (
									!pluginState ||
									pluginState.isOpen !== newState.isOpen ||
									pluginState.query !== newState.query ||
									pluginState.position.top !== newState.position.top ||
									pluginState.position.left !== newState.position.left ||
									pluginState.items.length !== newState.items.length
								) {
									view.dispatch(
										view.state.tr.setMeta(VariableAutocompletePluginKey, newState)
									);
									extension.options.onStateChange(newState);
								}
							}
						};
					}
				})
			];
		}
	});
