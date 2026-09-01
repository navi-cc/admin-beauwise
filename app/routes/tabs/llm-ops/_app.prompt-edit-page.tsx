import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router';

import { IngredientAnalysisEditor } from '@/components/llm-ops/ingredient-analysis-editor';
import { OcrParserEditor } from '@/components/llm-ops/ocr-parser-editor';
import { ModelSelector } from '@/components/llm-ops/model-selector';
import { TagManager } from '@/components/llm-ops/tag-manager';
import { ContextUrlManager } from '@/components/llm-ops/context-url-manager';
import { usePrompt, useUpdatePrompt } from '@/hooks/llm-ops/use-prompts';
import type { PromptFormData, PromptStatus, PromptType } from '@/types/llm-ops';
import { PROMPT_TYPES } from '@/constants/llm-ops';
import { tiptapToTemplate, validatePromptVariables } from '@/utils/template-utils';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription
} from '@/components/ui/card';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import CircleCheck from '@/components/icons/circle-check';
import ChevronLeft from '@/components/icons/chevron-left';
import Save from '@/components/icons/save';
import Loader from '@/components/icons/loader';
import Alert from '@/components/icons/alert';
import Layers from '@/components/icons/layers';
import Lock from '@/components/icons/lock';
import { queryClient } from '@/lib/query-client';
import { toast } from 'sonner';
import CheckMarkBadge from '@/components/icons/checkmark-badge';
import BadgeAlert from '@/components/icons/badge-alert';
import X from '@/components/icons/x';

export default function PromptEditPage() {
	const { id: promptId } = useParams<{ id: string }>();
	const navigate = useNavigate();

	const { data: prompt, isFetching } = usePrompt(promptId);
	const { mutateAsync: updatePrompt, isPending: isSaving } = useUpdatePrompt();

	console.log(prompt);

	const [formData, setFormData] = useState<PromptFormData>({
		name: '',
		description: '',
		promptType: 'ingredient_analysis' as PromptType,
		contentJson: {},
		contentHtml: '',
		contentTemplate: '',
		model: 'gemini-2.5-flash',
		tags: ['development'],
		variables: [],
		contextUrls: [],
		status: 'draft',
		changeNote: ''
	});

	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (prompt) {
			const isProd = prompt.tags?.includes('production');
			setFormData({
				name: prompt.name || '',
				description: prompt.description || '',
				promptType: prompt.promptType || 'ingredient_analysis',
				contentJson: prompt.contentJson || {},
				contentHtml: prompt.contentHtml || '',
				contentTemplate: prompt.contentTemplate || '',
				model: prompt.model || 'gemini-2.5-flash',
				tags: prompt.tags || ['development'],
				variables: prompt.variables || [],
				contextUrls: prompt.contextUrls || [],
				status: isProd ? 'active' : prompt.status || 'draft',
				changeNote: ''
			});
		}
	}, [prompt]);

	const isProduction = formData.tags.includes('production');

	const typeConfig = useMemo(
		() => PROMPT_TYPES[formData.promptType] || PROMPT_TYPES.ingredient_analysis,
		[formData.promptType]
	);

	const validation = useMemo(
		() => validatePromptVariables(formData.variables, formData.promptType),
		[formData.variables, formData.promptType]
	);

	const isContextUrlInserted = useMemo(
		() =>
			formData.promptType === 'ingredient_analysis' &&
			formData.variables.includes('context_url'),
		[formData.promptType, formData.variables]
	);

	const handleTagsChange = (tags: string[]) => {
		const isProd = tags.includes('production');
		setFormData((prev) => ({
			...prev,
			tags,
			status: isProd ? 'active' : prev.status
		}));
	};

	const handleSave = async () => {
		if (!promptId) return;

		if (!formData.name.trim()) {
			setError('Prompt Name is required.');
			return;
		}

		if (isProduction && formData.status !== 'active') {
			setError(
				'Production Status Restriction: Prompts tagged as Production must always be in Active status.'
			);
			return;
		}

		if (!validation.valid) {
			setError(
				`Missing Required Variables: The template is missing ${validation.missingVariables.length} required variables for ${typeConfig.label}:\n• ${validation.missingVariables.join('\n• ')}`
			);
			return;
		}

		try {
			setError(null);
			const template = tiptapToTemplate(formData.contentJson);
			await updatePrompt({
				id: promptId,
				data: {
					...formData,
					status: isProduction ? 'active' : formData.status,
					contentTemplate: template
				},
				changeNote: formData.changeNote || 'Updated prompt configuration'
			});

			toast.success(`Prompt Updated`, {
				position: 'top-right',
				description: `"${formData.name}" prompt is successfully updated.`,
				descriptionClassName: 'text-red',
				duration: 12000,
				icon: <CheckMarkBadge className='text-green-500 size-5' />,
				cancel: {
					label: <X className='size-6 hover:bg-muted/80 duration-300 rounded-full p-1' />,
					onClick: () => {}
				}
			});
			queryClient.invalidateQueries({ queryKey: ['activity-logs'] });
			navigate(`/llm-ops/detail/${promptId}`, { viewTransition: true });
		} catch (err: any) {
			toast.error(`Prompt Update Failed`, {
				position: 'top-right',
				description: `Something went wrong. Please try again`,
				descriptionClassName: 'text-red',
				duration: 12000,
				icon: <BadgeAlert className='text-red-500 size-5' />,
				cancel: {
					label: <X className='size-6 hover:bg-muted/80 duration-300 rounded-full p-1' />,
					onClick: () => {}
				}
			});
			console.error('Failed to save prompt:', err);
			setError(err.message || 'Failed to update prompt.');
		}
	};

	if (isFetching) {
		return (
			<div className='flex h-screen items-center justify-center'>
				<Loader className='w-8 h-8 animate-spin text-primary' />
			</div>
		);
	}

	return (
		<div className='container mx-auto p-6 max-w-5xl space-y-6'>
			{/* Header */}
			<div className='flex items-center justify-between'>
				<div className='flex items-center gap-4'>
					<Button
						variant='ghost'
						size='icon'
						render={
							<Link to={`/llm-ops/detail/${promptId}`} viewTransition>
								<ChevronLeft className='w-5 h-5' />
							</Link>
						}
					/>
					<div>
						<div className='flex items-center gap-2 mb-0.5'>
							<Badge
								variant='outline'
								className={`${typeConfig.badgeColor} text-[10px] gap-1 font-medium`}
							>
								<Layers className='h-2.5 w-2.5' />
								{typeConfig.label}
							</Badge>
							<Badge variant='outline' className='text-[10px] font-mono'>
								v{prompt?.version || 1}
							</Badge>
						</div>
						<h1 className='text-3xl font-bold tracking-tight'>Edit Prompt</h1>
					</div>
				</div>

				<div className='flex items-center gap-3'>
					{isProduction ? (
						<Badge className='h-9 px-3 bg-emerald-500/15 text-emerald-700 border-emerald-500/30 gap-1.5 text-xs font-semibold'>
							<Lock className='h-3.5 w-3.5 text-emerald-600' />
							Locked: Active (Production)
						</Badge>
					) : (
						<Select
							value={formData.status}
							onValueChange={(val: PromptStatus) =>
								setFormData({ ...formData, status: val })
							}
						>
							<SelectTrigger className='w-[130px] h-9 text-xs'>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value='draft'>Draft</SelectItem>
								<SelectItem value='active'>Active</SelectItem>
								<SelectItem value='archived'>Archived</SelectItem>
							</SelectContent>
						</Select>
					)}

					<Button onClick={handleSave} disabled={isSaving}>
						{isSaving ? (
							<Loader className='w-4 h-4 mr-2 animate-spin' />
						) : (
							<Save className='w-4 h-4 mr-2' />
						)}
						Save Changes
					</Button>
				</div>
			</div>

			{/* Error Banner */}
			{error && (
				<div className='bg-destructive/10 border border-destructive/30 text-destructive p-4 rounded-lg text-xs font-mono space-y-1'>
					<div className='flex items-center gap-2 font-sans font-semibold text-sm'>
						<Alert className='h-4 w-4 shrink-0' />
						<span>Cannot Save Changes</span>
					</div>
					<pre className='whitespace-pre-wrap leading-relaxed'>{error}</pre>
				</div>
			)}

			<div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
				<div className='md:col-span-2 space-y-6'>
					<Card>
						<CardHeader className='pb-3'>
							<CardTitle className='text-base'>Prompt Details</CardTitle>
						</CardHeader>
						<CardContent className='space-y-4'>
							<div className='space-y-2'>
								<label className='text-xs font-medium'>Prompt Name *</label>
								<Input
									value={formData.name}
									onChange={(e) => setFormData({ ...formData, name: e.target.value })}
									placeholder='Prompt Name'
									className='h-9 text-sm'
								/>
							</div>
							<div className='space-y-2'>
								<label className='text-xs font-medium'>Description</label>
								<Textarea
									value={formData.description}
									onChange={(e) =>
										setFormData({ ...formData, description: e.target.value })
									}
									placeholder='What does this prompt do?'
									rows={2}
									className='text-xs resize-none'
								/>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className='pb-3 flex flex-row items-center justify-between'>
							<div>
								<CardTitle className='text-base'>{typeConfig.label} Template</CardTitle>
								<CardDescription className='text-xs'>
									Modify template and runtime variables.
								</CardDescription>
							</div>
							<Badge
								variant='outline'
								className={`text-xs font-mono gap-1 ${
									validation.valid
										? 'bg-emerald-500/15 text-emerald-700 border-emerald-500/30'
										: 'bg-amber-500/15 text-amber-700 border-amber-500/30'
								}`}
							>
								{validation.valid ? (
									<CircleCheck className='h-3.5 w-3.5 text-emerald-600' />
								) : (
									<Alert className='h-3.5 w-3.5 text-amber-600' />
								)}
								{validation.insertedCount} / {validation.totalRequired} Variables
							</Badge>
						</CardHeader>
						<CardContent>
							{formData.promptType === 'ingredient_analysis' ? (
								<IngredientAnalysisEditor
									key='ingredient_analysis'
									content={formData.contentJson}
									onChange={({ json, html, variables }) =>
										setFormData({
											...formData,
											contentJson: json,
											contentHtml: html,
											variables
										})
									}
									editable={true}
								/>
							) : (
								<OcrParserEditor
									key='ocr_ingredient_parser'
									content={formData.contentJson}
									onChange={({ json, html, variables }) =>
										setFormData({
											...formData,
											contentJson: json,
											contentHtml: html,
											variables
										})
									}
									editable={true}
								/>
							)}
						</CardContent>
					</Card>

					{/* Conditionally Render Context URL Manager only when {{context_url}} is inserted */}
					{isContextUrlInserted && (
						<ContextUrlManager
							urls={formData.contextUrls || []}
							onChange={(contextUrls) =>
								setFormData((prev) => ({ ...prev, contextUrls }))
							}
						/>
					)}

					<Card>
						<CardHeader className='pb-3'>
							<CardTitle className='text-base'>Change Note</CardTitle>
							<CardDescription className='text-xs'>
								Describe changes made in this new version.
							</CardDescription>
						</CardHeader>
						<CardContent>
							<Input
								value={formData.changeNote || ''}
								onChange={(e) => setFormData({ ...formData, changeNote: e.target.value })}
								placeholder='e.g., Added instructions for context_url limits'
								className='h-9 text-xs'
							/>
						</CardContent>
					</Card>
				</div>

				<div className='space-y-6'>
					<Card>
						<CardHeader className='pb-3'>
							<CardTitle className='text-base'>Model Settings</CardTitle>
						</CardHeader>
						<CardContent>
							<ModelSelector
								selectedModel={formData.model}
								onModelChange={(model) => setFormData({ ...formData, model })}
							/>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className='pb-3'>
							<CardTitle className='text-base'>Environment Tag</CardTitle>
						</CardHeader>
						<CardContent>
							<TagManager
								selectedTags={formData.tags}
								onChange={handleTagsChange}
								onStatusChange={(status) => setFormData((prev) => ({ ...prev, status }))}
								promptType={formData.promptType}
							/>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
