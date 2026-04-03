import * as fs from "node:fs";
import * as path from "node:path";

import BetterSqlite3 from "better-sqlite3";
import { createDatabase, Database } from "remix/data-table";
import { createMigrationRunner } from "remix/data-table/migrations";
import { loadMigrations } from "remix/data-table/migrations/node";
import { createSqliteDatabaseAdapter } from "remix/data-table-sqlite";
import type { Middleware } from "remix/fetch-router";

const migrationsDirectoryPath = path.join(process.cwd(), "migrations");
let databaseFilePath: string;
if (process.env.NODE_ENV === "test") {
  databaseFilePath = ":memory:";
} else {
  let dbDirectoryUrl = process.cwd();
  databaseFilePath = path.join(dbDirectoryUrl, "db.sqlite");
  fs.mkdirSync(dbDirectoryUrl, { recursive: true });
}

const sqlite = new BetterSqlite3(databaseFilePath);
sqlite.pragma("foreign_keys = ON");
const adapter = createSqliteDatabaseAdapter(sqlite);

const db = createDatabase(adapter);

let migrations = await loadMigrations(migrationsDirectoryPath);
let migrationRunner = createMigrationRunner(adapter, migrations);
await migrationRunner.up();

type SetDatabaseContextTransform = readonly [readonly [typeof Database, Database]];

export function databaseMiddleware(): Middleware<"ANY", {}, SetDatabaseContextTransform> {
  return async (context, next) => {
    context.set(Database, db);
    return next();
  };
}
