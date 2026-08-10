import { useState, useDeferredValue, type ChangeEvent } from 'react';
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
import { MythFactFormDialog } from './myth-fact-form-dialog';
import { useMythFacts } from '@/hooks/use-myth-facts';
import { useDeleteMythFact, useRestoreMythFact } from '@/hooks/use-myth-fact-mutation';
import { type MythFact } from '@/zod/myth-fact';
// import {
// 	Search,
// 	Plus,
// 	Pencil,
// 	Trash,
// 	Loader,
// 	ImageCompositionOval,
// 	BookOpen,
// 	Video,
// 	Link
// } from 'lucide-react';

Link;

import { toast } from 'sonner';
import Search from '../icons/search';
import Plus from '../icons/plus';
import Pencil from '../icons/penicl';
import Trash from '../icons/trash';
import Loader from '../icons/loader';
import ImageCompositionOval from '../icons/image-composition-oval';
import Video from '../icons/video';
import Link from '../icons/link';
import { useDebouncedCallback } from 'use-debounce';
import BookOpen from '../icons/book-open';
import CollectionsBookmark from '../icons/collections-bookmark';
import Archive from '../icons/archive';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import TableIcon from '../icons/table';
import Grid from '../icons/grid';
import ListViewIcon from '../icons/list-view';
import { ListView } from './list-view';
import { TableView } from './table-view';
import { GridView } from './grid-view';
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

type FilterItem = {
	name: string;
	isCheck: boolean;
	key: string;
};

export function MythFactList() {
	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState(10);
	const [query, setQuery] = useState('');

	const [filters, setFilter] = useState<FilterItem[]>(() => [
		{ name: 'All', key: 'all', isCheck: true },
		{ name: 'Deleted Only', key: 'deleted', isCheck: false },
		{ name: 'Active Only', key: 'active', isCheck: false }
	]);

	const selectedFilter = { ...filters.filter((item) => item.isCheck)[0] };

	// Dialog state
	const [formOpen, setFormOpen] = useState(false);
	const [editingMythFact, setEditingMythFact] = useState<MythFact | null>(null);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [mythFact, setDeletingMythFact] = useState<MythFact | null>(null);

	const [restoringMythFact, setRestoringMythFact] = useState<MythFact | null>(null);
	const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);

	const {
		items,
		hasMore,
		isFetching,
		isError,
		totalCount,
		totalPages,
		isRefetchError,
		refetch: retry
	} = useMythFacts(page, pageSize, selectedFilter, query);
	const deleteMutation = useDeleteMythFact();
	const restoreMutation = useRestoreMythFact();

	const handleNextPage = () => {
		if (hasMore) setPage((prev) => prev + 1);
	};

	const handlePrevPage = () => {
		if (page > 1) setPage((prev) => prev - 1);
	};

	const handleAdd = () => {
		setEditingMythFact(null);
		setFormOpen(true);
	};

	const handleRestoreClick = (mythFact: MythFact) => {
		setRestoringMythFact(mythFact);
		setRestoreDialogOpen(true);
	};

	const handleEdit = (mythFact: MythFact) => {
		setEditingMythFact(mythFact);
		setFormOpen(true);
	};

	const handleDeleteClick = (mythFact: MythFact) => {
		setDeletingMythFact(mythFact);
		setDeleteDialogOpen(true);
	};

	const handleRestoreConfirm = async () => {
		if (!restoringMythFact) return;
		try {
			await restoreMutation.mutateAsync(restoringMythFact.id as string);
			toast.success(`"${restoringMythFact.name}" has been restored.`);
		} catch (error: any) {
			toast.error(error?.message ?? 'Failed to restore item');
		} finally {
			setRestoreDialogOpen(false);
			setRestoringMythFact(null);
		}
	};

	const handleDeleteConfirm = async () => {
		if (!mythFact) return;
		try {
			await deleteMutation.mutateAsync(mythFact.id as string);
			toast.success(`"${mythFact.name}" has been deleted.`);
		} catch (error: any) {
			toast.error(error?.message ?? `Failed to delete ${mythFact.name}`);
		} finally {
			setDeleteDialogOpen(false);
			setDeletingMythFact(null);
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
		<div className='space-y-1.5'>
			<div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
				<div>
					<div className='text-1xl text-primary font-semibold flex items-center gap-2'>
						<Archive className='h-6 w-6 text-primary' />
						Myths & Facts Directory
					</div>
					<p className='text-sm text-muted-foreground mt-1'>
						Manage the myths and facts directory.{' '}
						{items.length > 0 && (
							<span className='font-medium'>{items.length} total</span>
						)}
					</p>
				</div>
			</div>
			<div className='max-w-sm flex flex-col gap-y-1.5'>
				<div className='max-w-sm flex gap-x-1.5'>
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

					<Button onClick={handleAdd} className='gap-2'>
						<Plus className='h-4 w-4' />
						Add New Item
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
			<Tabs defaultValue='list-view'>
				<TabsList>
					<TabsTrigger
						value='list-view'
						className='aria-selected:text-primary transition-colors duration-300'
					>
						<ListViewIcon />
					</TabsTrigger>
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
				</TabsList>

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

				<TabsContent value='list-view'>
					<ListView
						{...{
							mythFacts: items,
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
			<MythFactFormDialog
				open={formOpen}
				onOpenChange={setFormOpen}
				isEditing={!!editingMythFact}
				consumerGuide={editingMythFact}
			/>
			<AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete Guide</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to delete{' '}
							<span className='font-semibold'>"{mythFact?.name}"</span>? This action can
							be undone by restoring the item.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDeleteConfirm}
							className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
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
						<AlertDialogTitle>Restore {restoringMythFact?.name}?</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to restore{' '}
							<span className='font-semibold'>"{restoringMythFact?.name}"</span>?
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
