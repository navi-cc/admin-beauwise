import { UserManagementTable } from '@/components/user-management/user-table';
import { deleteUser, getUsers, updateUserStatus } from '@/lib/api';
import { auth } from '@/lib/firebase';
import type { User } from '@/types/user';
import {
	useIsMutating,
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

	const [paginationExtended, setPaginationExtended] = useState({
		nextPage: null,
		pageCount: 0
	});

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
			paginationExtended?.nextPage,
			paginationExtended.pageCount
		)
	});

	const emailChange = useMutation({});
	const passwordChange = useMutation({});
	const accountStatusChange = useMutation({
		mutationFn: updateUserStatus,
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ['users', pagination.pageIndex, pagination.pageSize]
			});
		}
	});

	const deleteUserMutate = useMutation({
		mutationFn: deleteUser,
		onSuccess: () => {
			toast.success('The user has been successfully removed.');
			queryClient.invalidateQueries({
				queryKey: ['users', pagination.pageIndex, pagination.pageSize]
			});
		}
	});

	const onResetPassword = async (data) => {
		await sendPasswordResetEmail(auth, data.email);
		toast.success(`The reset password link is successfully sent to ${data.email}.`);
	};
	const onChangeEmail = (data) => {
		console.log('email', data);
	};
	const onDisableUser = (data) => {
		toast.promise(accountStatusChange.mutateAsync(data), {
			position: 'bottom-right',
			loading: 'Updating account status...',
			success: () => {
				return 'Account status updated.';
			},
			error: 'Your changes is not saved. Please try again'
		});
	};

	const onDeleteUser = ({ userId }: { userId: string }) => {
		deleteUserMutate.mutate({ userId });
	};

	const retry = () => refetch({ throwOnError: true });

	useEffect(() => {
		if (isSuccess) {
			setPaginationExtended((prev) => ({
				...prev,
				nextPage: data?.nextPageToken,
				pageCount: data?.pageCount
			}));
		}
	}, [isSuccess]);

	return (
		<div className='flex flex-col gap-y-2.5'>
			<span>Manage Users</span>
			{isSuccess && (
				<UserManagementTable
					isError={isError}
					isUserTableLoading={isUserTableLoading}
					isRefetchError={isRefetchError}
					onDeleteUser={onDeleteUser}
					retry={retry}
					users={data?.users}
					onPaginationChange={setPagination}
					pageCount={paginationExtended.pageCount}
					pageIndex={pagination.pageIndex}
					pageSize={pagination.pageSize}
					onChangeEmail={onChangeEmail}
					onResetPassword={onResetPassword}
					onDisableUser={onDisableUser}
				/>
			)}
		</div>
	);
}

export function meta() {
	return [{ title: 'BeauWise | Users & Authentication' }];
}
