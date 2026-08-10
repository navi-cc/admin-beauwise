import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle
} from '@/components/ui/card';
import Link from '@/components/icons/link';
import Plus from '@/components/icons/plus';
import Trash from '@/components/icons/trash';
import ExternalLink from '@/components/icons/external-link';
import Alert from '@/components/icons/alert';

interface ContextUrlManagerProps {
	urls: string[];
	onChange?: (urls: string[]) => void;
	maxLimit?: number;
	readOnly?: boolean;
}

export function ContextUrlManager({
	urls = [],
	onChange,
	maxLimit = 20,
	readOnly = false
}: ContextUrlManagerProps) {
	const [inputUrl, setInputUrl] = useState('');
	const [error, setError] = useState<string | null>(null);

	const handleAddUrl = (e?: React.FormEvent) => {
		if (e) e.preventDefault();
		if (readOnly) return;

		if (urls.length >= maxLimit) {
			setError(`Maximum limit of ${maxLimit} Context URLs reached.`);
			return;
		}

		const trimmed = inputUrl.trim();
		if (!trimmed) {
			setError('Please enter a valid URL.');
			return;
		}

		// Auto-prefix https:// if missing
		let formattedUrl = trimmed;
		if (!/^https?:\/\//i.test(formattedUrl)) {
			formattedUrl = `https://${formattedUrl}`;
		}

		// Basic URL validation
		try {
			new URL(formattedUrl);
		} catch {
			setError('Invalid URL format. Example: https://example.com/article');
			return;
		}

		if (urls.includes(formattedUrl)) {
			setError('This URL is already in your context list.');
			return;
		}

		const updated = [...urls, formattedUrl];
		onChange?.(updated);
		setInputUrl('');
		setError(null);
	};

	const handleDeleteUrl = (indexToDelete: number) => {
		if (readOnly) return;
		const updated = urls.filter((_, idx) => idx !== indexToDelete);
		onChange?.(updated);
		setError(null);
	};

	const isMaxReached = urls.length >= maxLimit;

	return (
		<Card className='border-violet-500/20 bg-violet-500/5'>
			<CardHeader className='pb-3'>
				<div className='flex items-center justify-between'>
					<CardTitle className='text-sm font-semibold flex items-center gap-2'>
						<Link className='h-4 w-4 text-violet-600' />
						Context URLs Management
					</CardTitle>
					<Badge
						variant='outline'
						className={`text-[10px] font-mono ${
							isMaxReached
								? 'bg-destructive/10 text-destructive border-destructive/30'
								: 'bg-violet-500/10 text-violet-700 border-violet-500/30'
						}`}
					>
						{urls.length} / {maxLimit} URLs
					</Badge>
				</div>
				<CardDescription className='text-xs'>
					Add reference research links for the{' '}
					<code className='font-mono text-violet-700 dark:text-violet-400 font-semibold'>
						{'{{context_url}}'}
					</code>{' '}
					variable (maximum 20 links).
				</CardDescription>
			</CardHeader>

			<CardContent className='space-y-3'>
				{/* Add Input Form */}
				{!readOnly && (
					<form onSubmit={handleAddUrl} className='space-y-1.5'>
						<div className='flex gap-2'>
							<Input
								value={inputUrl}
								onChange={(e) => {
									setInputUrl(e.target.value);
									if (error) setError(null);
								}}
								placeholder='https://example.com/research-paper'
								className='h-8 text-xs font-mono'
								disabled={isMaxReached}
							/>
							<Button
								type='submit'
								size='sm'
								className='h-8 text-xs gap-1 shrink-0 bg-violet-600 hover:bg-violet-700 text-white'
								disabled={isMaxReached || !inputUrl.trim()}
							>
								<Plus className='h-3.5 w-3.5' />
								Add URL
							</Button>
						</div>

						{error && (
							<p className='text-[11px] text-destructive flex items-center gap-1'>
								<Alert className='h-3 w-3 shrink-0' />
								{error}
							</p>
						)}
					</form>
				)}

				{/* URLs List */}
				{urls.length > 0 ? (
					<div className='space-y-1.5 max-h-[220px] overflow-y-auto pr-1'>
						{urls.map((url, index) => (
							<div
								key={`${url}-${index}`}
								className='flex items-center justify-between p-2 rounded-md border bg-background text-xs group'
							>
								<div className='flex items-center gap-2 min-w-0 pr-2'>
									<ExternalLink className='h-3.5 w-3.5 text-violet-500 shrink-0' />
									<a
										href={url}
										target='_blank'
										rel='noreferrer'
										className='font-mono text-violet-700 dark:text-violet-400 hover:underline truncate text-[11px]'
									>
										{url}
									</a>
								</div>

								{!readOnly && (
									<Button
										type='button'
										variant='ghost'
										size='sm'
										onClick={() => handleDeleteUrl(index)}
										className='h-6 w-6 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0 opacity-80 group-hover:opacity-100'
									>
										<Trash className='h-3.5 w-3.5' />
									</Button>
								)}
							</div>
						))}
					</div>
				) : (
					<div className='p-4 rounded-md border border-dashed text-center text-xs text-muted-foreground italic'>
						No context URLs added yet. Enter a URL above to include research links in{' '}
						<code className='font-mono text-violet-700'>{'{{context_url}}'}</code>.
					</div>
				)}
			</CardContent>
		</Card>
	);
}
