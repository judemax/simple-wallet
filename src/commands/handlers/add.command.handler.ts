import {Injectable} from "@nestjs/common";
import {StateTelegramService} from "../../telegram/state/state.telegram.service";
import {ITGCommandHandler, ITGCommandMessage, ITGCommandState} from "../command.interfaces";
import {KafkaProducer} from "../../kafka/kafka.producer";
import {WalletService} from "../../wallet/wallet.service";
import {TGCommand} from "../command.decorator";
import {BaseCommandHandler} from "./base.command.handler";
import {Reflector} from "@nestjs/core";

@TGCommand("/add")
@Injectable()
export class AddCommandHandler extends BaseCommandHandler implements ITGCommandHandler {
    constructor(
        protected override readonly reflector: Reflector,
        protected override readonly state: StateTelegramService,
        protected override readonly kafka: KafkaProducer,
        protected readonly walletService: WalletService,
    ) {
        super(reflector, state, kafka);
    }

    async firstState(msg: ITGCommandMessage) {
        await this.nextStep(msg, "CHECK_MNEMONIC");

        await this.kafka.send("tg.outgoing", {
            chatId: msg.chatId,
            text: "Enter your mnemonic phrase:",
            options: {
                reply_markup: {
                    remove_keyboard: true,
                },
            },
        });
    }

    async checkMnemonicState(msg: ITGCommandMessage) {
        if (await this.walletService.mnemonicAlreadyExists(msg.text)) {
            await this.kafka.send("tg.outgoing", {
                chatId: msg.chatId,
                text: "You cannot add this wallet!",
            });
            return;
        }
        if (!this.walletService.correctMnemonic(msg.text)) {
            await this.kafka.send("tg.outgoing", {
                chatId: msg.chatId,
                text: "Your mnemonic phrase is incorrect! Enter another one:",
            });
            return;
        }
        if (!this.walletService.fullyCorrectMnemonic(msg.text)) {
            await this.nextStep(msg, "BYPASS_CORRECTION");

            await this.kafka.send("tg.outgoing", {
                chatId: msg.chatId,
                text: "Your mnemonic phrase has an invalid checksum!\nWould you like to use it?",
                options: {
                    reply_markup: {
                        keyboard: [
                            [{text: "Yes"}, {text: "No"}],
                        ],
                        resize_keyboard: true,
                        one_time_keyboard: true,
                    },
                },
            });
            return;
        }
        await this.sendNameOfWallet(msg);
    }

    async bypassCorrection(msg: ITGCommandMessage) {
        if (msg.text !== "Yes") {
            await this.firstState(msg);
            return;
        }
        await this.sendNameOfWallet(msg);
    }

    async sendNameOfWallet(msg: ITGCommandMessage) {
        await this.nextStep(msg, "SEND_NAME");
        await this.kafka.send("tg.outgoing", {
            chatId: msg.chatId,
            text: "Enter the name of your wallet:",
            options: {
                reply_markup: {
                    remove_keyboard: true,
                },
            },
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

        await this.addWallet(msg, state);
    }

    async addWallet(msg: ITGCommandMessage, state: ITGCommandState) {
        await this.walletService.add(
            msg.chatId,
            this.getStateText(msg, state, "CHECK_MNEMONIC"),
            this.getStateText(msg, state, "SEND_NAME"),
        );
        await this.clearState(msg);

        await this.kafka.send("tg.outgoing", {
            chatId: msg.chatId,
            text: "Your wallet added successfully",
        });
    }

    async handle(msg: ITGCommandMessage, state: ITGCommandState) {
        switch (state?.nextStep) {
            case "CHECK_MNEMONIC":
                await this.checkMnemonicState(msg);
                break;
            case "BYPASS_CORRECTION":
                await this.bypassCorrection(msg);
                break;
            case "SEND_NAME":
                await this.checkName(msg, state);
                break;
            default:
                await this.firstState(msg);
        }
    }
}
