import { Sequelize } from 'sequelize';
import { initUserModel, User } from './user.model';
import { initRoleModel, Role } from './role.model';

const initModels = (sequelize: Sequelize) => {
    initRoleModel(sequelize);
    initUserModel(sequelize);

    Role.hasMany(User, { foreignKey: 'roleId', as: 'users' });
    User.belongsTo(Role, { foreignKey: 'roleId', as: 'role' });

};

export default initModels;
