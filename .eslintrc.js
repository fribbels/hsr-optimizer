// eslint-disable-next-line @typescript-eslint/no-var-requires
const styleRules = require('./.eslintrc.style.js')

module.exports = {
  "root": true,
  "extends": [
    "eslint:recommended",
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@stylistic/disable-legacy',
  ],
  plugins: [
    "react",
    "react-hooks",
    '@typescript-eslint',
    '@stylistic',
  ],
  "rules": {
    ...styleRules('off'),
    // Override our default settings just for this directory
    "import/no-webpack-loader-syntax": "off",
    "react/no-unescaped-entities": "off",
    'react/react-in-jsx-scope': 'off',
    "react-hooks/rules-of-hooks": 'warn',
    "react-hooks/exhaustive-deps": 'warn',
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

