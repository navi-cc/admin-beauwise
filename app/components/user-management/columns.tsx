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

interface ColumnActions {
	onResetPassword: (user: User) => void;
	onChangeEmail: (user: User) => void;
	onDisableUser: (user: User) => void;
	onDeleteUser: (user: User) => void;
}
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
			)
		},

		{
			accessorKey: 'account_disable',
			header: 'Status',
			cell: ({ row }) => {
				const accountDisable = row.getValue('account_disable');

				return (
					<Badge
						variant={!accountDisable ? 'default' : 'secondary'}
						style={{ textTransform: 'capitalize' }}
					>
						{!accountDisable ? 'active' : 'disabled'}
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
				const isOAuthUser = user.providerId === 'google.com';
				return (
					<DropdownMenu>
						<DropdownMenuTrigger
							render={(props) => (
								<Button {...props} variant='ghost' className='h-8 w-8 p-0'>
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
