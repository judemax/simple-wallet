import {Module} from "@nestjs/common";
import {SequelizeModule} from "@nestjs/sequelize";
import {RedisModule} from "../../redis/redis.module";
import {StatePollingTelegramModel} from "./state.polling.telegram.model";
import {StatePollingTelegramRepository} from "./state.polling.telegram.repository";
import {PollingTelegramService} from "./polling.telegram.service";
import {StatePollingTelegramService} from "./state.polling.telegram.service";

@Module({
    imports: [
        SequelizeModule.forFeature([StatePollingTelegramModel]),
        RedisModule,
    ],
    providers: [
        PollingTelegramService,
        StatePollingTelegramService,
        StatePollingTelegramRepository,
    ],
    exports: [PollingTelegramService, StatePollingTelegramService],
})
export class StatePollingTelegramModule {}
