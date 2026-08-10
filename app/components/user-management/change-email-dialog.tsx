import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { User, ChangeEmailPayload } from '@/types/user';
const changeEmailSchema = z.object({
	newEmail: z
		.string()
		.min(1, 'Email is required')
		.email('Please enter a valid email address')
});
type ChangeEmailForm = z.infer<typeof changeEmailSchema>;
interface ChangeEmailDialogProps {
	user: User | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSubmit: (payload: ChangeEmailPayload) => void;
}
export function ChangeEmailDialog({
	user,
	open,
	onOpenChange,
	onSubmit
}: ChangeEmailDialogProps) {
	const {
		register,
		handleSubmit,
		reset,
		formState: { errors, isSubmitting }
	} = useForm<ChangeEmailForm>({
		resolver: zodResolver(changeEmailSchema),
		defaultValues: {
			newEmail: ''
		}
	});
	const handleFormSubmit = (data: ChangeEmailForm) => {
		if (!user) return;
		// Only sends userId + newEmail — no extra data
		onSubmit({
			userId: user.id,
			newEmail: data.newEmail
		});
		reset();
		onOpenChange(false);
	};
	const handleClose = (isOpen: boolean) => {
		if (!isOpen) reset();
		onOpenChange(isOpen);
	};
	return (
		<Dialog open={open} onOpenChange={handleClose}>
			<DialogContent className='sm:max-w-[425px]'>
				<DialogHeader>
					<DialogTitle>Change Email</DialogTitle>
					<DialogDescription>
						Update the email address for{' '}
						<span className='font-semibold'>{user?.email}</span>
						<br />
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleSubmit(handleFormSubmit)} className='space-y-4'>
					<div className='space-y-2'>
						<Label htmlFor='newEmail'>New Email</Label>
						<Input
							id='newEmail'
							type='email'
							placeholder='Enter new email address'
							{...register('newEmail')}
						/>
						{errors.newEmail && (
							<p className='text-sm text-destructive'>{errors.newEmail.message}</p>
						)}
					</div>
					<DialogFooter>
						<Button type='button' variant='outline' onClick={() => handleClose(false)}>
							Cancel
						</Button>
						<Button type='submit' disabled={isSubmitting}>
							Update Email
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
