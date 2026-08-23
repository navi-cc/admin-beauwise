import { Outlet, redirect, useNavigate } from 'react-router';
import { AppSidebar } from '@/components/app-sidebar';
import { auth, db } from '@/lib/firebase';
import { UploadToaster } from '@/components/upload-toaster';
import { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import {
	AlertDialog,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import BlockedIcon from '@/components/icons/blocked-icon';
import { useAuthStore } from '@/store/useAuthStore';
import ModifiedLayoutAlign from '@/components/icons/modified-layout-align';
import { useSidebar } from '@/components/ui/sidebar';

export function meta() {
	return [{ title: 'Admin BeauWise' }];
}

export async function clientLoader() {
	await auth.authStateReady();

	const user = await auth.currentUser?.getIdTokenResult();
	const isCurrentlySignedIn = auth.currentUser;
	const isAllowed = user?.claims.role === 'admin' || user?.claims.role === 'superadmin';

	if (!isCurrentlySignedIn || !isAllowed) {
		throw redirect('/sign-in');
	}
}
export default function AppLayout() {
	const { setOpen, open } = useSidebar();
	const navigate = useNavigate();
	const setSessionModalOpen = useAuthStore((state) => state.setSessionOpenModal);
	const sessionId = useAuthStore((state) => state.sessionId);
	useEffect(() => {
		let unsubAuth, unsubSnap: () => void;

		unsubAuth = onAuthStateChanged(auth, async () => {
			const user = await auth.currentUser?.getIdTokenResult();
			const isAllow = user?.claims.role === 'admin' || user?.claims.role === 'superadmin';
			if (!!auth.currentUser && isAllow) {
				unsubSnap = onSnapshot(
					doc(db, 'users', auth.currentUser?.uid),
					async (snapshot) => {
						const data = snapshot.data();

						if (
							data?.currentSessionId &&
							sessionId.length > 0 &&
							data.currentSessionId !== sessionId
						) {
							setSessionModalOpen(true);
							await signOut(auth);
							return navigate('/sign-in');
						}

						if (data?.tokensValidAfterTime) {
							const tokenResult = await auth.currentUser?.getIdTokenResult();

							const authTimeInSeconds = Math.floor(
								new Date(tokenResult?.authTime as string).getTime() / 1000
							);
							if (authTimeInSeconds < data.tokensValidAfterTime) {
								setSessionModalOpen(true);
								await signOut(auth);
								return navigate('/sign-in');
							}
						}
					}
				);
			}
		});

		return () => {
			unsubAuth();

			if (unsubSnap) {
				unsubSnap();
			}
		};
	}, []);
	return (
		<>
			<AppSidebar />

			<div
				style={{
					flex: 1,
					padding: '20px'
				}}
			>
				<Outlet />
			</div>

			<UploadToaster />
		</>
	);
}
