import { useState, useMemo } from 'react';
import { DataTable } from './data-table';
import { getUserColumns } from './columns';
import { ResetPasswordDialog } from './reset-password-dialog';
import { ChangeEmailDialog } from './change-email-dialog';
import { DisableUserDialog } from './disable-user-dialog';
import { DeleteUserDialog } from './delete-user-dialog';
import { ChangeRoleDialog } from './change-role-dialog';
import { ForceLogoutDialog } from './force-logout-dialog';
import { AuditLogDialog } from './audit-dialog';

import type {
	User,
	ChangePasswordPayload,
	ChangeEmailPayload,
	DisableUserPayload,
	DeleteUserPayload,
	ChangeRolePayload,
	ForceLogoutPayload,
	AuditLogEntry,
	CancelDeletionPayload,
	AddUserPayload
} from '@/types/user';
import type { OnChangeFn, PaginationState } from '@tanstack/react-table';
import { CancelDeletionDialog } from './cancel-deletion-dialog';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Button } from '../ui/button';
import ChevronDown from '../icons/chevron-down';
import { AddUserDialog } from './add-user-dialog';
interface UserManagementTableProps {
	users: User[];

	onResetPassword: (payload: User) => void;

	onCancelDeletion: (payload: CancelDeletionPayload) => void;
	onDisableUser: (payload: DisableUserPayload) => void;
	onDeleteUser: (payload: DeleteUserPayload) => void;
	onAddUser: (payload: AddUserPayload) => void;
	isUserTableLoading: boolean;
	isError: boolean;
	isRefetchError: boolean;
	retry: () => void;
	pageCount: number;
	pageIndex: number;
	pageSize: number;
	onPageSizeChange: (size: number) => () => void;
	onPaginationChange: OnChangeFn<PaginationState>;
}
export function UserManagementTable({
	users,
	onResetPassword,
	pageCount,
	pageIndex,
	pageSize,
	onPaginationChange,

	onCancelDeletion,
	onDisableUser,
	onAddUser,
	onDeleteUser,
	onPageSizeChange,
	isUserTableLoading,
	isError,
	isRefetchError,
	retry
}: UserManagementTableProps) {
	const [selectedUser, setSelectedUser] = useState<User | null>(null);
	const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
	const [emailDialogOpen, setEmailDialogOpen] = useState(false);
	const [cancelDeletionDialogOpen, setCancelDeletionDialogOpen] = useState(false);
	const [disableDialogOpen, setDisableDialogOpen] = useState(false);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [addDialogOpen, setAddDialogOpen] = useState(false);
	const columns = useMemo(
		() =>
			getUserColumns({
				onResetPassword: (user) => {
					setSelectedUser(user);
					setPasswordDialogOpen(true);
				},
				onChangeEmail: (user) => {
					setSelectedUser(user);
					setEmailDialogOpen(true);
				},
				onCancelDeletion: (user) => {
					setSelectedUser(user);
					setCancelDeletionDialogOpen(true);
				},
				onDisableUser: (user) => {
					setSelectedUser(user);
					setDisableDialogOpen(true);
				},
				onDeleteUser: (user) => {
					setSelectedUser(user);
					setDeleteDialogOpen(true);
				}
			}),
		[]
	);
	return (
		<>
			<DataTable
				isError={isError}
				isRefetchError={isRefetchError}
				isUserTableLoading={isUserTableLoading}
				retry={retry}
				onPageSizeChange={onPageSizeChange}
				pageCount={pageCount}
				pageIndex={pageIndex}
				pageSize={pageSize}
				onOpenAddDialog={setAddDialogOpen}
				onPaginationChange={onPaginationChange}
				columns={columns}
				data={users}
				searchKey='email'
				searchPlaceholder='Filter by email...'
			/>

			<ResetPasswordDialog
				user={selectedUser as User}
				open={passwordDialogOpen}
				onOpenChange={setPasswordDialogOpen}
				onSubmit={onResetPassword}
			/>

			{/* <ChangeEmailDialog
				user={selectedUser}
				open={emailDialogOpen}
				onOpenChange={setEmailDialogOpen}
				onSubmit={onChangeEmail}
			/> */}

			<CancelDeletionDialog
				user={selectedUser}
				open={cancelDeletionDialogOpen}
				onOpenChange={setCancelDeletionDialogOpen}
				onConfirm={onCancelDeletion}
			/>

			<DisableUserDialog
				user={selectedUser}
				open={disableDialogOpen}
				onOpenChange={setDisableDialogOpen}
				onConfirm={onDisableUser}
			/>

			<AddUserDialog
				open={addDialogOpen}
				onOpenChange={setAddDialogOpen}
				onConfirm={onAddUser}
			/>

			<DeleteUserDialog
				user={selectedUser}
				open={deleteDialogOpen}
				onOpenChange={setDeleteDialogOpen}
				onConfirm={onDeleteUser}
			/>
		</>
	);
}
