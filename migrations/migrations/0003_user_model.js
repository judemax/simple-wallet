module.exports= {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable("user", {
            chatId: {
                type: Sequelize.STRING(64),
                primaryKey: true,
                allowNull: false,
            },
            userSalt: {
                type: Sequelize.STRING(64),
                allowNull: false,
            },
            apiKeyHash: {
                type: Sequelize.STRING(64),
                allowNull: false,
                unique: true,
            },
            encrypted: {
                type: Sequelize.TEXT("long"),
                allowNull: false,
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
    down: async (queryInterface) => {
        await queryInterface.dropTable("user");
    }
};
