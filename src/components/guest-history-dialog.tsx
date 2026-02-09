"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Clock as ClockIcon, User as UserIcon, History as HistoryIcon, Loader2 } from "lucide-react";
import { getGuestLogs } from "@/services/event.service";
import { AuditLog, Guest } from "@/types";
import { formatDate } from "@/lib/utils";
import { useLanguage } from "@/providers/language-provider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface GuestHistoryDialogProps {
  eventId: string;
  guest: Guest;
}

export function GuestHistoryDialog({ eventId, guest }: GuestHistoryDialogProps) {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const { t } = useLanguage();

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const data = await getGuestLogs(eventId, guest.id);
      setLogs(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog onOpenChange={(open) => open && fetchLogs()}>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-10 w-10 text-muted-foreground hover:bg-secondary rounded-xl transition-all"
        >
          <HistoryIcon className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl rounded-2xl p-0 border border-border shadow-lg overflow-hidden">
        <DialogHeader className="p-8 pb-4">
          <DialogTitle className="text-2xl font-black flex items-center gap-3">
             <div className="h-10 w-10 bg-secondary rounded-xl flex items-center justify-center">
                <HistoryIcon className="h-5 w-5 opacity-40" />
             </div>
             History for {guest.name}
          </DialogTitle>
          <DialogDescription className="sr-only">Audit log of contributions and changes for {guest.name}.</DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-100 p-8 pt-0">
          {loading ? (
            <div className="flex h-40 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground font-medium opacity-40">
               No history records found.
            </div>
          ) : (
            <div className="space-y-6">
              {logs.map((log) => (
                <div key={log.id} className="relative pl-8 border-l-2 border-border pb-2 group last:border-0 last:pb-0">
                   <div className={cn(
                    "absolute -left-2.25 top-0 h-4 w-4 rounded-full bg-border border-4 border-background group-hover:bg-primary group-hover:border-primary/20 transition-all",
                    log.action === 'CREATE' && "bg-green-500",
                    log.action === 'UPDATE' && "bg-blue-500",
                    log.action === 'DELETE' && "bg-destructive"
                  )} />
                  
                  <div className="flex items-center gap-4 mb-2">
                    <span className={cn(
                       "text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded",
                       log.action === 'CREATE' ? "bg-green-50 text-green-700" : 
                       log.action === 'UPDATE' ? "bg-blue-50 text-blue-700" : "bg-destructive/10 text-destructive"
                    )}>
                      {log.action}
                    </span>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                      <ClockIcon className="h-3 w-3" />
                      {formatDate(log.timestamp)}
                    </div>
                  </div>

                  <div className="bg-secondary/30 rounded-2xl p-4 border border-border/50">
                    <p className="text-sm font-bold text-foreground mb-1 leading-relaxed">
                      {log.details}
                    </p>
                  </div>
                  
                  <div className="mt-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-muted-foreground opacity-40">
                    <UserIcon className="h-3 w-3" />
                    By Admin: {log.userId.substring(0, 8)}...
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
