import {Injectable} from "@nestjs/common";
import {InjectModel} from "@nestjs/sequelize";
import {StateTelegramModel} from "./state.telegram.model";
import {ITGCommandState} from "../../commands/command.interfaces";

@Injectable()
export class StateTelegramRepository {
    constructor(
        @InjectModel(StateTelegramModel)
        private readonly model: typeof StateTelegramModel,
    ) {}

    async get(chatId: string): Promise<ITGCommandState | null> {
        const record: StateTelegramModel | null = await this.model.findByPk(chatId, {
            raw: true,
        });
        return record?.state || null;
    }

    async set(chatId: string, state: ITGCommandState): Promise<void> {
        await this.model.upsert({chatId, state});
    }

    async clear(chatId: string): Promise<void> {
        await this.model.destroy({where: {chatId}});
    }
}
