import { useState, useRef, useCallback, useEffect } from "react";
import { CallStatus, CallRecord } from "@/types/call";

// Simulates call flow for demo purposes since backend doesn't exist yet
function simulateCallFlow(
  onStatusChange: (status: CallStatus) => void,
  shouldFail?: boolean
): () => void {
  const timeouts: NodeJS.Timeout[] = [];

  timeouts.push(setTimeout(() => onStatusChange("ringing"), 1500));

  if (shouldFail) {
    timeouts.push(setTimeout(() => onStatusChange("failed"), 4000));
  } else {
    timeouts.push(setTimeout(() => onStatusChange("connected"), 4000));
  }

  return () => timeouts.forEach(clearTimeout);
}

export function useCall() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [status, setStatus] = useState<CallStatus>("idle");
  const [callHistory, setCallHistory] = useState<CallRecord[]>(() => {
    const saved = localStorage.getItem("call-history");
    return saved ? JSON.parse(saved) : [];
  });
  const [duration, setDuration] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);
  const callStartRef = useRef<Date | null>(null);

  // Persist history
  useEffect(() => {
    localStorage.setItem("call-history", JSON.stringify(callHistory));
  }, [callHistory]);

  // Duration timer
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

  const addToHistory = useCallback(
    (finalStatus: "connected" | "failed" | "ended", finalDuration: number) => {
      const record: CallRecord = {
        id: crypto.randomUUID(),
        phoneNumber,
        date: new Date().toISOString(),
        duration: finalDuration,
        status: finalStatus,
      };
      setCallHistory((prev) => [record, ...prev].slice(0, 50));
    },
    [phoneNumber]
  );

  const initiateCall = useCallback(() => {
    if (!phoneNumber || status !== "idle") return;

    setStatus("calling");
    setDuration(0);

    // Simulate: ~20% chance of failure for demo
    const shouldFail = Math.random() < 0.2;

    const cleanup = simulateCallFlow((newStatus) => {
      setStatus(newStatus);
      if (newStatus === "failed") {
        addToHistory("failed", 0);
        setTimeout(() => setStatus("idle"), 3000);
      }
    }, shouldFail);

    cleanupRef.current = cleanup;
  }, [phoneNumber, status, addToHistory]);

  const hangUp = useCallback(() => {
    if (cleanupRef.current) {
      cleanupRef.current();
      cleanupRef.current = null;
    }
    const finalDuration = duration;
    addToHistory(status === "connected" ? "ended" : "failed", finalDuration);
    setStatus("ended");
    setTimeout(() => setStatus("idle"), 2000);
  }, [duration, status, addToHistory]);

  const clearHistory = useCallback(() => {
    setCallHistory([]);
  }, []);

  return {
    phoneNumber,
    setPhoneNumber,
    status,
    duration,
    callHistory,
    initiateCall,
    hangUp,
    clearHistory,
  };
}
