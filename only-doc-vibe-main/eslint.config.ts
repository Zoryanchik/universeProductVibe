import globals from "globals";
import eslintTS from "typescript-eslint";
import type { ConfigWithExtends } from "typescript-eslint";
import eslintJS from "@eslint/js";
import eslintPluginPrettier from "eslint-plugin-prettier/recommended";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import unusedImports from "eslint-plugin-unused-imports";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import importPlugin from "eslint-plugin-import";
import eslintPluginAstro from "eslint-plugin-astro";
import astroEslintParser from "astro-eslint-parser";
import nextFsd from "eslint-plugin-next-fsd";

const rules: ConfigWithExtends["rules"] = {
  ...reactHooks.configs.recommended.rules,
  "@typescript-eslint/no-explicit-any": ["error"],
  "@typescript-eslint/no-unused-vars": [
    "error",
    { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
  ],
  "no-useless-computed-key": "off",
  "react-hooks/rules-of-hooks": "warn",
  "react-hooks/exhaustive-deps": "warn",
  "react-refresh/only-export-components": "off",
  "@typescript-eslint/no-useless-constructor": "warn",
  "@typescript-eslint/no-empty-function": "warn",
  "no-nested-ternary": "error",
  "max-depth": ["warn", { max: 4 }],
  "max-nested-callbacks": ["warn", { max: 4 }],
  "no-unneeded-ternary": "warn",
  "prefer-const": "warn",
  "unused-imports/no-unused-imports": "error",
  "simple-import-sort/exports": "error",
  "@typescript-eslint/naming-convention": [
    "error",
    {
      selector: ["enum", "typeAlias", "typeParameter"],
      format: ["PascalCase"],
    },
  ],
  "@typescript-eslint/consistent-type-imports": ["error"],
  "import/order": [
    "error",
    {
      groups: [
        "builtin",
        "external",
        "internal",
        ["sibling", "parent"],
        "index",
      ],
      pathGroups: [
        {
          pattern: "@/shared/**",
          group: "internal",
          position: "before",
        },
        {
          pattern: "@/entities/**",
          group: "internal",
          position: "after",
        },
        {
          pattern: "@/features/**",
          group: "internal",
          position: "after",
        },
        {
          pattern: "@/widgets/**",
          group: "internal",
          position: "after",
        },
        {
          pattern: "@/pages-layer/**",
          group: "internal",
          position: "after",
        },
      ],
      pathGroupsExcludedImportTypes: ["builtin", "external"],
      "newlines-between": "always",
    },
  ],
  "padding-line-between-statements": [
    "error",
    {
      blankLine: "always",
      prev: "if",
      next: "*",
    },
    {
      blankLine: "always",
      prev: "*",
      next: "return",
    },
  ],
  //   next fsd plugin rules (this plugin is our custom plugin so we can change it if needed by request)
  "next-fsd/path-checker": [
    "error",
    {
      alias: "@",
    },
  ],
  "next-fsd/layer-imports": [
    "error",
    {
      alias: "@",
      ignoreImportPatterns: ["**/@x/**", "**/*.css", "@/app/layout/**"],
      ignoreFilesPatterns: [
        "**/middleware.ts",
        "**/src/shared/config/**/*.(ts|tsx)",
        "**/src/shared/api/**/*.(ts|tsx)",
        "**/src/shared/lib/modals/modals-store.ts",
      ],
    },
  ],
  "next-fsd/public-api-imports": [
    "error",
    {
      alias: "@",
      ignorePatterns: [
        "**/src/shared/config/*.(ts|tsx)",
        "**/src/shared/api/*.(ts|tsx)",
        "**/middleware.ts",
      ],
    },
  ],
};

const plugins: ConfigWithExtends["plugins"] = {
  "react-hooks": reactHooks,
  "react-refresh": reactRefresh,
  "unused-imports": unusedImports,
  "simple-import-sort": simpleImportSort,
  "next-fsd": nextFsd,
};

module.exports = eslintTS
  .config(
    {
      ignores: [
        "dist",
        "dist-new",
        "node_modules",
        "public",
        ".vscode",
        ".cursor",
        ".astro/**/*",
        "src/shared/api/cms/cms-schema.ts",
        "src/app/third-party/**/*",
        "**/*.md",
      ],
    },
    {
      extends: [
        eslintJS.configs.recommended,
        ...eslintTS.configs.recommended,
        importPlugin.flatConfigs.typescript,
      ],
      files: ["**/*.{ts,tsx}"],
      plugins,
      rules,
      languageOptions: {
        ecmaVersion: 2020,
        globals: globals.browser,
        parserOptions: {
          sourceType: "module",
          parser: "@typescript-eslint/parser",
          ecmaFeatures: {
            jsx: true,
          },
        },
      },
    },
    {
      files: ["**/*.astro"],
      rules,
      plugins,
      extends: [
        eslintJS.configs.recommended,
        ...eslintTS.configs.recommended,
        importPlugin.flatConfigs.typescript,
        ...eslintPluginAstro.configs.recommended,
      ],
      processor: "astro/client-side-ts",
      settings: {
        "import/parsers": {
          "astro-eslint-parser": [".astro"],
        },
        "import/core-modules": ["astro:content"],
      },
      languageOptions: {
        ecmaVersion: 2020,
        globals: globals.node,
        parser: astroEslintParser,
        parserOptions: {
          sourceType: "module",
          parser: "@typescript-eslint/parser",
          extraFileExtensions: [".astro"],
          ecmaFeatures: {
            jsx: true,
          },
        },
      },
    },
    {
      files: ["**/*.d.ts", "./src/shared/api/cms/cms-schema.ts"],
      rules: {
        "unused-imports/no-unused-imports": "off",
        "@typescript-eslint/consistent-type-imports": "off",
        "@typescript-eslint/no-unused-vars": "off",
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/no-empty-object-type": "off",
        "@typescript-eslint/naming-convention": "off",
        "@typescript-eslint/triple-slash-reference": "off",
      },
    },
    {
      files: [
        "**/*.astro/*.js",
        "*.astro/*.js",
        "**/*.astro/*.ts",
        "*.astro/*.ts",
      ],
      rules: {
        "prettier/prettier": "off",
      },
    }
  )
  .concat(eslintPluginPrettier);
