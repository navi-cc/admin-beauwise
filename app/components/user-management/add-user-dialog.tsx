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
import type { AddUserPayload } from '@/types/user';
import { newUser, type NewUserFormValues } from '@/zod/user';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Field, FieldContent, FieldError, FieldLabel } from '../ui/field';
import { useAuthStore } from '@/store/useAuthStore';
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuTrigger
} from '../ui/dropdown-menu';
import { Button } from '../ui/button';
import ChevronDown from '../icons/chevron-down';
interface DeleteUserDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onConfirm: (payload: AddUserPayload) => void;
}

const defaultValues: NewUserFormValues = {
	email: '',
	password: ''
};

export function AddUserDialog({ open, onOpenChange, onConfirm }: DeleteUserDialogProps) {
	const [confirmEmail, setConfirmEmail] = useState('');

	const [role, setRole] = useState('basic');
	const isSuperAdmin = useAuthStore((state) => state.isSuperAdmin);

	const { control, handleSubmit, reset } = useForm({
		resolver: zodResolver(newUser),
		defaultValues
	});
	const onSubmit = (data: NewUserFormValues) => {
		onConfirm({
			...data,
			role
		});

		reset();
		onOpenChange(false);
	};
	const handleClose = (isOpen: boolean) => {
		onOpenChange(isOpen);
	};
	return (
		<AlertDialog open={open} onOpenChange={handleClose}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Add New User</AlertDialogTitle>
					<AlertDialogDescription>Create a new user.</AlertDialogDescription>
				</AlertDialogHeader>
				<div className='space-y-2 py-2'>
					<Field>
						<FieldLabel htmlFor='email'>Email</FieldLabel>
						<Controller
							name='email'
							control={control}
							render={({ field, fieldState: { error } }) => (
								<>
									<Input {...field} />
									<FieldError errors={[error]} />
								</>
							)}
						/>
					</Field>

					<Field>
						<FieldLabel htmlFor='email'>Password</FieldLabel>
						<Controller
							name='password'
							control={control}
							render={({ field, fieldState: { error } }) => (
								<>
									<Input {...field} />
									<FieldError errors={[error]} />
								</>
							)}
						/>
					</Field>

					{isSuperAdmin && (
						<div className='flex flex-col items-start gap-y-1 mt-4'>
							<FieldLabel>Role</FieldLabel>

							<DropdownMenu>
								<DropdownMenuTrigger
									render={
										<Button
											variant='outline'
											className='items-center font-light capitalize'
										>
											{role} <ChevronDown />
										</Button>
									}
								/>
								<DropdownMenuContent align='start' className='w-40 flex-row'>
									<DropdownMenuGroup>
										<DropdownMenuRadioGroup value={role} onValueChange={setRole}>
											{['basic', 'admin'].map((role, index) => (
												<DropdownMenuRadioItem
													key={role + index}
													value={role}
													className='transition-colors duration-300 capitalize'
												>
													{role}
												</DropdownMenuRadioItem>
											))}
										</DropdownMenuRadioGroup>
									</DropdownMenuGroup>
								</DropdownMenuContent>
							</DropdownMenu>
						</div>
					)}
				</div>
				<AlertDialogFooter>
					<AlertDialogCancel>Cancel</AlertDialogCancel>
					<AlertDialogAction onClick={handleSubmit(onSubmit)} className=''>
						Add User
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
