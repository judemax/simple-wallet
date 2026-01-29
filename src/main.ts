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

    app.setGlobalPrefix("api");

    app.enableCors({
        origin: "*",
        allowedHeaders: [
            "Content-Type",
            "X-Key",
        ],
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    });

    app.getHttpAdapter().getInstance().decorateRequest("user", null);

    await app.listen(process.env.LISTEN_PORT, process.env.LISTEN_HOST);
    console.log(`Web server has been started on ${process.env.LISTEN_HOST}:${process.env.LISTEN_PORT}`);
}
bootstrap().catch(console.error);
