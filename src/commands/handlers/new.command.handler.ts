import {TGCommand} from "../command.decorator";
import {Injectable} from "@nestjs/common";
import {BaseCommandHandler} from "./base.command.handler";
import {ITGCommandHandler, ITGCommandMessage, ITGCommandState} from "../command.interfaces";
import {Reflector} from "@nestjs/core";
import {StateTelegramService} from "../../telegram/state/state.telegram.service";
import {KafkaProducer} from "../../kafka/kafka.producer";
import {WalletService} from "../../wallet/wallet.service";
import {IExtendedWalletItem} from "../../wallet/wallet.interfaces";

@TGCommand("/new")
@Injectable()
export class NewCommandHandler extends BaseCommandHandler implements ITGCommandHandler {
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

        await this.kafka.send("tg.outgoing", {
            chatId: msg.chatId,
            text: "Enter the name of your new wallet:",
        });
    }

    async checkName(msg: ITGCommandMessage, state: ITGCommandState) {
        if (await this.walletService.nameAlreadyExists(msg.chatId, msg.text)) {
            await this.kafka.send("tg.outgoing", {
                chatId: msg.chatId,
                text: `${msg.text} already exists! Enter another one:`,
            });
            return;
        }

        await this.createWallet(msg, state);
    }

    async createWallet(msg: ITGCommandMessage, state: ITGCommandState) {
        const walletItem: IExtendedWalletItem = await this.walletService.create(
            msg.chatId,
            this.getStateText(msg, state, "SEND_NAME"),
        );
        await this.clearState(msg);

        await this.kafka.send("tg.outgoing", {
            chatId: msg.chatId,
            text: `Wallet was successfully created
Its mnemonic: <span class="tg-spoiler">${walletItem.mnemonic}</span>`,
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
