import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
type AuthStoreState = {
	isSuperAdmin: boolean;
	setIsSuperAdmin: (val: boolean) => void;

	sessionOpenModal: boolean;
	setSessionOpenModal: (val: boolean) => void;

	sessionId: string;
	setSessionId: (val: string) => void;
};

export const useAuthStore = create<AuthStoreState>()(
	persist(
		(set) => ({
			isSuperAdmin: false,
			setIsSuperAdmin: (val) => {
				set({ isSuperAdmin: val });
			},

			sessionOpenModal: false,
			setSessionOpenModal: (val) => set({ sessionOpenModal: val }),

			sessionId: '',
			setSessionId: (val) => set({ sessionId: val })
		}),
		{
			name: 'auth-store',
			storage: createJSONStorage(() => localStorage)
		}
	)
);
