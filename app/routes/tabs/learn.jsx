import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FilePlusIcon } from '@phosphor-icons/react';

export default function learn(params) {
	return (
		<div className='flex flex-col gap-y-4'>
			<div className='flex flex-col'>
				<span className='text-3xl font-semibold'>Learn Module</span>
				<span className='text-sm'>
					Manage ingredients glossary, consumer awareness, and myths and facts
				</span>
			</div>

			<Tabs defaultValue='ingredients'>
				<TabsList variant='line'>
					<TabsTrigger value='ingredients'>Ingredients Glossary</TabsTrigger>
					<TabsTrigger value='awareness'>Consumer Awareness</TabsTrigger>
					<TabsTrigger value='myths'>Myths and Facts</TabsTrigger>
				</TabsList>

				<TabsContent value='ingredients'></TabsContent>
				<TabsContent value='awareness'>
					Learn about consumer awareness topics.
				</TabsContent>
				<TabsContent value='myths'>
					Explore myths and facts about various products.
				</TabsContent>
			</Tabs>
		</div>
	);
}

export function meta() {
	return [{ title: 'Learn Module' }];
}
