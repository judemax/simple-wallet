import {Injectable} from "@nestjs/common";
import {InjectModel} from "@nestjs/sequelize";
import {StatePollingTelegramModel} from "./state.polling.telegram.model";

@Injectable()
export class StatePollingTelegramRepository {
    constructor(
        @InjectModel(StatePollingTelegramModel)
        private readonly model: typeof StatePollingTelegramModel,
    ) {}

    async get(botId: string): Promise<number> {
        const record: StatePollingTelegramModel | null = await this.model.findByPk(botId, {
            raw: true,
        });
        return record?.offset || 0;
    }

    async set(botId: string, offset: number): Promise<void> {
        await this.model.upsert({botId, offset});
    }

    async clear(botId: string): Promise<void> {
        await this.model.destroy({where: {botId}});
    }
}
