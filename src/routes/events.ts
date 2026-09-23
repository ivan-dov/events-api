import express from 'express';
import z from 'zod';
import { NotFoundError } from '../errors/catalog/not-found-error';
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
    const searchParams = EventsSearchParamsSchema.parse(req.query);
    const events = await getEvents(searchParams);

    res.json(events);
});

eventsRouter.get('/:id', async (req, res) => {
    const id = EventId.parse(req.params.id);
    const result = await getEvent(id);

    if (!result) {
        throw new NotFoundError(`Event with id "${id}" not found.`);
    }

    res.json(result);
});

eventsRouter.patch('/:id', async (req, res) => {
    const id = EventId.parse(req.params.id);
    const body = PatchEventParamsSchema.parse(req.body);
    const updatedDto = await patchEvent(id, body);

    if (!updatedDto) {
        throw new NotFoundError(`Event with id "${id}" not found.`);
    }

    res.json(updatedDto);
});

eventsRouter.delete('/:id', async (req, res) => {
    const id = EventId.parse(req.params.id);
    const deleted = await deleteEvent(id);

    if (!deleted) {
        throw new NotFoundError(`Event with id "${id}" not found.`);
    }

    res.status(204).end();
});

eventsRouter.get('/:id/attendees', async (req, res) => {
    const id = EventId.parse(req.params.id);

    if (!(await hasEvent(id))) {
        throw new NotFoundError(`Event with id "${id}" not found.`);
    }

    const result = await getEventAttendees(id);
    res.json(result);
});
