import { NextFunction, Response } from "express";
import { AuthenticatedRequest } from "../middlewares/auth";
import { ReportResponse } from "../types/zoom.type";
import { fetchAgentEngagement, fetchAgentPerformance, fetchAllTeams, fetchTimeCard, generateGroupSummary, getAgentLoginReport, listAllUsers, refreshAgentEngagement, refreshAgentPerformance, refreshgetAgentLogin, refreshGroupSummary, refreshTimeCard } from "../services/report.service";

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

        const result = await fetchAgentPerformance(user, from, to, channel, agent, format, count, page || 1, nextPageToken);
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

export const RefreshAgentPerformanceController = async (req: AuthenticatedRequest, res: Response<ReportResponse>, next: NextFunction) => {
    console.log('RefreshAgentPerformanceController');

    try {
        const user = req.user;
        const { from, to, count } = req.body;

        if (!user) {
            return next(Object.assign(new Error('Unauthorized'), { status: 401 }));
        }

        if (!from || !to) {
            return next(Object.assign(new Error('Date missing'), { status: 409 }));
        }

        const result = await refreshAgentPerformance(user, from, to, count);
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
            allteams: teams,
            summary: data
        }

        res.status(200).json({ success: true, data: result });
    } catch (err) {
        next(err);
    }
}

export const AgentEngagementController = async (req: AuthenticatedRequest, res: Response<ReportResponse>, next: NextFunction) => {
    console.log('AgentEngagementController');

    try {
        const user = req.user;
        const { from, to, channel, agent, format, count, page, nextPageToken } = req.body;

        if (!user) {
            return next(Object.assign(new Error('Unauthorized'), { status: 401 }));
        }

        if (!from || !to) {
            return next(Object.assign(new Error('Date missing'), { status: 409 }));
        }

        const result = await fetchAgentEngagement(user, from, to, channel, agent, format, count, page, nextPageToken);
        const agents = await listAllUsers(user);

        const response = {
            engagement: result.data,
            users: agents,
            nextPageToken: result.nextPageToken,
            totalRecords: result.totalRecords,
        };

        res.status(200).json({ success: true, data: response });

    } catch (err) {
        next(err)
    }
}

export const RefreshTimeCardController = async (req: AuthenticatedRequest, res: Response<ReportResponse>, next: NextFunction) => {
    console.log('RefreshTimeCardController');

    try {
        const user = req.user;
        const { from, to, count } = req.body;

        if (!user) {
            return next(Object.assign(new Error("Unauthorized"), { status: 401 }));
        }

        if (!from || !to) {
            return next(Object.assign(new Error("Date missing"), { status: 400 }));
        }

        const result = await refreshTimeCard(user, from, to, count);
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

export const RefreshGroupSummaryController = async (req: AuthenticatedRequest, res: Response<ReportResponse>, next: NextFunction) => {
    console.log('RefreshGroupSummaryController');

    try {
        const user = req.user;
        const { from, to } = req.body;

        if (!user || !user.id) {
            return next(Object.assign(new Error("Unauthorized: User or user ID missing"), { status: 401 }));
        }

        if (!from || !to) {
            return next(Object.assign(new Error("Date missing"), { status: 400 }));
        }

        const teams = await fetchAllTeams();
        const data = await refreshGroupSummary(user, from, to);

        const result = {
            allteams: teams,
            summary: data
        };

        res.status(200).json({ success: true, data: result });
    } catch (err) {
        next(err);
    }
};

export const RefreshAgentEngagementController = async (req: AuthenticatedRequest, res: Response<ReportResponse>, next: NextFunction) => {
    console.log('RefreshAgentEngagementController');

    try {
        const user = req.user;
        const { from, to, count } = req.body;

        if (!user) {
            return next(Object.assign(new Error('Unauthorized'), { status: 401 }));
        }

        if (!from || !to) {
            return next(Object.assign(new Error('Date missing'), { status: 409 }));
        }

        const result = await refreshAgentEngagement(user, from, to, count);
        const agents = await listAllUsers(user);

        const response = {
            engagement: result.data,
            users: agents,
            nextPageToken: result.nextPageToken,
            totalRecords: result.totalRecords,
        };

        res.status(200).json({ success: true, data: response });
    } catch (err) {
        next(err);
    }
};

export const AgentLoginReportController = async (req: AuthenticatedRequest, res: Response<ReportResponse>, next: NextFunction) => {
    console.log('AgentLoginReportController');
    
    try {
        const user = req.user;
        const { from, to, agent, format, count, page } = req.body;

        if (!user) {
            return next(Object.assign(new Error("Unauthorized"), { status: 401 }));
        }

        if (!from || !to) {
            return next(Object.assign(new Error("Date missing"), { status: 400 }));
        }

        const result = await getAgentLoginReport(user, from, to, format, count, page, agent);

        res.status(200).json({success: true, data: result})
    } catch (err) {
        next(err)
    }
}

export const RefreshAgentLoginController = async (req: AuthenticatedRequest, res: Response<ReportResponse>, next: NextFunction) => {
    console.log('RefreshAgentLoginController');
    
    try {
        const user = req.user;
        const { from, to, count } = req.body;

        if (!user) {
            return next(Object.assign(new Error("Unauthorized"), { status: 401 }));
        }

        if (!from || !to) {
            return next(Object.assign(new Error("Date missing"), { status: 400 }));
        }

        const result = await refreshgetAgentLogin(user, from, to, count);

        res.status(200).json({success: true, data: result})
    } catch (err) {
        next(err)
    }
}