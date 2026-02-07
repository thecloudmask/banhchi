"use client";

import { useState, useEffect } from "react";
import { Event } from "@/types";
import { updateEvent } from "@/services/event.service";
import { useLanguage } from "@/providers/language-provider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CalendarIcon, Upload, Pencil, MapPin, Clock, Navigation } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface EditEventDialogProps {
  event: Event;
  onSuccess?: () => void;
  trigger?: React.ReactNode;
}

export function EditEventDialog({ event, onSuccess, trigger }: EditEventDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { t } = useLanguage();

  const [title, setTitle] = useState(event.title);
  const [date, setDate] = useState("");
  const [time, setTime] = useState(event.eventTime || "");
  const [location, setLocation] = useState(event.location || "");
  const [mapUrl, setMapUrl] = useState(event.mapUrl || "");
  const [banner, setBanner] = useState<File | null>(null);
  const [status, setStatus] = useState(event.status);
  const [currentBannerUrl, setCurrentBannerUrl] = useState(event.bannerUrl || "");

  useEffect(() => {
    if (open) {
      setTitle(event.title);
      setTime(event.eventTime || "");
      setLocation(event.location || "");
      setMapUrl(event.mapUrl || "");
      setStatus(event.status);
      setCurrentBannerUrl(event.bannerUrl || "");
      setBanner(null);
      
      if (event.eventDate) {
        let eventDate: Date;
        if (event.eventDate instanceof Date) {
          eventDate = event.eventDate;
        } else if (typeof event.eventDate === 'object' && 'seconds' in event.eventDate) {
          eventDate = new Date((event.eventDate as any).seconds * 1000);
        } else {
          eventDate = new Date(event.eventDate as string);
        }
        
        if (!isNaN(eventDate.getTime())) {
          setDate(eventDate.toISOString().split('T')[0]);
        }
      }
    }
  }, [open, event]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date) {
      toast.error(t('fill_all_fields'));
      return;
    }

    try {
      setLoading(true);
      await updateEvent(
        event.id,
        {
          title,
          eventDate: new Date(date),
          eventTime: time || undefined,
          location: location || undefined,
          mapUrl: mapUrl || undefined,
          status,
        },
        banner || undefined
      );
      toast.success(t('toast_updated'));
      if (onSuccess) onSuccess();
      setOpen(false);
    } catch (error) {
      console.error(error);
      toast.error(t('toast_failed_save'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="h-8 rounded-lg gap-2 text-xs font-bold border-border">
            <Pencil className="h-3 w-3" />
            {t('edit')}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl rounded-2xl p-0 border border-border shadow-lg overflow-hidden">
        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="p-8 pb-4 shrink-0 border-b border-border">
             <DialogHeader>
               <DialogTitle className="text-2xl font-black">{t('edit_event')}</DialogTitle>
               <p className="text-muted-foreground font-medium mt-1 text-xs uppercase tracking-widest">Update Event Information</p>
             </DialogHeader>
          </div>

          <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto">
            <div className="space-y-4">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 ml-1">{t('event_title')}</Label>
              <Input
                placeholder="e.g. Wedding of John & Jane"
                className="h-12 bg-secondary/30 border-border rounded-xl font-bold px-4 focus:bg-background transition-all"
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
                    className="h-12 bg-secondary/30 border-border rounded-xl font-bold pl-12 focus:bg-background transition-all"
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
                    className="h-12 bg-secondary/30 border-border rounded-xl font-bold pl-12 focus:bg-background transition-all"
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
                      className="h-12 bg-secondary/30 border-border rounded-xl font-bold pl-12 focus:bg-background transition-all"
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
                      className="h-12 bg-secondary/30 border-border rounded-xl font-bold pl-12 focus:bg-background transition-all"
                      value={mapUrl}
                      onChange={(e) => setMapUrl(e.target.value)}
                    />
                  </div>
               </div>
            </div>

            <div className="space-y-4">
               <Label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 ml-1">{t('status')}</Label>
               <div className="grid grid-cols-2 gap-2">
                 <Button
                    type="button"
                    variant={status === 'active' ? 'default' : 'outline'}
                    className={cn("h-11 rounded-xl font-bold transition-all", status === 'active' ? "bg-primary shadow-lg" : "border-border")}
                    onClick={() => setStatus('active')}
                 >
                    Active
                 </Button>
                 <Button
                    type="button"
                    variant={status === 'completed' ? 'default' : 'outline'}
                    className={cn("h-11 rounded-xl font-bold transition-all", status === 'completed' ? "bg-slate-900 shadow-lg" : "border-border")}
                    onClick={() => setStatus('completed')}
                 >
                    Completed
                 </Button>
               </div>
            </div>

            <div className="space-y-4">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 ml-1">{t('banner_image')} (Optional)</Label>
              {currentBannerUrl && !banner && (
                <div className="mb-2 relative rounded-xl overflow-hidden border border-border h-32">
                   <img src={currentBannerUrl} alt="Banner" className="w-full h-full object-cover" />
                   <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <span className="text-white text-xs font-black uppercase tracking-widest">Current Banner</span>
                   </div>
                </div>
              )}
              <div className="relative group">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setBanner(e.target.files?.[0] || null)}
                  className="h-12 opacity-0 absolute inset-0 w-full z-10 cursor-pointer"
                />
                <div className="h-12 bg-secondary/30 border-border border-2 border-dashed rounded-xl flex items-center px-4 group-hover:bg-secondary/50 transition-all">
                   <Upload className="h-4 w-4 text-muted-foreground mr-3" />
                   <span className="text-sm font-bold text-muted-foreground truncate">
                     {banner ? banner.name : (t('change_banner') || "Update Banner")}
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
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : t('save_changes')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
