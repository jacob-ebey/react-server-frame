import { column as c, table } from "remix/data-table";
import { createMigration } from "remix/data-table/migrations";

const users = table({
  name: "profiles",
  primaryKey: "did",
  columns: {
    did: c.text().primaryKey().notNull(),
    displayName: c.text().notNull(),
    created_at: c.integer().notNull(),
    updated_at: c.integer().notNull(),
  },
});

export default createMigration({
  async up({ schema }) {
    await schema.createTable(users);
  },
  async down({ schema }) {
    await schema.dropTable(users, { ifExists: true });
  },
});
