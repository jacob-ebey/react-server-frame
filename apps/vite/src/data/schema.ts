import { column as c, table } from "remix/data-table";
import type { TableRow } from "remix/data-table";

export const profiles = table({
  name: "profiles",
  primaryKey: "did",
  columns: {
    did: c.text().primaryKey().notNull(),
    displayName: c.text().notNull(),
    created_at: c.integer().notNull(),
    updated_at: c.integer().notNull(),
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

    if (operation === "create" && next.created_at === undefined) {
      next.created_at = timestamp;
    }

    next.updated_at = timestamp;

    return { value: next };
  },
});

export type Profile = TableRow<typeof profiles>;

function normalizeText(value: string): string {
  return value.trim();
}
