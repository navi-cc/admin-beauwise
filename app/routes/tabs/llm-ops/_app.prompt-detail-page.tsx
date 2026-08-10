import React, { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router';

import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
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
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';

import { IngredientAnalysisEditor } from '@/components/llm-ops/ingredient-analysis-editor';
import { OcrParserEditor } from '@/components/llm-ops/ocr-parser-editor';
import { ContextUrlManager } from '@/components/llm-ops/context-url-manager';
import { TestPanel } from '@/components/llm-ops/test-panel';
import { ActivityLog } from '@/components/llm-ops/activity-log';
import { VersionHistory } from '@/components/llm-ops/version-history';
import {
	usePrompt,
	useDeletePrompt,
	useRestorePrompt,
	useUpdatePrompt
} from '@/hooks/llm-ops/use-prompts';
import {
	STATUS_CONFIG,
	GEMINI_MODELS,
	PROMPT_TYPES,
	DEFAULT_TAGS
} from '@/constants/llm-ops';
import type { PromptStatus } from '@/types/llm-ops';
import { validatePromptVariables } from '@/utils/template-utils';
import ArrowLeft from '@/components/ui/arrow-left';
import Calendar from '@/components/icons/calendar';
import MoreVertical from '@/components/icons/more-vertical';
import Play from '@/components/icons/play';
import Pencil from '@/components/icons/penicl';
import Archive from '@/components/icons/archive';
import RotateCcw from '@/components/icons/rotate-ccw';
import History from '@/components/icons/history';
import Tag from '@/components/icons/tag';
import Settings from '@/components/icons/settings';
import Alert from '@/components/icons/alert';
import CircleCheck from '@/components/icons/circle-check';
import Layers from '@/components/icons/layers';
import Check from '@/components/icons/check';
import X from '@/components/icons/x';
import User from '@/components/icons/user';
import Lock from '@/components/icons/lock';

function formatDate(timestamp: any) {
	if (!timestamp) return 'Unknown date';
	try {
		const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
		return date.toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	} catch (e) {
		return 'Invalid date';
	}
}

export default function PromptDetailPage() {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();

	const { data: prompt, isLoading, isError } = usePrompt(id!);
	const updatePromptMutation = useUpdatePrompt();
	const deletePromptMutation = useDeletePrompt();
	const restorePromptMutation = useRestorePrompt();

	const [activeTab, setActiveTab] = useState('editor');
	const [showDeleteDialog, setShowDeleteDialog] = useState(false);
	const [productionBlockedOpen, setProductionBlockedOpen] = useState(false);

	const typeConfig = useMemo(
		() =>
			prompt
				? PROMPT_TYPES[prompt.promptType] || PROMPT_TYPES.ingredient_analysis
				: PROMPT_TYPES.ingredient_analysis,
		[prompt]
	);

	const validation = useMemo(
		() =>
			prompt
				? validatePromptVariables(prompt.variables || [], prompt.promptType)
				: { valid: true, missingVariables: [], totalRequired: 0, insertedCount: 0 },
		[prompt]
	);

	const isContextUrlInserted = useMemo(
		() =>
			prompt &&
			prompt.promptType === 'ingredient_analysis' &&
			prompt.variables?.includes('context_url'),
		[prompt]
	);

	if (isLoading) {
		return (
			<div className='container mx-auto py-6 max-w-6xl space-y-6'>
				<Skeleton className='h-8 w-48' />
				<Skeleton className='h-[600px] w-full' />
			</div>
		);
	}

	if (isError || !prompt) {
		return (
			<div className='container mx-auto py-12 max-w-4xl text-center'>
				<Alert className='mx-auto h-12 w-12 text-destructive mb-4' />
				<h2 className='text-2xl font-bold mb-2'>Prompt not found</h2>
				<p className='text-muted-foreground mb-6'>
					The prompt you're looking for doesn't exist or you don't have permission to view
					it.
				</p>
				<Button onClick={() => navigate('/llm-ops', { viewTransition: true })}>
					Back to Prompts
				</Button>
			</div>
		);
	}

	const isProduction = prompt.tags?.includes('production');
	const isArchived = prompt.status === 'archived';

	const statusConfig =
		STATUS_CONFIG[prompt.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.draft;
	const modelInfo = GEMINI_MODELS.find((m) => m.id === prompt.model) || {
		name: prompt.model
	};

	const handleStatusChange = async (newStatus: PromptStatus) => {
		if (isProduction && newStatus !== 'active') {
			setProductionBlockedOpen(true);
			return;
		}
		try {
			await updatePromptMutation.mutateAsync({
				id: prompt.id,
				data: { status: newStatus },
				changeNote: `Status changed to ${newStatus}`
			});
		} catch (error) {
			console.error('Failed to update status', error);
		}
	};

	const handleArchiveClick = () => {
		if (isProduction) {
			setProductionBlockedOpen(true);
		} else {
			setShowDeleteDialog(true);
		}
	};

	const handleDelete = async () => {
		try {
			await deletePromptMutation.mutateAsync({
				id: prompt.id,
				promptName: prompt.name
			});
			setShowDeleteDialog(false);
			navigate('/llm-ops', { viewTransition: true });
		} catch (error) {
			console.error('Failed to delete prompt', error);
		}
	};

	const handleRestore = async () => {
		try {
			await restorePromptMutation.mutateAsync({
				id: prompt.id,
				promptName: prompt.name
			});
		} catch (error) {
			console.error('Failed to restore prompt', error);
		}
	};

	const getTagColor = (tagValue: string): string => {
		const preset = DEFAULT_TAGS.find((t) => t.value === tagValue);
		return preset ? preset.color : 'bg-zinc-500/10 text-zinc-600 border-zinc-500/20';
	};

	const insertedVariablesSet = new Set(prompt.variables || []);

	return (
		<div className='container mx-auto py-6 max-w-6xl space-y-6'>
			<div className='flex items-center justify-between'>
				<div className='flex items-center space-x-4'>
					<Button
						variant='ghost'
						size='icon'
						render={
							<Link to='/llm-ops' viewTransition>
								<ArrowLeft className='h-5 w-5' />
							</Link>
						}
					/>
					<div>
						<div className='flex items-center gap-2 mb-1 flex-wrap'>
							<Badge
								variant='outline'
								className={`${typeConfig.badgeColor} text-[10px] gap-1 font-medium`}
							>
								<Layers className='h-2.5 w-2.5' />
								{typeConfig.label}
							</Badge>
							<Badge
								variant='outline'
								className={`${statusConfig.color} text-[10px] gap-1`}
							>
								<span className={`h-1.5 w-1.5 rounded-full ${statusConfig.dotColor}`} />
								{statusConfig.label}
							</Badge>
							<Badge variant='secondary' className='text-[10px] font-mono'>
								v{prompt.version || 1}
							</Badge>
						</div>
						<h1 className='text-2xl font-bold tracking-tight'>{prompt.name}</h1>
					</div>
				</div>

				<div className='flex items-center space-x-2'>
					<Button
						onClick={() =>
							navigate(`/llm-ops/edit/${prompt.id}`, { viewTransition: true })
						}
					>
						<Pencil className='h-4 w-4 mr-2' />
						Edit Prompt
					</Button>

					<DropdownMenu>
						<DropdownMenuTrigger
							render={
								<Button variant='outline' size='icon'>
									<MoreVertical className='h-4 w-4' />
								</Button>
							}
						/>
						<DropdownMenuContent align='end'>
							<DropdownMenuGroup>
								<DropdownMenuLabel>Status & Actions</DropdownMenuLabel>
								<DropdownMenuSeparator />
								{isProduction ? (
									<DropdownMenuItem
										disabled
										className='text-xs text-muted-foreground gap-1.5'
									>
										<Lock className='h-3.5 w-3.5 text-emerald-600' />
										Locked: Active (Production)
									</DropdownMenuItem>
								) : (
									<>
										{prompt.status !== 'active' && (
											<DropdownMenuItem onClick={() => handleStatusChange('active')}>
												Mark as Active
											</DropdownMenuItem>
										)}
										{prompt.status !== 'draft' && (
											<DropdownMenuItem onClick={() => handleStatusChange('draft')}>
												Revert to Draft
											</DropdownMenuItem>
										)}
									</>
								)}
								<DropdownMenuSeparator />
								{isArchived ? (
									<DropdownMenuItem
										onClick={handleRestore}
										disabled={restorePromptMutation.isPending}
										className='text-emerald-600 focus:text-emerald-700 font-medium'
									>
										<RotateCcw className='h-4 w-4 mr-2' />
										Restore Prompt
									</DropdownMenuItem>
								) : (
									<DropdownMenuItem
										className='text-destructive focus:text-destructive'
										onClick={handleArchiveClick}
										disabled={isProduction}
									>
										<Archive className='h-4 w-4 mr-2' />
										Archive Prompt
									</DropdownMenuItem>
								)}
							</DropdownMenuGroup>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>

			{/* Overview Metadata Bar */}
			<Card className='bg-muted/30'>
				<CardContent className='py-4'>
					<div className='flex flex-wrap items-center justify-between gap-4 text-xs'>
						<div className='flex items-center gap-4 flex-wrap text-muted-foreground'>
							<span className='flex items-center gap-1.5'>
								<Tag className='h-3.5 w-3.5 text-primary' />
								Model: <strong className='text-foreground'>{modelInfo.name}</strong>
							</span>
							<span>•</span>
							<span className='flex items-center gap-1.5'>
								<User className='h-3.5 w-3.5' />
								Author:{' '}
								<strong className='text-foreground'>
									{prompt.createdByName || 'System'}
								</strong>
							</span>
							<span>•</span>
							<span className='flex items-center gap-1.5'>
								<Calendar className='h-3.5 w-3.5' />
								Updated:{' '}
								<strong className='text-foreground'>
									{formatDate(prompt.updatedAt)}
								</strong>
							</span>
						</div>

						<div className='flex items-center gap-2'>
							<span className='text-muted-foreground'>Tags:</span>
							{prompt.tags && prompt.tags.length > 0 ? (
								prompt.tags.map((tag) => (
									<Badge
										key={tag}
										variant='outline'
										className={`${getTagColor(tag)} text-[10px] capitalize`}
									>
										{tag}
									</Badge>
								))
							) : (
								<span className='text-muted-foreground italic'>None</span>
							)}
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Main Tabs */}
			<div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
				<div className='lg:col-span-2 space-y-6'>
					<Tabs value={activeTab} onValueChange={setActiveTab}>
						<TabsList className='w-full justify-start'>
							<TabsTrigger value='editor'>Overview</TabsTrigger>
							<TabsTrigger value='test' className='gap-1.5'>
								<Play className='h-3.5 w-3.5' />
								Test & Evaluation
							</TabsTrigger>
							<TabsTrigger value='history' className='gap-1.5'>
								<History className='h-3.5 w-3.5' />
								Version History
							</TabsTrigger>
						</TabsList>

						<TabsContent value='editor' className='mt-6 space-y-6'>
							{prompt.description && (
								<Card>
									<CardHeader className='py-3'>
										<CardTitle className='text-sm'>Description</CardTitle>
									</CardHeader>
									<CardContent className='pb-4'>
										<p className='text-sm text-muted-foreground leading-relaxed'>
											{prompt.description}
										</p>
									</CardContent>
								</Card>
							)}

							<Card>
								<CardHeader className='pb-3 flex flex-row items-center justify-between'>
									<div>
										<CardTitle className='text-base'>Prompt Template</CardTitle>
										<CardDescription className='text-xs'>
											Read-only preview of the active prompt template.
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
									{prompt.promptType === 'ingredient_analysis' ? (
										<IngredientAnalysisEditor
											content={prompt.contentJson}
											editable={false}
										/>
									) : (
										<OcrParserEditor content={prompt.contentJson} editable={false} />
									)}
								</CardContent>
							</Card>

							{isContextUrlInserted && (
								<ContextUrlManager urls={prompt.contextUrls || []} readOnly={true} />
							)}

							<Card>
								<CardHeader className='pb-3'>
									<CardTitle className='text-base flex items-center justify-between'>
										<span>Required Runtime Variables ({typeConfig.label})</span>
										<span className='text-xs font-mono text-muted-foreground'>
											{validation.insertedCount} / {validation.totalRequired} Present
										</span>
									</CardTitle>
									<CardDescription className='text-xs'>
										Complete list of required variables for this prompt type and their
										presence in the template.
									</CardDescription>
								</CardHeader>
								<CardContent>
									<div className='max-h-[300px] overflow-y-auto pr-2'>
										<div className='space-y-1.5'>
											{typeConfig.variables.map((v) => {
												const isPresent = insertedVariablesSet.has(v.name);
												return (
													<div
														key={v.name}
														className={`flex items-center justify-between p-2 rounded-md border text-xs ${
															isPresent
																? 'bg-emerald-500/5 border-emerald-500/20'
																: 'bg-destructive/5 border-destructive/20'
														}`}
													>
														<div className='flex flex-col min-w-0 pr-2'>
															<span className='font-mono font-medium text-violet-700 dark:text-violet-400'>
																{`{{${v.name}}}`}
															</span>
															<span className='text-[10px] text-muted-foreground'>
																{v.category} · {v.description}
															</span>
														</div>
														<div className='flex items-center gap-1.5 shrink-0'>
															{isPresent ? (
																<Badge className='bg-emerald-500/15 text-emerald-700 border-emerald-500/30 gap-1 text-[10px]'>
																	<Check className='h-3 w-3' /> Included
																</Badge>
															) : (
																<Badge
																	variant='destructive'
																	className='gap-1 text-[10px]'
																>
																	<X className='h-3 w-3' /> Missing
																</Badge>
															)}
														</div>
													</div>
												);
											})}
										</div>
									</div>
								</CardContent>
							</Card>
						</TabsContent>

						<TabsContent value='test' className='mt-6'>
							<TestPanel
								template={prompt.contentTemplate || ''}
								variables={prompt.variables || []}
								contextUrls={prompt.contextUrls}
								promptType={prompt.promptType}
								promptName={prompt.name}
							/>
						</TabsContent>

						<TabsContent value='history' className='mt-6'>
							<VersionHistory
								promptId={prompt.id}
								promptName={prompt.name}
								currentVersion={prompt.version || 1}
							/>
						</TabsContent>
					</Tabs>
				</div>

				<div className='space-y-6'>
					<ActivityLog promptId={prompt.id} title='Recent Activity' maxHeight='500px' />
				</div>
			</div>

			<AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Archive "{prompt.name}"?</AlertDialogTitle>
						<AlertDialogDescription>
							This will archive the prompt. It can be restored later at any time from the
							archived prompts view.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDelete}
							className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
							disabled={deletePromptMutation.isPending}
						>
							{deletePromptMutation.isPending ? 'Archiving...' : 'Archive Prompt'}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			{/* Blocked Archiving / Status Alert Dialog for Production Prompts */}
			<AlertDialog open={productionBlockedOpen} onOpenChange={setProductionBlockedOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle className='flex items-center gap-2 text-destructive'>
							<Alert className='h-5 w-5' />
							Production Prompt Constraint
						</AlertDialogTitle>
						<AlertDialogDescription className='space-y-2 text-xs leading-relaxed'>
							<p>
								<strong>"{prompt.name}"</strong> is currently tagged as{' '}
								<span className='font-semibold text-emerald-600'>Production</span> for{' '}
								<strong>{typeConfig.label}</strong>.
							</p>
							<p>
								Production prompts must always remain in <strong>Active</strong> status
								and cannot be set to Draft or Archived directly.
							</p>
							<p className='bg-muted p-2 rounded text-muted-foreground border'>
								<strong>How to change this:</strong> Tag another prompt of this type as{' '}
								<em>Production</em>. This will automatically set the new prompt to Active,
								and demote this prompt to <em>Development</em> and <em>Draft</em> status.
							</p>
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel onClick={() => setProductionBlockedOpen(false)}>
							Understood
						</AlertDialogCancel>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
