import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

import { IngredientAnalysisEditor } from '@/components/llm-ops/ingredient-analysis-editor';
import { OcrParserEditor } from '@/components/llm-ops/ocr-parser-editor';
import { ModelSelector } from '@/components/llm-ops/model-selector';
import { TagManager } from '@/components/llm-ops/tag-manager';
import { ContextUrlManager } from '@/components/llm-ops/context-url-manager';
import { useCreatePrompt } from '@/hooks/llm-ops/use-prompts';
import type { PromptFormData, PromptStatus, PromptType } from '@/types/llm-ops';
import { tiptapToTemplate, validatePromptVariables } from '@/utils/template-utils';
import { PROMPT_TYPES } from '@/constants/llm-ops';
import ArrowLeft from '@/components/ui/arrow-left';
import Save from '@/components/icons/save';
import Loader from '@/components/icons/loader';
import Layers from '@/components/icons/layers';
import Alert from '@/components/icons/alert';
import CircleCheck from '@/components/icons/circle-check';
import { toast } from 'sonner';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle
} from '@/components/ui/alert-dialog';
import CheckMarkBadge from '@/components/icons/checkmark-badge';
import X from '@/components/icons/x';
import BadgeAlert from '@/components/icons/badge-alert';

export default function PromptCreatePage() {
	const navigate = useNavigate();
	const createPrompt = useCreatePrompt();

	const [formData, setFormData] = useState<PromptFormData>({
		name: '',
		description: '',
		promptType: 'ingredient_analysis' as PromptType,
		contentJson: {},
		contentHtml: '',
		contentTemplate: '',
		model: 'gemini-3.1-flash-lite',
		tags: ['production'],
		variables: [],
		contextUrls: [],
		status: 'draft' as PromptStatus
	});

	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const [pendingPromptType, setPendingPromptType] = useState<PromptType | null>(null);
	const [switchConfirmOpen, setSwitchConfirmOpen] = useState(false);

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

	const hasEditorContent = useMemo(() => {
		const hasText = (formData.contentTemplate || '').trim().length > 0;
		const hasVars = (formData.variables || []).length > 0;
		const hasUrls = (formData.contextUrls || []).length > 0;
		return hasText || hasVars || hasUrls;
	}, [formData.contentTemplate, formData.variables, formData.contextUrls]);

	const executeTypeSwitch = (newType: PromptType) => {
		setFormData((prev) => ({
			...prev,
			promptType: newType,
			contentJson: {},
			contentHtml: '',
			contentTemplate: '',
			variables: [],
			contextUrls: []
		}));
		setError(null);
	};

	const handlePromptTypeChange = (newType: PromptType) => {
		if (newType === formData.promptType) return;
		if (hasEditorContent) {
			setPendingPromptType(newType);
			setSwitchConfirmOpen(true);
		} else {
			executeTypeSwitch(newType);
		}
	};

	const confirmPromptTypeSwitch = () => {
		if (pendingPromptType) {
			executeTypeSwitch(pendingPromptType);
		}
		setPendingPromptType(null);
		setSwitchConfirmOpen(false);
	};
	const cancelPromptTypeSwitch = () => {
		setPendingPromptType(null);
		setSwitchConfirmOpen(false);
	};

	const handleTagsChange = (tags: string[]) => {
		const isProd = tags.includes('production');
		setFormData((prev) => ({
			...prev,
			tags,
			status: isProd ? 'active' : prev.status
		}));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!formData.name.trim()) {
			setError('Prompt Name is required.');
			return;
		}

		if (!validation.valid) {
			setError(
				`Missing Required Variables: The template is missing ${validation.missingVariables.length} required variables for ${typeConfig.label}:\n• ${validation.missingVariables.join('\n• ')}`
			);
			return;
		}

		const payload: PromptFormData = {
			...formData,
			status: formData.tags.includes('production') ? 'active' : formData.status
		};

		createPrompt.mutate(payload, {
			onError: () => {
				toast.error(`Prompt Create Failed`, {
					position: 'top-right',
					description: `The prompt is not created. Please try again.`,
					descriptionClassName: 'text-red',
					duration: 12000,
					icon: <BadgeAlert className='text-red-500 size-5' />,
					cancel: {
						label: (
							<X className='size-6 hover:bg-muted/80 duration-300 rounded-full p-1' />
						),
						onClick: () => {}
					}
				});
			},
			onSuccess: () => {
				toast.success(
					`New Prompt Created for ${formData.promptType
						.split('_')
						.map((str) => str[0].toUpperCase() + str.slice(1))
						.join(' ')}.`,
					{
						position: 'top-right',
						description: `"${formData.name}" is successfully created.`,
						descriptionClassName: 'text-red',
						duration: 12000,
						icon: <CheckMarkBadge className='text-green-500 size-5' />,
						cancel: {
							label: (
								<X className='size-6 hover:bg-muted/80 duration-300 rounded-full p-1' />
							),
							onClick: () => {}
						}
					}
				);
				navigate(`/llm-ops`, { viewTransition: true });
			}
		});
	};

	const handleEditorChange = (data: {
		json: Record<string, unknown>;
		html: string;
		variables: string[];
	}) => {
		setFormData((prev) => ({
			...prev,
			contentJson: data.json,
			contentHtml: data.html,
			contentTemplate: tiptapToTemplate(data.json),
			variables: data.variables
		}));
	};

	const pendingTypeConfig = pendingPromptType ? PROMPT_TYPES[pendingPromptType] : null;

	return (
		<div className='container mx-auto p-6 max-w-5xl space-y-6'>
			<div className='flex items-center justify-between'>
				<div className='flex items-center space-x-4'>
					<Button
						variant='ghost'
						size='icon'
						render={
							<Link to='/llm-ops' viewTransition>
								<ArrowLeft className='w-5 h-5' />
							</Link>
						}
					/>
					<div>
						<h1 className='text-3xl font-bold tracking-tight'>Create Prompt</h1>
						<p className='text-muted-foreground text-sm'>
							Design and configure a system prompt template with strict variable
							validation.
						</p>
					</div>
				</div>
				<Button onClick={handleSubmit} disabled={createPrompt.isPending}>
					{createPrompt.isPending ? (
						<Loader className='w-4 h-4 mr-2 animate-spin' />
					) : (
						<Save className='w-4 h-4 mr-2' />
					)}
					Save Prompt
				</Button>
			</div>

			{/* Error Banner */}
			{error && (
				<div className='bg-destructive/10 border border-destructive/30 text-destructive p-4 rounded-lg text-xs font-mono space-y-1'>
					<div className='flex items-center gap-2 font-sans font-semibold text-sm'>
						<Alert className='h-4 w-4 shrink-0' />
						<span>Cannot Save Prompt</span>
					</div>
					<pre className='whitespace-pre-wrap leading-relaxed'>{error}</pre>
				</div>
			)}

			{/* Prompt Type Selection Card */}
			<Card className='border-primary/20 bg-primary/5'>
				<CardHeader className='pb-3'>
					<CardTitle className='text-sm font-semibold flex items-center gap-2'>
						<Layers className='h-4 w-4 text-primary' />
						Select Prompt Type
					</CardTitle>
					<CardDescription className='text-xs'>
						Choose the target execution context. Each prompt type enforces a strict schema
						of required runtime variables.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
						{Object.values(PROMPT_TYPES).map((type) => {
							const isSelected = formData.promptType === type.id;
							return (
								<button
									key={type.id}
									type='button'
									onClick={() => handlePromptTypeChange(type.id)}
									className={`p-3.5 rounded-lg border text-left transition-all ${
										isSelected
											? 'bg-background border-primary ring-2 ring-primary/20 shadow-sm'
											: 'bg-background/60 border-border hover:bg-background'
									}`}
								>
									<div className='flex items-center justify-between mb-1'>
										<span className='font-semibold text-sm text-foreground'>
											{type.label}
										</span>
										{isSelected && (
											<Badge className='bg-primary text-primary-foreground text-[10px]'>
												Selected
											</Badge>
										)}
									</div>
									<p className='text-xs text-muted-foreground leading-snug mb-2'>
										{type.description}
									</p>
									<span className='text-[10px] font-mono text-muted-foreground'>
										{type.variables.filter((v) => v.required).length} required variables
									</span>
								</button>
							);
						})}
					</div>
				</CardContent>
			</Card>

			<div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
				{/* Left Column: Form Details, Dedicated Editor, & Conditional Context URLs */}
				<div className='md:col-span-2 space-y-6'>
					<Card>
						<CardHeader>
							<CardTitle className='text-base'>Prompt Details</CardTitle>
							<CardDescription className='text-xs'>
								Name and describe this prompt configuration.
							</CardDescription>
						</CardHeader>
						<CardContent className='space-y-4'>
							<div className='space-y-2'>
								<Label htmlFor='name' className='text-xs'>
									Prompt Name <span className='text-destructive'>*</span>
								</Label>
								<Input
									id='name'
									value={formData.name}
									onChange={(e) =>
										setFormData((prev) => ({ ...prev, name: e.target.value }))
									}
									placeholder='e.g., Production Ingredient Analyzer v1'
									className='h-9 text-sm'
									required
								/>
							</div>
							<div className='space-y-2'>
								<Label htmlFor='description' className='text-xs'>
									Description
								</Label>
								<Textarea
									id='description'
									value={formData.description}
									onChange={(e) =>
										setFormData((prev) => ({
											...prev,
											description: e.target.value
										}))
									}
									placeholder='Describe the purpose and expected outputs of this prompt...'
									rows={2}
									className='text-xs resize-none'
								/>
							</div>
						</CardContent>
					</Card>

					{/* Dedicated Editor Card */}
					<Card>
						<CardHeader className='pb-3 flex flex-row items-center justify-between'>
							<div>
								<CardTitle className='text-base'>{typeConfig.label} Template</CardTitle>
								<CardDescription className='text-xs'>
									Write prompt text and insert runtime variables.
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
									onChange={handleEditorChange}
									editable={true}
								/>
							) : (
								<OcrParserEditor
									key='ocr_ingredient_parser'
									content={formData.contentJson}
									onChange={handleEditorChange}
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
				</div>

				{/* Right Column: Model & Tag Sidebar */}
				<div className='space-y-6'>
					<Card>
						<CardHeader className='pb-3'>
							<CardTitle className='text-base'>Model Configuration</CardTitle>
							<CardDescription className='text-xs'>
								Select LLM model and adjust generation parameters.
							</CardDescription>
						</CardHeader>
						<CardContent>
							<ModelSelector
								selectedModel={formData.model}
								onModelChange={(model) => setFormData((prev) => ({ ...prev, model }))}
							/>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className='pb-3'>
							<CardTitle className='text-base'>Environment</CardTitle>
							<CardDescription className='text-xs'>
								Set environment tag for this prompt.
							</CardDescription>
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

				<AlertDialog open={switchConfirmOpen} onOpenChange={setSwitchConfirmOpen}>
					<AlertDialogContent>
						<AlertDialogHeader>
							<AlertDialogTitle className='flex items-center gap-2 text-amber-600'>
								<Alert className='h-5 w-5 shrink-0 text-amber-600' />
								Switch Prompt Type & Clear Editor?
							</AlertDialogTitle>
							<AlertDialogDescription className='space-y-2 text-xs leading-relaxed'>
								<p>
									Switching prompt type to{' '}
									<strong className='text-foreground font-semibold'>
										{pendingTypeConfig?.label || 'the new prompt type'}
									</strong>{' '}
									will clear your current template text, inserted variables, and context
									URLs.
								</p>
								<p className='bg-muted p-2 rounded text-muted-foreground border'>
									<strong>Why?</strong> Each prompt type requires a specific set of
									runtime variables. Resetting the editor ensures your template matches
									the new prompt type schema.
								</p>
							</AlertDialogDescription>
						</AlertDialogHeader>
						<AlertDialogFooter>
							<AlertDialogCancel onClick={cancelPromptTypeSwitch}>
								Cancel
							</AlertDialogCancel>
							<AlertDialogAction onClick={confirmPromptTypeSwitch} className=''>
								Clear & Switch Prompt Type
							</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>
			</div>
		</div>
	);
}
