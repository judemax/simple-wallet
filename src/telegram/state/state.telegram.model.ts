import {Column, DataType, Model, Table} from "sequelize-typescript";
import {ITGCommandState} from "../../commands/command.interfaces";
import {IStateTelegramCreationData} from "./state.telegram.interfaces";

@Table({
    tableName: "stateTelegram",
    modelName: "StateTelegramModel",
})
export class StateTelegramModel extends Model<StateTelegramModel, IStateTelegramCreationData> {
    @Column({
        type: DataType.STRING,
        allowNull: false,
        primaryKey: true,
    })
    readonly chatId!: string;

    @Column(DataType.JSON)
    readonly state!: ITGCommandState | null;
}
