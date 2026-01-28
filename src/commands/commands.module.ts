import {Module} from "@nestjs/common";
import {WalletModule} from "../wallet/wallet.module";
import {AddCommandHandler} from "./handlers/add.command.handler";
import {CommandRouter} from "./command.router";
import {StateTelegramModule} from "../telegram/state/state.telegram.module";
import {StartCommandHandler} from "./handlers/start.command.handler";
import {TGCommandRegistryService} from "./command.registry.service";
import {DiscoveryModule} from "@nestjs/core";
import {UserModule} from "../user/user.module";
import {APIKeyCommandHandler} from "./handlers/apikey.command.handler";
import {KafkaModule} from "../kafka/kafka.module";
import {NewCommandHandler} from "./handlers/new.command.handler";
import {ListCommandHandler} from "./handlers/list.command.handler";
import {RemoveCommandHandler} from "./handlers/remove.command.handler";

@Module({
    imports: [
        StateTelegramModule,
        UserModule,
        WalletModule,
        DiscoveryModule,
        KafkaModule,
    ],
    providers: [
        AddCommandHandler,
        APIKeyCommandHandler,
        ListCommandHandler,
        NewCommandHandler,
        RemoveCommandHandler,
        StartCommandHandler,
        CommandRouter,
        TGCommandRegistryService,
    ],
    exports: [TGCommandRegistryService],
})
export class CommandsModule {}
