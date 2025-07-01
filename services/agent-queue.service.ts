import { Op, fn, col, literal } from 'sequelize';
import commonAPI from "../config/commonAPI";
import { AbandonedCall, DetailedQueueReport, QueueAttributes } from "../types/queue.type";
import { AuthenticatedPayload } from "../types/user.type";
import { getAccessToken } from "../utils/accessToken";
import { AgentQueue } from "../models/agent-queue.model";

const fetchData = async (id: number, from: string, to: string): Promise<QueueAttributes[]> => {
    try {
        const token = await getAccessToken(id);
        if (!token) throw Object.assign(new Error("Server token missing"), { status: 401 });

        const queryParams = new URLSearchParams({
            from,
            to,
            page_size: '1000'
        });

        const result = await commonAPI("GET", `/contact_center/engagements?${queryParams.toString()}`, {}, {}, token);

        const flattenedData = result.engagements.map((item: any) => ({
            engagement_id: item.engagement_id,
            direction: item.direction,
            start_time: item.start_time,
            end_time: item.end_time,
            channel_types: item.channel_types,
            consumer_number: item.consumers?.[0]?.consumer_number,
            consumer_id: item.consumers?.[0]?.consumer_id,
            consumer_display_name: item.consumers?.[0]?.consumer_display_name,
            flow_id: item.flows?.[0]?.flow_id,
            flow_name: item.flows?.[0]?.flow_name,
            cc_queue_id: item.queues?.[0]?.cc_queue_id,
            queue_name: item.queues?.[0]?.queue_name,
            user_id: item.agents?.[0]?.user_id,
            display_name: item.agents?.[0]?.display_name,
            channel: item.channels?.[0]?.channel,
            channel_source: item.channels?.[0]?.channel_source,
            queue_wait_type: item.queue_wait_type,
            duration: item.duration,
            flow_duration: item.flow_duration,
            waiting_duration: item.waiting_duration,
            handling_duration: item.handling_duration,
            wrap_up_duration: item.wrap_up_duration,
            voice_mail: item.voice_mail,
            talk_duration: item.talk_duration,
            transferCount: item.transferCount,
        }));

        await AgentQueue.bulkCreate(flattenedData, {
            updateOnDuplicate: ['engagement_id'],
        });

        return flattenedData;
    } catch (err) {
        throw err
    }
}

export const fetchAgentQueue = async (user: AuthenticatedPayload, from: string, to: string): Promise<QueueAttributes[]> => {
    try {
        const whereClause: any = {
            start_time: { [Op.between]: [from, to] },
        };

        const existingData = await AgentQueue.findAll({
            where: whereClause,
            attributes: [
                'engagement_id',
                'direction',
                'start_time',
                'consumer_number',
                'consumer_id',
                'consumer_display_name',
                'flow_name',
                'queue_name',
                'user_id',
                'display_name',
                'channel',
                'queue_wait_type',
                'duration',
                'flow_duration',
                'waiting_duration',
                'handling_duration',
                'wrap_up_duration',
                'voice_mail',
                'talk_duration',
                'transferCount',
            ],
        });

        if (existingData.length > 0) {
            return existingData as QueueAttributes[];
        }

        return await fetchData(user.id, from, to);

    } catch (err) {
        throw err;
    }
}

export const getQueueReport = async (user: AuthenticatedPayload, from: string, to: string, grouping: 'daily' | 'interval', intervalMinutes?: 15 | 30 | 60): Promise<DetailedQueueReport[]> => {
    try {
        let dateFormat: string;
        if (grouping === 'daily') {
            dateFormat = 'YYYY-MM-DD';
        } else if (grouping === 'interval' && intervalMinutes) {
            dateFormat = intervalMinutes === 60 ? 'YYYY-MM-DD HH24:00' : 'YYYY-MM-DD HH24:MI';
        } else {
            throw new Error('Invalid grouping or interval');
        }

        const existingData = await AgentQueue.findAll({
            where: {
                start_time: { [Op.between]: [from, to] },
            },
            attributes: ['engagement_id'],
            limit: 1,
        });

        if (existingData.length === 0) {
            await fetchData(user.id, from, to);
        }

        const results = await AgentQueue.findAll({
            where: {
                start_time: { [Op.between]: [from, to] },
            },
            attributes: [
                [
                    fn('TO_CHAR', literal('CAST("start_time" AS TIMESTAMP)'), literal(`'${dateFormat}'`)),
                    'date',
                ],
                [col('cc_queue_id'), 'queueId'],
                [col('queue_name'), 'queueName'],
                [col('user_id'), 'agentId'],
                [col('display_name'), 'agentName'],
                [fn('COUNT', col('engagement_id')), 'totalOffered'],
                [
                    fn('SUM', literal('CASE WHEN handling_duration > 0 THEN 1 ELSE 0 END')),
                    'totalAnswered',
                ],
                [
                    fn('SUM', literal('CASE WHEN handling_duration = 0 THEN 1 ELSE 0 END')),
                    'abandonedCalls',
                ],
                [fn('SUM', col('handling_duration')), 'acdTime'],
                [fn('SUM', col('wrap_up_duration')), 'acwTime'],
                [fn('SUM', col('waiting_duration')), 'agentRingTime'],
                [
                    fn('AVG', literal('CASE WHEN handling_duration > 0 THEN handling_duration + wrap_up_duration ELSE NULL END')),
                    'avgHandleTime',
                ],
                [
                    fn('AVG', literal('CASE WHEN wrap_up_duration > 0 THEN wrap_up_duration ELSE NULL END')),
                    'avgAcwTime',
                ],
                [
                    fn('MAX', literal('handling_duration + wrap_up_duration')),
                    'maxHandleTime',
                ],
                [fn('SUM', col('transferCount')), 'transferCount'],
                [
                    fn('SUM', literal("CASE WHEN channel = 'voice' THEN 1 ELSE 0 END")),
                    'voiceCalls',
                ],
                [
                    fn('SUM', literal("CASE WHEN channel != 'voice' THEN 1 ELSE 0 END")),
                    'digitalInteractions',
                ],
            ],
            group: [
                fn('TO_CHAR', literal('CAST("start_time" AS TIMESTAMP)'), literal(`'${dateFormat}'`)),
                'cc_queue_id',
                'queue_name',
                'user_id',
                'display_name',
            ],
            raw: true,
        });

        const formattedResults: DetailedQueueReport[] = results.map((result: any) => ({
            date: result.date,
            queueId: result.queueId,
            queueName: result.queueName,
            agentId: result.agentId || null,
            agentName: result.agentName || null,
            totalOffered: Number(result.totalOffered) || 0,
            totalAnswered: Number(result.totalAnswered) || 0,
            abandonedCalls: Number(result.abandonedCalls) || 0,
            acdTime: Number(result.acdTime) || 0,
            acwTime: Number(result.acwTime) || 0,
            agentRingTime: Number(result.agentRingTime) || 0,
            avgHandleTime: Number(result.avgHandleTime) || 0,
            avgAcwTime: Number(result.avgAcwTime) || 0,
            maxHandleTime: Number(result.maxHandleTime) || 0,
            transferCount: Number(result.transferCount) || 0,
            voiceCalls: Number(result.voiceCalls) || 0,
            digitalInteractions: Number(result.digitalInteractions) || 0,
        }));

        return formattedResults;
    } catch (err) {
        throw err;
    }
};

export const getAbandonedCalls = async (user: AuthenticatedPayload, from: string, to: string): Promise<AbandonedCall[]> => {
    try {
        const existingData = await AgentQueue.findAll({
            where: {
                start_time: { [Op.between]: [from, to] },
                handling_duration: 0
            },
            attributes: ['engagement_id'],
            limit: 1,
        });

        if (existingData.length === 0) {
            await fetchData(user.id, from, to);
        }

        const results = await AgentQueue.findAll({
            where: {
                start_time: { [Op.between]: [from, to] },
                handling_duration: 0
            },
            attributes: [
                [fn('TO_CHAR', literal('CAST("start_time" AS TIMESTAMP)'), literal("'YYYY-MM-DD HH24:MI:SS'")), 'startTime'],
                'engagement_id',
                'direction',
                'consumer_number',
                'consumer_id',
                'consumer_display_name',
                'queue_name',
                'channel',
                'queue_wait_type',
                'waiting_duration'
            ],
            raw: true,
        });

        const formattedResults: AbandonedCall[] = results.map((result: any) => ({
            startTime: result.startTime,
            engagementId: result.engagement_id,
            direction: result.direction || null,
            consumerNumber: result.consumer_number || null,
            consumerId: result.consumer_id || null,
            consumerDisplayName: result.consumer_display_name || null,
            queueName: result.queue_name || null,
            channel: result.channel || null,
            queueWaitType: result.queue_wait_type || null,
            waitingDuration: Number(result.waiting_duration) || 0
        }));

        return formattedResults;
    } catch (err) {
        throw err;
    }
}