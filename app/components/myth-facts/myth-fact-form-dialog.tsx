import { useEffect, useState, useRef, useCallback } from 'react';
import { useForm, FormProvider, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
	AlertDialog,
	AlertDialogContent,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogCancel
} from '@/components/ui/alert-dialog';

import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useAddMythFact, useUpdateMythFact } from '@/hooks/use-myth-fact-mutation';
import { mythFactSchema, type MythFactFormValues, type MythFact } from '@/zod/myth-fact';

import { toast } from 'sonner';
import { generateId } from '@/utils/generate-id';
import Loader from '../icons/loader';
import Plus from '../icons/plus';
import Trash from '../icons/trash';
import { Field, FieldError, FieldLabel } from '../ui/field';
import Upload from '../icons/upload';
import ImageCompositionOval from '../icons/image-composition-oval';
import X from '../icons/x';
import Video from '../icons/video';
import { useDropzone } from 'react-dropzone';
import { TopicImageDropzone } from './topic-image-dropzone';
import { PhotoView } from 'react-photo-view';
import Eye from '../icons/eye';
import _ from 'lodash';

import { MediaPlayer, MediaProvider } from '@vidstack/react';
import {
	DefaultAudioLayout,
	defaultLayoutIcons,
	DefaultVideoLayout
} from '@vidstack/react/player/layouts/default';
import { Skeleton } from '../ui/skeleton';
import { cn } from '@/lib/utils';
import CheckMarkBadge from '../icons/checkmark-badge';
import BadgeAlert from '../icons/badge-alert';

interface GuideFormDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	mythFact: MythFact | null;
	isEditing: boolean;
}

const defaultValues: MythFactFormValues = {
	name: '',
	id: null,
	displayImage: {
		fileHash: ''
	},
	videoGuide: {
		fileHash: ''
	},
	sources: [{ name: '', link: '' }],
	topics: [{ topic: '', fact: '', myth: '', fileHash: '', imageId: null, file: null }]
};

type FileExtended = File & {
	preview: string;
};

export function MythFactFormDialog({
	open,
	onOpenChange,
	mythFact,
	isEditing
}: GuideFormDialogProps) {
	const addMutation = useAddMythFact();
	const updateMutation = useUpdateMythFact();

	const [displayImageLoading, setDisplayImageLoading] = useState(true);
	const [videoGuideLoading, setVideoGuideLoading] = useState(true);

	const [displayImageLoadError, setDisplayImageLoadError] = useState(false);
	const [videoGuideLoadError, setVideoGuideLoadError] = useState(false);

	const [displayImagePreview, setDisplayImagePreview] = useState<string | null>(null);

	const form = useForm<MythFactFormValues>({
		resolver: zodResolver(mythFactSchema),
		defaultValues
	});

	const [videoOpenPreview, setVideoOpenPreview] = useState(false);

	const displayImageDropzone = useDropzone({
		multiple: false,
		accept: { 'image/*': ['.jpg', '.png', '.webp'] },
		onDrop: (acceptedFiles) => {
			const file = acceptedFiles[0];

			if (form.getFieldState('displayImage').invalid) {
				form.clearErrors('displayImage');
			}

			const fileHash = generateHash(
				file.name + file.lastModified.toString() + Date.now().toString()
			);

			form.setValue('displayImage.file', file, {
				shouldDirty: true,
				shouldValidate: true
			});
			form.setValue(`displayImage.fileHash`, fileHash, {
				shouldDirty: true,
				shouldValidate: true
			});
			setDisplayImagePreview(URL.createObjectURL(file));
			setDisplayImageLoading(true);
			setDisplayImageLoadError(false);
		}
	});

	const [videoGuidePreview, setVideoGuidePreview] = useState<string | null>(null);

	const videoGuideDropzone = useDropzone({
		multiple: false,
		accept: { 'video/*': ['.mp4'] },
		onDrop: (acceptedFiles) => {
			const file = acceptedFiles[0];

			if (form.getFieldState('videoGuide').invalid) {
				form.clearErrors('videoGuide');
			}

			const fileHash = generateHash(
				file.name + file.lastModified.toString() + Date.now().toString()
			);
			form.setValue('videoGuide.file', file, { shouldDirty: true, shouldValidate: true });
			form.setValue(`videoGuide.fileHash`, fileHash, {
				shouldDirty: true,
				shouldValidate: true
			});

			setVideoGuidePreview(URL.createObjectURL(file));
			setVideoGuideLoading(true);
			setVideoGuideLoadError(false);
		}
	});

	const [topicImagePreviews, setTopicImagePreviews] = useState<
		Map<string | number, string>
	>(new Map());

	const {
		fields: sourceFields,
		append: appendSource,
		remove: removeSource
	} = useFieldArray({
		control: form.control,
		name: 'sources'
	});

	const {
		fields: topicFields,
		append: appendTopic,
		remove: removeTopic
	} = useFieldArray({
		control: form.control,
		name: 'topics'
	});

	const handleRemoveImage = (e: any) => {
		e.stopPropagation();
		form.setValue('displayImage.file', null, { shouldDirty: true, shouldValidate: true });

		if (isEditing) {
			const previousFileHash = mythFact?.displayImage.fileHash as string;
			form.setValue(`displayImage.fileHash`, previousFileHash, {
				shouldDirty: true,
				shouldValidate: true
			});
		}

		if (isEditing) {
			// setDisplayImagePreview(
			// 	`${import.meta.env.VITE_CDN_BEAUWISE}/learn/${mythFact?.baseImagePath}/display_image.webp?q=${mythFact?.displayImage?.fileHash}`
			// );
		} else {
			setDisplayImagePreview(null);
		}
	};

	const handleRemoveVideo = (e: any) => {
		e.stopPropagation();

		form.setValue('videoGuide.file', null, { shouldDirty: true, shouldValidate: true });
		if (isEditing) {
			const previousFileHash = mythFact?.videoGuide.fileHash as string;
			form.setValue(`videoGuide.fileHash`, previousFileHash, {
				shouldDirty: true,
				shouldValidate: true
			});
		}

		if (isEditing) {
			// setVideoGuidePreview(
			// 	`https://${import.meta.env.VITE_CDN_BEAUWISE}/learn/${mythFact?.baseImagePath}/video_guide.mp4?q=${mythFact?.videoGuide?.fileHash}`
			// );
		} else {
			setVideoGuidePreview(null);
		}
	};

	const generateHash = (str: string) => {
		let hash = 0;
		for (const char of str) {
			hash = (hash << 5) - hash + char.charCodeAt(0);
			hash |= 0;
		}

		let stringHash = hash.toString();

		if (stringHash.startsWith('-')) {
			stringHash = stringHash.slice(1);
		}

		return stringHash;
	};

	const handleTopicImageFile = useCallback(
		(index: number, key: number | string, file: File) => {
			if (!file.type.startsWith('image/')) {
				toast.error('Please select an image file');
				return;
			}
			if (file.size > 5 * 1024 * 1024) {
				toast.error('Image must be less than 5MB');
				return;
			}

			const fileHash = generateHash(
				file.name + file.lastModified.toString() + Date.now().toString()
			);

			form.setValue(`topics.${index}.fileHash`, fileHash, {
				shouldDirty: true
			});

			form.setValue(`topics.${index}.file`, file, {
				shouldDirty: true,
				shouldValidate: true
			});

			console.log('after add 1 topic, values', form.getValues('topics'));
			setTopicImagePreviews((prev) => {
				const next = new Map(prev);

				next.set(key, URL.createObjectURL(file));

				return next;
			});
		},
		[]
	);

	const handleRemoveTopicImage = useCallback(
		(index: number, deletedKey: string | number) => {
			const previewUrl = topicImagePreviews.get(index);

			if (previewUrl?.startsWith('blob')) {
				URL.revokeObjectURL(previewUrl as string);
			}

			setTopicImagePreviews((prev) => {
				const next = new Map();

				prev.forEach((value, key) => {
					if (key === deletedKey) {
						return;
					}

					if (
						typeof key === 'number' &&
						typeof deletedKey === 'number' &&
						deletedKey <= key
					) {
						next.set(key - 1, value);
					} else {
						next.set(key, value);
					}
				});

				return next;
			});
		},
		[isEditing]
	);

	const handleRemoveTopic = (index: number, key: string | number) => {
		console.log('topic values', form.getValues('topics'));

		console.log('index', index);

		removeTopic(index);

		console.log('after remove 1 topic, values', form.getValues('topics'));
		handleRemoveTopicImage(index, key);
	};

	const updateButtonDisabled = isEditing && _.isEqual(form.getValues(), mythFact);

	const onSubmit = async (data: MythFactFormValues) => {
		if (isEditing && mythFact) {
			onOpenChange(false);
			updateMutation.mutate(
				{
					data
				},
				{
					onSuccess: () => {
						toast.success('Item Updated', {
							position: 'top-right',
							description: `${mythFact.name} updated successfully`,
							descriptionClassName: 'text-red',
							duration: 12000,
							icon: <CheckMarkBadge className='text-green-500 size-5' />,
							cancel: {
								label: (
									<X className='size-6 hover:bg-muted/80 duration-300 rounded-full p-1' />
								),
								onClick: () => {}
							}
						});
					},
					onError: (err) => {
						let message = 'Something went wrong. Please try again';

						if (err?.message) {
							message = err.message;
						}

						toast.error('Item Not Updated', {
							description: message,
							position: 'top-right',
							duration: 12000,
							icon: <BadgeAlert className='text-red-500 size-5' />,
							cancel: {
								label: (
									<X className='size-6 hover:bg-muted/80 duration-300 rounded-full p-1' />
								),
								onClick: () => {}
							}
						});
					}
				}
			);
		} else {
			if (!form.getValues('displayImage.file')) {
				form.setError('displayImage', { message: 'Please select an image file.' });

				return;
			}

			if (!form.getValues('videoGuide.file')) {
				form.setError('videoGuide', { message: 'Please select a video file.' });
				return;
			}

			const isEveryImageInTopicAttached = form.getValues('topics').every((item) => {
				return item.file;
			});

			if (isEveryImageInTopicAttached) {
				onOpenChange(false);
				addMutation.mutate(
					{
						data
					},
					{
						onSuccess: () => {
							form.reset(defaultValues);
							setTopicImagePreviews(new Map());
							setDisplayImagePreview(null);
							setVideoGuidePreview(null);

							toast.success('Item Added', {
								position: 'top-right',
								description: `${data.name} is added successfully`,
								descriptionClassName: 'text-red',
								duration: 12000,
								icon: <CheckMarkBadge className='text-green-500 size-5' />,
								cancel: {
									label: (
										<X className='size-6 hover:bg-muted/80 duration-300 rounded-full p-1' />
									),
									onClick: () => {}
								}
							});
						},
						onError: (err) => {
							let message = 'Something went wrong. Please try again';

							if (err?.message) {
								message = err.message;
							}

							toast.error('Item Not Added', {
								description: message,
								position: 'top-right',
								duration: 12000,
								icon: <BadgeAlert className='text-red-500 size-5' />,
								cancel: {
									label: (
										<X className='size-6 hover:bg-muted/80 duration-300 rounded-full p-1' />
									),
									onClick: () => {}
								}
							});
						}
					}
				);
			} else {
				form.setError('topics', { message: 'One of the topic has no image attached' });
			}
		}
	};

	const isPending = addMutation.isPending || updateMutation.isPending;

	useEffect(() => {
		if (open) {
			if (mythFact) {
				form.reset({
					name: mythFact.name,
					id: mythFact.id,
					displayImage: {
						fileHash: mythFact.displayImage?.fileHash
					},

					baseImagePath: mythFact.baseImagePath,

					videoGuide: {
						fileHash: mythFact.videoGuide?.fileHash
					},
					sources: mythFact.sources.map(({ name, link }) => ({ name, link })),
					topics: mythFact.topics.map((t) => ({
						topic: t.topic,
						fact: t.fact,
						myth: t.myth,
						imageId: t.imageId,
						fileHash: t?.fileHash,
						file: null
					}))
				});
				setDisplayImagePreview(
					`https://${import.meta.env.VITE_CDN_BEAUWISE}/learn/${mythFact?.baseImagePath}/display_image.webp?q=${mythFact?.displayImage?.fileHash}` ||
						null
				);
				setVideoGuidePreview(
					`https://${import.meta.env.VITE_CDN_BEAUWISE}/learn/${mythFact?.baseImagePath}/video_guide.mp4?q=${mythFact?.videoGuide?.fileHash}` ||
						null
				);
				mythFact.topics.forEach((t, i) => {
					if (t.fileHash) {
						topicImagePreviews.set(
							t.imageId as string,
							`https://${import.meta.env.VITE_CDN_BEAUWISE}/learn/${mythFact?.baseImagePath}/${t.imageId}.webp?q=${t.fileHash}`
						);
					}
				});

				setTopicImagePreviews((prev) => {
					const next = new Map(prev);
					return next;
				});
			} else {
				form.reset(defaultValues);
				setTopicImagePreviews(new Map());
				setDisplayImagePreview(null);
				setVideoGuidePreview(null);
			}
		}
	}, [open, mythFact, form]);
	return (
		<>
			<AlertDialog
				open={open}
				onOpenChange={(open, e) => {
					if (!open && e.reason === 'escape-key') {
						return;
					}

					onOpenChange(open);
				}}
			>
				<AlertDialogContent className='md:max-w-200 max-h-[90vh] overflow-y-auto'>
					<AlertDialogHeader>
						<AlertDialogTitle>{isEditing ? 'Edit Item' : 'Add Item'}</AlertDialogTitle>
						<AlertDialogDescription>
							{isEditing
								? `Update ${mythFact?.name} details below.`
								: 'Fill in the details to add a new mythFact.'}
						</AlertDialogDescription>
					</AlertDialogHeader>

					<form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
						<div className='flex flex-col gap-6'>
							<div className='flex-1 space-y-4'>
								<Controller
									control={form.control}
									name='name'
									render={({ field, fieldState: { error } }) => (
										<Field>
											<FieldLabel>
												Name <span className='text-destructive'>*</span>
											</FieldLabel>
											<Input placeholder='e.g., Skincare MythFact' {...field} />
											{/* {!isEditing && field.value && (
												<p className='text-xs text-muted-foreground'>
													ID: <code>{generateId(field.value)}</code>
												</p>
											)} */}

											<FieldError errors={[error]} />
										</Field>
									)}
								/>

								<div className='space-y-2'>
									<FieldLabel>Display Image</FieldLabel>

									<FieldError errors={[form.getFieldState('displayImage').error]} />

									<div className='flex items-start gap-3'>
										<div
											{...displayImageDropzone.getRootProps()}
											className={cn(
												'relative group w-24 h-24 rounded-lg border-2 border-dashed flex items-center justify-center bg-muted/30 overflow-hidden cursor-pointer transition-colors hover:border-primary/50 shrink-0',
												form.getFieldState('displayImage').invalid
													? 'border-destructive'
													: 'border-border',
												displayImageDropzone.isDragActive &&
													'border-primary bg-primary/10'
											)}
										>
											<input {...displayImageDropzone.getInputProps()} />

											{displayImagePreview ? (
												<>
													{displayImageLoading && !displayImageLoadError && (
														<Skeleton className='absolute inset-0 w-full h-full z-10' />
													)}

													{displayImageLoadError ? (
														<div className='flex flex-col items-center justify-center text-[10px] text-destructive p-1 text-center z-10'>
															<span>Image failed to load</span>
														</div>
													) : (
														<img
															src={displayImagePreview}
															key={displayImagePreview}
															onLoad={() => setDisplayImageLoading(false)}
															onError={() => {
																setDisplayImageLoading(false);
																setDisplayImageLoadError(true);
															}}
															alt='Preview'
															className={cn(
																'w-full h-full object-cover transition-opacity duration-200',
																displayImageLoading ? 'opacity-0' : 'opacity-100'
															)}
														/>
													)}

													{!displayImageLoading && !displayImageLoadError && (
														<div className='absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20'>
															<Upload className='h-4 w-4 text-white' />
														</div>
													)}
												</>
											) : (
												<div className='flex flex-col items-center gap-0.5 text-muted-foreground'>
													<ImageCompositionOval className='h-6 w-6' />
													<span className='text-[10px]'>
														{displayImageDropzone.isDragActive
															? 'Drop image...'
															: 'Upload'}
													</span>
												</div>
											)}
										</div>

										{!displayImageLoadError && displayImagePreview && (
											<div className='flex flex-col gap-1'>
												{!isEditing && (
													<Button
														type='button'
														variant='ghost'
														size='icon'
														onClick={(e) => {
															e.stopPropagation();
															handleRemoveImage(e);
														}}
														className='h-7 w-7 text-destructive hover:text-destructive'
													>
														<X className='h-4 w-4' />
													</Button>
												)}

												<PhotoView src={displayImagePreview}>
													<Button
														type='button'
														variant='ghost'
														size='icon'
														onClick={(e) => e.stopPropagation()}
														className='h-7 w-7 flex items-center justify-center'
													>
														<Eye className='h-4 w-4' />
													</Button>
												</PhotoView>
											</div>
										)}
									</div>
								</div>

								<div className='space-y-2'>
									<FieldLabel>Video Guide</FieldLabel>
									<FieldError errors={[form.getFieldState('videoGuide').error]} />

									<div className='flex items-start gap-3'>
										<div
											{...videoGuideDropzone.getRootProps()}
											className={cn(
												'relative group w-40 h-24 rounded-lg border-2 border-dashed flex items-center justify-center bg-muted/30 overflow-hidden cursor-pointer transition-colors hover:border-primary/50 shrink-0',
												form.getFieldState('videoGuide').invalid
													? 'border-destructive'
													: 'border-border',
												videoGuideDropzone.isDragActive && 'border-primary bg-primary/10'
											)}
										>
											<input {...videoGuideDropzone.getInputProps()} />

											{videoGuidePreview ? (
												<>
													{videoGuideLoading && !videoGuideLoadError && (
														<Skeleton className='absolute inset-0 w-full h-full z-10' />
													)}

													{videoGuideLoadError ? (
														<div className='flex flex-col items-center justify-center text-[10px] text-destructive p-1 text-center z-10'>
															<span>Video failed to load</span>
														</div>
													) : (
														<video
															key={videoGuidePreview}
															src={videoGuidePreview}
															onLoadedData={() => setVideoGuideLoading(false)}
															onError={() => {
																setVideoGuideLoading(false);
																setVideoGuideLoadError(true);
															}}
															className={cn(
																'w-full h-full object-cover transition-opacity duration-200',
																videoGuideLoading ? 'opacity-0' : 'opacity-100'
															)}
															muted
															playsInline
														/>
													)}

													{!videoGuideLoading && !videoGuideLoadError && (
														<div className='absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20'>
															<Upload className='h-4 w-4 text-white' />
														</div>
													)}
												</>
											) : (
												<div className='flex flex-col items-center gap-0.5 text-muted-foreground'>
													<Video className='h-6 w-6' />
													<span className='text-[10px]'>
														{videoGuideDropzone.isDragActive ? 'Drop video...' : 'Upload'}
													</span>
												</div>
											)}
										</div>

										{!videoGuideLoadError && videoGuidePreview && (
											<div className='flex flex-col gap-1'>
												{!isEditing && (
													<Button
														type='button'
														variant='ghost'
														size='icon'
														onClick={(e) => {
															e.stopPropagation();
															handleRemoveVideo(e);
														}}
														className='h-7 w-7 text-destructive hover:text-destructive'
													>
														<X className='h-4 w-4' />
													</Button>
												)}

												<Button
													type='button'
													variant='ghost'
													size='icon'
													onClick={(e) => {
														e.stopPropagation();
														setVideoOpenPreview(true);
													}}
													className='h-7 w-7 flex items-center justify-center'
												>
													<Eye className='h-4 w-4' />
												</Button>
											</div>
										)}
									</div>
								</div>
								<div className='space-y-3'>
									<div className='flex items-center justify-between'>
										<FieldLabel className='text-sm font-medium'>
											Sources <span className='text-destructive'>*</span>
										</FieldLabel>
										<Button
											type='button'
											variant='outline'
											size='sm'
											onClick={() => appendSource({ name: '', link: '' })}
											className='h-7 gap-1 text-xs'
										>
											<Plus className='h-3 w-3' />
											Add
										</Button>
									</div>

									{sourceFields.map((field, index) => (
										<div
											key={field.id}
											className='flex items-start gap-2 rounded-lg border border-border/50 bg-muted/30 p-2.5'
										>
											<div className='flex-1 space-y-1.5'>
												<Controller
													control={form.control}
													name={`sources.${index}.name`}
													render={({ field, fieldState: { error } }) => (
														<Field>
															<Input
																placeholder='Source name *'
																{...field}
																className='h-8 text-sm'
															/>
															<FieldError errors={[error]} />
														</Field>
													)}
												/>
												<Controller
													control={form.control}
													name={`sources.${index}.link`}
													render={({ field, fieldState: { error } }) => (
														<Field>
															<Input
																placeholder='https://... *'
																{...field}
																className='h-8 text-sm'
															/>
															<FieldError errors={[error]} />
														</Field>
													)}
												/>
											</div>
											{sourceFields.length > 1 && (
												<Button
													type='button'
													variant='ghost'
													size='icon'
													onClick={() => removeSource(index)}
													className='h-7 w-7 shrink-0 text-destructive hover:text-destructive'
												>
													<Trash className='h-3.5 w-3.5' />
												</Button>
											)}
										</div>
									))}

									{form.formState.errors.sources?.message && (
										<p className='text-sm font-medium text-destructive'>
											{form.formState.errors.sources.message}
										</p>
									)}
								</div>
							</div>

							<div className='flex-1 space-y-4'>
								<div className='flex items-center justify-between'>
									<Field>
										<FieldLabel className='text-sm'>
											Topics <span className='text-destructive'>*</span>
										</FieldLabel>
									</Field>
									<Button
										type='button'
										variant='outline'
										size='sm'
										onClick={() => {
											appendTopic({ topic: '', fact: '', myth: '', fileHash: '' });
										}}
										className='h-7 gap-1 text-xs'
									>
										<Plus className='h-3 w-3' />
										Add Topic
									</Button>
								</div>

								{topicFields.length === 0 && (
									<p className='text-sm text-muted-foreground py-4 text-center'>
										Add at least one topic.
									</p>
								)}

								<div className='space-y-3 max-h-[55vh] overflow-y-auto pr-1'>
									{topicFields.map((field, index) => (
										<div
											key={field.id}
											className='rounded-lg border border-border/50 bg-muted/30 p-3 space-y-2.5'
										>
											<div className='flex items-center justify-between'>
												<span className='text-xs font-medium text-muted-foreground'>
													Topic {index + 1}
												</span>
												{topicFields.length > 1 && (
													<Button
														type='button'
														variant='ghost'
														size='icon'
														onClick={() =>
															handleRemoveTopic(
																index,
																field.imageId ? field.imageId : index
															)
														}
														className='h-6 w-6 text-destructive hover:text-destructive'
													>
														<Trash className='h-3.5 w-3.5' />
													</Button>
												)}
											</div>
											{/* Topic Name */}
											<Controller
												control={form.control}
												name={`topics.${index}.topic`}
												render={({ field: f, fieldState: { error } }) => (
													<Field>
														<Input
															placeholder='Topic name *'
															{...f}
															className='h-8 text-sm'
														/>

														<FieldError errors={[error]} />
													</Field>
												)}
											/>
											{/* Fact */}
											<Controller
												control={form.control}
												name={`topics.${index}.fact`}
												render={({ field: f, fieldState: { error } }) => (
													<Field>
														<Textarea
															placeholder='Fact *'
															rows={2}
															{...f}
															className='text-sm resize-none'
														/>
														<FieldError errors={[error]} />
													</Field>
												)}
											/>
											{/* Myth */}
											<Controller
												control={form.control}
												name={`topics.${index}.myth`}
												render={({ field: f, fieldState: { error } }) => (
													<Field>
														<Textarea
															placeholder='Myth *'
															rows={2}
															{...f}
															className='text-sm resize-none'
														/>
														<FieldError errors={[error]} />
													</Field>
												)}
											/>

											<Controller
												control={form.control}
												name={`topics.${index}.file`}
												render={({ fieldState: { error } }) => {
													const key = field.imageId ? field.imageId : index;
													const url = topicImagePreviews.get(key);

													return (
														<Field>
															<TopicImageDropzone
																topicKey={key}
																index={index}
																isRemoveVisible={!isEditing}
																previewUrl={url}
																altTitle={field.topic ? field.topic : `topic-${index}`}
																onImageDrop={handleTopicImageFile}
																onRemoveImage={handleRemoveTopicImage}
															/>
															<FieldError errors={[error]} />
														</Field>
													);
												}}
											/>
										</div>
									))}

									<FieldError errors={[form.getFieldState('topics').error]} />
								</div>
							</div>
						</div>

						<AlertDialogFooter>
							<AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
							<Button type='submit' disabled={isPending || !form.formState.isDirty}>
								{isPending && <Loader className='mr-2 h-4 w-4 animate-spin' />}
								{isEditing ? 'Update' : 'Add'} Item
							</Button>
						</AlertDialogFooter>
					</form>
				</AlertDialogContent>
			</AlertDialog>

			<AlertDialog
				open={videoOpenPreview}
				onOpenChange={(open, e) => {
					setVideoOpenPreview(open);
				}}
			>
				<AlertDialogContent className='w-200 bg-transparent'>
					<MediaPlayer
						className='w-400'
						viewType='video'
						streamType={isEditing ? 'unknown' : 'on-demand'}
						title='Video Guide Preview'
						src={{
							src: videoGuidePreview,
							type: form.getValues('videoGuide.file')?.type
						}}
					>
						<MediaProvider />
						<DefaultAudioLayout icons={defaultLayoutIcons} />
						<DefaultVideoLayout icons={defaultLayoutIcons} />
					</MediaPlayer>
					<AlertDialogCancel variant='default'>Close</AlertDialogCancel>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
