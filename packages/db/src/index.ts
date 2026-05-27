/**
 * Public surface of the @heroquest/db package.
 *
 * Worker code does:
 *   import { getDb, schema } from '@heroquest/db';
 *   const db = getDb(env.DB);
 *   const users = await db.select().from(schema.user).limit(10);
 */
import { drizzle } from "drizzle-orm/d1";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import * as schemaNs from "./schema";

export const schema = schemaNs;
export type Schema = typeof schemaNs;

export type Database = DrizzleD1Database<Schema>;

export function getDb(d1: D1Database): Database {
  return drizzle(d1, { schema: schemaNs });
}

export * from "./types";
export * from "./levels";
export * from "./achievements";
