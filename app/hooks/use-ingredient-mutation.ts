import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ingredientService } from '@/services/ingredient-service';
import { type IngredientFormValues } from '@/zod/ingredients';
import { ingredientKeys } from '@/hooks/use-ingredients';
import { useIngredientStore } from '@/store/useIngredientStore';

export function useAddIngredient() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: IngredientFormValues) => ingredientService.add(data),
		onMutate: () => {
			useIngredientStore.getState().setIsAdding(true);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ingredientKeys.all });
		},
		onSettled: () => {
			useIngredientStore.getState().setIsAdding(false);
		}
	});
}

export function useUpdateIngredient() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: Partial<IngredientFormValues> }) =>
			ingredientService.update(id, data),
		onMutate: () => {
			useIngredientStore.getState().setIsUpdating(true);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ingredientKeys.all });
		},
		onSettled: () => {
			useIngredientStore.getState().setIsUpdating(false);
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
