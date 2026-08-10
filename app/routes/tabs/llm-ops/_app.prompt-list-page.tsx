import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

import { PromptFiltersBar } from '@/components/llm-ops/prompt-filters';
import { PromptCard } from '@/components/llm-ops/prompt-card';
import { usePrompts } from '@/hooks/llm-ops/use-prompts';
import type { PromptFilters, Prompt } from '@/types/llm-ops';
import Plus from '@/components/icons/plus';
import SearchX from '@/components/icons/search-x';
import Alert from '@/components/icons/alert';
import RefreshCw from '@/components/icons/refresh-cw';
import Refresh from '@/components/icons/refresh';

const getTime = (t: any) => t?.toDate?.()?.getTime?.() ?? 0;

export default function PromptListPage() {
	const navigate = useNavigate();
	const { data: prompts = [], isError, error, refetch, isFetching } = usePrompts();

	const [filters, setFilters] = useState<PromptFilters>({
		search: '',
		promptType: 'all',
		tags: [],
		status: 'all',
		model: 'all',
		sortBy: 'newest'
	});

	const filteredAndSortedPrompts = useMemo(() => {
		let result = [...prompts];

		if (filters.search) {
			const searchLower = filters.search.toLowerCase();
			result = result.filter(
				(p) =>
					p.name.toLowerCase().includes(searchLower) ||
					p.description?.toLowerCase().includes(searchLower)
			);
		}

		if (filters.promptType && filters.promptType !== 'all') {
			result = result.filter((p) => p.promptType === filters.promptType);
		}

		if (filters.status !== 'all') {
			result = result.filter((p) => p.status === filters.status);
		}

		if (filters.model !== 'all') {
			result = result.filter((p) => p.model === filters.model);
		}

		if (filters.tags.length > 0) {
			result = result.filter((p) => filters.tags.every((tag) => p.tags.includes(tag)));
		}

		result.sort((a, b) => {
			switch (filters.sortBy) {
				case 'newest':
					return getTime(b.updatedAt) - getTime(a.updatedAt);
				case 'oldest':
					return getTime(a.updatedAt) - getTime(b.updatedAt);
				case 'name_asc':
					return a.name.localeCompare(b.name);
				case 'name_desc':
					return b.name.localeCompare(a.name);
				default:
					return 0;
			}
		});

		return result;
	}, [prompts, filters]);

	const handleDuplicate = (prompt: Prompt) => {
		navigate(`/llm-ops/create?duplicate=${prompt.id}`, { viewTransition: true });
	};

	return (
		<div className='space-y-6 container mx-auto p-6 max-w-7xl'>
			<div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
				<div>
					<h1 className='text-3xl font-bold tracking-tight'>Prompt Management</h1>
					<p className='text-muted-foreground text-sm'>
						Manage, version, and evaluate your LLM system prompt templates.
					</p>
				</div>
				<Button onClick={() => navigate('/llm-ops/create', { viewTransition: true })}>
					<Plus className='mr-2 h-4 w-4' />
					Create Prompt
				</Button>
			</div>

			<div className='flex flex-col gap-y-5'>
				<PromptFiltersBar filters={filters} onChange={setFilters} />
				<Button className='self-start' variant='outline' onClick={() => refetch()}>
					<Refresh className='mr-2 h-4 w-4' />
					Refresh
				</Button>
			</div>

			{isError ? (
				<div className='flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center animate-in fade-in-50'>
					<Alert className='mx-auto h-12 w-12 text-destructive/50' />
					<h3 className='mt-4 text-lg font-semibold'>Error loading prompts</h3>
					<p className='mb-4 mt-2 text-sm text-muted-foreground'>
						{error instanceof Error ? error.message : 'An unknown error occurred'}
					</p>
					<Button variant='outline' onClick={() => refetch()}>
						<RefreshCw className='mr-2 h-4 w-4' />
						Try again
					</Button>
				</div>
			) : isFetching ? (
				<div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3'>
					{Array.from({ length: 10 }).map((_, i) => (
						<div key={i} className='flex flex-col space-y-3 rounded-xl border p-4'>
							<div className='space-y-2'>
								<Skeleton className='h-5 w-1/2' />
								<Skeleton className='h-4 w-4/5' />
							</div>
							<Skeleton className='h-28 w-full' />
						</div>
					))}
				</div>
			) : filteredAndSortedPrompts.length === 0 ? (
				<div className='flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center animate-in fade-in-50'>
					<SearchX className='mx-auto h-12 w-12 text-muted-foreground/50' />
					<h3 className='mt-4 text-lg font-semibold'>No prompts found</h3>
					<p className='mt-2 text-sm text-muted-foreground'>
						{prompts.length === 0
							? 'Get started by creating your first system prompt.'
							: 'Try adjusting your search or filters to find prompts.'}
					</p>
					{prompts.length === 0 && (
						<Button
							className='mt-6'
							onClick={() => navigate('/llm-ops/create', { viewTransition: true })}
						>
							<Plus className='mr-2 h-4 w-4' />
							Create Prompt
						</Button>
					)}
				</div>
			) : (
				<div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3'>
					{filteredAndSortedPrompts.map((prompt) => (
						<PromptCard key={prompt.id} prompt={prompt} onDuplicate={handleDuplicate} />
					))}
				</div>
			)}
		</div>
	);
}
