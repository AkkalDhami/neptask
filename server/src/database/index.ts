import { drizzle } from "drizzle-orm/neon-serverless"

import * as schema from "./schemas"

export type Database = ReturnType<typeof drizzle<typeof schema>>
