import express from 'express';
import { hasAttendee } from '../services/attendees';
import { createBooking, CreateBookingParamsSchema } from '../services/bookings';
import { hasEvent } from '../services/events';

export const bookingsRouter = express.Router();

bookingsRouter.post('/', async (req, res) => {
    const params = CreateBookingParamsSchema.parse(req.body);
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

    const result = await createBooking(params);
    res.status(201).json(result);
});
