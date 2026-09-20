export type Event = {
  id: number;
  name: string;
  city: string;
  starts_on: Date;
  budget_cents: number;
};

export type CreateEvent = Omit<Event, "id">;
