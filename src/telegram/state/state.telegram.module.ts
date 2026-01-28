import {Module} from "@nestjs/common";
import {SequelizeModule} from "@nestjs/sequelize";
import {StateTelegramModel} from "./state.telegram.model";
import {StateTelegramService} from "./state.telegram.service";
import {StateTelegramRepository} from "./state.telegram.repository";
import {RedisModule} from "../../redis/redis.module";

@Module({
    imports: [
        SequelizeModule.forFeature([StateTelegramModel]),
        RedisModule,
    ],
    providers: [
        StateTelegramService,
        StateTelegramRepository,
    ],
    exports: [StateTelegramService],
})
export class StateTelegramModule {}
