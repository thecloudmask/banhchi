"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createEvent } from "@/services/event.service";
import { Loader2, Plus, CalendarIcon, Upload, MapPin, Clock, Navigation } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/providers/language-provider";
import { cn } from "@/lib/utils";

export function CreateEventDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { t } = useLanguage();
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [mapUrl, setMapUrl] = useState("");
  const [banner, setBanner] = useState<File | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date) {
      toast.error("Please fill in main details");
      return;
    }

    try {
      setLoading(true);
      const id = await createEvent({
        title,
        eventDate: new Date(date),
        eventTime: time || undefined,
        location: location || undefined,
        mapUrl: mapUrl || undefined,
        galleryUrls: [],
      }, banner || undefined);
      
      toast.success("Event created successfully");
      setOpen(false);
      resetForm();
      router.push(`/admin/events/${id}`); 
    } catch (error) {
      console.error(error);
      toast.error("Failed to create event");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setDate("");
    setTime("");
    setLocation("");
    setMapUrl("");
    setBanner(null);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="h-12 px-6 rounded-xl font-bold bg-primary text-white shadow-md transition-colors hover:bg-primary/90">
          <Plus className="mr-2 h-5 w-5" />
          {t('create_event')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl rounded-xl p-0 border border-border shadow-md overflow-hidden">
        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="p-8 pb-4 shrink-0 border-b border-border">
             <DialogHeader>
               <DialogTitle className="text-2xl font-black">{t('create_event')}</DialogTitle>
               <p className="text-muted-foreground font-medium mt-1 text-xs uppercase tracking-widest">Basic Event Details</p>
             </DialogHeader>
          </div>

          <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto">
            <div className="space-y-4">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 ml-1">{t('event_title')}</Label>
              <Input
                placeholder="e.g. Wedding of John & Jane"
                className="h-12 bg-white border-slate-200 rounded-xl font-bold px-4 focus:border-primary transition-all shadow-sm"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 ml-1">{t('event_date')}</Label>
                <div className="relative">
                  <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="date"
                    className="h-12 bg-white border-slate-200 rounded-xl font-bold pl-12 focus:border-primary transition-all shadow-sm"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-4">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 ml-1">{t('event_time')}</Label>
                <div className="relative">
                  <Clock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="time"
                    className="h-12 bg-white border-slate-200 rounded-xl font-bold pl-12 focus:border-primary transition-all shadow-sm"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <div className="space-y-4">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 ml-1">{t('location')}</Label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Venue Name"
                      className="h-12 bg-white border-slate-200 rounded-xl font-bold pl-12 focus:border-primary transition-all shadow-sm"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    />
                  </div>
               </div>
               <div className="space-y-4">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 ml-1">Map Pin URL</Label>
                  <div className="relative">
                    <Navigation className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Google Maps Link"
                      className="h-12 bg-white border-slate-200 rounded-xl font-bold pl-12 focus:border-primary transition-all shadow-sm"
                      value={mapUrl}
                      onChange={(e) => setMapUrl(e.target.value)}
                    />
                  </div>
               </div>
            </div>

            <div className="space-y-4">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 ml-1">Banner Image (Optional)</Label>
              <div className="relative group">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setBanner(e.target.files?.[0] || null)}
                  className="h-12 opacity-0 absolute inset-0 w-full z-10 cursor-pointer"
                />
                 <div className="h-12 bg-white border-slate-200 border-2 border-dashed rounded-xl flex items-center px-4 hover:bg-slate-50 transition-colors">
                    <Upload className="h-4 w-4 text-muted-foreground mr-3" />
                    <span className="text-sm font-bold text-muted-foreground truncate">
                      {banner ? banner.name : "Click to Choosing Image"}
                    </span>
                 </div>
              </div>
            </div>
          </div>

          <DialogFooter className="p-8 bg-secondary/10 gap-3 border-t border-border">
            <Button type="button" variant="ghost" className="h-12 rounded-xl font-bold flex-1" onClick={() => setOpen(false)}>
              {t('cancel')}
            </Button>
            <Button type="submit" disabled={loading} className="h-12 rounded-xl font-black text-sm flex-2 shadow-sm">
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : t('create_event')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
