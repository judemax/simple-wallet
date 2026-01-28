import {TGBot} from "./tgbot.lib";
import {Provider} from "@nestjs/common";

export const TGBOT: symbol = Symbol("TGBOT");

export const tgBotProvider: Provider = {
    provide: TGBOT,
    useFactory: () => {
        console.log("[TGBOT] created");
        return new TGBot(process.env.TG_BOT_TOKEN);
    },
};
