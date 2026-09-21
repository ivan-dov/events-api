import express from 'express';
import { ConflictError } from '../errors/conflict';
import { hasAttendee } from '../services/attendees';
import { createBooking, CreateBookingParamsSchema } from '../services/bookings';
import { hasEvent } from '../services/events';

export const bookingsRouter = express.Router();

bookingsRouter.post('/', async (req, res) => {
    const parsedBody = CreateBookingParamsSchema.safeParse(req.body);

    if (!parsedBody.success) {
        res.status(400).json({
            error: 'Invalid request',
            issues: parsedBody.error.issues,
        });
        return;
    }

    const params = parsedBody.data;
    const errorMessages: string[] = [];

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
