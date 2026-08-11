import { useState, useDeferredValue, type ChangeEvent, type Consumer } from 'react';
import {
	Card,
	CardHeader,
	CardTitle,
	CardContent,
	CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
import { ConsumerGuideFormDialog } from './consumer-guide-form-dialog';
import { useConsumerGuides } from '@/hooks/use-consumer-guides';
import { useDeleteConsumer, useRestoreConsumer } from '@/hooks/use-consumer-mutation';
import { type ConsumerGuide } from '@/zod/consumer-guide';
import { toast } from 'sonner';
import { useDebouncedCallback } from 'use-debounce';
import Search from '@/components/icons/search';
import Plus from '@/components/icons/plus';
import Loader from '@/components/icons/loader';
import Package from '@/components/icons/package';
import { InputGroup, InputGroupAddon, InputGroupInput } from '../ui/input-group';
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuTrigger
} from '../ui/dropdown-menu';
import ChevronDown from '../icons/chevron-down';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import Refresh from '../icons/refresh';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import TableIcon from '../icons/table';
import Grid from '../icons/grid';
import { GridView } from './grid-view';
import ListViewIcon from '../icons/list-view';
import { TableView } from './table-view';
import CollectionsBookmark from '../icons/collections-bookmark';
import { ListView } from './list-view';

type FilterItem = {
	name: string;
	isCheck: boolean;
	key: string;
};

export function ConsumerGuideList() {
	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState(10);
	const [query, setQuery] = useState('');

	const [filters, setFilter] = useState<FilterItem[]>(() => [
		{ name: 'All', key: 'all', isCheck: true },
		{ name: 'Deleted Only', key: 'deleted', isCheck: false },
		{ name: 'Active Only', key: 'active', isCheck: false }
	]);

	const selectedFilter = { ...filters.filter((item) => item.isCheck)[0] };
	const [formOpen, setFormOpen] = useState(false);
	const [editingItem, setEditingItem] = useState<ConsumerGuide | null>(null);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [deletingItem, setDeletingItem] = useState<ConsumerGuide | null>(null);

	const [restoringConsumer, setRestoringConsumer] = useState<ConsumerGuide | null>(null);
	const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);

	const {
		items,
		isLoading,
		hasMore,
		totalPages,
		isFetching,
		totalCount,
		isError,
		refetch: retry
	} = useConsumerGuides(page, pageSize, selectedFilter, query);
	const deleteMutation = useDeleteConsumer();
	const restoreMutation = useRestoreConsumer();

	const handleNextPage = () => {
		if (hasMore) setPage((prev) => prev + 1);
	};

	const handlePrevPage = () => {
		if (page > 1) setPage((prev) => prev - 1);
	};

	const handleAdd = () => {
		setEditingItem(null);
		setFormOpen(true);
	};

	const handleEdit = (consumerGuide: ConsumerGuide) => {
		setEditingItem(consumerGuide);
		setFormOpen(true);
	};

	const handleDeleteClick = (consumerGuide: ConsumerGuide) => {
		setDeletingItem(consumerGuide);
		setDeleteDialogOpen(true);
	};

	const handleRestoreClick = (consumerGuide: ConsumerGuide) => {
		setRestoringConsumer(consumerGuide);
		setRestoreDialogOpen(true);
	};

	const handleDeleteConfirm = async () => {
		if (!deletingItem) return;
		try {
			await deleteMutation.mutateAsync(deletingItem.id);
			toast.success(`"${deletingItem.name}" has been deleted.`);
		} catch (error: any) {
			toast.error(error?.message ?? 'Failed to delete item');
		} finally {
			setDeleteDialogOpen(false);
			setDeletingItem(null);
		}
	};

	const handleRestoreConfirm = async () => {
		if (!restoringConsumer) return;
		try {
			await restoreMutation.mutateAsync(restoringConsumer.id);
			toast.success(`"${restoringConsumer.name}" has been restored.`);
		} catch (error: any) {
			toast.error(error?.message ?? 'Failed to restore item');
		} finally {
			setRestoreDialogOpen(false);
			setRestoringConsumer(null);
		}
	};

	const delayQuery = useDebouncedCallback((value) => {
		setQuery(value);
		setPage(1);
	}, 220);

	const handleQuery = (e: ChangeEvent<HTMLInputElement>) => {
		delayQuery(e.target.value);
	};

	return (
		<div className='flex-1 space-y-2'>
			<div>
				<div className='text-2xl text-primary font-bold flex items-center gap-2'>
					<CollectionsBookmark className='size-6' />
					Consumer Guide Collections
				</div>
				<p className='text-sm text-muted-foreground mt-1'>
					Manage the consumer guide collections.{' '}
					{items.length > 0 && <span className='font-medium'>{items.length} total</span>}
				</p>
			</div>
			<div className='flex items-center'>
				<div className='flex flex-col gap-y-1.5'>
					<div className='flex gap-x-2'>
						<InputGroup className='w-80'>
							<InputGroupAddon>
								<Search className='text-muted-foreground' />
							</InputGroupAddon>

							<InputGroupInput
								placeholder='Search by name or definition...'
								onChange={handleQuery}
							/>
						</InputGroup>

						<Button onClick={handleAdd} className='gap-2'>
							<Plus className='h-4 w-4' />
							Add Item
						</Button>
					</div>

					<div className='flex gap-x-1.5'>
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
									<Button variant='outline' className='font-light'>
										Rows: <span className='font-normal'>{pageSize}</span> <ChevronDown />
									</Button>
								}
							/>
							<PopoverContent align='end' className='w-20'>
								{[10, 20, 30].map((size) => {
									return (
										<Button
											onClick={() => setPageSize(size)}
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
			</div>
			<Tabs defaultValue='grid-view'>
				<TabsList>
					<TabsTrigger
						className='aria-selected:text-primary transition-colors duration-300'
						value='table-view'
					>
						<TableIcon />
					</TabsTrigger>
					<TabsTrigger
						className='aria-selected:text-primary transition-colors duration-300'
						value='grid-view'
					>
						<Grid />
					</TabsTrigger>

					<TabsTrigger
						className='aria-selected:text-primary transition-colors duration-300'
						value='list-view'
					>
						<ListViewIcon />
					</TabsTrigger>
				</TabsList>

				<TabsContent value='list-view'>
					<ListView
						{...{
							consumerGuides: items,
							handleRestoreClick,
							query,
							isFetching,
							handleEdit,
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

			<ConsumerGuideFormDialog
				open={formOpen}
				onOpenChange={setFormOpen}
				item={editingItem}
			/>
			<AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete Item</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to delete{' '}
							<span className='font-semibold'>"{deletingItem?.name}"</span>? This action
							can be undone by restoring the item.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDeleteConfirm}
							className='bg-destructive hover:bg-destructive/90'
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
						<AlertDialogTitle>Restore {restoringConsumer?.name}?</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to restore{' '}
							<span className='font-semibold'>"{restoringConsumer?.name}"</span>?
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
