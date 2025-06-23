import { Sequelize, DataTypes, Model, CreationOptional } from 'sequelize';

export class AgentPerformance extends Model {
    declare id: CreationOptional<number>;
    declare engagement_id: string;
    declare start_time: string;
    declare direction: string;
    declare user_id: string;
    declare user_name: string;
    declare channel: string;
    declare channel_source: string;
    declare queue_name: string;
    declare handle_duration: number;
    declare direct_transfer_count: number;
    declare agent_offered_count: number;
    declare agent_refused_count: number;
    declare agent_missed_count: number;
    declare agent_declined_count: number;
    declare hold_count: number;
    declare hold_duration: number;
    declare wrap_up_duration: number;
    declare ring_duration: number;
    declare transfer_initiated_count: number;
    declare transfer_completed_count: number;
    declare outbound_handled_count: number;
}

export const initAgentPerformanceModel = (sequelize: Sequelize) => {
    AgentPerformance.init({
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        engagement_id: { type: DataTypes.STRING },
        start_time: { type: DataTypes.STRING },
        direction: { type: DataTypes.STRING },
        user_id: { type: DataTypes.STRING },
        user_name: { type: DataTypes.STRING },
        channel: { type: DataTypes.STRING },
        channel_source: { type: DataTypes.STRING },
        queue_name: { type: DataTypes.STRING },
        handle_duration: { type: DataTypes.INTEGER },
        direct_transfer_count: { type: DataTypes.INTEGER },
        agent_offered_count: { type: DataTypes.INTEGER },
        agent_refused_count: { type: DataTypes.INTEGER },
        agent_missed_count: { type: DataTypes.INTEGER },
        agent_declined_count: { type: DataTypes.INTEGER },
        hold_count: { type: DataTypes.INTEGER },
        hold_duration: { type: DataTypes.INTEGER },
        wrap_up_duration: { type: DataTypes.INTEGER },
        inbound_handled_count: { type: DataTypes.INTEGER },
        ring_duration: { type: DataTypes.INTEGER },
        transfer_initiated_count: { type: DataTypes.INTEGER },
        transfer_completed_count: { type: DataTypes.INTEGER },
        outbound_handled_count: { type: DataTypes.INTEGER },
    }, {
        sequelize,
        modelName: 'AgentPerformance',
        tableName: 'agentPerformance',
        timestamps: false,
    });
};