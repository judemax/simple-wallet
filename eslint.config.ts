import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import {defineConfig} from "eslint/config";
import newlineAfterIfCondition from "eslint-plugin-newline-after-if-condition";
import stylistic from "@stylistic/eslint-plugin";

export default defineConfig([
    {files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx}"], plugins: {js}, extends: ["js/recommended"], languageOptions: {globals: {...globals.browser, ...globals.node}}},
    tseslint.configs.recommended,
    {
        files: ["**/*.{ts,tsx}", "*.{ts,tsx}"],
        plugins: {
            js,
            "newline-after-if-condition": newlineAfterIfCondition,
            "@typescript-eslint": tseslint.plugin,
            "@stylistic": stylistic,
        },
        extends: ["js/recommended"],
        languageOptions: {
            globals: {...globals.browser, ...globals.node},
            parser: tseslint.parser,
            parserOptions: {
                projectService: true,
            },
        },
        rules: {
            "@typescript-eslint/await-thenable": "error",
            "brace-style": "error",
            "comma-spacing": "warn",
            "comma-dangle": ["error", "always-multiline"],
            "@stylistic/comma-dangle": ["error", "always-multiline"],
            "curly": "error",
            "eol-last": "error",
            "eqeqeq": "error",
            "@typescript-eslint/explicit-member-accessibility": ["error", {
                "accessibility": "no-public",
            }],
            "indent": "off",
            "@stylistic/indent": ["error", 4, {
                "SwitchCase": 1,
            }],
            "keyword-spacing": ["error", {
                "before": true,
                "after": true,
            }],
            "@stylistic/keyword-spacing": ["error", {
                "before": true,
                "after": true,
            }],
            "max-len": [
                "error",
                {
                    "code": 120,
                    "tabWidth": 4,
                    "comments": 120,
                    "ignoreComments": true,
                    "ignoreTrailingComments": true,
                    "ignoreUrls": true,
                    "ignoreStrings": true,
                    "ignoreTemplateLiterals": true,
                    "ignoreRegExpLiterals": true,
                    "ignorePattern": "eslint-disable-next-line",
                },
            ],
            "@stylistic/member-delimiter-style": "error",
            "newline-after-if-condition/rule": ["error"],
            "@typescript-eslint/no-floating-promises": "error",
            "no-multiple-empty-lines": "error",
            "no-tabs": "error",
            "no-trailing-spaces": "error",
            "no-template-curly-in-string": "error",
            "no-var": "error",
            "no-floating-decimal": "warn",
            "no-mixed-spaces-and-tabs": "error",
            "no-return-await": "error",
            "@typescript-eslint/no-unused-vars": ["error", {
                "argsIgnorePattern": "^_",
                "varsIgnorePattern": "^_",
                "caughtErrorsIgnorePattern": "^_",
            }],
            "@typescript-eslint/parameter-properties": "off",
            "@typescript-eslint/prefer-readonly": "error",
            "quotes": ["error", "double"],
            "@stylistic/quotes": ["error", "double"],
            "require-await": "warn",
            "@typescript-eslint/require-await": "warn",
            "@typescript-eslint/return-await": "error",
            "semi": ["error", "always"],
            "@stylistic/semi": ["error", "always"],
            "space-infix-ops": "error",
            "@stylistic/space-infix-ops": "error",
            "space-before-function-paren": [
                "error",
                {
                    "named": "never",
                    "anonymous": "never",
                    "asyncArrow": "always",
                },
            ],
            "space-before-blocks": ["error", "always"],
            "@stylistic/space-before-blocks": ["error", "always"],
            "spaced-comment": "error",
            "template-curly-spacing": "error",
            "@typescript-eslint/typedef": ["error", {
                "arrayDestructuring": true,
                "memberVariableDeclaration": true,
                "objectDestructuring": true,
                "parameter": true,
                "propertyDeclaration": true,
                "variableDeclaration": true,
                "variableDeclarationIgnoreFunction": true,
            }],
            "@stylistic/type-annotation-spacing": "error",
            "space-in-parens": "error",
            "no-multi-spaces": "error",
            "no-unused-vars": "off",
            "array-bracket-spacing": "error",
            "object-curly-spacing": ["error", "never"],
            "key-spacing": "error",
            "arrow-spacing": "error",
            "semi-spacing": "error",
        },
    },
    {ignores: [
        "package-lock.json",
        "dist",
    ]},
]);
