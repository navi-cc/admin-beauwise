import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { User, ChangePasswordPayload } from '@/types/user';

interface ChangePasswordDialogProps {
	user: User;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSubmit: (payload: User) => void;
}
export function ResetPasswordDialog({
	user,
	open,
	onOpenChange,
	onSubmit
}: ChangePasswordDialogProps) {
	const handleFormSubmit = (data: User) => {
		if (!user) return;
		onSubmit(data);
		onOpenChange(false);
	};
	const handleClose = (isOpen: boolean) => {
		onOpenChange(isOpen);
	};
	return (
		<Dialog open={open} onOpenChange={handleClose}>
			<DialogContent className='sm:max-w-[425px]'>
				<DialogHeader>
					<DialogTitle>Reset Password</DialogTitle>
					<DialogDescription>
						Do you want to send a password reset link for{' '}
						<span className='font-semibold'>{user?.email}?</span>
					</DialogDescription>
				</DialogHeader>

				<div className='space-y-2'></div>

				<DialogFooter>
					<Button type='button' variant='outline' onClick={() => handleClose(false)}>
						Cancel
					</Button>
					<Button
						onClick={() => {
							handleFormSubmit(user);
						}}
					>
						Send Reset Password Link
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
