export interface QueueResponse {
    success: boolean;
    data: any;
}

export interface AgentQueueReponse {
    reports: QueueAttributes[];
    nextPageToken: string | undefined;
    totalRecords: number,
}

export interface QueueAttributes {
    id?: number;
    engagement_id?: string;
    direction?: string;
    start_time?: string;
    channel_types?: string;
    consumer_number?: string;
    consumer_id?: string;
    consumer_display_name?: string;
    flow_id?: string;
    flow_name?: string;
    cc_queue_id?: string;
    queue_name?: string;
    user_id?: string;
    display_name?: string;
    channel?: string;
    channel_source?: string;
    queue_wait_type?: string;
    duration?: number;
    flow_duration?: number;
    waiting_duration?: number;
    handling_duration?: number;
    wrap_up_duration?: number;
    voice_mail?: number;
    talk_duration?: number;
    transferCount?: number;
}

export interface DetailedQueueReport {
    date: string;
    queueId: string;
    queueName?: string;
    agentName?: string | null;
    agentId?: string | null;
    totalOffered?: number;
    totalAnswered?: number;
    abandonedCalls?: number;
    acdTime?: number;
    acwTime?: number;
    agentRingTime?: number;
    avgHandleTime?: number;
    avgAcwTime?: number;
    maxHandleTime?: number;
    transferCount?: number;
    voiceCalls?: number;
    digitalInteractions?: number;
}

export interface AbandonedCall {
    startTime: string;
    engagementId: string;
    direction: string | null;
    consumerNumber: string | null;
    consumerId: string | null;
    consumerDisplayName: string | null;
    queueName: string | null;
    channel: string | null;
    queueWaitType: string | null;
    waitingDuration: number;
}