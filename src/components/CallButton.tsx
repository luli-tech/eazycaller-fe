import { Phone, PhoneOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CallStatus } from "@/types/call";

interface CallButtonProps {
  status: CallStatus;
  phoneNumber: string;
  onCall: () => void;
  onHangUp: () => void;
}

export function CallButton({ status, phoneNumber, onCall, onHangUp }: CallButtonProps) {
  const isValid = /^\+\d{7,15}$/.test(phoneNumber.replace(/[\s-]/g, ""));
  const isActive = ["calling", "ringing", "connected"].includes(status);

  if (isActive) {
    return (
      <Button
        onClick={onHangUp}
        size="lg"
        className="w-full h-14 text-lg font-semibold bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-xl transition-all glow-failed"
      >
        <PhoneOff className="mr-2 h-5 w-5" />
        End Call
      </Button>
    );
  }

  return (
    <Button
      onClick={onCall}
      disabled={!isValid || status !== "idle"}
      size="lg"
      className="w-full h-14 text-lg font-semibold bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:glow-primary"
    >
      <Phone className="mr-2 h-5 w-5" />
      Call
    </Button>
  );
}
