import { useCallback, useEffect } from 'react';
import { useForm, FormProvider, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter
} from '@/components/ui/dialog';

import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { MultiSelect } from '@/components/multi-select';
import { SourceFieldArray } from '@/components/ingredients-management/source-field-array';
import { WhatItDoesFieldArray } from '@/components/ingredients-management/what-it-does-field';
import { useIngredientsConfig } from '@/hooks/use-option';
import { useAddIngredient, useUpdateIngredient } from '@/hooks/use-ingredient-mutation';
import {
	ingredientFormSchema,
	type IngredientFormValues,
	type Ingredient
} from '@/zod/ingredients';

import { toast } from 'sonner';
import Loader from '@/components/icons/loader';
import { generateId } from '@/utils/generate-id';
import { Field, FieldError, FieldLabel } from '../ui/field';
import FileAdd from '../icons/file-add';
import _ from 'lodash';
import X from '../icons/x';
import CheckMarkBadge from '../icons/checkmark-badge';
import BadgeAlert from '../icons/badge-alert';

interface IngredientFormDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	ingredient?: Ingredient | null;
}

const defaultValues: IngredientFormValues = {
	name: '',
	categories: [],
	what_it_does: [],
	what_it_is: '',
	best_for: [],
	info: '',
	common_products: [],
	sources: [],
	safety_level: ''
};

export function IngredientFormDialog({
	open,
	onOpenChange,
	ingredient
}: IngredientFormDialogProps) {
	const isEditing = !!ingredient;
	const {
		data: config,
		isLoading: configLoading,
		isError: configError,
		refetch: configRefetch
	} = useIngredientsConfig();
	const addMutation = useAddIngredient();
	const updateMutation = useUpdateIngredient();

	const form = useForm<IngredientFormValues>({
		resolver: zodResolver(ingredientFormSchema),
		defaultValues
	});
	const foo = form.watch();

	const onSubmit = async (data: IngredientFormValues) => {
		if (isEditing && ingredient) {
			updateMutation.mutate(
				{ id: ingredient.id, data },
				{
					onSuccess: () => {
						toast.success('Ingredient Updated', {
							position: 'top-right',
							description: `${ingredient.name} updated successfully`,
							descriptionClassName: 'text-red',
							duration: 12000,
							icon: <CheckMarkBadge className='text-green-500 size-5' />,
							cancel: {
								label: (
									<X className='size-6 hover:bg-muted/80 duration-300 rounded-full p-1' />
								),
								onClick: () => {}
							}
						});
					},
					onError: (err) => {
						let message = 'Something went wrong. Please try again';

						if (err?.message) {
							message = err.message;
						}

						toast.error('Ingredient Not Updated', {
							description: message,
							position: 'top-right',
							duration: 12000,
							icon: <BadgeAlert className='text-red-500 size-5' />,
							cancel: {
								label: (
									<X className='size-6 hover:bg-muted/80 duration-300 rounded-full p-1' />
								),
								onClick: () => {}
							}
						});
					}
				}
			);
		} else {
			addMutation.mutate(data, {
				onSuccess: () => {
					toast.success('Ingredient Added', {
						position: 'top-right',
						description: `${data.name} is added successfully`,
						descriptionClassName: 'text-red',
						duration: 12000,
						icon: <CheckMarkBadge className='text-green-500 size-5' />,
						cancel: {
							label: (
								<X className='size-6 hover:bg-muted/80 duration-300 rounded-full p-1' />
							),
							onClick: () => {}
						}
					});
				},
				onError: (err) => {
					let message = 'Something went wrong. Please try again';

					if (err?.message) {
						message = err.message;
					}

					toast.error('Ingredient Not Added', {
						description: message,
						position: 'top-right',
						duration: 12000,
						icon: <BadgeAlert className='text-red-500 size-5' />,
						cancel: {
							label: (
								<X className='size-6 hover:bg-muted/80 duration-300 rounded-full p-1' />
							),
							onClick: () => {}
						}
					});
				}
			});
		}
		onOpenChange(false);
	};

	const isPending = addMutation.isPending || updateMutation.isPending;

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

	useEffect(() => {
		if (open) {
			if (ingredient) {
				form.reset({
					name: ingredient.name,
					categories: ingredient.categories,
					what_it_does:
						ingredient.what_it_does.length > 0 ? ingredient.what_it_does : [''],
					what_it_is: ingredient.what_it_is,
					best_for: ingredient.best_for,
					info: ingredient.info ?? '',
					common_products: ingredient.common_products,
					sources:
						ingredient.sources.length > 0 ? ingredient.sources : [{ name: '', link: '' }],
					safety_level: ingredient.safety_level ?? ''
				});
			} else {
				form.reset(defaultValues);
			}
		}
	}, [open, ingredient, form]);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
				<DialogHeader>
					<DialogTitle>{isEditing ? 'Edit Ingredient' : 'Add Ingredient'}</DialogTitle>
					<DialogDescription>
						{isEditing
							? 'Update the ingredient details below.'
							: 'Fill in the details to add a new ingredient.'}
					</DialogDescription>
				</DialogHeader>

				<FormProvider {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
						<Controller
							control={form.control}
							name='name'
							render={({ field, fieldState: { invalid, error } }) => (
								<Field data-invalid={invalid}>
									<FieldLabel className='text-xs' htmlFor={field.name}>
										Name <span className='text-destructive'>*</span>
									</FieldLabel>

									<Input id={field.name} placeholder='e.g., Hyaluronic Acid' {...field} />

									{/* {!isEditing && field.value && (
										<p className='text-xs text-muted-foreground'>
											ID: <code>{generateId(field.value)}</code>
										</p>
									)}
									{isEditing && ingredient && (
										<p className='text-xs text-muted-foreground'>
											ID: <code>{ingredient.id}</code> (read-only)
										</p>
									)} */}
									{invalid && <FieldError errors={[error]} />}
								</Field>
							)}
						/>

						<Controller
							control={form.control}
							name='what_it_is'
							render={({ field, fieldState: { invalid, error } }) => (
								<Field data-invalid={invalid}>
									<FieldLabel className='text-xs' htmlFor={field.name}>
										What It Is <span className='text-destructive'>*</span>
									</FieldLabel>

									<Textarea
										id={field.name}
										rows={3}
										placeholder='e.g., A naturally occurring substance in the skin'
										{...field}
									/>

									{invalid && <FieldError errors={[error]} />}
								</Field>
							)}
						/>

						<WhatItDoesFieldArray />

						<Controller
							control={form.control}
							name='common_products'
							render={({ field, fieldState: { invalid, error } }) => (
								<Field data-invalid={invalid}>
									<FieldLabel className='text-xs'>
										Common Products <span className='text-destructive'>*</span>
									</FieldLabel>

									<MultiSelect
										options={commonProductsOptions}
										selected={field.value}
										onChange={field.onChange}
										placeholder='Select common products...'
										isLoading={configLoading}
									/>
									{invalid && <FieldError errors={[error]} />}
								</Field>
							)}
						/>

						<Controller
							control={form.control}
							name='best_for'
							render={({ field, fieldState: { invalid, error } }) => (
								<Field data-invalid={invalid}>
									<FieldLabel className='text-xs' htmlFor={field.name}>
										Best For <span className='text-destructive'>*</span>
									</FieldLabel>

									<MultiSelect
										options={bestForOptions}
										selected={field.value}
										onChange={field.onChange}
										placeholder='Select best for...'
										isLoading={configLoading}
									/>
									{invalid && <FieldError errors={[error]} />}
								</Field>
							)}
						/>

						<Controller
							control={form.control}
							name='categories'
							render={({ field, fieldState: { invalid, error } }) => (
								<Field data-invalid={invalid}>
									<FieldLabel className='text-xs' htmlFor={field.name}>
										Categories <span className='text-destructive'>*</span>
									</FieldLabel>

									<MultiSelect
										options={categoryOptions}
										selected={field.value}
										onChange={field.onChange}
										placeholder='Select categories...'
										isLoading={configLoading}
									/>
									{invalid && <FieldError errors={[error]} />}
								</Field>
							)}
						/>

						<SourceFieldArray />

						<Controller
							control={form.control}
							name='safety_level'
							render={({ field }) => (
								<Field>
									<FieldLabel className='text-xs' htmlFor={field.name}>
										Safety Level
									</FieldLabel>
									<Textarea
										placeholder='e.g., Generally recognized as safe'
										{...field}
										rows={3}
									/>
								</Field>
							)}
						/>

						<Controller
							control={form.control}
							name='info'
							render={({ field }) => (
								<Field>
									<FieldLabel className='text-xs' htmlFor={field.name}>
										Additional Information
									</FieldLabel>

									<Textarea
										placeholder='Additional information about this ingredient...'
										rows={3}
										{...field}
									/>
								</Field>
							)}
						/>

						<DialogFooter className='pt-4'>
							<Button
								type='button'
								variant='outline'
								onClick={() => onOpenChange(false)}
								disabled={isPending}
							>
								Cancel
							</Button>
							<Button type='submit' disabled={isPending || !form.formState.isDirty}>
								{!isEditing && <FileAdd />}
								{isPending && <Loader className='mr-2 h-4 w-4 animate-spin' />}
								{isEditing ? 'Update' : 'Add'}
							</Button>
						</DialogFooter>
					</form>
				</FormProvider>
			</DialogContent>
		</Dialog>
	);
}
