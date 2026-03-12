"use client";

import { useState, useEffect, useRef } from "react";
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
import { Loader2, Pencil, CalendarIcon, Upload, MapPin, Clock, Navigation, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EVENT_TEMPLATES } from "@/lib/constants";
import { useIsMobile } from "@/hooks/use-mobile";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerTrigger, DrawerFooter, DrawerClose } from "@/components/ui/drawer";
import RichTextEditor from "./rich-text-editor";

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
  const [description, setDescription] = useState(event.description || "");
  const [extraData, setExtraData] = useState<Record<string, any>>(event.extraData || {});

  // Gallery Management
  const [currentGalleryUrls, setCurrentGalleryUrls] = useState<string[]>(event.galleryUrls || []);
  const [newGalleryFiles, setNewGalleryFiles] = useState<File[]>([]);
  const [newGalleryPreviews, setNewGalleryPreviews] = useState<string[]>([]);
  
  const galleryInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTitle(event.title);
      setTime(event.eventTime || "");
      setLocation(event.location || "");
      setMapUrl(event.mapUrl || "");
      setStatus(event.status);
      
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
      setDescription(event.description || "");
      setExtraData(event.extraData || {});

      setCurrentGalleryUrls(event.galleryUrls || []);
      setNewGalleryFiles([]);
      setNewGalleryPreviews([]);

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

  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setNewGalleryFiles(prev => [...prev, ...files]);
      setNewGalleryPreviews(prev => [...prev, ...files.map(f => URL.createObjectURL(f))]);
    }
  };

  const removeCurrentGallery = (index: number) => {
    setCurrentGalleryUrls(prev => prev.filter((_, i) => i !== index));
  };

  const removeNewGallery = (index: number) => {
    setNewGalleryFiles(prev => prev.filter((_, i) => i !== index));
    setNewGalleryPreviews(prev => {
        URL.revokeObjectURL(prev[index]);
        return prev.filter((_, i) => i !== index);
    });
  };

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
          title: title.trim(),
          eventDate: new Date(date),
          eventTime: time || undefined,
          location: location || undefined,
          mapUrl: mapUrl || undefined,
          status,
          category: category === 'custom' ? customCategory : category,
          galleryUrls: currentGalleryUrls,
          description: description || undefined,
          extraData: Object.keys(extraData).length > 0 ? extraData : undefined,
        },
        banner || undefined,
        undefined,
        newGalleryFiles
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

  const renderFormContent = () => (
    <form onSubmit={handleSubmit} className="flex flex-col h-full bg-slate-50/50">
      {/* Premium Header */}
      <div className="bg-white px-8 pt-10 pb-6 border-b border-slate-100 flex items-center justify-between shrink-0">
        <div className="space-y-1.5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-amber-500/10 flex items-center justify-center">
              <CalendarIcon className="h-5 w-5 text-amber-600" />
            </div>
            <DrawerTitle className="text-2xl font-black text-slate-900 tracking-tight">{t('edit_event')}</DrawerTitle>
          </div>
          <DrawerDescription className="text-slate-400 font-medium text-xs uppercase tracking-widest pl-1">{t('update_event_info')}</DrawerDescription>
        </div>
        <DrawerClose asChild>
          <Button variant="ghost" size="icon" className="rounded-full hover:bg-slate-100 h-10 w-10">
            <X className="h-5 w-5 text-slate-400" />
          </Button>
        </DrawerClose>
      </div>

      {/* Scrollable Body with Grouped Sections */}
      <div className="flex-1 overflow-y-auto p-6 sm:p-10 space-y-10 custom-scrollbar">
        
        {/* SECTION 1: VISUALS */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-1 w-8 bg-amber-500 rounded-full" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{t('event_visuals') || "Event Visuals"}</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Banner Section */}
            <div className="group space-y-3">
              <Label className="text-xs font-bold text-slate-600 block pl-1">{t('banner_image')}</Label>
              <div className="relative rounded-3xl overflow-hidden border-2 border-dashed border-slate-200 h-52 group-hover:border-amber-500/40 transition-all duration-500 bg-white shadow-sm ring-4 ring-transparent group-hover:ring-amber-500/5">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => setBanner(e.target.files?.[0] || null)} 
                  className="absolute inset-0 w-full h-full opacity-0 z-20 cursor-pointer" 
                />
                {(banner || currentBannerUrl) ? (
                  <div className="absolute inset-0 w-full h-full">
                    <img 
                      src={banner ? URL.createObjectURL(banner) : currentBannerUrl} 
                      alt="Banner" 
                      className={cn("w-full h-full object-cover transition-transform duration-700 group-hover:scale-105", loading && "opacity-50 blur-sm")} 
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 backdrop-blur-sm">
                      <div className="flex flex-col items-center gap-2 text-white">
                        <Upload className="h-8 w-8" />
                        <span className="text-[10px] font-black uppercase tracking-widest">{t('change_banner')}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-slate-400">
                    <div className="h-14 w-14 rounded-full bg-slate-50 flex items-center justify-center shadow-inner border border-slate-100 group-hover:bg-white transition-colors">
                      <Upload className="h-6 w-6 text-amber-500" />
                    </div>
                    <div className="text-center">
                      <span className="block text-xs font-black uppercase tracking-widest text-slate-600">{t('upload_banner')}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Gallery Section */}
            <div className="space-y-3">
              <Label className="text-xs font-bold text-slate-600 block pl-1">{t('gallery_images')}</Label>
              <div className="h-52 rounded-3xl bg-white border border-slate-200 p-4 shadow-sm overflow-hidden flex flex-col">
                <div className="grid grid-cols-3 gap-3 overflow-y-auto pr-2 custom-scrollbar">
                  {/* Existing Images */}
                  {currentGalleryUrls.map((url, idx) => (
                    <div key={`existing-${idx}`} className="relative aspect-square rounded-2xl overflow-hidden border border-slate-100 group shadow-sm bg-slate-50">
                      <img src={url} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                      <button 
                        type="button"
                        onClick={() => removeCurrentGallery(idx)} 
                        className="absolute top-1.5 right-1.5 bg-black/60 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 hover:bg-red-500 transition-all backdrop-blur-md shadow-lg"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                  {/* New Image Previews */}
                  {newGalleryPreviews.map((pre, idx) => (
                    <div key={`new-${idx}`} className="relative aspect-square rounded-2xl overflow-hidden border border-amber-200 group shadow-sm bg-amber-50/30">
                      <img src={pre} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                      <div className="absolute top-1 left-1 bg-amber-500 text-[8px] font-black text-white px-1.5 py-0.5 rounded-full uppercase tracking-tighter">New</div>
                      <button 
                        type="button"
                        onClick={() => removeNewGallery(idx)} 
                        className="absolute top-1.5 right-1.5 bg-black/60 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 hover:bg-red-500 transition-all backdrop-blur-md"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                  <button 
                    type="button"
                    onClick={() => galleryInputRef.current?.click()}
                    className="aspect-square rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 hover:border-amber-500/40 transition-all group shadow-inner"
                  >
                    <div className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-amber-500/10 transition-colors">
                      <Plus className="h-4 w-4 text-slate-400 group-hover:text-amber-500 transition-colors" />
                    </div>
                    <input type="file" multiple ref={galleryInputRef} accept="image/*" onChange={handleGalleryChange} className="hidden" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: INFORMATION */}
        <div className="bg-white rounded-[2.5rem] border border-slate-200/60 p-8 sm:p-10 shadow-sm space-y-8">
          <div className="flex items-center gap-2">
            <div className="h-6 w-1 bg-amber-400 rounded-full" />
            <h3 className="text-lg font-black text-slate-900 tracking-tight">{t('general_info')}</h3>
          </div>

          <div className="grid grid-cols-1 gap-8">
            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">{t('event_title')}</Label>
              <Input
                placeholder={t('event_title_placeholder')}
                className="h-14 bg-slate-50/50 border-slate-100 rounded-2xl font-bold px-6 focus:bg-white focus:border-amber-500 focus:ring-4 focus:ring-amber-500/5 transition-all text-base sm:text-lg shadow-inner"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Date Selection */}
              <div className="space-y-4">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">{t('event_date') || "Event Date"}</Label>
                <div className="relative">
                  <CalendarIcon className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-amber-500/40 pointer-events-none" />
                  <Input
                    type="date"
                    className="h-14 bg-slate-50 border-slate-100 rounded-2xl font-bold pl-14 focus:border-amber-500 transition-all shadow-inner w-full text-base sm:text-sm cursor-pointer"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>
              </div>

              {/* Time Selection */}
              <div className="space-y-4">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">{t('event_time')}</Label>
                <div className="relative">
                  <Clock className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-indigo-500/40 pointer-events-none" />
                  <Input
                    type="time"
                    className="h-14 bg-slate-50 border-slate-100 rounded-2xl font-bold pl-14 focus:border-indigo-500 transition-all shadow-inner w-full text-base sm:text-sm cursor-pointer"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                  />
                </div>
              </div>

              {/* Category Selection */}
              <div className="space-y-4">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">{t('event_category')}</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="h-14 bg-slate-50 border-slate-100 rounded-2xl font-bold px-6 focus:border-amber-500 transition-all shadow-inner">
                    <SelectValue placeholder={t('select_best_fit')} />
                  </SelectTrigger>
                  <SelectContent 
                    className="rounded-2xl border-slate-100 shadow-2xl p-2 z-50"
                  >
                    {EVENT_TEMPLATES.map(temp => (
                      <SelectItem key={temp.id} value={temp.id} className="font-bold py-3 rounded-xl focus:bg-amber-50 focus:text-amber-600 transition-colors">
                        {t(temp.id) || temp.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {category === 'custom' && (
                  <Input
                    placeholder={t('enter_custom_category')}
                    className="h-12 bg-white border-amber-500/20 border-2 rounded-xl font-bold px-4 focus:border-amber-500 transition-all animate-in slide-in-from-top-2"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3: LOCATION & VENUE */}
        <div className="bg-white rounded-[2.5rem] border border-slate-200/60 p-8 sm:p-10 shadow-sm space-y-8">
          <div className="flex items-center gap-2">
            <div className="h-6 w-1 bg-indigo-400 rounded-full" />
            <h3 className="text-lg font-black text-slate-900 tracking-tight">{t('location_map')}</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">{t('location')}</Label>
              <div className="relative">
                <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-red-500/40 pointer-events-none" />
                <Input
                  placeholder={t('venue_name_placeholder')}
                  className="h-14 bg-slate-50 border-slate-100 rounded-2xl font-bold pl-14 focus:border-red-500 transition-all shadow-inner"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">{t('map_pin_url')}</Label>
              <div className="relative">
                <Navigation className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-green-500/40 pointer-events-none" />
                <Input
                  placeholder={t('google_maps_link_placeholder')}
                  className="h-14 bg-slate-50 border-slate-100 rounded-2xl font-bold pl-14 focus:border-green-500 transition-all shadow-inner"
                  value={mapUrl}
                  onChange={(e) => setMapUrl(e.target.value)}
                />
              </div>
            </div>
          </div>



          {/* Description Section */}
          <div className="space-y-4 pt-4">
            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">{t('event_description')}</Label>
            <div className="rounded-[2.5rem] border border-slate-100 bg-slate-50/30 overflow-hidden shadow-inner focus-within:ring-4 focus-within:ring-amber-500/5 transition-all">
              <RichTextEditor 
                value={description} 
                onChange={setDescription} 
                className="min-h-48"
                placeholder={t('event_description_placeholder')}
              />
            </div>
          </div>
        </div>

        <div className="h-10" />
      </div>

      {/* Floating Action Footer */}
      <div className="p-6 sm:p-10 bg-white border-t border-slate-100 flex flex-row gap-4 shrink-0 shadow-[0_-10px_30px_-15px_rgba(0,0,0,0.05)]">
        <DrawerClose asChild>
          <Button type="button" variant="ghost" className="h-14 rounded-2xl font-bold flex-1 text-slate-500 hover:bg-slate-100">
            {t('cancel')}
          </Button>
        </DrawerClose>
        <Button 
          type="submit" 
          disabled={loading} 
          className="h-14 rounded-2xl font-black text-base flex-2 shadow-2xl shadow-amber-500/20 bg-amber-500 hover:bg-amber-600 text-white transition-all transform active:scale-95"
        >
          {loading ? (
            <div className="flex items-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>{t('saving') || 'Saving...'}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Pencil className="h-5 w-5" />
              <span>{t('save_changes')}</span>
            </div>
          )}
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

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        {triggerElement}
      </DrawerTrigger>
      <DrawerContent className="rounded-t-[2.5rem] h-[96vh] sm:h-[94vh] max-w-4xl mx-auto border-none shadow-2xl overflow-hidden bg-white">
        {renderFormContent()}
      </DrawerContent>
    </Drawer>
  );
}