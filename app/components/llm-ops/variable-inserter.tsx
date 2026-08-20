import React, { useCallback, useMemo, useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

import type { Editor } from '@tiptap/react';
import { PROMPT_TYPES } from '@/constants/llm-ops';
import type { PromptType, PromptTypeVariableSchema } from '@/types/llm-ops';
import AlertCircle from '../icons/alert-circle';
import Check from '../icons/check';
import Variable from '../icons/variable';

interface VariableInserterProps {
	editor: Editor | null;
	existingVariables: string[];
	promptType: PromptType;
}

export function VariableInserter({
	editor,
	existingVariables,
	promptType
}: VariableInserterProps) {
	const [open, setOpen] = useState(false);

	const typeConfig = useMemo(
		() => PROMPT_TYPES[promptType] || PROMPT_TYPES.ingredient_analysis,
		[promptType]
	);

	const insertedSet = useMemo(() => new Set(existingVariables), [existingVariables]);

	const categories = useMemo(() => {
		const map = new Map<string, PromptTypeVariableSchema[]>();
		typeConfig.variables.forEach((v) => {
			const list = map.get(v.category) || [];
			list.push(v);
			map.set(v.category, list);
		});
		return Array.from(map.entries());
	}, [typeConfig]);

	const totalRequired = useMemo(
		() => typeConfig.variables.filter((v) => v.required).length,
		[typeConfig]
	);

	const insertedRequiredCount = useMemo(
		() =>
			typeConfig.variables.filter((v) => v.required && insertedSet.has(v.name)).length,
		[typeConfig, insertedSet]
	);

	const insertVariable = useCallback(
		(name: string) => {
			if (!editor) return;

			editor
				.chain()
				.focus()
				.insertContent({
					type: 'variable',
					attrs: { name: name.trim() }
				})
				.insertContent(' ') // Add trailing space
				.run();
		},
		[editor]
	);

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger
				render={
					<Button
						variant='ghost'
						size='sm'
						className='gap-1.5 text-xs h-8 px-2.5 text-violet-700 hover:text-violet-800 hover:bg-violet-500/10'
						title='Insert runtime variable'
					>
						<Variable className='h-3.5 w-3.5' />
						<span className='hidden sm:inline'>Insert Variable</span>
						<Badge
							variant='outline'
							className={`text-[10px] h-4 px-1 font-mono ${
								insertedRequiredCount === totalRequired
									? 'bg-emerald-500/15 text-emerald-700 border-emerald-500/30'
									: 'bg-amber-500/15 text-amber-700 border-amber-500/30'
							}`}
						>
							{insertedRequiredCount}/{totalRequired}
						</Badge>
					</Button>
				}
			/>

			<PopoverContent className='w-96 p-0' align='start' side='bottom' sideOffset={8}>
				<div className='px-4 py-3 border-b flex items-center justify-between'>
					<div>
						<h4 className='text-sm font-semibold text-foreground'>
							{typeConfig.label} Variables
						</h4>
						<p className='text-xs text-muted-foreground mt-0.5'>
							Click a variable to insert it into your prompt
						</p>
					</div>
					<Badge
						variant='outline'
						className='text-xs font-mono shrink-0 bg-violet-500/10 text-violet-700 border-violet-500/20'
					>
						{insertedRequiredCount}/{totalRequired} Required
					</Badge>
				</div>

				<div className='max-h-[360px] overflow-y-auto overflow-hidden p-4'>
					<div className='space-y-4'>
						{categories.map(([categoryName, vars]) => (
							<div key={categoryName} className='space-y-1.5'>
								<h5 className='text-[11px] font-semibold text-muted-foreground uppercase tracking-wider'>
									{categoryName}
								</h5>
								<div className='space-y-1'>
									{vars.map((v) => {
										const isInserted = insertedSet.has(v.name);
										return (
											<button
												key={v.name}
												type='button'
												onClick={() => insertVariable(v.name)}
												className={`w-full flex items-center justify-between p-2 rounded-md text-left transition-colors border text-xs ${
													isInserted
														? 'bg-emerald-500/5 border-emerald-500/20 hover:bg-emerald-500/10'
														: 'bg-background border-border hover:bg-muted/60'
												}`}
											>
												<div className='flex flex-col min-w-0 pr-2'>
													<span className='font-mono text-violet-700 dark:text-violet-400 font-medium truncate'>
														{`{{${v.name}}}`}
													</span>
													<span className='text-[10px] text-muted-foreground truncate'>
														{v.label} · {v.description}
													</span>
												</div>

												<div className='flex items-center gap-1.5 shrink-0'>
													{v.type !== 'string' && (
														<Badge
															variant='outline'
															className='text-[9px] h-4 px-1 font-mono uppercase bg-muted'
														>
															{v.type}
														</Badge>
													)}
													{isInserted ? (
														<span className='flex items-center text-[10px] text-emerald-600 font-medium gap-0.5'>
															<Check className='h-3 w-3' />
														</span>
													) : (
														<span className='flex items-center text-[10px] text-amber-600 font-medium gap-0.5'>
															<AlertCircle className='h-3 w-3' />
														</span>
													)}
												</div>
											</button>
										);
									})}
								</div>
							</div>
						))}
					</div>
				</div>
			</PopoverContent>
		</Popover>
	);
}
