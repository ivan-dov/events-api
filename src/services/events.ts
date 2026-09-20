import { knex } from '../db';
import { Attendee } from '../types/attendee';
import { BookingStatus } from '../types/booking';
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

export const hasEvent = async (id: number): Promise<boolean> => {
    return !!(await knex<Event>('events').select('id').where({ id }).first());
};

export type EventAttendee = Attendee & {
    attendance_status: BookingStatus;
};

export const getEventAttendees = async (
    id: number,
): Promise<EventAttendee[]> => {
    return await knex<EventAttendee>('bookings AS b')
        .join('attendees AS a', 'b.attendee_id', '=', 'a.id')
        .where({ 'b.event_id': id })
        .select(
            'a.id',
            'a.full_name',
            'a.department',
            'b.status AS attendance_status',
        );
};
