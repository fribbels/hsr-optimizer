module.exports = {
  root: true,
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@stylistic/disable-legacy',
  ],
  plugins: [
    'react',
    'react-hooks',
    '@typescript-eslint',
    '@stylistic',
  ],
  rules: {
    ...styleRules('warn'),
    // Override our default settings just for this directory
    'import/no-webpack-loader-syntax': 'off',
    'react/no-unescaped-entities': 'off',
    'react/react-in-jsx-scope': 'off',
    'react-hooks/rules-of-hooks': 'warn',
    'react-hooks/exhaustive-deps': 'warn',
    'react/prop-types': 'off',
  },
  env: {
    browser: true,
    node: true,
    es6: true,
  },
  parserOptions: {
    ecmaFeatures: { jsx: true },
    sourceType: 'module',
    ecmaVersion: 'latest',
  },
}

/**
 * @typedef {import('@stylistic/eslint-plugin').RuleOptions} RuleOptions
 * @typedef {import('eslint/rules').ESLintRules} ESLintRules
 * @typedef {import('eslint').Linter.RuleLevel} RuleLevel
 * @typedef {Partial<{
 *   [K in keyof RuleOptions]: (RuleLevel | [RuleLevel, ...RuleOptions[K]])
 * }>} StylisticRules
 */

/**
 * @param {RuleLevel} level
 * @return {StylisticRules | ESLintRules}
 *
 */
function styleRules(level) {
  return ({
    '@stylistic/array-bracket-spacing': [level, 'never'],
    '@stylistic/arrow-parens': [level, 'always', { requireForBlockBody: true }],
    '@stylistic/arrow-spacing': [level, { after: true, before: true }],
    '@stylistic/block-spacing': [level, 'always'],
    '@stylistic/brace-style': [level, '1tbs', { allowSingleLine: true }],
    '@stylistic/comma-dangle': [level, 'always-multiline'],
    '@stylistic/comma-spacing': [level, { after: true, before: false }],
    '@stylistic/comma-style': [level, 'last'],
    '@stylistic/computed-property-spacing': [level, 'never', { enforceForClassMembers: true }],
    '@stylistic/dot-location': [level, 'property'],
    '@stylistic/eol-last': level,
    '@stylistic/indent': [level, 2, { ignoreComments: false, SwitchCase: 1 }],
    '@stylistic/indent-binary-ops': [level, 2],
    '@stylistic/key-spacing': [level, { afterColon: true, beforeColon: false }],
    '@stylistic/keyword-spacing': [level, { after: true, before: true }],
    '@stylistic/lines-between-class-members': [level, 'always', { exceptAfterSingleLine: true }],
    '@stylistic/max-statements-per-line': [level, { max: 1 }],
    '@stylistic/member-delimiter-style': [level, {
      multiline: { delimiter: 'none', requireLast: false },
      multilineDetection: 'brackets',
      overrides: {
        interface: {
          multiline: {
            delimiter: 'none',
            requireLast: false,
          },
        },
      },
      singleline: { delimiter: 'semi' },
    }],
    '@stylistic/multiline-ternary': [level, 'always-multiline'],
    '@stylistic/new-parens': level,
    '@stylistic/no-extra-parens': [level, 'functions'],
    '@stylistic/no-floating-decimal': level,
    '@stylistic/no-mixed-spaces-and-tabs': level,
    '@stylistic/no-multi-spaces': level,
    '@stylistic/no-multiple-empty-lines': [level, { max: 1, maxBOF: 0, maxEOF: 0 }],
    '@stylistic/no-tabs': level,
    '@stylistic/no-trailing-spaces': level,
    '@stylistic/no-whitespace-before-property': level,
    '@stylistic/object-curly-newline': [level, { multiline: true, consistent: true }],
    '@stylistic/object-curly-spacing': [level, 'always'],
    '@stylistic/object-property-newline': [level, { allowAllPropertiesOnSameLine: true }],
    '@stylistic/operator-linebreak': [level, 'before'],
    '@stylistic/padded-blocks': [level, 'never'],
    '@stylistic/quote-props': [level, 'consistent-as-needed'],
    '@stylistic/quotes': [level, 'single', {
      allowTemplateLiterals: true,
      avoidEscape: true,
    }],
    '@stylistic/rest-spread-spacing': [level, 'never'],
    '@stylistic/semi': [level, 'never'],
    '@stylistic/semi-spacing': [level, { after: true, before: false }],
    '@stylistic/space-before-blocks': [level, 'always'],
    '@stylistic/space-before-function-paren': [level, {
      anonymous: 'never',
      asyncArrow: 'always',
      named: 'never',
    }],
    '@stylistic/space-in-parens': [level, 'never'],
    '@stylistic/space-infix-ops': level,
    '@stylistic/space-unary-ops': [level, {
      nonwords: false,
      words: true,
    }],
    '@stylistic/spaced-comment': [level, 'always', {
      block: {
        balanced: true,
        exceptions: ['*'],
        markers: ['!'],
      },
      line: {
        exceptions: ['/', '#'],
        markers: ['/'],
      },
    }],
    '@stylistic/template-curly-spacing': level,
    '@stylistic/template-tag-spacing': [level, 'never'],
    '@stylistic/type-annotation-spacing': [level, {}],
    '@stylistic/type-generic-spacing': level,
    '@stylistic/type-named-tuple-spacing': level,
    '@stylistic/yield-star-spacing': [level, 'both'],
    '@stylistic/jsx-closing-bracket-location': level,
    '@stylistic/jsx-closing-tag-location': level,
    '@stylistic/jsx-curly-brace-presence': [level, { propElementValues: 'always' }],
    '@stylistic/jsx-curly-newline': level,
    '@stylistic/jsx-curly-spacing': [level, 'never'],
    '@stylistic/jsx-equals-spacing': level,
    '@stylistic/jsx-first-prop-new-line': level,
    '@stylistic/jsx-indent': [level, 2, {
      checkAttributes: true,
      indentLogicalExpressions: true,
    }],
    '@stylistic/jsx-indent-props': [level, 2],
    '@stylistic/jsx-max-props-per-line': [level, {
      maximum: 3,
      when: 'multiline',
    }],
    '@stylistic/jsx-quotes': level,
    '@stylistic/jsx-tag-spacing': [level, {
      afterOpening: 'never',
      beforeClosing: 'never',
      beforeSelfClosing: 'always',
      closingSlash: 'never',
    }],
    '@stylistic/jsx-wrap-multilines': [level, {
      arrow: 'parens-new-line',
      assignment: 'parens-new-line',
      condition: 'parens-new-line',
      declaration: 'parens-new-line',
      logical: 'parens-new-line',
      prop: 'parens-new-line',
      return: 'parens-new-line',
    }],
    "no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
    "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
  })
}
