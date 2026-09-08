import { ConfigService } from "@nestjs/config"
import { Pool } from "@neondatabase/serverless"
import { Global, Module } from "@nestjs/common"
import { drizzle } from "drizzle-orm/neon-serverless"
import * as schema from "./schemas/index"

export const DRIZZLE_DB = Symbol("DRIZZLE_DB")

@Global()
@Module({
  providers: [
    {
      provide: DRIZZLE_DB,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const connectionString = config.getOrThrow<string>("DATABASE_URL")
        if (!connectionString) {
          throw new Error("DATABASE_URL is not defined")
        }

        const pool = new Pool({
          connectionString,
        })

        return drizzle(pool, {
          schema,
          // logger: process.env.NODE_ENV === 'development',
        })
      },
    },
  ],
  exports: [DRIZZLE_DB],
})
export class DatabaseModule {}
