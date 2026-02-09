"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { getEventLogs } from "@/services/event.service";
import { AuditLog } from "@/types";
import { formatDate } from "@/lib/utils";
import { History, User, Activity, Loader2 } from "lucide-react";
import { useLanguage } from "@/providers/language-provider";
import { cn } from "@/lib/utils";

interface AdminEventLogsFeedProps {
  eventId: string;
  refreshKey?: number;
}

export function AdminEventLogsFeed({ eventId, refreshKey = 0 }: AdminEventLogsFeedProps) {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

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
    <Card className="rounded-[2rem] border border-gray-100 bg-white shadow-xl overflow-hidden h-full flex flex-col">
       <div className="p-8 pb-4 border-b border-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <History className="h-5 w-5 text-primary" />
             </div>
             <div>
                <h3 className="text-lg font-black text-gray-900">{t('recent_activity')}</h3>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{t('admin_audit_logs')}</p>
             </div>
          </div>
          <Activity className="h-5 w-5 text-gray-200" />
       </div>

       <div className="flex-1 overflow-y-auto p-8 pt-6">
          {loading ? (
             <div className="flex h-40 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary opacity-20" />
             </div>
          ) : logs.length === 0 ? (
             <div className="h-40 flex flex-col items-center justify-center text-center opacity-20">
                <Activity className="h-8 w-8 mb-2" />
                <p className="text-[10px] font-black uppercase tracking-widest">{t('no_activity_yet')}</p>
             </div>
          ) : (
             <div className="space-y-6">
                {logs.map((log) => (
                   <div key={log.id} className="relative pl-6 border-l border-gray-100 pb-1 last:pb-0">
                      <div className={cn(
                        "absolute -left-1.5 top-0 h-3 w-3 rounded-full border-2 border-white",
                        log.action === 'CREATE' ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" : 
                        log.action === 'UPDATE' ? "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.4)]" : "bg-destructive shadow-[0_0_8px_rgba(239,68,68,0.4)]"
                      )} />
                      
                      <div className="space-y-1">
                         <div className="flex items-center justify-between">
                            <span className={cn(
                               "text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded",
                               log.action === 'CREATE' ? "bg-green-50 text-green-700" : 
                               log.action === 'UPDATE' ? "bg-blue-50 text-blue-700" : "bg-destructive/10 text-destructive"
                            )}>
                               {log.action}
                            </span>
                            <span className="text-[9px] font-bold text-gray-300">{formatDate(log.timestamp)}</span>
                         </div>
                         <p className="text-xs font-bold text-gray-700 leading-relaxed truncate-3-lines">
                            {log.details}
                         </p>
                         <div className="flex items-center gap-1.5 pt-1 text-[8px] font-black uppercase tracking-widest text-gray-300">
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
