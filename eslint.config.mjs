import js from "@eslint/js";
import globals from "globals";
import recursica from "@recursica/eslint-plugin";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default tseslint.config(
  { ignores: ["dist", "public/mockServiceWorker.js"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: __dirname,
      },
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
      recursica,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      // @recursica/eslint-plugin's `configs.recommended` is eslintrc-format
      // (`plugins: ["recursica"]`), which flat config rejects — so the plugin
      // is registered above and its recommended rule set directly here instead.
      "recursica/no-over-styled": "error",
      // Suppress unused eslint-disable warnings
      "no-restricted-syntax": "off",
      "eslint-disable": "off",
      "eslint-disable-next-line": "off",
    },
  },
  {
    // Every prototype's index.tsx exports a `meta` object alongside its
    // default component (see src/routes/prototypes/index.ts) — that's an
    // intentional, repeated pattern, not a one-off fast-refresh violation.
    files: ["src/routes/prototypes/**/index.tsx"],
    rules: {
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true, allowExportNames: ["meta"] },
      ],
    },
  },
);
