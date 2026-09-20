export type Attendee = {
    id: number;
    full_name: string;
    department: string;
};

export type CreateAttendee = Omit<Attendee, 'id'>;
