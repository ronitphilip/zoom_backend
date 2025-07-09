import { Op, fn, col, literal } from "sequelize";
import { AgentPerformance } from "../models/agent-performance.model";
import { AgentTimecard } from "../models/agent-timecard.model";
import { AuthenticatedPayload } from "../types/user.type";
import { PerformanceAttributes, TimecardAttributes, TeamReportSummary, AgentEngagementAttributes } from "../types/zoom.type";
import { getAccessToken } from "../utils/accessToken";
import commonAPI from "../config/commonAPI";
import { Team } from "../models/team.model";
import { AgentEngagement } from "../models/agent-engagement.model";

export const listAllUsers = async (user: AuthenticatedPayload) => {
    try {
        const token = await getAccessToken(user.id);
        if (!token) throw Object.assign(new Error("Server token missing"), { status: 401 });

        const result = await commonAPI("GET", '/contact_center/users', {}, {}, token);
        return result.users?.map((user: any) => user.display_name);
    } catch (err) {
        throw err;
    }
};

export const fetchAgentPerformance = async (
    user: AuthenticatedPayload,
    from: string,
    to: string,
    channel: string,
    agent: string,
    format: string,
    count: number,
    page: number = 1,
    nextPageToken?: string
): Promise<{ data: PerformanceAttributes[], nextPageToken?: string, totalRecords: number }> => {
    try {
        const whereClause: any = {
            start_time: { [Op.between]: [from, to] },
        };

        if (channel) whereClause.channel = channel;
        if (agent) whereClause.user_name = agent;

        const existingData = await AgentPerformance.findAll({
            where: whereClause,
            attributes: ['engagement_id'],
            limit: 1,
        });

        if (existingData.length === 0) {
            await refreshAgentPerformance(user, from, to);
        }

        const offset = (page - 1) * count;
        const data = await AgentPerformance.findAll({
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

        const totalRecords = await AgentPerformance.count({ where: whereClause });

        return {
            data: data.map(record => ({
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
            nextPageToken: page * count < totalRecords ? `db_page_${page + 1}` : undefined,
            totalRecords,
        };
    } catch (err) {
        throw err;
    }
};

export const fetchTimeCard = async (
    user: AuthenticatedPayload,
    from: string,
    to: string,
    status: string,
    agent: string,
    format: string,
    count: number,
    page: number = 1,
    nextPageToken?: string
): Promise<{ data: TimecardAttributes[], nextPageToken?: string, totalRecords: number }> => {
    try {
        const whereClause: any = {
            start_time: { [Op.between]: [from, to] },
        };

        if (status) whereClause.user_status = status;
        if (agent) whereClause.user_name = agent;

        const existingData = await AgentTimecard.findAll({
            where: whereClause,
            attributes: ['work_session_id'],
            limit: 1,
        });

        if (existingData.length === 0) {
            await refreshTimeCard(user, from, to);
        }

        const offset = (page - 1) * count;
        const data = await AgentTimecard.findAll({
            where: whereClause,
            attributes: [
                'work_session_id',
                'start_time',
                'user_name',
                'user_status',
                'user_sub_status',
                'team_name',
                'occupied_duration',
            ],
            order: [['start_time', format]],
            limit: count,
            offset,
        });

        const totalRecords = await AgentTimecard.count({ where: whereClause });

        return {
            data: data.map(record => ({
                work_session_id: record.work_session_id,
                start_time: record.start_time,
                user_name: record.user_name,
                user_status: record.user_status,
                user_sub_status: record.user_sub_status,
                team_name: record.team_name,
                occupied_duration: record.occupied_duration,
            })) as TimecardAttributes[],
            nextPageToken: page * count < totalRecords ? `db_page_${page + 1}` : undefined,
            totalRecords,
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

        if (channel) whereClause.channel = channel;

        const existingData = await AgentPerformance.findAll({
            where: whereClause,
            attributes: ['engagement_id'],
            limit: 1,
        });

        if (existingData.length === 0) {
            await refreshGroupSummary(user, from, to);
        }

        let teams = await Team.findAll({
            attributes: ['team_name', 'team_members'],
        });

        if (team_name) {
            teams = teams.filter(team => team.team_name === team_name);
        }

        const summaries: TeamReportSummary[] = [];

        for (const team of teams) {
            const teamMembers = team.team_members.map((member: any) => member.name);
            const performances = await AgentPerformance.findAll({
                where: {
                    ...whereClause,
                    user_name: { [Op.in]: teamMembers },
                },
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

        return summaries;
    } catch (err) {
        throw err;
    }
};

export const fetchAllTeams = async () => {
    try {
        const result = await Team.findAll({
            attributes: ['team_name'],
        });
        return result;
    } catch (err) {
        throw err;
    }
};

export const fetchAgentEngagement = async (
    user: AuthenticatedPayload,
    from: string,
    to: string,
    channel: string,
    agent: string,
    format: string,
    count: number,
    page: number = 1,
    nextPageToken?: string
): Promise<{ data: AgentEngagementAttributes[], nextPageToken?: string, totalRecords: number }> => {
    try {
        const whereClause: any = {
            start_time: { [Op.between]: [from, to] },
        };

        if (channel) whereClause.channel = channel;
        if (agent) whereClause.user_name = agent;

        const existingData = await AgentEngagement.findAll({
            where: whereClause,
            attributes: ['engagement_id'],
            limit: 1,
        });

        if (existingData.length === 0) {
            await refreshAgentEngagement(user, from, to);
        }

        const offset = (page - 1) * count;
        const data = await AgentEngagement.findAll({
            where: whereClause,
            attributes: [
                'engagement_id',
                'start_time',
                'direction',
                'channel',
                'consumer',
                'dnis',
                'ani',
                'queue_id',
                'queue_name',
                'user_id',
                'user_name',
                'duration',
                'hold_count',
                'warm_transfer_initiated_count',
                'warm_transfer_completed_count',
                'direct_transfer_count',
                'transfer_initiated_count',
                'transfer_completed_count',
                'warm_conference_count',
                'conference_count',
                'abandoned_count',
            ],
            order: [['start_time', format]],
            limit: count,
            offset,
        });

        const totalRecords = await AgentEngagement.count({ where: whereClause });

        return {
            data: data.map(record => ({
                engagement_id: record.engagement_id,
                start_time: record.start_time,
                direction: record.direction,
                channel: record.channel || '',
                consumer: record.consumer || '',
                dnis: record.dnis || '',
                ani: record.ani || '',
                queue_id: record.queue_id || '',
                queue_name: record.queue_name || '',
                user_id: record.user_id || '',
                user_name: record.user_name || '',
                duration: record.duration,
                hold_count: record.hold_count,
                warm_transfer_initiated_count: record.warm_transfer_initiated_count,
                warm_transfer_completed_count: record.warm_transfer_completed_count,
                direct_transfer_count: record.direct_transfer_count,
                transfer_initiated_count: record.transfer_initiated_count,
                transfer_completed_count: record.transfer_completed_count,
                warm_conference_count: record.warm_conference_count,
                conference_count: record.conference_count,
                abandoned_count: record.abandoned_count,
            })) as AgentEngagementAttributes[],
            nextPageToken: page * count < totalRecords ? `db_page_${page + 1}` : undefined,
            totalRecords,
        };
    } catch (err) {
        throw err;
    }
};

export const refreshAgentPerformance = async (
    user: AuthenticatedPayload,
    from: string,
    to: string
): Promise<{ data: PerformanceAttributes[], nextPageToken?: string, totalRecords: number }> => {
    try {
        const token = await getAccessToken(user.id);
        if (!token) throw Object.assign(new Error("Server token missing"), { status: 401 });

        console.log(`Starting refreshAgentPerformance for period ${from} to ${to}`);

        let apiData: any[] = [];
        let nextPageToken: string | undefined;
        const pageSize = 300;

        // Fetch all pages from the API
        do {
            const queryParams = new URLSearchParams({
                from,
                to,
                page_size: pageSize.toString(),
            });

            if (nextPageToken) {
                queryParams.append('next_page_token', nextPageToken);
            }

            console.log(`Fetching API data with params: ${queryParams.toString()}`);
            const response = await commonAPI(
                "GET",
                `/contact_center/analytics/dataset/historical/agent_performance?${queryParams.toString()}`,
                {},
                {},
                token
            );

            if (!response.users || !Array.isArray(response.users)) {
                console.warn(`API returned no users or invalid data: ${JSON.stringify(response)}`);
                break;
            }

            console.log(`Received ${response.users.length} records from API`);
            apiData = [...apiData, ...response.users];
            nextPageToken = response.next_page_token;

        } while (nextPageToken);

        const totalRecords = apiData.length;
        console.log(`Total records fetched from API: ${totalRecords}`);

        if (apiData.length > 0) {
            // Validate and transform data to match model schema
            const validatedData = apiData.map((item: any) => ({
                engagement_id: item.engagement_id || '',
                start_time: item.start_time || '',
                end_time: item.end_time || '',
                direction: item.direction || '',
                user_id: item.user_id || '',
                user_name: item.user_name || '',
                channel: item.channel || '',
                channel_source: item.channel_source || '',
                queue_id: item.queue_id || '',
                queue_name: item.queue_name || '',
                team_id: item.team_id || '',
                team_name: item.team_name || '',
                handled_count: item.handled_count || 0,
                handle_duration: item.handle_duration || 0,
                direct_transfer_count: item.direct_transfer_count || 0,
                warm_transfer_initiated_count: item.warm_transfer_initiated_count || 0,
                warm_transfer_completed_count: item.warm_transfer_completed_count || 0,
                transfer_initiated_count: item.transfer_initiated_count || 0,
                transfer_completed_count: item.transfer_completed_count || 0,
                warm_conference_count: item.warm_conference_count || 0,
                agent_offered_count: item.agent_offered_count || 0,
                agent_refused_count: item.agent_refused_count || 0,
                agent_missed_count: item.agent_missed_count || 0,
                ring_disconnect_count: item.ring_disconnect_count || 0,
                agent_declined_count: item.agent_declined_count || 0,
                agent_message_sent_count: item.agent_message_sent_count || 0,
                hold_count: item.hold_count || 0,
                conference_count: item.conference_count || 0,
                wrap_up_duration: item.wrap_up_duration || 0,
                outbound_handled_count: item.outbound_handled_count || 0,
                outbound_handle_duration: item.outbound_handle_duration || 0,
                dial_duration: item.dial_duration || 0,
                conversation_duration: item.conversation_duration || null,
                outbound_conversation_duration: item.outbound_conversation_duration || null,
            }));

            try {
                await AgentPerformance.bulkCreate(validatedData, {
                    updateOnDuplicate: [
                        'start_time',
                        'end_time',
                        'direction',
                        'user_id',
                        'user_name',
                        'channel',
                        'channel_source',
                        'queue_id',
                        'queue_name',
                        'team_id',
                        'team_name',
                        'handled_count',
                        'handle_duration',
                        'direct_transfer_count',
                        'warm_transfer_initiated_count',
                        'warm_transfer_completed_count',
                        'transfer_initiated_count',
                        'transfer_completed_count',
                        'warm_conference_count',
                        'agent_offered_count',
                        'agent_refused_count',
                        'agent_missed_count',
                        'ring_disconnect_count',
                        'agent_declined_count',
                        'agent_message_sent_count',
                        'hold_count',
                        'conference_count',
                        'wrap_up_duration',
                        'outbound_handled_count',
                        'outbound_handle_duration',
                        'dial_duration',
                        'conversation_duration',
                        'outbound_conversation_duration',
                    ],
                    validate: true, // Enable validation to catch schema mismatches
                });
                console.log(`Successfully upserted ${validatedData.length} records to AgentPerformance`);
            } catch (bulkError) {
                console.error('Failed to upsert data in AgentPerformance table:', bulkError);
            }

            // Verify the number of records in the table
            const savedRecords = await AgentPerformance.count({
                where: {
                    start_time: { [Op.between]: [from, to] },
                },
            });
            console.log(`Total records in AgentPerformance after upsert: ${savedRecords}`);
        } else {
            console.warn('No data fetched from API to upsert');
        }

        // Transform data for return
        const transformedData = apiData.map((item: any) => ({
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
            data: transformedData.slice(0, 10) as PerformanceAttributes[],
            totalRecords,
        };
    } catch (err) {
        console.error('Error in refreshAgentPerformance:', err);
        throw err;
    }
};

export const refreshTimeCard = async (
    user: AuthenticatedPayload,
    from: string,
    to: string
): Promise<{ data: TimecardAttributes[], nextPageToken?: string, totalRecords: number }> => {
    try {
        const token = await getAccessToken(user.id);
        if (!token) throw Object.assign(new Error("Server token missing"), { status: 401 });

        await AgentTimecard.destroy({
            where: {
                start_time: { [Op.between]: [from, to] },
            },
        });

        let apiData: any[] = [];
        let nextPageToken: string | undefined;
        const pageSize = 300;

        do {
            const queryParams = new URLSearchParams({
                from,
                to,
                page_size: pageSize.toString(),
            });

            if (nextPageToken) {
                queryParams.append('next_page_token', nextPageToken);
            }

            const response = await commonAPI(
                "GET",
                `/contact_center/analytics/dataset/historical/agent_timecard?${queryParams.toString()}`,
                {},
                {},
                token
            );

            apiData = [...apiData, ...(response.users || [])];
            nextPageToken = response.next_page_token;

        } while (nextPageToken);

        const totalRecords = apiData.length;

        if (apiData.length > 0) {
            await AgentTimecard.bulkCreate(apiData, {
                ignoreDuplicates: true,
            });
        }

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
            data: transformedData.slice(0, 10) as TimecardAttributes[],
            totalRecords,
        };
    } catch (err) {
        throw err;
    }
};

export const refreshGroupSummary = async (
    user: AuthenticatedPayload,
    from: string,
    to: string
): Promise<TeamReportSummary[]> => {
    try {
        const token = await getAccessToken(user.id);
        if (!token) throw Object.assign(new Error("Server token missing"), { status: 401 });

        await AgentPerformance.destroy({
            where: {
                start_time: { [Op.between]: [from, to] },
            },
        });

        let apiData: any[] = [];
        let nextPageToken: string | undefined;
        const pageSize = 1000;

        do {
            const queryParams = new URLSearchParams({
                from,
                to,
                page_size: pageSize.toString(),
            });

            if (nextPageToken) {
                queryParams.append('next_page_token', nextPageToken);
            }

            const response = await commonAPI(
                "GET",
                `/contact_center/analytics/dataset/historical/agent_performance?${queryParams.toString()}`,
                {},
                {},
                token
            );

            apiData = [...apiData, ...(response.users || [])];
            nextPageToken = response.next_page_token;

        } while (nextPageToken);

        if (apiData.length > 0) {
            await AgentPerformance.bulkCreate(apiData, {
                ignoreDuplicates: true,
            });
        }

        let teams = await Team.findAll({
            attributes: ['team_name', 'team_members'],
        });

        const summaries: TeamReportSummary[] = [];

        for (const team of teams) {
            const teamMembers = team.team_members.map((member: any) => member.name);
            const performances = apiData.filter((item: any) => teamMembers.includes(item.user_name));

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

        return summaries.slice(0, 10);
    } catch (err) {
        throw err;
    }
};

export const refreshAgentEngagement = async (
    user: AuthenticatedPayload,
    from: string,
    to: string
): Promise<{ data: AgentEngagementAttributes[], nextPageToken?: string, totalRecords: number }> => {
    try {
        const token = await getAccessToken(user.id);
        if (!token) throw Object.assign(new Error("Server token missing"), { status: 401 });

        await AgentEngagement.destroy({
            where: {
                start_time: { [Op.between]: [from, to] },
            },
        });

        let apiData: any[] = [];
        let nextPageToken: string | undefined;
        const pageSize = 300;

        do {
            const queryParams = new URLSearchParams({
                from,
                to,
                page_size: pageSize.toString(),
            });

            if (nextPageToken) {
                queryParams.append('next_page_token', nextPageToken);
            }

            const response = await commonAPI(
                "GET",
                `/contact_center/analytics/dataset/historical/engagement?${queryParams.toString()}`,
                {},
                {},
                token
            );

            apiData = [...apiData, ...(response.engagements || [])];
            nextPageToken = response.next_page_token;

        } while (nextPageToken);

        const flattenedData = apiData.map((item: any) => ({
            engagement_id: item.engagement_id,
            direction: item.direction,
            start_time: item.start_time,
            end_time: item.end_time,
            enter_channel: item.enter_channel,
            enter_channel_source: item.enter_channel_source,
            channel: item.channels?.[0]?.channel || '',
            channel_source: item.channels?.[0]?.channel_source || '',
            consumer: item.consumer?.consumer_name || '',
            dnis: item.dnis || '',
            ani: item.ani || '',
            queue_id: item.queues?.[0]?.queue_id || '',
            queue_name: item.queues?.[0]?.queue_name || '',
            user_id: item.users?.[0]?.user_id || '',
            user_name: item.users?.[0]?.user_name || '',
            duration: item.duration,
            hold_count: item.hold_count,
            warm_transfer_initiated_count: item.warm_transfer_initiated_count,
            warm_transfer_completed_count: item.warm_transfer_completed_count,
            direct_transfer_count: item.direct_transfer_count,
            transfer_initiated_count: item.transfer_initiated_count,
            transfer_completed_count: item.transfer_completed_count,
            warm_conference_count: item.warm_conference_count,
            conference_count: item.conference_count,
            abandoned_count: item.abandoned_count,
        }));

        const totalRecords = apiData.length;

        if (apiData.length > 0) {
            await AgentEngagement.bulkCreate(flattenedData, { ignoreDuplicates: true });
        }

        const transformedData = flattenedData.map((item: any) => ({
            engagement_id: item.engagement_id,
            direction: item.direction,
            start_time: item.start_time,
            channel: item.channel || '',
            consumer: item.consumer || '',
            dnis: item.dnis || '',
            ani: item.ani || '',
            queue_id: item.queue_id || '',
            queue_name: item.queue_name || '',
            user_id: item.user_id || '',
            user_name: item.user_name || '',
            duration: item.duration,
            hold_count: item.hold_count,
            warm_transfer_initiated_count: item.warm_transfer_initiated_count,
            warm_transfer_completed_count: item.warm_transfer_completed_count,
            direct_transfer_count: item.direct_transfer_count,
            transfer_initiated_count: item.transfer_initiated_count,
            transfer_completed_count: item.transfer_completed_count,
            warm_conference_count: item.warm_conference_count,
            conference_count: item.conference_count,
            abandoned_count: item.abandoned_count,
        }));

        return {
            data: transformedData.slice(0, 10) as AgentEngagementAttributes[],
            totalRecords,
        };
    } catch (err) {
        throw err;
    }
};