import { create } from 'zustand';
type ConsumerGuideStoreState = {
	isUpdating: boolean;
	setIsUpdating: (val: boolean) => void;

	isAdding: boolean;
	setIsAdding: (val: boolean) => void;
};

export const useConsumerGuideStore = create<ConsumerGuideStoreState>()((set) => ({
	isUpdating: false,
	setIsUpdating: (val) => {
		set({ isUpdating: val });
	},

	isAdding: false,
	setIsAdding: (val) => {
		set({ isAdding: val });
	}
}));
