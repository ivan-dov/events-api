import { createServer } from 'node:http';
import { knex } from './db';
import { Event } from './types/event';

const toNumber = (value: unknown): number | undefined => {
    if (value === 0) return value;
    if (!value) return undefined;
    let result;

    if (typeof value === 'string') {
        result = +value.toString();
    } else {
        result = +value;
    }

    return isNaN(result) ? undefined : result;
};

type GetEventsParams = {
    city?: string;
    limit?: number;
    offset?: number;
};

const getEvents = ({ city, limit, offset }: GetEventsParams = {}): Promise<
    Event[]
> => {
    const query = knex<Event>('events').select('*');

    if (city) {
        query.where({ city });
    }

    if (limit != null) {
        query.limit(limit);
    }

    if (offset != null) {
        query.offset(offset);
    }

    return query;
};

const getEvent = (id: number): Promise<Event | undefined> => {
    return knex<Event>('events').select('*').where({ id }).first();
};

const server = createServer((req, res) => {
    console.log('Incoming', req.method, req.url);

    if (!req.url) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Not Found' }));
        return;
    }

    const baseUrl = `${req.headers['x-forwarded-proto'] || 'http'}://${req.headers.host}`;
    const url = new URL(req.url, baseUrl);
    const path = url.pathname.slice(1).split('/');

    if (req.method === 'GET' && path[0] === 'events' && path.length === 1) {
        const searchParams: GetEventsParams = {};
        const cityParam = url.searchParams.get('city')?.trim();
        const limitParam = toNumber(url.searchParams.get('limit'));
        const offetParam = toNumber(url.searchParams.get('offset'));

        if (cityParam) {
            searchParams.city = cityParam;
        }

        if (limitParam != null) {
            searchParams.limit = limitParam;
        }

        if (offetParam != null) {
            searchParams.offset = offetParam;
        }

        getEvents(searchParams)
            .then((events) => {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(events));
            })
            .catch((error) => {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: String(error) }));
            });

        return;
    }

    if (req.method === 'GET' && path[0] === 'events' && path.length === 2) {
        const [idRaw] = path[1].match(/^[0-9]+$/) || [];
        const id = toNumber(idRaw);

        if (id == null) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(
                JSON.stringify({
                    error: 'Event id is malformed. Expected an integer',
                }),
            );
            return;
        }

        getEvent(id)
            .then((result) => {
                if (!result) {
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    res.end(
                        JSON.stringify({
                            error: `Event with id "${id}" not found`,
                        }),
                    );
                    return;
                }

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(result));
            })
            .catch((error) => {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: String(error) }));
            });

        return;
    }

    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not Found' }));
});

server.listen(3000, () => console.log('Listening on port 3000'));
