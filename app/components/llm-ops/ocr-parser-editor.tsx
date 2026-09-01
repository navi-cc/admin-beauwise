import React, { useCallback, useMemo, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger
} from '@/components/ui/tooltip';

import { VariableExtension } from '@/extensions/variable-extension';
import {
	VariableAutocompleteExtension,
	type VariableAutocompleteState
} from '@/extensions/variable-extension-autocomplete';
import { VariableAutocompleteMenu } from '@/components/llm-ops/variable-autocomplete-menu';
import { extractVariables } from '@/utils/template-utils';
import type { PromptTypeVariableSchema } from '@/types/llm-ops';

import Bold from '@/components/icons/bold';
import Italic from '@/components/icons/italic';
import List from '@/components/icons/list';
import ListOrdered from '@/components/icons/list-ordered';
import Heading2 from '@/components/icons/heading-2';
import Code from '@/components/icons/code';
import Undo from '@/components/icons/undo';
import Redo from '@/components/icons/redo';
import Type from '@/components/icons/type';
import Minus from '@/components/icons/minus';
import Variable from '../icons/variable';
import Check from '../icons/check';

interface OcrParserEditorProps {
	content?: Record<string, unknown>;
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

export function OcrParserEditor({
	content,
	onChange,
	placeholder = 'Write your OCR Parser prompt... Type {{ or /variable to insert rawOcrText.',
	editable = true
}: OcrParserEditorProps) {
	const [autocompleteState, setAutocompleteState] = useState<VariableAutocompleteState>({
		isOpen: false,
		query: '',
		range: { from: 0, to: 0 },
		items: [],
		selectedIndex: 0,
		position: { top: 0, left: 0 }
	});

	const handleStateChange = useCallback((newState: VariableAutocompleteState) => {
		setAutocompleteState(newState);
	}, []);

	console.log(content);

	const editor = useEditor({
		extensions: [
			StarterKit.configure({
				bulletList: false,
				orderedList: false,
				listItem: false,
				code: false,
				codeBlock: false,
				bold: false,
				heading: false
			}),
			Placeholder.configure({
				placeholder,
				emptyEditorClass:
					'before:content-[attr(data-placeholder)] before:text-muted-foreground/50 before:float-left before:h-0 before:pointer-events-none'
			}),
			VariableExtension,
			VariableAutocompleteExtension.configure({
				promptType: 'ocr_ingredient_parser',
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

	React.useEffect(() => {
		if (!editor) return;
		const ext = editor.extensionManager.extensions.find(
			(e) => e.name === 'variableAutocomplete'
		);
		if (ext) {
			ext.options.promptType = 'ocr_ingredient_parser';
			ext.options.insertedVariables = existingVariables;
			ext.options.onStateChange = handleStateChange;
		}
	}, [editor, existingVariables, handleStateChange]);

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

	const insertRawOcrText = useCallback(() => {
		if (!editor) return;
		editor
			.chain()
			.focus()
			.insertContent({
				type: 'variable',
				attrs: { name: 'rawOcrText' }
			})
			.insertContent(' ')
			.run();
	}, [editor]);

	if (!editor) return null;

	const isRawOcrTextInserted = existingVariables.includes('rawOcrText');

	return (
		<TooltipProvider delay={300}>
			<div className='rounded-lg border bg-background overflow-hidden transition-all focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-1 relative'>
				{/* Toolbar */}
				{editable && (
					<div className='flex items-center flex-wrap gap-0.5 px-2 py-1.5 border-b bg-muted/30'>
						{/* <ToolbarButton
							icon={Bold}
							label='Bold (Ctrl+B)'
							isActive={editor.isActive('bold')}
							onClick={() => editor.chain().focus().toggleBold().run()}
						/> */}
						{/* <ToolbarButton
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

						<ToolbarButton
							icon={Minus}
							label='Horizontal Rule'
							onClick={() => editor.chain().focus().setHorizontalRule().run()}
						/>

						<Separator orientation='vertical' className='h-5 mx-1' /> */}

						{/* Quick insert button for rawOcrText */}
						<Button
							type='button'
							variant='outline'
							size='sm'
							onClick={insertRawOcrText}
							className='h-8 text-xs gap-1.5 font-mono text-teal-700 hover:text-teal-800 hover:bg-teal-500/10 border-teal-500/30'
						>
							<Variable className='h-3.5 w-3.5 text-teal-600' />
							<span>{`{{rawOcrText}}`}</span>
							{isRawOcrTextInserted && <Check className='h-3 w-3 text-emerald-600' />}
						</Button>

						<div className='flex-1' />

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

				{/* Command Autocomplete Menu */}
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
								Required Variable:
							</span>
							<div className='flex items-center gap-1'>
								{isRawOcrTextInserted ? (
									<Badge className='bg-emerald-500/15 text-emerald-700 border-emerald-500/30 font-mono text-[10px]'>
										{`{{rawOcrText}}`} (Present)
									</Badge>
								) : (
									<Badge
										variant='outline'
										className='bg-amber-500/15 text-amber-700 border-amber-500/30 font-mono text-[10px]'
									>
										{`{{rawOcrText}}`} (Missing)
									</Badge>
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
