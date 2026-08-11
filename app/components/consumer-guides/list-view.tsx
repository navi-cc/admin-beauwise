import type { ConsumerGuide } from '@/zod/consumer-guide';
import BookOpen from '../icons/book-open';
import Link from '../icons/link';
import Pencil from '../icons/penicl';
import Trash from '../icons/trash';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';
import RestoreBin from '../icons/restore-bin';

export function ListView({
	consumerGuides,
	isFetching,
	query,
	handleEdit,
	handleRestoreClick,
	handleDeleteClick,
	handleNextPage,
	handlePrevPage,
	page,
	totalPages,
	hasMore
}: {
	consumerGuides: ConsumerGuide[];
	isFetching: boolean;
	query: string;
	handleRestoreClick: (consumerGuide: ConsumerGuide) => void;
	handleEdit: (consumerGuide: ConsumerGuide) => void;
	handleDeleteClick: (consumerGuide: ConsumerGuide) => void;
	handleNextPage: () => void;
	handlePrevPage: () => void;
	page: number;
	totalPages: number;
	hasMore: boolean;
}) {
	return (
		<div className='flex flex-col gap-3'>
			{isFetching ? (
				Array.from({ length: 4 }).map((_, i) => (
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
			) : consumerGuides.length === 0 ? (
				<div className='flex flex-col items-center justify-center py-16 text-muted-foreground'>
					<BookOpen className='h-12 w-12 opacity-30 mb-3' />
					<p className='text-base font-medium'>No items found</p>
					<p className='text-sm mt-1'>
						{query
							? 'Try adjusting your search term.'
							: 'Click "Add Item" to get started.'}
					</p>
				</div>
			) : (
				consumerGuides.map((item) => (
					<div
						key={item.id}
						className={`group flex items-center gap-4 p-4 rounded-lg border border-border/50 bg-card hover:border-border hover:shadow-xs transition-all cursor-pointer ${item.is_deleted ? 'opacity-60' : 'opacity-100'}`}
						onClick={() => handleEdit(item)}
					>
						<img
							className='size-8'
							src={`https://${import.meta.env.VITE_CDN_BEAUWISE}/learn/cosmetic_guides/${item.imageId}.webp?q=${item.fileHash}`}
							alt={item.name}
						/>

						<div className='flex flex-col flex-1 min-w-0'>
							<h3 className='font-medium text-sm truncate'>{item.name}</h3>
							<p className='text-black/50'>{item.definition}</p>
							<div className='flex items-center gap-3 mt-1.5'>
								{item.sources?.length > 0 && (
									<Badge className='text-xs gap-1'>
										<Link className='h-3 w-3' />
										{item.sources.length} source
										{item.sources.length !== 1 ? 's' : ''}
									</Badge>
								)}
							</div>
						</div>
						<div className='flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0'>
							{item.is_deleted ? (
								<Tooltip>
									<TooltipTrigger>
										<Button
											variant='ghost'
											size='icon'
											className='h-8 w-8 text-primary flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity'
											onClick={(e) => {
												e.stopPropagation();
												handleRestoreClick(item);
											}}
											id={`delete-${item.id}`}
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
											handleEdit(item);
										}}
										id={`edit-item-${item.id}`}
									>
										<Pencil className='h-4 w-4' />
									</Button>
									<Button
										variant='ghost'
										size='icon'
										className='h-8 w-8 text-destructive hover:text-destructive'
										onClick={(e) => {
											e.stopPropagation();
											handleDeleteClick(item);
										}}
										id={`delete-item-${item.id}`}
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
