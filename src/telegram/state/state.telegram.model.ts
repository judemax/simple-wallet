import {Column, DataType, Model, Table} from "sequelize-typescript";
import {ITGCommandState} from "../../commands/command.interfaces";

@Table({
    tableName: "stateTelegram",
    modelName: "StateTelegramModel",
})
export class StateTelegramModel extends Model<StateTelegramModel> {
    @Column({
        type: DataType.STRING,
        allowNull: false,
        primaryKey: true,
    })
    readonly chatId: string;

    @Column(DataType.JSON)
    readonly state: ITGCommandState;
}
