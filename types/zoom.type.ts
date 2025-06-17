export interface CallLogEntry {
  id?: string;
  caller_number?: string;
  caller_name?: string;
  callee_number?: string;
  callee_name?: string;
  duration?: number;
  result?: string;
  date_time?: string;
}

export interface CallLogResponse {
  success: boolean;
  data: CallLogEntry[];
}