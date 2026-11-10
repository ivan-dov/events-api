import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
    { ignores: ['dist/', 'node_modules/'] },
    js.configs.recommended,
    ...tseslint.configs.recommended,
    {
        // plain CommonJS config files (knexfile, this file)
        files: ['**/*.js'],
        languageOptions: {
            sourceType: 'commonjs',
            globals: {
                require: 'readonly',
                module: 'writable',
                process: 'readonly',
                __dirname: 'readonly',
            },
        },
        rules: { '@typescript-eslint/no-require-imports': 'off' },
    },
);
