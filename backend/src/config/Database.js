const { Sequelize, DataTypes } = require('sequelize');

// Usamos SQLite en memoria para que sea agnóstico y fácil de arrancar, igual que la H2 de Spring.
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: ':memory:', // Base de datos en memoria
    logging: false
});

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    refreshToken: {
        type: DataTypes.STRING(500),
        allowNull: true
    },
    nickname: {
        type: DataTypes.STRING(100),
        allowNull: true
    }
}, {
    tableName: 'app_user',
    timestamps: false
});

module.exports = { sequelize, User };