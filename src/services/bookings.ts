import type { Knex } from 'knex';
import { DatabaseError } from 'pg';
import z from 'zod';
import { knex } from '../db.ts';
import { ConflictError } from '../errors/conflict.ts';
import { DbBigintSchema } from '../schemas/db.ts';
import { Booking, CreateBooking } from '../types/booking.ts';
import { DatabaseErrorCode } from '../types/database-error-code.ts';

export const CreateBookingParamsSchema = z.object({
    attendee_id: z.int32().positive(),
    event_id: z.int32().positive(),
    cost_cents: DbBigintSchema.pipe(z.bigint().nonnegative().transform(String)),
});

export type CreateBookingParams = z.infer<typeof CreateBookingParamsSchema>;

export const createBooking = async (
    params: CreateBookingParams,
    target: Knex = knex,
) => {
    try {
        const [result] = await target<Booking>('bookings')
            .insert({
                ...params,
                status: 'pending',
            } satisfies CreateBooking)
            .returning('*');

        return result;
    } catch (error) {
        if (!(error instanceof DatabaseError)) {
            throw error;
        }

        if (error.code === DatabaseErrorCode.Unique) {
            throw new ConflictError(
                'unique',
                'Pair of event_id and attendee_id already exists.',
            );
        }

        throw error;
    }
};
