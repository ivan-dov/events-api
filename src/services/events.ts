import z from 'zod';
import { knex } from '../db';
import { Attendee } from '../types/attendee';
import { BookingStatus } from '../types/booking';
import { Event } from '../types/event';

export const EventsSearchParamsSchema = z
    .object({
        city: z.string().trim().max(255).nonempty(),
        limit: z.coerce.number().int().nonnegative(),
        offset: z.coerce.number().int().nonnegative(),
    })
    .partial();

export const PatchEventParamsSchema = z
    .object({
        name: z.string().trim().max(255).nonempty(),
        city: z.string().trim().max(255).nonempty(),
        starts_on: z.iso.date(),
        budget_cents: z.int().nonnegative(),
    })
    .partial()
    .refine((value) => Object.keys(value).length > 0, 'Must not be empty');

export type EventsSearchParams = z.infer<typeof EventsSearchParamsSchema>;
export type PatchEventParams = z.infer<typeof PatchEventParamsSchema>;

export const getEvents = async ({
    city,
    limit,
    offset,
}: EventsSearchParams = {}): Promise<Event[]> => {
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

export const patchEvent = async (id: number, params: PatchEventParams) => {
    const [result] = await knex<Event>('events')
        .where({ id })
        .update(params)
        .returning('*');
    return result;
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
