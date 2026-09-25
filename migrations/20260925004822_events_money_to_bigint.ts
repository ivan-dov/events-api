import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    return knex.schema.alterTable('events', (table) => {
        table.bigint('budget_cents').alter({ alterNullable: false });
    });
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema.alterTable('events', (table) => {
        table.integer('budget_cents').alter({ alterNullable: false });
    });
}
