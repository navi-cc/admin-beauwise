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
import type { User, ChangeRolePayload, Roles } from '@/types/user';
import { Badge } from '../ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import ChevronDown from '../icons/chevron-down';
import Check from '../icons/check';
interface ChangeRoleDialogProps {
	user: User | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onConfirm: (payload: ChangeRolePayload) => void;
}
export function ChangeRoleDialog({
	user,
	open,
	onOpenChange,
	onConfirm
}: ChangeRoleDialogProps) {
	const currentRole = (user?.account_access.role ?? 'basic') as Partial<Roles>;
	const [selectedRole, setSelectedRole] = useState<'admin' | 'basic'>(
		currentRole as 'admin' | 'basic'
	);
	const [viewPermissions, setViewPermissions] = useState(false);

	const handleChangeRole = (role: 'admin' | 'basic') => () => {
		setSelectedRole(role);
	};
	useEffect(() => {
		if (user) {
			setSelectedRole(user.account_access.role as 'admin' | 'basic');
		}
	}, [user]);
	const handleSubmit = () => {
		if (!user) return;
		onConfirm({
			user,
			role: selectedRole
		});
		setViewPermissions(false);
		onOpenChange(false);
	};
	const handleClose = (isOpen: boolean) => {
		if (!isOpen && user) {
			setViewPermissions(false);
			setSelectedRole(user.account_access.role as 'admin' | 'basic');
		}
		onOpenChange(isOpen);
	};
	const hasChanged = selectedRole !== currentRole;
	return (
		<Dialog open={open} onOpenChange={handleClose}>
			<DialogContent className='sm:max-w-[500px]'>
				<DialogHeader>
					<DialogTitle>Change User Role</DialogTitle>
					<DialogDescription>
						Update access level for
						<span className='font-semibold'>
							{user?.user_name} ({user?.email})
						</span>
						<br />
						<div className='flex items-center gap-x-1 mt-1'>
							<span className='text-xs text-muted-foreground'>Current User Role</span>

							<Badge
								variant='default'
								className={`capitalize ${currentRole === 'superadmin' ? 'bg-red-400' : currentRole === 'admin' ? 'bg-blue-400' : ''}`}
								style={{ textTransform: 'capitalize' }}
							>
								{currentRole === 'basic' ? 'App Member' : currentRole}
							</Badge>
						</div>
					</DialogDescription>
				</DialogHeader>
				<div className='space-y-2 py-2'>
					<Label htmlFor='role'>Select New Role</Label>
					<Popover>
						<PopoverTrigger
							render={
								<Button variant='outline' className='font-light'>
									<span className='font-normal capitalize'>{selectedRole}</span>
									<ChevronDown />
								</Button>
							}
						/>
						<PopoverContent align='start' className='w-20'>
							{['admin', 'basic'].map((role) => {
								return (
									<Button
										className={`capitalize transition-colors ${selectedRole === role ? 'bg-muted' : ''} duration-300 `}
										onClick={handleChangeRole(role as 'admin' | 'basic')}
										variant='ghost'
									>
										{role}
									</Button>
								);
							})}
						</PopoverContent>
					</Popover>

					{currentRole === 'basic' && selectedRole === 'admin' && (
						<Badge variant='destructive' className='mr-4 mt-2'>
							Warning: Elevating this user account to Administrator grants access in
							selected permissions.
						</Badge>
					)}

					{currentRole === 'basic' && selectedRole === 'admin' && (
						<Button
							onClick={() => setViewPermissions((prev) => !prev)}
							variant='ghost'
							className='font-normal text-[0.625rem] hover:bg-transparent pt-0 pb-0'
						>
							View Permissions <ChevronDown />
						</Button>
					)}

					{viewPermissions && (
						<div className='flex flex-col text-[0.625rem] gap-y-4 ml-2.5'>
							<div>
								<span>Basic Users</span>
								<div className='flex gap-1'>
									{['create', 'update', 'read', 'delete'].map((permission) => {
										return (
											<Badge variant='secondary' className='capitalize text-[0.625rem]'>
												{permission}
											</Badge>
										);
									})}
								</div>
							</div>

							<div>
								<span>Documents</span>
								<div className='flex gap-1'>
									{['create', 'update', 'read', 'delete'].map((permission) => {
										return (
											<Badge variant='secondary' className='capitalize text-[0.625rem]'>
												{permission}
											</Badge>
										);
									})}
								</div>
							</div>
						</div>
					)}

					{currentRole === 'admin' && selectedRole === 'basic' && (
						<Badge variant='secondary' className='mr-4'>
							Note: Changing this profile to a Basic Role will instantly revoke their
							access to system settings.
						</Badge>
					)}
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
