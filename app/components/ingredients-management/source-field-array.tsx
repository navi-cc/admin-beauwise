import { useFieldArray, useFormContext } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field, FieldLabel, FieldError } from '@/components/ui/field';
import { type IngredientFormValues } from '@/zod/ingredients';
import Plus from '@/components/icons/plus';
import Trash from '@/components/icons/trash';

export function SourceFieldArray() {
	const form = useFormContext<IngredientFormValues>();
	const { fields, append, remove } = useFieldArray({
		control: form.control,
		name: 'sources'
	});

	const arrayError =
		form.formState.errors.sources?.root?.message ||
		form.formState.errors.sources?.message;

	return (
		<Field className='space-y-3'>
			<div className='flex items-center justify-between'>
				<FieldLabel
					data-invalid={form.getFieldState('sources').invalid}
					className='text-xs font-medium data-[invalid=true]:text-red-600 transition-colors duration-300'
				>
					Sources <span className='text-destructive'>*</span>
				</FieldLabel>
				<Button
					type='button'
					variant='outline'
					size='sm'
					onClick={() => append({ name: '', link: '' })}
					className='h-7 gap-1 text-[10px]'
				>
					<Plus className='h-3 w-3' />
					Add Source
				</Button>
			</div>

			{fields.map((item, index) => {
				const nameError = form.formState.errors.sources?.[index]?.name?.message;
				const linkError = form.formState.errors.sources?.[index]?.link?.message;

				return (
					<div
						key={item.id}
						className='flex items-start gap-2 rounded-lg border border-border/50 bg-muted/30 p-3'
					>
						<div className='flex-1 space-y-2'>
							<Field>
								<Input
									placeholder='Source name *'
									{...form.register(`sources.${index}.name`)}
									className='h-8 text-sm'
									aria-invalid={!!nameError}
								/>
								{nameError && <FieldError>{nameError}</FieldError>}
							</Field>

							<Field>
								<Input
									placeholder='https://example.com *'
									{...form.register(`sources.${index}.link`)}
									className='h-8 text-sm'
									aria-invalid={!!linkError}
								/>
								{linkError && <FieldError>{linkError}</FieldError>}
							</Field>
						</div>

						{fields.length > 1 && (
							<Button
								type='button'
								variant='ghost'
								size='icon'
								onClick={() => remove(index)}
								className='h-8 w-8 shrink-0 text-destructive hover:text-destructive mt-1'
							>
								<Trash className='h-4 w-4' />
							</Button>
						)}
					</div>
				);
			})}

			{arrayError && <FieldError>{arrayError}</FieldError>}
		</Field>
	);
}
