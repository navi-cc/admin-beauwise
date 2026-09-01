import type { MythFact } from '@/zod/myth-fact';
import BookOpen from '../icons/book-open';
import ImageCompositionOval from '../icons/image-composition-oval';
import Link from '../icons/link';
import Pencil from '../icons/penicl';
import Trash from '../icons/trash';
import Video from '../icons/video';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import ChevronLeft from '../icons/chevron-left';
import ChevronRight from '../icons/chevron-right';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';
import RestoreBin from '../icons/restore-bin';

export function ListView({
	mythFacts,
	isFetching,
	isUpdating,
	query,
	handleEdit,
	handleDeleteClick,
	handleRestoreClick,
	handleNextPage,
	handlePrevPage,
	page,
	pageSize,
	totalPages,
	hasMore
}: {
	mythFacts: MythFact[];
	isFetching: boolean;
	isUpdating: boolean;
	query: string;
	handleEdit: (guide: MythFact) => void;
	handleRestoreClick: (guide: MythFact) => void;
	handleDeleteClick: (guide: MythFact) => void;
	handleNextPage: () => void;
	handlePrevPage: () => void;
	page: number;
	pageSize: number;
	totalPages: number;
	hasMore: boolean;
}) {
	return (
		<div className='flex flex-col gap-3'>
			{isFetching || isUpdating ? (
				Array.from({ length: pageSize }).map((_, i) => (
					<div
						key={`skeleton-${i}`}
						className='flex items-center gap-4 p-4 rounded-lg border border-border/50 bg-card animate-pulse'
					>
						<div className='w-16 h-16 rounded-md bg-muted shrink-0' />
						<div className='flex-1 space-y-2'>
							<div className='h-4 w-40 bg-muted rounded' />
							<div className='h-3 w-24 bg-muted rounded' />
						</div>
						<div className='h-8 w-20 bg-muted rounded' />
					</div>
				))
			) : mythFacts.length === 0 ? (
				<div className='flex flex-col items-center justify-center py-16 text-muted-foreground'>
					<BookOpen className='h-12 w-12 opacity-30 mb-3' />
					<p className='text-base font-medium'>No Items found</p>
					<p className='text-sm mt-1'>
						{query
							? 'Try adjusting your search term.'
							: 'Click "Add Guide" to get started.'}
					</p>
				</div>
			) : (
				mythFacts.map((guide) => (
					<div
						key={guide?.id}
						className={`group flex items-center gap-4 p-4 rounded-lg border border-border/50 bg-card hover:border-border hover:shadow-xs transition-all cursor-pointer ${guide?.is_deleted ? 'opacity-50' : 'opacity-100'}`}
						onClick={() => handleEdit(guide)}
					>
						<div className='w-16 h-16 rounded-md bg-muted/50 overflow-hidden shrink-0'>
							{guide?.displayImage?.fileHash ? (
								<img
									src={`https://${import.meta.env.VITE_CDN_BEAUWISE}/learn/${guide?.baseImagePath}/display_image.webp?q=${guide?.displayImage?.fileHash}`}
									alt={guide?.name}
									className='w-full h-full object-cover'
								/>
							) : (
								<div className='w-full h-full flex items-center justify-center'>
									<ImageCompositionOval className='h-6 w-6 text-muted-foreground/30' />
								</div>
							)}
						</div>

						<div className='flex-1 min-w-0'>
							<h3 className='font-medium text-sm truncate'>{guide?.name}</h3>
							<div className='flex items-center gap-3 mt-1.5'>
								<Badge className='text-xs gap-1'>
									<BookOpen className='h-3 w-3' />
									{guide?.topics?.length ?? 0} topic
									{(guide?.topics?.length ?? 0) !== 1 ? 's' : ''}
								</Badge>

								{guide?.sources?.length > 0 && (
									<Badge variant='secondary' className='text-xs gap-1'>
										<Link className='h-3 w-3' />
										{guide?.sources.length} source
										{guide?.sources.length !== 1 ? 's' : ''}
									</Badge>
								)}
							</div>
						</div>

						<div className='flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0'>
							{guide?.is_deleted ? (
								<Tooltip>
									<TooltipTrigger>
										<Button
											variant='ghost'
											size='icon'
											className='h-8 w-8 text-primary flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity'
											onClick={(e) => {
												e.stopPropagation();
												handleRestoreClick(guide);
											}}
											id={`delete-${guide?.id}`}
										>
											<RestoreBin className='h-4 w-4 text-primary' />
										</Button>
									</TooltipTrigger>
									<TooltipContent side='left'>
										<p>Restore</p>
									</TooltipContent>
								</Tooltip>
							) : (
								<>
									<Button
										variant='ghost'
										size='icon'
										className='h-8 w-8'
										onClick={(e) => {
											e.stopPropagation();
											handleEdit(guide);
										}}
										id={`edit-guide-${guide?.id}`}
									>
										<Pencil className='h-4 w-4' />
									</Button>
									<Button
										variant='ghost'
										size='icon'
										className='h-8 w-8 text-destructive hover:text-destructive'
										onClick={(e) => {
											e.stopPropagation();
											handleDeleteClick(guide);
										}}
										id={`delete-guide-${guide?.id}`}
									>
										<Trash className='h-4 w-4' />
									</Button>
								</>
							)}
						</div>
					</div>
				))
			)}

			<div className='flex px-1 py-1 rounded-full items-center self-center gap-x-2'>
				<Button
					onClick={handlePrevPage}
					disabled={page === 1 || isFetching}
					variant={page === 1 || isFetching ? 'secondary' : 'default'}
					className='rounded-full px-4 py-4'
				>
					Back
				</Button>

				<p className='text-xs text-muted-foreground'>
					{page} of {totalPages || 1}
				</p>

				<Button
					onClick={handleNextPage}
					variant={!hasMore || isFetching ? 'secondary' : 'default'}
					className='rounded-full px-4 py-4'
					disabled={!hasMore || isFetching}
				>
					Next
				</Button>
			</div>
		</div>
	);
}
