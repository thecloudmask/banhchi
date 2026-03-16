"use client";

import { useState, useRef } from "react";
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
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { updateEvent } from "@/services/event.service";
import {
  Loader2,
  Globe,
  Copy,
  Smartphone,
  Lock,
  ShieldCheck,
  Eye,
  EyeOff,
  Upload,
  Plus,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Event } from "@/types";
import { QRCodeSVG } from "qrcode.react";
import { cn } from "@/lib/utils";

interface PublicSettingsDialogProps {
  event: Event;
  onRefresh: () => void;
}

export function PublicSettingsDialog({
  event,
  onRefresh,
}: PublicSettingsDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  // No internationalization needed
  const [showGuestList, setShowGuestList] = useState(
    event.showGuestList || false,
  );
  const [passcode, setPasscode] = useState(event.passcode || "");
  const [showPasscode, setShowPasscode] = useState(false);

  // Bank QR
  const [bankQrFile, setBankQrFile] = useState<File | null>(null);
  const [qrPreview, setQrPreview] = useState<string | null>(
    event.bankQrUrl || null,
  );

  // Banner
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(
    event.bannerUrl || null,
  );

  // Gallery
  const [currentGalleryUrls, setCurrentGalleryUrls] = useState<string[]>(
    event.galleryUrls || [],
  );
  const [newGalleryFiles, setNewGalleryFiles] = useState<File[]>([]);
  const [newGalleryPreviews, setNewGalleryPreviews] = useState<string[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const publicUrl =
    typeof window !== "undefined"
      ? `${window.location.protocol}//${window.location.host}/event/${event.id}`
      : "";

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
      setNewGalleryFiles((prev) => [...prev, ...files]);
      setNewGalleryPreviews((prev) => [
        ...prev,
        ...files.map((f) => URL.createObjectURL(f)),
      ]);
    }
  };

  const removeCurrentGallery = (index: number) => {
    setCurrentGalleryUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const removeNewGallery = (index: number) => {
    setNewGalleryFiles((prev) => prev.filter((_, i) => i !== index));
    setNewGalleryPreviews((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSave = async () => {
    if (passcode && (passcode.length < 4 || isNaN(Number(passcode)))) {
      toast.error("លេខសម្ងាត់ត្រូវតែមាន ៤ ខ្ទង់");
      return;
    }

    try {
      setLoading(true);

      await updateEvent(
        event.id,
        {
          showGuestList,
          passcode: passcode.trim() || "",
          galleryUrls: currentGalleryUrls,
        },
        bannerFile || undefined,
        bankQrFile || undefined,
        newGalleryFiles,
      );
      toast.success("បានកែប្រែការកំណត់ដោយជោគជ័យ");
      onRefresh();
      setOpen(false);
    } catch (error) {
      console.error(error);
      toast.error("បរាជ័យក្នុងការកែប្រែការកំណត់");
    } finally {
      setLoading(false);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    toast.success("បានចម្លងតំណភ្ជាប់");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-9 rounded-md border-border bg-muted/30 hover:bg-accent text-muted-foreground font-semibold gap-2 text-xs uppercase px-4"
        >
          <Globe className="h-3.5 w-3.5 text-primary" />
          <span>តំណភ្ជាប់</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl rounded-md p-0 border border-border shadow-xl overflow-hidden bg-background">
        <div className="flex flex-col md:flex-row h-full">
          {/* Left: QR Code & Privacy */}
          <div className="md:w-72 bg-card/50 p-8 flex flex-col items-center justify-center text-center space-y-6 border-b md:border-b-0 md:border-r border-border">
            <div className="bg-white p-4 rounded-md shadow-md">
              <QRCodeSVG
                value={publicUrl}
                size={160}
                level="H"
                includeMargin={true}
              />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-center gap-2 text-primary font-semibold uppercase text-[10px]">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>សកម្មភាពសុវត្ថិភាព</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed px-2">
                <span>ភ្ញៀវអាចស្កែនកូដ ដើម្បីមើលព័ត៌មាន។</span>{" "}
                {passcode
                  ? <span>ការការពារដោយលេខសម្ងាត់កំពុងដំណើរការ។</span>
                  : <span>ការចូលមើលជាសាធារណៈ។</span>}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={copyLink}
              className="w-full h-9 rounded-md border-border bg-muted/30 hover:bg-accent text-muted-foreground font-semibold text-xs transition-all"
            >
              <Copy className="h-3.5 w-3.5 mr-2 text-muted-foreground/50" />
              <span>ចម្លងតំណភ្ជាប់</span>
            </Button>
          </div>

          {/* Right: Settings Form */}
          <div className="flex-1 p-8 overflow-y-auto max-h-[85vh]">
            <DialogHeader className="mb-6">
              <DialogTitle className="text-lg font-bold text-foreground italic">
                <span>ការកំណត់ការមើលជាសាធារណៈ</span>
              </DialogTitle>
              <DialogDescription className="sr-only">
                កំណត់ភាពមើលឃើញ និងសុវត្ថិភាពនៃគេហទំព័រសាធារណៈរបស់អ្នក
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-8">
              {/* Passcode PIN */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-[10px] font-semibold uppercase text-muted-foreground">
                    <span>លេខសម្ងាត់ (PIN)</span>
                  </Label>
                  {passcode && (
                    <span className="text-[10px] font-semibold text-emerald-500 uppercase">
                      <span>បានចាក់សោ</span> 🔐
                    </span>
                  )}
                </div>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50 group-focus-within:text-primary transition-colors" />
                  <Input
                    type={showPasscode ? "text" : "password"}
                    maxLength={4}
                    placeholder="e.g. 1234"
                    value={passcode}
                    onChange={(e) =>
                      setPasscode(e.target.value.replace(/\D/g, ""))
                    }
                    className="h-10 pl-10 pr-12 text-base font-bold rounded-md border-border bg-muted/30 text-foreground placeholder:text-muted-foreground/30 focus:ring-primary/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasscode(!showPasscode)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 h-8 w-8 flex items-center justify-center text-muted-foreground/50 hover:text-foreground transition-colors"
                  >
                    {showPasscode ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <p className="text-[10px] text-muted-foreground/50 italic">
                  <span>លេខសម្ងាត់ ៤ ខ្ទង់ដើម្បីការពារទិន្នន័យភ្ញៀវ។</span>
                </p>
              </div>

              {/* Guest List Visibility */}
              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-md border border-border">
                <div className="space-y-0.5">
                  <Label className="text-sm font-semibold text-foreground">
                    <span>បង្ហាញបញ្ជីឈ្មោះភ្ញៀវ</span>
                  </Label>
                  <p className="text-[10px] text-muted-foreground font-semibold uppercase">
                    <span>ការមើលឃើញនៅលើជញ្ជាំងសាធារណៈ</span>
                  </p>
                </div>
                <Switch
                  checked={showGuestList}
                  onCheckedChange={setShowGuestList}
                />
              </div>

              {/* Visual Assets Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Banner */}
                <div className="space-y-3">
                  <Label className="text-[10px] font-semibold uppercase text-muted-foreground">
                    <span>រូបភាព Banner (មិនមានក៏បាន)</span>
                  </Label>
                  <div
                    onClick={() => bannerInputRef.current?.click()}
                    className={cn(
                      "relative aspect-video rounded-md border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:bg-accent transition-all overflow-hidden bg-muted/20",
                      bannerPreview && "border-solid border-primary/30",
                    )}
                  >
                    {bannerPreview ? (
                      <img
                        src={bannerPreview}
                        alt="Banner"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-2 opacity-30 text-foreground">
                        <Upload className="h-5 w-5" />
                        <span className="text-[10px] font-semibold uppercase">
                          <span>រូបភាព Banner</span>
                        </span>
                      </div>
                    )}
                    <input
                      type="file"
                      ref={bannerInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={handleBannerChange}
                    />
                  </div>
                </div>

                {/* Bank QR */}
                <div className="space-y-3">
                  <Label className="text-[10px] font-semibold uppercase text-muted-foreground">
                    {"QR កូដ សម្រាប់ទទួលចំណងដៃ"}
                  </Label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className={cn(
                      "relative aspect-square max-w-32 rounded-md border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:bg-accent transition-all overflow-hidden bg-muted/20",
                      qrPreview && "border-solid border-primary/30",
                    )}
                  >
                    {qrPreview && qrPreview !== "" ? (
                      <img
                        src={qrPreview}
                        alt="Bank QR"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-2 opacity-30 text-foreground">
                        <Smartphone className="h-7 w-7" />
                        <span className="text-[10px] font-semibold uppercase">
                          {"បញ្ចូលរូបភាព"}
                        </span>
                      </div>
                    )}
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                  </div>
                </div>
              </div>

              {/* Gallery Manager */}
              <div className="space-y-3">
                <Label className="text-[10px] font-semibold uppercase text-muted-foreground">
                  {"អាល់ប៊ុមរូបភាពកម្មវិធី"}
                </Label>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 p-3 bg-accent/40 rounded-md border border-border">
                  {currentGalleryUrls.map((url, idx) => (
                    <div
                      key={`cur-${idx}`}
                      className="relative aspect-square rounded-md overflow-hidden border border-border group"
                    >
                      <img src={url} className="w-full h-full object-cover" />
                      <button
                        onClick={() => removeCurrentGallery(idx)}
                        className="absolute top-1 right-1 bg-background/60 text-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 hover:bg-primary hover:text-white transition-all"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  {newGalleryPreviews.map((pre, idx) => (
                    <div
                      key={`new-${idx}`}
                      className="relative aspect-square rounded-md overflow-hidden border border-rose-500/30 group"
                    >
                      <img src={pre} className="w-full h-full object-cover" />
                      <button
                        onClick={() => removeNewGallery(idx)}
                        className="absolute top-1 right-1 bg-background/60 text-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 hover:bg-primary hover:text-white transition-all"
                      >
                        <X className="h-3 w-3" />
                      </button>
                      <div className="absolute bottom-1 right-1 bg-primary text-[6px] text-white px-1 rounded uppercase font-bold">
                        New
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={() => galleryInputRef.current?.click()}
                    className="aspect-square rounded-md border-2 border-dashed border-border flex items-center justify-center text-muted-foreground/30 hover:bg-accent hover:border-primary/40 hover:text-primary transition-all"
                  >
                    <Plus className="h-4 w-4" />
                    <input
                      type="file"
                      multiple
                      ref={galleryInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={handleGalleryChange}
                    />
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-8 flex gap-3">
              <Button
                variant="ghost"
                className="h-10 rounded-md font-semibold flex-1 text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
                onClick={() => setOpen(false)}
              >
                {"បោះបង់"}
              </Button>
              <Button
                className="h-10 rounded-md font-bold flex-1 bg-primary hover:bg-primary/90 text-primary-foreground shadow-md transition-colors"
                onClick={handleSave}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "រក្សាទុកការផ្លាស់ប្តូរ"
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
