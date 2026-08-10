import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { optionsService, type IngredientsConfig } from '@/services/option-service';

export const optionKeys = {
	all: ['options'] as const,
	ingredientsConfig: () => [...optionKeys.all, 'ingredients_config'] as const
};

export function useIngredientsConfig() {
	return useQuery<IngredientsConfig>({
		queryKey: optionKeys.ingredientsConfig(),
		queryFn: () => optionsService.getIngredientsConfig(),
		staleTime: 1000 * 60 * 10
	});
}

export function useAddOption() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ field, value }: { field: keyof IngredientsConfig; value: string }) =>
			optionsService.addOption(field, value),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: optionKeys.ingredientsConfig()
			});
		}
	});
}

export function useUpdateOption() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			field,
			oldValue,
			newValue
		}: {
			field: keyof IngredientsConfig;
			oldValue: string;
			newValue: string;
		}) => optionsService.updateOption(field, oldValue, newValue),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: optionKeys.ingredientsConfig()
			});
		}
	});
}

export function useDeleteOption() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ field, value }: { field: keyof IngredientsConfig; value: string }) =>
			optionsService.deleteOption(field, value),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: optionKeys.ingredientsConfig()
			});
		}
	});
}
