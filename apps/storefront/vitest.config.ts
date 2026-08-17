import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default {
  resolve: {
    alias: {
      "@lib": path.resolve(__dirname, "./src/lib"),
      "@modules": path.resolve(__dirname, "./src/modules"),
      "@pages": path.resolve(__dirname, "./src/pages"),
    },
  },
  test: {
    environment: "node",
    globals: true,
  },
}
