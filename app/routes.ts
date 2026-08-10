import { type RouteConfig, index, layout, prefix, route } from '@react-router/dev/routes';

export default [
	layout('routes/_app.tsx', [
		index('routes/tabs/_app.user-management.tsx'),
		route('api-integrations', 'routes/tabs/_app.api-integrations.tsx'),
		route('ingredients-glossary', 'routes/tabs/_app.ingredients-glossary.tsx'),
		route('myths-facts-directory', 'routes/tabs/_app.myths-facts-directory.tsx'),
		route(
			'consumer-guides-collections',
			'routes/tabs/_app.consumer-guides-collection.tsx'
		),

		...prefix('llm-ops', [
			index('routes/tabs/llm-ops/_app.prompt-list-page.tsx'),
			route('create', 'routes/tabs/llm-ops/_app.prompt-create-page.tsx'),
			route('edit/:id', 'routes/tabs/llm-ops/_app.prompt-edit-page.tsx'),
			route('detail/:id', 'routes/tabs/llm-ops/_app.prompt-detail-page.tsx')
		])
	]),
	route('sign-in', 'routes/auth/sign-in.tsx'),
	route('*', 'routes/$.tsx')
] satisfies RouteConfig;
