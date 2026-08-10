import React, { useEffect, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

import type { PromptTypeVariableSchema } from '@/types/llm-ops';
import Variable from '../icons/variable';
import Check from '../icons/check';
import Alert from '../icons/alert';

export interface VariableAutocompleteMenuProps {
	items: PromptTypeVariableSchema[];
	selectedIndex: number;
	insertedVariables: string[];
	onSelect: (item: PromptTypeVariableSchema) => void;
	onHoverIndex: (index: number) => void;
	position: { top: number; left: number };
}

export function VariableAutocompleteMenu({
	items,
	selectedIndex,
	insertedVariables,
	onSelect,
	onHoverIndex,
	position
}: VariableAutocompleteMenuProps) {
	const insertedSet = new Set(insertedVariables);
	const scrollRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!scrollRef.current) return;
		const selectedEl = scrollRef.current.querySelector(`[data-index="${selectedIndex}"]`);
		if (selectedEl) {
			selectedEl.scrollIntoView({ block: 'nearest' });
		}
	}, [selectedIndex]);

	if (items.length === 0) {
		return (
			<div
				style={{
					position: 'fixed',
					top: `${position.top}px`,
					left: `${position.left}px`,
					zIndex: 9999
				}}
				className='w-72 rounded-lg border bg-popover text-popover-foreground shadow-xl p-3 text-xs text-muted-foreground font-mono'
			>
				No matching variables found
			</div>
		);
	}

	return (
		<div
			style={{
				position: 'fixed',
				top: `${position.top}px`,
				left: `${position.left}px`,
				zIndex: 9999
			}}
			className='w-80 rounded-lg border bg-popover text-popover-foreground shadow-2xl overflow-hidden font-sans animate-in fade-in-50 zoom-in-95 duration-100'
		>
			{/* Header */}
			<div className='px-3 py-2 border-b bg-muted/40 flex items-center justify-between'>
				<div className='flex items-center gap-1.5 text-xs font-semibold text-foreground'>
					<Variable className='h-3.5 w-3.5 text-violet-600' />
					<span>Insert Variable</span>
				</div>
				<span className='text-[10px] text-muted-foreground font-mono'>
					↑↓ Navigate · ↵ Select · Esc Close
				</span>
			</div>

			{/* Suggestion Items */}
			<ScrollArea ref={scrollRef} className='max-h-60 p-1.5'>
				<div className='space-y-0.5'>
					{items.map((item, index) => {
						const isInserted = insertedSet.has(item.name);
						const isSelected = index === selectedIndex;

						return (
							<div
								key={item.name}
								data-index={index}
								onClick={() => onSelect(item)}
								onMouseEnter={() => onHoverIndex(index)}
								className={`flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors text-xs select-none ${
									isSelected
										? 'bg-accent text-accent-foreground font-medium'
										: 'hover:bg-muted/60 text-foreground'
								}`}
							>
								<div className='flex flex-col min-w-0 pr-2'>
									<span className='font-mono text-violet-700 dark:text-violet-400 font-semibold truncate'>
										{`{{${item.name}}}`}
									</span>
									<span className='text-[10px] text-muted-foreground truncate'>
										{item.label} · {item.category}
									</span>
								</div>

								<div className='flex items-center gap-1 shrink-0'>
									{isInserted ? (
										<Badge
											variant='outline'
											className='text-[9px] h-4 px-1 bg-emerald-500/10 text-emerald-600 border-emerald-500/20 gap-0.5'
										>
											<Check className='h-2.5 w-2.5' /> Present
										</Badge>
									) : (
										<Badge
											variant='outline'
											className='text-[9px] h-4 px-1 bg-amber-500/10 text-amber-600 border-amber-500/20 gap-0.5'
										>
											<Alert className='h-2.5 w-2.5' /> Required
										</Badge>
									)}
								</div>
							</div>
						);
					})}
				</div>
			</ScrollArea>
		</div>
	);
}
