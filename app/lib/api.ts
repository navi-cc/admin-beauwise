import type { User } from '@/types/user';
import { auth } from './firebase';

// Eto ung base url for dev environment
export const API_BASE_URL = import.meta.env.DEV
	? 'http://127.0.0.1:5001/beauwise-1687a/asia-east2/admin'
	: 'https://asia-east2-beauwise-1687a.cloudfunctions.net/admin';

const controller = new AbortController();
const { signal } = controller;

const timeout = 5000;
export const getUsers =
	(maxPage: number, nextPageToken?: string | null, pageCount?: number) => async () => {
		const token = await auth.currentUser?.getIdToken();

		const params = new URLSearchParams({
			maxPage: maxPage.toString()
		});

		if (nextPageToken) {
			params.append('nextPageToken', nextPageToken);
		}

		if (pageCount !== undefined && pageCount > 0) {
			params.append('pageCount', pageCount.toString());
		}

		const response = await fetch(`${API_BASE_URL}/users?${params.toString()}`, {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${token}`
			}
		});

		if (!response.ok) {
			throw new Error('Failed to fetch users');
		}

		return response.json();
	};

export const updateUserStatus = async function ({
	user,
	status
}: {
	user: User;
	status: string;
}) {
	const userId = user.id;
	const isUpdatingUserAdmin =
		user.account_access.role === 'admin' || user.account_access.role === 'superadmin';

	const url = !isUpdatingUserAdmin
		? `${API_BASE_URL}/users/${userId}/status`
		: `${API_BASE_URL}/users/admin/${userId}/status`;

	const token = await auth.currentUser?.getIdToken();
	const timeoutId = setTimeout(() => controller.abort(), timeout);

	let result = null;
	try {
		const response = await fetch(url, {
			method: 'PATCH',
			signal,
			headers: {
				Authorization: `Bearer ${token}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ updatedItem: status.replaceAll(' ', '_').toUpperCase() })
		});

		result = await response.json();

		if (!response.ok) {
			throw new Error(`${result.message}`);
		}
	} catch (error: any) {
		let message = 'Something went wrong. Please try again.';

		if (error.message) {
			message = error.message;
		}

		if (error.name === 'AbortError') {
			console.log('lolol haha');

			message = 'Things are running a bit slow. Please try again';
		}

		throw new Error(message);
	} finally {
		clearTimeout(timeoutId);
	}

	return result;
};

export const updateUserRole = async function ({
	user,
	role
}: {
	user: User;
	role: string;
}) {
	const userId = user.id;
	const url = `${API_BASE_URL}/users/${userId}/role`;

	const token = await auth.currentUser?.getIdToken();
	const timeoutId = setTimeout(() => controller.abort(), timeout);
	let result = null;

	try {
		const response = await fetch(url, {
			signal,
			method: 'PATCH',
			headers: {
				Authorization: `Bearer ${token}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ updatedItem: role })
		});

		result = await response.json();

		if (!response.ok) {
			throw new Error(`${result.message}`);
		}
	} catch (error: any) {
		let message = 'Something went wrong. Please try again.';

		if (error.message) {
			message = error.message;
		}

		if (error.name === 'AbortError') {
			message = 'Things are running a bit slow. Please try again';
		}

		throw new Error(message);
	} finally {
		clearTimeout(timeoutId);
	}

	return result;
};

export const deleteUser = async function ({
	userId,
	role
}: {
	userId: string;
	role: string;
}) {
	const token = await auth.currentUser?.getIdToken();
	const url =
		role === 'basic'
			? `${API_BASE_URL}/users/${userId}`
			: `${API_BASE_URL}/users/admin/${userId}`;

	const timeoutId = setTimeout(() => controller.abort(), timeout);
	let result = null;

	try {
		const response = await fetch(url, {
			signal,
			method: 'DELETE',
			headers: {
				Authorization: `Bearer ${token}`
			}
		});

		result = await response.json();

		if (!response.ok) {
			throw new Error(`${result.message}`);
		}
	} catch (error: any) {
		let message = 'Something went wrong. Please try again.';

		if (error.message) {
			message = error.message;
		}

		if (error.name === 'AbortError') {
			message = 'Things are running a bit slow. Please try again';
		}

		throw new Error(message);
	} finally {
		clearTimeout(timeoutId);
	}

	return result;
};

export const addUser = async function ({
	email,
	password,
	role
}: {
	email: string;
	password: string;
	role: string;
}) {
	const token = await auth.currentUser?.getIdToken();
	const url = role === 'basic' ? `${API_BASE_URL}/users` : `${API_BASE_URL}/users/admin`;

	const timeoutId = setTimeout(() => controller.abort(), timeout);
	let result = null;

	try {
		const response = await fetch(url, {
			signal,
			method: 'POST',
			headers: {
				Authorization: `Bearer ${token}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ newItem: { email, password } })
		});

		result = await response.json();

		if (!response.ok) {
			throw new Error(result.message);
		}
	} catch (error: any) {
		let message = 'Something went wrong. Please try again.';

		if (error.message) {
			message = error.message;
		}

		if (error.name === 'AbortError') {
			message = 'Things are running a bit slow. Please try again';
		}

		throw new Error(message);
	} finally {
		clearTimeout(timeoutId);
	}

	return result;
};

export const resetUserPassword = async function ({
	userId,
	status
}: {
	userId: string;
	status: boolean;
}) {
	const token = await auth.currentUser?.getIdToken();
	const response = await fetch(`${API_BASE_URL}/users/${userId}/reset`, {
		method: 'PATCH',
		headers: {
			Authorization: `Bearer ${token}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ updatedItem: status })
	});

	return response.ok;
};
