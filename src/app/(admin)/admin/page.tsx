"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { CreateEventDialog } from "@/components/create-event-dialog";
import { Card } from "@/components/ui/card";
import { getEvents } from "@/services/event.service";
import { Event } from "@/types";
import { Calendar, Loader2, Pencil, Trash2, Search, Download, Clock, MapPin, ExternalLink, MoreVertical, FileText } from "lucide-react";
import { formatDate, cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/providers/language-provider";
import { EditEventDialog } from "@/components/edit-event-dialog";
import { deleteEvent } from "@/services/event.service";
import { useAuth } from "@/providers/auth-provider";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Toaster } from "@/components/ui/sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuItem as DropdownMenuAction, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import Image from "next/image";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { t } = useLanguage();

  const fetchEvents = async () => {
    try {
      const data = await getEvents();
      const sorted = [...data].sort((a, b) => {
        if (a.status === 'active' && b.status !== 'active') return -1;
        if (a.status !== 'active' && b.status === 'active') return 1;
        return 0;
      });
      setEvents(sorted);
    } catch (error: any) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchEvents();
  }, [user]);

  const handleDeleteEvent = async (eventId: string, eventTitle: string) => {
    try {
      await deleteEvent(eventId);
      toast.success(`${t('toast_deleted')} ${eventTitle}`);
      fetchEvents();
    } catch (error) {
      toast.error(t('toast_failed_delete'));
    }
  };

  const filteredEvents = events.filter(e => 
    e.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!user) return null;

  return (
    <div className="space-y-12">
      {/* Header & Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 sm:gap-8">
        <div className="space-y-1">
           <h1 className="text-2xl sm:text-3xl font-black tracking-tighter">{t('your_events')}</h1>
            <p className="text-[10px] sm:text-xs font-bold text-zinc-400 uppercase tracking-widest">{t('manage_celebrations')}</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-300" />
            <Input 
              placeholder={t('search_placeholder')} 
              className="h-11 pl-11 rounded-xl border-zinc-200 bg-white shadow-sm font-bold text-sm w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <Button asChild variant="outline" className="h-11 cursor-pointer rounded-xl px-4 border-zinc-200 font-bold bg-white text-zinc-700 hover:bg-zinc-50 shadow-sm w-full sm:w-auto flex-1 sm:flex-none">
              <Link href="/admin/posts/" onClick={() => console.log("Manage contents clicked")}>
                <FileText className="mr-2 h-4 w-4 text-zinc-400" />
                {t('manage_contents')}
              </Link>
            </Button>
            <div className="flex-1 sm:flex-none">
              <CreateEventDialog />
            </div>
          </div>
        </div>
      </div>

      {!loading ? (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {events.length === 0 ? (
            <div className="col-span-full py-32 text-center">
               <div className="h-20 w-20 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Calendar className="h-8 w-8 text-zinc-300" />
               </div>
               <h3 className="text-xl font-black mb-2">{t('no_events')}</h3>
               <p className="text-zinc-400 font-medium">{t('create_first_event')}</p>
            </div>
          ) : (
            filteredEvents.map((event) => (
              <Card key={event.id} className="group border border-zinc-100 bg-white shadow-sm rounded-2xl overflow-hidden flex flex-col p-0">
                <Link href={`/admin/events/${event.id}/`} className="block relative aspect-4/3 overflow-hidden bg-zinc-50 border-b border-zinc-50">
                  {event.bannerUrl ? (
                    <Image 
                      src={event.bannerUrl} 
                      alt={event.title} 
                      fill
                      className="object-cover object-top grayscale-[0.2] group-hover:grayscale-0 transition-all duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center opacity-10">
                      <Calendar className="h-12 w-12" />
                    </div>
                  )}
                  <div className="absolute top-4 left-4">
                    <span className={cn(
                      "px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest shadow-sm",
                      event.status === 'active' ? "bg-primary text-primary-foreground" : "bg-zinc-900 text-white"
                    )}>
                      {event.status === 'active' ? t('active') : t('completed')}
                    </span>
                  </div>
                </Link>
                
                <div className="p-6 flex-1 flex flex-col">
                  <Link href={`/admin/events/${event.id}/`} className="block mb-4 hover:text-primary">
                    <h3 className="text-lg font-black tracking-tight leading-tight line-clamp-2">
                      {event.title}
                    </h3>
                  </Link>

                  <div className="space-y-2 mb-6">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                      <Calendar className="h-3 w-3 opacity-40" />
                      {formatDate(event.eventDate)}
                    </div>
                    {event.location && (
                      <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-400 uppercase tracking-widest truncate">
                        <MapPin className="h-3 w-3 opacity-40" />
                        {event.location}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-zinc-50">
                    <div className="flex gap-1">
                      <EditEventDialog 
                        event={event} 
                        onSuccess={fetchEvents}
                        trigger={
                          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg text-zinc-300 hover:text-primary">
                            <Pencil className="h-4 w-4" />
                          </Button>
                        }
                      />
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg text-zinc-300 hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="rounded-2xl border border-border p-8 shadow-md">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-xl font-black">{t('delete_event_confirm_title') || "Delete Event?"}</AlertDialogTitle>
                            <AlertDialogDescription className="text-zinc-500 font-medium">
                              {t('delete_event_confirm_desc')?.replace('{{title}}', event.title) || `Permanently remove ${event.title} and all guest data?`}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter className="mt-6">
                            <AlertDialogCancel className="h-11 rounded-lg font-bold">{t('cancel')}</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteEvent(event.id, event.title)} className="h-11 rounded-lg bg-destructive text-white font-black">{t('delete_event')}</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                    
                    <Button asChild variant="outline" className="h-9 rounded-lg px-4 font-black text-[10px] uppercase tracking-widest border-zinc-200 hover:bg-zinc-50">
                      <Link href={`/admin/events/${event.id}/`}>
                        {t('manage')}
                      </Link>
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      ) : (
        <div className="flex justify-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
        </div>
      )}
    </div>
  );
}
