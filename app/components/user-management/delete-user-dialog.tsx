import { useState } from 'react';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { User, DeleteUserPayload } from '@/types/user';
interface DeleteUserDialogProps {
	user: User | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onConfirm: (payload: DeleteUserPayload) => void;
}
export function DeleteUserDialog({
	user,
	open,
	onOpenChange,
	onConfirm
}: DeleteUserDialogProps) {
	const [confirmEmail, setConfirmEmail] = useState('');
	const isConfirmed = confirmEmail === user?.email;
	const handleConfirm = () => {
		if (!user || !isConfirmed) return;
		onConfirm({ user });
		setConfirmEmail('');
		onOpenChange(false);
	};
	const handleClose = (isOpen: boolean) => {
		if (!isOpen) setConfirmEmail('');
		onOpenChange(isOpen);
	};
	return (
		<AlertDialog open={open} onOpenChange={handleClose}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Delete User</AlertDialogTitle>
					<AlertDialogDescription>
						This action is <span className='font-semibold'>permanent</span> and cannot be
						undone. All data associated with{' '}
						<span className='font-semibold'>{user?.email}</span> will be permanently
						removed.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<div className='space-y-2 py-2'>
					<Label htmlFor='confirmEmail'>
						Type <span className='font-semibold'>{user?.email}</span> to confirm
					</Label>
					<Input
						id='confirmEmail'
						type='email'
						placeholder='Enter user email to confirm'
						value={confirmEmail}
						onChange={(e) => setConfirmEmail(e.target.value)}
					/>
				</div>
				<AlertDialogFooter>
					<AlertDialogCancel>Cancel</AlertDialogCancel>
					<AlertDialogAction
						onClick={handleConfirm}
						disabled={!isConfirmed}
						className='bg-destructive hover:bg-destructive/90'
					>
						Delete User
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
