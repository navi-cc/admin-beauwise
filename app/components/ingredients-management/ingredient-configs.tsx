import React, { useState } from 'react';
import {
	Card,
	CardHeader,
	CardTitle,
	CardDescription,
	CardContent,
	CardFooter
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
	useIngredientsConfig,
	useAddOption,
	useUpdateOption,
	useDeleteOption
} from '@/hooks/use-option';
import { type IngredientsConfig } from '@/services/option-service';
import { toast } from 'sonner';
import Loader from '@/components/icons/loader';
import Plus from '@/components/icons/plus';
import Pencil from '@/components/icons/penicl';
import Trash from '@/components/icons/trash';
import Check from '@/components/icons/check';
import X from '@/components/icons/x';
import { Skeleton } from '../ui/skeleton';
import RefreshCw from '../icons/refresh-cw';
import Settings from '../icons/settings';
import CheckMarkBadge from '../icons/checkmark-badge';
import BadgeAlert from '../icons/badge-alert';

interface ConfigItemRowProps {
	item: string;
	field: keyof IngredientsConfig;
	allItems: string[];
}

function ConfigItemRow({ item, field, allItems }: ConfigItemRowProps) {
	const [isEditing, setIsEditing] = useState(false);
	const [editValue, setEditValue] = useState(item);

	const { mutateAsync: updateOption, isPending: isUpdating } = useUpdateOption();
	const { mutateAsync: deleteOption, isPending: isDeleting } = useDeleteOption();

	const handleUpdate = async (e: React.SubmitEvent) => {
		e.preventDefault();
		const trimmedValue = editValue.trim();

		if (!trimmedValue) {
			toast.error('Value cannot be empty');
			return;
		}

		if (trimmedValue === item) {
			setIsEditing(false);
			return;
		}

		if (allItems.includes(trimmedValue)) {
			toast.error(`"${trimmedValue}" already exists`);
			return;
		}

		try {
			await updateOption({ field, oldValue: item, newValue: trimmedValue });

			toast.success(`Item Updated`, {
				position: 'top-right',
				description: `"${item}" is successfully updated to ${trimmedValue}.`,
				descriptionClassName: 'text-red',
				duration: 12000,
				icon: <CheckMarkBadge className='text-green-500 size-5' />,
				cancel: {
					label: <X className='size-6 hover:bg-muted/80 duration-300 rounded-full p-1' />,
					onClick: () => {}
				}
			});

			setIsEditing(false);
		} catch (error: any) {
			toast.error(`Item Update Failed`, {
				position: 'top-right',
				description: `"${item}" is not updated. Please try again.`,
				descriptionClassName: 'text-red',
				duration: 12000,
				icon: <BadgeAlert className='text-red-500 size-5' />,
				cancel: {
					label: <X className='size-6 hover:bg-muted/80 duration-300 rounded-full p-1' />,
					onClick: () => {}
				}
			});
		}
	};

	const handleDelete = async () => {
		try {
			await deleteOption({ field, value: item });

			toast.success(`Item Deleted`, {
				position: 'top-right',
				description: `"${item}" is successfully deleted.`,
				descriptionClassName: 'text-red',
				duration: 12000,
				icon: <CheckMarkBadge className='text-green-500 size-5' />,
				cancel: {
					label: <X className='size-6 hover:bg-muted/80 duration-300 rounded-full p-1' />,
					onClick: () => {}
				}
			});
		} catch (error: any) {
			toast.error(`Item Delete Failed`, {
				position: 'top-right',
				description: `"${item}" is not deleted. Please try again.`,
				descriptionClassName: 'text-red',
				duration: 12000,
				icon: <BadgeAlert className='text-red-500 size-5' />,
				cancel: {
					label: <X className='size-6 hover:bg-muted/80 duration-300 rounded-full p-1' />,
					onClick: () => {}
				}
			});
		}
	};

	if (isEditing) {
		return (
			<form
				onSubmit={handleUpdate}
				className='flex items-center justify-between p-2 rounded-md border bg-muted/50 gap-2'
			>
				<Input
					value={editValue}
					onChange={(e) => setEditValue(e.target.value)}
					className='h-8 text-sm'
					autoFocus
					disabled={isUpdating}
				/>
				<div className='flex items-center gap-1 shrink-0'>
					<Button
						type='submit'
						size='icon'
						variant='ghost'
						className='h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-100 dark:hover:bg-green-900/30'
						disabled={isUpdating}
					>
						{isUpdating ? (
							<Loader className='h-4 w-4 animate-spin' />
						) : (
							<Check className='h-4 w-4' />
						)}
					</Button>
					<Button
						type='button'
						size='icon'
						variant='ghost'
						className='h-8 w-8'
						onClick={() => {
							setIsEditing(false);
							setEditValue(item);
						}}
						disabled={isUpdating}
					>
						<X className='h-4 w-4' />
					</Button>
				</div>
			</form>
		);
	}

	return (
		<div className='flex items-center justify-between p-2 rounded-md border border-transparent hover:border-border/50 hover:bg-muted/30 group transition-colors'>
			<span className='text-xs font-light'>{item}</span>
			<div className='flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity'>
				<Button
					size='icon'
					variant='ghost'
					className='h-8 w-8'
					onClick={() => setIsEditing(true)}
					disabled={isDeleting}
				>
					<Pencil className='h-4 w-4 text-muted-foreground' />
				</Button>
				<Button
					size='icon'
					variant='ghost'
					className='h-8 w-8 hover:text-destructive hover:bg-destructive/10'
					onClick={handleDelete}
					disabled={isDeleting}
				>
					{isDeleting ? (
						<Loader className='h-4 w-4 animate-spin text-destructive' />
					) : (
						<Trash className='h-4 w-4 text-muted-foreground hover:text-destructive' />
					)}
				</Button>
			</div>
		</div>
	);
}

interface ConfigCardProps {
	title: string;
	description: string;
	field: keyof IngredientsConfig;
	items: string[];
}

function ConfigCard({ title, description, field, items }: ConfigCardProps) {
	const [newValue, setNewValue] = useState('');
	const { mutateAsync: addOption, isPending } = useAddOption();

	const handleAdd = async (e: React.FormEvent) => {
		e.preventDefault();
		const trimmedValue = newValue.trim();
		if (!trimmedValue) return;

		if (items.includes(trimmedValue)) {
			toast.error(`"${trimmedValue}" already exists in ${title}`);
			return;
		}

		try {
			await addOption({ field, value: trimmedValue });

			toast.success(`Item Added To ${title}`, {
				position: 'top-right',
				description: `"${trimmedValue}" is successfully added.`,
				descriptionClassName: 'text-red',
				duration: 12000,
				icon: <CheckMarkBadge className='text-green-500 size-5' />,
				cancel: {
					label: <X className='size-6 hover:bg-muted/80 duration-300 rounded-full p-1' />,
					onClick: () => {}
				}
			});

			setNewValue('');
		} catch (error: any) {
			toast.error(`Item Not Added To ${title}`, {
				position: 'top-right',
				description: `Something went wrong. Please try again`,
				descriptionClassName: 'text-red',
				duration: 12000,
				icon: <BadgeAlert className='text-red-500 size-5' />,
				cancel: {
					label: <X className='size-6 hover:bg-muted/80 duration-300 rounded-full p-1' />,
					onClick: () => {}
				}
			});
		}
	};

	return (
		<Card className='flex flex-col h-full max-h-[500px]'>
			<CardHeader className='shrink-0 pb-4'>
				<CardTitle className='text-base'>{title}</CardTitle>
				<CardDescription className='text-xs'>{description}</CardDescription>
			</CardHeader>

			<CardContent className='flex-1 overflow-y-auto px-4 py-0 min-h-[200px]'>
				{items.length === 0 ? (
					<p className='text-sm text-muted-foreground italic py-4 text-center'>
						No items added yet.
					</p>
				) : (
					<div className='flex flex-col gap-1 py-2'>
						{items.map((item) => (
							<ConfigItemRow key={item} item={item} field={field} allItems={items} />
						))}
					</div>
				)}
			</CardContent>

			<CardFooter className='shrink-0 pt-4 border-t'>
				<form onSubmit={handleAdd} className='flex w-full items-center gap-2'>
					<Input
						placeholder={`New ${title.toLowerCase()}...`}
						value={newValue}
						onChange={(e) => setNewValue(e.target.value)}
						disabled={isPending}
						className='flex-1 h-9'
					/>
					<Button type='submit' size='sm' disabled={!newValue.trim() || isPending}>
						{isPending ? (
							<Loader className='h-4 w-4 animate-spin' />
						) : (
							<Plus className='h-4 w-4' />
						)}
						<span className='sr-only'>Add</span>
					</Button>
				</form>
			</CardFooter>
		</Card>
	);
}

export function ConfigCards() {
	const {
		data: config,
		isLoading,
		error,
		isError,
		isRefetchError,
		refetch: retry
	} = useIngredientsConfig();

	if (isLoading) {
		return (
			<div className='grid gap-6 md:grid-cols-3'>
				{[1, 2, 3].map((i) => (
					<Skeleton key={i} className='h-[400px] animate-pulse bg-muted/50' />
				))}
			</div>
		);
	}

	if (isError || isRefetchError) {
		return (
			<div className='flex flex-col p-4 text-sm text-destructive rounded-md items-center justify-center gap-y-2'>
				<p>Failed to load configuration.</p>
				<Button
					onClick={() =>
						retry({
							throwOnError: true
						})
					}
					variant='secondary'
				>
					Retry
					<RefreshCw />
				</Button>
			</div>
		);
	}

	return (
		<div className='space-y-6'>
			<div>
				<div className='flex items-center text-primary gap-x-1.5'>
					<Settings className='h-5 w-5' />
					<span className='text-lg font-semibold'>Configuration</span>
				</div>

				<p className='text-xs text-muted-foreground'>
					Manage the dynamic options available in the ingredient form.
				</p>
			</div>

			<div className='grid gap-6 md:grid-cols-3'>
				<ConfigCard
					title='Categories'
					description='Ingredient classification categories.'
					field='categories'
					items={config?.categories || []}
				/>
				<ConfigCard
					title='Best For'
					description='Skin concerns or conditions.'
					field='best_for'
					items={config?.best_for || []}
				/>
				<ConfigCard
					title='Common Products'
					description='Product types that usually contain this.'
					field='common_products'
					items={config?.common_products || []}
				/>
			</div>
		</div>
	);
}
