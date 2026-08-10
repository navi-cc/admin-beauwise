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
import type { User, ForceLogoutPayload } from '@/types/user';
interface ForceLogoutDialogProps {
	user: User | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onConfirm: (payload: ForceLogoutPayload) => void;
}
export function ForceLogoutDialog({
	user,
	open,
	onOpenChange,
	onConfirm
}: ForceLogoutDialogProps) {
	const handleConfirm = () => {
		if (!user) return;
		onConfirm({
			userId: user.id
		});
		onOpenChange(false);
	};
	const lastSignIn = user?.metadata.lastSignInTime
		? new Date(user.metadata.lastSignInTime).toLocaleString('en-US', {
				year: 'numeric',
				month: 'short',
				day: 'numeric',
				hour: '2-digit',
				minute: '2-digit'
			})
		: 'Never';
	return (
		<AlertDialog open={open} onOpenChange={onOpenChange}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Force Logout</AlertDialogTitle>
					<AlertDialogDescription>
						This will revoke all active sessions for{' '}
						<span className='font-semibold'>{user?.email}</span>. They will be signed out
						of all devices immediately.
						<br />
						<span className='text-xs text-muted-foreground'>
							Last sign in: {lastSignIn}
						</span>
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Cancel</AlertDialogCancel>
					<AlertDialogAction onClick={handleConfirm}>Force Logout</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
