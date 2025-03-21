import {
  pgTable,
  text,
  timestamp,
  uuid,
  boolean,
  varchar,
  primaryKey,
  foreignKey,
} from "drizzle-orm/pg-core";

// Users table with reference to Teams
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: text("password"),
  isVerified: boolean("is_verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  teamId: uuid("team_id").references(() => teams.id, { onDelete: "SET NULL" }), // Foreign key reference
});

// Teams table with reference to Admin (who is a User)
export const teams = pgTable("teams", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  adminId: uuid("admin_id").references(() => users.id, { onDelete: "CASCADE" }), // Foreign key to Users
  description: text("description").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  code: varchar("code", { length: 255 }).notNull(),
});

// PhotoData table with references to both User and Team
export const photoData = pgTable("photo_data", {
  id: uuid("id").defaultRandom().primaryKey(),
  url: text("url").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  folder: text("folder").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "CASCADE" }), // Foreign key to Users
  teamId: uuid("team_id").references(() => teams.id, { onDelete: "CASCADE" }), // Foreign key to Teams
});

// Sessions table with reference to Users
export const sessions = pgTable("sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  sessionToken: varchar("session_token", { length: 255 }).notNull().unique(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "CASCADE" }), // Foreign key to Users
  expires: timestamp("expires").notNull(),
});
