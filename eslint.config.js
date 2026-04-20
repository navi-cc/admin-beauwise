import globals from 'globals';
import pluginReact from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import { defineConfig } from 'eslint/config';

export default defineConfig([
	{
		files: ['**/*.{js,mjs,cjs,jsx}'],
		languageOptions: {
			globals: globals.browser,
			parserOptions: {
				ecmaFeatures: { jsx: true }
			}
		},
		plugins: {
			pluginReact,
			'react-hooks': reactHooks,
			'react-refresh': reactRefresh
		},
		settings: {
			react: { version: 'detect' }
		},

		rules: {
			...js.configs.recommended.rules,
			...pluginReact.configs.recommended.rules,
			...pluginReact.configs['jsx-runtime'].rules,
			...reactHooks.configs.recommended.rules,
			'react-refresh/only-export-components': 'warn'
		}
	}
]);
