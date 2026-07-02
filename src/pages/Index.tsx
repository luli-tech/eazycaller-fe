import { PhoneInput } from "@/components/PhoneInput";
import { Keypad } from "@/components/Keypad";
import { CallButton } from "@/components/CallButton";
import { CallStatusDisplay } from "@/components/CallStatus";
import { useCall } from "@/hooks/useCall";
import { useAuth } from "@/hooks/useAuth";
import { Clock, Phone, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

const Index = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dialCode, setDialCode] = useState("+234");

  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

  const {
    phoneNumber,
    setPhoneNumber,
    status,
    duration,
    initiateCall,
    hangUp,
    error,
  } = useCall(user?.email);

  const isActive = ["calling", "ringing", "connected"].includes(status);

  const handleDigit = (digit: string) => {
    if (!phoneNumber || phoneNumber === "+") {
      setPhoneNumber(`${dialCode}${digit}`);
    } else {
      setPhoneNumber(phoneNumber + digit);
    }
  };

  const handleDelete = () => {
    setPhoneNumber(phoneNumber.slice(0, -1));
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border px-4 py-4">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <Phone className="h-4.5 w-4.5 text-primary" />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight">VoiceLink</h1>
              <p className="text-xs text-muted-foreground">Hi, {user.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={() => navigate("/calls")}>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => { logout(); navigate("/login"); }}>
              <LogOut className="h-4 w-4 text-muted-foreground" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 px-4 py-6">
        <div className="max-w-lg mx-auto space-y-5">
          {/* Dialer Card */}
          <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
            <CallStatusDisplay status={status} duration={duration} phoneNumber={phoneNumber} />

            {!isActive && (
              <>
                <PhoneInput
                  value={phoneNumber}
                  onChange={setPhoneNumber}
                  onDialCodeChange={setDialCode}
                  disabled={isActive}
                  status={status}
                />
                <Keypad
                  onDigit={handleDigit}
                  onDelete={handleDelete}
                  disabled={isActive}
                />
              </>
            )}

            <CallButton
              status={status}
              phoneNumber={phoneNumber}
              onCall={initiateCall}
              onHangUp={hangUp}
            />

            {error && (
              <p className="text-xs text-destructive text-center">{error}</p>
            )}
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
