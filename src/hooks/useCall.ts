import { useState, useRef, useCallback, useEffect } from "react";
import { CallStatus, CallRecord } from "@/types/call";
import {
  ApiCallRecord,
  endCall as endBackendCall,
  getCallStatus,
  initiateCall as initiateBackendCall,
  listCalls,
  mapProviderStatus,
} from "@/services/api";

function normalizePhoneNumber(value: string): string {
  return value.replace(/[\s-]/g, "");
}

function toCallRecord(call: ApiCallRecord): CallRecord {
  const mappedStatus = mapProviderStatus(call.status);
  return {
    id: call.call_id,
    callId: call.call_id,
    phoneNumber: call.destination_number,
    date: call.created_at,
    duration: call.duration ?? 0,
    status: mappedStatus === "failed" ? "failed" : mappedStatus === "ended" ? "ended" : "connected",
    cost: call.cost,
  };
}

export function useCall(userId?: string) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [status, setStatus] = useState<CallStatus>("idle");
  const [callHistory, setCallHistory] = useState<CallRecord[]>([]);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState("");
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const pollRef = useRef<NodeJS.Timeout | null>(null);
  const callStartRef = useRef<Date | null>(null);
  const activeCallIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!userId) return;

    listCalls(userId)
      .then((calls) => {
        setCallHistory(calls.map(toCallRecord));
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Unable to load calls");
      });
  }, [userId]);

  useEffect(() => {
    if (status === "connected") {
      callStartRef.current = new Date();
      setDuration(0);
      timerRef.current = setInterval(() => {
        setDuration((d) => d + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [status]);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  const upsertHistory = useCallback((record: CallRecord) => {
    setCallHistory((prev) => {
      const withoutCurrent = prev.filter((item) => item.id !== record.id);
      return [record, ...withoutCurrent].slice(0, 50);
    });
  }, []);

  const addLocalHistory = useCallback(
    (finalStatus: "connected" | "failed" | "ended", finalDuration: number, callId?: string) => {
      const record: CallRecord = {
        id: callId ?? crypto.randomUUID(),
        callId,
        phoneNumber,
        date: new Date().toISOString(),
        duration: finalDuration,
        status: finalStatus,
      };
      upsertHistory(record);
    },
    [phoneNumber, upsertHistory]
  );

  const refreshActiveStatus = useCallback(async () => {
    if (!userId || !activeCallIdRef.current) return;

    const current = await getCallStatus(activeCallIdRef.current, userId);
    const mappedStatus = mapProviderStatus(current.status);
    setStatus(mappedStatus);

    if (current.duration !== null) {
      setDuration(current.duration);
    }

    if (mappedStatus === "ended" || mappedStatus === "failed") {
      stopPolling();
      addLocalHistory(
        mappedStatus,
        current.duration ?? duration,
        current.call_id
      );
      activeCallIdRef.current = null;
      setTimeout(() => setStatus("idle"), 2000);
    }
  }, [addLocalHistory, duration, stopPolling, userId]);

  const initiateCall = useCallback(async () => {
    if (!phoneNumber || status !== "idle" || !userId) return;

    setError("");
    setStatus("calling");
    setDuration(0);

    try {
      const response = await initiateBackendCall(normalizePhoneNumber(phoneNumber), userId);
      activeCallIdRef.current = response.call_id;
      setStatus(mapProviderStatus(response.status));
      stopPolling();
      pollRef.current = setInterval(() => {
        refreshActiveStatus().catch((err) => {
          setError(err instanceof Error ? err.message : "Unable to refresh call status");
          stopPolling();
          setStatus("failed");
        });
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to initiate call");
      addLocalHistory("failed", 0);
      setStatus("failed");
      setTimeout(() => setStatus("idle"), 3000);
    }
  }, [addLocalHistory, phoneNumber, refreshActiveStatus, status, stopPolling, userId]);

  const hangUp = useCallback(async () => {
    stopPolling();
    const callId = activeCallIdRef.current;
    const finalDuration = duration;

    try {
      if (callId && userId) {
        const response = await endBackendCall(callId, userId);
        addLocalHistory("ended", response.duration ?? finalDuration, callId);
      } else {
        addLocalHistory(status === "connected" ? "ended" : "failed", finalDuration);
      }
      setStatus("ended");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to end call");
      addLocalHistory("failed", finalDuration, callId ?? undefined);
      setStatus("failed");
    } finally {
      activeCallIdRef.current = null;
      setTimeout(() => setStatus("idle"), 2000);
    }
  }, [addLocalHistory, duration, status, stopPolling, userId]);

  const clearHistory = useCallback(() => {
    setCallHistory([]);
  }, []);

  useEffect(() => {
    return () => {
      stopPolling();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [stopPolling]);

  return {
    phoneNumber,
    setPhoneNumber,
    status,
    duration,
    callHistory,
    error,
    initiateCall,
    hangUp,
    clearHistory,
  };
}
