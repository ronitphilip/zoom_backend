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

export interface ReportResponse {
  success: boolean;
  data: AgentReport[] | QueueReport[]
}

export interface ApiResponse {
  users: any[];
}

export interface AgentReport {
  id?: number;
  date?: string;
  time?: string;
  status?: string;
  sub_status?: string;
  duration?: number;
  queue?: string;
  handle_duration?: number;
  hold_duration?: number;
  wrap_up_duration?: number;
  channel?: string;
  direction?: string;
  calling_party?: string;
  transfer_initiated_count?: number;
  transfer_completed_count?: number;
  user_name?: string;
}

export interface QueueReport {
  user_id: string;
  user_name: string;
  queue_name: string;
  date: string;
  total_handle_duration: number;
  total_hold_duration: number;
  total_wrap_up_duration: number;
  total_transfer_initiated_count: number;
  total_transfer_completed_count: number;
  total_handled_count: number;
  total_outbound_handled_count: number;
  total_inbound_handled_count: number;
  total_ready_duration: number;
  total_occupied_duration: number;
}