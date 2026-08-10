import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { PromptVersion } from '@/types/llm-ops';
import { getPromptVersions, rollbackToVersion } from '@/services/llm-ops/prompt-service';
import { logActivity } from '@/services/llm-ops/activity-log-service';

export function usePromptVersions(promptId: string | undefined) {
	return useQuery({
		queryKey: ['prompt-versions', promptId],
		queryFn: () => getPromptVersions(promptId!),
		enabled: !!promptId
	});
}

export function useRollbackVersion() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			promptId,
			versionId
		}: {
			promptId: string;
			versionId: string;
			promptName: string;
			version: number;
		}) => rollbackToVersion(promptId, versionId),
		onSuccess: async (_, { promptId, promptName, version }) => {
			queryClient.invalidateQueries({ queryKey: ['prompt', promptId] });
			queryClient.invalidateQueries({
				queryKey: ['prompt-versions', promptId]
			});
			queryClient.invalidateQueries({ queryKey: ['prompts'] });

			await logActivity({
				promptId,
				promptName,
				action: 'rollback',
				description: `Rolled back prompt "${promptName}" to version ${version}`,
				metadata: { targetVersion: version }
			});
		}
	});
}
