import express from 'express';
import { bookingsRouter } from './routes/bookings';
import { eventsRouter } from './routes/events';

export const app = express();

app.use(express.json());
app.use('/events', eventsRouter);
app.use('/bookings', bookingsRouter);
