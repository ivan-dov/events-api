import express from 'express';
import z from 'zod';
import {
    EventsSearchParamsSchema,
    getEvent,
    getEventAttendees,
    getEvents,
    hasEvent,
} from '../services/events';

export const eventsRouter = express.Router();

const EventId = z.coerce.number().int().positive();

eventsRouter.get('/', async (req, res) => {
    const parsedSearchParams = EventsSearchParamsSchema.safeParse(req.query);

    if (!parsedSearchParams.success) {
        res.status(400).json({
            error: 'Invalid request',
            issues: parsedSearchParams.error.issues,
        });
        return;
    }

    const searchParams = parsedSearchParams.data;
    const events = await getEvents(searchParams);

    res.json(events);
});

eventsRouter.get('/:id', async (req, res) => {
    const parsedId = EventId.safeParse(req.params.id);

    if (!parsedId.success) {
        res.status(400).json({
            error: 'Invalid request',
            issues: parsedId.error.issues,
        });
        return;
    }

    const id = parsedId.data;
    const result = await getEvent(id);

    if (!result) {
        res.status(404).json({ error: `Event with id "${id}" not found` });
        return;
    }

    res.json(result);
});

eventsRouter.get('/:id/attendees', async (req, res) => {
    const parsedId = EventId.safeParse(req.params.id);

    if (!parsedId.success) {
        res.status(400).json({
            error: 'Invalid request',
            issues: parsedId.error.issues,
        });
        return;
    }

    const id = parsedId.data;

    if (!(await hasEvent(id))) {
        res.status(404).json({
            error: `Event with id "${id}" not found`,
        });
        return;
    }

    const result = await getEventAttendees(id);
    res.json(result);
});
