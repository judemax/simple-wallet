import {Injectable, OnModuleInit} from "@nestjs/common";
import {ITGCommandHandler} from "./command.interfaces";
import {DiscoveryService, Reflector} from "@nestjs/core";
import {TG_COMMAND} from "./command.decorator";
import {InstanceWrapper} from "@nestjs/core/injector/instance-wrapper";

@Injectable()
export class TGCommandRegistryService implements OnModuleInit {
    private readonly handlers: Map<string, ITGCommandHandler> = new Map();

    constructor(
        private readonly discovery: DiscoveryService,
        private readonly reflector: Reflector,
    ) {}

    onModuleInit() {
        const providers: InstanceWrapper[] = this.discovery.getProviders();
        for (const wrapper of providers) {
            if (!wrapper.instance) {
                continue;
            }

            const command: string = this.reflector.get<string>(
                TG_COMMAND,
                wrapper.instance.constructor,
            );
            if (!command) {
                continue;
            }

            this.handlers.set(command, wrapper.instance);
        }

        console.log(
            "[TG] commands registered:",
            [...this.handlers.keys()],
        );
    }

    get(command: string): ITGCommandHandler | undefined {
        return this.handlers.get(command);
    }
}
