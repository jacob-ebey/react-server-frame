import { column as c, table } from "remix/data-table";
import { createMigration } from "remix/data-table/migrations";

const profiles = table({
  name: "profiles",
  primaryKey: "did",
  columns: {
    did: c.text().primaryKey().notNull(),
    displayName: c.text().notNull(),
    createdAt: c.integer().notNull(),
    updatedAt: c.integer().notNull(),
  },
});

const tokens = table({
  name: "tokens",
  primaryKey: "did",
  columns: {
    did: c.text().notNull(),
    value: c.text(),
    createdAt: c.integer(),
    updatedAt: c.integer(),
  },
});

export default createMigration({
  async up({ schema }) {
    await schema.createTable(profiles, { ifNotExists: true });
    await schema.createTable(tokens, { ifNotExists: true });
  },
  async down({ schema }) {
    await schema.dropTable(tokens, { ifExists: true });
    await schema.dropTable(profiles, { ifExists: true });
  },
});
