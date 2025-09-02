// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";

import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import boundaries from "eslint-plugin-boundaries";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [...compat.extends("next/core-web-vitals", "next/typescript"), {
  ignores: [
    "node_modules/**",
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ],
}, {
  plugins: {
    boundaries,
  },
  settings: {
    "boundaries/elements": [
      { type: "app", pattern: "src/app/*" },
      { type: "pages", pattern: "src/pages/*" },
      { type: "widgets", pattern: "src/widgets/*" },
      { type: "features", pattern: "src/features/*" },
      { type: "entities", pattern: "src/entities/*" },
      { type: "shared", pattern: "src/shared/*" },
    ],
  },
  rules: {
    "boundaries/element-types": [
      2,
      {
        default: "disallow",
        rules: [
          {
            from: "shared",
            allow: ["shared"],
          },
          {
            from: "entities",
            allow: ["shared", "entities"],
          },
          {
            from: "features",
            allow: ["shared", "entities", "features"],
          },
          {
            from: "widgets",
            allow: ["shared", "entities", "features", "widgets"],
          },
          {
            from: "pages",
            allow: ["shared", "entities", "features", "widgets", "pages"],
          },
          {
            from: "app",
            allow: ["shared", "entities", "features", "widgets", "pages", "app"],
          },
        ],
      },
    ],
  },
}, ...storybook.configs["flat/recommended"]];

export default eslintConfig;
