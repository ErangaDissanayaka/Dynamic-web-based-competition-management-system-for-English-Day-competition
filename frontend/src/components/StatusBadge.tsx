import type { EventStatus } from "@/lib/types";
import { STATUS_LABELS } from "@/lib/types";

const statusStyles: Record<EventStatus, string> = {
  upcoming: "bg-muted text-muted-foreground",
  registration_open: "bg-success/15 text-success border border-success/30",
  registration_closed: "bg-warning/15 text-warning border border-warning/30",
  judging_live: "bg-destructive/15 text-destructive border border-destructive/30 animate-pulse-gold",
  results_published: "bg-info/15 text-info border border-info/30",
};

export function StatusBadge({ status }: { status: EventStatus }) {
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${statusStyles[status]}`}>
      {status === "judging_live" && <span className="w-2 h-2 rounded-full bg-destructive mr-2 animate-pulse" />}
      {STATUS_LABELS[status]}
    </span>
  );
}
