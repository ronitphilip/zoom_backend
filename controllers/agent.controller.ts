import { NextFunction, Response } from "express";
import { AuthenticatedRequest } from "../middlewares/auth";
import { ReportResponse } from "../types/zoom.type";
import { fetchAgentReports, fetchQueueReports } from "../services/report.service";

export const AgentReportController = async (req: AuthenticatedRequest, res: Response<ReportResponse>, next: NextFunction) => {
    console.log('AgentReport');

    try {
        const user = req.user;
        const { from, to } = req.body;

        if (!user) {
            return next(Object.assign(new Error('Unauthorized'), { status: 401 }));
        }

        if (!from || !to) {
            return next(Object.assign(new Error('Date missing'), { status: 409 }));
        }

        const result = await fetchAgentReports(user, from, to)

        res.status(200).json({ success: true, data: result });

    } catch (err) {
        next(err);
    }
};

export const QueueReportController = async (req: AuthenticatedRequest, res: Response<ReportResponse>, next: NextFunction) => {
    console.log('QueueReportController');
    
    try {
        const user = req.user;
        const { from, to } = req.body;

        if (!user) {
            return next(Object.assign(new Error("Unauthorized"), { status: 401 }));
        }

        if (!from || !to) {
            return next(Object.assign(new Error("Date missing"), { status: 400 }));
        }

        const result = await fetchQueueReports(user, from, to);

        res.status(200).json({success: true, data: result});
    } catch (err) {
        next(err);
    }
};