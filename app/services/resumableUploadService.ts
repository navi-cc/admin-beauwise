import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';
import { useUploadStore } from '@/store/useUploadStore';

export async function startResumableUpload(uploadId: string): Promise<void> {
	const store = useUploadStore.getState();
	const item = store.uploads[uploadId];

	if (
		!item ||
		item.status === 'completed' ||
		(item.status === 'uploading' && item.uploadTask)
	) {
		console.log('upload not started');
		console.log('upload not started because of', item);
		console.log('upload not started because of', item.status);
		console.log('upload not started because of', item.uploadTask);

		return;
	}

	return new Promise((_, reject) => {
		try {
			const storageRef = ref(storage, item.storagePath);
			const uploadTask = uploadBytesResumable(storageRef, item.file);

			store.setUploadTask(uploadId, uploadTask);

			console.log('upload started');

			uploadTask.on(
				'state_changed',
				(snapshot) => {
					const { bytesTransferred, totalBytes } = snapshot;
					useUploadStore
						.getState()
						.updateProgress(uploadId, bytesTransferred, totalBytes);
				},
				(error) => {
					let errorMessage = error.message;
					if (error.code === 'storage/canceled') {
						useUploadStore.getState().setStatus(uploadId, 'cancelled');
					} else {
						if (error.code === 'storage/retry-limit-exceeded') {
							errorMessage =
								'Network retry limit exceeded. Please click retry when online.';
						}
						useUploadStore.getState().setStatus(uploadId, 'error', { errorMessage });
					}
					reject(error);
				}
			);
		} catch (err: any) {
			useUploadStore.getState().setStatus(uploadId, 'error', {
				errorMessage: err.message || 'Failed to start upload'
			});
			reject(err);
		}
	});
}
