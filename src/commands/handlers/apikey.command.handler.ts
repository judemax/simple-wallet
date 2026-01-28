import {TGCommand} from "../command.decorator";
import {Injectable} from "@nestjs/common";
import {BaseCommandHandler} from "./base.command.handler";
import {ITGCommandHandler, ITGCommandMessage} from "../command.interfaces";
import {Reflector} from "@nestjs/core";
import {StateTelegramService} from "../../telegram/state/state.telegram.service";
import {KafkaProducer} from "../../kafka/kafka.producer";
import {UserService} from "../../user/user.service";

@TGCommand("/apikey")
@Injectable()
export class APIKeyCommandHandler extends BaseCommandHandler implements ITGCommandHandler {
    constructor(
        protected override readonly reflector: Reflector,
        protected override readonly state: StateTelegramService,
        protected override readonly kafka: KafkaProducer,
        protected readonly userService: UserService,
    ) {
        super(reflector, state, kafka);
    }

    async handle(msg: ITGCommandMessage) {
        const apiKey: string = await this.userService.getAPIKey(msg.chatId);

        await this.kafka.send("tg.outgoing", {
            chatId: msg.chatId,
            text: `Your API key: <span class="tg-spoiler">${apiKey}</span>`,
        });
    }
}
