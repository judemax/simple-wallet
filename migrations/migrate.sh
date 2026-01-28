#!/usr/bin/env sh
set -e

echo "Waiting for Postgres at ${DB_HOST}:${DB_PORT}..."

until nc -z "$DB_HOST" "$DB_PORT"; do
sleep 2
done

echo "Postgres is available. Running migrations..."

npx sequelize-cli --env local db:migrate
