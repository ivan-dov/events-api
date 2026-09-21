import z from 'zod';
import { app } from './app';

const portParse = z.coerce
    .number(process.env.PORT)
    .int()
    .positive()
    .safeParse(process.env.PORT);

if (!portParse.success) {
    console.error('PORT env var errors', portParse.error.issues);
}

const PORT = portParse.data ?? 3000;

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
