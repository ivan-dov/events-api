import express from 'express';
import { handleNotFound } from './errors/handle-not-found';
import { errorMiddleware } from './errors/middleware';
import { bookingsRouter } from './routes/bookings';
import { eventsRouter } from './routes/events';

export const app = express();

app.use(express.json());
app.use('/events', eventsRouter);
app.use('/bookings', bookingsRouter);
app.use(handleNotFound);
app.use(errorMiddleware);
