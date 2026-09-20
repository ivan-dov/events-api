export type Event = {
    id: number;
    name: string;
    city: string;
    starts_on: string;
    budget_cents: number;
};

export type CreateEvent = Omit<Event, 'id'>;
