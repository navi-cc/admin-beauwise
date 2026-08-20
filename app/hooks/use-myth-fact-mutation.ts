import { useMutation, useQueryClient } from '@tanstack/react-query';
import { mythFactService } from '@/services/myth-fact-service';
import type { MythFact, MythFactFormValues, MythFactTopicFull } from '@/zod/myth-fact';
import { mythFactKeys } from '@/hooks/use-myth-facts';
import { generateId } from '@/utils/generate-id';
import { useUploadStore, type EnqueueUploadPayload } from '@/store/useUploadStore';
import { v4 as uuidV4 } from 'uuid';

export function useAddMythFact() {
	const queryClient = useQueryClient();
	const setInvalidationKey = useUploadStore((state) => state.setInvalidationKey);

	return useMutation({
		mutationFn: async ({ data }: { data: MythFactFormValues }) => {
			const id = `${generateId(data.name)}-${Date.now()}`;
			const payloads: EnqueueUploadPayload[] = [];
			const batchId = `batch_${id}_${Date.now()}`;

			const baseStoragePath = 'learn';
			if (data.displayImage.file) {
				payloads.push({
					id: `${id}_display_image`,
					file: data.displayImage.file,
					fileType: 'image',
					storagePath: `${baseStoragePath}/${id}/display_image.webp`,
					batchId
				});
			}

			if (data.videoGuide.file) {
				payloads.push({
					id: `${id}_video_guide`,
					file: data.videoGuide.file,
					fileType: 'video',
					storagePath: `${baseStoragePath}/${id}/video_guide.mp4`,
					batchId
				});
			}

			const topicsUUID = data.topics.map((topic) => {
				return `topic-${uuidV4()}`;
			});

			data.topics.forEach((topic, index) => {
				if (topic.file) {
					const topicId = generateId(topic.topic);
					payloads.push({
						id: `${id}_${topicId}_${topic.fileHash}`,
						file: topic.file,
						fileType: 'image',
						storagePath: `${baseStoragePath}/${id}/${topicsUUID[index]}.webp`,
						batchId
					});
				}
			});

			if (payloads.length > 0) {
				setInvalidationKey([...mythFactKeys.all]);
				useUploadStore.getState().enqueueUploads(payloads);
			}

			const guideData: MythFactFormValues = {
				name: data.name,
				sources: data.sources,
				baseImagePath: id,
				displayImage: { fileHash: data.displayImage.fileHash },
				videoGuide: { fileHash: data.videoGuide.fileHash },
				topics: data.topics.map((t, i) => ({
					id: generateId(t.topic),
					topic: t.topic,
					fact: t.fact,
					myth: t.myth,
					imageId: topicsUUID[i],
					fileHash: t.fileHash
				}))
			};

			return mythFactService.add(guideData as MythFact);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['myth-facts'] });
			queryClient.invalidateQueries({ queryKey: ['guides'] });
		}
	});
}

export function useUpdateMythFact() {
	const queryClient = useQueryClient();
	const setInvalidationKey = useUploadStore((state) => state.setInvalidationKey);

	const baseStoragePath = 'learn';
	return useMutation({
		mutationFn: async ({ data }: { data: MythFactFormValues }) => {
			const id = data.baseImagePath;
			const payloads: EnqueueUploadPayload[] = [];
			const batchId = `batch_${id}_${Date.now()}`;

			if (data.displayImage.file) {
				payloads.push({
					id: `${id}_display_image`,
					file: data.displayImage.file,
					fileType: 'image',
					storagePath: `${baseStoragePath}/${id}/display_image.webp`,
					batchId
				});
			}

			if (data.videoGuide.file) {
				payloads.push({
					id: `${id}_video_guide`,
					file: data.videoGuide.file,
					fileType: 'video',
					storagePath: `${baseStoragePath}/${id}/video_guide.mp4`,
					batchId
				});
			}

			const topics = data.topics.map((topic) => {
				const imageId = topic?.imageId ? topic.imageId : `topic-${uuidV4()}`;
				return {
					...topic,
					imageId
				};
			});

			topics.forEach((topic) => {
				if (topic.file) {
					const topicId = generateId(topic.topic);

					payloads.push({
						id: `${id}_${topicId}_${topic.fileHash}`,
						file: topic.file,
						fileType: 'image',
						storagePath: `${baseStoragePath}/${id}/${topic.imageId}.webp`,
						batchId
					});
				}
			});

			if (payloads.length > 0) {
				setInvalidationKey([...mythFactKeys.all]);
				useUploadStore.getState().enqueueUploads(payloads);
			}

			const updateData: MythFactFormValues = {
				...data,
				displayImage: { fileHash: data.displayImage.fileHash },
				baseImagePath: data.baseImagePath,
				videoGuide: { fileHash: data.videoGuide.fileHash },
				topics: topics.map((t) => ({
					id: generateId(t.topic),
					topic: t.topic,
					fact: t.fact,
					myth: t.myth,
					imageId: t.imageId,
					fileHash: t.fileHash
				}))
			};

			return mythFactService.update(data.id as string, updateData);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['myth-facts'] });
		}
	});
}

export function useDeleteMythFact() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => mythFactService.softDelete(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: mythFactKeys.all });
		}
	});
}

export function useRestoreMythFact() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => mythFactService.restore(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: mythFactKeys.all });
		}
	});
}
