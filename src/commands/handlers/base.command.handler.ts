import {StateTelegramService} from "../../telegram/state/state.telegram.service";
import {KafkaProducer} from "../../kafka/kafka.producer";
import {TG_COMMAND} from "../command.decorator";
import {Reflector} from "@nestjs/core";
import {ITGCommandMessage, ITGCommandPrevStep, ITGCommandState} from "../command.interfaces";
import {Injectable} from "@nestjs/common";
import {AssertionUtils} from "../../utils/assertion.utils";

@Injectable()
export class BaseCommandHandler {
    constructor(
        protected readonly reflector: Reflector,
        protected readonly state: StateTelegramService,
        protected readonly kafka: KafkaProducer,
    ) {}

    getCommand(): string {
        const command: string = this.reflector.get(TG_COMMAND, this.constructor);
        AssertionUtils.doesTGDecoratorExist(command);
        return command;
    }

    async nextStep(msg: ITGCommandMessage, nextStep: string) {
        const prev: ITGCommandState | null = await this.state.get(msg.chatId);

        await this.state.set(msg.chatId, {
            command: this.getCommand(),
            nextStep,
            prev: [...(prev?.prev || []), {step: prev?.nextStep || "INIT", text: msg.text}],
        });
    }

    async clearState(msg: ITGCommandMessage) {
        await this.state.clear(msg.chatId);
    }

    getStateText(msg: ITGCommandMessage, state: ITGCommandState, name: string): string {
        AssertionUtils.doesStateExist(state);
        if (state.nextStep === name) {
            return msg.text;
        }
        const step: ITGCommandPrevStep | undefined = state.prev.findLast(s => s.step === name);
        AssertionUtils.doesStepExist(step);
        return step.text;
    }
}
