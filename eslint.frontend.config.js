import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import prettier from 'eslint-config-prettier';
import globals from 'globals';

// Update these globs if your frontend repo uses a different layout.
const FRONTEND_APP_FILES = [
  'src/**/*.{js,jsx,ts,tsx}',
  'app/**/*.{js,jsx,ts,tsx}',
  'client/**/*.{js,jsx,ts,tsx}',
];

const REACT_FILES = ['**/*.{jsx,tsx}'];

const NODE_FILES = [
  '*.config.{js,cjs,mjs,ts,cts,mts}',
  '**/*.config.{js,cjs,mjs,ts,cts,mts}',
  'scripts/**/*.{js,cjs,mjs,ts,cts,mts}',
];

const reactHooksRules =
  reactHooks.configs['recommended-latest']?.rules ??
  reactHooks.configs.recommended.rules;

export default tseslint.config(
  { ignores: ['dist', 'build', 'coverage', 'node_modules'] },
  js.configs.recommended,
  tseslint.configs.recommended,
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    rules: {
      'no-console': 'warn',
    },
  },
  {
    files: FRONTEND_APP_FILES,
    languageOptions: {
      globals: globals.browser,
    },
  },
  {
    files: REACT_FILES,
    plugins: {
      react,
      'react-hooks': reactHooks,
    },
    settings: {
      react: { version: 'detect' },
    },
    rules: {
      ...react.configs.flat.recommended.rules,
      ...react.configs.flat['jsx-runtime'].rules,
      ...reactHooksRules,
      'react/prop-types': 'off',
    },
  },
  {
    files: NODE_FILES,
    languageOptions: {
      globals: globals.node,
    },
    rules: {
      'no-console': 'off',
    },
  },
  prettier,
);
