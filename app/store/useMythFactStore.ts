import { create } from 'zustand';
type MythFactStoreState = {
	isUpdating: boolean;
	setIsUpdating: (val: boolean) => void;

	isAdding: boolean;
	setIsAdding: (val: boolean) => void;
};

export const useMythFactStore = create<MythFactStoreState>()((set) => ({
	isUpdating: false,
	setIsUpdating: (val) => {
		set({ isUpdating: val });
	},

	isAdding: false,
	setIsAdding: (val) => {
		set({ isAdding: val });
	}
}));
