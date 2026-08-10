import BookOpen from '../icons/book-open';
import Link from '../icons/link';
import Pencil from '../icons/penicl';
import Trash from '../icons/trash';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import type { Ingredient } from '@/zod/ingredients';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';
import RestoreBin from '../icons/restore-bin';

export function ListView({
	ingredients,
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
	ingredients: Ingredient[];
	isFetching: boolean;
	query: string;
	handleRestoreClick: (ingredient: Ingredient) => void;
	handleEdit: (ingredient: Ingredient) => void;
	handleDeleteClick: (ingredient: Ingredient) => void;
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
			) : ingredients.length === 0 ? (
				<div className='flex flex-col items-center justify-center py-16 text-muted-foreground'>
					<BookOpen className='h-12 w-12 opacity-30 mb-3' />
					<p className='text-base font-medium'>No Items found</p>
					<p className='text-sm mt-1'>
						{query
							? 'Try adjusting your search term.'
							: 'Click "Add Ingredient" to get started.'}
					</p>
				</div>
			) : (
				ingredients.map((ingredient) => (
					<div
						key={ingredient.id}
						className={`group flex items-center gap-4 p-4 rounded-lg border border-border/50 bg-card hover:border-border hover:shadow-xs transition-all cursor-pointer ${ingredient.is_deleted ? 'opacity-60' : 'opacity-100'}`}
						onClick={() => handleEdit(ingredient)}
					>
						<div className='flex flex-col flex-1 min-w-0'>
							<h3 className='font-medium text-sm truncate'>{ingredient.name}</h3>
							<p className='text-black/50'>{ingredient.what_it_is}</p>
							<div className='flex items-center gap-3 mt-1.5'>
								<div className='flex flex-wrap gap-1.5'>
									{ingredient.categories.slice(0, 2).map((category, i) => (
										<Badge key={i} className='text-xs gap-1 cursor-pointer'>
											{category}
										</Badge>
									))}

									{/* {ingredient.categories.length > 2 && (
										<Badge className='text-xs'>+{ingredient.sources.length} more</Badge>
									)} */}
								</div>

								{ingredient.sources?.length > 0 && (
									<Badge variant='secondary' className='text-xs gap-1'>
										<Link className='h-3 w-3' />
										{ingredient.sources.length} source
										{ingredient.sources.length !== 1 ? 's' : ''}
									</Badge>
								)}
							</div>
						</div>

						<div className='flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0'>
							{ingredient.is_deleted ? (
								<Tooltip>
									<TooltipTrigger>
										<Button
											variant='ghost'
											size='icon'
											className='h-8 w-8 text-primary flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity'
											onClick={(e) => {
												e.stopPropagation();
												handleRestoreClick(ingredient);
											}}
											id={`delete-${ingredient.id}`}
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
											handleEdit(ingredient);
										}}
										id={`edit-ingredient-${ingredient.id}`}
									>
										<Pencil className='h-4 w-4' />
									</Button>
									<Button
										variant='ghost'
										size='icon'
										className='h-8 w-8 text-destructive hover:text-destructive'
										onClick={(e) => {
											e.stopPropagation();
											handleDeleteClick(ingredient);
										}}
										id={`delete-ingredient-${ingredient.id}`}
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
