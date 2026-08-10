import { Controller, useFieldArray, useFormContext } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { type IngredientFormValues } from '@/zod/ingredients';
import Plus from '@/components/icons/plus';
import Trash from '@/components/icons/trash';
import { Field, FieldError, FieldLabel } from '../ui/field';

export function WhatItDoesFieldArray() {
	const form = useFormContext<IngredientFormValues>();
	const { fields, append, remove } = useFieldArray({
		control: form.control,
		name: 'what_it_does' as any
	});

	return (
		<div className='space-y-1.5'>
			<div className='flex items-center justify-between'>
				<Field data-invalid={form.getFieldState('what_it_does').invalid}>
					<FieldLabel className='text-xs font-medium'>
						What It Does <span className='text-destructive'>*</span>
					</FieldLabel>
				</Field>

				<Button
					type='button'
					variant='outline'
					size='sm'
					onClick={() => append('' as any)}
					className='h-7 gap-1 text-[10px]'
				>
					<Plus className='h-1 w-1' />
					Add Entry
				</Button>
			</div>

			{fields.map((field, index) => (
				<div key={field.id} className='flex items-center gap-2'>
					<Controller
						control={form.control}
						name={`what_it_does.${index}`}
						render={({ field, fieldState: { invalid, error } }) => (
							<Field className='flex-1'>
								<Input
									placeholder='e.g., Moisturizes and hydrates the skin'
									{...field}
									className='h-9 text-sm'
								/>

								{invalid && <FieldError errors={[error]} />}
							</Field>
						)}
					/>
					{fields.length > 1 && (
						<Button
							type='button'
							variant='ghost'
							size='icon'
							onClick={() => remove(index)}
							className='h-8 w-8 shrink-0 text-destructive hover:text-destructive'
						>
							<Trash className='h-4 w-4' />
						</Button>
					)}
				</div>
			))}

			{form.formState.errors.what_it_does?.message && (
				<FieldError className='text-xs text-destructive'>
					{form.formState.errors.what_it_does.message}
				</FieldError>
			)}
		</div>
	);
}
