import { Op } from "sequelize";
import { AgentPerformance } from "../models/agent-performance.model";
import { AgentTimecard } from "../models/agent-timecard.model";
import { AuthenticatedPayload } from "../types/user.type";
import { PerformanceAttributes, TimecardAttributes, TeamReportSummary } from "../types/zoom.type";
import { getAccessToken } from "../utils/accessToken";
import commonAPI from "../config/commonAPI";
import { Team } from "../models/team.model";

export const listAllUsers = async (user: AuthenticatedPayload) => {
    try {
        const token = await getAccessToken(user.id);
        if (!token) throw Object.assign(new Error("Server token missing"), { status: 401 });

        const result = await commonAPI("GET", '/contact_center/users', {}, {}, token);

        return result.users?.map((user: any) => user.display_name);
    } catch (err) {
        throw err
    }
}

export const fetchAgentPerfomance = async (
    user: AuthenticatedPayload,
    from: string,
    to: string,
    channel: string,
    agent: string,
    format: string,
    count: number,
    page: number = 1,
    nextPageToken?: string): Promise<{ data: PerformanceAttributes[], nextPageToken?: string, totalRecords: number }> => {

    try {
        const offset = (page - 1) * count;

        const whereClause: any = {
            start_time: {
                [Op.between]: [from, to],
            },
        };

        if (channel) {
            whereClause.channel = channel;
        }

        if (agent) {
            whereClause.user_name = agent;
        }

        const existingData = await AgentPerformance.findAll({
            where: whereClause,
            attributes: [
                'engagement_id',
                'start_time',
                'queue_name',
                'channel',
                'direction',
                'user_name',
                'conversation_duration',
                'transfer_initiated_count',
                'transfer_completed_count',
                'hold_count',
                'agent_offered_count',
            ],
            order: [['start_time', format]],
            limit: count,
            offset,
        });

        const totalDbRecords = await AgentPerformance.count({ where: whereClause });

        if (existingData.length > 0 && existingData.length >= count) {
            return {
                data: existingData.map(record => ({
                    engagement_id: record.engagement_id,
                    start_time: record.start_time,
                    queue_name: record.queue_name,
                    channel: record.channel,
                    direction: record.direction,
                    user_name: record.user_name,
                    conversation_duration: record.conversation_duration,
                    transfer_initiated_count: record.transfer_initiated_count,
                    transfer_completed_count: record.transfer_completed_count,
                    hold_count: record.hold_count,
                    agent_offered_count: record.agent_offered_count,
                })) as PerformanceAttributes[],
                nextPageToken: page * count < totalDbRecords ? `db_page_${page + 1}` : undefined,
                totalRecords: totalDbRecords,
            };
        }

        const token = await getAccessToken(user.id);
        if (!token) throw Object.assign(new Error("Server token missing"), { status: 401 });

        const queryParams = new URLSearchParams({
            from,
            to,
            page_size: count.toString(),
        });

        if (nextPageToken && !nextPageToken.startsWith('db_page_')) {
            queryParams.append('next_page_token', nextPageToken);
        }

        const response = await commonAPI("GET", `/contact_center/analytics/dataset/historical/agent_performance?${queryParams.toString()}`, {}, {}, token);

        try {
            await AgentPerformance.bulkCreate(response.users, {
                ignoreDuplicates: true,
            });
        } catch (bulkError) {
            console.error('Failed to store data in AgentPerformance table:', bulkError);
        }

        let apiData = response.users || [];
        const apiNextPageToken = response.next_page_token;
        const apiTotalRecords = response.total_records || apiData.length;

        if (apiData.length === 0) {
            return { data: [], totalRecords: totalDbRecords };
        }

        if (channel) {
            apiData = apiData.filter((item: any) => item.channel === channel);
        }

        if (agent) {
            apiData = apiData.filter((item: any) => item.user_name === agent);
        }

        apiData.sort((a: any, b: any) => {
            const dateA = new Date(a.start_time);
            const dateB = new Date(b.start_time);
            return format.toUpperCase() === 'ASC' ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime();
        });

        const filteredApiData = apiData.map((item: any) => ({
            engagement_id: item.engagement_id,
            start_time: item.start_time,
            queue_name: item.queue_name,
            channel: item.channel,
            direction: item.direction,
            user_name: item.user_name,
            conversation_duration: item.conversation_duration,
            transfer_initiated_count: item.transfer_initiated_count,
            transfer_completed_count: item.transfer_completed_count,
            hold_count: item.hold_count,
            agent_offered_count: item.agent_offered_count,
        }));

        return {
            data: filteredApiData as PerformanceAttributes[],
            nextPageToken: apiNextPageToken,
            totalRecords: apiTotalRecords,
        };
    } catch (err) {
        throw err;
    }
};

export const fetchTimeCard = async (user: AuthenticatedPayload,
    from: string,
    to: string,
    status: string,
    agent: string,
    format: string,
    count: number,
    page: number = 1,
    nextPageToken?: string): Promise<{ data: TimecardAttributes[], nextPageToken?: string, totalRecords: number }> => {
    try {

        const offset = (page - 1) * count;

        const whereClause: any = {
            start_time: {
                [Op.between]: [from, to],
            },
        };

        if (status) {
            whereClause.user_status = status;
        }

        if (agent) {
            whereClause.user_name = agent;
        }

        const existingData = await AgentTimecard.findAll({
            where: whereClause,
            attributes: [
                'work_session_id',
                'start_time',
                'user_name',
                'user_status',
                'user_sub_status',
                'team_name',
                'occupied_duration'
            ],
            order: [['start_time', format]],
            limit: count,
            offset,
        });

        const totalDbRecords = await AgentTimecard.count({ where: whereClause });

        if (existingData.length > 0 && existingData.length >= count) {
            return {
                data: existingData.map(record => ({
                    work_session_id: record.work_session_id,
                    start_time: record.start_time,
                    user_name: record.user_name,
                    user_status: record.user_status,
                    user_sub_status: record.user_sub_status,
                    team_name: record.team_name,
                    occupied_duration: record.occupied_duration
                })) as TimecardAttributes[],
                nextPageToken: page * count < totalDbRecords ? `db_page_${page + 1}` : undefined,
                totalRecords: totalDbRecords,
            }
        }

        const token = await getAccessToken(user.id);
        if (!token) throw Object.assign(new Error("Server token missing"), { status: 401 });

        const queryParams = new URLSearchParams({
            from,
            to,
            page_size: count.toString(),
        });

        if (nextPageToken && !nextPageToken.startsWith('db_page_')) {
            queryParams.append('next_page_token', nextPageToken);
        }

        const response = await commonAPI("GET", `/contact_center/analytics/dataset/historical/agent_timecard?from=${from}&to=${to}`, {}, {}, token);

        try {
            await AgentTimecard.bulkCreate(response.users, {
                ignoreDuplicates: true,
            });
        } catch (err) {
            console.log('Failed to store data in AgentPerformance table');
            throw err;
        }

        let apiData = response.users || [];
        const apiNextPageToken = response.next_page_token;
        const apiTotalRecords = response.total_records || apiData.length;

        if (apiData.length === 0) {
            return { data: [], totalRecords: totalDbRecords };
        }

        if (status) {
            apiData = apiData.filter((item: any) => item.user_status === status);
        }

        if (agent) {
            apiData = apiData.filter((item: any) => item.user_name === agent);
        }

        apiData.sort((a: any, b: any) => {
            const dateA = new Date(a.start_time);
            const dateB = new Date(b.start_time);
            return format.toUpperCase() === 'ASC' ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime();
        });

        const transformedData = apiData.map((item: any) => ({
            work_session_id: item.work_session_id || "",
            start_time: item.start_time || "",
            user_name: item.user_name || "",
            user_status: item.user_status || "",
            user_sub_status: item.user_sub_status || "",
            team_name: item.team?.team_name || "",
            occupied_duration: item.occupied_duration || null,
        }));

        return {
            data: transformedData as TimecardAttributes[],
            nextPageToken: apiNextPageToken,
            totalRecords: apiTotalRecords,
        };

    } catch (err) {
        throw err;
    }
};

export const generateGroupSummary = async (
    user: AuthenticatedPayload,
    from: string,
    to: string,
    team_name?: string,
    channel?: string
): Promise<TeamReportSummary[]> => {
    try {
        const whereClause: any = {
            start_time: { [Op.between]: [from, to] },
        };

        if (channel) {
            whereClause.channel = channel;
        }

        let teams = await Team.findAll({
            attributes: ['team_name', 'team_members'],
        });

        if (team_name) {
            teams = teams.filter(team => team.team_name === team_name);
        }

        const summaries: TeamReportSummary[] = [];

        const existingData = await AgentPerformance.findAll({
            where: whereClause,
            attributes: [
                'channel',
                'direction',
                'handle_duration',
                'hold_count',
                'wrap_up_duration',
                'transfer_initiated_count',
                'transfer_completed_count',
                'queue_name',
                'user_name',
            ],
        });

        if (existingData.length > 0) {
            for (const team of teams) {
                const teamMembers = team.team_members.map((member: any) => member.name);
                let performances = existingData.filter(p => teamMembers.includes(p.user_name));

                const totalInteractions = performances.length;
                const totalHandleDuration = performances.reduce((sum, p) => sum + (p.handle_duration || 0), 0);
                const avgHandleDuration = totalInteractions > 0 ? totalHandleDuration / totalInteractions : 0;
                const totalHoldCount = performances.reduce((sum, p) => sum + (p.hold_count || 0), 0);
                const avgWrapUpDuration = totalInteractions > 0 
                    ? performances.reduce((sum, p) => sum + (p.wrap_up_duration || 0), 0) / totalInteractions 
                    : 0;
                const transferInitiated = performances.reduce((sum, p) => sum + (p.transfer_initiated_count || 0), 0);
                const transferCompleted = performances.reduce((sum, p) => sum + (p.transfer_completed_count || 0), 0);

                const channels = [...new Set(performances.map(p => p.channel).filter(Boolean))] as string[];
                const directions = [...new Set(performances.map(p => p.direction).filter(Boolean))] as string[];
                const queues = [...new Set(performances.map(p => p.queue_name).filter(Boolean))] as string[];

                summaries.push({
                    team_name: team.team_name,
                    total_interactions: totalInteractions,
                    avg_handle_duration: Math.round(avgHandleDuration),
                    total_hold_count: totalHoldCount,
                    avg_wrap_up_duration: Math.round(avgWrapUpDuration),
                    channels,
                    directions,
                    transfer_initiated: transferInitiated,
                    transfer_completed: transferCompleted,
                    queues,
                });
            }

            if (summaries.length > 0) {
                return summaries;
            }
        }

        const token = await getAccessToken(user.id);
        if (!token) throw Object.assign(new Error("Server token missing"), { status: 401 });

        const queryParams = new URLSearchParams({
            from,
            to,
            page_size: '1000',
        });

        const response = await commonAPI("GET", `/contact_center/analytics/dataset/historical/agent_performance?${queryParams.toString()}`, {}, {}, token);

        try {
            await AgentPerformance.bulkCreate(response.users, {
                ignoreDuplicates: true,
            });
        } catch (bulkError) {
            console.error('Failed to store data in AgentPerformance table:', bulkError);
        }

        let apiData = response.users || [];

        if (apiData.length === 0) {
            return [];
        }

        if (channel) {
            apiData = apiData.filter((item: any) => item.channel === channel);
        }

        if (team_name) {
            const selectedTeam = teams.find(team => team.team_name === team_name);
            if (selectedTeam) {
                const teamMembers = selectedTeam.team_members.map((member: any) => member.name);
                apiData = apiData.filter((item: any) => teamMembers.includes(item.user_name));
            }
        }

        for (const team of teams) {
            const teamMembers = team.team_members.map((member: any) => member.name);
            let performances = apiData.filter((item: any) => teamMembers.includes(item.user_name));

            const totalInteractions = performances.length;
            const totalHandleDuration = performances.reduce((sum: number, p: any) => sum + (p.handle_duration || 0), 0);
            const avgHandleDuration = totalInteractions > 0 ? totalHandleDuration / totalInteractions : 0;
            const totalHoldCount = performances.reduce((sum: number, p: any) => sum + (p.hold_count || 0), 0);
            const avgWrapUpDuration = totalInteractions > 0 
                ? performances.reduce((sum: number, p: any) => sum + (p.wrap_up_duration || 0), 0) / totalInteractions 
                : 0;
            const transferInitiated = performances.reduce((sum: number, p: any) => sum + (p.transfer_initiated_count || 0), 0);
            const transferCompleted = performances.reduce((sum: number, p: any) => sum + (p.transfer_completed_count || 0), 0);

            const channels = [...new Set(performances.map((p: any) => p.channel).filter(Boolean))] as string[];
            const directions = [...new Set(performances.map((p: any) => p.direction).filter(Boolean))] as string[];
            const queues = [...new Set(performances.map((p: any) => p.queue_name).filter(Boolean))] as string[];

            summaries.push({
                team_name: team.team_name,
                total_interactions: totalInteractions,
                avg_handle_duration: Math.round(avgHandleDuration),
                total_hold_count: totalHoldCount,
                avg_wrap_up_duration: Math.round(avgWrapUpDuration),
                channels,
                directions,
                transfer_initiated: transferInitiated,
                transfer_completed: transferCompleted,
                queues,
            });
        }

        return summaries;
    } catch (err) {
        throw err;
    }
};

export const fetchAllTeams = async () => {
    try {
        const result = await Team.findAll({
            attributes: [ 'team_name' ]
        });

        return result;
    } catch (err) {
        throw err
    }
}

