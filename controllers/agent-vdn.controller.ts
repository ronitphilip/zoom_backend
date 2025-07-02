import { NextFunction, Response } from "express";
import { AuthenticatedRequest } from "../middlewares/auth";
import { QueueResponse } from "../types/queue.type";
import { fetchFlowData, getFlowIntervalReport } from "../services/agent-vdn.service";

export const fetchFlowDataController = async (req: AuthenticatedRequest, res: Response<QueueResponse>, next: NextFunction) => {
    console.log('fetchFlowDataController');

    try {
        const user = req.user;
        const { from, to, count, page, flowId, flowName, nextPageToken } = req.body;

        if (!user) {
            return next(Object.assign(new Error('Unauthorized'), { status: 401 }));
        }

        if (!from || !to) {
            return next(Object.assign(new Error('Date missing'), { status: 400 }));
        }

        const result = await fetchFlowData(user, from, to, count, page, flowId, flowName, nextPageToken);

        res.status(200).json({ success: true, data: result });
    } catch (err) {
        next(err);
    }
};

export const getFlowIntervalController = async (req: AuthenticatedRequest, res: Response<QueueResponse>, next: NextFunction) => {
    console.log('getFlowIntervalController');

    try {
        const user = req.user;
        const { from, to, interval, count, page, nextPageToken, flowId, flowName } = req.body;

        if (!user) {
            return next(Object.assign(new Error("Unauthorized"), { status: 401 }));
        }

        if (!from || !to || !interval) {
            return next(Object.assign(new Error("from, to, and interval are required"), { status: 400 }));
        }

        if (!["15", "30", "60"].includes(interval as string)) {
            return next(Object.assign(new Error("Interval must be 15min, 30min, or 1hr"), { status: 400 }));
        }

        const result = await getFlowIntervalReport(user, from, to, count, page, interval, nextPageToken, flowId, flowName);

        res.status(200).json({ success: true, data: result });
    } catch (err) {
        next(err);
    }
};