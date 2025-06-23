import { Sequelize, DataTypes, Model, CreationOptional } from 'sequelize';

export class AgentTimecard extends Model {
    declare id: CreationOptional<number>;
    declare work_session_id: string;
    declare start_time: string;
    declare end_time: string;
    declare user_id: string;
    declare user_name: string;
    declare user_status: string;
    declare user_sub_status: string;
    declare duration: number;
}

export const initAgentTimecardModel = (sequelize: Sequelize) => {
    AgentTimecard.init({
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        work_session_id: { type: DataTypes.STRING },
        start_time: { type: DataTypes.STRING },
        end_time: { type: DataTypes.STRING },
        user_id: { type: DataTypes.STRING },
        user_name: { type: DataTypes.STRING },
        user_status: { type: DataTypes.STRING },
        user_sub_status: { type: DataTypes.STRING },
        duration: { type: DataTypes.INTEGER },
    }, {
        sequelize,
        modelName: 'AgentTimecard',
        tableName: 'agentTimecard',
        timestamps: false,
    })
}
