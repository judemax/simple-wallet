import {ITGBaseOptions, ITGUpdate} from "../telegram/tgbot.interfaces";

export interface ITGCommandMessage {
    readonly botId: string;
    readonly chatId: string;
    readonly text: string;
    readonly messageId: number;
    readonly raw: ITGUpdate;
}

export interface ITGCommandPrevStep {
    readonly step: string;
    readonly text: string;
}

export interface ITGCommandState {
    readonly command: string;
    readonly nextStep?: string;
    readonly prev: ReadonlyArray<ITGCommandPrevStep>;
}

export interface ITGCommandHandler {
    handle(
        message: ITGCommandMessage,
        state?: ITGCommandState,
    ): Promise<void>;
}

export interface ITGOutgoingMessage<P extends ITGBaseOptions> {
    readonly chatId: string;
    readonly text: string;
    readonly options?: P;
}
