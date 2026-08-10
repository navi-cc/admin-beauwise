import { auth } from './firebase';

// Eto ung base url for dev environment
export const API_BASE_URL = import.meta.env.DEV
	? 'http://127.0.0.1:5001/beauwise-1687a/us-central1/admin'
	: 'https://us-central1-beauwise-1687a.cloudfunctions.net/admin';

export const getUsers =
	(maxPage: number, nextPage: string | null, pageCount: number) => async () => {
		const token = await auth.currentUser?.getIdToken();
		const respone = await fetch(
			`${API_BASE_URL}/users?maxPage=${maxPage}&nextPageToken=${nextPage}&pageCount=${pageCount}`,
			{
				method: 'GET',
				headers: {
					Authorization: `Bearer ${token}`
				}
			}
		);

		return respone.json();
	};

export const updateUserStatus = async function ({
	userId,
	status
}: {
	userId: string;
	status: boolean;
}) {
	const token = await auth.currentUser?.getIdToken();
	const respone = await fetch(`${API_BASE_URL}/users/${userId}/disable`, {
		method: 'PATCH',
		headers: {
			Authorization: `Bearer ${token}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ updatedItem: status })
	});

	return respone.ok;
};

export const deleteUser = async function ({ userId }: { userId: string }) {
	const token = await auth.currentUser?.getIdToken();
	const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
		method: 'DELETE',
		headers: {
			Authorization: `Bearer ${token}`
		}
	});

	return response.ok;
};

export const resetUserPassword = async function ({
	userId,
	status
}: {
	userId: string;
	status: boolean;
}) {
	const token = await auth.currentUser?.getIdToken();
	const respone = await fetch(`${API_BASE_URL}/users/${userId}/reset`, {
		method: 'PATCH',
		headers: {
			Authorization: `Bearer ${token}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ updatedItem: status })
	});

	return respone.ok;
};
