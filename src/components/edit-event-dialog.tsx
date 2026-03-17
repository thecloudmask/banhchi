"use client";

import { useState, useRef, useEffect } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerTrigger,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  CalendarIcon,
  Clock,
  MapPin,
  Navigation,
  Pencil,
  Plus,
  Upload,
  X,
  Loader2,
  Heart,
  Sparkles,
  Palette,
  Image as ImageIcon,
  CheckCircle2,
  Trash2,
  LayoutGrid,
  Map as MapIcon,
  MessageSquare,
  Users,
} from "lucide-react";
import { Event } from "@/types";
import { EVENT_TEMPLATES } from "@/lib/constants";
import { toast } from "sonner";
import { updateEvent } from "@/services/event.service";
import RichTextEditor from "./rich-text-editor";
import {
  cn,
  formatDateTime,
  toKhmerDigits,
  formatKhmerTimeStr,
} from "@/lib/utils";
import { format } from "date-fns";
import { Timestamp } from "firebase/firestore";

const toDate = (ts: any): Date => {
  if (ts instanceof Date) return ts;
  if (ts?.toDate) return ts.toDate();
  if (ts && typeof ts === "object" && "seconds" in ts)
    return new Timestamp(ts.seconds, ts.nanoseconds).toDate();
  return new Date(ts);
};

interface EditEventDialogProps {
  event: Event;
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export function EditEventDialog({
  event,
  trigger,
  onSuccess,
}: EditEventDialogProps) {
  // No internationalization needed
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Basic State
  const [title, setTitle] = useState(event.title);
  const [category, setCategory] = useState(event.category || "wedding");
  const [customCategory, setCustomCategory] = useState(
    event.category === "custom" ? event.category || "" : "",
  );
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    event.eventDate ? toDate(event.eventDate) : undefined,
  );
  const [time, setTime] = useState(event.eventTime || "");
  const [location, setLocation] = useState(event.location || "");
  const [mapUrl, setMapUrl] = useState(event.mapUrl || "");
  const [description, setDescription] = useState(event.description || "");

  // Wedding/Ceremony Specific State
  const [activeTab, setActiveTab] = useState("general");
  const [groomName, setGroomName] = useState(event.extraData?.groomName || "");
  const [groomFatherTitle, setGroomFatherTitle] = useState(
    event.extraData?.groomFatherTitle || "",
  );
  const [groomFatherName, setGroomFatherName] = useState(
    event.extraData?.groomFatherName || "",
  );
  const [groomMotherTitle, setGroomMotherTitle] = useState(
    event.extraData?.groomMotherTitle || "",
  );
  const [groomMotherName, setGroomMotherName] = useState(
    event.extraData?.groomMotherName || "",
  );

  const [brideName, setBrideName] = useState(event.extraData?.brideName || "");
  const [brideFatherTitle, setBrideFatherTitle] = useState(
    event.extraData?.brideFatherTitle || "",
  );
  const [brideFatherName, setBrideFatherName] = useState(
    event.extraData?.brideFatherName || "",
  );
  const [brideMotherTitle, setBrideMotherTitle] = useState(
    event.extraData?.brideMotherTitle || "",
  );
  const [brideMotherName, setBrideMotherName] = useState(
    event.extraData?.brideMotherName || "",
  );

  const [donorName, setDonorName] = useState(event.extraData?.donorName || "");
  const [preventDuplicateGuests, setPreventDuplicateGuests] = useState(
    event.extraData?.preventDuplicateGuests || false,
  );
  const [footerContent, setFooterContent] = useState(
    event.extraData?.footerContent || "",
  );
  const [weddingSchedule, setWeddingSchedule] = useState<any[]>(
    event.extraData?.schedule || [
      {
        id: "day_1",
        dayLabel: "",
        groups: [
          {
            id: "group_1",
            groupTitle: "",
            activities: [{ time: "", title: "", description: "" }],
          },
        ],
      },
    ],
  );

  // Refined Location State
  const [locObj, setLocObj] = useState({
    name: event.extraData?.location?.name || event.location || "",
    address: event.extraData?.location?.address || "",
    mapUrl: event.extraData?.location?.mapUrl || event.mapUrl || "",
  });

  // Assets State
  const [banner, setBanner] = useState<File | null>(null);
  const [currentBannerUrl, setCurrentBannerUrl] = useState(
    event.bannerUrl || "",
  );
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [currentGalleryUrls, setCurrentGalleryUrls] = useState<string[]>(
    event.galleryUrls || [],
  );
  const [newGalleryPreviews, setNewGalleryPreviews] = useState<string[]>([]);
  const [khqrUSD, setKhqrUSD] = useState<File | null>(null);
  const [khqrKHR, setKhqrKHR] = useState<File | null>(null);
  const [currentKhqrUSDUrl, setCurrentKhqrUSDUrl] = useState(
    event.extraData?.khqrUSDUrl || "",
  );
  const [currentKhqrKHRUrl, setCurrentKhqrKHRUrl] = useState(
    event.extraData?.khqrKHRUrl || "",
  );

  const galleryInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTitle(event.title);
      setCategory(event.category || "wedding");
      setCustomCategory(
        event.category === "custom" ? event.category || "" : "",
      );
      setSelectedDate(event.eventDate ? toDate(event.eventDate) : undefined);
      setTime(event.eventTime || "");
      setLocation(event.location || "");
      setMapUrl(event.mapUrl || "");
      setDescription(event.description || "");

      setGroomName(event.extraData?.groomName || "");
      setGroomFatherTitle(event.extraData?.groomFatherTitle || "");
      setGroomFatherName(event.extraData?.groomFatherName || "");
      setGroomMotherTitle(event.extraData?.groomMotherTitle || "");
      setGroomMotherName(event.extraData?.groomMotherName || "");

      setBrideName(event.extraData?.brideName || "");
      setBrideFatherTitle(event.extraData?.brideFatherTitle || "");
      setBrideFatherName(event.extraData?.brideFatherName || "");
      setBrideMotherTitle(event.extraData?.brideMotherTitle || "");
      setBrideMotherName(event.extraData?.brideMotherName || "");

      setDonorName(event.extraData?.donorName || "");
      setPreventDuplicateGuests(
        event.extraData?.preventDuplicateGuests || false,
      );
      setFooterContent(event.extraData?.footerContent || "");
      setWeddingSchedule(
        event.extraData?.schedule || [
          {
            id: "day_1",
            dayLabel: "",
            groups: [
              {
                id: "group_1",
                groupTitle: "",
                activities: [{ time: "", title: "", description: "" }],
              },
            ],
          },
        ],
      );
      setLocObj({
        name: event.extraData?.location?.name || event.location || "",
        address: event.extraData?.location?.address || "",
        mapUrl: event.extraData?.location?.mapUrl || event.mapUrl || "",
      });
      setCurrentKhqrUSDUrl(event.extraData?.khqrUSDUrl || "");
      setCurrentKhqrKHRUrl(event.extraData?.khqrKHRUrl || "");

      setCurrentBannerUrl(event.bannerUrl || "");
      setCurrentGalleryUrls(event.galleryUrls || []);
      setNewGalleryPreviews([]);
      setGalleryFiles([]);
    }
  }, [open, event]);

  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setGalleryFiles([...galleryFiles, ...files]);
      const previews = files.map((file) => URL.createObjectURL(file));
      setNewGalleryPreviews([...newGalleryPreviews, ...previews]);
    }
  };

  const removeCurrentGallery = (index: number) => {
    setCurrentGalleryUrls(currentGalleryUrls.filter((_, i) => i !== index));
  };

  const removeNewGallery = (index: number) => {
    setGalleryFiles(galleryFiles.filter((_, i) => i !== index));
    setNewGalleryPreviews(newGalleryPreviews.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const extraData = event.extraData || {};
      await updateEvent(
        event.id,
        {
          title:
            category === "wedding"
              ? `${groomName} & ${brideName}`
              : category === "buddhist"
                ? title.trim() || donorName
                : title.trim(),
          category: category === "custom" ? customCategory : category,
          eventDate: selectedDate,
          eventTime: time || undefined,
          location: locObj.name || undefined,
          mapUrl: locObj.mapUrl || undefined,
          description: description || undefined,
          extraData: {
            ...extraData,
            groomName: category === "wedding" ? groomName || null : null,
            groomFatherTitle:
              category === "wedding" ? groomFatherTitle || null : null,
            groomFatherName:
              category === "wedding" ? groomFatherName || null : null,
            groomMotherTitle:
              category === "wedding" ? groomMotherTitle || null : null,
            groomMotherName:
              category === "wedding" ? groomMotherName || null : null,
            brideName: category === "wedding" ? brideName || null : null,
            brideFatherTitle:
              category === "wedding" ? brideFatherTitle || null : null,
            brideFatherName:
              category === "wedding" ? brideFatherName || null : null,
            brideMotherTitle:
              category === "wedding" ? brideMotherTitle || null : null,
            brideMotherName:
              category === "wedding" ? brideMotherName || null : null,
            donorName: category === "buddhist" ? donorName || null : null,
            preventDuplicateGuests,
            footerContent:
              category === "wedding" ? footerContent || null : null,
            location: category === "wedding" ? locObj : null,
            schedule:
              category === "wedding"
                ? weddingSchedule
                    .map((day) => ({
                      ...day,
                      groups: day.groups
                        .map((g: any) => ({
                          ...g,
                          activities: g.activities.filter(
                            (a: any) =>
                              a.time.trim() ||
                              a.title.trim() ||
                              a.description.trim(),
                          ),
                        }))
                        .filter(
                          (g: any) =>
                            g.activities.length > 0 ||
                            (g.groupTitle && g.groupTitle.trim()),
                        ),
                    }))
                    .filter(
                      (day) =>
                        (day.dayLabel && day.dayLabel.trim()) ||
                        day.groups.length > 0,
                    )
                : null,
            khqrUSDUrl: currentKhqrUSDUrl || null,
            khqrKHRUrl: currentKhqrKHRUrl || null,
          },
          galleryUrls: currentGalleryUrls,
        },
        banner || undefined,
        undefined,
        galleryFiles,
        khqrUSD || undefined,
        khqrKHR || undefined,
      );

      toast.success("បានកែប្រែដោយជោគជ័យ");
      if (onSuccess) onSuccess();
      setOpen(false);
    } catch (error) {
      console.error(error);
      toast.error("បរាជ័យក្នុងការរក្សាទុក");
    } finally {
      setLoading(false);
    }
  };

  const renderFormContent = () => (
    <div className="flex flex-col h-full w-full bg-background text-foreground font-kantumruy">
      {/* HEADER */}
      <div className="h-16 bg-card border-b border-border flex items-center px-4 relative shrink-0">
        <DrawerClose asChild>
          <button className="h-8 cursor-pointer w-8 flex items-center justify-center hover:bg-accent rounded-md transition-colors order-first">
            <X className="h-4 w-4" />
          </button>
        </DrawerClose>
        <div className="absolute left-1/2 -translate-x-1/2 text-center">
          <DrawerTitle className="text-sm sm:text-lg text-foreground font-bold">
            {"កែប្រែព័ត៌មានកម្មវិធី"}
          </DrawerTitle>
          <DrawerDescription className="sr-only">
            កែប្រែព័ត៌មានលម្អិតនៃកម្មវិធីរបស់អ្នក
          </DrawerDescription>
          <p className="text-[10px] text-muted-foreground uppercase font-black truncate max-w-xs">
            {title}
          </p>
        </div>
      </div>

      {/* TABS SELECTOR */}
      <div className="px-4 shrink-0 flex gap-2 border-b border-border overflow-x-auto no-scrollbar bg-card/30">
        <button
          onClick={() => setActiveTab("general")}
          className={cn(
            "px-4 py-3 text-[10px] font-black uppercase border-b-2 transition-all whitespace-nowrap flex items-center gap-2",
            activeTab === "general"
              ? "border-[#f41f4d] text-[#f41f4d]"
              : "border-transparent text-muted-foreground hover:text-foreground",
          )}
        >
          <LayoutGrid className="h-3 w-3" /> {"ទូទៅ"}
        </button>
        {category === "wedding" && (
          <>
            <button
              onClick={() => setActiveTab("couple")}
              className={cn(
                "px-4 py-3 text-[10px] font-black uppercase border-b-2 transition-all whitespace-nowrap flex items-center gap-2",
                activeTab === "couple"
                  ? "border-[#f41f4d] text-[#f41f4d]"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              <Users className="h-3 w-3" /> {"គូស្រករ"}
            </button>
            <button
              onClick={() => setActiveTab("schedule")}
              className={cn(
                "px-4 py-3 text-[10px] font-black uppercase border-b-2 transition-all whitespace-nowrap flex items-center gap-2",
                activeTab === "schedule"
                  ? "border-[#f41f4d] text-[#f41f4d]"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              <Clock className="h-3 w-3" /> {"កម្មវិធីសិរីមង្គល"}
            </button>
            <button
              onClick={() => setActiveTab("location")}
              className={cn(
                "px-4 py-3 text-[10px] font-black uppercase border-b-2 transition-all whitespace-nowrap flex items-center gap-2",
                activeTab === "location"
                  ? "border-[#f41f4d] text-[#f41f4d]"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              <MapIcon className="h-3 w-3" /> {"ទីតាំង & Footer"}
            </button>
          </>
        )}
        <button
          onClick={() => setActiveTab("assets")}
          className={cn(
            "px-4 py-3 text-[10px] font-black uppercase border-b-2 transition-all whitespace-nowrap flex items-center gap-2",
            activeTab === "assets"
              ? "border-[#f41f4d] text-[#f41f4d]"
              : "border-transparent text-muted-foreground hover:text-foreground",
          )}
        >
          <ImageIcon className="h-3 w-3" /> {"រូបភាព"}
        </button>
      </div>

      {/* BODY - Scrollable area */}
      <div className="flex-1 overflow-y-auto pb-32">
        <div className="max-w-4xl mx-auto space-y-6 pt-6 px-4">
          {activeTab === "general" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="bg-card/40 border border-border rounded-md p-5 space-y-5 shadow-sm">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-muted-foreground pl-1">
                    {"ប្រភេទកម្មវិធី"}
                  </Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="h-12 cursor-pointer bg-muted/20 border-border rounded-md font-bold">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="font-kantumruy">
                      <SelectItem value="wedding">{"អាពាហ៍ពិពាហ៍"}</SelectItem>
                      <SelectItem value="buddhist">
                        {"កម្មវិធីបុណ្យ"}
                      </SelectItem>
                      <SelectItem value="custom">{"ផ្សេងៗ"}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {category === "custom" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-in slide-in-from-top-2">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase text-muted-foreground pl-1">
                        {"ប្រភេទកម្មវិធី"}
                      </Label>
                      <Input
                        value={customCategory}
                        onChange={(e) => setCustomCategory(e.target.value)}
                        className="h-12 bg-muted/20 font-bold"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase text-muted-foreground pl-1">
                        {"ឈ្មោះកម្មវិធី"}
                      </Label>
                      <Input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="h-12 bg-muted/20 font-bold"
                      />
                    </div>
                  </div>
                )}

                {category === "buddhist" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-in slide-in-from-top-2">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase text-muted-foreground pl-1">
                        {"ឈ្មោះម្ចាស់បុណ្យ"}
                      </Label>
                      <Input
                        placeholder={"ឧ. ឧបាសក ឡុង ប៊ុនធឿន"}
                        value={donorName}
                        onChange={(e) => setDonorName(e.target.value)}
                        className="h-12 bg-muted/20 font-bold"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase text-muted-foreground pl-1">
                        {"ឈ្មោះកម្មវិធី"}
                      </Label>
                      <Input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="h-12 bg-muted/20 font-bold"
                      />
                    </div>
                  </div>
                )}

                <div className="h-px bg-border/50 my-2" />

                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-muted-foreground pl-1 flex items-center gap-2">
                    <CalendarIcon className="h-3 w-3" />{" "}
                    {"កាលបរិច្ឆេទ & ពេលវេលា"}
                  </Label>
                  <div className="grid grid-cols-1 gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="h-12 justify-start cursor-pointer text-left font-bold bg-muted/20 border-border rounded-md w-full px-4"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
                          {selectedDate
                            ? formatDateTime(selectedDate)
                            : "ជ្រើសរើសថ្ងៃ និង ម៉ោង"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-auto p-0 bg-card border-border"
                        align="start"
                      >
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={(date) => {
                            if (!date) return;

                            const newDate = new Date(date);
                            // If a time was already set and is valid, preserve it when changing the day
                            if (
                              selectedDate &&
                              !isNaN(selectedDate.getTime())
                            ) {
                              newDate.setHours(selectedDate.getHours());
                              newDate.setMinutes(selectedDate.getMinutes());
                            } else {
                              // Default to current time if no date was previously selected or if it was invalid
                              const now = new Date();
                              newDate.setHours(now.getHours());
                              newDate.setMinutes(now.getMinutes());
                            }
                            setSelectedDate(newDate);
                          }}
                          className="font-kantumruy bg-card text-foreground rounded-t-md"
                        />

                        <div className="p-4 border-t border-border space-y-3 bg-accent/5">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 opacity-50" />
                            <span className="text-xs font-bold uppercase">
                              កំណត់ម៉ោង
                            </span>
                          </div>
                          <div className="flex items-center justify-center gap-2">
                            <select
                              className="bg-background border border-border rounded-md px-3 py-2 text-sm font-bold outline-none focus:ring-2 focus:ring-[#f41f4d]/20 appearance-none min-w-17.5 text-center cursor-pointer"
                              value={
                                selectedDate && !isNaN(selectedDate.getTime())
                                  ? format(selectedDate, "HH")
                                  : "00"
                              }
                              onChange={(e) => {
                                const h = e.target.value;
                                const n = new Date(
                                  selectedDate && !isNaN(selectedDate.getTime())
                                    ? selectedDate
                                    : new Date(),
                                );
                                n.setHours(parseInt(h, 10));
                                if (isNaN(n.getMinutes())) n.setMinutes(0);
                                n.setSeconds(0);
                                setSelectedDate(n);
                              }}
                            >
                              {Array.from({ length: 24 }, (_, i) =>
                                i.toString().padStart(2, "0"),
                              ).map((h) => (
                                <option key={h} value={h}>
                                  {toKhmerDigits(h)}
                                </option>
                              ))}
                            </select>
                            <span className="font-bold">:</span>
                            <select
                              className="bg-background border border-border rounded-md px-3 py-2 text-sm font-bold outline-none focus:ring-2 focus:ring-[#f41f4d]/20 appearance-none min-w-17.5 text-center cursor-pointer"
                              value={
                                selectedDate && !isNaN(selectedDate.getTime())
                                  ? format(selectedDate, "mm")
                                  : "00"
                              }
                              onChange={(e) => {
                                const m = e.target.value;
                                const n = new Date(
                                  selectedDate && !isNaN(selectedDate.getTime())
                                    ? selectedDate
                                    : new Date(),
                                );
                                n.setMinutes(parseInt(m, 10));
                                if (isNaN(n.getHours())) n.setHours(0);
                                n.setSeconds(0);
                                setSelectedDate(n);
                              }}
                            >
                              {Array.from({ length: 60 }, (_, i) =>
                                i.toString().padStart(2, "0"),
                              ).map((m) => (
                                <option key={m} value={m}>
                                  {toKhmerDigits(m)}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                    {selectedDate && (
                      <p className="text-[10px] text-primary font-bold px-1">
                        {formatDateTime(selectedDate)}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase text-muted-foreground pl-1">
                    {"ព័ត៌មានបន្ថែម (Rich Text)"}
                  </Label>
                  <div className="rounded-md border border-border bg-muted/5 p-1">
                    <RichTextEditor
                      value={description}
                      onChange={setDescription}
                      className="min-h-48"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "couple" && category === "wedding" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="bg-card/40 border border-border rounded-md p-6 space-y-6 shadow-sm">
                <div className="grid grid-cols-1 gap-6">
                  {/* GROOM */}
                  <div className="space-y-4 p-4 rounded-xl border border-border bg-muted/5">
                    <h3 className="text-xs font-black uppercase text-[#C5A866] flex items-center gap-2">
                      <Heart className="h-4 w-4 fill-[#C5A866]/20" />{" "}
                      ព័ត៌មានកូនកំលោះ និង មាតាបិតា
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3 col-span-1 md:col-span-2">
                        <Label className="text-[10px] font-black uppercase flex items-center gap-2 text-[#f41f4d]">
                          ឈ្មោះកូនកំលោះ
                        </Label>
                        <Input
                          value={groomName}
                          onChange={(e) => setGroomName(e.target.value)}
                          className="h-12 text-sm font-black bg-background border-border focus:border-[#f41f4d]/50 transition-all shadow-inner"
                          placeholder="ឈ្មោះកូនកំលោះ"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-semibold uppercase text-muted-foreground mr-1">
                          ងារឪពុក
                        </Label>
                        <Input
                          className="h-10 text-sm font-semibold border-border bg-background shadow-inner"
                          placeholder="ឧ. លោក / ឯកឧត្តម"
                          value={groomFatherTitle}
                          onChange={(e) => setGroomFatherTitle(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-semibold uppercase text-muted-foreground mr-1">
                          ឈ្មោះឪពុក
                        </Label>
                        <Input
                          className="h-10 text-sm font-semibold border-border bg-background shadow-inner"
                          placeholder="ឧ. ឈន ស៊ីដេត"
                          value={groomFatherName}
                          onChange={(e) => setGroomFatherName(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-semibold uppercase text-muted-foreground mr-1">
                          ងារម្ដាយ
                        </Label>
                        <Input
                          className="h-10 text-sm font-semibold border-border bg-background shadow-inner"
                          placeholder="ឧ. លោកស្រី / លោកជំទាវ"
                          value={groomMotherTitle}
                          onChange={(e) => setGroomMotherTitle(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-semibold uppercase text-muted-foreground mr-1">
                          ឈ្មោះម្ដាយ
                        </Label>
                        <Input
                          className="h-10 text-sm font-semibold border-border bg-background shadow-inner"
                          placeholder="ឧ. ម៉ម សុផាត"
                          value={groomMotherName}
                          onChange={(e) => setGroomMotherName(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* BRIDE */}
                  <div className="space-y-4 p-4 rounded-xl border border-border bg-muted/5">
                    <h3 className="text-xs font-black uppercase text-[#C5A866] flex items-center gap-2">
                      <Heart className="h-4 w-4 fill-[#C5A866]/20" />{" "}
                      ព័ត៌មានកូនក្រមុំ និង មាតាបិតា
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3 col-span-1 md:col-span-2">
                        <Label className="text-[10px] font-black uppercase flex items-center gap-2 text-[#f41f4d]">
                          ឈ្មោះកូនក្រមុំ
                        </Label>
                        <Input
                          value={brideName}
                          onChange={(e) => setBrideName(e.target.value)}
                          className="h-12 text-sm font-black bg-background border-border focus:border-[#f41f4d]/50 transition-all shadow-inner"
                          placeholder="ឈ្មោះកូនក្រមុំ"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-semibold uppercase text-muted-foreground mr-1">
                          ងារឪពុក
                        </Label>
                        <Input
                          className="h-10 text-sm font-semibold border-border bg-background shadow-inner"
                          placeholder="ឧ. លោក / ឯកឧត្តម"
                          value={brideFatherTitle}
                          onChange={(e) => setBrideFatherTitle(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-semibold uppercase text-muted-foreground mr-1">
                          ឈ្មោះឪពុក
                        </Label>
                        <Input
                          className="h-10 text-sm font-semibold border-border bg-background shadow-inner"
                          placeholder="ឧ. ស៊ីម ច័ន្ទសុធានេត្រ"
                          value={brideFatherName}
                          onChange={(e) => setBrideFatherName(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-semibold uppercase text-muted-foreground mr-1">
                          ងារម្ដាយ
                        </Label>
                        <Input
                          className="h-10 text-sm font-semibold border-border bg-background shadow-inner"
                          placeholder="ឧ. លោកស្រី / លោកជំទាវ"
                          value={brideMotherTitle}
                          onChange={(e) => setBrideMotherTitle(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-semibold uppercase text-muted-foreground mr-1">
                          ឈ្មោះម្ដាយ
                        </Label>
                        <Input
                          className="h-10 text-sm font-semibold border-border bg-background shadow-inner"
                          placeholder="ឧ. អ៊ុក សោភា"
                          value={brideMotherName}
                          onChange={(e) => setBrideMotherName(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="h-px bg-border/50" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black flex items-center gap-2 uppercase text-muted-foreground">
                      <ImageIcon className="h-3 w-3" /> KHQR USD
                      (សម្រាប់ទទួលចំណងដៃ)
                    </Label>
                    <div className="h-75 w-full rounded-xl border-2 border-dashed border-border bg-muted/5 relative overflow-hidden group hover:border-[#f41f4d]/30 transition-all flex flex-col items-center justify-center p-2">
                      <input
                        type="file"
                        accept="image/*"
                        className="absolute inset-0 opacity-0 z-10 cursor-pointer"
                        onChange={(e) =>
                          setKhqrUSD(e.target.files?.[0] || null)
                        }
                      />
                      {khqrUSD || currentKhqrUSDUrl ? (
                        <img
                          src={
                            khqrUSD
                              ? URL.createObjectURL(khqrUSD)
                              : currentKhqrUSDUrl
                          }
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="flex flex-col items-center gap-2 text-muted-foreground/30">
                          <Upload className="h-8 w-8" />
                          <span className="text-[10px] font-bold uppercase">
                            បញ្ចូលរូបភាព QR
                          </span>
                        </div>
                      )}
                      {(khqrUSD || currentKhqrUSDUrl) && (
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                          <Button
                            type="button"
                            variant="outline"
                            className="h-9 w-9 p-0 rounded-full border-white/50 bg-white/10 text-white backdrop-blur-md hover:bg-white/20"
                            onClick={(e) => {
                              e.stopPropagation();
                              setKhqrUSD(null);
                              setCurrentKhqrUSDUrl("");
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          <div className="bg-white/10 backdrop-blur-md p-2 rounded-full border border-white/50">
                            <Upload className="h-4 w-4 text-white" />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black flex items-center gap-2 uppercase text-muted-foreground">
                      <ImageIcon className="h-3 w-3" /> KHQR KHR
                      (សម្រាប់ទទួលចំណងដៃ)
                    </Label>
                    <div className="h-75 w-full rounded-xl border-2 border-dashed border-border bg-muted/5 relative overflow-hidden group hover:border-[#f41f4d]/30 transition-all flex flex-col items-center justify-center p-2">
                      <input
                        type="file"
                        accept="image/*"
                        className="absolute inset-0 opacity-0 z-10 cursor-pointer"
                        onChange={(e) =>
                          setKhqrKHR(e.target.files?.[0] || null)
                        }
                      />
                      {khqrKHR || currentKhqrKHRUrl ? (
                        <img
                          src={
                            khqrKHR
                              ? URL.createObjectURL(khqrKHR)
                              : currentKhqrKHRUrl
                          }
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="flex flex-col items-center gap-2 text-muted-foreground/30">
                          <Upload className="h-8 w-8" />
                          <span className="text-[10px] font-bold uppercase">
                            បញ្ចូលរូបភាព QR
                          </span>
                        </div>
                      )}
                      {(khqrKHR || currentKhqrKHRUrl) && (
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                          <Button
                            type="button"
                            variant="outline"
                            className="h-9 w-9 p-0 rounded-full border-white/50 bg-white/10 text-white backdrop-blur-md hover:bg-white/20"
                            onClick={(e) => {
                              e.stopPropagation();
                              setKhqrKHR(null);
                              setCurrentKhqrKHRUrl("");
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          <div className="bg-white/10 backdrop-blur-md p-2 rounded-full border border-white/50">
                            <Upload className="h-4 w-4 text-white" />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div
                  className="bg-rose-500/5 p-4 rounded-xl border border-rose-500/10 flex items-center gap-4 group cursor-pointer"
                  onClick={() =>
                    setPreventDuplicateGuests(!preventDuplicateGuests)
                  }
                >
                  <div
                    className={cn(
                      "w-10 h-6 rounded-full relative transition-all duration-300",
                      preventDuplicateGuests ? "bg-[#f41f4d]" : "bg-muted",
                    )}
                  >
                    <div
                      className={cn(
                        "absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 shadow-sm",
                        preventDuplicateGuests ? "left-5" : "left-1",
                      )}
                    />
                  </div>
                  <div className="flex-1">
                    <Label className="text-xs font-black text-rose-500 uppercase cursor-pointer">
                      {"មិនអនុញ្ញាតឱ្យមានភ្ញៀវឈ្មោះដូចគ្នា"}
                    </Label>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {"ប្រព័ន្ធនឹងត្រួតពិនិត្យជៀសវាងការចុះឈ្មោះស្ទួន"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "schedule" && category === "wedding" && (
            <div className="space-y-1 animate-in fade-in slide-in-from-bottom-2 duration-300 pb-20">
              <div className="flex items-center justify-between mb-4 bg-muted/20 p-2 rounded-md">
                <Label className="text-[10px] font-black uppercase text-muted-foreground ml-2">
                  {"គ្រប់គ្រងកាលវិភាគអាពាហ៍ពិពាហ៍"}
                </Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setWeddingSchedule([
                      ...weddingSchedule,
                      {
                        id: `day_${Date.now()}`,
                        dayLabel: "",
                        groups: [
                          {
                            id: `group_${Date.now()}`,
                            groupTitle: "",
                            activities: [],
                          },
                        ],
                      },
                    ])
                  }
                  className="h-9 px-4 text-[10px] font-black uppercase border-[#f41f4d]/20 text-[#f41f4d] hover:bg-[#f41f4d]/5"
                >
                  <Plus className="h-3.5 w-3.5 mr-2" /> {"បន្ថែមថ្ងៃថ្មី"}
                </Button>
              </div>

              {weddingSchedule.map((day, dIdx) => (
                <div
                  key={day.id}
                  className="bg-card/40 border border-border rounded-xl p-8 relative group mb-8 shadow-sm hover:border-[#f41f4d]/10 transition-all"
                >
                  <button
                    onClick={() =>
                      setWeddingSchedule(
                        weddingSchedule.filter((_, i) => i !== dIdx),
                      )
                    }
                    className="absolute top-6 right-6 text-muted-foreground/20 hover:text-rose-500 transition-colors p-2 hover:bg-rose-500/5 rounded-md"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>

                  <div className="space-y-8">
                    <div className="max-w-md space-y-3">
                      <Label className="text-[10px] font-black uppercase text-muted-foreground pl-1">
                        {"កាលបរិច្ឆេទ (ឧ. ថ្ងៃទី១ - ពេលព្រឹក)"}
                      </Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start h-12 bg-muted/20 border-border font-bold text-left px-4"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
                            {day.dayLabel || "ជ្រើសរើសថ្ងៃ"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            onSelect={(d) => {
                              if (!d) return;
                              const n = [...weddingSchedule];
                              n[dIdx].dayLabel = formatDateTime(d, false);
                              setWeddingSchedule(n);
                            }}
                            className="font-kantumruy"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="space-y-5 pt-4">
                      {(day.groups[0]?.activities || []).map(
                        (act: any, aIdx: number) => (
                          <div
                            key={aIdx}
                            className="flex gap-6 p-6 bg-muted/10 rounded-2xl group/act border border-border/50 hover:bg-muted/15 transition-all relative"
                          >
                            <div className="shrink-0 flex flex-col gap-2">
                              <Label className="text-[8px] font-black text-muted-foreground uppercase ml-1 text-center">
                                ម៉ោង
                              </Label>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant="outline"
                                    className="w-32 h-11 font-black text-center bg-background border-border text-[#f41f4d] rounded-md text-sm shadow-inner flex items-center justify-center gap-2"
                                  >
                                    <Clock className="h-3 w-3 opacity-50" />
                                    {formatKhmerTimeStr(act.time)}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent
                                  className="w-48 p-3"
                                  align="center"
                                >
                                  <div className="space-y-3">
                                    <Label className="text-[10px] font-black uppercase text-muted-foreground flex items-center gap-2">
                                      <Clock className="h-3 w-3" />{" "}
                                      កំណត់ម៉ោងសកម្មភាព
                                    </Label>
                                    <div className="flex items-center justify-center gap-2">
                                      <select
                                        className="bg-background border border-border rounded-md px-2 py-1.5 text-sm font-bold outline-none focus:ring-2 focus:ring-[#f41f4d]/20 appearance-none min-w-15 text-center cursor-pointer"
                                        value={
                                          act.time
                                            ? act.time.split(":")[0]
                                            : "00"
                                        }
                                        onChange={(e) => {
                                          const h = e.target.value;
                                          const m = act.time
                                            ? act.time.split(":")[1] || "00"
                                            : "00";
                                          const n = [...weddingSchedule];
                                          n[dIdx].groups[0].activities[
                                            aIdx
                                          ].time = `${h}:${m}`;
                                          setWeddingSchedule(n);
                                        }}
                                      >
                                        {Array.from({ length: 24 }, (_, i) =>
                                          i.toString().padStart(2, "0"),
                                        ).map((h) => (
                                          <option key={h} value={h}>
                                            {toKhmerDigits(h)}
                                          </option>
                                        ))}
                                      </select>
                                      <span className="font-bold">:</span>
                                      <select
                                        className="bg-background border border-border rounded-md px-2 py-1.5 text-sm font-bold outline-none focus:ring-2 focus:ring-[#f41f4d]/20 appearance-none min-w-15 text-center cursor-pointer"
                                        value={
                                          act.time
                                            ? act.time.split(":")[1] || "00"
                                            : "00"
                                        }
                                        onChange={(e) => {
                                          const h = act.time
                                            ? act.time.split(":")[0] || "00"
                                            : "00";
                                          const m = e.target.value;
                                          const n = [...weddingSchedule];
                                          n[dIdx].groups[0].activities[
                                            aIdx
                                          ].time = `${h}:${m}`;
                                          setWeddingSchedule(n);
                                        }}
                                      >
                                        {Array.from({ length: 60 }, (_, i) =>
                                          i.toString().padStart(2, "0"),
                                        ).map((m) => (
                                          <option key={m} value={m}>
                                            {toKhmerDigits(m)}
                                          </option>
                                        ))}
                                      </select>
                                    </div>
                                  </div>
                                </PopoverContent>
                              </Popover>
                            </div>
                            <div className="flex-1 space-y-4">
                              <div className="space-y-1.5 flex-1">
                                <Label className="text-[8px] font-black text-muted-foreground uppercase ml-1">
                                  ឈ្មោះកម្មវិធី
                                </Label>
                                <Input
                                  placeholder="ឧ. ពិធីដង្ហែជំនូន"
                                  value={act.title}
                                  onChange={(e) => {
                                    const n = [...weddingSchedule];
                                    n[dIdx].groups[0].activities[aIdx].title =
                                      e.target.value;
                                    setWeddingSchedule(n);
                                  }}
                                  className="h-11 font-bold bg-background border-border rounded-md px-4"
                                />
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                const n = [...weddingSchedule];
                                n[dIdx].groups[0].activities = n[
                                  dIdx
                                ].groups[0].activities.filter(
                                  (_: any, i: number) => i !== aIdx,
                                );
                                setWeddingSchedule(n);
                              }}
                              className="absolute top-4 right-4 text-muted-foreground/10 hover:text-rose-500 opacity-0 group-hover/act:opacity-100 transition-all"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ),
                      )}

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const n = [...weddingSchedule];
                          if (!n[dIdx].groups[0])
                            n[dIdx].groups[0] = {
                              id: `g_${Date.now()}`,
                              activities: [],
                            };
                          n[dIdx].groups[0].activities.push({
                            time: "",
                            title: "",
                            description: "",
                          });
                          setWeddingSchedule(n);
                        }}
                        className="w-full h-14 border-2 border-dashed border-border rounded-md hover:bg-muted/30 text-[10px] uppercase font-black text-muted-foreground transition-all flex items-center justify-center gap-3"
                      >
                        <Plus className="h-4 w-4" /> {"បន្ថែមសកម្មភាពកម្មវិធី"}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "location" && category === "wedding" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="bg-card/40 border border-border rounded-md p-8 space-y-8 shadow-sm">
                <div className="space-y-5">
                  <Label className="text-[10px] font-black uppercase text-muted-foreground flex items-center gap-2">
                    <MapIcon className="h-3.5 w-3.5" />{" "}
                    {"ព័ត៌មានទីតាំងកម្មវិធី"}
                  </Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2.5">
                      <Label className="text-[10px] font-bold text-muted-foreground">
                        {"ឈ្មោះទីតាំង"}
                      </Label>
                      <Input
                        value={locObj.name}
                        onChange={(e) =>
                          setLocObj({ ...locObj, name: e.target.value })
                        }
                        className="h-12 bg-muted/10 font-bold"
                        placeholder="ឧ. សណ្ឋាគារ ហៃយ៉ាត់ រីជិនស៊ី ភ្នំពេញ"
                      />
                    </div>
                    <div className="space-y-2.5">
                      <Label className="text-[10px] font-bold text-muted-foreground">
                        {"Google Map URL"}
                      </Label>
                      <Input
                        value={locObj.mapUrl}
                        onChange={(e) =>
                          setLocObj({ ...locObj, mapUrl: e.target.value })
                        }
                        className="h-12 bg-muted/10"
                        placeholder="https://maps.google.com/..."
                      />
                    </div>
                  </div>
                  <div className="space-y-2.5">
                    <Label className="text-[10px] font-bold text-muted-foreground">
                      {"អាសយដ្ឋានលម្អិត"}
                    </Label>
                    <Input
                      value={locObj.address}
                      onChange={(e) =>
                        setLocObj({ ...locObj, address: e.target.value })
                      }
                      className="h-12 bg-muted/10"
                      placeholder="បញ្ចូលអាសយដ្ឋានសម្រាប់បង្ហាញលើធៀប"
                    />
                  </div>
                </div>

                <div className="h-px bg-border/50" />

                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase text-muted-foreground flex items-center gap-2">
                    <MessageSquare className="h-3.5 w-3.5" />{" "}
                    {"ពាក្យអរគុណ (Footer Content)"}
                  </Label>
                  <Textarea
                    value={footerContent}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      setFooterContent(e.target.value)
                    }
                    placeholder="ឧ. វត្តមានដ៏ខ្ពង់ខ្ពស់របស់អស់លោក លោកស្រី អ្នកនាងកញ្ញា ជាកិត្តិយសដ៏ធំធេងសម្រាប់គ្រួសាររបស់យើងក្នុងឱកាសនេះ..."
                    className="min-h-40 text-sm leading-relaxed p-6 bg-muted/5 rounded-2xl"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === "assets" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="bg-card/40 border border-border rounded-md p-8 space-y-10 shadow-sm">
                <div className="space-y-4">
                  <Label className="text-[10px] font-black uppercase text-muted-foreground flex items-center justify-between pl-1">
                    {"រូបភាពបដា (Cover Image)"}
                    <span className="text-[8px] opacity-30">
                      DIMENSION 21:9 RECOMMENDED
                    </span>
                  </Label>
                  <div className="aspect-21/9 rounded-2xl border-2 border-dashed border-border flex flex-col items-center justify-center relative overflow-hidden group hover:border-[#f41f4d]/30 transition-all bg-muted/10 shadow-inner">
                    <input
                      type="file"
                      className="absolute inset-0 opacity-0 z-10 cursor-pointer"
                      onChange={(e) => setBanner(e.target.files?.[0] || null)}
                    />
                    {banner || currentBannerUrl ? (
                      <img
                        src={
                          banner
                            ? URL.createObjectURL(banner)
                            : currentBannerUrl
                        }
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-3 text-muted-foreground/30">
                        <Upload className="h-10 w-10" />
                        <span className="text-[10px] font-black uppercase">
                          UPLOAD COVER PHOTO
                        </span>
                      </div>
                    )}
                    {(banner || currentBannerUrl) && (
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 backdrop-blur-[2px]">
                        <Button
                          type="button"
                          variant="outline"
                          className="h-10 px-6 rounded-full border-white/50 bg-white/10 text-white backdrop-blur-md font-black text-[10px] uppercase hover:bg-white/20"
                        >
                          CHANGE PHOTO
                        </Button>
                        <Button
                          type="button"
                          variant="destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            setBanner(null);
                            setCurrentBannerUrl("");
                          }}
                          className="h-10 w-10 p-0 rounded-full shadow-xl"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-5 pt-4">
                  <Label className="text-[10px] font-black uppercase text-muted-foreground flex items-center justify-between pl-1">
                    {"វិចិត្រសាលរូបភាព (Gallery)"}
                    <span className="text-[8px] opacity-30">
                      {currentGalleryUrls.length + galleryFiles.length} PHOTOS
                    </span>
                  </Label>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
                    {currentGalleryUrls.map((url, i) => (
                      <div
                        key={i}
                        className="aspect-square rounded-xl border border-border relative group overflow-hidden shadow-sm"
                      >
                        <img
                          src={url}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all backdrop-blur-[1px] flex items-center justify-center">
                          <button
                            onClick={() => removeCurrentGallery(i)}
                            className="bg-rose-500 text-white p-2 rounded-lg transform scale-90 group-hover:scale-100 transition-transform"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                    {newGalleryPreviews.map((p, i) => (
                      <div
                        key={i}
                        className="aspect-square rounded-xl border-2 border-[#f41f4d]/20 relative group overflow-hidden shadow-sm"
                      >
                        <img
                          src={p}
                          className="w-full h-full object-cover animate-pulse-subtle"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all backdrop-blur-[1px] flex items-center justify-center">
                          <button
                            onClick={() => removeNewGallery(i)}
                            className="bg-rose-500 text-white p-2 rounded-lg transform scale-90 group-hover:scale-100 transition-transform"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="absolute top-1 left-1 bg-[#f41f4d] text-[6px] text-white px-1 py-0.5 rounded uppercase font-black">
                          NEW
                        </div>
                      </div>
                    ))}
                    <button
                      onClick={() => galleryInputRef.current?.click()}
                      className="aspect-square rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center hover:bg-[#f41f4d]/5 hover:border-[#f41f4d]/20 transition-all text-muted-foreground/30 group active:scale-95"
                    >
                      <Plus className="h-8 w-8 group-hover:scale-110 transition-transform" />
                      <input
                        type="file"
                        multiple
                        ref={galleryInputRef}
                        className="hidden"
                        onChange={handleGalleryChange}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* FOOTER - CTA */}
      <div className="h-24 bg-card border-t border-border flex items-center justify-center px-4 z-50 shrink-0">
        <form onSubmit={handleSubmit} className="w-full max-w-4xl">
          <Button
            type="submit"
            disabled={loading}
            className="cursor-pointer w-full h-14 rounded-xl font-black bg-[#f41f4d] text-white hover:bg-[#d91a45] transition-all flex items-center justify-center gap-3 text-sm shadow-xl shadow-[#f41f4d]/20 active:scale-[0.98]"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <CheckCircle2 className="h-5 w-5" />
            )}
            <span className="uppercase">
              {loading ? "កំពុងរក្សាទុក..." : "រក្សាទុកការផ្លាស់ប្តូរ"}
            </span>
          </Button>
        </form>
      </div>
    </div>
  );

  const triggerElement = trigger || (
    <Button
      variant="outline"
      size="sm"
      className="h-9 px-4 rounded-lg bg-card border-border hover:bg-muted font-bold flex items-center gap-2 transition-all"
    >
      <Pencil className="w-3.5 h-3.5 text-rose-500" />
      កែប្រែ
    </Button>
  );

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>{triggerElement}</DrawerTrigger>
      <DrawerContent className="fixed inset-0! top-0! bottom-0! left-0! right-0! mt-0! max-h-screen! h-screen! w-screen max-w-none rounded-none! border-none p-0 bg-background overflow-hidden [&>div:first-child]:hidden">
        {renderFormContent()}
      </DrawerContent>
    </Drawer>
  );
}
