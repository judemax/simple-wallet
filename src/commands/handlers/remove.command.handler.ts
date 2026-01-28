import {TGCommand} from "../command.decorator";
import {Injectable} from "@nestjs/common";
import {BaseCommandHandler} from "./base.command.handler";
import {ITGCommandHandler, ITGCommandMessage, ITGCommandState} from "../command.interfaces";
import {Reflector} from "@nestjs/core";
import {StateTelegramService} from "../../telegram/state/state.telegram.service";
import {KafkaProducer} from "../../kafka/kafka.producer";
import {WalletService} from "../../wallet/wallet.service";

@TGCommand("/remove")
@Injectable()
export class RemoveCommandHandler extends BaseCommandHandler implements ITGCommandHandler {
    constructor(
        protected override readonly reflector: Reflector,
        protected override readonly state: StateTelegramService,
        protected override readonly kafka: KafkaProducer,
        protected readonly walletService: WalletService,
    ) {
        super(reflector, state, kafka);
    }

    async firstState(msg: ITGCommandMessage) {
        await this.nextStep(msg, "SEND_NAME");

        const list: ReadonlyArray<string> = await this.walletService.list(msg.chatId);

        await this.kafka.send("tg.outgoing", {
            chatId: msg.chatId,
            text: `Your wallets:\n\n${list.join("\n")}\n\nEnter the name of your wallet to remove:`,
        });
    }

    async checkName(msg: ITGCommandMessage, state: ITGCommandState) {
        if (!(await this.walletService.nameAlreadyExists(msg.chatId, msg.text))) {
            await this.kafka.send("tg.outgoing", {
                chatId: msg.chatId,
                text: `${msg.text} not exists! Enter another one:`,
            });
            return;
        }

        await this.removeWallet(msg, state);
    }

    async removeWallet(msg: ITGCommandMessage, state: ITGCommandState) {
        await this.walletService.remove(
            msg.chatId,
            this.getStateText(msg, state, "SEND_NAME"),
        );
        await this.clearState(msg);

        await this.kafka.send("tg.outgoing", {
            chatId: msg.chatId,
            text: "Wallet was successfully removed",
        });
    }

    async handle(msg: ITGCommandMessage, state: ITGCommandState) {
        switch (state?.nextStep) {
            case "SEND_NAME":
                await this.checkName(msg, state);
                break;
            default:
                await this.firstState(msg);
        }
    }
}
