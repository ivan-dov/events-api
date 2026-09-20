import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("attendees", (table) => {
    table.increments("id", { primaryKey: true });
    table.string("full_name").notNullable();
    table.string("department").notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable("attendees");
}
