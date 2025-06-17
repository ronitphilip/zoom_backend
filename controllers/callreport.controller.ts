import { NextFunction, Request, Response } from "express";
import { getAccessToken } from "../zoom/accessToken";
import axios from "axios";
import { CallLogEntry, CallLogResponse } from "../types/zoom.type";

export const OutbondCalls = async (req: Request, res: Response<CallLogResponse>, next: NextFunction) => {
  console.log('OutBondCalls');

  try {
    const token = await getAccessToken();
    if (!token) {
      return next(Object.assign(new Error('Token missing'), { status: 401 }));
    }

    const response = await axios.get<{ call_logs: CallLogEntry[] }>(
      `${process.env.ZOOM_URL}/phone/call_logs`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          direction: 'outbound',
          page_size: 20,
        },
      }
    );

    const callDetails = (response.data.call_logs || []).map((log: CallLogEntry) => ({
      id: log.id ?? 'N/A',
      caller_number: log.caller_number ?? 'Unknown',
      caller_name: log.caller_name ?? 'Unknown',
      callee_number: log.callee_number ?? 'Unknown',
      callee_name: log.callee_name ?? 'Unknown',
      duration: log.duration ?? 0,
      result: log.result ?? 'Unknown',
      date_time: log.date_time ? new Date(log.date_time).toLocaleString() : 'N/A',
    }));

    res.status(200).json({ success: true, data: callDetails });

  } catch (err: any) {
    next(err);
  }
};

export const InbondCalls = async (req: Request, res: Response<CallLogResponse>, next: NextFunction) => {
  console.log('InbondCalls');

  try {
    const token = await getAccessToken();
    if (!token) {
      return next(Object.assign(new Error('Token missing'), { status: 401 }));
    }

    const response = await axios.get<{ call_logs: CallLogEntry[] }>(
      `${process.env.ZOOM_URL}/phone/call_logs`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          direction: 'inbound',
          page_size: 20,
        },
      }
    );

    const callDetails = (response.data.call_logs || []).map((log: CallLogEntry) => ({
      id: log.id ?? 'N/A',
      caller_number: log.caller_number ?? 'Unknown',
      caller_name: log.caller_name ?? 'Unknown',
      callee_number: log.callee_number ?? 'Unknown',
      callee_name: log.callee_name ?? 'Unknown',
      duration: log.duration ?? 0,
      result: log.result ?? 'Unknown',
      date_time: log.date_time ? new Date(log.date_time).toLocaleString() : 'N/A',
    }));

    res.status(200).json({ success: true, data: callDetails });

  } catch (err: any) {
    next(err);
  }
};