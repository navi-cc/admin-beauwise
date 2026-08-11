import {
	type ColumnDef,
	flexRender,
	getCoreRowModel,
	useReactTable,
	getPaginationRowModel,
	getSortedRowModel,
	type SortingState,
	getFilteredRowModel,
	type ColumnFiltersState,
	type OnChangeFn,
	type PaginationState
} from '@tanstack/react-table';
import { useState } from 'react';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import RefreshCw from '../icons/refresh-cw';
import AlertCircle from '../icons/alert-circle';
import type { User } from '@/types/user';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import ChevronDown from '../icons/chevron-down';
import Refresh from '../icons/refresh';
import ChevronRight from '../icons/chevron-right';
import ChevronLeft from '../icons/chevron-left';
interface DataTableProps<TData, TValue> {
	columns: ColumnDef<TData, TValue>[];
	data: TData[];
	searchKey?: string;
	searchPlaceholder?: string;
	pageCount: number;
	pageIndex: number;
	pageSize: number;
	onPaginationChange: OnChangeFn<PaginationState>;
	onPageSizeChange: (size: number) => () => void;
	isUserTableLoading: boolean;
	isRefetchError: boolean;
	isError: boolean;
	retry: () => void;
}
export function DataTable<TData, TValue>({
	columns,
	data,
	searchKey = 'email',
	searchPlaceholder = 'Filter by email...',
	pageCount,
	pageIndex,
	pageSize,
	onPaginationChange,
	onPageSizeChange,
	isUserTableLoading,
	isError,
	isRefetchError,
	retry
}: DataTableProps<TData, TValue>) {
	const [sorting, setSorting] = useState<SortingState>([]);
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
	const table = useReactTable({
		data,
		columns,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		onSortingChange: setSorting,
		onColumnFiltersChange: setColumnFilters,
		manualPagination: true,
		pageCount,
		onPaginationChange,
		state: {
			sorting,
			columnFilters,
			pagination: {
				pageIndex,
				pageSize
			}
		}
	});
	return (
		<div className='space-y-4'>
			<div className='flex flex-col items-start gap-1.5'>
				<Input
					placeholder={searchPlaceholder}
					value={(table.getColumn(searchKey)?.getFilterValue() as string) ?? ''}
					onChange={(event) =>
						table.getColumn(searchKey)?.setFilterValue(event.target.value)
					}
					className='max-w-sm'
				/>

				<div className='flex gap-1.5'>
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
										onClick={onPageSizeChange(size)}
										variant='ghost'
										className={`font-light transition-colors duration-300 ${size === pageSize ? 'bg-muted' : 'bg-transparent'}`}
									>
										{size}
									</Button>
								);
							})}
						</PopoverContent>
					</Popover>

					<Button variant='outline' className='font-light' onClick={retry}>
						Refresh <Refresh />
					</Button>
				</div>
			</div>
			<div className='rounded-md border'>
				<Table>
					<TableHeader>
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers.map((header) => (
									<TableHead key={header.id}>
										{header.isPlaceholder
											? null
											: flexRender(header.column.columnDef.header, header.getContext())}
									</TableHead>
								))}
							</TableRow>
						))}
					</TableHeader>
					<TableBody>
						{isUserTableLoading ? (
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
						) : isError || isRefetchError ? (
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
											onClick={() => retry()}
											variant='outline'
											className='hover:text-primary transition-colors duration-300'
										>
											Retry
											<RefreshCw />
										</Button>
									</div>
								</TableCell>
							</TableRow>
						) : table.getRowModel().rows?.length === 0 ? (
							<TableRow>
								<TableCell colSpan={5} className='h-48 text-center'>
									<div className='flex flex-col items-center gap-2 text-muted-foreground'>
										No users found.
									</div>
								</TableCell>
							</TableRow>
						) : (
							table.getRowModel().rows.map((row) => {
								const isAdmin = (row.original as User).account_access.roles === 'admin';

								return (
									<TableRow
										key={row.id}
										data-state={row.getIsSelected() && 'selected'}
										aria-disabled={isAdmin}
										className={
											isAdmin
												? 'opacity-80 select-none bg-muted/30 hover:cursor-not-allowed '
												: ''
										}
									>
										{row.getVisibleCells().map((cell) => (
											<TableCell key={cell.id}>
												{flexRender(cell.column.columnDef.cell, cell.getContext())}
											</TableCell>
										))}
									</TableRow>
								);
							})
						)}
					</TableBody>
				</Table>
			</div>
			<div className='flex items-center justify-between'>
				<div className='text-sm text-muted-foreground'>
					Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
				</div>
				<div className='flex items-center space-x-2 text-primary'>
					<Button
						variant='outline'
						size='sm'
						onClick={() => table.previousPage()}
						disabled={!table.getCanPreviousPage()}
					>
						<ChevronLeft /> Previous
					</Button>
					<Button
						variant='outline'
						size='sm'
						className='text-primary'
						onClick={() => table.nextPage()}
						disabled={!table.getCanNextPage()}
					>
						Next <ChevronRight />
					</Button>
				</div>
			</div>
		</div>
	);
}
