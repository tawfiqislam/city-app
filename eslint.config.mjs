import { dirname } from "path"
import { fileURLToPath } from "url"
import { FlatCompat } from "@eslint/eslintrc"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compat = new FlatCompat({
  baseDirectory: __dirname,
})

const eslintConfig = [
  ...compat.extends("next/core-web-vitals"),
  {
    rules: {
      // Disable useEffect dependency warnings
      "react-hooks/exhaustive-deps": "off",

      // Disable unescaped entities errors
      "react/no-unescaped-entities": "off",

      // Disable img element warnings (allow normal <img> tags)
      "@next/next/no-img-element": "off",
    },
  },
]

export default eslintConfig