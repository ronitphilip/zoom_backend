import { ZoomUser } from "../models/zoom.model";

export interface CallLogEntry {
  id?: string;
  userId?: string;
  direction?: string;
  caller_did_number?: string;
  caller_name?: string;
  callee_did_number?: string;
  callee_name?: string;
  duration?: number;
  call_result?: string;
  start_time?: string;
  end_time?: string;
}

export interface CallLogResponse {
  success: boolean;
  data: CallLogEntry[] | ZoomUser;
}