import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable('events', (table) => {
        table.increments('id', { primaryKey: true });
        table.string('name').notNullable();
        table.string('city').notNullable();
        table.date('starts_on').notNullable();
        table.integer('budget_cents').notNullable();
    });
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTable('events');
}
