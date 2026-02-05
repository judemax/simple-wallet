import {Test, TestingModule} from "@nestjs/testing";
import {SequelizeModule} from "@nestjs/sequelize";
import {UserModel} from "../src/user/user.model";
import {WalletModel} from "../src/wallet/wallet.model";
import {UserModule} from "../src/user/user.module";
import {WalletModule} from "../src/wallet/wallet.module";
import {REDIS} from "../src/redis/redis.module";
import {FastifyAdapter, NestFastifyApplication} from "@nestjs/platform-fastify";
import {INestApplication, ValidationPipe} from "@nestjs/common";
import {RedisClientType} from "redis";
import {ApiModule} from "../src/api/api.module";
import {CryptoModule} from "../src/crypto/crypto.module";
import {HttpExceptionFilter} from "../src/common/filters/http.exception.filter";

export async function getTestingApp(): Promise<INestApplication> {
    const redis: jest.Mocked<RedisClientType> = {
        get: jest.fn(),
        set: jest.fn(),
        del: jest.fn(),
    } as any;

    const moduleRef: TestingModule = await Test.createTestingModule({
        imports: [
            SequelizeModule.forRoot({
                dialect: "sqlite",
                storage: ":memory:",
                autoLoadModels: true,
                synchronize: true,
                models: [
                    UserModel,
                    WalletModel,
                ],
            }),
            ApiModule,
            CryptoModule,
            UserModule,
            WalletModule,
        ],
    })
        .overrideProvider(REDIS)
        .useValue(redis)
        .compile();

    const app: INestApplication = moduleRef.createNestApplication<NestFastifyApplication>(
        new FastifyAdapter(),
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
    app.useGlobalFilters(new HttpExceptionFilter());

    app.useGlobalPipes(new ValidationPipe({
        whitelist: true,
        transform: true,
    }));

    await app.init();
    await app.getHttpAdapter().getInstance().ready();

    return app;
}
