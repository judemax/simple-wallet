module.exports={
    up:async (queryInterface, Sequelize) => {
        await queryInterface.createTable("stateTelegram", {
            chatId: {
                type: Sequelize.STRING(64),
                allowNull: false,
                primaryKey: true,
            },
            state: {
                type: Sequelize.JSON,
                allowNull: true,
            },
            createdAt: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.fn("NOW"),
            },
            updatedAt: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.fn("NOW"),
            },
        });
    },
    down:async (queryInterface) => {
        await queryInterface.dropTable("stateTelegram");
    }
}
