import BadgeAlert from '@/components/icons/badge-alert';
import Check from '@/components/icons/check';
import CheckMarkBadge from '@/components/icons/checkmark-badge';
import UserMultipleIcon from '@/components/icons/user-multiple';
import { UserManagementTable } from '@/components/user-management/user-table';
import { addUser as addNewUser, deleteUser, getUsers, updateUserStatus } from '@/lib/api';
import { auth } from '@/lib/firebase';
import type {
	AddUserPayload,
	CancelDeletionPayload,
	DeleteUserPayload,
	DisableUserPayload,
	User
} from '@/types/user';
import {
	keepPreviousData,
	useMutation,
	useQuery,
	useQueryClient
} from '@tanstack/react-query';
import type { PaginationState } from '@tanstack/react-table';
import { sendPasswordResetEmail } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function UserManagement() {
	const queryClient = useQueryClient();
	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: 10
	});

	const [pageTokens, setPageTokens] = useState<Record<number, string | undefined>>({
		0: undefined
	});
	const [totalPageCount, setTotalPageCount] = useState<number>(0);

	const currentToken = pageTokens[pagination.pageIndex];

	const {
		data,
		isFetching: isUserTableLoading,
		isError,
		isRefetchError,
		refetch,
		isSuccess
	} = useQuery({
		queryKey: ['users', pagination.pageIndex, pagination.pageSize],
		queryFn: getUsers(
			pagination.pageSize,
			currentToken,
			totalPageCount > 0 ? totalPageCount : undefined
		),
		placeholderData: keepPreviousData
	});

	useEffect(() => {
		if (data) {
			if (data.pageCount) {
				setTotalPageCount(data.pageCount);
			}
			if (data.nextPageToken !== undefined) {
				setPageTokens((prev) => ({
					...prev,
					[pagination.pageIndex + 1]: data.nextPageToken ?? undefined
				}));
			}
		}
	}, [data, pagination.pageIndex]);

	const handlePaginationChange = (updater: any) => {
		setPagination((prev) => {
			const next = typeof updater === 'function' ? updater(prev) : updater;
			if (next.pageSize !== prev.pageSize) {
				setPageTokens({ 0: undefined });
				setTotalPageCount(0);
				return { pageIndex: 0, pageSize: next.pageSize };
			}
			return next;
		});
	};

	const handlePageSize = (size: number) => () => {
		setPagination((prev) => ({
			...prev,
			pageSize: size
		}));

		setTotalPageCount(0);
	};

	const accountStatusChange = useMutation({
		mutationFn: updateUserStatus,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['users'] });
		}
	});

	const addUser = useMutation({
		mutationFn: addNewUser,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['users'] });
		}
	});

	const deleteUserMutate = useMutation({
		mutationFn: deleteUser,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['users'] });
		}
	});

	const onResetPassword = async (user: User) => {
		const currentSignedInClaims = (await auth.currentUser?.getIdTokenResult())?.claims;
		const isAllowed =
			(currentSignedInClaims?.role === 'admin' ||
				currentSignedInClaims?.role === 'superadmin') &&
			user.account_access.role === 'basic';

		try {
			if (isAllowed) {
				await sendPasswordResetEmail(auth, user.email);
				toast.success(`Password Reset Link Sent`, {
					position: 'top-right',
					description: `The reset password link is successfully sent to ${user.email}.`,
					descriptionClassName: 'text-red',
					duration: 12000,
					icon: <CheckMarkBadge className='text-green-500 size-5' />
				});
			} else {
				throw new Error('Requested action is not allowed. Please try again');
			}
		} catch (err: any) {
			let message = 'The password reset link is not sent. Please try again.';

			if (err?.message) {
				message = err?.message;
			}

			toast.error('Password Reset Action Failed', {
				description: message,
				position: 'top-right',
				duration: 12000,
				icon: <BadgeAlert className='text-red-500 size-5' />
			});
		}
	};

	const onCancelDeletion = (data: CancelDeletionPayload) => {
		data.status = 'remove_pending_deletion';
		accountStatusChange.mutate(data, {
			onSuccess: () => {
				toast.success(`User Account Deletion Cancelled`, {
					position: 'top-right',
					description: `The ${data.user.email} account deletion is successfully cancelled.`,
					descriptionClassName: 'text-red',
					duration: 12000,
					icon: <CheckMarkBadge className='text-green-500 size-5' />
				});
			},

			onError: (err) => {
				let message = 'Something went wrong. Please try again.';

				if (err?.message) {
					message = err.message;
				}

				toast.error('Account Delete Cancellation Action Failed', {
					description: message,
					position: 'top-right',
					duration: 12000,
					icon: <BadgeAlert className='text-red-500 size-5' />
				});
			}
		});
	};

	const onDisableUser = (data: DisableUserPayload) => {
		accountStatusChange.mutate(data, {
			onSuccess: (result) => {
				let message = 'Account status updated.';

				if (result?.message) {
					message = '';
				}

				toast.success('User Status Updated', {
					position: 'top-right',
					description: `${data.user?.user_name ? data.user.user_name : data.user.email} status has been updated to ${data.status}`,
					descriptionClassName: 'text-red',
					duration: 20000,
					icon: <CheckMarkBadge className='text-green-500 size-5' />
				});
			},
			onError: (err) => {
				let message = 'Your changes were not saved. Please try again';

				if (err.message) {
					message = err.message;
				}

				toast.error(message, {
					position: 'top-right',
					duration: 12000
				});
			}
		});
	};

	const onDeleteUser = (payload: DeleteUserPayload) => {
		deleteUserMutate.mutate(
			{ userId: payload.user.id, role: payload.user.account_access.role },
			{
				onSuccess: () => {
					toast.success(
						`${payload.user.user_name ? payload.user.user_name : payload.user.email} is successfully deleted.`,
						{
							position: 'top-right',
							duration: 12000
						}
					);
				},

				onError: (err) => {
					let message = `${payload.user.user_name ? payload.user.user_name : payload.user.email} is not deleted. Please try again`;

					if (err.message) {
						message = err.message;
					}

					toast.error(message, {
						position: 'top-right',
						duration: 12000
					});
				}
			}
		);
	};

	const onAddUser = (payload: AddUserPayload) => {
		addUser.mutate(
			{ ...payload },
			{
				onSuccess: (result) => {
					if (result?.code === 'invalid_input') {
						throw new Error(`${payload.email} is not created. Please try again`);
					}

					toast.success(`${payload.email} is successfully created.`, {
						position: 'top-right',
						duration: 12000
					});
				},
				onError: (err) => {
					let message = `${payload.email} is not created. Please try again`;

					if (err.message) {
						message = err.message;
					}

					toast.error(message, {
						position: 'top-right',
						duration: 12000
					});
				}
			}
		);
	};

	const retry = () => refetch();

	return (
		<div className='flex flex-col gap-y-2.5'>
			<div>
				<div className='text-2xl text-primary font-bold flex items-center gap-2'>
					<UserMultipleIcon className='size-6' />
					User Management
				</div>

				{isSuccess && (
					<p className='text-sm text-muted-foreground mt-1'>
						Manage users{' '}
						{data?.totalUsers > 0 && (
							<span className='font-medium'>{data?.totalUsers} total</span>
						)}
					</p>
				)}
			</div>
			<UserManagementTable
				isError={isError}
				isUserTableLoading={isUserTableLoading}
				isRefetchError={isRefetchError}
				onDeleteUser={onDeleteUser}
				retry={retry}
				users={data?.users ?? []}
				onPaginationChange={handlePaginationChange}
				pageCount={totalPageCount}
				pageIndex={pagination.pageIndex}
				pageSize={pagination.pageSize}
				onPageSizeChange={handlePageSize}
				onCancelDeletion={onCancelDeletion}
				onResetPassword={onResetPassword}
				onDisableUser={onDisableUser}
				onAddUser={onAddUser}
			/>
		</div>
	);
}
