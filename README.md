# Events booking API

A REST API for managing corporate events, the people attending them, and the bookings that link the two.
TypeScript, Node, Express, Knex, PostgreSQL.

## Run

    docker compose up -d     # Postgres 16 o
    cp .env.example .env
    npm install
    npm run migrate
    npm run seed
    npm run dev              # http://localhost:3000

## Endpoints

    GET    /health
    GET    /events                 ?city=  &page=  &limit=
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

## Scripts

    npm run dev / build / start
    npm run migrate / rollback / migrate:make <name> / seed
    npm test / npm run lint
