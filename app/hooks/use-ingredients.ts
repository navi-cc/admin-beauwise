import { useQuery } from '@tanstack/react-query';
import { useRef, useCallback } from 'react';
import { ingredientService, type PaginatedResult } from '@/services/ingredient-service';

export const ingredientKeys = {
	all: ['ingredients'] as const,
	lists: () => [...ingredientKeys.all, 'list'] as const,
	list: (
		page: number,
		pageSize: number,
		filter: string,
		categories: string,
		bestFor: string,
		commonProducts: string,
		query?: string
	) =>
		[
			...ingredientKeys.lists(),
			page,
			pageSize,
			filter,
			query,
			categories,
			bestFor,
			commonProducts
		] as const
};

type FilterItem = {
	name: string;
	isCheck: boolean;
	key: string;
};

export function useIngredients(
	page: number,
	pageSize: number,
	filter: FilterItem,
	query?: string,
	categories?: string[],
	bestFor?: string[],
	commonProducts?: string[]
) {
	const cursorsRef = useRef<Map<number, string | null>>(new Map());

	if (!cursorsRef.current.has(0)) {
		cursorsRef.current.set(0, '');
	}

	const queryResult = useQuery<PaginatedResult>({
		queryKey: ingredientKeys.list(
			page,
			pageSize,
			filter.key,
			`categories-${categories?.length}`,
			`bestFor-${bestFor?.length}`,
			`commonProducts-${commonProducts?.length}`,
			query
		),
		queryFn: async () => {
			const cursor = cursorsRef.current.get(page) ?? '';
			const result = await ingredientService.getPaginated(
				page,
				pageSize,
				filter.key,
				query,
				categories,
				bestFor,
				commonProducts
			);

			if (result.pagination.cursor) {
				cursorsRef.current.set(page + 1, result.pagination.cursor);
			}

			return result;
		},
		placeholderData: (previousData) => previousData
	});

	const resetCursors = useCallback(() => {
		// cursorsRef.current = new Map();
		// cursorsRef.current.set(0, '');
	}, []);

	const totalPages = queryResult.data?.pagination.total_pages ?? 0;
	const hasMore = page < totalPages;

	return {
		...queryResult,
		items: queryResult.data?.data ?? [],
		totalPages,
		totalCount: queryResult.data?.pagination.total_documents ?? 0,
		hasMore,
		resetCursors
	};
}
