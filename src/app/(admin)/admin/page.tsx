"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CreateEventDialog } from "@/components/create-event-dialog";
import { Card } from "@/components/ui/card";
import { getEvents } from "@/services/event.service";
import { Event } from "@/types";
import {
  Calendar,
  Loader2,
  Pencil,
  Trash2,
  Search,
  MapPin,
  FileText,
} from "lucide-react";
import { formatDateTime, cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EditEventDialog } from "@/components/edit-event-dialog";
import { deleteEvent } from "@/services/event.service";
import { useAuth } from "@/providers/auth-provider";
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
import Image from "next/image";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchEvents = async () => {
    try {
      const data = await getEvents();
      const sorted = [...data].sort((a, b) => {
        if (a.status === "active" && b.status !== "active") return -1;
        if (a.status !== "active" && b.status === "active") return 1;
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
      toast.success(`បានលុប ${eventTitle}`);
      fetchEvents();
    } catch (error) {
      toast.error("បរាជ័យក្នុងការលុបកម្មវិធី");
    }
  };

  const filteredEvents = events.filter((e) =>
    e.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  if (!user) return null;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header & Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            <span>កម្មវិធីរបស់អ្នក</span>
          </h1>
          <p className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase">
            <span>គ្រប់គ្រងកម្មវិធីរបស់អ្នក</span>
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative w-full sm:w-60">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
            <Input
              placeholder={"ស្វែងរក..."}
              className="h-10 pl-9 rounded-md border-border bg-accent/30 text-foreground placeholder:text-muted-foreground/30 font-medium text-sm w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Button
              asChild
              variant="outline"
              className="h-10 cursor-pointer rounded-md px-4 border-border bg-card hover:bg-accent text-accent-foreground font-semibold text-xs uppercase w-full sm:w-auto flex-1 sm:flex-none transition-all"
            >
              <Link href="/admin/posts/">
                <FileText className="mr-2 h-3.5 w-3.5 text-primary" />
                <span>គ្រប់គ្រងអត្ថបទ</span>
              </Link>
            </Button>
            <div className="flex-1 sm:flex-none">
              <CreateEventDialog />
            </div>
          </div>
        </div>
      </div>

      {!loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {events.length === 0 ? (
            <div className="col-span-full py-32 text-center bg-card/40 border border-border border-dashed rounded-md animate-in fade-in zoom-in duration-700">
              <div className="h-16 w-16 bg-muted rounded-md flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-7 w-7 text-muted-foreground/20" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-1">
                <span>មិនមានកម្មវិធី</span>
              </h3>
              <p className="text-muted-foreground text-sm">
                <span>បង្កើតកម្មវិធីដំបូងរបស់អ្នក</span>
              </p>
            </div>
          ) : (
            filteredEvents.map((event) => (
              <div
                key={event.id}
                className="group border border-border bg-card/40 backdrop-blur-xl hover:bg-card/60 rounded-[1.5rem] overflow-hidden flex flex-col transition-all duration-300 hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-1 animate-in fade-in slide-in-from-bottom-2"
              >
                <Link
                  href={`/admin/events/${event.id}/`}
                  className="block relative aspect-4/3 overflow-hidden bg-muted"
                >
                  {event.bannerUrl ? (
                    <Image
                      src={event.bannerUrl}
                      alt={event.title}
                      fill
                      className="object-cover object-top opacity-80 group-hover:opacity-100 transition-all duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center opacity-10">
                      <Calendar className="h-12 w-12 text-white" />
                    </div>
                  )}
                  <div className="absolute top-4 left-4">
                    <span
                      className={cn(
                        "px-3 py-1.5 rounded-full text-[10px] shadow-lg backdrop-blur-md",
                        event.status === "active"
                          ? "bg-primary text-white"
                          : "bg-muted/80 text-muted-foreground",
                      )}
                    >
                      {event.status === "active"
                        ? "កំពុងដំណើរការ"
                        : "បានបញ្ចប់"}
                    </span>
                  </div>
                </Link>

                <div className="p-6 flex-1 flex flex-col">
                  <Link
                    href={`/admin/events/${event.id}/`}
                    className="block mb-4"
                  >
                    <h3 className="text-lg font-bold text-foreground leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                      {event.title}
                    </h3>
                  </Link>

                  <div className="space-y-2 mb-6 flex-1">
                    <div className="flex items-center gap-2.5 text-[10px] font-semibold text-muted-foreground uppercase">
                      <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Calendar className="h-3 w-3 text-primary" />
                      </div>
                      {formatDateTime(event.eventDate)}
                    </div>
                    {event.location && (
                      <div className="flex items-center gap-2.5 text-[10px] font-semibold text-muted-foreground uppercase">
                        <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <MapPin className="h-3 w-3 text-primary" />
                        </div>
                        {event.location}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-5 border-t border-border/50">
                    <div className="flex gap-2">
                      <EditEventDialog
                        event={event}
                        onSuccess={fetchEvents}
                        trigger={
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 border border-border rounded-full cursor-pointer text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        }
                      />
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 border border-border cursor-pointer rounded-full text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition-all"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="rounded-[1.5rem] bg-card border border-border p-8 shadow-2xl animate-in zoom-in duration-300 backdrop-blur-xl">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-xl font-bold text-foreground">
                              {"លុបកម្មវិធីមែនទេ?"}
                            </AlertDialogTitle>
                            <AlertDialogDescription className="text-muted-foreground text-sm pt-2">
                              {`តើអ្នកពិតជាចង់លុបកម្មវិធី"${event.title}"នេះមែនទេ? ទិន្នន័យទាំងអស់នឹងត្រូវលុបចោលជាអចិន្ត្រៃយ៍។`}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter className="mt-8 gap-3">
                            <AlertDialogCancel className="h-11 px-6 rounded-full border-border bg-muted/30 text-muted-foreground hover:bg-accent font-semibold transition-all">
                              {"បោះបង់"}
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() =>
                                handleDeleteEvent(event.id, event.title)
                              }
                              className="h-11 px-8 rounded-full bg-destructive hover:bg-destructive/90 text-white font-bold transition-all shadow-lg shadow-destructive/20"
                            >
                              {"លុបកម្មវិធី"}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>

                    <Button
                      asChild
                      variant="outline"
                      className="h-9 rounded-full cursor-pointer px-5 font-bold text-[10px] uppercase border-border bg-primary/5 hover:bg-primary hover:text-white text-primary transition-all"
                    >
                      <Link href={`/admin/events/${event.id}/`}>
                        {"គ្រប់គ្រង"}
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary opacity-40" />
        </div>
      )}
    </div>
  );
}
