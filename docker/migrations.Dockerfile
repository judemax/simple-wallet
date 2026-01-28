FROM node:24.13.0-alpine

RUN mkdir -p /mig
WORKDIR /mig/

RUN npm install --no-save dotenv sequelize pg sequelize-cli

COPY .sequelizerc ./
RUN mkdir -p ./migrations/migrations
COPY migrations/migrations/ ./migrations/migrations/
COPY migrations/config.js ./migrations/
COPY migrations/migrate.sh ./migrations/
