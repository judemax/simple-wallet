import {ITGCommandState} from "../../commands/command.interfaces";

export interface IStateTelegramCreationData {
    readonly chatId: string;
    readonly state: ITGCommandState | null;
}
