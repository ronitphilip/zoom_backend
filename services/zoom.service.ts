import { Op } from "sequelize";
import commonAPI from "../config/commonAPI";
import { CallLogs } from "../models/call-logs.model";
import { User } from "../models/user.model"
import { ZoomUser } from "../models/zoom.model";
import { AuthenticatedPayload } from "../types/user.type";
import { CallLogEntry, CallLogResponse } from "../types/zoom.type"
import { getAccessToken } from "../utils/accessToken";

export const saveUserCredentials = async (id: number, account_id: string, client_id: string, client_password: string): Promise<CallLogResponse> => {
    try {
        const existingUser = await User.findByPk(id);
        if (!existingUser) throw Object.assign(new Error('User not found!'), { status: 404 });

        const isMatch = await ZoomUser.findOne({ where: { userId: id } });
        if (isMatch) {
            throw Object.assign(new Error('Credentials already exist'), { status: 401 });
        }

        const user = await ZoomUser.create({ account_id, client_id, client_password, userId: id });

        return { success: true, data: user };
    } catch (err) {
        throw err;
    }
}

export const getCallDetails = async (user: AuthenticatedPayload, direction: string, from: string, to: string): Promise<CallLogEntry[]> => {
    try {

        const existingLogs = await CallLogs.findAll({
            where: {
                userId: user.id,
                start_time: {
                    [Op.between]: [from, to],
                },
                direction: direction,
            },
        });

        if (existingLogs.length > 0) {
            return existingLogs.map(log => ({
                id: log.id.toString(),
                userId: log.userId.toString(),
                direction: log.direction,
                caller_did_number: log.caller_did_number,
                caller_name: log.caller_name,
                callee_did_number: log.callee_did_number,
                callee_name: log.callee_name,
                duration: log.duration,
                call_result: log.call_result,
                start_time: log.start_time,
                end_time: log.end_time,
            }));
        }

        const token = await getAccessToken(user?.id);
        if (!token) {
            throw Object.assign(new Error('Server token missing'), { status: 401 });
        }

        const response = await commonAPI('GET', `/phone/call_history?directions=${direction}&from=${from}&to=${to}`, {}, {}, token);

        const callDetails = (response.call_logs || []).map(async (log: CallLogEntry) => {
            const callLogEntry = {
                id: log.id ?? 'N/A',
                userId: user?.id ?? 'N/A',
                direction: log.direction ?? 'N/A',
                caller_did_number: log.caller_did_number ?? 'Unknown',
                caller_name: log.caller_name ?? 'Unknown',
                callee_did_number: log.callee_did_number ?? 'Unknown',
                callee_name: log.callee_name ?? 'Unknown',
                duration: log.duration ?? 0,
                call_result: log.call_result ?? 'Unknown',
                start_time: log.start_time ?? 'N/A',
                end_time: log.end_time ?? 'N/A',
            };

            await CallLogs.create({
                userId: user.id,
                direction: callLogEntry.direction,
                caller_did_number: callLogEntry.caller_did_number,
                caller_name: callLogEntry.caller_name,
                callee_did_number: callLogEntry.callee_did_number,
                callee_name: callLogEntry.callee_name,
                duration: callLogEntry.duration,
                call_result: callLogEntry.call_result,
                start_time: callLogEntry.start_time,
                end_time: callLogEntry.end_time,
            });

            return callLogEntry;
        });

        return Promise.all(callDetails);
    } catch (err) {
        throw err;
    }
}

export const refreshCallLogs = async (user: AuthenticatedPayload, direction: string, from: string, to: string): Promise<CallLogEntry[]> => {
    try {
        const token = await getAccessToken(user?.id);
        if (!token) {
            throw Object.assign(new Error('Server token missing'), { status: 401 });
        }

        const response = await commonAPI('GET', `/phone/call_history?directions=${direction}&from=${from}&to=${to}`, {}, {}, token);

        await CallLogs.destroy({
            where: {
                userId: user.id,
                start_time: {
                    [Op.between]: [from, to],
                },
                direction: direction,
            },
        });

        const callDetails = (response.call_logs || []).map(async (log: CallLogEntry) => {
            const callLogEntry = {
                id: log.id ?? 'N/A',
                userId: user?.id ?? 'N/A',
                direction: log.direction ?? 'N/A',
                caller_did_number: log.caller_did_number ?? 'Unknown',
                caller_name: log.caller_name ?? 'Unknown',
                callee_did_number: log.callee_did_number ?? 'Unknown',
                callee_name: log.callee_name ?? 'Unknown',
                duration: log.duration ?? 0,
                call_result: log.call_result ?? 'Unknown',
                start_time: log.start_time ?? 'N/A',
                end_time: log.end_time ?? 'N/A',
            };

            await CallLogs.create({
                userId: user.id,
                direction: callLogEntry.direction,
                caller_did_number: callLogEntry.caller_did_number,
                caller_name: callLogEntry.caller_name,
                callee_did_number: callLogEntry.callee_did_number,
                callee_name: callLogEntry.callee_name,
                duration: callLogEntry.duration,
                call_result: callLogEntry.call_result,
                start_time: callLogEntry.start_time,
                end_time: callLogEntry.end_time,
            });

            return callLogEntry;
        });

        return Promise.all(callDetails);
    } catch (err) {
        throw err;
    }
}