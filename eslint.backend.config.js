import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';
import globals from 'globals';

// This starter assumes a Node-based backend repo.
const BACKEND_FILES = ['**/*.{js,cjs,mjs,ts,cts,mts}'];

export default tseslint.config(
  { ignores: ['dist', 'build', 'coverage', 'node_modules'] },
  js.configs.recommended,
  tseslint.configs.recommended,
  {
    files: BACKEND_FILES,
    languageOptions: {
      globals: globals.node,
    },
    rules: {
      'no-console': 'off',
    },
  },
  prettier,
);
