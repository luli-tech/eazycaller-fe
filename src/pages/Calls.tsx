import { CallHistory } from "@/components/CallHistory";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useCall } from "@/hooks/useCall";
import { ArrowLeft, LogOut, Phone } from "lucide-react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Calls = () => {
  const { user, token, isLoading, logout } = useAuth();
  const navigate = useNavigate();
  const { callHistory, clearHistory } = useCall(user?.id, token ?? undefined);

  useEffect(() => {
    if (!isLoading && !user) navigate("/login");
  }, [isLoading, user, navigate]);

  if (isLoading || !user) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border px-4 py-4">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="h-4 w-4 text-muted-foreground" />
            </Button>
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <Phone className="h-4.5 w-4.5 text-primary" />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight">Calls</h1>
              <p className="text-xs text-muted-foreground">Hi, {user.name}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              logout();
              navigate("/login");
            }}
          >
            <LogOut className="h-4 w-4 text-muted-foreground" />
          </Button>
        </div>
      </header>

      <main className="flex-1 px-4 py-6">
        <div className="max-w-lg mx-auto bg-card border border-border rounded-2xl p-5">
          <CallHistory history={callHistory} onClear={clearHistory} />
        </div>
      </main>

      <footer className="border-t border-border px-4 py-3">
        <p className="text-center text-xs text-muted-foreground">
          Calls are routed through GSM gateway · Demo mode active
        </p>
      </footer>
    </div>
  );
};

export default Calls;
