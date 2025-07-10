import { NextFunction, Response } from "express";
import { AuthenticatedRequest } from "../middlewares/auth";
import { fetchAgentQueue, fetchData, getAbandonedCalls, getAgentAbandonedReport, getQueueReport } from "../services/agent-queue.service";
import { QueueResponse } from "../types/queue.type";

export const fetchAgentQueueController = async (req: AuthenticatedRequest, res: Response<QueueResponse>, next: NextFunction) => {
    console.log('fetchAgentQueueController');

    try {
        const user = req.user;
        const { from, to, count, page, queue, agent } = req.body;

        if (!user) {
            return next(Object.assign(new Error('Unauthorized'), { status: 401 }));
        }

        if (!from || !to) {
            return next(Object.assign(new Error('Date missing'), { status: 404 }));
        }

        const result = await fetchAgentQueue(user, from, to, count, page, queue, agent);

        res.status(200).json({ success: true, data: result })
    } catch (err) {
        next(err);
    }
}

export const getDailyQueueController = async (req: AuthenticatedRequest, res: Response<QueueResponse>, next: NextFunction) => {
    console.log('getDailyQueueController');
    try {
        const user = req.user;
        const { from, to, count, page, queueId } = req.body;

        if (!user) {
            return next(Object.assign(new Error("Unauthorized"), { status: 401 }));
        }

        if (!from || !to) {
            return next(Object.assign(new Error("Date missing"), { status: 400 }));
        }

        const result = await getQueueReport(user, from, to, count, page, 'daily', undefined, queueId);

        res.status(200).json({ success: true, data: result });
    } catch (err) {
        next(err);
    }
};

export const getIntervalQueueController = async (req: AuthenticatedRequest, res: Response<QueueResponse>, next: NextFunction) => {
    console.log('getIntervalQueueController');
    try {
        const user = req.user;
        const { from, to, interval, count, page, queueId } = req.body;

        if (!user) {
            return next(Object.assign(new Error("Unauthorized"), { status: 401 }));
        }

        if (!from || !to || !interval) {
            return next(Object.assign(new Error("from, to, and interval are required"), { status: 400 }));
        }

        if (!["15", "30", "60"].includes(interval as string)) {
            return next(Object.assign(new Error("Interval must be 15min, 30min, or 1hr"), { status: 400 }));
        }

        const result = await getQueueReport(user, from, to, count, page, 'interval', interval, queueId);

        res.status(200).json({ success: true, data: result });
    } catch (err) {
        next(err);
    }
};

export const AbandonedCallsController = async (req: AuthenticatedRequest, res: Response<QueueResponse>, next: NextFunction) => {
    console.log('AbandonedCallsController');

    try {
        const user = req.user;
        const { from, to, count, page, queue, direction } = req.body;

        if (!user) {
            return next(Object.assign(new Error("Unauthorized"), { status: 401 }));
        }

        if (!from || !to) {
            return next(Object.assign(new Error("Date missing"), { status: 400 }));
        }

        const result = await getAbandonedCalls(user, from, to, count, page, queue, direction);

        res.status(200).json({ success: true, data: result });
    } catch (err) {
        next(err);
    }
}

export const AgentAbandonedReportController = async (req: AuthenticatedRequest, res: Response<QueueResponse>, next: NextFunction) => {
    console.log('AgentAbandonedReportController');
    try {
        const user = req.user;
        const { from, to, count, page, queueId, username } = req.body;

        if (!user) {
            return next(Object.assign(new Error("Unauthorized"), { status: 401 }));
        }

        if (!from || !to) {
            return next(Object.assign(new Error("Date missing"), { status: 400 }));
        }

        const result = await getAgentAbandonedReport(user, from, to, count, page, queueId, username);

        res.status(200).json({ success: true, data: result });
    } catch (err) {
        next(err);
    }
};

export const RefreshQueueController = async (req: AuthenticatedRequest, res: Response<QueueResponse>, next: NextFunction) => {
    console.log('RefreshQueueController');
    
    try {
        const user = req.user;
        const { from, to, count } = req.body;

        if (!user) {
            return next(Object.assign(new Error('Unauthorized'), { status: 401 }));
        }

        if (!from || !to) {
            return next(Object.assign(new Error('Date missing'), { status: 404 }));
        }

        const result = await fetchData(user, from, to, count);

        res.status(200).json({ success: true, data: result })
    } catch (err) {
        next(err)
    }
}