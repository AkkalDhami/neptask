import { defineConfig } from "drizzle-kit"
import { env } from "./src/configs/env.config"

export default defineConfig({
  out: "./src/database/migrations",
  schema: "./src/database/schemas/index.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: env.DATABASE_URL,
  },
  verbose: true,
  strict: true,
})
