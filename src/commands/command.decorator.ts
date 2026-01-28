import {SetMetadata} from "@nestjs/common";

export const TG_COMMAND: string = "TG_COMMAND";

export const TGCommand = (command: string): ClassDecorator =>
    SetMetadata(TG_COMMAND, command);
