import {Injectable} from "@nestjs/common";
import {StateTelegramService} from "../telegram/state/state.telegram.service";
import {ITGCommandHandler, ITGCommandMessage, ITGCommandState} from "./command.interfaces";
import {KafkaConsumer} from "../kafka/kafka.consumer.decorator";
import {TGCommandRegistryService} from "./command.registry.service";
import {AssertionUtils} from "../utils/assertion.utils";
import {AssertionError} from "../utils/assertion";
import {KafkaProducer} from "../kafka/kafka.producer";

@KafkaConsumer("tg.incoming")
@Injectable()
export class CommandRouter {
    constructor(
        private readonly state: StateTelegramService,
        protected readonly registry: TGCommandRegistryService,
        protected readonly kafka: KafkaProducer,
    ) {}

    private async handleCommand(msg: ITGCommandMessage, state?: ITGCommandState) {
        const command: string = state?.command || msg.text.split(/\s+/)[0];
        const handler: ITGCommandHandler = this.registry.get(command);
        AssertionUtils.isCommandKnown(handler, command);
        await handler.handle(msg, state);
    }

    private async handleError<E>(err: E, msg: ITGCommandMessage) {
        console.error("[TG] command error", {
            chatId: msg.chatId,
            text: msg.text,
            err,
        });

        const text: string = err instanceof AssertionError
            ? `Error: ${err.message} \n Code: ${err.code}`
            : err instanceof Error
                ? `Error: ${err.message}` : "Error occurred.";

        await this.kafka.send("tg.outgoing", {
            chatId: msg.chatId,
            text,
        });
    }

    async handle(msg: ITGCommandMessage) {
        try {
            if (msg.text.startsWith("/")) {
                await this.state.clear(msg.chatId);
                await this.handleCommand(msg);
                return;
            }

            const state: ITGCommandState = await this.state.get(msg.chatId);
            if (!state) {
                return;
            }

            await this.handleCommand(msg, state);
        } catch (err) {
            await this.handleError(err, msg);
        }
    }
}
