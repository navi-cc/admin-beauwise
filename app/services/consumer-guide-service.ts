import { doc, updateDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { type Ingredient, type IngredientFormValues } from '@/zod/ingredients';
import { generateId } from '@/utils/generate-id';
import { API_BASE_URL } from '@/lib/api';
import type { ConsumerGuide, ConsumerGuideFormValues } from '@/zod/consumer-guide';

const COLLECTION = 'consumer_guides';

export interface PaginationInfo {
	cursor: string;
	total_documents: number;
	total_pages: number;
}

export interface PaginatedResult {
	data: Ingredient[];
	pagination: PaginationInfo;
}

const controller = new AbortController();
const { signal } = controller;

const timeout = 5000;
export const consumerGuideService = {
	async getPaginated(
		pageNumber: number,
		pageSize: number,
		filter: string,
		query?: string
	): Promise<PaginatedResult> {
		const url = new URL(`${API_BASE_URL}/learn/consumer-guides`, window.location.origin);
		url.searchParams.append('pageSize', pageSize.toString());
		url.searchParams.append('pageNumber', pageNumber.toString());

		if (query?.length) {
			url.searchParams.append('q', query);
		}

		if (filter === 'deleted' || filter === 'active') {
			const status = filter === 'deleted' ? 'true' : 'false';
			url.searchParams.append('deleted', status);
		}

		const token = await auth.currentUser?.getIdToken();
		const response = await fetch(url.toString(), {
			headers: {
				Authorization: `Bearer ${token}`
			}
		});

		if (!response.ok) {
			throw new Error('Failed to fetch items from server');
		}

		return response.json();
	},

	async add(data: ConsumerGuideFormValues): Promise<void> {
		const url = new URL(`${API_BASE_URL}/learn/consumer-guides`, window.location.origin);

		const consumerGuide: ConsumerGuide = {
			...data,
			is_deleted: false
		};

		const token = await auth.currentUser?.getIdToken();

		const timeoutId = setTimeout(() => controller.abort(), timeout);
		let result = null;

		try {
			const response = await fetch(url.toString(), {
				signal,
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`
				},
				body: JSON.stringify({
					newItem: { ...consumerGuide }
				})
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
	},

	async update(id: string, data: Partial<IngredientFormValues>): Promise<void> {
		const url = new URL(
			`${API_BASE_URL}/learn/consumer-guides/${id}`,
			window.location.origin
		);

		const token = await auth.currentUser?.getIdToken();
		const timeoutId = setTimeout(() => controller.abort(), timeout);
		let result = null;

		try {
			const response = await fetch(url.toString(), {
				signal,
				method: 'PUT',
				body: JSON.stringify({
					updatedItem: { id, ...data }
				}),
				headers: {
					Authorization: `Bearer ${token}`,
					'Content-Type': 'application/json'
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
	},

	async softDelete(id: string): Promise<void> {
		const docRef = doc(db, COLLECTION, id);
		await updateDoc(docRef, { is_deleted: true });
	},

	async restore(id: string): Promise<void> {
		const docRef = doc(db, COLLECTION, id);
		await updateDoc(docRef, { is_deleted: false });
	}
};
