import type { ConsumerGuide } from '@/zod/consumer-guide';
import Link from '../icons/link';
import Package from '../icons/package';
import Pencil from '../icons/penicl';
import RestoreBin from '../icons/restore-bin';
import Trash from '../icons/trash';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';
import ChevronLeft from '../icons/chevron-left';
import ChevronRight from '../icons/chevron-right';

export function GridView({
	items,
	query,
	handleRestoreClick,
	handleEdit,
	handleDeleteClick,
	handleNextPage,
	handlePrevPage,
	totalPages,
	hasMore,
	page,
	isFetching
}: {
	items: ConsumerGuide[];
	query: string;
	handleNextPage: () => void;
	handlePrevPage: () => void;
	totalPages: number;
	hasMore: boolean;
	page: number;
	handleRestoreClick: (consumerGuide: ConsumerGuide) => void;
	handleEdit: (consumerGuide: ConsumerGuide) => void;
	handleDeleteClick: (consumerGuide: ConsumerGuide) => void;
	isFetching: boolean;
}) {
	return (
		<div className='relative'>
			{isFetching ? (
				<div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
					{Array.from({ length: 10 }).map((_, i) => (
						<Card key={`skeleton-${i}`} className='animate-pulse h-40'>
							<CardHeader>
								<div className='h-10 w-32 bg-muted rounded' />
							</CardHeader>
							<CardContent>
								<div className='space-y-2'>
									<div className='h-4 w-full bg-muted rounded' />
									<div className='h-4 w-3/4 bg-muted rounded' />
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			) : items.length === 0 ? (
				<div className='flex flex-1 flex-col items-center justify-center py-16 text-muted-foreground'>
					<Package className='h-12 w-12 opacity-30 mb-3' />
					<p className='text-base font-medium'>No items found</p>
					<p className='text-sm mt-1'>
						{query
							? 'Try adjusting your search term.'
							: 'Click "Add Item" to get started.'}
					</p>
				</div>
			) : (
				<div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
					{items.map((item) => (
						<Card
							key={item?.id}
							className={`border-none group overflow-hidden relative transition-shadow shadow-xs hover:shadow-primary flex flex-col duration-300 ${item?.is_deleted ? 'opacity-80' : 'opacity-100'}`}
						>
							<div className='absolute bottom-4 right-4'>
								{item?.is_deleted ? (
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
										<TooltipContent className='pointer-events-none' side='left'>
											<p>Restore</p>
										</TooltipContent>
									</Tooltip>
								) : (
									<div className='flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity'>
										<Button
											variant='secondary'
											size='icon'
											className='h-8 w-8 bg-background/80 backdrop-blur-sm shadow-sm'
											onClick={(e) => {
												e.stopPropagation();
												handleEdit(item);
											}}
											id={`edit-item-${item.id}`}
										>
											<Pencil className='h-4 w-4' />
										</Button>
										<Button
											variant='secondary'
											size='icon'
											className='h-8 w-8 bg-background/80 backdrop-blur-sm shadow-sm text-destructive hover:text-destructive'
											onClick={(e) => {
												e.stopPropagation();
												handleDeleteClick(item);
											}}
											id={`delete-item-${item.id}`}
										>
											<Trash className='h-4 w-4' />
										</Button>
									</div>
								)}
							</div>

							<CardHeader className='pb-2'>
								<CardTitle className='text-base line-clamp-1'>{item.name}</CardTitle>
							</CardHeader>

							<CardContent className='flex-1 pb-3'>
								<p className='text-sm text-muted-foreground line-clamp-3'>
									{item.definition}
								</p>
							</CardContent>

							<CardFooter className='pt-0 pb-4'>
								{item.sources && item.sources.length > 0 && (
									<div className='flex flex-wrap gap-1.5'>
										{item.sources.slice(0, 2).map((source, i) => (
											<Badge
												key={i}
												className='text-xs gap-1 cursor-pointer hover:bg-muted'
												onClick={() => {
													if (source.link) window.open(source.link, '_blank');
												}}
											>
												<Link className='h-3 w-3' />
												{source.name}
											</Badge>
										))}
										{item.sources.length > 2 && (
											<Badge variant='secondary' className='text-xs'>
												+{item.sources.length - 2} more
											</Badge>
										)}
									</div>
								)}
							</CardFooter>
						</Card>
					))}
				</div>
			)}

			<div className='flex absolute -top-10.5 right-0  border-primary px-1 py-1 rounded-full items-center gap-x-2 ml-auto'>
				<Button
					onClick={handlePrevPage}
					disabled={page === 1 || isFetching}
					variant={page === 1 || isFetching ? 'secondary' : 'default'}
					className='rounded-full'
				>
					<ChevronLeft />
				</Button>

				<p className='text-xs text-muted-foreground'>
					Page {page} of {totalPages || 1}
				</p>

				<Button
					onClick={handleNextPage}
					variant={!hasMore || isFetching ? 'secondary' : 'default'}
					className='rounded-full'
					disabled={!hasMore || isFetching}
				>
					<ChevronRight />
				</Button>
			</div>
		</div>
	);
}
