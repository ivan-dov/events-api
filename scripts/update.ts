// Non-destructive: create what is missing, migrate, seed only if empty.
import { main } from './steps.ts';

main({ skipUnneeded: true });
