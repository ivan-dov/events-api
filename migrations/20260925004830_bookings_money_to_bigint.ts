import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    return knex.schema.alterTable('bookings', (table) => {
        table.bigint('cost_cents').alter({ alterNullable: false });
    });
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema.alterTable('bookings', (table) => {
        table.integer('cost_cents').alter({ alterNullable: false });
    });
}
