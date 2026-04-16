import { Sequelize, DataTypes, Model } from 'sequelize';
import type { InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';

// Usamos SQLite en memoria igual que la H2 de Spring.
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: ':memory:', // Base de datos en memoria
    logging: false
});

// Tipado estricto de los modelos de Sequelize
export interface UserModel extends Model<InferAttributes<UserModel>, InferCreationAttributes<UserModel>> {
    id: CreationOptional<number>;
    refreshToken: string | null;
    nickname: string | null;
}

const User = sequelize.define<UserModel>('User', {
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

export { sequelize, User };
