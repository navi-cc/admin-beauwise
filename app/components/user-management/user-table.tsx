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
	AuditLogEntry
} from '@/types/user';
import type { OnChangeFn, PaginationState } from '@tanstack/react-table';
interface UserManagementTableProps {
	users: User[];

	onResetPassword: (payload: User) => void;
	onChangeEmail: (payload: ChangeEmailPayload) => void;
	onDisableUser: (payload: DisableUserPayload) => void;
	onDeleteUser: (payload: DeleteUserPayload) => void;

	isUserTableLoading: boolean;
	isError: boolean;
	isRefetchError: boolean;
	retry: () => void;
	pageCount: number;
	pageIndex: number;
	pageSize: number;
	onPaginationChange: OnChangeFn<PaginationState>;
}
export function UserManagementTable({
	users,
	onResetPassword,
	pageCount,
	pageIndex,
	pageSize,
	onPaginationChange,
	onChangeEmail,
	onDisableUser,
	onDeleteUser,

	isUserTableLoading,
	isError,
	isRefetchError,
	retry
}: UserManagementTableProps) {
	const [selectedUser, setSelectedUser] = useState<User | null>(null);
	const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
	const [emailDialogOpen, setEmailDialogOpen] = useState(false);
	const [disableDialogOpen, setDisableDialogOpen] = useState(false);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

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
				pageCount={pageCount}
				pageIndex={pageIndex}
				pageSize={pageSize}
				onPaginationChange={onPaginationChange}
				columns={columns}
				data={users}
				searchKey='email'
				searchPlaceholder='Filter by email...'
			/>

			<ResetPasswordDialog
				user={selectedUser}
				open={passwordDialogOpen}
				onOpenChange={setPasswordDialogOpen}
				onSubmit={onResetPassword}
			/>

			<ChangeEmailDialog
				user={selectedUser}
				open={emailDialogOpen}
				onOpenChange={setEmailDialogOpen}
				onSubmit={onChangeEmail}
			/>

			<DisableUserDialog
				user={selectedUser}
				open={disableDialogOpen}
				onOpenChange={setDisableDialogOpen}
				onConfirm={onDisableUser}
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
