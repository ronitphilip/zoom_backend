import { NextFunction, Response } from "express";
import { AuthenticatedRequest } from "../middlewares/auth";
import { ReportResponse } from "../types/zoom.type";
import { fetchAgentPerfomance, fetchAllTeams, fetchTimeCard, generateGroupSummary, listAllUsers } from "../services/report.service";

export const AgentPerfomanceController = async (req: AuthenticatedRequest, res: Response<ReportResponse>, next: NextFunction) => {
    console.log('AgentPerfomanceController');

    try {
        const user = req.user;
        const { from, to, channel, agent, format, count, page, nextPageToken } = req.body;

        if (!user) {
            return next(Object.assign(new Error('Unauthorized'), { status: 401 }));
        }

        if (!from || !to) {
            return next(Object.assign(new Error('Date missing'), { status: 409 }));
        }

        const result = await fetchAgentPerfomance(user, from, to, channel, agent, format, count, page || 1, nextPageToken);
        const agents = await listAllUsers(user);

        const response = {
            performance: result.data,
            users: agents,
            nextPageToken: result.nextPageToken,
            totalRecords: result.totalRecords,
        };

        res.status(200).json({ success: true, data: response });
    } catch (err) {
        next(err);
    }
};

export const TimeCardController = async (req: AuthenticatedRequest, res: Response<ReportResponse>, next: NextFunction) => {
    console.log('TimeCardController');

    try {
        const user = req.user;
        const { from, to, status, agent, format, count, page, nextPageToken } = req.body;

        if (!user) {
            return next(Object.assign(new Error("Unauthorized"), { status: 401 }));
        }

        if (!from || !to) {
            return next(Object.assign(new Error("Date missing"), { status: 400 }));
        }

        const result = await fetchTimeCard(user, from, to, status, agent, format, count, page, nextPageToken);
        const agents = await listAllUsers(user);

        const response = {
            traceData: result.data,
            users: agents,
            nextPageToken: result.nextPageToken,
            totalRecords: result.totalRecords,
        };

        res.status(200).json({ success: true, data: response });
    } catch (err) {
        next(err);
    }
};

export const GroupSummaryController = async (req: AuthenticatedRequest, res: Response<ReportResponse>, next: NextFunction) => {
    console.log('GroupSummaryController');

    try {
        const user = req.user;
        const { from, to, team_name, channel } = req.body;

        if (!user || !user.id) {
            return next(Object.assign(new Error("Unauthorized: User or user ID missing"), { status: 401 }));
        }

        if (!from || !to) {
            return next(Object.assign(new Error("Date missing"), { status: 400 }));
        }

        const teams = await fetchAllTeams();
        const data = await generateGroupSummary(user, from, to, team_name, channel);

        const result = {
            allteams : teams,
            summary: data
        }

        res.status(200).json({ success: true, data: result });
    } catch (err) {
        next(err);
    }
}