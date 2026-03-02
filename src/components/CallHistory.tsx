import { Phone, PhoneOff, Clock, Trash2 } from "lucide-react";
import { CallRecord } from "@/types/call";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

interface CallHistoryProps {
  history: CallRecord[];
  onClear: () => void;
}

function formatDuration(seconds: number): string {
  if (seconds === 0) return "—";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

const statusBadge: Record<string, { label: string; className: string }> = {
  ended: { label: "Completed", className: "bg-call-active/10 text-call-active" },
  connected: { label: "Completed", className: "bg-call-active/10 text-call-active" },
  failed: { label: "Failed", className: "bg-call-failed/10 text-call-failed" },
};

export function CallHistory({ history, onClear }: CallHistoryProps) {
  if (history.length === 0) {
    return (
      <div className="text-center py-12">
        <Clock className="mx-auto h-10 w-10 text-muted-foreground/30 mb-3" />
        <p className="text-muted-foreground text-sm">No call history yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Recent Calls
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClear}
          className="text-muted-foreground hover:text-destructive h-8 px-2"
        >
          <Trash2 className="h-3.5 w-3.5 mr-1" />
          Clear
        </Button>
      </div>

      <div className="space-y-1">
        {history.map((record) => {
          const badge = statusBadge[record.status] || statusBadge.failed;
          return (
            <div
              key={record.id}
              className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
            >
              <div className="flex-shrink-0">
                {record.status === "failed" ? (
                  <PhoneOff className="h-4 w-4 text-call-failed" />
                ) : (
                  <Phone className="h-4 w-4 text-call-active" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-mono font-medium truncate">
                  {record.phoneNumber}
                </p>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(record.date), "MMM d, yyyy · h:mm a")}
                </p>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-xs font-mono text-muted-foreground">
                  {formatDuration(record.duration)}
                </span>
                <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${badge.className}`}>
                  {badge.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
