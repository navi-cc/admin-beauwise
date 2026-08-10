import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
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

import { DEFAULT_TAGS, PROMPT_TYPES } from '@/constants/llm-ops';
import type { PromptType, PromptStatus } from '@/types/llm-ops';

import Alert from '../icons/alert';
import Tag from '../icons/tag';
import Check from '../icons/check';

interface TagManagerProps {
	selectedTags: string[];
	onChange: (tags: string[]) => void;
	onStatusChange?: (status: PromptStatus) => void;
	promptType?: PromptType;
}

/**
 * Restricted Tag Manager for setting environment tags (Development or Production).
 * Enforces mutual exclusivity and triggers a confirmation AlertDialog when Production is chosen.
 * Selecting Production automatically forces status to Active.
 */
export function TagManager({
	selectedTags,
	onChange,
	onStatusChange,
	promptType
}: TagManagerProps) {
	const [confirmProductionOpen, setConfirmProductionOpen] = useState(false);

	const isProduction = selectedTags.includes('production');
	const isDevelopment = selectedTags.includes('development') || selectedTags.length === 0;

	const promptTypeLabel = promptType
		? PROMPT_TYPES[promptType]?.label || promptType
		: 'this type';

	const handleSelectTag = (tagValue: 'development' | 'production') => {
		if (tagValue === 'production' && !isProduction) {
			setConfirmProductionOpen(true);
		} else if (tagValue === 'development') {
			onChange(['development']);
		}
	};

	const confirmProduction = () => {
		onChange(['production']);
		if (onStatusChange) {
			onStatusChange('active');
		}
		setConfirmProductionOpen(false);
	};

	return (
		<div className='space-y-2'>
			<Label className='text-sm font-medium flex items-center gap-1.5'>
				<Tag className='h-3.5 w-3.5 text-muted-foreground' />
				Environment Tag
			</Label>

			{/* Dev / Prod Toggle Buttons */}
			<div className='grid grid-cols-2 gap-2'>
				{DEFAULT_TAGS.map((tag) => {
					const isSelected = tag.value === 'production' ? isProduction : isDevelopment;

					return (
						<button
							key={tag.value}
							type='button'
							onClick={() => handleSelectTag(tag.value as 'development' | 'production')}
							className={`flex items-center justify-between p-2.5 rounded-lg border text-xs font-medium transition-all ${
								isSelected
									? tag.color + ' ring-1 ring-offset-1'
									: 'bg-background border-border text-muted-foreground hover:bg-muted'
							}`}
						>
							<div className='flex items-center gap-1.5'>
								<span className='capitalize'>{tag.label}</span>
							</div>
							{isSelected && <Check className='h-3.5 w-3.5 shrink-0' />}
						</button>
					);
				})}
			</div>

			<p className='text-[11px] text-muted-foreground pl-0.5'>
				{isProduction ? (
					<span className='text-emerald-700 dark:text-emerald-400 font-medium'>
						Active in Production. Selecting Production locks status to Active and
						automatically demotes any previous Production prompt to Development & Draft.
					</span>
				) : (
					<span>Development tag. Safe for testing and internal drafts.</span>
				)}
			</p>

			{/* Confirmation Dialog when switching to Production */}
			<AlertDialog open={confirmProductionOpen} onOpenChange={setConfirmProductionOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle className='flex items-center gap-2'>
							<Alert className='h-5 w-5 text-amber-600' />
							Tag as Production Prompt?
						</AlertDialogTitle>
						<AlertDialogDescription className='space-y-2 text-sm'>
							<p>
								You are about to set this prompt to{' '}
								<strong className='text-emerald-600 font-semibold'>Production</strong> for{' '}
								<strong>{promptTypeLabel}</strong>.
							</p>
							<p>
								<strong>Automatic Demotion & Transfer:</strong> Saving this prompt as
								Production will automatically force its status to <strong>Active</strong>,
								and demote any existing Production prompt of this type to{' '}
								<strong>Development</strong> & <strong>Draft</strong> status.
							</p>
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={confirmProduction}
							className='bg-emerald-600 hover:bg-emerald-700 text-white'
						>
							Confirm Production Tag
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
