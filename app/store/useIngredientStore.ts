import { create } from 'zustand';
type IngredientStoreState = {
	isUpdating: boolean;
	setIsUpdating: (val: boolean) => void;

	isAdding: boolean;
	setIsAdding: (val: boolean) => void;
};

export const useIngredientStore = create<IngredientStoreState>()((set) => ({
	isUpdating: false,
	setIsUpdating: (val) => {
		set({ isUpdating: val });
	},

	isAdding: false,
	setIsAdding: (val) => {
		set({ isAdding: val });
	}
}));
