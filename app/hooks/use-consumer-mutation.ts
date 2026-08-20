import { useMutation, useQueryClient } from '@tanstack/react-query';
import { consumerGuideService } from '@/services/consumer-guide-service';
import { storageService } from '@/services/storage-service';
import { type ConsumerGuide, type ConsumerGuideFormValues } from '@/zod/consumer-guide';
import { consumerGuideKeys } from './use-consumer-guides';
import { generateId } from '@/utils/generate-id';
import { v4 as uuidV4 } from 'uuid';
import { useUploadStore, type EnqueueUploadPayload } from '@/store/useUploadStore';
interface AddItemParams {
	data: ConsumerGuideFormValues;
	imageFile?: File | null;
}

interface UpdateItemParams {
	data: ConsumerGuideFormValues;
}

export function useAddConsumer() {
	const queryClient = useQueryClient();
	const setInvalidationKey = useUploadStore((state) => state.setInvalidationKey);

	return useMutation({
		mutationFn: async ({ data }: AddItemParams) => {
			const id = `${generateId(data.name)}-${uuidV4()}`;
			const batchId = `batch_${id}_${Date.now()}`;
			const payloads: EnqueueUploadPayload[] = [];
			const baseStoragePath = 'learn/cosmetic_guides';

			if (data.file) {
				payloads.push({
					storagePath: `${baseStoragePath}/${id}.webp`,
					fileType: 'image',
					file: data.file,
					batchId,
					id: `${id}-consumer-guide`
				});
			}

			if (payloads.length > 0) {
				setInvalidationKey([...consumerGuideKeys.all]);
				useUploadStore.getState().enqueueUploads(payloads);
			}

			const newData: ConsumerGuide = {
				name: data.name,
				definition: data.definition,
				sources: data.sources,
				usage: data.usage,
				fileHash: data.fileHash,
				imageId: id,
				is_deleted: false
			};

			return consumerGuideService.add({ ...newData });
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: consumerGuideKeys.all });
		}
	});
}

export function useUpdateConsumer() {
	const queryClient = useQueryClient();
	const setInvalidationKey = useUploadStore((state) => state.setInvalidationKey);
	return useMutation({
		mutationFn: async ({ data }: UpdateItemParams) => {
			const id = data.imageId;
			const batchId = `batch_${id}_${Date.now()}`;
			const payloads: EnqueueUploadPayload[] = [];
			const baseStoragePath = 'learn/cosmetic_guides';

			if (data.file) {
				payloads.push({
					storagePath: `${baseStoragePath}/${id}.webp`,
					fileType: 'image',
					file: data.file,
					batchId,
					id: `${id}-consumer-guide`
				});
			}

			if (payloads.length > 0) {
				setInvalidationKey([...consumerGuideKeys.all]);
				useUploadStore.getState().enqueueUploads(payloads);
			}

			const updatedData: ConsumerGuideFormValues = {
				name: data.name,
				definition: data.definition,
				sources: data.sources,
				usage: data.usage,
				fileHash: data.fileHash,
				imageId: id
			};

			return consumerGuideService.update(data.id as string, updatedData);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: consumerGuideKeys.all });
		}
	});
}

export function useDeleteConsumer() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => consumerGuideService.softDelete(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: consumerGuideKeys.all });
		}
	});
}

export function useRestoreConsumer() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => consumerGuideService.restore(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: consumerGuideKeys.all });
		}
	});
}
