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
	};

	return (
		<div className='space-y-3'>
			<div className='space-y-1.5'>
				<Label className='text-sm font-medium'>Model</Label>
				<Select value={selectedModel} onValueChange={handleModelSelect}>
					<SelectTrigger className='w-full h-10'>
						<SelectValue placeholder='Select a model' />
					</SelectTrigger>
					<SelectContent>
						{GEMINI_MODELS.map((model) => {
							const Icon = MODEL_ICONS[model.id];
							return (
								<SelectItem key={model.id} value={model.id} className='py-2.5'>
									<div className='flex items-center gap-2'>
										{Icon && <Icon className='h-4 w-4 text-muted-foreground shrink-0' />}
										<div className='flex flex-col'>
											<span className='text-sm font-medium'>{model.name}</span>
											<span className='text-xs text-muted-foreground'>
												{model.description}
											</span>
										</div>
									</div>
								</SelectItem>
							);
						})}
					</SelectContent>
				</Select>

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
