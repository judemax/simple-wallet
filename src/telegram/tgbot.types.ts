import {ITGUpdate} from "./tgbot.interfaces";

export type TTGCB = (upd: ITGUpdate) => Promise<void>;
