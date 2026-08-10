import { useQuery } from '@tanstack/react-query';
import {
	getActivityLogs,
	getRecentActivity
} from '@/services/llm-ops/activity-log-service';

export function useActivityLogs(promptId?: string) {
	return useQuery({
		queryKey: ['activity-logs', promptId],
		queryFn: () => getActivityLogs(promptId),
		staleTime: 15 * 1000
	});
}

export function useRecentActivity(limitCount?: number) {
	return useQuery({
		queryKey: ['recent-activity', limitCount],
		queryFn: () => getRecentActivity(limitCount),
		staleTime: 15 * 1000
	});
}
