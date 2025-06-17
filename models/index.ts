import { Sequelize } from 'sequelize';
import { initUserModel, User } from './user.model';
import { initRoleModel, Role } from './role.model';
import { initZoomUserModel, ZoomUser } from './zoom.model';

const initModels = (sequelize: Sequelize) => {
    initRoleModel(sequelize);
    initUserModel(sequelize);
    initZoomUserModel(sequelize)

    Role.hasMany(User, { foreignKey: 'roleId', as: 'users' });
    User.belongsTo(Role, { foreignKey: 'roleId', as: 'role' });
    
    ZoomUser.belongsTo(User, { foreignKey: 'userId', as: 'user' });
    User.hasOne(ZoomUser, { foreignKey: 'userId', as: 'zoomUser' });

};

export default initModels;
