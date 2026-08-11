import { useState, type ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { IngredientFormDialog } from '@/components/ingredients-management/ingredient-form-dialog';
import { useIngredients } from '@/hooks/use-ingredients';
import {
	useDeleteIngredient,
	useRestoreIngredient
} from '@/hooks/use-ingredient-mutation';
import { type Ingredient } from '@/zod/ingredients';

import { toast } from 'sonner';
import Search from '@/components/icons/search';
import Plus from '@/components/icons/plus';
import Loader from '@/components/icons/loader';
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuTrigger
} from '../ui/dropdown-menu';
import { InputGroup, InputGroupAddon, InputGroupInput } from '../ui/input-group';
import { useDebouncedCallback } from 'use-debounce';
import { useIngredientsConfig } from '@/hooks/use-option';
import { Controller, useForm } from 'react-hook-form';

import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { FilterMultiSelect } from './filter-multi-select';
import ChevronDown from '../icons/chevron-down';
import Tags from '../icons/tags';
import Tag from '../icons/tag';
import Refresh from '../icons/refresh';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { TableView } from './table-view';
import TableIcon from '../icons/table';
import Grid from '../icons/grid';
import ListViewIcon from '../icons/list-view';
import { GridView } from './grid-view';
import Books from '../icons/books';
import { ListView } from './list-view';

type FilterItem = {
	name: string;
	isCheck: boolean;
	key: string;
};

const tagSchema = z.object({
	categories: z.array(z.string()),
	best_for: z.array(z.string()),
	common_products: z.array(z.string())
});

type Tags = z.infer<typeof tagSchema>;

const tagsDefaultValues: Tags = {
	categories: [],
	best_for: [],
	common_products: []
};

export function IngredientTable() {
	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState(10);
	const [query, setQuery] = useState('');

	const [filters, setFilter] = useState<FilterItem[]>(() => [
		{ name: 'All', key: 'all', isCheck: true },
		{ name: 'Deleted Only', key: 'deleted', isCheck: false },
		{ name: 'Active Only', key: 'active', isCheck: false }
	]);

	const formTags = useForm({
		resolver: zodResolver(tagSchema),
		defaultValues: tagsDefaultValues
	});

	const [tags, setTags] = useState<{
		categories: string[];
		bestFor: string[];
		commonProducts: string[];
	}>({
		categories: [],
		bestFor: [],
		commonProducts: []
	});

	const bestForFilter = formTags.watch('best_for');
	const categoriesFilter = formTags.watch('categories');
	const commonProductsFilter = formTags.watch('common_products');

	const hasTags =
		bestForFilter.length > 0 ||
		categoriesFilter.length > 0 ||
		commonProductsFilter.length > 0;

	const selectedFilter = { ...filters.filter((item) => item.isCheck)[0] };

	const [formOpen, setFormOpen] = useState(false);
	const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [deletingIngredient, setDeletingIngredient] = useState<Ingredient | null>(null);

	const [restoringIngredient, setRestoringIngredient] = useState<Ingredient | null>(null);
	const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);

	const {
		items,
		totalCount,
		totalPages,
		hasMore,
		isLoading,
		isFetching,
		isError,
		refetch: retry,
		resetCursors
	} = useIngredients(
		page,
		pageSize,
		selectedFilter,
		query,
		tags.categories,
		tags.bestFor,
		tags.commonProducts
	);

	const {
		data: config,
		isLoading: configLoading,
		isError: configError,
		refetch: configRefetch
	} = useIngredientsConfig();

	const categoryOptions = config?.categories.map((c) => ({
		label: c,
		value: c
	}));

	const bestForOptions = config?.best_for.map((b) => ({
		label: b,
		value: b
	}));

	const commonProductsOptions = config?.common_products.map((p) => ({
		label: p,
		value: p
	}));

	const deleteMutation = useDeleteIngredient();
	const restoreMutation = useRestoreIngredient();

	const handleNextPage = () => {
		if (hasMore) setPage((prev) => prev + 1);
	};

	const handlePrevPage = () => {
		if (page > 1) setPage((prev) => prev - 1);
	};

	const handleAdd = () => {
		setEditingIngredient(null);
		setFormOpen(true);
	};

	const handleEdit = (ingredient: Ingredient) => {
		setEditingIngredient(ingredient);
		setFormOpen(true);
	};

	const handleRestoreClick = (ingredient: Ingredient) => {
		setRestoringIngredient(ingredient);
		setRestoreDialogOpen(true);
	};

	const handleDeleteClick = (ingredient: Ingredient) => {
		setDeletingIngredient(ingredient);
		setDeleteDialogOpen(true);
	};

	const handleDeleteConfirm = async () => {
		if (!deletingIngredient) return;
		try {
			await deleteMutation.mutateAsync(deletingIngredient.id);
			toast.success(`"${deletingIngredient.name}" has been deleted.`);
		} catch (error: any) {
			toast.error(error?.message ?? 'Failed to delete ingredient');
		} finally {
			setDeleteDialogOpen(false);
			setDeletingIngredient(null);
		}
	};

	const handleRestoreConfirm = async () => {
		if (!restoringIngredient) return;
		try {
			await restoreMutation.mutateAsync(restoringIngredient.id);
			toast.success(`"${restoringIngredient.name}" has been restored.`);
		} catch (error: any) {
			toast.error(error?.message ?? 'Failed to restore ingredient');
		} finally {
			setRestoreDialogOpen(false);
			setRestoringIngredient(null);
		}
	};
	const handleApplyTags = () => {
		setTags({
			bestFor: [...bestForFilter],
			categories: [...categoriesFilter],
			commonProducts: [...commonProductsFilter]
		});
	};

	const handleChangePageSize = (size: number) => () => {
		setPageSize(size);
		setPage(1);
	};

	const delayQuery = useDebouncedCallback((value) => {
		setQuery(value);
		setPage(1);
	}, 220);

	const handleQuery = (e: ChangeEvent<HTMLInputElement>) => {
		delayQuery(e.target.value);
	};

	return (
		<div className='space-y-2.5'>
			<div>
				<div className='text-2xl text-primary font-bold flex items-center gap-2'>
					<Books className='size-6' />
					Ingredients Glossary
				</div>
				<p className='text-sm text-muted-foreground mt-1'>
					Manage the ingredients glossary.{' '}
					{items.length > 0 && <span className='font-medium'>{items.length} total</span>}
				</p>
			</div>

			<div className='flex flex-col items-start gap-1.5'>
				<div className='flex gap-1.5'>
					<div className='relative max-w-sm'>
						<InputGroup>
							<InputGroupInput
								onChange={handleQuery}
								placeholder='Search by name...'
								id='ingredient-search'
							/>
							<InputGroupAddon align='inline-start'>
								<Search className='	text-muted-foreground' />
							</InputGroupAddon>
						</InputGroup>
					</div>
					<Button onClick={handleAdd} className='gap-1 self-start'>
						<Plus className='h-4 w-4' />
						Add Ingredient
					</Button>
				</div>

				<div className='flex flex-row gap-x-1.5'>
					<DropdownMenu>
						<DropdownMenuTrigger
							render={
								<Button variant='outline' className='items-center font-light'>
									Show {selectedFilter.name} <ChevronDown />
								</Button>
							}
						/>
						<DropdownMenuContent align='start' className='w-40 flex-row'>
							<DropdownMenuGroup>
								{filters.map(({ isCheck, name, key }) => (
									<DropdownMenuCheckboxItem
										checked={isCheck}
										key={key}
										disabled={isFetching}
										className='transition-colors duration-300'
										onCheckedChange={(checked) => {
											const newItems = filters
												.map((item) => ({
													...item,
													isCheck: false
												}))
												.map((item) =>
													item.key === key ? { ...item, isCheck: checked } : item
												);

											if (newItems.every((item) => !item.isCheck)) return;

											setFilter(newItems);
											setPage(1);
										}}
									>
										{name}
									</DropdownMenuCheckboxItem>
								))}
							</DropdownMenuGroup>
						</DropdownMenuContent>
					</DropdownMenu>
					<Popover>
						<PopoverTrigger
							render={
								<Button variant='outline' className='items-center font-light'>
									Tags
									<Tag
										className={`transition-colors duration-300 ${hasTags ? 'text-primary' : 'text-foreground'}`}
									/>
								</Button>
							}
						/>
						<PopoverContent align='start' className='gap-0'>
							<Controller
								control={formTags.control}
								name='categories'
								render={({ field }) => (
									<FilterMultiSelect
										currentConfirmSelectedCount={tags.categories.length}
										name={field.name}
										options={categoryOptions}
										selected={field.value}
										onChange={field.onChange}
										isLoading={configLoading}
									/>
								)}
							/>

							<Controller
								control={formTags.control}
								name='best_for'
								render={({ field }) => (
									<FilterMultiSelect
										currentConfirmSelectedCount={tags.bestFor.length}
										name={field.name}
										options={bestForOptions}
										selected={field.value}
										onChange={field.onChange}
										isLoading={configLoading}
									/>
								)}
							/>

							<Controller
								control={formTags.control}
								name='common_products'
								render={({ field }) => (
									<FilterMultiSelect
										currentConfirmSelectedCount={tags.commonProducts.length}
										name={field.name}
										options={commonProductsOptions}
										selected={field.value}
										onChange={field.onChange}
										isLoading={configLoading}
									/>
								)}
							/>

							<Button
								className='font-light self-end mt-1.5 pl-3.5 pr-3.5'
								onClick={handleApplyTags}
							>
								Apply Tags
							</Button>
						</PopoverContent>
					</Popover>

					<Popover>
						<PopoverTrigger
							render={
								<Button variant='outline' className='font-light'>
									Rows: <span className='font-normal'>{pageSize}</span> <ChevronDown />
								</Button>
							}
						/>
						<PopoverContent align='end' className='w-20'>
							{[10, 20, 30].map((size) => {
								return (
									<Button
										onClick={handleChangePageSize(size)}
										variant='ghost'
										className={`font-light transition-colors duration-300 ${size === pageSize ? 'bg-muted' : 'bg-transparent'}`}
									>
										{size}
									</Button>
								);
							})}
						</PopoverContent>
					</Popover>

					<Button
						variant='outline'
						className='font-light'
						onClick={() => retry({ throwOnError: true })}
					>
						Refresh <Refresh />
					</Button>
				</div>
			</div>

			<Tabs defaultValue='table-view'>
				<TabsList>
					<TabsTrigger
						value='table-view'
						className='aria-selected:text-primary transition-colors duration-300'
					>
						<TableIcon />
					</TabsTrigger>
					<TabsTrigger
						value='grid-view'
						className='aria-selected:text-primary transition-colors duration-300'
					>
						<Grid />
					</TabsTrigger>

					<TabsTrigger
						value='list-view'
						className='aria-selected:text-primary transition-colors duration-300'
					>
						<ListViewIcon />
					</TabsTrigger>
				</TabsList>

				<TabsContent value='list-view'>
					<ListView
						{...{
							ingredients: items,
							query,
							isFetching,
							handleEdit,
							handleRestoreClick,
							handleDeleteClick,
							handleNextPage,
							handlePrevPage,
							page,
							totalPages,
							hasMore
						}}
					/>
				</TabsContent>

				<TabsContent value='table-view'>
					<TableView
						{...{
							items,
							query,
							handleAdd,
							handleRestoreClick,
							handleEdit,
							handleDeleteClick,
							handleNextPage,
							handlePrevPage,
							totalCount,
							totalPages,
							page,
							isFetching,
							hasMore,
							isError,
							retry
						}}
					/>
				</TabsContent>

				<TabsContent value='grid-view'>
					<GridView
						{...{
							items,
							query,
							handleRestoreClick,
							handleEdit,
							handleDeleteClick,
							isFetching,
							page,
							totalPages,
							handlePrevPage,
							handleNextPage,
							hasMore
						}}
					/>
				</TabsContent>
			</Tabs>

			<IngredientFormDialog
				open={formOpen}
				onOpenChange={setFormOpen}
				ingredient={editingIngredient}
			/>

			<AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete Ingredient</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to delete{' '}
							<span className='font-semibold'>"{deletingIngredient?.name}"</span>? This
							action can be undone by restoring the item.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDeleteConfirm}
							className='bg-destructive text-white hover:bg-destructive/90'
						>
							{deleteMutation.isPending && (
								<Loader className='mr-2 h-4 w-4 animate-spin' />
							)}
							Delete
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			<AlertDialog open={restoreDialogOpen} onOpenChange={setRestoreDialogOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Restore {restoringIngredient?.name}?</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to restore{' '}
							<span className='font-semibold'>"{restoringIngredient?.name}"</span>?
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleRestoreConfirm}
							className='bg-primary text-white'
						>
							{deleteMutation.isPending && (
								<Loader className='mr-2 h-4 w-4 animate-spin' />
							)}
							Restore
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
