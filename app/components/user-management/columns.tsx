import { type ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import type { User } from '@/types/user';
import ArrowUpDown from '@/components/icons/arrow-up-down';
import MoreHorizontal from '@/components/icons/more-horizontal';
import MailAccount from '../icons/mail-account';
import GoogleIcon from '../icons/google';
import UserIcon from '../icons/user';
import { auth } from '@/lib/firebase';
import Lock from '../icons/lock';
import { useAuthStore } from '@/store/useAuthStore';

interface ColumnActions {
	onResetPassword: (user: User) => void;
	onChangeEmail: (user: User) => void;
	onCancelDeletion: (user: User) => void;
	onDisableUser: (user: User) => void;
	onDeleteUser: (user: User) => void;
}

function getUserStatus(status: string) {}

export function getUserColumns(actions: ColumnActions): ColumnDef<User>[] {
	return [
		{
			accessorKey: 'email',
			header: ({ column }) => (
				<div className='flex items-center gap-x-1.5'>
					<UserIcon className='size-4' /> User
				</div>
			),
			cell: ({ row }) => {
				const user = row.original;

				const display = user?.user_name ? user.user_name : user.email;

				const isYou = auth.currentUser?.email === user.email;

				return (
					<div className='flex items-center gap-2'>
						<span>{display}</span>
						{isYou && <span className='italic text-black/65'>You</span>}
					</div>
				);
			}
		},

		{
			header: 'Privileges',
			cell: ({ row }) => {
				const user = row.original;

				return (
					<Badge
						variant='default'
						className={`capitalize ${user.account_access.role === 'superadmin' ? 'bg-red-400' : user.account_access.role === 'admin' ? 'bg-blue-400' : ''}`}
						style={{ textTransform: 'capitalize' }}
					>
						{user.account_access.role === 'basic'
							? 'App Member'
							: user.account_access.role}
					</Badge>
				);
			}
		},

		{
			header: 'Provider',
			cell: ({ row }) => {
				const isSuperAdmin = useAuthStore((state) => state.isSuperAdmin);
				const user = row.original;
				const provider = user.providerId;

				return user.account_access.role === 'superadmin' ? (
					<Lock className='size-4 self-center' />
				) : (
					<div className='flex flex-1'>
						{provider === 'password' && <MailAccount className='size-5 self-center' />}
						{provider === 'google.com' && <GoogleIcon className='size-5 self-center' />}
					</div>
				);
			}
		},

		{
			header: 'Status',
			cell: ({ row }) => {
				const user = row.original;
				const status = user.status;
				const role = user.account_access.role;

				const isSuperAdmin = role === 'superadmin';
				return isSuperAdmin ? (
					<Lock className='size-4 self-center' />
				) : (
					<Badge
						className={`${status === 'DISABLED' ? 'bg-neutral-500' : status === 'PENDING_DELETION' ? 'bg-orange-400' : 'bg-green-600'}`}
						style={{ textTransform: 'capitalize' }}
					>
						{status === 'DISABLED'
							? 'Suspended'
							: status === 'PENDING_DELETION'
								? 'Pending Deletion'
								: 'Active'}
					</Badge>
				);
			}
		},
		{
			accessorKey: 'metadata.creationTime',
			id: 'creationTime',
			header: ({ column }) => (
				<Button
					variant='ghost'
					onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
				>
					Created At
					<ArrowUpDown />
				</Button>
			),
			cell: ({ row }) => {
				const user = row.original;
				const isSuperAdmin = user.account_access.role === 'superadmin';

				const date = new Date(row.getValue('creationTime'));

				return isSuperAdmin ? (
					<Lock className='size-4 self-center' />
				) : (
					date.toLocaleDateString('en-US', {
						year: 'numeric',
						month: 'short',
						day: 'numeric'
					})
				);
			}
		},
		{
			id: 'actions',
			header: 'Actions',
			cell: ({ row }) => {
				const user = row.original;
				const isDisabled = user.account_disable;
				const isSuperAdmin = user.account_access.role === 'superadmin';

				const isOAuthUser = user.providerId === 'google.com';
				const isPendingDeletion = user.status === 'PENDING_DELETION';
				return isSuperAdmin || auth.currentUser?.email === user.email ? (
					<Lock className='size-4 self-center' />
				) : (
					<DropdownMenu>
						<DropdownMenuTrigger
							render={(props) => (
								<Button {...props} variant='ghost' className={`h-8 w-8 p-0`}>
									<MoreHorizontal />
								</Button>
							)}
						></DropdownMenuTrigger>
						<DropdownMenuContent align='end'>
							<DropdownMenuGroup>
								<DropdownMenuLabel>Actions</DropdownMenuLabel>
								<DropdownMenuSeparator />
								{!isOAuthUser && (
									<>
										<DropdownMenuItem onClick={() => actions.onResetPassword(user)}>
											Reset Password
										</DropdownMenuItem>
									</>
								)}
								{isPendingDeletion && (
									<>
										<DropdownMenuItem
											onClick={() => actions.onCancelDeletion(user)}
											className={isPendingDeletion ? '' : ''}
										>
											Cancel Deletion
										</DropdownMenuItem>
									</>
								)}

								<DropdownMenuItem
									onClick={() => actions.onDisableUser(user)}
									className={isDisabled ? '' : ''}
								>
									{isDisabled ? 'Enable User' : 'Disable User'}
								</DropdownMenuItem>

								<DropdownMenuItem
									onClick={() => actions.onDeleteUser(user)}
									className='text-destructive focus:text-destructive'
								>
									Delete User
								</DropdownMenuItem>
							</DropdownMenuGroup>
						</DropdownMenuContent>
					</DropdownMenu>
				);
			}
		}
	];
}
