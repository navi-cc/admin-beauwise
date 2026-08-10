import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ingredientService } from '@/services/ingredient-service';
import { type IngredientFormValues } from '@/zod/ingredients';
import { ingredientKeys } from '@/hooks/use-ingredients';

export function useAddIngredient() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: IngredientFormValues) => ingredientService.add(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ingredientKeys.all });
		}
	});
}

export function useUpdateIngredient() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: Partial<IngredientFormValues> }) =>
			ingredientService.update(id, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ingredientKeys.all });
		}
	});
}

export function useDeleteIngredient() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => ingredientService.softDelete(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ingredientKeys.all });
		}
	});
}

export function useRestoreIngredient() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => ingredientService.restore(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ingredientKeys.all });
		}
	});
}
