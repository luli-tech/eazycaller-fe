export type CallStatus = "idle" | "calling" | "ringing" | "connected" | "ended" | "failed";

export interface CallRecord {
  id: string;
  callId?: string;
  phoneNumber: string;
  date: string;
  duration: number; // seconds
  status: "connected" | "failed" | "ended";
  cost?: number;
}
