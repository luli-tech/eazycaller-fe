import { CallStatus } from "@/types/call";

const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? "/api").replace(/\/$/, "");

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

export interface VoiceTokenResponse {
  token: string;
  identity: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

function jsonHeaders(): HeadersInit {
  return {
    "Content-Type": "application/json",
  };
}

function authHeaders(token: string): HeadersInit {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
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
  token: string
): Promise<{ call_id: string; status: string }> {
  const res = await fetch(`${API_BASE}/call`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ destination_number: phoneNumber }),
  });
  if (!res.ok) throw new Error(await readError(res));
  return res.json();
}

export async function getCallStatus(
  callId: string,
  token: string
): Promise<ApiCallStatus> {
  const res = await fetch(`${API_BASE}/call/${callId}/status`, {
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error(await readError(res));
  return res.json();
}

export async function endCall(
  callId: string,
  token: string
): Promise<ApiCallStatus> {
  const res = await fetch(`${API_BASE}/call/${callId}/end`, {
    method: "POST",
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error(await readError(res));
  return res.json();
}

export async function listCalls(token: string): Promise<ApiCallRecord[]> {
  const res = await fetch(`${API_BASE}/calls`, {
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error(await readError(res));
  return res.json();
}

export async function getVoiceToken(token: string): Promise<VoiceTokenResponse> {
  const res = await fetch(`${API_BASE}/voice/token`, {
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error(await readError(res));
  return res.json();
}

export async function loginWithPassword(
  email: string,
  password: string
): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: jsonHeaders(),
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error(await readError(res));
  return res.json();
}

export async function registerWithPassword(
  email: string,
  password: string,
  name: string
): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: jsonHeaders(),
    body: JSON.stringify({ email, password, name }),
  });
  if (!res.ok) throw new Error(await readError(res));
  return res.json();
}

export async function getCurrentUser(token: string): Promise<AuthUser> {
  const res = await fetch(`${API_BASE}/auth/me`, {
    headers: authHeaders(token),
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
