export type BookingStatus = 'confirmed' | 'cancelled' | 'pending';

export type Booking = {
    id: number;
    event_id: number;
    attendee_id: number;
    status: BookingStatus;
    cost_cents: number;
};

export type CreateBooking = Omit<Booking, 'id'>;
