import { create } from 'zustand';

type AuthStoreState = {
	isSuperAdmin: boolean;
	setIsSuperAdmin: (val: boolean) => void;
};

export const useAuthStore = create<AuthStoreState>((set, get) => ({
	isSuperAdmin: false,
	setIsSuperAdmin: (val) => {
		set({ isSuperAdmin: val });
	}
}));
