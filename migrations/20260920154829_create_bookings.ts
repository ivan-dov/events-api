import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable('bookings', (table) => {
        table.increments('id', { primaryKey: true });
        table
            .integer('event_id')
            .notNullable()
            .references('id')
            .inTable('events');
        table
            .integer('attendee_id')
            .notNullable()
            .references('id')
            .inTable('attendees');
        table
            .enu('status', ['confirmed', 'pending', 'cancelled'])
            .notNullable();
        table.integer('cost_cents').notNullable();

        table.unique(['event_id', 'attendee_id']);
    });
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTable('bookings');
}
