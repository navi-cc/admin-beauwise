import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';

const BASE_PATH = 'learn';
const ITEMS_FOLDER = `${BASE_PATH}/cosmetic_guides`;

export const storageService = {
	async uploadItemImage(itemId: string, file: File): Promise<string> {
		const extension = file.name.split('.').pop() || 'jpg';
		const storageRef = ref(storage, `${ITEMS_FOLDER}/${itemId}.${extension}`);
		const snapshot = await uploadBytes(storageRef, file);
		return getDownloadURL(snapshot.ref);
	}
};

export const mythFactStorageService = {
	async uploadDisplayImage(itemId: string, file: File): Promise<string> {
		const extension = file.name.split('.').pop() || 'jpg';
		const storageRef = ref(storage, `${BASE_PATH}/${itemId}/display_image.${extension}`);
		const snapshot = await uploadBytes(storageRef, file);
		return getDownloadURL(snapshot.ref);
	},

	async uploadVideoGuide(itemId: string, file: File): Promise<string> {
		const extension = file.name.split('.').pop() || 'mp4';
		const storageRef = ref(storage, `${BASE_PATH}/${itemId}/video_guide.${extension}`);
		const snapshot = await uploadBytes(storageRef, file);
		return getDownloadURL(snapshot.ref);
	},

	async uploadTopicImage(itemId: string, topicId: string, file: File): Promise<string> {
		const extension = file.name.split('.').pop() || 'jpg';
		const storageRef = ref(storage, `${BASE_PATH}/${itemId}/${topicId}.${extension}`);
		const snapshot = await uploadBytes(storageRef, file);
		return getDownloadURL(snapshot.ref);
	}
};
