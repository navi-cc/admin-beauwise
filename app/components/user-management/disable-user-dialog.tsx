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
import type { User, DisableUserPayload } from '@/types/user';
interface DisableUserDialogProps {
	user: User | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onConfirm: (payload: DisableUserPayload) => void;
}
export function DisableUserDialog({
	user,
	open,
	onOpenChange,
	onConfirm
}: DisableUserDialogProps) {
	const isCurrentlyDisabled = user?.account_disable;
	const handleConfirm = () => {
		if (!user) return;

		onConfirm({ userId: user.id, status: !user.account_disable });
		onOpenChange(false);
	};
	return (
		<AlertDialog open={open} onOpenChange={onOpenChange}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>
						{isCurrentlyDisabled ? 'Enable' : 'Disable'} User
					</AlertDialogTitle>
					<AlertDialogDescription>
						{isCurrentlyDisabled ? (
							<>
								Are you sure you want to re-enable{' '}
								<span className='font-semibold'>{user?.email}</span>? They will regain
								access to the system.
							</>
						) : (
							<>
								Are you sure you want to disable{' '}
								<span className='font-semibold'>{user?.email}</span>? They will no longer
								be able to access the system.
							</>
						)}
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Cancel</AlertDialogCancel>
					<AlertDialogAction
						onClick={handleConfirm}
						style={{ color: '#fff' }}
						className={
							isCurrentlyDisabled
								? ''
								: 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
						}
					>
						{isCurrentlyDisabled ? 'Enable User' : 'Disable User'}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
