"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createEvent } from "@/services/event.service";
import { Loader2, Plus, CalendarIcon, Upload, MapPin, Clock, Navigation, X } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/providers/language-provider";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EVENT_TEMPLATES } from "@/lib/constants";
import { useIsMobile } from "@/hooks/use-mobile";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerTrigger, DrawerFooter, DrawerClose } from "@/components/ui/drawer";
import RichTextEditor from "./rich-text-editor";
import { Textarea } from "@/components/ui/textarea";

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
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const [category, setCategory] = useState("merit_making");
  const [customCategory, setCustomCategory] = useState("");
  const [description, setDescription] = useState("");
  const [extraData, setExtraData] = useState<Record<string, any>>({});
  const router = useRouter();

  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setGalleryFiles(prev => [...prev, ...newFiles]);
      const newPreviews = newFiles.map(file => URL.createObjectURL(file));
      setGalleryPreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const removeGalleryImage = (index: number) => {
    setGalleryFiles(prev => prev.filter((_, i) => i !== index));
    setGalleryPreviews(prev => {
        URL.revokeObjectURL(prev[index]);
        return prev.filter((_, i) => i !== index);
    });
  };

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
        category: category === 'custom' ? customCategory : category,
        description: description || undefined,
        extraData: Object.keys(extraData).length > 0 ? extraData : undefined,
      }, banner || undefined, galleryFiles);
      
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
    setGalleryFiles([]);
    setGalleryPreviews([]);
    setCategory("merit_making");
    setCustomCategory("");
    setDescription("");
    setExtraData({});
  };

  const isMobile = useIsMobile();
  


  const renderFormContent = () => (
    <form onSubmit={handleSubmit} className="flex flex-col h-full bg-slate-50/50">
      {/* Premium Header */}
      <div className="bg-white px-8 pt-10 pb-6 border-b border-slate-100 flex items-center justify-between shrink-0">
        <div className="space-y-1.5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Plus className="h-5 w-5 text-primary" />
            </div>
            <DrawerTitle className="text-2xl font-black text-slate-900 tracking-tight">{t('create_event')}</DrawerTitle>
          </div>
          <DrawerDescription className="text-slate-400 font-medium text-xs uppercase tracking-widest pl-1">{t('basic_event_details')}</DrawerDescription>
        </div>
        <DrawerClose asChild>
          <Button variant="ghost" size="icon" className="rounded-full hover:bg-slate-100 h-10 w-10 transition-colors">
            <X className="h-5 w-5 text-slate-400" />
          </Button>
        </DrawerClose>
      </div>

      {/* Scrollable Body with Grouped Sections */}
      <div className="flex-1 overflow-y-auto p-6 sm:p-10 space-y-10 custom-scrollbar">
        
        {/* SECTION 1: VISUALS */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-1 w-8 bg-primary rounded-full" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{t('event_visuals') || "Event Visuals"}</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Banner Upload */}
            <div className="group space-y-3">
              <Label className="text-xs font-bold text-slate-600 block pl-1">{t('banner_image')}</Label>
              <div className="relative rounded-3xl overflow-hidden border-2 border-dashed border-slate-200 h-52 group-hover:border-primary/40 transition-all duration-500 bg-white shadow-sm ring-4 ring-transparent group-hover:ring-primary/5">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => setBanner(e.target.files?.[0] || null)} 
                  className="absolute inset-0 w-full h-full opacity-0 z-20 cursor-pointer" 
                />
                {banner ? (
                  <div className="absolute inset-0 w-full h-full">
                    <img src={URL.createObjectURL(banner)} alt="Preview" className={cn("w-full h-full object-cover transition-transform duration-700 group-hover:scale-105", loading && "opacity-50 blur-sm")} />
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
                      <Upload className="h-6 w-6 text-primary" />
                    </div>
                    <div className="text-center">
                      <span className="block text-xs font-black uppercase tracking-widest text-slate-600">{t('upload_banner')}</span>
                      <span className="text-[10px] opacity-60 mt-1 block">JPG, PNG up to 10MB</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Gallery Manager */}
            <div className="space-y-3">
              <Label className="text-xs font-bold text-slate-600 block pl-1">{t('gallery_images')}</Label>
              <div className="h-52 rounded-3xl bg-white border border-slate-200 p-4 shadow-sm overflow-hidden flex flex-col">
                <div className="grid grid-cols-3 gap-3 overflow-y-auto pr-2 custom-scrollbar">
                  {galleryPreviews.map((pre, idx) => (
                    <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden border border-slate-100 group shadow-sm bg-slate-50">
                      <img src={pre} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                      <button 
                        type="button"
                        onClick={() => removeGalleryImage(idx)} 
                        className="absolute top-1.5 right-1.5 bg-black/60 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 hover:bg-red-500 transition-all backdrop-blur-md shadow-lg"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                  <label className="aspect-square rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 hover:border-primary/40 transition-all group shadow-inner">
                    <div className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                      <Plus className="h-4 w-4 text-slate-400 group-hover:text-primary transition-colors" />
                    </div>
                    <input type="file" multiple accept="image/*" onChange={handleGalleryChange} className="hidden" />
                  </label>
                </div>
                {galleryPreviews.length === 0 && (
                  <div className="flex-1 flex items-center justify-center">
                    <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{t('no_images_yet') || "No images yet"}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: PRIMARY DETAILS */}
        <div className="bg-white rounded-[2.5rem] border border-slate-200/60 p-8 sm:p-10 shadow-sm space-y-8">
           <div className="flex items-center gap-2">
              <div className="h-6 w-1 bg-amber-400 rounded-full" />
              <h3 className="text-lg font-black text-slate-900 tracking-tight">{t('event_info') || "Event Information"}</h3>
           </div>

           <div className="grid grid-cols-1 gap-8">
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">{t('event_title')}</Label>
                <div className="group">
                  <Input
                    placeholder={t('event_title_placeholder')}
                    className="h-14 bg-slate-50/50 border-slate-100 rounded-2xl font-bold px-6 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all text-base sm:text-lg shadow-inner"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Dates Section */}
                <div className="space-y-4">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">{t('event_date') || "Event Date"}</Label>
                  <div className="relative">
                    <CalendarIcon className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-primary/40 pointer-events-none" />
                    <Input
                      type="date"
                      className="h-14 bg-slate-50 border-slate-100 rounded-2xl font-bold pl-14 focus:border-primary transition-all shadow-inner w-full text-base sm:text-sm cursor-pointer"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                    />
                  </div>
                </div>

                {/* Time Picker */}
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

                {/* Category Selector */}
                <div className="space-y-4">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">{t('event_category')}</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="h-14 bg-slate-50 border-slate-100 rounded-2xl font-bold px-6 focus:border-primary transition-all shadow-inner">
                      <SelectValue placeholder={t('select_best_fit')} />
                    </SelectTrigger>
                    <SelectContent 
                      className="rounded-2xl border-slate-100 shadow-2xl p-2 z-50"
                    >
                      {EVENT_TEMPLATES.map(temp => (
                        <SelectItem key={temp.id} value={temp.id} className="font-bold py-3 rounded-xl focus:bg-primary/5 focus:text-primary transition-colors">
                          {t(temp.id) || temp.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  {category === 'custom' && (
                    <Input
                      placeholder={t('enter_custom_category')}
                      className="h-12 bg-white border-primary/20 border-2 rounded-xl font-bold px-4 focus:border-primary transition-all animate-in slide-in-from-top-2"
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                    />
                  )}
                </div>
              </div>
           </div>
        </div>

        {/* SECTION 3: LOCATION & DETAILS */}
        <div className="bg-white rounded-[2.5rem] border border-slate-200/60 p-8 sm:p-10 shadow-sm space-y-8">
           <div className="flex items-center gap-2">
              <div className="h-6 w-1 bg-indigo-400 rounded-full" />
              <h3 className="text-lg font-black text-slate-900 tracking-tight">{t('location_map') || "Location & Venue"}</h3>
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



           {/* Description / Rich Text */}
           <div className="space-y-4 pt-4">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">{t('event_description')}</Label>
              <div className="rounded-[2.5rem] border border-slate-100 bg-slate-50/30 overflow-hidden shadow-inner focus-within:ring-4 focus-within:ring-primary/5 focus-within:border-primary/20 transition-all">
                <RichTextEditor 
                  value={description} 
                  onChange={setDescription} 
                  className="min-h-48"
                  placeholder={t('event_description_placeholder')}
                />
              </div>
           </div>
        </div>

        {/* Padding for bottom buttons */}
        <div className="h-10" />
      </div>

      {/* Floating Action Footer */}
      <div className="p-6 sm:p-10 bg-white border-t border-slate-100 flex flex-row gap-4 shrink-0 shadow-[0_-10px_30px_-15px_rgba(0,0,0,0.05)]">
        <DrawerClose asChild>
          <Button 
            type="button" 
            variant="ghost" 
            className="h-14 rounded-2xl font-bold flex-1 text-slate-500 hover:bg-slate-100" 
          >
            {t('cancel')}
          </Button>
        </DrawerClose>
        <Button 
          type="submit" 
          disabled={loading} 
          className="h-14 rounded-2xl font-black text-base flex-2 shadow-2xl shadow-primary/20 bg-primary hover:bg-primary/90 text-white transition-all transform active:scale-95"
        >
          {loading ? (
            <div className="flex items-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>{t('saving') || 'Saving...'}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              <span>{t('create_event')}</span>
            </div>
          )}
        </Button>
      </div>
    </form>
  );

  const trigger = (
    <Button size="lg" className="h-12 px-6 rounded-xl font-bold bg-primary text-white shadow-md transition-colors hover:bg-primary/90">
      <Plus className="mr-2 h-5 w-5" />
      {t('create_event')}
    </Button>
  );

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        {trigger}
      </DrawerTrigger>
      <DrawerContent className="rounded-t-[2.5rem] h-[96vh] sm:h-[94vh] max-w-4xl mx-auto border-none shadow-2xl overflow-hidden bg-white">
        {renderFormContent()}
      </DrawerContent>
    </Drawer>
  );
}