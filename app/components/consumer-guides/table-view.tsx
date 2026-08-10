import type { ConsumerGuide } from '@/zod/consumer-guide';
import AlertCircle from '../icons/alert-circle';
import ChevronLeft from '../icons/chevron-left';
import ChevronRight from '../icons/chevron-right';
import Package from '../icons/package';
import Pencil from '../icons/penicl';
import Plus from '../icons/plus';
import RefreshCw from '../icons/refresh-cw';
import RestoreBin from '../icons/restore-bin';
import Trash from '../icons/trash';
import { Button } from '../ui/button';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow
} from '../ui/table';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';
import type { RefetchOptions } from '@tanstack/react-query';

export function TableView({
	items,
	isFetching,
	isError,
	retry,
	handleAdd,
	handleEdit,
	handleDeleteClick,
	handleRestoreClick,
	handlePrevPage,
	handleNextPage,
	totalCount,
	totalPages,
	page,
	hasMore
}: {
	items: ConsumerGuide[];
	isFetching: boolean;
	isError: boolean;
	retry: (options?: RefetchOptions) => Promise<void>;
	handleAdd: () => void;
	handleEdit: (consumerGuide: ConsumerGuide) => void;
	handleDeleteClick: (consumerGuide: ConsumerGuide) => void;
	handleRestoreClick: (consumerGuide: ConsumerGuide) => void;
	handlePrevPage: () => void;
	handleNextPage: () => void;
	totalCount: number;
	totalPages: number;
	page: number;
	hasMore: boolean;
}) {
	return (
		<>
			<div className='rounded-lg border border-border/50 bg-card overflow-hidden'>
				<Table>
					<TableHeader>
						<TableRow className='bg-muted/50 hover:bg-muted/50'>
							<TableHead className='font-semibold'>Name</TableHead>

							<TableHead className='font-semibold hidden md:table-cell'>
								Definition
							</TableHead>
							<TableHead className='font-semibold hidden lg:table-cell'>Usage</TableHead>

							<TableHead className='font-semibold text-right hidden lg:table-cell'>
								Actions
							</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{isFetching ? (
							Array.from({ length: 5 }).map((_, i) => (
								<TableRow key={`skeleton-${i}`}>
									<TableCell>
										<div className='h-4 w-32 animate-pulse rounded bg-muted' />
									</TableCell>
									<TableCell>
										<div className='flex gap-1'>
											<div className='h-5 w-16 animate-pulse rounded-full bg-muted' />
											<div className='h-5 w-20 animate-pulse rounded-full bg-muted' />
										</div>
									</TableCell>
									<TableCell className='hidden md:table-cell'>
										<div className='h-4 w-48 animate-pulse rounded bg-muted' />
									</TableCell>
									<TableCell className='hidden lg:table-cell'>
										<div className='h-4 w-24 animate-pulse rounded bg-muted' />
									</TableCell>
									<TableCell>
										<div className='h-8 w-16 animate-pulse rounded bg-muted ml-auto' />
									</TableCell>
								</TableRow>
							))
						) : isError ? (
							<TableRow>
								<TableCell colSpan={5} className='h-48 text-center'>
									<div className='flex flex-col items-center gap-2 text-muted-foreground'>
										<AlertCircle className='h-10 w-10 opacity-80' />
										<div>
											<p className='text-base font-semibold capitalize'>
												We couldn't load this section
											</p>

											<p className='text-xs font-normal'>
												Connection lost while loading. Please try again.
											</p>
										</div>

										<Button
											onClick={() =>
												retry({
													throwOnError: true
												})
											}
											variant='outline'
											className='hover:text-primary transition-colors duration-300'
										>
											Retry
											<RefreshCw />
										</Button>
									</div>
								</TableCell>
							</TableRow>
						) : items.length === 0 ? (
							<TableRow>
								<TableCell colSpan={5} className='h-48 text-center'>
									<div className='flex flex-col items-center gap-2 text-muted-foreground'>
										<Package className='h-10 w-10 opacity-80' />
										<div>
											<p className='text-base font-semibold capitalize'>No Items Found</p>

											<p className='text-xs font-normal'>
												Get started by creating your first entry.
											</p>
										</div>

										<Button
											onClick={handleAdd}
											variant='outline'
											className='hover:text-primary transition-colors duration-300'
										>
											Add New Item
											<Plus />
										</Button>
									</div>
								</TableCell>
							</TableRow>
						) : (
							items.map((consumerGuide) => (
								<TableRow
									key={consumerGuide.id}
									className={`group cursor-pointer transition-colors ${consumerGuide.is_deleted ? 'opacity-50' : 'opacity-100'}`}
									onClick={() => handleEdit(consumerGuide)}
								>
									<TableCell className='font-medium'>{consumerGuide.name}</TableCell>

									<TableCell className='hidden md:table-cell max-w-[10px] truncate text-muted-foreground'>
										{consumerGuide.definition}
									</TableCell>
									<TableCell className='hidden lg:table-cell max-w-[10px] truncate text-muted-foreground'>
										{consumerGuide.usage}
									</TableCell>
									<TableCell className='text-right'>
										<div className='flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity'>
											{!consumerGuide.is_deleted ? (
												<>
													<Button
														variant='ghost'
														size='icon'
														className='h-8 w-8'
														onClick={(e) => {
															handleEdit(consumerGuide);
														}}
														id={`edit-${consumerGuide.id}`}
													>
														<Pencil className='h-4 w-4' />
													</Button>

													<Button
														variant='ghost'
														size='icon'
														className='h-8 w-8 text-destructive hover:text-destructive'
														onClick={(e) => {
															e.stopPropagation();
															handleDeleteClick(consumerGuide);
														}}
														id={`delete-${consumerGuide.id}`}
													>
														<Trash className='h-4 w-4' />
													</Button>
												</>
											) : (
												<Tooltip>
													<TooltipTrigger>
														<Button
															variant='ghost'
															size='icon'
															className='h-8 w-8 text-primary z-10 opacity-100'
															onClick={(e) => {
																e.stopPropagation();
																handleRestoreClick(consumerGuide);
															}}
															id={`delete-${consumerGuide.id}`}
														>
															<RestoreBin className='h-4 w-4 text-primary' />
														</Button>
													</TooltipTrigger>
													<TooltipContent side='left'>
														<p>Restore</p>
													</TooltipContent>
												</Tooltip>
											)}
										</div>
									</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
			</div>

			{totalCount > 0 && (
				<div className='flex items-center justify-between px-1 mt-2.5'>
					<p className='text-sm text-muted-foreground'>
						Page {page} of {totalPages || 1}
					</p>
					<div className='flex items-center gap-2'>
						<Button
							size='sm'
							variant='outline'
							onClick={handlePrevPage}
							disabled={page === 1 || isFetching}
							className='gap-1 items-center text-primary hover:text-primary'
							id='pagination-prev'
						>
							<ChevronLeft className='h-4 w-4' />
							Previous
						</Button>
						<Button
							variant='outline'
							size='sm'
							onClick={handleNextPage}
							disabled={!hasMore || isFetching}
							className='gap-1 items-center text-primary hover:text-primary'
							id='pagination-next'
						>
							Next
							<ChevronRight className='h-4 w-4' />
						</Button>
					</div>
				</div>
			)}
		</>
	);
}
