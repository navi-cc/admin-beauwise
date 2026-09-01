import React, { useMemo, useState } from 'react';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

import { GEMINI_MODELS, MODEL_ICONS } from '@/constants/llm-ops';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Button } from '../ui/button';
import ChevronDown from '../icons/chevron-down';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';

interface ModelSelectorProps {
	selectedModel: string;

	onModelChange: (model: string) => void;
}

export function ModelSelector({ selectedModel, onModelChange }: ModelSelectorProps) {
	const selectedModelData = useMemo(
		() => GEMINI_MODELS.find((m) => m.id === selectedModel),
		[selectedModel]
	);

	const handleModelSelect = (modelId: string) => {
		onModelChange(modelId);

		console.log('selected model', modelId);
	};

	return (
		<div className='space-y-3'>
			<div className='space-y-1.5'>
				<Label className='text-sm font-medium'>Model</Label>
				<Popover>
					<PopoverTrigger
						render={
							<Button variant='outline' className='font-light'>
								<span className='font-normal capitalize'>{selectedModelData?.name}</span>{' '}
								<ChevronDown />
							</Button>
						}
					/>
					<PopoverContent align='start' className='w-50'>
						{GEMINI_MODELS.map((model) => {
							const Icon = MODEL_ICONS[model.id];
							return (
								<Tooltip>
									<TooltipTrigger
										render={
											<Button
												key={model.id}
												onClick={() => {
													handleModelSelect(model.id);
												}}
												variant='ghost'
												className={`capitalize font-light transition-colors duration-300 ${model.id === selectedModelData?.id ? 'bg-muted' : 'bg-transparent'}`}
											>
												<div className='flex items-center gap-1.5'>
													{Icon && (
														<Icon className='h-4 w-4 text-muted-foreground shrink-0' />
													)}
													<div className='flex flex-col'>
														<span className='text-sm font-medium'>{model.name}</span>
													</div>
												</div>
											</Button>
										}
									/>
									<TooltipContent side='left'>{model.description}</TooltipContent>
								</Tooltip>
							);
						})}
					</PopoverContent>
				</Popover>
				{/* Selected model info */}
				{selectedModelData && (
					<p className='text-xs text-muted-foreground pl-0.5'>
						{selectedModelData.description}
					</p>
				)}
			</div>
		</div>
	);
}
