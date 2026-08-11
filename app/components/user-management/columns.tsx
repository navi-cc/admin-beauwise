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
import UserRoundCog from '../ui/user-round-cog';
import { Tooltip, TooltipTrigger, TooltipContent } from '../ui/tooltip';
import { Mail } from '../icons/mail';
import MailAccount from '../icons/mail-account';
import GoogleIcon from '../icons/google';

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
				<Button
					variant='ghost'
					onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
				>
					Email
					<ArrowUpDown />
				</Button>
			),
			cell: ({ row }) => {
				const user = row.original;
				const isAdmin = user.account_access.roles === 'admin';

				return (
					<Tooltip>
						<TooltipTrigger>
							<div className='flex items-center gap-2'>
								<span>{row.getValue('email')}</span>
								{isAdmin && <UserRoundCog className='h-4 w-4 text-primary' />}
							</div>
						</TooltipTrigger>

						<TooltipContent>Admin</TooltipContent>
					</Tooltip>
				);
			}
		},

		{
			header: 'Provider',
			cell: ({ row }) => {
				const user = row.original;

				const provider = user.providerId;

				return (
					<div className='flex flex-1'>
						{provider === 'password' && <MailAccount className='size-5 self-center' />}
						{provider === 'google.com' && <GoogleIcon className='size-5 self-center' />}
					</div>
				);
			}
		},

		{
			accessorKey: 'account_disable',
			header: 'Status',
			cell: ({ row }) => {
				const accountDisable = row.getValue('account_disable');
				const status = row.original.status;

				return (
					<Badge
						variant={!accountDisable ? 'default' : 'secondary'}
						style={{ textTransform: 'capitalize' }}
					>
						{!status
							? !accountDisable
								? 'active'
								: 'disabled'
							: status.toString().replaceAll('_', ' ').toLowerCase()}
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
				const date = new Date(row.getValue('creationTime'));

				return date.toLocaleDateString('en-US', {
					year: 'numeric',
					month: 'short',
					day: 'numeric'
				});
			}
		},
		{
			id: 'actions',
			header: 'Actions',
			cell: ({ row }) => {
				const user = row.original;
				const isDisabled = user.account_disable;
				const isAdmin = user.account_access.roles === 'admin';
				const isOAuthUser = user.providerId === 'google.com';
				const isPendingDeletion = user.status === 'PENDING_DELETION';
				return (
					<DropdownMenu>
						<DropdownMenuTrigger
							render={(props) => (
								<Button
									{...props}
									variant='ghost'
									className={`h-8 w-8 p-0 ${isAdmin ? 'pointer-events-none' : 'pointer-events-auto'}`}
								>
									<span className='sr-only'>Open menu</span>
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
