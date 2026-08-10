import { z } from 'zod';
import { imageSchema } from './myth-fact';

export const consumerSourceSchema = z.object({
	link: z.url('Must be a valid URL'),
	name: z.string().min(1, 'Source name is required')
});

export const consumerGuideFormSchema = z.object({
	id: z.string().nullish(),
	name: z.string().min(1, 'Name is required'),
	definition: z.string().min(10, 'Definition is required'),
	sources: z.array(consumerSourceSchema).min(1, 'At least 1 source is required'),
	imageId: z.string(),
	fileHash: z.string(),
	file: imageSchema,
	usage: z.string().min(10, 'Usage is required')
});

export type ConsumerGuideFormValues = z.infer<typeof consumerGuideFormSchema>;

export type ConsumerGuideSource = z.infer<typeof consumerSourceSchema>;

export interface ConsumerGuide extends ConsumerGuideFormValues {
	is_deleted: boolean;
}
