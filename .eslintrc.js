module.exports = {
    "root": true,
    "rules": {
        // Override our default settings just for this directory
        "import/no-webpack-loader-syntax": "off"
    },
    "parserOptions": {
        "ecmaFeatures": {
            jsx: true
        },
        "sourceType": "module",
        "ecmaVersion": 'latest',
    }
};

