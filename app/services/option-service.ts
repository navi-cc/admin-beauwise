import { arrayRemove, arrayUnion, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
export interface IngredientsConfig {
	categories: string[];
	best_for: string[];
	common_products: string[];
}
const CONFIG_PATH = 'app_config';
const CONFIG_DOC = 'ingredients_config';
export const optionsService = {
	async getIngredientsConfig(): Promise<IngredientsConfig> {
		const docRef = doc(db, CONFIG_PATH, CONFIG_DOC);
		const docSnap = await getDoc(docRef);
		if (!docSnap.exists()) {
			return {
				categories: [],
				best_for: [],
				common_products: []
			};
		}
		const data = docSnap.data();
		return {
			categories: data.categories ?? [],
			best_for: data.best_for ?? [],
			common_products: data.common_products ?? []
		};
	},

	async addOption(field: keyof IngredientsConfig, value: string): Promise<void> {
		const docRef = doc(db, CONFIG_PATH, CONFIG_DOC);
		await updateDoc(docRef, {
			[field]: arrayUnion(value)
		});
	},

	async deleteOption(field: keyof IngredientsConfig, value: string): Promise<void> {
		const docRef = doc(db, CONFIG_PATH, CONFIG_DOC);
		await updateDoc(docRef, {
			[field]: arrayRemove(value)
		});
	},

	async updateOption(
		field: keyof IngredientsConfig,
		oldValue: string,
		newValue: string
	): Promise<void> {
		if (oldValue === newValue) return;

		const docRef = doc(db, CONFIG_PATH, CONFIG_DOC);
		const docSnap = await getDoc(docRef);

		if (!docSnap.exists()) return;

		const data = docSnap.data();
		const arr: string[] = data[field] || [];
		const index = arr.indexOf(oldValue);
		if (index !== -1) {
			arr[index] = newValue;
			await updateDoc(docRef, {
				[field]: arr
			});
		}
	}
};
