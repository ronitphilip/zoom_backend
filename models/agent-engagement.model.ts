import { Sequelize, DataTypes, Model, CreationOptional } from 'sequelize';

export class AgentEngagement extends Model {
    declare id: CreationOptional<number>;
    declare engagement_id: string;
    declare direction: string;
    declare start_time: string;
    declare end_time: string;
    declare enter_channel: string;
    declare enter_channel_source: string;
    declare channel: string;
    declare channel_source: string;
    declare consumer: string;
    declare dnis: string;
    declare ani: string;
    declare queue_id: string;
    declare queue_name: string;
    declare user_id: string;
    declare user_name: string;
    declare duration: number;
    declare hold_count: number;
    declare warm_transfer_initiated_count: number;
    declare warm_transfer_completed_count: number;
    declare direct_transfer_count: number;
    declare transfer_initiated_count: number;
    declare transfer_completed_count: number;
    declare warm_conference_count: number;
    declare conference_count: number;
    declare abandoned_count: number;
}

export const initAgentEngagementModel = (sequelize: Sequelize) => {
    AgentEngagement.init({
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        engagement_id: {
            type: DataTypes.STRING,
            unique: true,
        },
        direction: { type: DataTypes.STRING },
        start_time: { type: DataTypes.STRING },
        end_time: { type: DataTypes.STRING },
        enter_channel: { type: DataTypes.STRING },
        enter_channel_source: { type: DataTypes.STRING },
        channel: { type: DataTypes.STRING },
        channel_source: { type: DataTypes.STRING },
        consumer: { type: DataTypes.STRING },
        dnis: { type: DataTypes.STRING },
        ani: { type: DataTypes.STRING },
        queue_id: { type: DataTypes.STRING },
        queue_name: { type: DataTypes.STRING },
        user_id: { type: DataTypes.STRING },
        user_name: { type: DataTypes.STRING },
        duration: { type: DataTypes.INTEGER },
        hold_count: { type: DataTypes.INTEGER },
        warm_transfer_initiated_count: { type: DataTypes.INTEGER },
        warm_transfer_completed_count: { type: DataTypes.INTEGER },
        direct_transfer_count: { type: DataTypes.INTEGER },
        transfer_initiated_count: { type: DataTypes.INTEGER },
        transfer_completed_count: { type: DataTypes.INTEGER },
        warm_conference_count: { type: DataTypes.INTEGER },
        conference_count: { type: DataTypes.INTEGER },
        abandoned_count: { type: DataTypes.INTEGER },
    }, {
        sequelize,
        modelName: 'AgentEngagement',
        tableName: 'agentEngagement',
        timestamps: false,
    });
};