import { useEffect } from 'react';
import { useUploadStore, type UploadItem } from '@/store/useUploadStore';

import { Button } from '@/components/ui/button';
import ChevronDown from './icons/chevron-down';
import ChevronUp from './icons/chevron-up';
import X from './icons/x';
import RotateCcw from './icons/rotate-ccw';
import CircleCheck from './icons/circle-check';
import AlertCircle from './icons/alert-circle';
import ImageIcon from './icons/image-icon';
import Video from './icons/video';
import FileText from './icons/file-text';
import Loader from './icons/loader';

function formatBytes(bytes: number, decimals = 1): string {
	if (bytes === 0) return '0 B';
	const k = 1024;
	const dm = decimals < 0 ? 0 : decimals;
	const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

function formatETA(seconds: number): string {
	if (!seconds || seconds <= 0 || !isFinite(seconds)) return '';
	if (seconds < 60) return `${seconds}s remaining`;
	const mins = Math.floor(seconds / 60);
	const secs = seconds % 60;
	return `${mins}m ${secs}s remaining`;
}

function UploadItemRow({ item }: { item: UploadItem }) {
	const { cancelUpload, retryUpload } = useUploadStore();

	const getIcon = () => {
		if (item.fileType === 'image')
			return <ImageIcon className='h-4 w-4 text-blue-500 shrink-0' />;
		if (item.fileType === 'video')
			return <Video className='h-4 w-4 text-purple-500 shrink-0' />;
		return <FileText className='h-4 w-4 text-gray-500 shrink-0' />;
	};

	return (
		<div className='flex flex-col gap-1.5 p-3 rounded-lg bg-muted/40 border border-border/40 text-xs'>
			<div className='flex items-center justify-between gap-2'>
				<div className='flex items-center gap-2 min-w-0 flex-1'>
					{item.previewUrl && item.fileType === 'image' ? (
						<img
							src={item.previewUrl}
							alt={item.fileName}
							className='h-8 w-8 rounded object-cover border shrink-0'
						/>
					) : (
						<div className='h-8 w-8 rounded bg-muted flex items-center justify-center shrink-0 border'>
							{getIcon()}
						</div>
					)}
					<div className='flex flex-col min-w-0 flex-1'>
						<span className='font-medium truncate text-foreground' title={item.fileName}>
							{item.fileName}
						</span>
						<span className='text-[10px] text-muted-foreground'>
							{formatBytes(item.bytesTransferred)} / {formatBytes(item.totalBytes)}
							{item.status === 'uploading' && item.speed > 0 && (
								<> • {formatBytes(item.speed)}/s</>
							)}
						</span>
					</div>
				</div>

				{/* Status Actions */}
				<div className='flex items-center gap-1 shrink-0'>
					{item.status === 'uploading' && (
						<Button
							variant='ghost'
							size='icon'
							className='h-6 w-6 text-muted-foreground hover:text-destructive'
							onClick={() => cancelUpload(item.id)}
							title='Cancel Upload'
						>
							<X className='h-3.5 w-3.5' />
						</Button>
					)}

					{item.status === 'pending' && (
						<span className='text-[10px] font-medium text-amber-500 flex items-center gap-1'>
							<Loader className='h-3 w-3 animate-spin' /> Queued
						</span>
					)}

					{item.status === 'completed' && (
						<CircleCheck className='h-4 w-4 text-green-500' />
					)}

					{item.status === 'error' && (
						<Button
							variant='ghost'
							size='icon'
							className='h-6 w-6 text-destructive hover:bg-destructive/10'
							onClick={() => retryUpload(item.id)}
							title='Retry Upload'
						>
							<RotateCcw className='h-3.5 w-3.5' />
						</Button>
					)}

					{item.status === 'cancelled' && (
						<Button
							variant='ghost'
							size='icon'
							className='h-6 w-6 text-muted-foreground hover:text-foreground'
							onClick={() => retryUpload(item.id)}
							title='Restart Upload'
						>
							<RotateCcw className='h-3.5 w-3.5' />
						</Button>
					)}
				</div>
			</div>

			{/* Progress Bar & ETA */}
			{item.status === 'uploading' && (
				<div className='space-y-1'>
					<div className='h-1.5 w-full bg-muted rounded-full overflow-hidden'>
						<div
							className='h-full bg-primary transition-all duration-300 ease-out'
							style={{ width: `${item.progress}%` }}
						/>
					</div>
					<div className='flex justify-between items-center text-[10px] text-muted-foreground'>
						<span>{item.progress}%</span>
						{item.eta > 0 && <span>{formatETA(item.eta)}</span>}
					</div>
				</div>
			)}

			{item.status === 'error' && item.errorMessage && (
				<span className='text-[10px] text-destructive flex items-center gap-1'>
					<AlertCircle className='h-3 w-3 shrink-0' />
					<span className='truncate'>{item.errorMessage}</span>
				</span>
			)}
		</div>
	);
}

export function UploadToaster() {
	const {
		uploads,
		isMinimized,
		activeUploadsCount,
		completedUploadsCount,
		toggleMinimized,
		dismissCompleted
	} = useUploadStore();

	const uploadList = Object.values(uploads);
	const totalCount = uploadList.length;

	useEffect(() => {
		const handleBeforeUnload = (e: BeforeUnloadEvent) => {
			if (activeUploadsCount > 0) {
				e.preventDefault();
				return;
			}
		};
		window.addEventListener('beforeunload', handleBeforeUnload);
		return () => window.removeEventListener('beforeunload', handleBeforeUnload);
	}, [activeUploadsCount]);

	if (totalCount === 0) return null;

	const isAllCompleted = activeUploadsCount === 0 && totalCount > 0;

	return (
		<div className='fixed bottom-4 right-4 z-50 w-80 md:w-96 shadow-2xl rounded-xl border bg-card text-card-foreground overflow-hidden transition-all duration-200'>
			{/* Widget Header */}
			<div className='flex items-center justify-between px-4 py-3 bg-muted/60 border-b select-none'>
				<div className='flex items-center gap-2 min-w-0'>
					{activeUploadsCount > 0 ? (
						<Loader className='h-4 w-4 animate-spin text-primary shrink-0' />
					) : isAllCompleted ? (
						<CircleCheck className='h-4 w-4 text-green-500 shrink-0' />
					) : (
						<AlertCircle className='h-4 w-4 text-amber-500 shrink-0' />
					)}

					<span className='font-medium text-xs truncate'>
						{activeUploadsCount > 0
							? `Uploading ${activeUploadsCount} ${activeUploadsCount === 1 ? 'file' : 'files'}`
							: isAllCompleted
								? `${completedUploadsCount} ${completedUploadsCount === 1 ? 'upload' : 'uploads'} complete`
								: 'Uploads paused / failed'}
					</span>
				</div>

				<div className='flex items-center gap-1 shrink-0'>
					<Button
						variant='ghost'
						size='icon'
						className='h-6 w-6 text-muted-foreground hover:text-foreground'
						onClick={toggleMinimized}
						title={isMinimized ? 'Expand' : 'Collapse'}
					>
						{isMinimized ? (
							<ChevronUp className='h-4 w-4' />
						) : (
							<ChevronDown className='h-4 w-4' />
						)}
					</Button>

					{isAllCompleted && (
						<Button
							variant='ghost'
							size='icon'
							className='h-6 w-6 text-muted-foreground hover:text-foreground'
							onClick={dismissCompleted}
							title='Close'
						>
							<X className='h-4 w-4' />
						</Button>
					)}
				</div>
			</div>

			{/* Widget Body (Expanded) */}
			{!isMinimized && (
				<div className='p-3 max-h-72 overflow-y-auto space-y-2'>
					{uploadList.map((item) => (
						<UploadItemRow key={item.id} item={item} />
					))}
				</div>
			)}
		</div>
	);
}
