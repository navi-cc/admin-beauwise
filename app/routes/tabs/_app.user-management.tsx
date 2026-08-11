import UserMultipleIcon from '@/components/icons/user-multiple';
import { UserManagementTable } from '@/components/user-management/user-table';
import { deleteUser, getUsers, updateUserStatus } from '@/lib/api';
import { auth } from '@/lib/firebase';
import type { User } from '@/types/user';
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

	const deleteUserMutate = useMutation({
		mutationFn: deleteUser,
		onSuccess: () => {
			toast.success('The user has been successfully removed.');
			queryClient.invalidateQueries({ queryKey: ['users'] });
		}
	});

	const onResetPassword = async (user: User) => {
		await sendPasswordResetEmail(auth, user.email);
		toast.success(`The reset password link is successfully sent to ${user.email}.`);
	};

	const onChangeEmail = (data: any) => {
		console.log('email', data);
	};

	const onCancelDeletion = (data: any) => {
		data.status = 'remove_pending_deletion';
		toast.promise(accountStatusChange.mutateAsync(data), {
			position: 'bottom-right',
			loading: 'Updating account status...',
			success: () => 'Account status updated.',
			error: 'Your changes were not saved. Please try again'
		});
	};

	const onDisableUser = (data: any) => {
		data.status = 'disabled';
		toast.promise(accountStatusChange.mutateAsync(data), {
			position: 'bottom-right',
			loading: 'Updating account status...',
			success: () => 'Account status updated.',
			error: 'Your changes were not saved. Please try again'
		});
	};

	const onDeleteUser = ({ userId }: { userId: string }) => {
		deleteUserMutate.mutate({ userId });
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
						{data?.length > 0 && <span className='font-medium'>{data.length} total</span>}
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
				onChangeEmail={onChangeEmail}
				onCancelDeletion={onCancelDeletion}
				onResetPassword={onResetPassword}
				onDisableUser={onDisableUser}
			/>
		</div>
	);
}
