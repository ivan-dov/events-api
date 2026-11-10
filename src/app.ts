import express from 'express';
import { handleNotFound } from './errors/handle-not-found.ts';
import { errorMiddleware } from './errors/middleware.ts';
import { bookingsRouter } from './routes/bookings.ts';
import { eventsRouter } from './routes/events.ts';

export const app = express();

app.use(express.json());
app.use('/events', eventsRouter);
app.use('/bookings', bookingsRouter);
app.use(handleNotFound);
app.use(errorMiddleware);
