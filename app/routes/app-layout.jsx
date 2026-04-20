import { Outlet } from 'react-router';
import AppSideBar from '@/components/AppSideBar';

export function meta() {
	return [
		{ title: 'Admin BeauWise' },
		{ name: 'description', content: 'Welcome to React Router!' }
	];
}

export default function AppLayout() {
	return (
		<>
			<AppSideBar />

			<div
				style={{
					flex: 1,
					padding: '20px'
				}}
			>
				<Outlet />
			</div>
		</>
	);
}
