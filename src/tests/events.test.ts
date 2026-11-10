import assert from 'node:assert/strict';
import { after, before, beforeEach, describe, it } from 'node:test';
import request, { Response } from 'supertest';
import { app } from '../app.ts';
import { knex } from '../db.ts';
import { CreateEventParams } from '../services/events.ts';
import { Event } from '../types/event.ts';

before(async () => {
    await knex.migrate.latest();
});

beforeEach(async () => {
    await knex.raw(
        'TRUNCATE events, attendees, bookings RESTART IDENTITY CASCADE',
    );
    await knex.seed.run();
});

after(async () => {
    await knex.destroy();
});

describe('GET /events', () => {
    let response: Response;

    beforeEach(async () => {
        response = await request(app)
            .get('/events')
            .set('Accept', 'application/json');
    });

    it('returns events', () => {
        assert.equal(response.status, 200);
        assert.equal(response.body.length, 4);
    });

    it('includes attendee_count', () => {
        assert.equal(
            response.body.find(
                (event: Event) => event.name === 'Vertigo Recovery Retreat',
            ).attendee_count,
            2,
        );
        assert.equal(
            response.body.find(
                (event: Event) => event.name === 'Sydney Sprint to Nowhere',
            ).attendee_count,
            0,
        );
    });

    it('casts attendee_count to integer', () => {
        assert.equal(typeof response.body[0].attendee_count, 'number');
    });
});

describe('POST /events', () => {
    it('creates event', async () => {
        const response = await request(app)
            .post('/events')
            .set('Content-Type', 'application/json')
            .send({
                name: 'Lavender Raft Torment',
                city: 'St.Petersburg',
                starts_on: '2028-02-24',
                budget_cents: '12',
                bookings: [
                    {
                        attendee_id: 1,
                        cost_cents: '2',
                    },
                ],
            } satisfies CreateEventParams);

        const createdEvent = await knex('events')
            .where({ id: response.body.id })
            .first();

        assert.equal(response.status, 201);
        assert.equal(response.body.id, createdEvent.id);
        assert.ok(createdEvent);
    });

    it('creates booking', async () => {
        const response = await request(app)
            .post('/events')
            .set('Content-Type', 'application/json')
            .send({
                name: 'Lavender Raft Torment',
                city: 'St.Petersburg',
                starts_on: '2028-02-24',
                budget_cents: '12',
                bookings: [
                    {
                        attendee_id: 1,
                        cost_cents: '2',
                    },
                ],
            } satisfies CreateEventParams);

        const createdBooking = await knex('bookings')
            .where({ id: response.body.bookings[0].id })
            .first();

        assert.ok(createdBooking);
        assert.equal(createdBooking?.status, 'pending');
    });

    it('returns 400 on empty bookings list', async () => {
        const response = await request(app)
            .post('/events')
            .set('Content-Type', 'application/json')
            .send({
                name: 'Lavender Raft Torment',
                city: 'St.Petersburg',
                starts_on: '2028-02-24',
                budget_cents: '12',
                bookings: [],
            } satisfies CreateEventParams);

        assert.equal(response.status, 400);
        assert.ok(
            !(await knex('events')
                .where({ name: 'Lavender Raft Torment' })
                .first()),
        );
    });
});
