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
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import ChevronDown from '../icons/chevron-down';
import { InputGroup, InputGroupAddon, InputGroupInput } from '../ui/input-group';
import Refresh from '../icons/refresh';
import Plus from '../icons/plus';
import { useNavigate } from 'react-router';

interface PromptFiltersBarProps {
	filters: PromptFilters;
	onChange: (filters: PromptFilters) => void;
	retry: () => void;
}

/**
 * Filter bar for the prompt list page with search, prompt type, status,
 * model, environment tag filters, and sort options.
 */
export function PromptFiltersBar({ filters, onChange, retry }: PromptFiltersBarProps) {
	const navigate = useNavigate();

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
		<div className='space-y-1.5'>
			<div className='flex items-center gap-1.5'>
				<InputGroup className='max-w-80'>
					<InputGroupAddon>
						<Search className='size-4 text-muted-foreground' />
					</InputGroupAddon>
					<InputGroupInput
						value={filters.search}
						onChange={(e) => updateFilter('search', e.target.value)}
						placeholder='Search prompts by name...'
					/>
				</InputGroup>

				<Button
					className='self-start'
					onClick={() => navigate('/llm-ops/create', { viewTransition: true })}
				>
					<Plus className='mr-1 h-4 w-4' />
					Create Prompt
				</Button>
			</div>

			<div className='flex items-center gap-1.5 flex-wrap'>
				<Popover>
					<PopoverTrigger
						render={
							<Button variant='outline' className='font-light'>
								<span className='font-normal capitalize'>{filters.sortBy}</span>{' '}
								<ChevronDown />
							</Button>
						}
					/>
					<PopoverContent align='center' className='w-20'>
						{['newest', 'oldest'].map((val) => {
							return (
								<Button
									onClick={() => {
										updateFilter('sortBy', val as PromptFilters['sortBy']);
									}}
									variant='ghost'
									className={`capitalize font-light transition-colors duration-300 ${val === filters.sortBy ? 'bg-muted' : 'bg-transparent'}`}
								>
									{val}
								</Button>
							);
						})}
					</PopoverContent>
				</Popover>

				<Popover>
					<PopoverTrigger
						render={
							<Button variant='outline' className='font-light'>
								Prompt:{' '}
								<span className='font-normal capitalize'>
									{filters.promptType
										.split('_')
										.map((val) => val[0].toUpperCase() + val.slice(1))
										.join(' ')}
								</span>{' '}
								<ChevronDown />
							</Button>
						}
					/>
					<PopoverContent align='start' className='w-50'>
						<Button
							key={'all'}
							onClick={() => {
								updateFilter('promptType', 'all' as PromptFilters['promptType']);
							}}
							variant='ghost'
							className={`capitalize font-light transition-colors duration-300 ${'all' === filters.promptType ? 'bg-muted' : 'bg-transparent'}`}
						>
							All
						</Button>

						{Object.values(PROMPT_TYPES).map((type) => {
							return (
								<Button
									key={type.id}
									onClick={() => {
										updateFilter('promptType', type.id as PromptFilters['promptType']);
									}}
									variant='ghost'
									className={`capitalize font-light transition-colors duration-300 ${type.id === filters.promptType ? 'bg-muted' : 'bg-transparent'}`}
								>
									{type.label}
								</Button>
							);
						})}
					</PopoverContent>
				</Popover>

				{/* Status filter */}
				{/* <Select
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
				</Select> */}
				<Popover>
					<PopoverTrigger
						render={
							<Button variant='outline' className='font-light'>
								Models:{' '}
								<span className='font-normal capitalize'>
									{filters.model
										.split('_')
										.map((val) => val[0].toUpperCase() + val.slice(1))
										.join(' ')
										.split('-')
										.join(' ')}
								</span>{' '}
								<ChevronDown />
							</Button>
						}
					/>
					<PopoverContent align='start' className='w-50'>
						<Button
							key={'all'}
							onClick={() => {
								updateFilter('model', 'all' as PromptFilters['model']);
							}}
							variant='ghost'
							className={`capitalize font-light transition-colors duration-300 ${'all' === filters.model ? 'bg-muted' : 'bg-transparent'}`}
						>
							All Models
						</Button>

						{GEMINI_MODELS.map((model) => {
							return (
								<Button
									key={model.id}
									onClick={() => {
										updateFilter('model', model.id as PromptFilters['model']);
									}}
									variant='ghost'
									className={`capitalize font-light transition-colors duration-300 ${model.id === filters.model ? 'bg-muted' : 'bg-transparent'}`}
								>
									{model.name}
								</Button>
							);
						})}
					</PopoverContent>
				</Popover>

				<Button variant='outline' className='font-light self-start' onClick={retry}>
					Refresh <Refresh />
				</Button>

				{/* <Select value={filters.model} onValueChange={(v) => updateFilter('model', v)}>
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
				</Select> */}

				{/* Tag chips */}
				{/* <div className='flex items-center gap-1.5'>
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
				</div> */}

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
