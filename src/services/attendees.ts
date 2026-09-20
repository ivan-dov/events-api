import { knex } from '../db';
import { Attendee } from '../types/attendee';

export const hasAttendee = async (id: number): Promise<boolean> => {
    return !!(await knex<Attendee>('attendees')
        .select('id')
        .where({ id })
        .first());
};
