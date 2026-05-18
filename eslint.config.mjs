import js from '@eslint/js';
import globals from 'globals';

export default [
	{
		files: ['**/*.js'],
		languageOptions: {
			ecmaVersion: 2026,
			sourceType: 'commonjs',
			globals: {
				...globals.browser,
				L: 'readonly',
				E: 'readonly',
				_: 'readonly',
				cbi_update_table: 'readonly',
				dom: 'readonly',
				form: 'readonly',
				fs: 'readonly',
				network: 'readonly',
				poll: 'readonly',
				request: 'readonly',
				rpc: 'readonly',
				uci: 'readonly',
				ui: 'readonly',
				view: 'readonly',
				widgets: 'readonly'
			}
		},
		rules: {
			...js.configs.recommended.rules
		}
	}
];
