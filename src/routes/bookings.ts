import express from 'express';
import { IncorrectInputError } from '../errors/catalog/incorrect-input-error';
import { getMissingAttendees } from '../services/attendees';
import { createBooking, CreateBookingParamsSchema } from '../services/bookings';
import { hasEvent } from '../services/events';

export const bookingsRouter = express.Router();

bookingsRouter.post('/', async (req, res) => {
    const params = CreateBookingParamsSchema.parse(req.body);

    const [eventIsValid, missingAttendees] = await Promise.all([
        hasEvent(params.event_id),
        getMissingAttendees([params.attendee_id]),
    ]);

    if (!eventIsValid) {
        throw new IncorrectInputError(
            `Event with id "${params.event_id}" does not exist`,
        );
    }

    if (missingAttendees.length) {
        throw new IncorrectInputError(
            `Attendee with id "${params.attendee_id}" does not exist`,
        );
    }

    const result = await createBooking(params);
    res.status(201).json(result);
});
