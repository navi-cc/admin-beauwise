import React, { useEffect, useState, useRef } from 'react';
import { useForm, FormProvider, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter
} from '@/components/ui/dialog';
// import {
// 	Form,
// 	FormField,
// 	FormItem,
// 	FormLabel,
// 	FormControl,
// 	FormMessage
// } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useAddConsumer, useUpdateConsumer } from '@/hooks/use-consumer-mutation';
import {
	consumerGuideFormSchema,
	type ConsumerGuideFormValues,
	type ConsumerGuide
} from '@/zod/consumer-guide';
import { toast } from 'sonner';
import Loader from '../icons/loader';
import Plus from '../icons/plus';
import Trash from '../icons/trash';
import ImageUp from '../icons/image-up';
import ImageCompositionOval from '../icons/image-composition-oval';
import { Field, FieldError, FieldLabel } from '../ui/field';
import { generateId } from '@/utils/generate-id';
import { useDropzone } from 'react-dropzone';
import { cn } from '@/lib/utils';
import { PhotoView } from 'react-photo-view';
import Eye from '../icons/eye';
import { Skeleton } from '../ui/skeleton';
interface ItemFormDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	item?: ConsumerGuide | null;
}

const defaultValues: ConsumerGuideFormValues = {
	name: '',
	definition: '',
	sources: [{ name: '', link: '' }],
	usage: '',
	fileHash: '',
	imageId: ''
};

export function ConsumerGuideFormDialog({
	open,
	onOpenChange,
	item
}: ItemFormDialogProps) {
	const isEditing = !!item;

	const [imagePreview, setImagePreview] = useState<string | null>(null);
	const [imageLoading, setImageLoading] = useState(true);
	const [imageLoadError, setImageLoadError] = useState(false);

	const { getRootProps, getInputProps, inputRef, isDragAccept, isDragReject } =
		useDropzone({
			multiple: false,
			accept: { 'image/*': ['.jpg', '.png', '.webp'] },
			onDrop: (acceptedFiles) => {
				const file = acceptedFiles[0];

				if (form.getFieldState('file').invalid) {
					form.clearErrors('file');
				}

				const fileHash = generateHash(
					file.name + file.lastModified.toString() + Date.now().toString()
				);

				form.setValue('file', file, { shouldDirty: true, shouldValidate: true });
				form.setValue('fileHash', fileHash, { shouldDirty: true, shouldValidate: true });
				setImagePreview(URL.createObjectURL(file));
				setImageLoading(true);
				setImageLoadError(false);
			}
		});

	const addMutation = useAddConsumer();
	const updateMutation = useUpdateConsumer();

	const form = useForm<ConsumerGuideFormValues>({
		resolver: zodResolver(consumerGuideFormSchema),
		defaultValues
	});

	const { fields, append, remove } = useFieldArray({
		control: form.control,
		name: 'sources'
	});

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

	const handleRemoveImage = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
		e.stopPropagation();

		if (item) {
			form.setValue('fileHash', item?.fileHash as string, { shouldDirty: true });
		}

		form.setValue('file', null, { shouldDirty: true, shouldValidate: true });
		setImagePreview(null);
		inputRef.current.value = '';
	};

	const onSubmit = async (data: ConsumerGuideFormValues) => {
		if (isEditing && item) {
			onOpenChange(false);
			updateMutation.mutate(
				{
					data
				},
				{
					onSuccess: (result: any) => {
						if (result?.code === 'app_error') {
							throw new Error(result?.message);
						}

						toast.success(`${item.name} updated successfully.`);
					},
					onError: (err) => toast.error(err.message)
				}
			);
		} else {
			if (!form.getValues('file')) {
				form.setError('file', { message: 'Please select an image file.' });

				return;
			}

			addMutation.mutate(
				{ data },
				{
					onSuccess: () => toast.success(`${data.name} added successfully`),
					onError: (err) => toast.error(err.message)
				}
			);
			onOpenChange(false);
		}
	};

	const isPending = addMutation.isPending || updateMutation.isPending;

	useEffect(() => {
		if (open) {
			if (item) {
				form.reset({
					id: item.id,
					name: item.name,
					definition: item.definition,
					fileHash: item.fileHash,
					imageId: item.imageId,
					sources: item.sources,
					usage: item.usage,
					file: null
				});
				setImagePreview(
					`https://${import.meta.env.VITE_CDN_BEAUWISE}/learn/cosmetic_guides/${item?.imageId}.webp?q=${item?.fileHash}` ||
						null
				);
			} else {
				form.reset(defaultValues);
				setImagePreview(null);
			}
		}
	}, [open, item, form]);

	useEffect(() => {
		return () => URL.revokeObjectURL(imagePreview as string);
	}, []);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
				<DialogHeader>
					<DialogTitle>{isEditing ? 'Edit Item' : 'Add Item'}</DialogTitle>
					<DialogDescription>
						{isEditing
							? 'Update the item details below.'
							: 'Fill in the details to add a new item.'}
					</DialogDescription>
				</DialogHeader>

				<FormProvider {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className='space-y-5'>
						<div className='space-y-2'>
							<FieldLabel>Image</FieldLabel>
							<FieldError errors={[form.getFieldState('file').error]} />
							<div className='flex items-center gap-4'>
								<div
									{...getRootProps()}
									className={cn(
										'relative group w-32 h-32 rounded-lg border-2 border-dashed flex items-center justify-center bg-muted/30 overflow-hidden cursor-pointer transition-colors hover:border-primary/50 hover:bg-muted/50 shrink-0',
										isDragAccept || form.getValues('file')
											? 'border-emerald-500 bg-emerald-500/5'
											: isDragReject
												? 'border-destructive bg-destructive/5'
												: 'border-border'
									)}
								>
									<input {...getInputProps()} />

									{imagePreview ? (
										<>
											{imageLoading && !imageLoadError && (
												<Skeleton className='absolute inset-0 w-full h-full z-10' />
											)}

											{imageLoadError ? (
												<div className='flex flex-col items-center justify-center text-xs text-destructive p-2 text-center z-10'>
													<span>Image failed to load</span>
												</div>
											) : (
												<img
													key={imagePreview}
													src={imagePreview}
													onLoad={() => setImageLoading(false)}
													onError={() => {
														setImageLoading(false);
														setImageLoadError(true);
													}}
													alt='Preview'
													className={cn(
														'w-full h-full object-cover transition-opacity duration-200',
														imageLoading ? 'opacity-0' : 'opacity-100'
													)}
												/>
											)}

											{!imageLoading && !imageLoadError && (
												<div className='absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20'>
													<ImageUp className='h-5 w-5 text-white' />
												</div>
											)}
										</>
									) : (
										<div className='flex flex-col items-center gap-1 text-muted-foreground'>
											<ImageCompositionOval className='h-8 w-8' />
											<span className='text-xs'>Upload</span>
										</div>
									)}
								</div>

								{/* Info text & Remove button */}
								<div className='flex flex-col gap-2 pt-1'>
									<p className='text-xs text-muted-foreground'>
										{isDragReject ? (
											<span className='text-destructive font-medium'>
												Invalid File Type. Only JPG, PNG, and WEBP are allowed.
											</span>
										) : (
											<>
												Click to upload or drag & drop.
												<br />
												Max 5MB. JPG, PNG, WebP.
											</>
										)}
									</p>

									{!imageLoadError && imagePreview && (
										<div className='flex flex-col gap-1'>
											<Button
												type='button'
												variant='outline'
												size='sm'
												onClick={(e) => {
													e.stopPropagation();
													handleRemoveImage(e);
												}}
												className='w-fit gap-1 text-destructive hover:text-destructive'
											>
												<Trash className='h-3 w-3' />
												Remove
											</Button>

											<PhotoView src={imagePreview}>
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
						</div>

						<Controller
							control={form.control}
							name='name'
							render={({ field, fieldState: { invalid, error } }) => (
								<Field>
									<FieldLabel>
										Name <span className='text-destructive'>*</span>
									</FieldLabel>

									<Input placeholder='e.g., Vitamin C' {...field} />

									{invalid && <FieldError errors={[error]} />}
								</Field>
							)}
						/>

						<Controller
							control={form.control}
							name='definition'
							render={({ field, fieldState: { invalid, error } }) => (
								<Field>
									<FieldLabel>
										Definition <span className='text-destructive'>*</span>
									</FieldLabel>

									<Textarea
										placeholder='Describe what this item is...'
										rows={3}
										{...field}
									/>

									{invalid && <FieldError errors={[error]} />}
								</Field>
							)}
						/>

						<Controller
							control={form.control}
							name='usage'
							render={({ field, fieldState: { invalid, error } }) => (
								<Field>
									<FieldLabel>
										Usage <span className='text-destructive'>*</span>
									</FieldLabel>

									<Input placeholder='Describe what this item is for...' {...field} />

									{invalid && <FieldError errors={[error]} />}
								</Field>
							)}
						/>

						{/* Sources — Dynamic field array */}
						<div className='space-y-3'>
							<div className='flex items-center justify-between'>
								<FieldLabel className='text-sm font-medium'>
									Sources <span className='text-destructive'>*</span>
								</FieldLabel>
								<Button
									type='button'
									variant='outline'
									size='sm'
									onClick={() => append({ name: '', link: '' })}
									className='h-7 gap-1 text-xs'
								>
									<Plus className='h-3 w-3' />
									Add Source
								</Button>
							</div>

							{fields.length === 0 && (
								<p className='text-sm text-muted-foreground py-2'>
									No sources added. Click "Add Source" to add at least one.
								</p>
							)}

							{fields.map((field, index) => (
								<div
									key={field.id}
									className='flex items-start gap-2 rounded-lg border border-border/50 bg-muted/30 p-3'
								>
									<div className='flex-1 space-y-2'>
										<Controller
											control={form.control}
											name={`sources.${index}.name`}
											render={({ field, fieldState: { invalid, error } }) => (
												<Field>
													<Input
														placeholder='Source name *'
														{...field}
														className='h-8 text-sm'
													/>
													{invalid && <FieldError errors={[error]} />}
												</Field>
											)}
										/>
										<Controller
											control={form.control}
											name={`sources.${index}.link`}
											render={({ field, fieldState: { error, invalid } }) => (
												<Field>
													<Input
														placeholder='https://example.com *'
														{...field}
														className='h-8 text-sm'
													/>
													{invalid && <FieldError errors={[error]} />}
												</Field>
											)}
										/>
									</div>
									{fields.length > 1 && (
										<Button
											type='button'
											variant='ghost'
											size='icon'
											onClick={() => remove(index)}
											className='h-8 w-8 shrink-0 text-destructive hover:text-destructive'
										>
											<Trash className='h-4 w-4' />
										</Button>
									)}
								</div>
							))}

							{form.formState.errors.sources?.root && (
								<p className='text-sm font-medium text-destructive'>
									{form.formState.errors.sources.root.message}
								</p>
							)}
							{form.formState.errors.sources?.message && (
								<p className='text-sm font-medium text-destructive'>
									{form.formState.errors.sources.message}
								</p>
							)}
						</div>

						<DialogFooter className='pt-4'>
							<Button
								type='button'
								variant='outline'
								onClick={() => onOpenChange(false)}
								disabled={isPending}
							>
								Cancel
							</Button>
							<Button type='submit' disabled={isPending || !form.formState.isDirty}>
								{isPending && <Loader className='mr-2 h-4 w-4 animate-spin' />}
								{isEditing ? 'Update' : 'Add'} Item
							</Button>
						</DialogFooter>
					</form>
				</FormProvider>
			</DialogContent>
		</Dialog>
	);
}
