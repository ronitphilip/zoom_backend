import { NextFunction, Response } from "express";
import { AuthenticatedRequest } from "../middlewares/auth";
import { fetchAgentQueue, getAbandonedCalls, getQueueReport } from "../services/agent-queue.service";
import { QueueResponse } from "../types/queue.type";

export const fetchAgentQueueController = async (req: AuthenticatedRequest, res: Response<QueueResponse>, next: NextFunction) => {
    console.log('fetchAgentQueues');

    try {
        const user = req.user;
        const { from, to, count, page, nextPageToken } = req.body;

        if (!user) {
            return next(Object.assign(new Error('Unauthorized'), { status: 401 }));
        }

        if (!from || !to) {
            return next(Object.assign(new Error('Date missing'), { status: 404 }));
        }

        const result = await fetchAgentQueue(user, from, to, count, page, nextPageToken);

        res.status(200).json({ success: true, data: result })
    } catch (err) {
        next(err);
    }
}

export const getDailyQueueController = async (req: AuthenticatedRequest, res: Response<QueueResponse>, next: NextFunction) => {
    console.log('getDailyQueueController');
    try {
        const user = req.user;
        const { from, to, count, page, nextPageToken } = req.body;

        if (!user) {
            return next(Object.assign(new Error("Unauthorized"), { status: 401 }));
        }

        if (!from || !to) {
            return next(Object.assign(new Error("Date missing"), { status: 400 }));
        }

        const result = await getQueueReport(user, from, to, count, page, 'daily', undefined, nextPageToken);

        res.status(200).json({ success: true, data: result });
    } catch (err) {
        next(err);
    }
};

export const getIntervalQueueController = async (req: AuthenticatedRequest, res: Response<QueueResponse>, next: NextFunction) => {
    console.log('getIntervalQueueController');
    try {
        const user = req.user;
        const { from, to, interval, count, page, nextPageToken } = req.body;

        if (!user) {
            return next(Object.assign(new Error("Unauthorized"), { status: 401 }));
        }

        if (!from || !to || !interval) {
            return next(Object.assign(new Error("from, to, and interval are required"), { status: 400 }));
        }

        if (!["15", "30", "60"].includes(interval as string)) {
            return next(Object.assign(new Error("Interval must be 15min, 30min, or 1hr"), { status: 400 }));
        }

        const result = await getQueueReport(user, from, to, count, page, 'interval', interval, nextPageToken);

        res.status(200).json({ success: true, data: result });
    } catch (err) {
        next(err);
    }
};

export const AbandonedCallsController = async (req: AuthenticatedRequest, res: Response<QueueResponse>, next: NextFunction) => {
    console.log('AbandonedCallsController');

    try {
        const user = req.user;
        const { from, to, count, page, nextPageToken } = req.body;

        if (!user) {
            return next(Object.assign(new Error("Unauthorized"), { status: 401 }));
        }

        if (!from || !to) {
            return next(Object.assign(new Error("Date missing"), { status: 400 }));
        }

        const result = await getAbandonedCalls(user, from, to, count, page, nextPageToken);

        res.status(200).json({ success: true, data: result });
    } catch (err) {
        next(err);
    }
}