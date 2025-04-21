import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import react from "eslint-plugin-react";
import tseslint from "typescript-eslint";
import stylistic from "@stylistic/eslint-plugin";

export default tseslint.config(
  { ignores: ["dist"] },
  {
    extends: [
      js.configs.recommended,
      react.configs.flat.recommended,
      ...tseslint.configs.recommended,
    ],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
      react: react,
      "@stylistic": stylistic,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      "react/jsx-newline": ["error", { prevent: true, allowMultilines: true }],
      "react/react-in-jsx-scope": 0,
      "react/jsx-uses-react": 0,
      "react/jsx-boolean-value": ["error"],
      "react/self-closing-comp": ["error"],
      "react/jsx-no-useless-fragment": ["error", { allowExpressions: true }],
      "@stylistic/padding-line-between-statements": [
        "error",
        {
          blankLine: "always",
          prev: [
            "multiline-block-like",
            "multiline-expression",
            "multiline-const",
          ],
          next: "*",
        },
      ],
    },
  }
);
