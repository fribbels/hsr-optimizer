import eslint from '@eslint/js'
import stylistic from '@stylistic/eslint-plugin'
import reactHook from 'eslint-plugin-react-hooks'
import reactRecommended from 'eslint-plugin-react/configs/recommended.js'
import globals from 'globals'
import tseslint from 'typescript-eslint'

// config is a helper from typescript-eslint to provide type information for
// eslint file, similar to vite defineConfig. Fun fact: This file is also linted
const config = tseslint.config(
  // These 2 configs are Typescript-specific typing configs. They are reasonably
  // useful to enforce typing consistency. The codebase has a very relaxed rule
  // on typing, especially with js files, so it will flag **a lot** of linting
  // errors, so best apply only to Typescript-specific files for now. Try
  // commenting out these 2 files declaration and open any Javascript file. Also
  // even if it's only Typescript, run lint on a Typescript file and you will
  // still see a fair amount of linting errors, simply because those files are
  // Typescript files written without sufficient type information. Turn it off
  // altogether by commenting it out if you don't like it.
  {
    files: ['{src,tests-webgpu}/**/*.{ts,tsx}'],
    extends: [
      ...tseslint.configs.recommendedTypeCheckedOnly,
      ...tseslint.configs.stylisticTypeCheckedOnly,

    ],
  },
  {
    // Every files should apply recommended ESLint and Typescript/ESLint
    // settings, this is similar to extends
    // plugin:@typescript-eslint/recommended, eslint:recommended and applying
    // plugin @stylistic
    extends: [eslint.configs.recommended, ...tseslint.configs.recommended],
    files: ['{src,tests-webgpu}/**/*.{js,ts,jsx,tsx}'],
    languageOptions: {
      parserOptions: {
        project: true,
      },
      globals: {
        ...globals.browser,
      },
    },
    rules: {
      // As we're migrating to TS these make the process easier
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/prefer-optional-chain': 'off',
    },
  },
  {
    // These files are React specific. Applying this is similar to extends
    // 'plugin:react/recommended' and apply plugin 'react'
    ...reactRecommended,
    files: ['{src,tests-webgpu}/**/*.{jsx,tsx}'],
  },
  {
    // Also apply plugin 'react-hooks'
    files: ['{src,tests-webgpu}/**/*.{jsx,tsx}'],
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      'react-hooks': reactHook,
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      ...reactHook.configs.recommended.rules,
      'import/no-webpack-loader-syntax': 'off',
      'react/no-unescaped-entities': 'off',
      'react/react-in-jsx-scope': 'off',
      'react-hooks/rules-of-hooks': 'warn',
      'react-hooks/exhaustive-deps': 'warn',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/no-misused-promises': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
    },
  },
  {
    // These are project-specific stylistic rules
    plugins: {
      '@stylistic': stylistic,
    },
    rules: styleRules('warn'),
  },
)

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
 */
function styleRules(level) {
  return {
    '@stylistic/array-bracket-spacing': [level, 'never'],
    '@stylistic/arrow-parens': [level, 'always', { requireForBlockBody: true }],
    '@stylistic/arrow-spacing': [level, { after: true, before: true }],
    '@stylistic/block-spacing': [level, 'always'],
    '@stylistic/brace-style': [level, '1tbs', { allowSingleLine: true }],
    '@stylistic/comma-dangle': [level, 'always-multiline'],
    '@stylistic/comma-spacing': [level, { after: true, before: false }],
    '@stylistic/comma-style': [level, 'last'],
    '@stylistic/computed-property-spacing': [
      level,
      'never',
      { enforceForClassMembers: true },
    ],
    '@stylistic/dot-location': [level, 'property'],
    '@stylistic/eol-last': level,
    '@stylistic/indent': [level, 2, { ignoreComments: false, SwitchCase: 1 }],
    '@stylistic/indent-binary-ops': [level, 2],
    '@stylistic/key-spacing': [level, { afterColon: true, beforeColon: false }],
    '@stylistic/keyword-spacing': [level, { after: true, before: true }],
    '@stylistic/lines-between-class-members': [
      level,
      'always',
      { exceptAfterSingleLine: true },
    ],
    '@stylistic/max-statements-per-line': [level, { max: 1 }],
    '@stylistic/member-delimiter-style': [
      level,
      {
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
      },
    ],
    '@stylistic/multiline-ternary': [level, 'always-multiline'],
    '@stylistic/new-parens': level,
    '@stylistic/no-extra-parens': [level, 'functions'],
    '@stylistic/no-floating-decimal': level,
    '@stylistic/no-mixed-spaces-and-tabs': level,
    '@stylistic/no-multi-spaces': level,
    '@stylistic/no-multiple-empty-lines': [
      'off',
      { max: 1, maxBOF: 0, maxEOF: 0 },
    ],
    '@stylistic/no-tabs': level,
    '@stylistic/no-trailing-spaces': 'off',
    '@stylistic/no-whitespace-before-property': level,
    '@stylistic/object-curly-newline': [
      level,
      { multiline: true, consistent: true },
    ],
    '@stylistic/object-curly-spacing': [level, 'always'],
    '@stylistic/object-property-newline': [
      level,
      { allowAllPropertiesOnSameLine: true },
    ],
    '@stylistic/operator-linebreak': [level, 'before'],
    '@stylistic/padded-blocks': [level, 'never'],
    '@stylistic/quote-props': [level, 'consistent-as-needed'],
    '@stylistic/quotes': [
      level,
      'single',
      {
        allowTemplateLiterals: true,
        avoidEscape: true,
      },
    ],
    '@stylistic/rest-spread-spacing': [level, 'never'],
    '@stylistic/semi': [level, 'never'],
    '@stylistic/semi-spacing': [level, { after: true, before: false }],
    '@stylistic/space-before-blocks': [level, 'always'],
    '@stylistic/space-before-function-paren': [
      level,
      {
        anonymous: 'always',
        asyncArrow: 'always',
        named: 'never',
      },
    ],
    '@stylistic/space-in-parens': [level, 'never'],
    '@stylistic/space-infix-ops': level,
    '@stylistic/space-unary-ops': [
      level,
      {
        nonwords: false,
        words: true,
      },
    ],
    '@stylistic/spaced-comment': [
      level,
      'always',
      {
        block: {
          balanced: true,
          exceptions: ['*'],
          markers: ['!'],
        },
        line: {
          exceptions: ['/', '#'],
          markers: ['/'],
        },
      },
    ],
    '@stylistic/template-curly-spacing': level,
    '@stylistic/template-tag-spacing': [level, 'never'],
    '@stylistic/type-annotation-spacing': [level, {}],
    '@stylistic/type-generic-spacing': level,
    '@stylistic/type-named-tuple-spacing': level,
    '@stylistic/yield-star-spacing': [level, 'both'],
    '@stylistic/jsx-closing-bracket-location': level,
    '@stylistic/jsx-closing-tag-location': level,
    '@stylistic/jsx-curly-brace-presence': [
      level,
      { propElementValues: 'always' },
    ],
    '@stylistic/jsx-curly-newline': level,
    '@stylistic/jsx-curly-spacing': [level, 'never'],
    '@stylistic/jsx-equals-spacing': level,
    '@stylistic/jsx-first-prop-new-line': level,
    '@stylistic/jsx-indent': [
      level,
      2,
      {
        checkAttributes: true,
        indentLogicalExpressions: true,
      },
    ],
    '@stylistic/jsx-indent-props': [level, 2],
    '@stylistic/jsx-max-props-per-line': [
      level,
      {
        maximum: 3,
        when: 'multiline',
      },
    ],
    '@stylistic/jsx-quotes': [level, 'prefer-single'],
    '@stylistic/jsx-tag-spacing': [
      level,
      {
        afterOpening: 'never',
        beforeClosing: 'never',
        beforeSelfClosing: 'never',
        closingSlash: 'never',
      },
    ],
    '@stylistic/jsx-wrap-multilines': [
      level,
      {
        arrow: 'parens-new-line',
        assignment: 'parens-new-line',
        condition: 'parens-new-line',
        declaration: 'parens-new-line',
        logical: 'parens-new-line',
        prop: 'parens-new-line',
        return: 'parens-new-line',
      },
    ],
  }
}

export default config
