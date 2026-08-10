import { ConfigFactory } from "@nestjs/config"

import "dotenv/config"

import z from "zod"

export const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),

  PORT: z.coerce.number(),

  DATABASE_URL: z.url(),

  CORS_ORIGIN: z.string(),

  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  CRYPTO_SECRET: z.string().min(32),

  ACCESS_TOKEN_EXPIRY: z.string().default("15m"),
  REFRESH_TOKEN_EXPIRY: z.string().default("7d"),

  REDIS_HOST: z.string(),
  REDIS_PORT: z.coerce.number(),
  REDIS_PASSWORD: z.string(),
})

export type Env = z.infer<typeof envSchema>

const result = envSchema.safeParse(process.env)

if (!result.success) {
  console.error("❌ Invalid environment configuration")
  console.error(z.treeifyError(result.error))
  process.exit(1)
}

export const env: Readonly<Env> = Object.freeze(result.data)

export const envConfig: ConfigFactory<Env> = () => ({ ...env })
