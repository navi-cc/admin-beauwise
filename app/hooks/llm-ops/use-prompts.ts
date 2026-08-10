import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Prompt, PromptFormData, PromptFilters } from '@/types/llm-ops';
import {
	getPrompts,
	getPromptById,
	createPrompt,
	updatePrompt,
	deletePrompt,
	restorePrompt
} from '@/services/llm-ops/prompt-service';
import { logActivity } from '@/services/llm-ops/activity-log-service';

export function usePrompts(filters?: Partial<PromptFilters>) {
	return useQuery({
		queryKey: ['prompts', filters],
		queryFn: () => getPrompts(filters),
		staleTime: 30 * 1000
	});
}

export function usePrompt(id: string | undefined) {
	return useQuery<Prompt>({
		queryKey: ['prompt', id],
		queryFn: () => getPromptById(id!),
		enabled: !!id
	});
}

export function useCreatePrompt() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: PromptFormData) => createPrompt(data),
		onSuccess: async (promptId, variables) => {
			queryClient.invalidateQueries({ queryKey: ['prompts'] });
			await logActivity({
				promptId,
				promptName: variables.name,
				action: 'created',
				description: `Created prompt "${variables.name}"`
			});
		}
	});
}

export function useUpdatePrompt() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			id,
			data,
			changeNote
		}: {
			id: string;
			data: Partial<PromptFormData>;
			changeNote?: string;
		}) => updatePrompt(id, data, changeNote),
		onSuccess: async (_, { id, data, changeNote }) => {
			queryClient.invalidateQueries({ queryKey: ['prompts'] });
			queryClient.invalidateQueries({ queryKey: ['prompt', id] });
			queryClient.invalidateQueries({ queryKey: ['prompt-versions', id] });
			await logActivity({
				promptId: id,
				promptName: data.name || 'Unknown',
				action: 'updated',
				description: changeNote || `Updated prompt`,
				metadata: { changeNote }
			});
		}
	});
}

export function useDeletePrompt() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id }: { id: string; promptName: string }) => deletePrompt(id),
		onSuccess: async (_, { id, promptName }) => {
			queryClient.invalidateQueries({ queryKey: ['prompts'] });
			await logActivity({
				promptId: id,
				promptName,
				action: 'deleted',
				description: `Archived prompt "${promptName}"`
			});
		}
	});
}

export function useRestorePrompt() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id }: { id: string; promptName: string }) => restorePrompt(id),
		onSuccess: async (_, { id, promptName }) => {
			queryClient.invalidateQueries({ queryKey: ['prompts'] });
			queryClient.invalidateQueries({ queryKey: ['prompt', id] });
			queryClient.invalidateQueries({ queryKey: ['prompt-versions', id] });
			await logActivity({
				promptId: id,
				promptName,
				action: 'status_changed',
				description: `Restored prompt "${promptName}" to Draft status`
			});
		}
	});
}
