import { ZoomUser } from "../models/zoom.model";

export interface CallLogEntry {
  id?: string;
  userId?: string;
  direction?: string;
  international?: boolean;
  call_path_id?: string;
  call_id?: string;
  connect_type?: string;
  call_type?: string;
  hide_caller_id?: boolean;
  caller_did_number?: string;
  caller_name?: string;
  callee_did_number?: string;
  callee_name?: string;
  duration?: number;
  call_result?: string;
  start_time?: string;
  end_time?: string;
  caller_number_type?: string;
  caller_country_iso_code?: string;
  caller_country_code?: string;
  callee_ext_id?: string;
  callee_email?: string;
  callee_ext_number?: string;
  callee_ext_type?: string;
  callee_number_type?: string;
  callee_country_iso_code?: string;
  callee_country_code?: string;
  end_to_end?: boolean;
  site_id?: string;
  site_name?: string;
  recording_status?: string;
}

export interface CallLogResponse {
  success: boolean;
  data: CallLogEntry[] | ZoomUser;
}