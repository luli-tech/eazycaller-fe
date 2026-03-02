import { PhoneCall, PhoneForwarded, PhoneOff, Wifi, Loader2 } from "lucide-react";
import { CallStatus as CallStatusType } from "@/types/call";

interface CallStatusProps {
  status: CallStatusType;
  duration: number;
  phoneNumber: string;
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

const statusConfig: Record<CallStatusType, { label: string; icon: React.ElementType; colorClass: string }> = {
  idle: { label: "Ready", icon: Wifi, colorClass: "text-muted-foreground" },
  calling: { label: "Calling...", icon: Loader2, colorClass: "text-call-ringing" },
  ringing: { label: "Ringing...", icon: PhoneForwarded, colorClass: "text-call-ringing" },
  connected: { label: "Connected", icon: PhoneCall, colorClass: "text-call-active" },
  ended: { label: "Call Ended", icon: PhoneOff, colorClass: "text-call-ended" },
  failed: { label: "Call Failed", icon: PhoneOff, colorClass: "text-call-failed" },
};

export function CallStatusDisplay({ status, duration, phoneNumber }: CallStatusProps) {
  const config = statusConfig[status];
  if (status === "idle") return null;
  const Icon = config.icon;
  const isAnimating = status === "calling" || status === "ringing";

  return (
    <div className="flex flex-col items-center gap-3 py-6">
      <div
        className={`relative flex items-center justify-center w-20 h-20 rounded-full bg-secondary ${isAnimating ? "pulse-ring" : ""}`}
      >
        <Icon
          className={`h-8 w-8 ${config.colorClass} ${status === "calling" ? "animate-spin" : ""}`}
        />
      </div>

      <div className="text-center space-y-1">
        <p className={`text-lg font-semibold ${config.colorClass}`}>{config.label}</p>
        {phoneNumber && (
          <p className="text-sm font-mono text-muted-foreground">{phoneNumber}</p>
        )}
        {status === "connected" && (
          <p className="text-2xl font-mono font-bold text-call-active tabular-nums">
            {formatDuration(duration)}
          </p>
        )}
      </div>
    </div>
  );
}
