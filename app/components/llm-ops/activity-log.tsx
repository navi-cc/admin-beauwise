import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle
} from '@/components/ui/card';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from '@/components/ui/select';

import { ACTIVITY_ACTION_CONFIG } from '@/constants/llm-ops';
import { useActivityLogs } from '@/hooks/llm-ops/use-activity-logs';
import type { ActivityLog as ActivityLogType, ActivityAction } from '@/types/llm-ops';
import { Timestamp } from 'firebase/firestore';
import History from '@/components/icons/history';
import { Button } from '../ui/button';
import RotateCcw from '../icons/rotate-ccw';

interface ActivityLogProps {
	promptId?: string;
	title?: string;
	description?: string;
	maxHeight?: string;
}

/**
 * Format a Firestore Timestamp as a human-friendly relative time string.
 */
function formatRelativeTime(timestamp: Timestamp): string {
	const now = Date.now();
	const date = timestamp.toDate();
	const diffMs = now - date.getTime();
	const diffSec = Math.floor(diffMs / 1000);
	const diffMin = Math.floor(diffSec / 60);
	const diffHour = Math.floor(diffMin / 60);
	const diffDay = Math.floor(diffHour / 24);

	if (diffSec < 60) return 'Just now';
	if (diffMin < 60) return `${diffMin}m ago`;
	if (diffHour < 24) return `${diffHour}h ago`;
	if (diffDay < 7) return `${diffDay}d ago`;

	return date.toLocaleDateString('en-US', {
		month: 'short',
		day: 'numeric',
		year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
	});
}

/**
 * Single activity log entry component.
 */
function ActivityEntry({ log }: { log: ActivityLogType }) {
	const config = ACTIVITY_ACTION_CONFIG[log.action];
	const Icon = config.icon;

	return (
		<div className='flex gap-3 py-3 group'>
			{/* Icon */}
			<div
				className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${config.color}`}
			>
				<Icon className='h-3.5 w-3.5' />
			</div>

			{/* Content */}
			<div className='flex-1 min-w-0 space-y-0.5'>
				<p className='text-sm text-foreground leading-snug'>{log.description}</p>
				<div className='flex items-center gap-2 text-xs text-muted-foreground'>
					<span>{log.performedByName || 'System'}</span>
					<span>·</span>
					<span>{formatRelativeTime(log.createdAt)}</span>
				</div>
			</div>

			{/* Action badge */}
			<Badge
				variant='outline'
				className={`shrink-0 text-[10px] h-5 self-start ${config.color} border-0`}
			>
				{config.label}
			</Badge>
		</div>
	);
}

export function ActivityLog({
	promptId,
	title = 'Activity Log',
	description = 'Recent changes and actions',
	maxHeight = '400px'
}: ActivityLogProps) {
	const {
		data: logs,
		isLoading,
		error,
		isError,
		isRefetchError
	} = useActivityLogs(promptId);
	const [actionFilter, setActionFilter] = React.useState<string>('all');

	const filteredLogs = React.useMemo(() => {
		if (!logs) return [];
		if (actionFilter === 'all') return logs;
		return logs.filter((log) => log.action === actionFilter);
	}, [logs, actionFilter]);

	return (
		<Card>
			<CardHeader className='pb-3'>
				<div className='flex items-center justify-between'>
					<div className='flex items-center gap-2'>
						<div className='h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center'>
							<History className='h-4 w-4 text-blue-600' />
						</div>
						<div>
							<CardTitle className='text-sm'>{title}</CardTitle>
							<CardDescription className='text-xs'>{description}</CardDescription>
						</div>
					</div>
				</div>
			</CardHeader>

			<CardContent>
				{isLoading ? (
					<div className='space-y-3'>
						{Array.from({ length: 3 }).map((_, i) => (
							<div key={i} className='flex gap-3 animate-pulse'>
								<div className='h-8 w-8 rounded-full bg-muted' />
								<div className='flex-1 space-y-2 py-1'>
									<div className='h-3 bg-muted rounded w-3/4' />
									<div className='h-2 bg-muted rounded w-1/2' />
								</div>
							</div>
						))}
					</div>
				) : error ? (
					<div className='text-center py-6 text-sm text-muted-foreground'>
						Failed to load activity logs.
						<Button>
							Retry <RotateCcw />
						</Button>
					</div>
				) : filteredLogs.length === 0 ? (
					<div className='text-center py-8 text-sm text-muted-foreground'>
						<History className='h-8 w-8 mx-auto mb-2 opacity-30' />
						<p>No activity recorded yet.</p>
					</div>
				) : (
					<div className='max-h-90 overflow-y-auto pr-4'>
						<div className='divide-y'>
							{filteredLogs.map((log) => (
								<ActivityEntry key={log.id} log={log} />
							))}
						</div>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
