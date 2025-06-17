import { NextFunction, Response } from "express";
import { CallLogResponse } from "../types/zoom.type";
import { AuthenticatedRequest } from "../middlewares/auth";
import { getCallDetails, refreshCallLogs, saveUserCredentials } from "../services/zoom.service";

export const SaveZoomCredentials = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  console.log('SaveZoomCredentials');

  try {
    const user = req.user;
    const { account_id, client_id, client_password } = req.body;

    if (!user?.id || !account_id || !client_id || !client_password) {
      return next(Object.assign(new Error('Credentials missing'), { status: 400 }));
    }

    const result = await saveUserCredentials(user.id, account_id, client_id, client_password);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

export const OutbondCalls = async (req: AuthenticatedRequest, res: Response<CallLogResponse>, next: NextFunction) => {
  console.log('OutBondCalls');

  try {
    const user = req.user;
    const { from, to } = req.body;

    if (!user) {
      return next(Object.assign(new Error('Unauthorized'), { status: 401 }));
    }

    const result = await getCallDetails(user, 'outbound', from, to)

    res.status(200).json({ success: true, data: result });

  } catch (err) {
    next(err);
  }
};

export const InbondCalls = async (req: AuthenticatedRequest, res: Response<CallLogResponse>, next: NextFunction) => {
  console.log('InbondCalls');

  try {
    const user = req.user;
    const { from, to } = req.body;

    if (!user) {
      return next(Object.assign(new Error('Unauthorized'), { status: 401 }));
    }

    const result = await getCallDetails(user, 'inbound', from, to)

    res.status(200).json({ success: true, data: result });

  } catch (err) {
    next(err);
  }
};

export const RefreshCallLogs = async (req: AuthenticatedRequest, res: Response<CallLogResponse>, next: NextFunction) => {
  console.log('RefreshCallLogs');

  try {
    const user = req.user;
    const { from, to, direction } = req.body;

    if (!user) {
      return next(Object.assign(new Error('Unauthorized'), { status: 401 }));
    }

    if (!['inbound', 'outbound'].includes(direction)) {
      return next(Object.assign(new Error('Invalid direction'), { status: 400 }));
    }

    const result = await refreshCallLogs(user, direction, from, to);

    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};