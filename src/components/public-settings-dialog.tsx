"use client";

import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { updateEvent } from "@/services/event.service";
import { Loader2, Globe, Copy, Smartphone, Lock, ShieldCheck, Eye, EyeOff, Upload, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { Event } from "@/types";
import { QRCodeSVG } from "qrcode.react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/providers/language-provider";

interface PublicSettingsDialogProps {
  event: Event;
  onRefresh: () => void;
}

export function PublicSettingsDialog({ event, onRefresh }: PublicSettingsDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { t } = useLanguage();
  const [showGuestList, setShowGuestList] = useState(event.showGuestList || false);
  const [passcode, setPasscode] = useState(event.passcode || "");
  const [showPasscode, setShowPasscode] = useState(false);
  
  // Bank QR
  const [bankQrFile, setBankQrFile] = useState<File | null>(null);
  const [qrPreview, setQrPreview] = useState<string | null>(event.bankQrUrl || null);
  
  // Banner
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(event.bannerUrl || null);

  // Gallery
  const [currentGalleryUrls, setCurrentGalleryUrls] = useState<string[]>(event.galleryUrls || []);
  const [newGalleryFiles, setNewGalleryFiles] = useState<File[]>([]);
  const [newGalleryPreviews, setNewGalleryPreviews] = useState<string[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const publicUrl = typeof window !== "undefined" ? `${window.location.protocol}//${window.location.host}/event/${event.id}` : "";

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBankQrFile(file);
      setQrPreview(URL.createObjectURL(file));
    }
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBannerFile(file);
      setBannerPreview(URL.createObjectURL(file));
    }
  };

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

  const handleSave = async () => {
    if (passcode && (passcode.length < 4 || isNaN(Number(passcode)))) {
      toast.error(t('pin_digit_error'));
      return;
    }

    try {
      setLoading(true);

      await updateEvent(
        event.id, 
        { 
          showGuestList, 
          passcode: passcode.trim() || "",
          galleryUrls: currentGalleryUrls
        }, 
        bannerFile || undefined, 
        bankQrFile || undefined,
        newGalleryFiles
      );
      toast.success(t('settings_updated'));
      onRefresh();
      setOpen(false);
    } catch (error) {
      console.error(error);
      toast.error(t('failed_update_settings'));
    } finally {
      setLoading(false);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    toast.success(t('link_copied'));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="lg" className="h-12 rounded-xl border-slate-200 hover:bg-slate-50 font-bold gap-2 shadow-sm bg-white">
          <Globe className="h-4 w-4 text-slate-400" />
          {t('public_settings') || "Public Settings"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl rounded-2xl p-0 border border-border shadow-xl overflow-hidden">
        <div className="flex flex-col md:flex-row h-full">
          {/* Left: QR Code & Privacy Preview */}
          <div className="md:w-80 bg-slate-50 p-10 flex flex-col items-center justify-center text-center space-y-8 border-b md:border-b-0 md:border-r border-slate-100">
             <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-100">
                <QRCodeSVG value={publicUrl} size={180} level="H" includeMargin={true} />
             </div>
             
             <div className="space-y-4">
                <div className="flex items-center justify-center gap-2 text-primary font-black uppercase tracking-[0.2em] text-[10px]">
                   <ShieldCheck className="h-4 w-4" />
                   {t('safety_active')}
                </div>
                <p className="text-xs text-slate-400 font-medium leading-relaxed px-4">
                  {t('guests_scan_qr_desc')} {passcode ? t('pin_protection_active') : t('public_access')}
                </p>
             </div>
             
             <Button variant="outline" size="lg" onClick={copyLink} className="w-full h-12 rounded-xl border-slate-200 bg-white font-bold shadow-sm text-sm">
                <Copy className="h-4 w-4 opacity-40 mr-2" />
                {t('copy_link') || "Copy Link"}
             </Button>
          </div>

          {/* Right: Settings Form */}
          <div className="flex-1 p-10 bg-white overflow-y-auto max-h-[85vh]">
            <DialogHeader className="mb-8">
              <DialogTitle className="text-xl font-black">{t('public_controls')}</DialogTitle>
            </DialogHeader>

            <div className="space-y-10">
              {/* Privacy: Passcode PIN */}
              <div className="space-y-4">
                 <div className="flex items-center justify-between">
                    <Label className="text-xs font-black uppercase tracking-widest opacity-40">{t('privacy_pin')}</Label>
                    {passcode && <span className="text-[10px] font-black text-green-600 uppercase tracking-widest">{t('locked')} 🔐</span>}
                 </div>
                 <div className="relative group">
                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-primary transition-colors" />
                    <Input 
                      type={showPasscode ? "text" : "password"}
                      maxLength={4}
                      placeholder="e.g. 1234"
                      value={passcode}
                      onChange={(e) => setPasscode(e.target.value.replace(/\D/g, ""))}
                      className="h-14 pl-14 pr-16 text-lg tracking-[0.3em] font-black rounded-2xl border-slate-200 bg-slate-50 transition-all focus:bg-white"
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowPasscode(!showPasscode)}
                      className="absolute right-5 top-1/2 -translate-y-1/2 h-10 w-10 flex items-center justify-center text-slate-300 hover:text-slate-900"
                    >
                      {showPasscode ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                 </div>
                 <p className="text-[10px] text-slate-400 font-medium italic">{t('privacy_pin_desc')}</p>
              </div>

              {/* Guest List Visibility */}
              <div className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="space-y-1">
                  <Label className="text-base font-bold text-slate-900">{t('show_guest_names')}</Label>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{t('public_wall_visibility')}</p>
                </div>
                <Switch 
                  checked={showGuestList}
                  onCheckedChange={setShowGuestList}
                />
              </div>

              {/* Visual Assets Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 {/* Banner */}
                 <div className="space-y-4">
                    <Label className="text-xs font-black uppercase tracking-widest opacity-40">{t('banner_image_optional')}</Label>
                    <div 
                        onClick={() => bannerInputRef.current?.click()}
                        className={cn(
                        "relative aspect-video rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition-all overflow-hidden bg-white",
                        bannerPreview && "border-solid border-primary/20"
                        )}
                    >
                        {bannerPreview ? (
                            <img src={bannerPreview} alt="Banner" className="w-full h-full object-cover" />
                        ) : (
                            <div className="flex flex-col items-center gap-2 opacity-40">
                                <Upload className="h-6 w-6 text-primary" />
                                <span className="text-[10px] font-black uppercase">{t('banner')}</span>
                            </div>
                        )}
                        <input type="file" ref={bannerInputRef} className="hidden" accept="image/*" onChange={handleBannerChange} />
                    </div>
                 </div>

                 {/* Bank QR */}
                 <div className="space-y-4">
                    <Label className="text-xs font-black uppercase tracking-widest opacity-40">{t('digital_gift_qr')}</Label>
                    <div 
                        onClick={() => fileInputRef.current?.click()}
                        className={cn(
                        "relative aspect-square max-w-35 rounded-[2rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition-all overflow-hidden bg-white",
                        qrPreview && "border-solid border-primary/20"
                        )}
                    >
                    {qrPreview && qrPreview !== "" ? (
                        <img src={qrPreview} alt="Bank QR" className="w-full h-full object-cover" />
                    ) : (
                        <div className="flex flex-col items-center gap-2 opacity-40">
                        <Smartphone className="h-8 w-8 text-primary" />
                        <span className="text-[10px] font-black uppercase">{t('upload')}</span>
                        </div>
                    )}
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                    </div>
                 </div>
              </div>

              {/* Gallery Manager */}
              <div className="space-y-4">
                 <Label className="text-xs font-black uppercase tracking-widest opacity-40">{t('event_gallery') || 'Event Gallery'}</Label>
                 <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    {/* Current */}
                    {currentGalleryUrls.map((url, idx) => (
                        <div key={`cur-${idx}`} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 group">
                            <img src={url} className="w-full h-full object-cover" />
                            <button onClick={() => removeCurrentGallery(idx)} className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 hover:bg-red-500 transition-all">
                                <X className="h-3 w-3" />
                            </button>
                        </div>
                    ))}
                    {/* New */}
                    {newGalleryPreviews.map((pre, idx) => (
                        <div key={`new-${idx}`} className="relative aspect-square rounded-xl overflow-hidden border border-primary/30 group">
                            <img src={pre} className="w-full h-full object-cover" />
                            <button onClick={() => removeNewGallery(idx)} className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 hover:bg-red-500 transition-all">
                                <X className="h-3 w-3" />
                            </button>
                            <div className="absolute bottom-1 right-1 bg-primary text-[6px] text-white px-1 rounded uppercase font-black">New</div>
                        </div>
                    ))}
                    {/* Add Button */}
                    <button 
                        onClick={() => galleryInputRef.current?.click()}
                        className="aspect-square rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400 hover:bg-white hover:border-primary transition-all"
                    >
                        <Plus className="h-5 w-5" />
                        <input type="file" multiple ref={galleryInputRef} className="hidden" accept="image/*" onChange={handleGalleryChange} />
                    </button>
                 </div>
              </div>
            </div>

            <div className="mt-12 flex gap-4">
              <Button variant="ghost" className="h-12 rounded-xl font-bold flex-1" onClick={() => setOpen(false)}>{t('cancel')}</Button>
              <Button className="h-12 rounded-xl font-black text-base flex-1 shadow-md hover:bg-primary/90 transition-colors" onClick={handleSave} disabled={loading}>
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : t('publish_changes')}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
