import js               from "@eslint/js";
import globals          from "globals";
import jsdoc            from "eslint-plugin-jsdoc";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    files   : ["**/*.{js,mjs,cjs}"],
    plugins : { js, jsdoc },
    extends : ["js/recommended"],

    languageOptions: {
      globals: globals.browser
    },

    rules: {
      indent: ["error", 4, { SwitchCase: 1 }],
      "jsdoc/check-alignment"   : "warn",
      "jsdoc/check-indentation" : "warn"
    }
  }
]);
