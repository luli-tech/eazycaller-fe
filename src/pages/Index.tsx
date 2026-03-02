import { PhoneInput } from "@/components/PhoneInput";
import { CallButton } from "@/components/CallButton";
import { CallStatusDisplay } from "@/components/CallStatus";
import { CallHistory } from "@/components/CallHistory";
import { useCall } from "@/hooks/useCall";
import { Phone } from "lucide-react";

const Index = () => {
  const {
    phoneNumber,
    setPhoneNumber,
    status,
    duration,
    callHistory,
    initiateCall,
    hangUp,
    clearHistory,
  } = useCall();

  const isActive = ["calling", "ringing", "connected"].includes(status);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border px-4 py-4">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <Phone className="h-4.5 w-4.5 text-primary" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight">VoiceLink</h1>
            <p className="text-xs text-muted-foreground">Internet → GSM Voice Calls</p>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 px-4 py-8">
        <div className="max-w-lg mx-auto space-y-6">
          {/* Dialer Card */}
          <div className="bg-card border border-border rounded-2xl p-6 space-y-5">
            <CallStatusDisplay status={status} duration={duration} phoneNumber={phoneNumber} />

            {!isActive && (
              <PhoneInput
                value={phoneNumber}
                onChange={setPhoneNumber}
                disabled={isActive}
                status={status}
              />
            )}

            <CallButton
              status={status}
              phoneNumber={phoneNumber}
              onCall={initiateCall}
              onHangUp={hangUp}
            />
          </div>

          {/* History */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <CallHistory history={callHistory} onClear={clearHistory} />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border px-4 py-3">
        <p className="text-center text-xs text-muted-foreground">
          Calls are routed through GSM gateway · Demo mode active
        </p>
      </footer>
    </div>
  );
};

export default Index;
