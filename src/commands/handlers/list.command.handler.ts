import {TGCommand} from "../command.decorator";
import {Injectable} from "@nestjs/common";
import {BaseCommandHandler} from "./base.command.handler";
import {ITGCommandHandler, ITGCommandMessage} from "../command.interfaces";
import {Reflector} from "@nestjs/core";
import {StateTelegramService} from "../../telegram/state/state.telegram.service";
import {KafkaProducer} from "../../kafka/kafka.producer";
import {WalletService} from "../../wallet/wallet.service";

@TGCommand("/list")
@Injectable()
export class ListCommandHandler extends BaseCommandHandler implements ITGCommandHandler {
    constructor(
        protected override readonly reflector: Reflector,
        protected override readonly state: StateTelegramService,
        protected override readonly kafka: KafkaProducer,
        protected readonly walletService: WalletService,
    ) {
        super(reflector, state, kafka);
    }

    async handle(msg: ITGCommandMessage) {
        const list: ReadonlyArray<string> = await this.walletService.list(msg.chatId);

        await this.kafka.send("tg.outgoing", {
            chatId: msg.chatId,
            text: `Your wallets:\n\n${list.join("\n")}`,
        });
    }
}
