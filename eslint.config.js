import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import firebaseRules from '@firebase/eslint-plugin-security-rules';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist'] },
  firebaseRules.configs['flat/recommended'],
  {
    files: ['**/*.rules'],
    rules: {
      // Intentional public read access for shared workflow blueprints, community reviews, and aggregate upvote tallies
      '@firebase/security-rules/no-open-reads': 'off',
    },
  },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  {
    files: ['server.ts', 'server/**/*.ts', 'scripts/**/*.ts', 'tests/**/*.ts'],
    languageOptions: {
      globals: globals.node,
    },
  }
);
