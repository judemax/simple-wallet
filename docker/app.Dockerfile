FROM node:24.13.0-alpine

RUN mkdir -p /app
WORKDIR /app/

COPY package.json ./
RUN true && npm i --production

COPY dist/ ./

EXPOSE 4001
CMD node ./src/main.js
