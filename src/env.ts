import z from 'zod';

const EnvSchema = z.object({
    NODE_ENV: z.enum(['development', 'test']).default('development'),
    PORT: z.coerce.number().int().positive().default(3000),
    DATABASE_URL: z.url().optional(),
    TEST_DATABASE_URL: z.url().optional(),
});

const parsed = EnvSchema.safeParse(process.env);

if (!parsed.success) {
    // Bad config is unrecoverable, fail at startup.
    console.error('Invalid environment variables:');
    console.error(z.prettifyError(parsed.error));
    process.exit(1);
}

export const env = parsed.data;
