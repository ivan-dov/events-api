import express from 'express';
import z from 'zod';
import { ConflictError } from '../errors/conflict';
import {
    deleteEvent,
    EventsSearchParamsSchema,
    getEvent,
    getEventAttendees,
    getEvents,
    hasEvent,
    patchEvent,
    PatchEventParamsSchema,
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

eventsRouter.patch('/:id', async (req, res) => {
    const parsedId = EventId.safeParse(req.params.id);
    const parsedBody = PatchEventParamsSchema.safeParse(req.body);

    if (!parsedId.success) {
        res.status(400).json({
            error: 'Invalid request',
            issues: parsedId.error.issues,
        });
        return;
    }

    if (!parsedBody.success) {
        res.status(400).json({
            error: 'Invalid request',
            issues: parsedBody.error.issues,
        });
        return;
    }

    const id = parsedId.data;
    const updatedDto = await patchEvent(id, parsedBody.data);

    if (updatedDto) {
        res.json(updatedDto);
        return;
    }

    res.status(404).json({ error: `Event with id "${id}" not found` });
});

eventsRouter.delete('/:id', async (req, res) => {
    const parsedId = EventId.safeParse(req.params.id);

    if (!parsedId.success) {
        res.status(400).json({
            error: 'Invalid request',
            issues: parsedId.error.issues,
        });
        return;
    }

    const id = parsedId.data;

    try {
        const deleted = await deleteEvent(id);

        if (deleted) {
            res.status(204).end();
            return;
        }

        res.status(404).json({ error: `Event with id "${id}" not found` });
    } catch (error) {
        if (error instanceof ConflictError && error.type === 'foreignKey') {
            res.status(409).json({ error: error.message });
            return;
        }

        throw error;
    }
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
