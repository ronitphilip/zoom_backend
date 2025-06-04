import { Sequelize, DataTypes, Model, InferAttributes, InferCreationAttributes, ForeignKey } from 'sequelize';
import { Role } from './role.model';
import { Permission } from './permission.model';

export class RolePermission extends Model<InferAttributes<RolePermission>, InferCreationAttributes<RolePermission>> {
  declare roleId: ForeignKey<Role['id']>;
  declare permissionId: ForeignKey<Permission['id']>;
}

export const initRolePermissionModel = (sequelize: Sequelize) => {
  RolePermission.init(
    {
      roleId: {
        type: DataTypes.INTEGER,
        references: {
          model: Role,
          key: 'id',
        },
        primaryKey: true,
      },
      permissionId: {
        type: DataTypes.INTEGER,
        references: {
          model: Permission,
          key: 'id',
        },
        primaryKey: true,
      },
    },
    {
      sequelize,
      modelName: 'RolePermission',
      tableName: 'role_permissions',
      timestamps: false,
    }
  );
};
