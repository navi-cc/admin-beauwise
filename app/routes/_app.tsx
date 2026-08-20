import { Outlet, redirect } from 'react-router';
import { AppSidebar } from '@/components/app-sidebar';
import { auth } from '@/lib/firebase';
import { UploadToaster } from '@/components/upload-toaster';

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
