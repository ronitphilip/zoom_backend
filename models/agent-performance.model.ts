import { Sequelize, DataTypes, Model, CreationOptional } from 'sequelize';

export class AgentPerformance extends Model {
    declare id: CreationOptional<number>;
    declare engagement_id: string;
    declare start_time: string;
    declare end_time: string;
    declare direction: string;
    declare user_id: string;
    declare user_name: string;
    declare channel: string;
    declare channel_source: string;
    declare queue_id: string;
    declare queue_name: string;
    declare team_id: string;
    declare team_name: string;
    declare handled_count: number;
    declare handle_duration: number;
    declare direct_transfer_count: number;
    declare warm_transfer_initiated_count: number;
    declare warm_transfer_completed_count: number;
    declare transfer_initiated_count: number;
    declare transfer_completed_count: number;
    declare warm_conference_count: number;
    declare agent_offered_count: number;
    declare agent_refused_count: number;
    declare agent_missed_count: number;
    declare ring_disconnect_count: number;
    declare agent_declined_count: number;
    declare agent_message_sent_count: number;
    declare hold_count: number;
    declare conference_count: number;
    declare wrap_up_duration: number;
    declare outbound_handled_count: number;
    declare outbound_handle_duration: number;
    declare dial_duration: number;
    declare conversation_duration?: number;
    declare outbound_conversation_duration?: number;
}

export const initAgentPerformanceModel = (sequelize: Sequelize) => {
    AgentPerformance.init({
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        engagement_id: {
            type: DataTypes.STRING,
            unique: true,
        },
        start_time: { type: DataTypes.STRING },
        end_time: { type: DataTypes.STRING },
        direction: { type: DataTypes.STRING },
        user_id: { type: DataTypes.STRING },
        user_name: { type: DataTypes.STRING },
        channel: { type: DataTypes.STRING },
        channel_source: { type: DataTypes.STRING },
        queue_id: { type: DataTypes.STRING },
        queue_name: { type: DataTypes.STRING },
        team_id: { type: DataTypes.STRING },
        team_name: { type: DataTypes.STRING },
        handled_count: { type: DataTypes.INTEGER },
        handle_duration: { type: DataTypes.INTEGER },
        direct_transfer_count: { type: DataTypes.INTEGER },
        warm_transfer_initiated_count: { type: DataTypes.INTEGER },
        warm_transfer_completed_count: { type: DataTypes.INTEGER },
        transfer_initiated_count: { type: DataTypes.INTEGER },
        transfer_completed_count: { type: DataTypes.INTEGER },
        warm_conference_count: { type: DataTypes.INTEGER },
        agent_offered_count: { type: DataTypes.INTEGER },
        agent_refused_count: { type: DataTypes.INTEGER },
        agent_missed_count: { type: DataTypes.INTEGER },
        ring_disconnect_count: { type: DataTypes.INTEGER },
        agent_declined_count: { type: DataTypes.INTEGER },
        agent_message_sent_count: { type: DataTypes.INTEGER },
        hold_count: { type: DataTypes.INTEGER },
        conference_count: { type: DataTypes.INTEGER },
        wrap_up_duration: { type: DataTypes.INTEGER },
        outbound_handled_count: { type: DataTypes.INTEGER },
        outbound_handle_duration: { type: DataTypes.INTEGER },
        dial_duration: { type: DataTypes.INTEGER },
        conversation_duration: { type: DataTypes.INTEGER, allowNull: true },
        outbound_conversation_duration: { type: DataTypes.INTEGER, allowNull: true },
    }, {
        sequelize,
        modelName: 'AgentPerformance',
        tableName: 'agentPerformance',
        timestamps: false,
    });
};