import { cn } from '@/lib/utils';
import ImageCompositionOval from '../icons/image-composition-oval';
import Upload from '../icons/upload';
import { Button } from '../ui/button';
import { useDropzone } from 'react-dropzone';
import { useCallback, useEffect, useState } from 'react';
import { PhotoView } from 'react-photo-view';
import Eye from '../icons/eye';
import X from '../icons/x';
import { Skeleton } from '../ui/skeleton';

type TopicImageDropzoneProps = {
	topicKey: string | number;
	index: number;
	previewUrl?: string;
	altTitle: string;
	isRemoveVisible: boolean;
	disabled: boolean;
	onImageDrop: (index: number, key: string | number, file: File) => void;

	onRemoveImage: (index: number, key: string | number) => void;
};

export function TopicImageDropzone({
	topicKey,
	index,
	previewUrl,
	altTitle,
	disabled,
	isRemoveVisible,
	onImageDrop,
	onRemoveImage
}: TopicImageDropzoneProps) {
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(false);

	const onDrop = useCallback(
		(acceptedFiles: File[]) => {
			const file = acceptedFiles[0];
			if (file) {
				onImageDrop(index, topicKey, file);
			}
		},
		[index, onImageDrop]
	);

	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		onDrop,
		accept: { 'image/*': [] },
		maxFiles: 1,
		multiple: false
	});

	useEffect(() => {
		setLoading(true);
		setError(false);

		return () => {
			if (previewUrl?.startsWith('blob:')) {
				URL.revokeObjectURL(previewUrl);
			}
		};
	}, [previewUrl]);

	return (
		<div className='flex items-center gap-2'>
			<div
				{...getRootProps()}
				className={cn(
					'relative group w-16 h-16 rounded-md border-2 border-dashed border-border flex items-center justify-center bg-muted/20 overflow-hidden cursor-pointer transition-colors hover:border-primary/50 shrink-0',
					isDragActive && 'border-primary bg-primary/10'
				)}
			>
				<input {...getInputProps()} disabled={disabled} />

				{previewUrl ? (
					<>
						{loading && !error && (
							<Skeleton className='absolute inset-0 w-full h-full z-10' />
						)}

						{error ? (
							<div className='flex flex-col items-center justify-center text-[10px] text-destructive p-1 text-center z-10'>
								<span>Image failed to load</span>
							</div>
						) : (
							<img
								key={previewUrl}
								onLoad={() => setLoading(false)}
								onError={() => {
									setError(true);
									setLoading(false);
								}}
								src={previewUrl}
								alt={altTitle}
								className={cn(
									'w-full h-full object-cover transition-opacity duration-200',
									loading ? 'opacity-0' : 'opacity-100'
								)}
							/>
						)}

						{!loading && !error && (
							<div className='absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20'>
								<Upload className='h-3 w-3 text-white' />
							</div>
						)}
					</>
				) : (
					<ImageCompositionOval className='h-5 w-5 text-muted-foreground/50' />
				)}
			</div>
			<div className='flex flex-col'>
				<span className='text-[10px] text-muted-foreground'>
					{isDragActive && 'Drop image...'}
				</span>
				{!error && previewUrl && (
					<div className='flex gap-1'>
						{/* {isRemoveVisible && (
							<Button
								type='button'
								variant='ghost'
								size='sm'
								onClick={(e) => {
									e.stopPropagation();
									onRemoveImage(index, topicKey);
								}}
								className='text-destructive hover:text-destructive w-fit p-1 h-auto'
							>
								<X className='size-4' />
							</Button>
						)} */}

						<PhotoView src={previewUrl}>
							<Button
								variant='ghost'
								size='sm'
								onClick={(e) => e.stopPropagation()}
								className='flex items-center p-1 h-auto'
							>
								<Eye className='size-4' />
							</Button>
						</PhotoView>
					</div>
				)}
			</div>
		</div>
	);
}
