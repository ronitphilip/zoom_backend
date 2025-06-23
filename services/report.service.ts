import { Op } from "sequelize";
import { AgentPerformance } from "../models/agent-performance.model";
import { AgentTimecard } from "../models/agent-timecard.model";
import { AuthenticatedPayload } from "../types/user.type";
import { AgentReport, ApiResponse, QueueReport } from "../types/zoom.type";
import { getAccessToken } from "../utils/accessToken";
import commonAPI from "../config/commonAPI";

const transformToAgentReport = (performanceRecords: any[], timecardRecords: any[]): AgentReport[] => {
    const reportMap = new Map<string, AgentReport>();

    performanceRecords.forEach(record => {
        const date = record.start_time.split('T')[0];
        const key = `${record.user_id}_${date}`;
        const existingReport = reportMap.get(key) || {};

        reportMap.set(key, {
            ...existingReport,
            id: record.id || existingReport.id,
            date: date,
            time: record.start_time.split('T')[1]?.split('.')[0] || record.start_time.split('T')[1],
            queue: record.queue_name || '',
            handle_duration: record.handle_duration || 0,
            hold_duration: record.hold_duration || 0,
            wrap_up_duration: record.wrap_up_duration || 0,
            channel: record.channel || '',
            direction: record.direction || '',
            calling_party: record.user_id,
            transfer_initiated_count: record.transfer_initiated_count || 0,
            transfer_completed_count: record.transfer_completed_count || 0,
            user_name: record.user_name || existingReport.user_name || '',
        });
    });

    timecardRecords.forEach(record => {
        const date = record.start_time.split('T')[0];
        const key = `${record.user_id}_${date}`;
        const existingReport = reportMap.get(key) || {};

        reportMap.set(key, {
            ...existingReport,
            id: record.id || existingReport.id,
            date: date,
            time: record.start_time.split('T')[1]?.split('.')[0] || record.start_time.split('T')[1],
            status: record.user_status || '',
            sub_status: record.user_sub_status || '',
            duration: record.ready_duration || record.occupied_duration || 0,
            queue: existingReport.queue || '',
            handle_duration: existingReport.handle_duration || 0,
            hold_duration: existingReport.hold_duration || 0,
            wrap_up_duration: existingReport.wrap_up_duration || 0,
            channel: existingReport.channel || '',
            direction: existingReport.direction || '',
            calling_party: record.user_id,
            transfer_initiated_count: existingReport.transfer_initiated_count || 0,
            transfer_completed_count: existingReport.transfer_completed_count || 0,
            user_name: record.user_name || existingReport.user_name || '',
        });
    });

    return Array.from(reportMap.values());
};

const transformToQueueReport = (performanceRecords: any[], timecardRecords: any[]): QueueReport[] => {
    const reportMap = new Map<string, QueueReport>();

    performanceRecords.forEach(record => {
        const date = record.start_time.split('T')[0];
        const key = `${record.user_id}_${record.queue_name || 'Unknown'}_${date}`;
        const existingReport = reportMap.get(key) || {
            user_id: record.user_id,
            user_name: record.user_name || '',
            queue_name: record.queue_name || 'Unknown',
            date: date,
            total_handle_duration: 0,
            total_hold_duration: 0,
            total_wrap_up_duration: 0,
            total_transfer_initiated_count: 0,
            total_transfer_completed_count: 0,
            total_handled_count: 0,
            total_outbound_handled_count: 0,
            total_inbound_handled_count: 0,
            total_ready_duration: 0,
            total_occupied_duration: 0,
        };

        reportMap.set(key, {
            ...existingReport,
            total_handle_duration: existingReport.total_handle_duration + (record.handle_duration || 0),
            total_hold_duration: existingReport.total_hold_duration + (record.hold_duration || 0),
            total_wrap_up_duration: existingReport.total_wrap_up_duration + (record.wrap_up_duration || 0),
            total_transfer_initiated_count: existingReport.total_transfer_initiated_count + (record.transfer_initiated_count || 0),
            total_transfer_completed_count: existingReport.total_transfer_completed_count + (record.transfer_completed_count || 0),
            total_handled_count: existingReport.total_handled_count + (record.handled_count || 0),
            total_outbound_handled_count: existingReport.total_outbound_handled_count + (record.outbound_handled_count || 0),
            total_inbound_handled_count: existingReport.total_inbound_handled_count + (record.inbound_handled_count || 0),
        });
    });

    timecardRecords.forEach(record => {
        const date = record.start_time.split('T')[0];
        const key = `${record.user_id}_${record.queue_name || 'Unknown'}_${date}`;
        const existingReport = reportMap.get(key) || {
            user_id: record.user_id,
            user_name: record.user_name || '',
            queue_name: record.queue_name || 'Unknown',
            date: date,
            total_handle_duration: 0,
            total_hold_duration: 0,
            total_wrap_up_duration: 0,
            total_transfer_initiated_count: 0,
            total_transfer_completed_count: 0,
            total_handled_count: 0,
            total_outbound_handled_count: 0,
            total_inbound_handled_count: 0,
            total_ready_duration: 0,
            total_occupied_duration: 0,
        };

        reportMap.set(key, {
            ...existingReport,
            total_ready_duration: existingReport.total_ready_duration + (record.ready_duration || 0),
            total_occupied_duration: existingReport.total_occupied_duration + (record.occupied_duration || 0),
        });
    });

    const reports = Array.from(reportMap.values());
    // Sort by date
    reports.sort((a, b) => a.date.localeCompare(b.date));

    return reports;
};

export const fetchAgentReports = async (user: AuthenticatedPayload, from: string, to: string): Promise<AgentReport[]> => {
    try {
        const [performanceRecords, timecardRecords] = await Promise.all([
            AgentPerformance.findAll({
                where: {
                    start_time: { [Op.between]: [from, to] },
                },
            }),
            AgentTimecard.findAll({
                where: {
                    start_time: { [Op.between]: [from, to] },
                },
            }),
        ]);

        if (performanceRecords.length > 0 && timecardRecords.length > 0) {
            return transformToAgentReport(performanceRecords, timecardRecords);
        }

        const token = await getAccessToken(user.id);
        if (!token) throw Object.assign(new Error("Server token missing"), { status: 401 });

        const [performanceResponse, timecardResponse] = await Promise.all([
            commonAPI("GET", `/contact_center/analytics/dataset/historical/agent_performance?from=${from}&to=${to}`, {}, {}, token),
            commonAPI("GET", `/contact_center/analytics/dataset/historical/agent_timecard?from=${from}&to=${to}`, {}, {}, token),
        ]);

        const performanceUsers = (performanceResponse as ApiResponse).users || [];
        const timecardUsers = (timecardResponse as ApiResponse).users || [];

        await Promise.all([
            AgentPerformance.bulkCreate(performanceUsers.map(record => ({
                ...record,
                queue_name: record.queue_name || '',
                handle_duration: record.handle_duration || 0,
                hold_duration: record.hold_duration || 0,
                wrap_up_duration: record.wrap_up_duration || 0,
                transfer_initiated_count: record.transfer_initiated_count || 0,
                transfer_completed_count: record.transfer_completed_count || 0,
            }))),
            AgentTimecard.bulkCreate(timecardUsers.map(record => ({
                ...record,
                duration: record.ready_duration || record.occupied_duration || 0,
            }))),
        ]);

        return transformToAgentReport(performanceUsers, timecardUsers);
    } catch (err) {
        throw err;
    }
};

export const fetchQueueReports = async (user: AuthenticatedPayload, from: string, to: string): Promise<QueueReport[]> => {
    try {
        const [performanceRecords, timecardRecords] = await Promise.all([
            AgentPerformance.findAll({
                where: {
                    start_time: { [Op.between]: [from, to] },
                },
            }),
            AgentTimecard.findAll({
                where: {
                    start_time: { [Op.between]: [from, to] },
                },
            }),
        ]);

        if (performanceRecords.length > 0 || timecardRecords.length > 0) {
            return transformToQueueReport(performanceRecords, timecardRecords);
        }

        const token = await getAccessToken(user.id);
        if (!token) throw Object.assign(new Error("Server token missing"), { status: 401 });

        const [performanceResponse, timecardResponse] = await Promise.all([
            commonAPI("GET", `/contact_center/analytics/dataset/historical/agent_performance?from=${from}&to=${to}`, {}, {}, token),
            commonAPI("GET", `/contact_center/analytics/dataset/historical/agent_timecard?from=${from}&to=${to}`, {}, {}, token),
        ]);

        const performanceUsers = (performanceResponse as ApiResponse).users || [];
        const timecardUsers = (timecardResponse as ApiResponse).users || [];

        await Promise.all([
            AgentPerformance.bulkCreate(performanceUsers.map(record => ({
                ...record,
                queue_name: record.queue_name || '',
                handle_duration: record.handle_duration || 0,
                hold_duration: record.hold_duration || 0,
                wrap_up_duration: record.wrap_up_duration || 0,
                transfer_initiated_count: record.transfer_initiated_count || 0,
                transfer_completed_count: record.transfer_completed_count || 0,
            }))),
            AgentTimecard.bulkCreate(timecardUsers.map(record => ({
                ...record,
                duration: record.ready_duration || record.occupied_duration || 0,
            }))),
        ]);

        return transformToQueueReport(performanceUsers, timecardUsers);
    } catch (err) {
        throw err;
    }
};