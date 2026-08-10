import { useQuery } from '@tanstack/react-query';
import { useRef, useCallback } from 'react';
import { consumerGuideService } from '@/services/consumer-guide-service';
import type { ConsumerGuide } from '@/zod/consumer-guide';

export const consumerGuideKeys = {
	all: ['consumer-guides'] as const,
	lists: () => [...consumerGuideKeys.all, 'list'] as const,
	list: (page: number, pageSize: number, filter: string, query?: string) =>
		[...consumerGuideKeys.lists(), page, pageSize, filter, query] as const
};

type FilterItem = {
	name: string;
	isCheck: boolean;
	key: string;
};

export interface PaginationInfo {
	cursor: string;
	total_documents: number;
	total_pages: number;
}

export interface PaginatedResult {
	data: ConsumerGuide[];
	pagination: PaginationInfo;
}

export function useConsumerGuides(
	page: number,
	pageSize: number,
	filter: FilterItem,
	query?: string
) {
	const cursorsRef = useRef<Map<number, string | null>>(new Map());

	if (!cursorsRef.current.has(0)) {
		cursorsRef.current.set(0, '');
	}

	const queryResult = useQuery<Promise<PaginatedResult>>({
		queryKey: consumerGuideKeys.list(page, pageSize, filter.key, query),
		queryFn: async () => {
			const cursor = cursorsRef.current.get(page) ?? '';
			const result = await consumerGuideService.getPaginated(
				page,
				pageSize,
				filter.key,
				query
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
