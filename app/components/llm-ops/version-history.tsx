import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle
} from '@/components/ui/card';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger
} from '@/components/ui/dialog';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger
} from '@/components/ui/alert-dialog';

import { usePromptVersions, useRollbackVersion } from '@/hooks/llm-ops/use-versions';
import { GEMINI_MODELS } from '@/constants/llm-ops';
import type { PromptVersion } from '@/types/llm-ops';

import { Timestamp } from 'firebase/firestore';
import GitBranch from '@/components/icons/git-branch';
import Eye from '@/components/icons/eye';
import RotateCcw from '@/components/icons/rotate-ccw';
import Loader from '@/components/icons/loader';
import Clock from '@/components/icons/clock';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface VersionHistoryProps {
	promptId: string;
	promptName: string;
	currentVersion: number;
}

function formatDate(timestamp: Timestamp): string {
	return timestamp.toDate().toLocaleDateString('en-US', {
		month: 'short',
		day: 'numeric',
		year: 'numeric',
		hour: '2-digit',
		minute: '2-digit'
	});
}

function VersionViewDialog({ version }: { version: PromptVersion }) {
	const modelName =
		GEMINI_MODELS.find((m) => m.id === version.model)?.name || version.model;

	return (
		<Dialog>
			<DialogTrigger
				render={
					<Button variant='ghost' size='sm' className='h-7 px-2 gap-1 text-xs'>
						<Eye className='h-3 w-3' />
						View
					</Button>
				}
			/>

			<DialogContent className='max-w-2xl max-h-[80vh]'>
				<DialogHeader>
					<DialogTitle className='flex items-center gap-2 text-base'>
						<GitBranch className='h-4 w-4 text-violet-500' />
						Version {version.version}
					</DialogTitle>
					<DialogDescription className='text-xs'>
						Created by {version.createdByName} on {formatDate(version.createdAt)}
					</DialogDescription>
				</DialogHeader>

				<ScrollArea className='max-h-[50vh] pr-4 overflow-hidden'>
					<div className='space-y-4 py-2'>
						{/* Change note */}
						{version.changeNote && (
							<div className='space-y-1'>
								<p className='text-xs font-medium text-muted-foreground'>Change Note</p>
								<p className='text-sm bg-muted/50 rounded-lg p-3'>{version.changeNote}</p>
							</div>
						)}

						{/* Model info */}
						<div className='space-y-1'>
							<p className='text-xs font-medium text-muted-foreground'>Model</p>
							<Badge variant='outline' className='text-xs'>
								{modelName}
							</Badge>
						</div>

						{/* Variables */}
						{version.variables.length > 0 && (
							<div className='space-y-1'>
								<p className='text-xs font-medium text-muted-foreground'>Variables</p>
								<div className='flex flex-wrap gap-1'>
									{version.variables.map((v) => (
										<Badge
											key={v}
											variant='outline'
											className='text-[10px] font-mono bg-violet-500/10 text-violet-700 border-violet-500/20'
										>
											{`{{${v}}}`}
										</Badge>
									))}
								</div>
							</div>
						)}

						{/* Tags */}
						{version.tags.length > 0 && (
							<div className='space-y-1'>
								<p className='text-xs font-medium text-muted-foreground'>Tags</p>
								<div className='flex flex-wrap gap-1'>
									{version.tags.map((tag) => (
										<Badge key={tag} variant='outline' className='text-[10px] capitalize'>
											{tag}
										</Badge>
									))}
								</div>
							</div>
						)}

						{/* Content preview */}
						<div className='space-y-1'>
							<p className='text-xs font-medium text-muted-foreground'>
								Template Content
							</p>
							<pre className='p-3 rounded-lg bg-muted text-xs font-mono whitespace-pre-wrap break-words leading-relaxed border'>
								{version.contentTemplate || 'No template content'}
							</pre>
						</div>
					</div>
				</ScrollArea>
			</DialogContent>
		</Dialog>
	);
}

export function VersionHistory({
	promptId,
	promptName,
	currentVersion
}: VersionHistoryProps) {
	const {
		data: versions,
		isLoading,
		isError,
		isRefetchError
	} = usePromptVersions(promptId);
	const rollbackMutation = useRollbackVersion();

	const [open, setOpen] = useState(false);

	return (
		<Card>
			<CardHeader className='pb-3'>
				<div className='flex items-center gap-2'>
					<div className='h-8 w-8 rounded-lg bg-violet-500/10 flex items-center justify-center'>
						<GitBranch className='h-4 w-4 text-violet-600' />
					</div>
					<div>
						<CardTitle className='text-sm'>Version History</CardTitle>
						<CardDescription className='text-xs'>
							Current version: v{currentVersion}
						</CardDescription>
					</div>
				</div>
			</CardHeader>

			<CardContent>
				{isLoading ? (
					<div className='space-y-3'>
						{Array.from({ length: 3 }).map((_, i) => (
							<div key={i} className='animate-pulse flex items-center gap-3 p-3'>
								<div className='h-6 w-12 bg-muted rounded' />
								<div className='flex-1 space-y-1.5'>
									<div className='h-3 bg-muted rounded w-3/4' />
									<div className='h-2 bg-muted rounded w-1/2' />
								</div>
							</div>
						))}
					</div>
				) : !versions || versions.length === 0 ? (
					<div className='text-center py-8 text-sm text-muted-foreground'>
						<GitBranch className='h-8 w-8 mx-auto mb-2 opacity-30' />
						<p>No version history yet.</p>
					</div>
				) : (
					<div className='max-h-200 overflow-y-auto pr-2'>
						<div className='space-y-1'>
							{versions.map((version) => {
								const isCurrent = version.version === currentVersion;
								const modelName =
									GEMINI_MODELS.find((m) => m.id === version.model)?.name ||
									version.model;

								return (
									<div
										key={version.id}
										className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
											isCurrent
												? 'bg-primary/5 border border-primary/20'
												: 'hover:bg-muted/50'
										}`}
									>
										{/* Version badge */}
										<Badge
											variant={isCurrent ? 'default' : 'outline'}
											className='shrink-0 text-xs font-mono tabular-nums'
										>
											v{version.version}
										</Badge>

										{/* Info */}
										<div className='flex-1 min-w-0'>
											<p className='text-sm truncate'>
												{version.changeNote || 'No change note'}
											</p>
											<div className='flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5'>
												<Clock className='h-3 w-3' />
												<span>{formatDate(version.createdAt)}</span>
												<span>·</span>
												<span>{version.createdByName}</span>
												<span>·</span>
												<span>{modelName}</span>
											</div>
										</div>

										<div className='flex items-center gap-1 shrink-0'>
											<VersionViewDialog version={version} />

											<AlertDialog open={open} onOpenChange={setOpen}>
												<AlertDialogTrigger
													onClick={() => setOpen(true)}
													render={
														<Button
															variant='ghost'
															size='sm'
															className='h-7 px-2 gap-1 text-xs text-orange-600 hover:text-orange-700 hover:bg-orange-500/10'
															disabled={rollbackMutation.isPending}
														>
															{rollbackMutation.isPending ? (
																<Loader className='h-3 w-3 animate-spin' />
															) : (
																<RotateCcw className='h-3 w-3' />
															)}
															Rollback
														</Button>
													}
												/>

												<AlertDialogContent>
													<AlertDialogHeader>
														<AlertDialogTitle>
															Rollback to v{version.version}?
														</AlertDialogTitle>
														<AlertDialogDescription>
															This will restore the prompt to version {version.version}{' '}
															and create a new version entry. The current content will be
															preserved in the version history.
														</AlertDialogDescription>
													</AlertDialogHeader>
													<AlertDialogFooter>
														<AlertDialogCancel>Cancel</AlertDialogCancel>
														<AlertDialogAction
															render={
																<Button
																	disabled={rollbackMutation.isPending}
																	onClick={(e) => {
																		e.preventDefault();
																		rollbackMutation.mutate(
																			{
																				promptId,
																				versionId: version.id,
																				promptName,
																				version: version.version
																			},
																			{
																				onSuccess: () => {
																					setOpen(false);
																					toast.success('Rolled back successfully!');
																				}
																			}
																		);
																	}}
																>
																	Rollback
																</Button>
															}
														></AlertDialogAction>
													</AlertDialogFooter>
												</AlertDialogContent>
											</AlertDialog>
										</div>
									</div>
								);
							})}
						</div>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
