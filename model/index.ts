import { Sequelize } from 'sequelize';
import { initUserModel, User } from './user.model';
import { initRoleModel, Role } from './role.model';
import { initPermissionModel, Permission } from './permission.model';
import { initRolePermissionModel, RolePermission } from './rolePermission.model';

const initModels = (sequelize: Sequelize) => {
    initRoleModel(sequelize);
    initUserModel(sequelize);
    initPermissionModel(sequelize);
    initRolePermissionModel(sequelize);

    Role.hasMany(User, { foreignKey: 'roleId', as: 'users' });
    User.belongsTo(Role, { foreignKey: 'roleId', as: 'role' });

    Role.belongsToMany(Permission, {
        through: RolePermission,
        foreignKey: 'roleId',
        otherKey: 'permissionId',
        as: 'permissions'
    });

    Permission.belongsToMany(Role, {
        through: RolePermission,
        foreignKey: 'permissionId',
        otherKey: 'roleId',
        as: 'roles'
    });
};

export default initModels;
