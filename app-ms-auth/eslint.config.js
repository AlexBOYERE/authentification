module.exports = {
    languageOptions: {
        globals: {
            process: 'readonly',
            module: 'readonly',
            require: 'readonly',
        },
        parserOptions: {
            ecmaVersion: 2021,
            sourceType: 'module',
        },
    },
    rules: {
        'no-unused-vars': ['warn', { args: 'none' }],
        'no-undef': 'off',
    },
};
