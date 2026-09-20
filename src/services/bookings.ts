import { DatabaseError } from 'pg';
import { knex } from '../db';
import { Booking, CreateBooking } from '../types/booking';
import { DatabaseErrorCode } from '../types/database-error-code';
import { ConflictError } from '../errors/conflict';

export type CreateBookingParams = {
    event_id: number;
    attendee_id: number;
    cost_cents: number;
};

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
