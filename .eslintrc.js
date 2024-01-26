module.exports = {
  "root": true,
  "extends": [
    "eslint:recommended",
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  plugins: ["react", "react-hooks", '@typescript-eslint'],

  "rules": {
    // Override our default settings just for this directory
    "import/no-webpack-loader-syntax": "off",
    "react/no-unescaped-entities": "off",
    "react-hooks/rules-of-hooks": 1,
    "react-hooks/exhaustive-deps": 1, // 0 = off, 1 = warn, 2 = error
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

