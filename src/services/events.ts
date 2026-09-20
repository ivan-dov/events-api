import { knex } from '../db';
import { Event } from '../types/event';

export type GetEventsParams = {
    city?: string;
    limit?: number;
    offset?: number;
};

export const getEvents = async ({
    city,
    limit,
    offset,
}: GetEventsParams = {}): Promise<Event[]> => {
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

    return await query;
};

export const getEvent = async (id: number): Promise<Event | undefined> => {
    return await knex<Event>('events').select('*').where({ id }).first();
};
