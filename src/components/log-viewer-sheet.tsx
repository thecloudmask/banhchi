"use client";

import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { History, Clock, User, ArrowRight, Loader2, Info } from "lucide-react";
import { getEventLogs } from "@/services/event.service";
import { AuditLog } from "@/types";
import { formatDate } from "@/lib/utils";
import { useLanguage } from "@/providers/language-provider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface LogViewerSheetProps {
  eventId: string;
}

export function LogViewerSheet({ eventId }: LogViewerSheetProps) {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const { language } = useLanguage();

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const data = await getEventLogs(eventId);
      setLogs(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet onOpenChange={(open) => open && fetchLogs()}>
      <SheetTrigger asChild>
        <Button 
          variant="outline" 
          size="icon" 
          className="h-12 w-12 rounded-xl border-border hover:bg-secondary bg-background transition-all"
          title="Event History"
        >
          <History className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-md w-full p-0 border-l border-border bg-background shadow-lg">
        <SheetHeader className="p-8 pb-4">
          <SheetTitle className="text-2xl font-black flex items-center gap-3">
             <div className="h-10 w-10 bg-secondary rounded-xl flex items-center justify-center">
                <History className="h-5 w-5 opacity-40" />
             </div>
             Recent Activity
          </SheetTitle>
          <p className="text-xs font-medium text-muted-foreground">Audit logs for this event</p>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-120px)] p-8 pt-0">
          {loading ? (
            <div className="flex h-40 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground font-medium opacity-40">
               No activity logs found.
            </div>
          ) : (
            <div className="space-y-8 py-4">
              {logs.map((log) => (
                <div key={log.id} className="relative pl-8 border-l border-border group last:border-0 last:pb-0 pb-8">
                  <div className={cn(
                    "absolute -left-1.25 top-0 h-2.5 w-2.5 rounded-full border-2 border-background ring-4 ring-background transition-all",
                    log.action === 'CREATE' ? "bg-green-500" : 
                    log.action === 'UPDATE' ? "bg-blue-500" : "bg-destructive"
                  )} />
                  
                  <div className="flex items-center justify-between gap-4 mb-2">
                    <span className={cn(
                      "text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded",
                      log.action === 'CREATE' ? "bg-green-50 text-green-700" : 
                      log.action === 'UPDATE' ? "bg-blue-50 text-blue-700" : "bg-destructive/10 text-destructive"
                    )}>
                      {log.action}
                    </span>
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-bold">
                      <Clock className="h-3 w-3" />
                      {formatDate(log.timestamp)}
                    </div>
                  </div>

                  <div className="bg-secondary/30 rounded-xl p-4 border border-border/50 group-hover:bg-secondary/50 transition-colors">
                    <p className="text-sm font-bold text-foreground leading-relaxed whitespace-pre-wrap">
                      {log.details}
                    </p>
                    
                    {(log.oldValue || log.newValue) && log.action === 'UPDATE' && (
                       <div className="mt-3 pt-3 border-t border-border/50 flex flex-col gap-2">
                          <div className="flex items-center gap-2 opacity-40">
                             <Info className="h-3 w-3" />
                             <span className="text-[10px] font-black uppercase tracking-widest">Field Mapping</span>
                          </div>
                       </div>
                    )}
                  </div>
                  
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-50">
                      <User className="h-2.5 w-2.5" />
                      {log.userId.substring(0, 8)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
