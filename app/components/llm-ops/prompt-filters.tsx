import React from 'react';
import { Input } from '@/components/ui/input';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

import {
	GEMINI_MODELS,
	DEFAULT_TAGS,
	STATUS_CONFIG,
	PROMPT_TYPES
} from '@/constants/llm-ops';
import type { PromptFilters, PromptType } from '@/types/llm-ops';
import Search from '../icons/search';
import X from '../icons/x';
import SlidersHorizontal from '../icons/sliders-horizontal';

interface PromptFiltersBarProps {
	filters: PromptFilters;
	onChange: (filters: PromptFilters) => void;
}

/**
 * Filter bar for the prompt list page with search, prompt type, status,
 * model, environment tag filters, and sort options.
 */
export function PromptFiltersBar({ filters, onChange }: PromptFiltersBarProps) {
	const hasActiveFilters =
		filters.search ||
		filters.promptType !== 'all' ||
		filters.tags.length > 0 ||
		filters.status !== 'all' ||
		filters.model !== 'all';

	const updateFilter = <K extends keyof PromptFilters>(
		key: K,
		value: PromptFilters[K]
	) => {
		onChange({ ...filters, [key]: value });
	};

	const toggleTag = (tag: string) => {
		const newTags = filters.tags.includes(tag)
			? filters.tags.filter((t) => t !== tag)
			: [...filters.tags, tag];
		updateFilter('tags', newTags);
	};

	const clearFilters = () => {
		onChange({
			search: '',
			promptType: 'all',
			tags: [],
			status: 'all',
			model: 'all',
			sortBy: 'newest'
		});
	};

	return (
		<div className='space-y-3'>
			{/* Top row: search + sort */}
			<div className='flex items-center gap-3'>
				{/* Search */}
				<div className='relative flex-1'>
					<Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
					<Input
						value={filters.search}
						onChange={(e) => updateFilter('search', e.target.value)}
						placeholder='Search prompts by name or description...'
						className='pl-9 h-9'
					/>
					{filters.search && (
						<button
							type='button'
							onClick={() => updateFilter('search', '')}
							className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground'
						>
							<X className='h-3.5 w-3.5' />
						</button>
					)}
				</div>

				{/* Sort */}
				<Select
					value={filters.sortBy}
					onValueChange={(v) => updateFilter('sortBy', v as PromptFilters['sortBy'])}
				>
					<SelectTrigger className='w-40 h-9 text-xs'>
						<SelectValue placeholder='Sort by' />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value='newest'>Newest First</SelectItem>
						<SelectItem value='oldest'>Oldest First</SelectItem>
						<SelectItem value='name_asc'>Name A–Z</SelectItem>
						<SelectItem value='name_desc'>Name Z–A</SelectItem>
					</SelectContent>
				</Select>
			</div>

			{/* Filter row */}
			<div className='flex items-center gap-3 flex-wrap'>
				<div className='flex items-center gap-1.5 text-xs text-muted-foreground'>
					<SlidersHorizontal className='h-3.5 w-3.5' />
					<span>Filters:</span>
				</div>

				{/* Prompt Type Filter */}
				<Select
					value={filters.promptType || 'all'}
					onValueChange={(v) =>
						updateFilter('promptType', v as PromptFilters['promptType'])
					}
				>
					<SelectTrigger className='w-44 h-7 text-xs font-medium'>
						<SelectValue placeholder='All Prompt Types' />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value='all'>All Prompt Types</SelectItem>
						{Object.values(PROMPT_TYPES).map((type) => (
							<SelectItem key={type.id} value={type.id}>
								{type.label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>

				{/* Status filter */}
				<Select
					value={filters.status}
					onValueChange={(v) => updateFilter('status', v as PromptFilters['status'])}
				>
					<SelectTrigger className='w-28 h-7 text-xs'>
						<SelectValue placeholder='Status' />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value='all'>All Status</SelectItem>
						{Object.entries(STATUS_CONFIG).map(([key, config]) => (
							<SelectItem key={key} value={key}>
								{config.label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>

				{/* Model filter */}
				<Select value={filters.model} onValueChange={(v) => updateFilter('model', v)}>
					<SelectTrigger className='w-36 h-7 text-xs'>
						<SelectValue placeholder='Model' />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value='all'>All Models</SelectItem>
						{GEMINI_MODELS.map((model) => (
							<SelectItem key={model.id} value={model.id}>
								{model.name}
							</SelectItem>
						))}
					</SelectContent>
				</Select>

				{/* Tag chips */}
				<div className='flex items-center gap-1.5'>
					{DEFAULT_TAGS.map((tag) => {
						const isActive = filters.tags.includes(tag.value);
						return (
							<Badge
								key={tag.value}
								variant='outline'
								className={`text-[10px] capitalize cursor-pointer transition-all ${
									isActive ? tag.color + ' ring-1 ring-offset-1' : 'hover:bg-muted'
								}`}
								onClick={() => toggleTag(tag.value)}
							>
								{tag.label}
							</Badge>
						);
					})}
				</div>

				{/* Clear filters */}
				{hasActiveFilters && (
					<Button
						variant='ghost'
						size='sm'
						className='h-7 px-2 text-xs gap-1 text-muted-foreground'
						onClick={clearFilters}
					>
						<X className='h-3 w-3' />
						Clear
					</Button>
				)}
			</div>
		</div>
	);
}
