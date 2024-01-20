module.exports = {
  "root": true,
  "extends": [
    "eslint:recommended",
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  plugins: ['@typescript-eslint'],

  "rules": {
    // Override our default settings just for this directory
    "import/no-webpack-loader-syntax": "off",
    "react/no-unescaped-entities": "off",
    // enable typescript types
    // '@typescript-eslint/consistent-type-imports': 'error',
  },
  "env": {
    "browser": true,
    "node": true,
    "es6": true,
  },
  "parserOptions": {
    "ecmaFeatures": {
      jsx: true
    },
    "sourceType": "module",
    "ecmaVersion": 'latest',
  }
};

