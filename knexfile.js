/** @type {import("knex").Knex.Config} */
module.exports = {
  client: "pg",
  connection:
    process.env.DATABASE_URL ?? "postgres://postgres:pw@localhost:5432/events",
  migrations: { directory: "./migrations" },
  seeds: { directory: "./seeds" },
};
