import { app } from './app';
import { toNumber } from './utils/toNumber';

const PORT = toNumber(process.env.PORT) ?? 3000;

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
