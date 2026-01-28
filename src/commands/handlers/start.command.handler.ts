import {Injectable} from "@nestjs/common";
import {ITGCommandHandler, ITGCommandMessage} from "../command.interfaces";
import {TGCommand} from "../command.decorator";
import {BaseCommandHandler} from "./base.command.handler";
import {Reflector} from "@nestjs/core";
import {StateTelegramService} from "../../telegram/state/state.telegram.service";
import {KafkaProducer} from "../../kafka/kafka.producer";
import {UserService} from "../../user/user.service";

@TGCommand("/start")
@Injectable()
export class StartCommandHandler extends BaseCommandHandler implements ITGCommandHandler {
    constructor(
        protected override readonly reflector: Reflector,
        protected override readonly state: StateTelegramService,
        protected override readonly kafka: KafkaProducer,
        protected readonly userService: UserService,
    ) {
        super(reflector, state, kafka);
    }

    async handle(msg: ITGCommandMessage) {
        await this.userService.getByChatId(msg.chatId);

        await this.kafka.send("tg.outgoing", {
            chatId: msg.chatId,
            text: "Welcome",
        });
    }
}
