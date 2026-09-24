import type { Knex } from 'knex';
import type { CreateAttendee } from '../src/types/attendee.ts';
import type { CreateBooking } from '../src/types/booking.ts';
import type { CreateEvent } from '../src/types/event.ts';

const attendees: CreateAttendee[] = [
    { full_name: 'Alfred Hitchcock', department: 'Engineering' },
    { full_name: 'Agnes Varda', department: 'Marketing' },
    { full_name: 'Akira Kurosawa', department: 'Engineering' },
    { full_name: 'Chantal Akerman', department: 'Finance' },
    { full_name: 'Ousmane Sembene', department: 'Sales' },
    { full_name: 'Lina Wertmuller', department: 'Sales' },
];

const events: CreateEvent[] = [
    {
        name: 'Vertigo Recovery Retreat',
        city: 'Munich',
        starts_on: '2027-01-27',
        budget_cents: 10_000_000,
    },
    {
        name: 'Sydney Synergy Slam',
        city: 'Sydney',
        starts_on: '2026-11-12',
        budget_cents: 4_500_000,
    },
    {
        name: 'Brisbane Blue-Sky Bonanza',
        city: 'Brisbane',
        starts_on: '2026-10-05',
        budget_cents: 2_000_000,
    },
    {
        // deliberately has no bookings
        name: 'Sydney Sprint to Nowhere',
        city: 'Sydney',
        starts_on: '2027-03-03',
        budget_cents: 8_000_000,
    },
];

export async function seed(knex: Knex): Promise<void> {
    // Deletes ALL existing entries
    await knex('bookings').del();
    await Promise.all([knex('attendees').del(), knex('events').del()]);

    const attendeesIds = await knex('attendees')
        .insert(attendees)
        .returning('id');

    const eventsIds = await knex('events').insert(events).returning('id');

    const ev = (i: number) => eventsIds[i].id;
    const at = (i: number) => attendeesIds[i].id;

    await knex('bookings').insert([
        // Munich: two confirmed, one cancelled
        {
            event_id: ev(0),
            attendee_id: at(0),
            status: 'confirmed',
            cost_cents: 120_000,
        },
        {
            event_id: ev(0),
            attendee_id: at(1),
            status: 'confirmed',
            cost_cents: 135_000,
        },
        {
            event_id: ev(0),
            attendee_id: at(2),
            status: 'cancelled',
            cost_cents: 120_000,
        },
        // Sydney Sales Kickoff: two confirmed, one pending
        {
            event_id: ev(1),
            attendee_id: at(4),
            status: 'confirmed',
            cost_cents: 60_000,
        },
        {
            event_id: ev(1),
            attendee_id: at(5),
            status: 'pending',
            cost_cents: 60_000,
        },
        {
            event_id: ev(1),
            attendee_id: at(3),
            status: 'confirmed',
            cost_cents: 75_000,
        },
        // Brisbane: one confirmed, one pending
        {
            event_id: ev(2),
            attendee_id: at(3),
            status: 'confirmed',
            cost_cents: 40_000,
        },
        {
            event_id: ev(2),
            attendee_id: at(0),
            status: 'pending',
            cost_cents: 40_000,
        },
        // Sydney Product Summit (ev 3): nothing on purpose
    ] satisfies CreateBooking[]);
}
