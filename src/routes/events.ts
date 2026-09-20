import express from 'express';
import { getEvent, getEvents, GetEventsParams } from '../services/events';
import { numberParam } from '../utils/numberParam';

export const eventsRouter = express.Router();

eventsRouter.get('/', async (req, res) => {
    const searchParams: GetEventsParams = {};
    const cityParam = String(req.query.city || '').trim();
    const limitParam = numberParam(req.query.limit, {
        integer: true,
        allowNegative: false,
    });
    const offetParam = numberParam(req.query.offset, {
        integer: true,
        allowNegative: false,
    });
    const validationErrors: string[] = [];

    if (cityParam) {
        searchParams.city = cityParam;
    }

    if (limitParam.type === 'success') {
        searchParams.limit = limitParam.value;
    } else {
        validationErrors.push('Limit ' + limitParam.message);
    }

    if (offetParam.type === 'success') {
        searchParams.offset = offetParam.value;
    } else {
        validationErrors.push('Offset ' + offetParam.message);
    }

    if (validationErrors.length) {
        res.status(400).json({
            error: `Invalid search params: ${validationErrors.join(', ')}.`,
        });
        return;
    }

    const events = await getEvents(searchParams);

    res.json(events);
});

eventsRouter.get('/:id', async (req, res) => {
    const idParam = numberParam(req.params.id, {
        allowNegative: false,
        integer: true,
        required: true,
    });

    if (idParam.type === 'error') {
        res.status(400).json({ error: 'Event id ' + idParam.message });
        return;
    }

    const result = await getEvent(idParam.value!);

    if (!result) {
        res.status(404).json({
            error: `Event with id "${idParam.value}" not found`,
        });
        return;
    }

    res.json(result);
});
