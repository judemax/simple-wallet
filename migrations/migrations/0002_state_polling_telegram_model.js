module.exports={
    up:async (queryInterface, Sequelize) => {
        await queryInterface.createTable("statePollingTelegram", {
            botId: {
                type: Sequelize.STRING(64),
                allowNull: false,
                primaryKey: true,
            },
            offset: {
                type: Sequelize.BIGINT,
                allowNull: false,
                defaultValue: 0,
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
        await queryInterface.dropTable("statePollingTelegram");
    }
}
