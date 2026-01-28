import {tgBotProvider} from "./tg-bot.provider";
import {Global, Module} from "@nestjs/common";
import {TelegramUpdateService} from "./telegram-update.service";
import {TelegramSendService} from "./telegram-send.service";

@Global()
@Module({
    providers: [
        tgBotProvider,
        TelegramUpdateService,
        TelegramSendService,
    ],
    exports: [tgBotProvider, TelegramUpdateService],
})
export class TelegramModule {}
