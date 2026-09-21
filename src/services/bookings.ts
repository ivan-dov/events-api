import { DatabaseError } from 'pg';
import z from 'zod';
import { knex } from '../db';
import { ConflictError } from '../errors/conflict';
import { Booking, CreateBooking } from '../types/booking';
import { DatabaseErrorCode } from '../types/database-error-code';

export const CreateBookingParamsSchema = z.object({
    attendee_id: z.int().positive(),
    event_id: z.int().positive(),
    cost_cents: z.int().nonnegative(),
});

export type CreateBookingParams = z.infer<typeof CreateBookingParamsSchema>;

export const createBooking = async (params: CreateBookingParams) => {
    try {
        const [result] = await knex<Booking>('bookings')
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
                'Pair event_id and attendee_id must be unique',
            );
        }

        throw error;
    }
};
