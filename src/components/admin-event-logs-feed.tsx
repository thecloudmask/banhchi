"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { getEventLogs } from "@/services/event.service";
import { AuditLog } from "@/types";
import { formatDateTime } from "@/lib/utils";
import { History, User, Activity, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminEventLogsFeedProps {
  eventId: string;
  refreshKey?: number;
}

export function AdminEventLogsFeed({ eventId, refreshKey = 0 }: AdminEventLogsFeedProps) {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  // No internationalization needed

  const fetchLogs = async () => {
    if (!eventId) return;
    try {
      setLoading(true);
      const data = await getEventLogs(eventId, 10);
      setLogs(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [eventId, refreshKey]);

  return (
    <Card className="rounded-[2rem] border border-border bg-card shadow-xl overflow-hidden h-full flex flex-col">
       <div className="p-8 pb-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <History className="h-5 w-5 text-primary" />
             </div>
             <div>
                <h3 className="text-lg font-black text-foreground">{"សកម្មភាពថ្មីៗ"}</h3>
                <p className="text-[10px] font-black uppercase   text-muted-foreground/60">{"ប្រវត្តិប្រតិបត្តិការ"}</p>
             </div>
          </div>
          <Activity className="h-5 w-5 text-muted-foreground/20" />
       </div>

       <div className="flex-1 overflow-y-auto p-8 pt-6">
          {loading ? (
             <div className="flex h-40 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary opacity-20" />
             </div>
          ) : logs.length === 0 ? (
             <div className="h-40 flex flex-col items-center justify-center text-center opacity-20 text-muted-foreground">
                <Activity className="h-8 w-8 mb-2" />
                <p className="text-[10px] font-black uppercase  ">{"មិនទាន់មានសកម្មភាពនៅឡើយ"}</p>
             </div>
          ) : (
             <div className="space-y-6">
                {logs?.map((log) => (
                   <div key={log.id} className="relative pl-6 border-l border-border pb-1 last:pb-0">
                      <div className={cn(
                        "absolute -left-1.5 top-0 h-3 w-3 rounded-full border-2 border-background", log.action === 'CREATE' ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" : 
                        log.action === 'UPDATE' ? "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.4)]" : "bg-destructive shadow-[0_0_8px_rgba(239,68,68,0.4)]"
                      )} />
                      
                      <div className="space-y-1">
                         <div className="flex items-center justify-between">
                            <span className={cn(
                               "text-[8px] font-black uppercase   px-1.5 py-0.5 rounded", log.action === 'CREATE' ? "bg-emerald-500/10 text-emerald-500" : 
                               log.action === 'UPDATE' ? "bg-blue-500/10 text-blue-500" : "bg-destructive/10 text-destructive"
                            )}>
                               {log.action}
                            </span>
                            <span className="text-[9px] font-bold text-muted-foreground/40">{formatDateTime(log.timestamp)}</span>
                         </div>
                         <p className="text-xs font-bold text-foreground leading-relaxed truncate-3-lines">
                            {log.details}
                         </p>
                         <div className="flex items-center gap-1.5 pt-1 text-[8px] font-black uppercase   text-muted-foreground/40">
                            <User className="h-2.5 w-2.5" />
                            ID: {log.userId.substring(0, 6)}...
                         </div>
                      </div>
                   </div>
                ))}
             </div>
          )}
       </div>
    </Card>
  );
}
