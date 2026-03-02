import { CallStatus } from "@/types/call";

const API_BASE = "/api"; // Replace with actual backend URL

export async function initiateCall(phoneNumber: string): Promise<{ callId: string }> {
  const res = await fetch(`${API_BASE}/calls`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phoneNumber }),
  });
  if (!res.ok) throw new Error("Failed to initiate call");
  return res.json();
}

export async function getCallStatus(callId: string): Promise<{ status: CallStatus }> {
  const res = await fetch(`${API_BASE}/calls/${callId}/status`);
  if (!res.ok) throw new Error("Failed to get call status");
  return res.json();
}

export async function endCall(callId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/calls/${callId}/end`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to end call");
}
