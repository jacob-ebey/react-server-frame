import { column as c, table } from "remix/data-table";
import type { TableRow } from "remix/data-table";

export const profiles = table({
  name: "profiles",
  primaryKey: "did",
  columns: {
    did: c.text().primaryKey().notNull(),
    displayName: c.text().notNull(),
    createdAt: c.integer().notNull(),
    updatedAt: c.integer().notNull(),
  },
  beforeWrite({ operation, value }) {
    const next = { ...value };
    const timestamp = Date.now();

    if (typeof value.did === "string") {
      next.did = normalizeText(value.did);
    }

    if (typeof value.displayName === "string") {
      next.displayName = normalizeText(value.displayName);
    }

    if (operation === "create" && next.createdAt === undefined) {
      next.createdAt = timestamp;
    }

    next.updatedAt = timestamp;

    return { value: next };
  },
});

export type Profile = TableRow<typeof profiles>;

export const tokens = table({
  name: "tokens",
  primaryKey: "did",
  columns: {
    did: c.text().notNull(),
    value: c.text().notNull(),
    createdAt: c.integer(),
    updatedAt: c.integer(),
  },
  beforeWrite({ operation, value }) {
    const next = { ...value };
    const timestamp = Date.now();

    if (operation === "create" && next.createdAt === undefined) {
      next.createdAt = timestamp;
    }

    next.updatedAt = timestamp;

    return { value: next };
  },
});

export type Token = TableRow<typeof tokens>;

function normalizeText(value: string): string {
  return value.trim();
}
