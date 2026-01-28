import {Inject, Injectable} from "@nestjs/common";
import {TGBOT} from "./tg-bot.provider";
import {TGBot} from "./tgbot.lib";
import {ITGOutgoingMessage} from "../commands/command.interfaces";
import {ITGBaseOptions} from "./tgbot.interfaces";
import {KafkaConsumer} from "../kafka/kafka.consumer.decorator";

@KafkaConsumer("tg.outgoing")
@Injectable()
export class TelegramSendService {
    constructor(
        @Inject(TGBOT) private readonly bot: TGBot,
    ) {}

    async handle<P extends ITGBaseOptions>(msg: ITGOutgoingMessage<P>) {
        await this.bot.sendMessage(msg.text, {
            chat_id: msg.chatId,
            ...msg.options,
        });
    }
}
