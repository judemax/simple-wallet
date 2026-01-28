import {Inject, Injectable} from "@nestjs/common";
import {TGBOT} from "./tg-bot.provider";
import {TGBot} from "./tgbot.lib";
import {ITGUpdate} from "./tgbot.interfaces";
import {ITGCommandMessage} from "../commands/command.interfaces";
import {KafkaProducer} from "../kafka/kafka.producer";

@Injectable()
export class TelegramUpdateService {
    constructor(
        @Inject(TGBOT) private readonly bot: TGBot,
        private readonly kafka: KafkaProducer,
    ) {}

    onModuleInit() {
        this.bot.onMessage(this.handle.bind(this));
    }

    async handle(upd: ITGUpdate) {
        const event: ITGCommandMessage = {
            botId: this.bot.getBotId(),
            chatId: upd.message.chat.id.toString(),
            text: upd.message.text,
            messageId: upd.message.message_id,
            raw: upd,
        };
        await this.kafka.send("tg.incoming", event);
    }
}
