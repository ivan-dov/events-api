# Events booking API

A REST API for managing corporate events, the people attending them, and the bookings that link the two.
TypeScript, Node, Express, Knex, PostgreSQL.

## Run

    docker compose up -d     # Postgres 16 on :5432
    cp .env.example .env
    npm install
    npm run migrate
    npm run seed
    npm run dev              # http://localhost:3000

## Scripts

    npm run dev / build / start
    npm run migrate / rollback / migrate:make <name> / seed
    npm test / npm run lint

## Endpoints

    GET    /events                 ?city=  &limit=  &offset=
    GET    /events/:id
    GET    /events/:id/attendees
    POST   /events                 event + bookings, transactional
    POST   /bookings
    PATCH  /events/:id
    DELETE /events/:id

## Schema

    events     id, name, city, starts_on, budget_cents
    attendees  id, full_name, department
    bookings   id, event_id → events, attendee_id → attendees,
               status (confirmed | pending | cancelled), cost_cents
               unique (event_id, attendee_id)

## About

- `app.ts` builds and exports the Express app and never starts it, `server.ts` does. The separation allows to import and test the app without launching it.
- `Zod` schemas are the single source of truth for both validation and typing.
- Integration tests against real Postgres with a separate `events_test` database, truncated and reseeded per test.

## Error Handling

- Application has a single global `errorMiddleware`, it's a global error catcher transforming errors to appropriate error response.
- `ConflictError` class represents DB conflicts and handled by `errorMiddleware`.
- `NetworkError` class and its catalogue of subclasses serve as a unified shape for the entire app and handled by the `errorMiddleware`.
- `errorMiddleware` automatically handles `ZodError`, body JSON parsing errors, `Error` with `status` that is in range between `400` and `600`.
- In all other cases it fallbacks to treating the error as an unidentified `InternalError`.

## Database

- `db.ts` holds a single Knex instance and a single connections pool.
- Money stored as `bigint` because `integer` caps at ~$21.5M. The values represented by strings so not to lose precision.
- By default, `pg` uses `Date` class for dates which inherits the timezone of the server and treats the dates as local midnight which is undesirable. Thus, the parser is set as a passthrough to parse date as strings (e.g. `2027-02-22`).
