import commonAPI from "../config/commonAPI";
import { AgentQueue } from "../models/agent-queue.model";
import { AuthenticatedPayload } from "../types/user.type";
import { getAccessToken } from "../utils/accessToken";

export const fetchData = async (user: AuthenticatedPayload, from: string, to: string, nextPageToken?: string) => {
    try {
        const token = await getAccessToken(user.id);
        if (!token) throw Object.assign(new Error("Server token missing"), { status: 401 });

        const queryParams = new URLSearchParams({
            from,
            to,
            page_size: '100',
        });

        if (nextPageToken && !nextPageToken.startsWith('db_page_')) {
            queryParams.append('next_page_token', nextPageToken);
        }

        const result = await commonAPI("GET", `/contact_center/engagements?${queryParams.toString()}`, {}, {}, token);

        const flattenedData = result.engagements?.map((item: any) => ({
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

    } catch (err) {
        throw err
    }
}