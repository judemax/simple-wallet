import {Inject, Injectable, OnModuleDestroy, OnModuleInit} from "@nestjs/common";
import {TGBot} from "../tgbot.lib";
import {StatePollingTelegramService} from "./state.polling.telegram.service";
import {ITGGetUpdates} from "../tgbot.interfaces";
import {TGBOT} from "../tg-bot.provider";

@Injectable()
export class PollingTelegramService implements OnModuleInit, OnModuleDestroy {
    private running: boolean = false;

    constructor(
        @Inject(TGBOT) private readonly bot: TGBot,
        private readonly state: StatePollingTelegramService,
    ) {}

    onModuleInit() {
        this.running = true;
        this.loop().catch((err: Error) => {
            console.error(err);
            process.exit(1);
        });
    }

    onModuleDestroy() {
        this.running = false;
    }

    private async loop() {
        const botId: string = this.bot.getBotId();

        let offset: number = await this.state.get(botId);

        while (this.running) {
            try {
                const result: ITGGetUpdates | null = await this.bot.getUpdates(offset);

                if (!result?.ok || !result.result?.length) {
                    await this.sleep(1000);
                    continue;
                }

                for (const update of result.result) {
                    offset = update.update_id + 1;
                    await this.state.set(botId, offset);
                    await this.bot.emit(update);
                }
            } catch (err) {
                console.error("[TG polling error]", err);
            }
            await this.sleep(1000);
        }
    }

    private sleep(ms: number) {
        return new Promise(r => setTimeout(r, ms));
    }
}
