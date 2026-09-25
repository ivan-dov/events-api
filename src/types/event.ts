export type Event = {
    id: number;
    name: string;
    city: string;
    starts_on: string;
    budget_cents: string;
};

export type CreateEvent = Omit<Event, 'id'>;
