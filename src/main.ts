import {NestFactory} from "@nestjs/core";
import {AppModule} from "./app.module";
import {FastifyAdapter, NestFastifyApplication} from "@nestjs/platform-fastify";
import fastify from "fastify";

import "reflect-metadata";
import "es6-shim";

async function bootstrap() {
    const app: NestFastifyApplication = await NestFactory.create<NestFastifyApplication>(
        AppModule,
        new FastifyAdapter(fastify()),
    );

    await app.listen(process.env.LISTEN_PORT, process.env.LISTEN_HOST);
    console.log(`Web server has been started on port ${process.env.LISTEN_PORT}`);
}
bootstrap().catch(console.error);
