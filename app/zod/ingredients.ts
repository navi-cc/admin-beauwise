import { z } from 'zod';

export const sourceSchema = z.object({
	link: z.url('Must be a valid URL'),
	name: z.string().min(1, 'Source name is required')
});

export const ingredientFormSchema = z.object({
	name: z.string().min(1, 'Name is required'),
	categories: z.array(z.string()).min(1, 'At least 1 category is required'),
	what_it_does: z
		.array(z.string().min(1, 'Sentence cannot be empty'))
		.min(1, 'At least 1 entry is required'),
	what_it_is: z.string().min(1, 'This is required'),
	best_for: z.array(z.string()).min(1, 'At least 1 is required'),
	info: z.string().optional().default(''),
	common_products: z.array(z.string()).min(1, 'At least 1 common product is required'),
	sources: z.array(sourceSchema).min(1, 'At least 1 source is required'),
	safety_level: z.string().optional().default('')
});

export type IngredientFormValues = z.infer<typeof ingredientFormSchema>;

export type Source = z.infer<typeof sourceSchema>;

export interface Ingredient extends IngredientFormValues {
	is_deleted: boolean;
}
