import { Sequelize } from 'sequelize';
import { initUserModel } from './user.model';

const initModels = async (sequelize: Sequelize) => {
    initUserModel(sequelize);
};

export default initModels;