import {Module} from "@nestjs/common";
import {SequelizeModule} from "@nestjs/sequelize";
import {TelegramModule} from "./telegram/telegram.module";
import {RedisModule} from "./redis/redis.module";
import {KafkaModule} from "./kafka/kafka.module";
import {StateTelegramModule} from "./telegram/state/state.telegram.module";
import {WalletModule} from "./wallet/wallet.module";
import {CommandsModule} from "./commands/commands.module";
import {StatePollingTelegramModule} from "./telegram/polling/state.polling.telegram.module";
import {CryptoModule} from "./crypto/crypto.module";
import {UserModule} from "./user/user.module";

@Module({
    imports: [
        SequelizeModule.forRoot({
            dialect: "postgres",
            host: process.env.DB_HOST,
            port: parseInt(process.env.DB_PORT || "5432"),
            username: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_NAME,
            autoLoadModels: true,
            synchronize: false,
            logging: process.env.DEBUG === "true" ? console.log : false,
        }),
        RedisModule,
        KafkaModule,
        CryptoModule,
        TelegramModule,
        StateTelegramModule,
        CommandsModule,
        WalletModule,
        UserModule,
        StatePollingTelegramModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule {}
