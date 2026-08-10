import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useEditor, EditorContent, extensions } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger
} from '@/components/ui/tooltip';
// import {
// 	Bold,
// 	Italic,
// 	List,
// 	ListOrdered,
// 	Heading2,
// 	Code,
// 	Undo,
// 	Redo,
// 	Type,
// 	Minus
// } from 'lucide-react';

import { VariableExtension } from '@/extensions/variable-extension';
import { VariableInserter } from '@/components/llm-ops/variable-inserter';
import {
	VariableAutocompleteExtension,
	type VariableAutocompleteState
} from '@/extensions/variable-extension-autocomplete';
import { VariableAutocompleteMenu } from './variable-autocomplete-menu';
import { extractVariables } from '@/utils/template-utils';
import type { PromptType, PromptTypeVariableSchema } from '@/types/llm-ops';
import Bold from '../icons/bold';
import Italic from '../icons/italic';
import List from '../icons/list';
import ListOrdered from '../icons/list-ordered';
import Heading2 from '../icons/heading-2';
import Code from '../icons/code';
import Undo from '../icons/undo';
import Redo from '../icons/redo';
import Type from '../icons/type';
import Minus from '../icons/minus';

interface PromptEditorProps {
	content?: Record<string, unknown>;
	promptType?: PromptType;
	onChange?: (data: {
		json: Record<string, unknown>;
		html: string;
		variables: string[];
	}) => void;
	placeholder?: string;
	editable?: boolean;
}

interface ToolbarButtonProps {
	icon: React.ElementType;
	label: string;
	isActive?: boolean;
	onClick: () => void;
	disabled?: boolean;
}

function ToolbarButton({
	icon: Icon,
	label,
	isActive = false,
	onClick,
	disabled = false
}: ToolbarButtonProps) {
	return (
		<Tooltip>
			<TooltipTrigger
				render={
					<Button
						type='button'
						variant='ghost'
						size='sm'
						className={`h-8 w-8 p-0 ${
							isActive
								? 'bg-accent text-accent-foreground'
								: 'text-muted-foreground hover:text-foreground'
						}`}
						onClick={onClick}
						disabled={disabled}
					>
						<Icon className='h-4 w-4' />
					</Button>
				}
			/>
			<TooltipContent side='bottom' className='text-xs'>
				{label}
			</TooltipContent>
		</Tooltip>
	);
}

export function PromptEditor({
	content,
	promptType = 'ingredient_analysis',
	onChange,
	placeholder = 'Write your prompt template... Type {{ or /variable to trigger the variable autocomplete menu.',
	editable = true
}: PromptEditorProps) {
	const [autocompleteState, setAutocompleteState] = useState<VariableAutocompleteState>({
		isOpen: false,
		query: '',
		range: { from: 0, to: 0 },
		items: [],
		selectedIndex: 0,
		position: { top: 0, left: 0 }
	});

	const handleStateChange = useCallback(
		(newState: VariableAutocompleteState) => {
			setAutocompleteState(newState);
		},
		[promptType]
	);

	const editor = useEditor({
		extensions: [
			StarterKit.configure({
				heading: { levels: [2, 3] }
			}),
			Placeholder.configure({
				placeholder,
				emptyEditorClass:
					'before:content-[attr(data-placeholder)] before:text-muted-foreground/50 before:float-left before:h-0 before:pointer-events-none'
			}),
			VariableExtension,
			VariableAutocompleteExtension.configure({
				promptType,
				insertedVariables: [],
				onStateChange: handleStateChange
			})
		],
		content: content || undefined,
		editable,
		editorProps: {
			attributes: {
				class:
					'prose prose-sm dark:prose-invert max-w-none min-h-[220px] px-4 py-3 focus:outline-none'
			}
		},
		onUpdate: ({ editor }) => {
			const json = editor.getJSON() as Record<string, unknown>;
			const html = editor.getHTML();
			const variables = extractVariables(json);
			onChange?.({ json, html, variables });
		}
	});

	const existingVariables = useMemo(() => {
		if (!editor) return [];
		return extractVariables(editor.getJSON() as Record<string, unknown>);
	}, [editor?.state.doc]);

	useEffect(() => {
		if (!editor) return;
		const ext = editor.extensionManager.extensions.find(
			(e) => e.name === 'variableAutocomplete'
		);
	}, [editor, promptType, existingVariables, handleStateChange]);

	const handleSelectAutocompleteItem = useCallback(
		(item: PromptTypeVariableSchema) => {
			if (!editor || !autocompleteState.isOpen) return;

			editor
				.chain()
				.focus()
				.deleteRange(autocompleteState.range)
				.insertContent({
					type: 'variable',
					attrs: { name: item.name }
				})
				.insertContent(' ')
				.run();

			setAutocompleteState((prev) => ({ ...prev, isOpen: false }));
		},
		[editor, autocompleteState]
	);

	const handleHoverAutocompleteIndex = useCallback((index: number) => {
		setAutocompleteState((prev) => ({ ...prev, selectedIndex: index }));
	}, []);

	if (!editor) return null;

	return (
		<TooltipProvider delay={300}>
			<div className='rounded-lg border bg-background overflow-hidden transition-all focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-1 relative'>
				{editable && (
					<div className='flex items-center flex-wrap gap-0.5 px-2 py-1.5 border-b bg-muted/30'>
						{/* Text formatting */}
						<ToolbarButton
							icon={Bold}
							label='Bold (Ctrl+B)'
							isActive={editor.isActive('bold')}
							onClick={() => editor.chain().focus().toggleBold().run()}
						/>
						<ToolbarButton
							icon={Italic}
							label='Italic (Ctrl+I)'
							isActive={editor.isActive('italic')}
							onClick={() => editor.chain().focus().toggleItalic().run()}
						/>
						<ToolbarButton
							icon={Code}
							label='Inline Code'
							isActive={editor.isActive('code')}
							onClick={() => editor.chain().focus().toggleCode().run()}
						/>

						<Separator orientation='vertical' className='h-5 mx-1' />

						{/* Headings */}
						<ToolbarButton
							icon={Heading2}
							label='Heading 2'
							isActive={editor.isActive('heading', { level: 2 })}
							onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
						/>
						<ToolbarButton
							icon={Type}
							label='Heading 3'
							isActive={editor.isActive('heading', { level: 3 })}
							onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
						/>

						<Separator orientation='vertical' className='h-5 mx-1' />

						{/* Lists */}
						<ToolbarButton
							icon={List}
							label='Bullet List'
							isActive={editor.isActive('bulletList')}
							onClick={() => editor.chain().focus().toggleBulletList().run()}
						/>
						<ToolbarButton
							icon={ListOrdered}
							label='Ordered List'
							isActive={editor.isActive('orderedList')}
							onClick={() => editor.chain().focus().toggleOrderedList().run()}
						/>

						<Separator orientation='vertical' className='h-5 mx-1' />

						{/* Horizontal rule */}
						<ToolbarButton
							icon={Minus}
							label='Horizontal Rule'
							onClick={() => editor.chain().focus().setHorizontalRule().run()}
						/>

						<Separator orientation='vertical' className='h-5 mx-1' />

						{/* Variable insertion popover */}
						<VariableInserter
							editor={editor}
							existingVariables={existingVariables}
							promptType={promptType}
						/>

						{/* Spacer */}
						<div className='flex-1' />

						{/* Undo/Redo */}
						<ToolbarButton
							icon={Undo}
							label='Undo (Ctrl+Z)'
							onClick={() => editor.chain().focus().undo().run()}
							disabled={!editor.can().undo()}
						/>
						<ToolbarButton
							icon={Redo}
							label='Redo (Ctrl+Shift+Z)'
							onClick={() => editor.chain().focus().redo().run()}
							disabled={!editor.can().redo()}
						/>
					</div>
				)}

				{/* Editor content */}
				<EditorContent editor={editor} />

				{/* Floating Command Autocomplete Menu */}
				{editable && autocompleteState.isOpen && (
					<VariableAutocompleteMenu
						items={autocompleteState.items}
						selectedIndex={autocompleteState.selectedIndex}
						insertedVariables={existingVariables}
						onSelect={handleSelectAutocompleteItem}
						onHoverIndex={handleHoverAutocompleteIndex}
						position={autocompleteState.position}
					/>
				)}

				{/* Footer info */}
				{editable && (
					<div className='flex items-center justify-between px-4 py-2 border-t bg-muted/20 text-[10px] text-muted-foreground'>
						<div className='flex items-center gap-2'>
							<span className='uppercase tracking-wider font-semibold'>
								Variables ({existingVariables.length}):
							</span>
							<div className='flex flex-wrap gap-1'>
								{existingVariables.length > 0 ? (
									existingVariables.map((v) => (
										<span
											key={v}
											className='inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono bg-violet-500/10 text-violet-700 border border-violet-500/20'
										>
											{`{{${v}}}`}
										</span>
									))
								) : (
									<span className='italic'>None inserted yet</span>
								)}
							</div>
						</div>
						<span className='hidden sm:inline font-mono'>
							Type{' '}
							<code className='px-1 bg-muted rounded font-semibold text-foreground'>
								{'{{'}
							</code>{' '}
							or{' '}
							<code className='px-1 bg-muted rounded font-semibold text-foreground'>
								/variable
							</code>{' '}
							for autocomplete
						</span>
					</div>
				)}
			</div>
		</TooltipProvider>
	);
}
