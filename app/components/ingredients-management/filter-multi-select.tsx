import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

import X from '@/components/icons/x';

import Check from '@/components/icons/check';
import UnfoldMore from '@/components/icons/unfold-more';

interface FilterMultiSelectProps {
	name: string;
	options: { label: string; value: string }[] | undefined;
	currentConfirmSelectedCount: number;
	selected: string[];
	onChange: (values: string[]) => void;
	placeholder?: string;
	className?: string;
	isLoading?: boolean;
}

export function FilterMultiSelect({
	currentConfirmSelectedCount,
	name,
	options,
	selected,
	onChange,
	className,
	isLoading = false
}: FilterMultiSelectProps) {
	const [open, setOpen] = React.useState(false);

	const handleToggle = (value: string) => {
		if (selected.includes(value)) {
			onChange(selected.filter((s) => s !== value));
		} else {
			onChange([...selected, value]);
		}
	};

	const handleRemove = (value: string) => {
		onChange(selected.filter((s) => s !== value));
	};

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger
				render={
					<Button
						variant='ghost'
						role='combobox'
						aria-expanded={open}
						className={cn(
							'flex flex-1 pl-2 pr-2 font-light p-1.5 items-center justify-start text-xs',
							className
						)}
					>
						<span>
							{name
								.split('_')
								.map((value) => value[0].toUpperCase() + value.slice(1))
								.join(' ')}
						</span>
						<span className='ml-auto font-semibold text-primary p-1'>
							{selected.length === currentConfirmSelectedCount
								? currentConfirmSelectedCount
								: selected.length}{' '}
							Selected
						</span>
					</Button>
				}
			/>

			<PopoverContent align='start' className='gap-0 p-2'>
				<Command>
					<CommandInput placeholder='Search...' autoFocus={true} />
					<CommandList>
						{isLoading ? (
							<div className='py-6 text-center text-sm text-muted-foreground'>
								Loading options...
							</div>
						) : (
							<>
								<CommandEmpty>No results found.</CommandEmpty>
								<CommandGroup>
									{options?.map((option) => (
										<CommandItem
											className='font-light text-[10px]'
											key={option.value}
											onSelect={() => handleToggle(option.value)}
										>
											<Check
												className={cn(
													'mr-2 h-4 w-4',
													selected.includes(option.value) ? 'opacity-100' : 'opacity-0'
												)}
											/>
											{option.label}
										</CommandItem>
									))}
								</CommandGroup>
							</>
						)}
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
}
