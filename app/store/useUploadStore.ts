import { create } from 'zustand';
import { type UploadTask } from 'firebase/storage';
import { QueryClient } from '@tanstack/react-query';
import { queryClient } from '@/lib/query-client';

export type UploadStatus = 'pending' | 'uploading' | 'completed' | 'error' | 'cancelled';

export interface UploadItem {
	id: string;
	file: File;
	fileName: string;
	fileSize: number;
	fileType: 'image' | 'video';
	previewUrl?: string;
	progress: number;
	bytesTransferred: number;
	totalBytes: number;
	speed: number; // bytes per second
	eta: number; // seconds remaining
	status: UploadStatus;
	errorMessage?: string;
	uploadTask?: UploadTask;
	storagePath: string;
	downloadUrl?: string;
	batchId?: string;
	lastProgressTime?: number;
}

export interface EnqueueUploadPayload {
	id: string;
	file: File;
	fileType: 'image' | 'video';
	storagePath: string;
	batchId?: string;
}

interface UploadStoreState {
	uploads: Record<string, UploadItem>;
	isMinimized: boolean;
	maxConcurrent: number;
	activeUploadsCount: number;
	completedUploadsCount: number;

	// Actions
	enqueueUploads: (payloads: EnqueueUploadPayload[]) => void;
	updateProgress: (id: string, bytesTransferred: number, totalBytes: number) => void;
	setUploadTask: (id: string, task: UploadTask) => void;
	setStatus: (
		id: string,
		status: UploadStatus,
		extra?: { errorMessage?: string; downloadUrl?: string }
	) => void;
	cancelUpload: (id: string) => void;
	retryUpload: (id: string) => void;
	dismissCompleted: () => void;
	toggleMinimized: () => void;
	setIsMinimized: (minimized: boolean) => void;
	invalidationKey: string[];
	setInvalidationKey: (key: string[]) => void;
}

export const useUploadStore = create<UploadStoreState>((set, get) => ({
	uploads: {},
	isMinimized: false,
	maxConcurrent: 3,
	activeUploadsCount: 0,
	completedUploadsCount: 0,

	invalidationKey: [],
	setInvalidationKey: (key: string[]) => set({ invalidationKey: key }),

	enqueueUploads: (payloads) => {
		const currentUploads = { ...get().uploads };

		payloads.forEach((payload) => {
			const previewUrl =
				payload.file.type.startsWith('image/') || payload.file.type.startsWith('video/')
					? URL.createObjectURL(payload.file)
					: undefined;

			currentUploads[payload.id] = {
				id: payload.id,
				file: payload.file,
				fileName: payload.file.name,
				fileSize: payload.file.size,
				fileType: payload.fileType,
				previewUrl,
				progress: 0,
				bytesTransferred: 0,
				totalBytes: payload.file.size,
				speed: 0,
				eta: 0,
				status: 'pending',
				storagePath: payload.storagePath,
				batchId: payload.batchId,
				lastProgressTime: Date.now()
			};
		});

		set({
			uploads: currentUploads,
			isMinimized: false
		});

		recalculateCounts(get, set);
		processQueue(get, set);
	},

	updateProgress: (id, bytesTransferred, totalBytes) => {
		const item = get().uploads[id];
		console.log('is updating');

		if (!item || item.status !== 'uploading') return;

		const now = Date.now();
		const timeDelta = (now - (item.lastProgressTime || now)) / 1000;
		const bytesDelta = bytesTransferred - item.bytesTransferred;

		let speed = item.speed;
		if (timeDelta > 0 && bytesDelta > 0) {
			const currentSpeed = bytesDelta / timeDelta;
			speed = speed === 0 ? currentSpeed : speed * 0.7 + currentSpeed * 0.3; // EWMA smoothing
		}

		const remainingBytes = totalBytes - bytesTransferred;
		const eta = speed > 0 ? Math.ceil(remainingBytes / speed) : 0;
		const progress =
			totalBytes > 0 ? Math.round((bytesTransferred / totalBytes) * 100) : 0;

		set((state) => ({
			uploads: {
				...state.uploads,
				[id]: {
					...state.uploads[id],
					progress,
					bytesTransferred,
					totalBytes,
					speed,
					eta,
					lastProgressTime: now
				}
			}
		}));

		if (bytesTransferred === totalBytes) {
			set((state) => ({
				uploads: {
					...state.uploads,
					[id]: {
						...state.uploads[id],
						status: 'completed'
					}
				}
			}));
			recalculateCounts(get, set);
			processQueue(get, set);
		}
	},

	setUploadTask: (id, task) => {
		set((state) => ({
			uploads: {
				...state.uploads,
				[id]: {
					...state.uploads[id],
					uploadTask: task,
					status: 'uploading',
					lastProgressTime: Date.now()
				}
			}
		}));
		recalculateCounts(get, set);
	},

	setStatus: (id, status, extra) => {
		const item = get().uploads[id];
		if (!item) return;

		// Clean up preview URL on completion or cancel to prevent memory leaks
		if (
			(status === 'completed' || status === 'cancelled') &&
			item.previewUrl &&
			item.previewUrl.startsWith('blob:')
		) {
			URL.revokeObjectURL(item.previewUrl);
		}

		set((state) => ({
			uploads: {
				...state.uploads,
				[id]: {
					...state.uploads[id],
					status,
					errorMessage: extra?.errorMessage ?? state.uploads[id]?.errorMessage,
					downloadUrl: extra?.downloadUrl ?? state.uploads[id]?.downloadUrl,
					progress: status === 'completed' ? 100 : (state.uploads[id]?.progress ?? 0)
				}
			}
		}));

		recalculateCounts(get, set);
		processQueue(get, set);
	},

	cancelUpload: (id) => {
		const item = get().uploads[id];
		if (!item) return;

		if (item.uploadTask && item.status === 'uploading') {
			try {
				item.uploadTask.cancel();
			} catch (err) {
				console.warn('Upload task cancellation error:', err);
			}
		}

		if (item.previewUrl && item.previewUrl.startsWith('blob:')) {
			URL.revokeObjectURL(item.previewUrl);
		}

		set((state) => ({
			uploads: {
				...state.uploads,
				[id]: {
					...state.uploads[id],
					status: 'cancelled'
				}
			}
		}));

		recalculateCounts(get, set);
		processQueue(get, set);
	},

	retryUpload: (id) => {
		const item = get().uploads[id];
		if (!item) return;

		set((state) => ({
			uploads: {
				...state.uploads,
				[id]: {
					...state.uploads[id],
					status: 'pending',
					errorMessage: undefined,
					progress: 0,
					bytesTransferred: 0,
					speed: 0,
					eta: 0,
					uploadTask: undefined,
					lastProgressTime: Date.now()
				}
			}
		}));

		recalculateCounts(get, set);
		processQueue(get, set);
	},

	dismissCompleted: () => {
		set((state) => {
			const nextUploads: Record<string, UploadItem> = {};
			Object.entries(state.uploads).forEach(([id, item]) => {
				if (item.status !== 'completed' && item.status !== 'cancelled') {
					nextUploads[id] = item;
				} else if (item.previewUrl && item.previewUrl.startsWith('blob:')) {
					URL.revokeObjectURL(item.previewUrl);
				}
			});
			return { uploads: nextUploads };
		});

		recalculateCounts(get, set);
	},

	toggleMinimized: () => {
		set((state) => ({ isMinimized: !state.isMinimized }));
	},

	setIsMinimized: (isMinimized) => {
		set({ isMinimized });
	}
}));

function recalculateCounts(
	get: () => UploadStoreState,
	set: (fn: (state: UploadStoreState) => Partial<UploadStoreState>) => void
) {
	const uploads = Object.values(get().uploads);
	const activeUploadsCount = uploads.filter(
		(u) => u.status === 'uploading' || u.status === 'pending'
	).length;
	const completedUploadsCount = uploads.filter((u) => u.status === 'completed').length;

	set({ activeUploadsCount, completedUploadsCount });
}

async function processQueue(
	get: () => UploadStoreState,
	set: (fn: (state: UploadStoreState) => Partial<UploadStoreState>) => void
) {
	const state = get();
	const uploadsList = Object.values(state.uploads);
	const currentlyUploading = uploadsList.filter((u) => u.status === 'uploading').length;
	const availableSlots = state.maxConcurrent - currentlyUploading;

	if (availableSlots <= 0) return;

	const pendingItems = uploadsList
		.filter((u) => u.status === 'pending')
		.slice(0, availableSlots);

	if (pendingItems.length === 0) {
		queryClient.invalidateQueries({ queryKey: state.invalidationKey });

		return;
	}

	const updatedUploads = { ...state.uploads };
	pendingItems.forEach((item) => {
		updatedUploads[item.id] = {
			...item,
			status: 'uploading',
			lastProgressTime: Date.now()
		};
	});

	set({ uploads: updatedUploads });
	recalculateCounts(get, set);

	pendingItems.forEach((item) => {
		import('@/services/resumableUploadService')
			.then(({ startResumableUpload }) => {
				startResumableUpload(item.id).catch((err) => {
					console.error(`Upload failed to start for item ${item.id}:`, err);
				});
			})
			.catch((err) => {
				console.error('Failed to load resumableUploadService:', err);
			});
	});
}
