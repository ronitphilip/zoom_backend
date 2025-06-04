import { Sequelize, DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional, NonAttribute, BelongsToManySetAssociationsMixin } from 'sequelize';
import { Permission } from './permission.model';

export class Role extends Model<InferAttributes<Role>, InferCreationAttributes<Role>> {
    declare id: CreationOptional<number>;
    declare role: string;
    declare permissions?: NonAttribute<Permission[]>;
    declare setPermissions: BelongsToManySetAssociationsMixin<Permission, number>;
}

export const initRoleModel = (sequelize: Sequelize) => {
    Role.init(
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            role: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
            }
        },
        {
            sequelize,
            modelName: 'Role',
            tableName: 'roles',
            timestamps: false,
        }
    )
}