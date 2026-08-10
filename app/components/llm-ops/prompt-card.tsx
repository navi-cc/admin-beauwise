import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle
} from '@/components/ui/alert-dialog';

import {
	STATUS_CONFIG,
	GEMINI_MODELS,
	MODEL_ICONS,
	DEFAULT_TAGS,
	PROMPT_TYPES
} from '@/constants/llm-ops';

import { useDeletePrompt, useRestorePrompt } from '@/hooks/llm-ops/use-prompts';
import type { Prompt } from '@/types/llm-ops';
import { Timestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router';
import MoreHorizontal from '../icons/more-horizontal';
import Pencil from '../icons/penicl';
import Copy from '../icons/copy';
import Archive from '../icons/archive';
import Eye from '../icons/eye';
import Variable from '../icons/variable';
import Clock from '../icons/clock';
import Layers from '../icons/layers';
import Alert from '../icons/alert';
import RotateCcw from '../icons/rotate-ccw';

interface PromptCardProps {
	prompt: Prompt;
	onDuplicate?: (prompt: Prompt) => void;
}

function formatUpdatedAt(timestamp?: Timestamp): string {
	if (!timestamp || !timestamp.toDate) return 'Recently';
	const now = Date.now();
	const date = timestamp.toDate();
	const diffMs = now - date.getTime();
	const diffMin = Math.floor(diffMs / 60000);
	const diffHour = Math.floor(diffMin / 60);
	const diffDay = Math.floor(diffHour / 24);

	if (diffMin < 1) return 'Just now';
	if (diffMin < 60) return `${diffMin}m ago`;
	if (diffHour < 24) return `${diffHour}h ago`;
	if (diffDay < 7) return `${diffDay}d ago`;

	return date.toLocaleDateString('en-US', {
		month: 'short',
		day: 'numeric'
	});
}

export function PromptCard({ prompt, onDuplicate }: PromptCardProps) {
	const navigate = useNavigate();
	const deleteMutation = useDeletePrompt();
	const restoreMutation = useRestorePrompt();
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

	const [productionBlockedOpen, setProductionBlockedOpen] = useState(false);
	const isProduction = prompt.tags?.includes('production');
	const isArchived = prompt.status === 'archived';

	const statusConfig = STATUS_CONFIG[prompt.status] || STATUS_CONFIG.draft;
	const typeConfig = PROMPT_TYPES[prompt.promptType] || PROMPT_TYPES.ingredient_analysis;
	const modelName =
		GEMINI_MODELS.find((m) => m.id === prompt.model)?.name || prompt.model;
	const ModelIcon = MODEL_ICONS[prompt.model];

	const getTagColor = (tagValue: string): string => {
		const preset = DEFAULT_TAGS.find((t) => t.value === tagValue);
		return preset ? preset.color : 'bg-zinc-500/10 text-zinc-600 border-zinc-500/20';
	};

	const handleArchiveClick = (e: MouseEvent) => {
		e.stopPropagation();

		if (isProduction) {
			setProductionBlockedOpen(true);
		} else {
			setDeleteDialogOpen(true);
		}
	};
	const handleRestoreClick = (e: MouseEvent) => {
		e.stopPropagation();

		restoreMutation.mutate({
			id: prompt.id,
			promptName: prompt.name
		});
	};

	return (
		<>
			<Card
				onClick={() => navigate(`/llm-ops/detail/${prompt.id}`, { viewTransition: true })}
				className='group hover:shadow-md hover:border-primary/20 transition-all duration-200 cursor-pointer'
			>
				<CardHeader className='pb-2'>
					<div className='flex items-start justify-between gap-2'>
						<div className='flex-1 min-w-0 space-y-1.5'>
							<div className='flex items-center gap-2 flex-wrap'>
								<Badge
									variant='outline'
									className={`${typeConfig.badgeColor} text-[10px] gap-1 font-medium`}
								>
									<Layers className='h-2.5 w-2.5' />
									{typeConfig.label}
								</Badge>

								<Badge
									variant='outline'
									className={`${statusConfig.color} text-[10px] shrink-0 gap-1`}
								>
									<span className={`h-1.5 w-1.5 rounded-full ${statusConfig.dotColor}`} />
									{statusConfig.label}
								</Badge>
							</div>

							<h3 className='text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors'>
								{prompt.name}
							</h3>

							{prompt.description && (
								<p className='text-xs text-muted-foreground line-clamp-2 leading-relaxed'>
									{prompt.description}
								</p>
							)}
						</div>

						<DropdownMenu>
							<DropdownMenuTrigger
								render={
									<Button
										onClick={(e) => {
											e.stopPropagation();
										}}
										variant='ghost'
										size='sm'
										className='h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity'
									>
										<MoreHorizontal className='h-4 w-4' />
									</Button>
								}
							/>
							<DropdownMenuContent align='end' className='w-40'>
								<DropdownMenuItem
									onClick={() =>
										navigate(`/llm-ops/detail/${prompt.id}`, { viewTransition: true })
									}
									className='gap-2 text-xs'
								>
									<Eye className='h-3.5 w-3.5' />
									View Detail
								</DropdownMenuItem>
								<DropdownMenuItem
									onClick={() =>
										navigate(`/llm-ops/edit/${prompt.id}`, { viewTransition: true })
									}
									className='gap-2 text-xs'
								>
									<Pencil className='h-3.5 w-3.5' />
									Edit
								</DropdownMenuItem>

								<DropdownMenuSeparator />
								{isArchived ? (
									<DropdownMenuItem
										onClick={handleRestoreClick}
										disabled={restoreMutation.isPending}
										className='gap-2 text-xs text-emerald-600 focus:text-emerald-700 font-medium'
									>
										<RotateCcw className='h-3.5 w-3.5' />
										Restore Prompt
									</DropdownMenuItem>
								) : (
									<DropdownMenuItem
										onClick={handleArchiveClick}
										className='gap-2 text-xs text-destructive focus:text-destructive'
									>
										<Archive className='h-3.5 w-3.5' />
										Archive
									</DropdownMenuItem>
								)}
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				</CardHeader>

				<CardContent className='pb-2'>
					{/* Environment Tags */}
					{prompt.tags && prompt.tags.length > 0 && (
						<div className='flex flex-wrap gap-1 mb-2.5'>
							{prompt.tags.map((tag) => (
								<Badge
									key={tag}
									variant='outline'
									className={`${getTagColor(tag)} text-[10px] capitalize`}
								>
									{tag}
								</Badge>
							))}
						</div>
					)}

					{/* Variables count */}
					{prompt.variables && prompt.variables.length > 0 && (
						<div className='flex items-center gap-1 text-xs text-muted-foreground'>
							<Variable className='h-3 w-3 text-violet-500' />
							<span>
								{prompt.variables.length} variable
								{prompt.variables.length !== 1 ? 's' : ''} included
							</span>
						</div>
					)}
				</CardContent>

				<CardFooter className='pt-2 border-t'>
					<div className='flex items-center justify-between w-full text-xs text-muted-foreground'>
						{/* Model */}
						<div className='flex items-center gap-1.5'>
							{ModelIcon && <ModelIcon className='h-3 w-3' />}
							<span>{modelName}</span>
						</div>

						{/* Version and updated */}
						<div className='flex items-center gap-2'>
							<Badge variant='outline' className='text-[10px] font-mono h-4 px-1.5'>
								v{prompt.version}
							</Badge>
							<div className='flex items-center gap-1'>
								<Clock className='h-3 w-3' />
								<span>{formatUpdatedAt(prompt.updatedAt)}</span>
							</div>
						</div>
					</div>
				</CardFooter>
			</Card>

			{/* Delete confirmation dialog */}
			<AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Archive "{prompt.name}"?</AlertDialogTitle>
						<AlertDialogDescription>
							This will archive the prompt. It can be restored later at any time from the
							archived prompts view.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={() =>
								deleteMutation.mutate({
									id: prompt.id,
									promptName: prompt.name
								})
							}
							className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
						>
							{deleteMutation.isPending ? 'Archiving...' : 'Archive Prompt'}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			<AlertDialog open={productionBlockedOpen} onOpenChange={setProductionBlockedOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle className='flex items-center gap-2 text-destructive'>
							<Alert className='h-5 w-5' />
							Cannot Archive Production Prompt
						</AlertDialogTitle>
						<AlertDialogDescription className='space-y-2 text-xs leading-relaxed'>
							<p>
								<strong>"{prompt.name}"</strong> is currently tagged as{' '}
								<span className='font-semibold text-emerald-600'>Production</span> for{' '}
								<strong>{typeConfig.label}</strong>.
							</p>
							<p>
								To protect system operations, live Production prompts cannot be archived
								directly.
							</p>
							<p className='bg-muted p-2 rounded text-muted-foreground border'>
								<strong>Action Required:</strong> Either set another prompt of this type
								to Production (which will automatically demote this prompt).
							</p>
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel onClick={() => setProductionBlockedOpen(false)}>
							Got It
						</AlertDialogCancel>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
