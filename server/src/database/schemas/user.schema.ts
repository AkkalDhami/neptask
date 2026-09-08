import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  json,
  uuid,
} from "drizzle-orm/pg-core"
import { timestamps } from "./schema.helper"

export const users = pgTable("users", {
  id: uuid().defaultRandom().primaryKey(),

  name: text("name").notNull(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password"),
  role: text("role", {
    enum: ["user", "owner", "admin", "moderator", "member"],
  })
    .default("user")
    .notNull(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
  failedLoginAttempts: integer("failed_login_attempts").default(0).notNull(),
  lockUntil: timestamp("lock_until", { withTimezone: true }),
  avatar: json("avatar"),

  provider: text("provider", {
    enum: ["local", "google", "github"],
  })
    .default("local")
    .notNull(),
  providerId: text("provider_id"),

  isDeleted: boolean("is_deleted").default(false).notNull(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
  reActivateAvailableAt: timestamp("re_activate_available_at", {
    withTimezone: true,
  }),

  ...timestamps,
})

export type User = typeof users.$inferSelect
