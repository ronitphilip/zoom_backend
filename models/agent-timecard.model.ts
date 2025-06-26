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
    declare team_id: string;
    declare team_name: string;
    declare not_ready_duration?: number;
    declare ready_duration?: number;
    declare occupied_duration?: number;
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
        team_id: { type: DataTypes.STRING },
        team_name: { type: DataTypes.STRING },
        not_ready_duration: { type: DataTypes.INTEGER, allowNull: true },
        ready_duration: { type: DataTypes.INTEGER, allowNull: true },
        occupied_duration: { type: DataTypes.INTEGER, allowNull: true },
    }, {
        sequelize,
        modelName: 'AgentTimecard',
        tableName: 'agentTimecard',
        timestamps: false,
    });
};