module.exports= {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable("wallet", {
            id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
            },
            chatId: {
                type: Sequelize.STRING(64),
                allowNull: false,
            },
            name: {
                type: Sequelize.STRING(64),
                allowNull: false,
            },
            walletSalt: {
                type: Sequelize.STRING(64),
                allowNull: false,
            },
            mnemonicHash: {
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
        await queryInterface.addIndex("wallet", ["chatId"]);
        await queryInterface.addIndex("wallet", ["chatId","name"]);
    },
    down: async (queryInterface) => {
        await queryInterface.dropTable("wallet");
    }
};
