import { CallStatus } from "@/types/call";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "/api";

export interface ApiCallRecord {
  call_id: string;
  provider_call_id: string;
  destination_number: string;
  status: string;
  duration: number | null;
  cost: number;
  created_at: string;
  updated_at: string;
}

export interface ApiCallStatus {
  call_id: string;
  status: string;
  duration: number | null;
  cost: number;
}

function headers(userId: string): HeadersInit {
  return {
    "Content-Type": "application/json",
    "X-User-ID": userId,
  };
}

async function readError(res: Response): Promise<string> {
  try {
    const body = await res.json();
    return body.error ?? "Request failed";
  } catch {
    return "Request failed";
  }
}

export async function initiateCall(
  phoneNumber: string,
  userId: string
): Promise<{ call_id: string; status: string }> {
  const res = await fetch(`${API_BASE}/call`, {
    method: "POST",
    headers: headers(userId),
    body: JSON.stringify({ destination_number: phoneNumber }),
  });
  if (!res.ok) throw new Error(await readError(res));
  return res.json();
}

export async function getCallStatus(
  callId: string,
  userId: string
): Promise<ApiCallStatus> {
  const res = await fetch(`${API_BASE}/call/${callId}/status`, {
    headers: headers(userId),
  });
  if (!res.ok) throw new Error(await readError(res));
  return res.json();
}

export async function endCall(
  callId: string,
  userId: string
): Promise<ApiCallStatus> {
  const res = await fetch(`${API_BASE}/call/${callId}/end`, {
    method: "POST",
    headers: headers(userId),
  });
  if (!res.ok) throw new Error(await readError(res));
  return res.json();
}

export async function listCalls(userId: string): Promise<ApiCallRecord[]> {
  const res = await fetch(`${API_BASE}/calls`, {
    headers: headers(userId),
  });
  if (!res.ok) throw new Error(await readError(res));
  return res.json();
}

export function mapProviderStatus(status: string): CallStatus {
  switch (status) {
    case "initiated":
    case "queued":
      return "calling";
    case "ringing":
      return "ringing";
    case "answered":
    case "in-progress":
      return "connected";
    case "completed":
    case "ended":
      return "ended";
    case "busy":
    case "canceled":
    case "failed":
    case "no-answer":
      return "failed";
    default:
      return "calling";
  }
}
