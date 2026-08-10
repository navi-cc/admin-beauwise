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

interface MultiSelectProps {
	options: { label: string; value: string }[] | undefined;
	selected: string[];
	onChange: (values: string[]) => void;
	placeholder?: string;
	className?: string;
	isLoading?: boolean;
}

export function MultiSelect({
	options,
	selected,
	onChange,
	placeholder = 'Select items...',
	className,
	isLoading = false
}: MultiSelectProps) {
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
						variant='outline'
						role='combobox'
						aria-expanded={open}
						className={cn(
							'w-full justify-between h-auto min-h-10 font-normal',
							className
						)}
					>
						<div className='flex flex-wrap gap-1 py-2'>
							{selected.length > 0 ? (
								selected.map((value) => {
									const option = options?.find((o) => o.value === value);
									return (
										<Badge key={value} variant='secondary' className='mr-1 mb-0.5'>
											{option?.label ?? value}
											<button
												className='ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2'
												onMouseDown={(e) => {
													e.preventDefault();
													e.stopPropagation();
												}}
												onClick={(e) => {
													e.stopPropagation();
													handleRemove(value);
												}}
											>
												<X className='h-3 w-3 text-muted-foreground hover:text-foreground' />
											</button>
										</Badge>
									);
								})
							) : (
								<span className='text-muted-foreground'>{placeholder}</span>
							)}
						</div>
						<UnfoldMore />
					</Button>
				}
			/>

			<PopoverContent
				className='w-[var(--radix-popover-trigger-width)] p-0'
				align='start'
			>
				<Command>
					<CommandInput placeholder='Search...' />
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
