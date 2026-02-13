import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";
import { getEnv } from "@/lib/env";

const env = getEnv();

const sql = neon(env.DATABASE_URL);

export const db = drizzle(sql, { schema });

export type DbClient = typeof db;

