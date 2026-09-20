import express from 'express';
import { hasAttendee } from '../services/attendees';
import { createBooking, CreateBookingParams } from '../services/bookings';
import { hasEvent } from '../services/events';
import { ConflictError } from '../errors/conflict';

export const bookingsRouter = express.Router();

bookingsRouter.post('/', async (req, res) => {
    const body: unknown = req.body;

    if (!body) {
        res.status(400).json({ error: 'Body is expected' });
        return;
    }

    if (typeof body !== 'object') {
        res.status(400).json({ error: 'Body must be an object' });
        return;
    }

    const errorMessages: string[] = [];

    if (!('event_id' in body)) {
        errorMessages.push('"event_id" is required');
    } else if (
        typeof body.event_id !== 'number' ||
        !Number.isInteger(body.event_id) ||
        body.event_id < 0
    ) {
        errorMessages.push('"event_id" must be a positive integer');
    }

    if (!('attendee_id' in body)) {
        errorMessages.push('"attendee_id" is required');
    } else if (
        typeof body.attendee_id !== 'number' ||
        !Number.isInteger(body.attendee_id) ||
        body.attendee_id < 0
    ) {
        errorMessages.push('"attendee_id" must be a positive integer');
    }

    if (!('cost_cents' in body)) {
        errorMessages.push('"cost_cents" is required');
    } else if (
        typeof body.cost_cents !== 'number' ||
        !Number.isInteger(body.cost_cents) ||
        body.cost_cents < 0
    ) {
        errorMessages.push('"cost_cents" must be a positive integer');
    }

    if (errorMessages.length) {
        res.status(400).json({ error: errorMessages.join(', ') });
        return;
    }

    const params = body as CreateBookingParams;

    const [eventIsValid, attendeeIsValid] = await Promise.all([
        hasEvent(params.event_id),
        hasAttendee(params.attendee_id),
    ]);

    if (!eventIsValid) {
        errorMessages.push(`Event with id "${params.event_id}" does not exist`);
    }

    if (!attendeeIsValid) {
        errorMessages.push(
            `Attendee with id "${params.attendee_id}" does not exist`,
        );
    }

    if (errorMessages.length) {
        res.status(400).json({ error: errorMessages.join(', ') });
        return;
    }

    try {
        const result = await createBooking(params);
        res.status(201).json(result);
    } catch (error) {
        if (error instanceof ConflictError) {
            res.status(409).json({ error: error.message });
            return;
        }

        throw error;
    }
});
