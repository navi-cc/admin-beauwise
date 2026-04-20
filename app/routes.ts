import { type RouteConfig, index, layout, route } from '@react-router/dev/routes';

export default [
	layout('routes/app-layout.jsx', [
		index('routes/tabs/learn.jsx'),
		route('user-management', 'routes/tabs/user-management.jsx')
	])
] satisfies RouteConfig;
