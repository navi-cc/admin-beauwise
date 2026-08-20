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
import type { User, CancelDeletionPayload } from '@/types/user';
interface CancelDeletionDialogProps {
	user: User | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onConfirm: (payload: CancelDeletionPayload) => void;
}
export function CancelDeletionDialog({
	user,
	open,
	onOpenChange,
	onConfirm
}: CancelDeletionDialogProps) {
	const isPendingDeletion = user?.status === 'PENDING_DELETION';
	const handleConfirm = () => {
		if (!user) return;

		onConfirm({ user, status: 'REMOVE_PENDING_DELETION' });
		onOpenChange(false);
	};
	return (
		<AlertDialog open={open} onOpenChange={onOpenChange}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Cancel User Deletion</AlertDialogTitle>
					<AlertDialogDescription>
						Are you sure you want to cancel deletion of the account associated with{' '}
						<span className='font-semibold'>{user?.email}</span>?
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Cancel</AlertDialogCancel>
					<AlertDialogAction
						onClick={handleConfirm}
						style={{ color: '#fff' }}
						className={
							isPendingDeletion
								? ''
								: 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
						}
					>
						Cancel Deletion
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
