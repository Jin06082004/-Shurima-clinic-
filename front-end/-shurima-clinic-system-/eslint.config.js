import js from '@eslint/js'

export default [
  js.configs.recommended,
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: { jsx: true }
      },
      globals: {
        console: 'readonly',
        process: 'readonly',
        setTimeout: 'readonly',
        document: 'readonly',
        __dirname: 'readonly',
        window: 'readonly',
        location: 'readonly',
      }
    },
    rules: {
      'no-unused-vars': 'off',
      'react/prop-types': 'off',
    }
  },
  {
    ignores: ['node_modules', 'dist', '.vite', 'coverage']
  }
]
