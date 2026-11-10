import { DatabaseError } from 'pg';
import z from 'zod';
import { knex } from '../db';
import { ConflictError } from '../errors/conflict';
import { DbBigintSchema } from '../schemas/db';
import { Attendee } from '../types/attendee';
import { BookingStatus } from '../types/booking';
import { DatabaseErrorCode } from '../types/database-error-code';
import { Event } from '../types/event';
import { createBooking, CreateBookingParamsSchema } from './bookings';

const NameSchema = z.string().trim().max(255).nonempty();
const CitySchema = z.string().trim().max(255).nonempty();
const StartsOnSchema = z.iso.date();
const BudgetCentsSchema = DbBigintSchema.pipe(
    z.bigint().nonnegative().transform(String),
);

export const EventsSearchParamsSchema = z
    .object({
        city: CitySchema,
        limit: z.coerce.number().int().nonnegative(),
        offset: z.coerce.number().int().nonnegative(),
    })
    .partial();

export const PatchEventParamsSchema = z
    .object({
        name: NameSchema,
        city: CitySchema,
        starts_on: StartsOnSchema,
        budget_cents: BudgetCentsSchema,
    })
    .partial()
    .refine((value) => Object.keys(value).length > 0, 'Must not be empty');

export const CreateEventParamsSchema = z.object({
    name: NameSchema,
    city: CitySchema,
    starts_on: StartsOnSchema,
    budget_cents: BudgetCentsSchema,
    bookings: z
        .array(CreateBookingParamsSchema.omit({ event_id: true }))
        .min(1),
});

export type EventsSearchParams = z.infer<typeof EventsSearchParamsSchema>;
export type PatchEventParams = z.infer<typeof PatchEventParamsSchema>;
export type CreateEventParams = z.infer<typeof CreateEventParamsSchema>;

export type EventDto = Event & { attendee_count: number };

export const getEvents = async ({
    city,
    limit,
    offset,
}: EventsSearchParams = {}): Promise<EventDto[]> => {
    const query = knex<Event>('events AS e')
        .leftJoin('bookings AS b', (join) =>
            join
                .on('e.id', '=', 'b.event_id')
                .andOnVal('b.status', '=', 'confirmed'),
        )
        .select(
            'e.id',
            'e.name',
            'e.city',
            'e.starts_on',
            'e.budget_cents',
            knex.raw('COUNT(DISTINCT b.attendee_id)::int AS attendee_count'),
        )
        .groupBy('e.id');

    if (city) {
        query.where({ 'e.city': city });
    }

    if (limit != null) {
        query.limit(limit);
    }

    if (offset != null) {
        query.offset(offset);
    }

    // Order deterministically
    return await query.orderBy('e.starts_on', 'desc').orderBy('e.id', 'asc');
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

export const deleteEvent = async (id: number) => {
    try {
        const deletedAmount = await knex<Event>('events').where({ id }).del();
        return deletedAmount === 1;
    } catch (error) {
        if (
            error instanceof DatabaseError &&
            error.code === DatabaseErrorCode.ForeignKey &&
            error.table === 'bookings'
        ) {
            throw new ConflictError(
                'foreignKey',
                `Failed to delete event with id "${id}", this event still has bookings.`,
            );
        }

        throw error;
    }
};

export const createEvent = async (params: CreateEventParams) => {
    return await knex.transaction(async (trx) => {
        const [result] = await trx<Event>('events')
            .insert({
                name: params.name,
                city: params.city,
                starts_on: params.starts_on,
                budget_cents: params.budget_cents,
            })
            .returning('*');

        const bookings = await Promise.all(
            params.bookings.map((booking) =>
                createBooking({ ...booking, event_id: result.id }, trx),
            ),
        );

        return { ...result, bookings };
    });
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
