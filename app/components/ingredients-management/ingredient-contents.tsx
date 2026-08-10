import { IngredientTable } from '@/components/ingredients-management/ingredients-list';
import { ConfigCards } from '@/components/ingredients-management/ingredient-configs';

export default function IngredientsContent() {
	return (
		<div className='flex flex-col gap-y-8'>
			<IngredientTable />
			<ConfigCards />
		</div>
	);
}
