import { Sequelize, DataTypes, Model } from 'sequelize';
import type { InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

// Usamos por el momento un SQLite en memoria 
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: ':memory:',
    logging: false
});

// Por el momento, solo tenemos el model de usuario para realizar la autenticación en lugar de delegar a la API REST Spring.
export interface UserModel extends Model<InferAttributes<UserModel>, InferCreationAttributes<UserModel>> {
    id: CreationOptional<number>;
    refreshToken: string | null;
    nickname: string | null;
}

export async function getUser(playerId: number): Promise<UserModel> {
    const user = await User.findByPk(playerId) ?? await User.create({
        nickname: `Trainer${String(playerId).padStart(4, '0')}`,
        refreshToken: uuidv4(),
    });
    return user;
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
