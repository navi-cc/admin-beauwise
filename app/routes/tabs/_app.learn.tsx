import ConsumerGuideContent from '@/components/consumer-guides/consumer-guide-content';
import IngredientsContent from '@/components/ingredients-management/ingredient-contents';
import { IngredientTable } from '@/components/ingredients-management/ingredients-list';
import { MythFactContent } from '@/components/myth-facts/myth-fact-content';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FilePlusIcon } from '@phosphor-icons/react';

export default function learn() {
	return (
		<div className='flex flex-col gap-y-4'>
			<Tabs defaultValue='consumer-guide'>
				<TabsList>
					<TabsTrigger value='ingredients'>Ingredients Collections</TabsTrigger>
					<TabsTrigger value='consumer-guide'>Consumer Guide Collections</TabsTrigger>
					<TabsTrigger value='myths'>Myths and Facts Collections</TabsTrigger>
				</TabsList>

				<TabsContent value='ingredients'>
					<IngredientsContent />
				</TabsContent>
				<TabsContent value='consumer-guide'>
					<ConsumerGuideContent />
				</TabsContent>
				<TabsContent value='myths'>
					<MythFactContent />
				</TabsContent>
			</Tabs>
		</div>
	);
}

export function meta() {
	return [{ title: 'BeauWise | Learning Module Management' }];
}
