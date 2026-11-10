import { knex } from '../db.ts';

export const getMissingAttendees = async (ids: number[]): Promise<number[]> => {
    const existingAttendees = await knex('attendees')
        .whereIn('id', ids)
        .pluck('id');

    const existingAttendeesSet = new Set(existingAttendees);
    return ids.filter((id) => !existingAttendeesSet.has(id));
};
