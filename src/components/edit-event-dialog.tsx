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
  DialogDescription,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Pencil, CalendarIcon, Upload, MapPin, Clock, Navigation } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EVENT_TEMPLATES } from "@/lib/constants";
import { useIsMobile } from "@/hooks/use-mobile";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerTrigger, DrawerFooter, DrawerClose } from "@/components/ui/drawer";

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
  const [category, setCategory] = useState("merit_making");
  const [customCategory, setCustomCategory] = useState("");
  const [currentBannerUrl, setCurrentBannerUrl] = useState(event.bannerUrl || "");

  useEffect(() => {
    if (open) {
      setTitle(event.title);
      setTime(event.eventTime || "");
      setLocation(event.location || "");
      setMapUrl(event.mapUrl || "");
      setStatus(event.status);
      
      // Determine if it's a template category or custom
      const isTemplate = EVENT_TEMPLATES.some(t => t.id === event.category);
      if (isTemplate) {
        setCategory(event.category || "merit_making");
        setCustomCategory("");
      } else if (event.category) {
        setCategory("custom");
        setCustomCategory(event.category);
      } else {
        setCategory("merit_making");
        setCustomCategory("");
      }

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
          category: category === 'custom' ? customCategory : category,
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

  const isMobile = useIsMobile();

  const renderFormContent = () => (
    <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
      <div className="p-6 sm:p-8 pb-4 shrink-0 border-b border-border">
        <div className="space-y-1">
          {isMobile ? (
            <>
              <DrawerTitle className="text-xl sm:text-2xl font-black">{t('edit_event')}</DrawerTitle>
              <DrawerDescription className="text-muted-foreground font-medium text-[10px] uppercase tracking-widest">{t('update_event_info')}</DrawerDescription>
            </>
          ) : (
            <>
              <DialogTitle className="text-xl sm:text-2xl font-black">{t('edit_event')}</DialogTitle>
              <DialogDescription className="text-muted-foreground font-medium text-[10px] uppercase tracking-widest">{t('update_event_info')}</DialogDescription>
            </>
          )}
        </div>
      </div>

      <div className="p-6 sm:p-8 space-y-6 sm:space-y-8 overflow-y-auto flex-1">
        {/* COVER IMAGE UPLOAD ZONE - Moved into scrollable body */}
        <div className="space-y-3">
          <Label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 ml-1">{t('banner_image')}</Label>
          <div className="relative rounded-2xl overflow-hidden border-2 border-dashed border-zinc-200 h-40 sm:h-48 group bg-zinc-50/50 hover:bg-zinc-100/50 hover:border-primary/50 transition-all">
            {/* Hidden File Input */}
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => setBanner(e.target.files?.[0] || null)}
              className="absolute inset-0 w-full h-full opacity-0 z-20 cursor-pointer"
            />
            
            {/* Content Preview or Placeholder */}
            {(banner || currentBannerUrl) ? (
              <div className="absolute inset-0 w-full h-full">
                <img 
                  src={banner ? URL.createObjectURL(banner) : currentBannerUrl} 
                  alt="Preview" 
                  className={cn("w-full h-full object-cover transition-all duration-500", loading && "opacity-50 blur-sm")} 
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
                   <div className="flex flex-col items-center gap-2">
                     <Upload className="h-6 w-6 text-white" />
                     <span className="text-white text-[10px] font-black uppercase tracking-widest">{t('update_banner')}</span>
                   </div>
                </div>
              </div>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-muted-foreground">
                <div className="p-4 rounded-full bg-white shadow-sm border border-zinc-100">
                  <Upload className="h-6 w-6 text-primary" />
                </div>
                <span className="text-xs font-bold uppercase tracking-widest">{t('update_banner')}</span>
              </div>
            )}

            {/* Uploading Status Overlay */}
            {loading && banner && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-[2px] z-30 animate-in fade-in duration-300">
                <div className="bg-white/90 p-3 rounded-full shadow-2xl mb-2 animate-bounce">
                  <Loader2 className="h-6 w-6 text-primary animate-spin" />
                </div>
                <span className="text-white text-[10px] font-black uppercase tracking-widest drop-shadow-md">
                  {t('uploading') || 'Uploading...'}
                </span>
              </div>
            )}
          </div>
        </div>
        <div className="space-y-3 sm:space-y-4">
          <Label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 ml-1">{t('event_title')}</Label>
          <Input
            placeholder={t('event_title_placeholder')}
            className="h-12 bg-zinc-50 border-zinc-200 rounded-xl font-bold px-4 focus:bg-white focus:border-primary transition-all text-base sm:text-sm"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div className="space-y-3 sm:space-y-4">
            <Label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 ml-1">{t('event_date')}</Label>
            <div className="relative">
              <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                type="date"
                className="h-12 bg-zinc-50 border-zinc-200 rounded-xl font-bold pl-12 focus:bg-white focus:border-primary transition-all w-full text-base sm:text-sm block"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-3 sm:space-y-4">
            <Label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 ml-1">{t('event_time')}</Label>
            <div className="relative">
              <Clock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                type="time"
                className="h-12 bg-zinc-50 border-zinc-200 rounded-xl font-bold pl-12 focus:bg-white focus:border-primary transition-all w-full text-base sm:text-sm block"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
           <div className="space-y-3 sm:space-y-4">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 ml-1">{t('location')}</Label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  placeholder={t('venue_name_placeholder')}
                  className="h-12 bg-zinc-50 border-zinc-200 rounded-xl font-bold pl-12 focus:bg-white focus:border-primary transition-all text-base sm:text-sm"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
           </div>
           <div className="space-y-3 sm:space-y-4">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 ml-1">{t('map_pin_url')}</Label>
              <div className="relative">
                <Navigation className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  placeholder={t('google_maps_link_placeholder')}
                  className="h-12 bg-zinc-50 border-zinc-200 rounded-xl font-bold pl-12 focus:bg-white focus:border-primary transition-all text-base sm:text-sm"
                  value={mapUrl}
                  onChange={(e) => setMapUrl(e.target.value)}
                />
              </div>
           </div>
        </div>

        <div className="space-y-3 sm:space-y-4">
           <Label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 ml-1">{t('status')}</Label>
           <div className="grid grid-cols-2 gap-2">
             <Button
                type="button"
                variant={status === 'active' ? 'default' : 'outline'}
                className={cn("h-11 rounded-xl font-bold transition-all", status === 'active' ? "bg-primary shadow-lg shadow-primary/20" : "border-zinc-200")}
                onClick={() => setStatus('active')}
             >
                {t('active')}
             </Button>
             <Button
                type="button"
                variant={status === 'completed' ? 'default' : 'outline'}
                className={cn("h-11 rounded-xl font-bold transition-all", status === 'completed' ? "bg-zinc-900 shadow-lg shadow-zinc-900/20" : "border-zinc-200")}
                onClick={() => setStatus('completed')}
             >
                {t('completed')}
             </Button>
           </div>
        </div>

        <div className="space-y-3 sm:space-y-4">
          <Label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 ml-1">{t('event_category')}</Label>
          <div className="space-y-3 sm:space-y-4">
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="h-12 bg-zinc-50 border-zinc-200 rounded-xl font-bold px-4 focus:bg-white focus:border-primary transition-all">
                <SelectValue placeholder={t('select_best_fit')} />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {EVENT_TEMPLATES.map(temp => (
                  <SelectItem key={temp.id} value={temp.id} className="font-bold">
                    {t(temp.id) || temp.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {category === 'custom' && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                <Input
                  placeholder={t('enter_custom_category')}
                  className="h-12 bg-white border-primary/20 border-2 rounded-xl font-bold px-4 focus:border-primary transition-all shadow-sm"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                />
              </div>
            )}
          </div>
        </div>

        {/* Banner image now at top */}
      </div>

      <div className="p-6 sm:p-8 pb-12 sm:pb-8 bg-zinc-50/50 flex flex-col sm:flex-row gap-3 border-t border-border mt-auto">
        <Button 
          type="button" 
          variant="outline" 
          className="h-12 rounded-xl font-bold flex-1 order-2 sm:order-1 border-zinc-200" 
          onClick={() => setOpen(false)}
        >
          {t('cancel')}
        </Button>
        <Button 
          type="submit" 
          disabled={loading} 
          className="h-12 rounded-xl font-black text-sm flex-2 shadow-sm shadow-primary/20 order-1 sm:order-2 bg-primary hover:bg-primary/90"
        >
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : t('save_changes')}
        </Button>
      </div>
    </form>
  );

  const triggerElement = trigger || (
    <Button variant="outline" size="sm" className="h-8 rounded-lg gap-2 text-xs font-bold border-zinc-200">
      <Pencil className="h-3 w-3" />
      {t('edit')}
    </Button>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          {triggerElement}
        </DrawerTrigger>
        <DrawerContent className="rounded-t-3xl max-h-[92vh]">
          {renderFormContent()}
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {triggerElement}
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl w-[95vw] max-h-[90vh] flex flex-col rounded-2xl p-0 border border-border shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        {renderFormContent()}
      </DialogContent>
    </Dialog>
  );
}