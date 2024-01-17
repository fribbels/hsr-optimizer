module.exports = {
    "root": true,
    "extends": [
        "eslint:recommended",
        'plugin:react/recommended'
    ],
    "rules": {
        // Override our default settings just for this directory
        "import/no-webpack-loader-syntax": "off",
        "react/no-unescaped-entities": "off"
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

