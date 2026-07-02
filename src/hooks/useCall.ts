import { useState, useRef, useCallback, useEffect } from "react";
import { Call as TwilioCall, Device } from "@twilio/voice-sdk";
import { CallStatus, CallRecord } from "@/types/call";
import {
  ApiCallRecord,
  getVoiceToken,
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
    status:
      mappedStatus === "failed"
        ? "failed"
        : mappedStatus === "ended"
          ? "ended"
          : "connected",
    cost: call.cost,
  };
}

async function requestMicrophoneAccess() {
  if (!navigator.mediaDevices?.getUserMedia) {
    throw new Error("This browser does not support microphone calling");
  }

  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  stream.getTracks().forEach((track) => track.stop());
}

export function useCall(userId?: string) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [status, setStatus] = useState<CallStatus>("idle");
  const [callHistory, setCallHistory] = useState<CallRecord[]>([]);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState("");
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const deviceRef = useRef<Device | null>(null);
  const activeCallRef = useRef<TwilioCall | null>(null);
  const activeStartedAtRef = useRef<Date | null>(null);
  const durationRef = useRef(0);

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
    durationRef.current = duration;
  }, [duration]);

  useEffect(() => {
    if (status === "connected") {
      activeStartedAtRef.current = new Date();
      setDuration(0);
      timerRef.current = setInterval(() => {
        setDuration((d) => d + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [status]);

  const upsertHistory = useCallback((record: CallRecord) => {
    setCallHistory((prev) => {
      const withoutCurrent = prev.filter((item) => item.id !== record.id);
      return [record, ...withoutCurrent].slice(0, 50);
    });
  }, []);

  const addLocalHistory = useCallback(
    (finalStatus: "connected" | "failed" | "ended", finalDuration: number) => {
      const record: CallRecord = {
        id: crypto.randomUUID(),
        phoneNumber,
        date: new Date().toISOString(),
        duration: finalDuration,
        status: finalStatus,
      };
      upsertHistory(record);
    },
    [phoneNumber, upsertHistory]
  );

  const getDevice = useCallback(async () => {
    if (!userId) throw new Error("Sign in before calling");
    if (deviceRef.current) return deviceRef.current;

    const { token } = await getVoiceToken(userId);
    const device = new Device(token, {
      closeProtection: true,
    });

    device.on("error", (twilioError) => {
      setError(twilioError.message || "Twilio Voice device error");
      setStatus("failed");
    });

    deviceRef.current = device;
    return device;
  }, [userId]);

  const initiateCall = useCallback(async () => {
    if (!phoneNumber || status !== "idle" || !userId) return;

    setError("");
    setStatus("calling");
    setDuration(0);

    try {
      await requestMicrophoneAccess();
      const device = await getDevice();
      const call = await device.connect({
        params: { To: normalizePhoneNumber(phoneNumber) },
      });

      activeCallRef.current = call;

      call.on("ringing", () => {
        setStatus("ringing");
      });

      call.on("accept", () => {
        setStatus("connected");
      });

      call.on("disconnect", () => {
        const finalDuration = durationRef.current;
        activeCallRef.current = null;
        addLocalHistory("ended", finalDuration);
        setStatus("ended");
        setTimeout(() => setStatus("idle"), 2000);
      });

      call.on("cancel", () => {
        activeCallRef.current = null;
        addLocalHistory("failed", 0);
        setStatus("failed");
        setTimeout(() => setStatus("idle"), 3000);
      });

      call.on("reject", () => {
        activeCallRef.current = null;
        addLocalHistory("failed", 0);
        setStatus("failed");
        setTimeout(() => setStatus("idle"), 3000);
      });

      call.on("error", (twilioError) => {
        setError(twilioError.message || "Call failed");
        activeCallRef.current = null;
        addLocalHistory("failed", durationRef.current);
        setStatus("failed");
        setTimeout(() => setStatus("idle"), 3000);
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to start browser call";
      setError(message);
      addLocalHistory("failed", 0);
      setStatus("failed");
      setTimeout(() => setStatus("idle"), 3000);
    }
  }, [addLocalHistory, getDevice, phoneNumber, status, userId]);

  const hangUp = useCallback(() => {
    const finalDuration = duration;
    const activeCall = activeCallRef.current;

    if (activeCall) {
      activeCall.disconnect();
      return;
    }

    addLocalHistory(status === "connected" ? "ended" : "failed", finalDuration);
    setStatus("ended");
    setTimeout(() => setStatus("idle"), 2000);
  }, [addLocalHistory, duration, status]);

  const clearHistory = useCallback(() => {
    setCallHistory([]);
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (activeCallRef.current) activeCallRef.current.disconnect();
      if (deviceRef.current) deviceRef.current.destroy();
    };
  }, []);

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
