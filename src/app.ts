import express from 'express';
import { eventsRouter } from './routes/events';

export const app = express();

app.use(express.json());
app.use('/events', eventsRouter);
