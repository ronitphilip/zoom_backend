import { Sequelize, DataTypes, Model, CreationOptional, ForeignKey } from 'sequelize';
import { User } from './user.model';

export class CallLogs extends Model {
    declare id: CreationOptional<number>;
    declare userId: ForeignKey<number>;
    declare direction: string;
    declare caller_did_number: string;
    declare caller_name: string;
    declare callee_did_number: string;
    declare callee_name: string;
    declare duration: number;
    declare call_result: string;
    declare start_time: string;
    declare end_time: string;
}

export const initCallLogModel = (sequelize: Sequelize) => {
    CallLogs.init({
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: User,
                key: 'id',
            },
        },
        direction: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        caller_did_number: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        caller_name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        callee_did_number: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        callee_name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        duration: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        call_result: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        start_time: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        end_time: {
            type: DataTypes.STRING,
            allowNull: false,
        },

    },
        {
            sequelize,
            modelName: 'CallLogs',
            tableName: 'callLog',
            timestamps: false,
        })
}