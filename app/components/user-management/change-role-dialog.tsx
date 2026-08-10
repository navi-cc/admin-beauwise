import { useState, useEffect } from 'react';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from '@/components/ui/select';
import type { User, ChangeRolePayload } from '@/types/user';
interface ChangeRoleDialogProps {
	user: User | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSubmit: (payload: ChangeRolePayload) => void;
}
export function ChangeRoleDialog({
	user,
	open,
	onOpenChange,
	onSubmit
}: ChangeRoleDialogProps) {
	const currentRole = user?.account_access.roles ?? 'client';
	const [selectedRole, setSelectedRole] = useState<'admin' | 'client'>(currentRole);
	// Sync selected role when a different user is selected
	useEffect(() => {
		if (user) {
			setSelectedRole(user.account_access.roles);
		}
	}, [user]);
	const handleSubmit = () => {
		if (!user) return;
		onSubmit({
			userId: user.id,
			newRole: selectedRole
		});
		onOpenChange(false);
	};
	const handleClose = (isOpen: boolean) => {
		if (!isOpen && user) {
			setSelectedRole(user.account_access.roles);
		}
		onOpenChange(isOpen);
	};
	const hasChanged = selectedRole !== currentRole;
	return (
		<Dialog open={open} onOpenChange={handleClose}>
			<DialogContent className='sm:max-w-[425px]'>
				<DialogHeader>
					<DialogTitle>Change Role</DialogTitle>
					<DialogDescription>
						Update the role for <span className='font-semibold'>{user?.email}</span>
						<br />
						<span className='text-xs text-muted-foreground'>
							Current role: {currentRole}
						</span>
					</DialogDescription>
				</DialogHeader>
				<div className='space-y-2 py-2'>
					<Label htmlFor='role'>New Role</Label>
					<Select
						value={selectedRole}
						onValueChange={(value: 'admin' | 'client') => setSelectedRole(value)}
					>
						<SelectTrigger id='role'>
							<SelectValue placeholder='Select a role' />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value='admin'>Admin</SelectItem>
							<SelectItem value='client'>Client</SelectItem>
						</SelectContent>
					</Select>
				</div>
				<DialogFooter>
					<Button type='button' variant='outline' onClick={() => handleClose(false)}>
						Cancel
					</Button>
					<Button onClick={handleSubmit} disabled={!hasChanged}>
						Update Role
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
