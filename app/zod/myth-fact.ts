import { z } from 'zod';

export const sourceSchema = z.object({
	link: z.url('Must be a valid URL'),
	name: z.string().min(1, 'Source name is required')
});

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

const ACCEPTED_VIDEO_TYPES = ['video/mp4'];

export const imageSchema = z
	.instanceof(File)
	.refine((file) => file.size <= MAX_FILE_SIZE, `Max image size is 5MB.`)
	.refine(
		(file) => ACCEPTED_IMAGE_TYPES.includes(file.type),
		'Only .jpg, .jpeg, .png and .webp formats are supported.'
	)
	.nullish();

export const videoSchema = z
	.instanceof(File, { error: 'Please select a video.' })
	.refine(
		(file) => ACCEPTED_VIDEO_TYPES.includes(file.type),
		'Only .mp4 formats are supported.'
	)
	.nullish();

export const mythFactTopicSchema = z.object({
	topic: z.string().min(1, 'Topic is required'),
	fact: z.string().min(1, 'Fact is required'),
	myth: z.string().min(1, 'Myth is required'),
	imageId: z.string().nullish(),
	file: imageSchema,
	fileHash: z.string(),
	is_deleted: z.boolean().optional(),
	scheduledDeleteAt: z.any().optional()
});

const displayImageSchema = z.object({
	fileHash: z.string(),
	file: imageSchema
});

const videoGuideSchema = z.object({
	fileHash: z.string(),
	file: videoSchema
});

export const mythFactSchema = z.object({
	id: z.string().nullish(),
	name: z.string().min(1, 'Name is required'),
	baseImagePath: z.string().optional().nullable(),
	displayImage: displayImageSchema,
	videoGuide: videoGuideSchema,
	sources: z.array(sourceSchema).min(1, 'At least 1 source is required'),
	topics: z.array(mythFactTopicSchema).min(1, 'At least 1 topic is required')
});

export type MythFactFormValues = z.infer<typeof mythFactSchema>;
export type MythFactSource = z.infer<typeof sourceSchema>;
export type MythFactTopic = z.infer<typeof mythFactTopicSchema>;

export interface MythFactTopicFull extends MythFactTopic {
	id: string;
}

export type MythFact = MythFactFormValues & {
	baseImagePath: string;
	is_deleted: boolean;
};
