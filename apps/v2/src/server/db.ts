import { getDb, type Database } from "@heroquest/db";
import { getEnv } from "@/lib/env";

/** Get a Drizzle DB handle for the current request's D1 binding. */
export function db(): Database {
  return getDb(getEnv().DB);
}
