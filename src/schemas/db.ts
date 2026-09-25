import z from 'zod';

export const DbBigintSchema = z
    .string()
    .regex(/^-?\d+$/, { error: 'Invalid BigInt format' })
    .transform(BigInt)
    .pipe(z.bigint().max(9223372036854775807n).min(-9223372036854775808n));
