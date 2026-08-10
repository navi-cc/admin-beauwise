import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import Loader from '@/components/icons/loader';
import type { User, AuditLogEntry } from '@/types/user';
interface AuditLogDialogProps {
	user: User | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	entries: AuditLogEntry[];
	isLoading: boolean;
}
export function AuditLogDialog({
	user,
	open,
	onOpenChange,
	entries,
	isLoading
}: AuditLogDialogProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className='sm:max-w-[600px]'>
				<DialogHeader>
					<DialogTitle>Audit Log</DialogTitle>
					<DialogDescription>
						Activity history for <span className='font-semibold'>{user?.email}</span>
					</DialogDescription>
				</DialogHeader>
				{isLoading ? (
					<div className='flex items-center justify-center py-8'>
						<Loader className='h-6 w-6 animate-spin text-muted-foreground' />
						<span className='ml-2 text-sm text-muted-foreground'>
							Loading audit log...
						</span>
					</div>
				) : entries.length === 0 ? (
					<div className='py-8 text-center text-sm text-muted-foreground'>
						No audit log entries found.
					</div>
				) : (
					<ScrollArea className='max-h-[400px]'>
						<div className='space-y-3 pr-4'>
							{entries.map((entry) => {
								const timestamp = new Date(entry.timestamp).toLocaleString('en-US', {
									year: 'numeric',
									month: 'short',
									day: 'numeric',
									hour: '2-digit',
									minute: '2-digit'
								});
								return (
									<div key={entry.id} className='rounded-md border p-3 space-y-1'>
										<div className='flex items-center justify-between'>
											<span className='text-sm font-medium'>{entry.action}</span>
											<span className='text-xs text-muted-foreground'>{timestamp}</span>
										</div>
										<div className='text-xs text-muted-foreground'>
											By: {entry.performedBy}
										</div>
										{entry.details && (
											<div className='text-xs text-muted-foreground pt-1 border-t'>
												{entry.details}
											</div>
										)}
									</div>
								);
							})}
						</div>
					</ScrollArea>
				)}
			</DialogContent>
		</Dialog>
	);
}
