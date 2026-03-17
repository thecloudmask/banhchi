"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
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
import { format } from "date-fns";
import {
  Loader2,
  Plus,
  CalendarIcon,
  Upload,
  MapPin,
  Clock,
  Navigation,
  X,
  Sparkles,
  Heart,
  Palette,
  Image as ImageIcon,
  CheckCircle2,
  ChevronDown,
  Trash2,
} from "lucide-react";
import { createEvent } from "@/services/event.service";
import { toast } from "sonner";
import { cn, formatDateTime, formatForDateTimeLocal, toKhmerDigits, formatKhmerTimeStr } from "@/lib/utils";
import { EVENT_TEMPLATES } from "@/lib/constants";
import RichTextEditor from "./rich-text-editor";
import dayjs from "dayjs";

export function CreateEventDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = { user: true }; // Placeholder or remove if not needed
  const router = useRouter();

  // Basic State
  const [title, setTitle] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [mapUrl, setMapUrl] = useState("");
  const [category, setCategory] = useState("wedding");
  const [customCategory, setCustomCategory] = useState("");
  const [description, setDescription] = useState("");

  // Wedding/Ceremony Specific State
  const [groomName, setGroomName] = useState("");
  const [groomFatherTitle, setGroomFatherTitle] = useState("");
  const [groomFatherName, setGroomFatherName] = useState("");
  const [groomMotherTitle, setGroomMotherTitle] = useState("");
  const [groomMotherName, setGroomMotherName] = useState("");
  
  const [brideName, setBrideName] = useState("");
  const [brideFatherTitle, setBrideFatherTitle] = useState("");
  const [brideFatherName, setBrideFatherName] = useState("");
  const [brideMotherTitle, setBrideMotherTitle] = useState("");
  const [brideMotherName, setBrideMotherName] = useState("");
  
  const [donorName, setDonorName] = useState("");
  const [preventDuplicateGuests, setPreventDuplicateGuests] = useState(false);
  const [weddingSchedule, setWeddingSchedule] = useState<any[]>([
    {
      id: `day_${Date.now()}`,
      dayLabel: "",
      groups: [
        {
          id: `group_${Date.now()}`,
          groupTitle: "",
          activities: [{ time: "", title: "", description: "" }],
        },
      ],
    },
  ]);

  // Assets State
  const [banner, setBanner] = useState<File | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const [khqrUSD, setKhqrUSD] = useState<File | null>(null);
  const [khqrKHR, setKhqrKHR] = useState<File | null>(null);
  const newDate = dayjs().format("YYYY-MM-DD");

  const galleryInputRef = useRef<HTMLInputElement>(null);

  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setGalleryFiles((prev) => [...prev, ...newFiles]);
      const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
      setGalleryPreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  const removeGalleryImage = (index: number) => {
    setGalleryFiles((prev) => prev.filter((_, i) => i !== index));
    setGalleryPreviews((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const resetForm = () => {
    setTitle("");
    setSelectedDate(undefined);
    setTime("");
    setLocation("");
    setMapUrl("");
    setBanner(null);
    setGalleryFiles([]);
    setGalleryPreviews([]);
    setCategory("wedding");
    setCustomCategory("");
    setDescription("");
    setGroomName("");
    setGroomFatherTitle("");
    setGroomFatherName("");
    setGroomMotherTitle("");
    setGroomMotherName("");
    setBrideName("");
    setBrideFatherTitle("");
    setBrideFatherName("");
    setBrideMotherTitle("");
    setBrideMotherName("");
    setDonorName("");
    setKhqrUSD(null);
    setKhqrKHR(null);
    setPreventDuplicateGuests(false);
    setWeddingSchedule([
      {
        id: `day_${Date.now()}`,
        dayLabel: "",
        groups: [
          {
            id: `group_${Date.now()}`,
            groupTitle: "",
            activities: [{ time: "", title: "", description: "" }],
          },
        ],
      },
    ]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (category === "wedding" && (!groomName || !brideName)) {
      toast.error("សូមបំពេញព័ត៌មានឱ្យគ្រប់");
      return;
    }
    if (!selectedDate) {
      toast.error("សូមជ្រើសរើសកាលបរិច្ឆេទ");
      return;
    }

    try {
      setLoading(true);
      const id = await createEvent(
        {
          title:
            category === "wedding"
              ? `${groomName} & ${brideName}`
              : category === "buddhist"
                ? (title.trim() || donorName)
                : title.trim(),
          category: category === "custom" ? customCategory : category,
          eventDate: selectedDate || new Date(),
          eventTime: time || undefined,
          location: location || undefined,
          mapUrl: mapUrl || undefined,
          description: description || undefined,
          extraData: {
            groomName: category === "wedding" ? groomName : undefined,
            groomFatherTitle: category === "wedding" ? groomFatherTitle : undefined,
            groomFatherName: category === "wedding" ? groomFatherName : undefined,
            groomMotherTitle: category === "wedding" ? groomMotherTitle : undefined,
            groomMotherName: category === "wedding" ? groomMotherName : undefined,
            brideName: category === "wedding" ? brideName : undefined,
            brideFatherTitle: category === "wedding" ? brideFatherTitle : undefined,
            brideFatherName: category === "wedding" ? brideFatherName : undefined,
            brideMotherTitle: category === "wedding" ? brideMotherTitle : undefined,
            brideMotherName: category === "wedding" ? brideMotherName : undefined,
            donorName: category === "buddhist" ? donorName : undefined,
            preventDuplicateGuests,
            schedule: category === "wedding" ? weddingSchedule.map(day => ({
              ...day,
              groups: day.groups.map((g: any) => ({
                ...g,
                activities: g.activities.filter((a: any) => a.time.trim() || a.title.trim())
              })).filter((g: any) => g.activities.length > 0)
            })).filter(day => day.dayLabel.trim() || day.groups.length > 0) : undefined,
          },
        },
        banner || undefined,
        galleryFiles,
        khqrUSD || undefined,
        khqrKHR || undefined,
      );

      toast.success("បានកត់ត្រាដោយជោគជ័យ");
      setOpen(false);
      resetForm();
      router.push(`/admin/events/${id}`);
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
          <button className="h-8 w-8 cursor-pointer flex items-center justify-center hover:bg-accent rounded-md transition-colors order-first">
            <X className="h-4 w-4 ​" />
          </button>
        </DrawerClose>
        <div className="absolute left-1/2 -translate-x-1/2">
          <DrawerTitle className="text-lg text-foreground font-bold">
            បង្កើតព្រឹត្តិការណ៍ថ្មី
          </DrawerTitle>
          <DrawerDescription className="sr-only">
            សូមបំពេញព័ត៌មានខាងក្រោមដើម្បីបង្កើតកម្មវិធីថ្មី
          </DrawerDescription>
        </div>
      </div>

      {/* BODY - Compact scrollable area */}
      <div className="flex-1 overflow-y-auto pt-6 pb-24">
        <div className="max-w-4xl mx-auto space-y-4 px-4">
          {/* CARD 1: PRIMARY FIELDS - Decreased Padding & spacing */}
          <div className="bg-card/40 border border-border rounded-md p-5 space-y-5 shadow-sm">
            <div className="space-y-2">
              <Label className="text-xs font-semibold flex items-center gap-2 uppercase">
                {"ប្រភេទកម្មវិធី"}
              </Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="h-10 w-full cursor-pointer bg-muted/30 border-border rounded-md font-medium px-4 focus:ring-primary/20 text-foreground text-sm">
                  <SelectValue placeholder="ជ្រើសរើសប្រភេទកម្មវិធី" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border text-foreground p-1 rounded-md">
                  <SelectItem
                    value="wedding"
                    className="text-xs py-2 hover:bg-accent rounded-md cursor-pointer focus:bg-accent focus:text-accent-foreground"
                  >
                    {"អាពាហ៍ពិពាហ៍"}
                  </SelectItem>
                  <SelectItem
                    value="buddhist"
                    className="text-xs py-2 hover:bg-accent rounded-md cursor-pointer focus:bg-accent focus:text-accent-foreground"
                  >
                    {"កម្មវិធីបុណ្យ"}
                  </SelectItem>
                  <SelectItem
                    value="custom"
                    className="text-xs py-2 hover:bg-accent rounded-md cursor-pointer focus:bg-accent focus:text-accent-foreground"
                  >
                    {"ផ្សេងៗ"}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {category === "custom" && (
              <div className="animate-in slide-in-from-top-1 duration-200 space-y-2">
                <Label className="text-xs font-semibold ​ uppercase">
                  {"ប្រភេទកម្មវិធី"}
                </Label>
                <Input
                  placeholder={"បញ្ចូលប្រភេទកម្មវិធី"}
                  className="h-10 bg-muted/30 border-border rounded-md text-foreground px-4 placeholder:​/30 text-sm"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                />
              </div>
            )}

            {category === "wedding" ? (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-4 col-span-1 md:col-span-2 p-4 border rounded-md bg-muted/20">
                    <h4 className="text-sm font-bold text-[#C5A866] flex items-center gap-2">
                       <Heart className="h-4 w-4 text-[#C5A866]" /> ព័ត៌មានកូនប្រុស និង មាតាបិតា
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2 col-span-1 md:col-span-2">
                        <Label className="text-xs font-semibold uppercase">ឈ្មោះកូនកំលោះ</Label>
                        <Input placeholder="ឈ្មោះកូនកំលោះ" className="h-10 text-sm" value={groomName} onChange={(e) => setGroomName(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-semibold uppercase text-muted-foreground">ងារឪពុក</Label>
                        <Input placeholder="ឧ. លោក / ឯកឧត្តម" className="h-10 text-sm" value={groomFatherTitle} onChange={(e) => setGroomFatherTitle(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-semibold uppercase text-muted-foreground">ឈ្មោះឪពុក</Label>
                        <Input placeholder="ឧ. ឈន ស៊ីដេត" className="h-10 text-sm" value={groomFatherName} onChange={(e) => setGroomFatherName(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-semibold uppercase text-muted-foreground">ងារម្ដាយ</Label>
                        <Input placeholder="ឧ. លោកស្រី / លោកជំទាវ" className="h-10 text-sm" value={groomMotherTitle} onChange={(e) => setGroomMotherTitle(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-semibold uppercase text-muted-foreground">ឈ្មោះម្ដាយ</Label>
                        <Input placeholder="ឧ. ម៉ម សុផាត" className="h-10 text-sm" value={groomMotherName} onChange={(e) => setGroomMotherName(e.target.value)} />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 col-span-1 md:col-span-2 p-4 border rounded-md bg-muted/20">
                    <h4 className="text-sm font-bold text-[#C5A866] flex items-center gap-2">
                       <Heart className="h-4 w-4 text-[#C5A866]" /> ព័ត៌មានកូនស្រី និង មាតាបិតា
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2 col-span-1 md:col-span-2">
                        <Label className="text-xs font-semibold uppercase">ឈ្មោះកូនក្រមុំ</Label>
                        <Input placeholder="ឈ្មោះកូនក្រមុំ" className="h-10 text-sm" value={brideName} onChange={(e) => setBrideName(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-semibold uppercase text-muted-foreground">ងារឪពុក</Label>
                        <Input placeholder="ឧ. លោក / ឯកឧត្តម" className="h-10 text-sm" value={brideFatherTitle} onChange={(e) => setBrideFatherTitle(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-semibold uppercase text-muted-foreground">ឈ្មោះឪពុក</Label>
                        <Input placeholder="ឧ. ស៊ីម ច័ន្ទសុធានេត្រ" className="h-10 text-sm" value={brideFatherName} onChange={(e) => setBrideFatherName(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-semibold uppercase text-muted-foreground">ងារម្ដាយ</Label>
                        <Input placeholder="ឧ. លោកស្រី / លោកជំទាវ" className="h-10 text-sm" value={brideMotherTitle} onChange={(e) => setBrideMotherTitle(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-semibold uppercase text-muted-foreground">ឈ្មោះម្ដាយ</Label>
                        <Input placeholder="ឧ. អ៊ុក សោភា" className="h-10 text-sm" value={brideMotherName} onChange={(e) => setBrideMotherName(e.target.value)} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : category === "buddhist" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-300">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold ​ uppercase">
                    {"ឈ្មោះម្ចាស់បុណ្យ"}
                  </Label>
                  <Input
                    placeholder={"ឧ. ឧបាសក ឡុង ប៊ុនធឿន"}
                    className="h-10 bg-muted/30 border-border rounded-md text-foreground px-4 placeholder:​/30 text-sm"
                    value={donorName}
                    onChange={(e) => setDonorName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold ​ uppercase">
                    {"ឈ្មោះកម្មវិធី"}
                  </Label>
                  <Input
                    placeholder={"ឈ្មោះកម្មវិធី"}
                    className="h-10 bg-muted/30 border-border rounded-md text-foreground px-4 placeholder:​/30 text-sm"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Label className="text-xs font-semibold ​ uppercase">
                  {"ឈ្មោះកម្មវិធី"}
                </Label>
                <Input
                  placeholder={"ឈ្មោះកម្មវិធី"}
                  className="h-10 bg-muted/30 border-border rounded-md text-foreground px-4 placeholder:​/30 text-sm"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs font-semibold flex items-center gap-2 uppercase">
                  <CalendarIcon className="h-3 w-3 opacity-50" />{" "}
                  {category === "wedding"
                    ? "ថ្ងៃចាប់ផ្ដើម និង ម៉ោង"
                    : "ថ្ងៃខែព្រឹត្តិការណ៍ និង ម៉ោង"}
                </Label>
                <div className="grid grid-cols-1 gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "h-10 justify-start cursor-pointer text-left font-normal bg-muted/30 border-border text-foreground hover:bg-accent hover:text-foreground rounded-md w-full px-4",
                          !selectedDate && "text-muted-foreground/50",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
                        {selectedDate
                          ? formatDateTime(selectedDate)
                          : "ជ្រើសរើសថ្ងៃ និង ម៉ោង"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-card border-border" align="start">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={(date) => {
                          if (!date) return;
                          const newDate = new Date(date);
                          if (selectedDate && !isNaN(selectedDate.getTime())) {
                            newDate.setHours(selectedDate.getHours());
                            newDate.setMinutes(selectedDate.getMinutes());
                          } else {
                            const now = new Date();
                            newDate.setHours(now.getHours());
                            newDate.setMinutes(now.getMinutes());
                          }
                          setSelectedDate(newDate);
                        }}
                        className="bg-card text-foreground rounded-t-md"
                      />
                      <div className="p-4 border-t border-border flex items-center justify-between gap-4 bg-accent/10">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 opacity-50" />
                          <span className="text-xs font-bold uppercase">កំណត់ម៉ោង</span>
                        </div>
                        <div className="flex items-center justify-center gap-2">
                          <select
                            className="bg-background border border-border rounded-md px-3 py-1.5 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 appearance-none min-w-17.5 text-center cursor-pointer"
                            value={selectedDate && !isNaN(selectedDate.getTime()) ? format(selectedDate, "HH") : "00"}
                            onChange={(e) => {
                              const h = e.target.value;
                              const n = new Date(selectedDate && !isNaN(selectedDate.getTime()) ? selectedDate : new Date());
                              n.setHours(parseInt(h, 10));
                              if (isNaN(n.getMinutes())) n.setMinutes(0);
                              n.setSeconds(0);
                              setSelectedDate(n);
                            }}
                          >
                            {Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, "0")).map(h => (
                              <option key={h} value={h}>{toKhmerDigits(h)}</option>
                            ))}
                          </select>
                          <span className="font-bold">:</span>
                          <select
                            className="bg-background border border-border rounded-md px-3 py-1.5 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 appearance-none min-w-17.5 text-center cursor-pointer"
                            value={selectedDate && !isNaN(selectedDate.getTime()) ? format(selectedDate, "mm") : "00"}
                            onChange={(e) => {
                              const m = e.target.value;
                              const n = new Date(selectedDate && !isNaN(selectedDate.getTime()) ? selectedDate : new Date());
                              n.setMinutes(parseInt(m, 10));
                              if (isNaN(n.getHours())) n.setHours(0);
                              n.setSeconds(0);
                              setSelectedDate(n);
                            }}
                          >
                            {Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, "0")).map(m => (
                              <option key={m} value={m}>{toKhmerDigits(m)}</option>
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
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold ​ flex items-center gap-2 uppercase">
                <MapPin className="h-3 w-3 ​/50" /> {"ទីតាំង"}
              </Label>
              <p className="text-[10px] ​/30 -mt-1">
                {"(ព័ត៌មានដែលបង្ហាញនៅលើសន្លឹក)"}
              </p>
              <Input
                placeholder={"ទីកន្លែងរៀបចំកម្មវិធី"}
                className="h-10 bg-muted/30 border-border rounded-md text-foreground px-4 placeholder:​/30 text-sm"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold ​ flex items-center gap-2 uppercase">
                <Navigation className="h-3 w-3 ​/50" /> Google Map
              </Label>
              <p className="text-[10px] ​/30 -mt-1">
                {"(ព័ត៌មានដែលបង្ហាញនៅលើសន្លឹក)"}
              </p>
              <Input
                placeholder={"បញ្ចូលតំណភ្ជាប់ពី Google Maps"}
                className="h-10 bg-muted/30 border-border rounded-md text-foreground px-4 placeholder:​/30 text-sm"
                value={mapUrl}
                onChange={(e) => setMapUrl(e.target.value)}
              />
            </div>
          </div>

          {/* CARD 2: SCHEDULE - Wedding Only */}
          {category === "wedding" && (
            <div className="bg-card/40 border border-border rounded-md p-5 space-y-6 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold flex items-center gap-2 uppercase">
                  <Clock className="h-3 w-3 text-primary" /> {"កម្មវិធីសិរីមង្គល"}
                </Label>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
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
                            activities: [{ time: "", title: "", description: "" }],
                          },
                        ],
                      },
                    ])
                  }
                  className="h-8 px-3 text-[10px] font-bold uppercase border-primary/20 text-primary hover:bg-primary/5"
                >
                  <Plus className="h-3 w-3 mr-1" /> {"បន្ថែមថ្ងៃថ្មី"}
                </Button>
              </div>

              <div className="space-y-6">
                {weddingSchedule.map((day, dIdx) => (
                  <div
                    key={day.id}
                    className="p-4 rounded-md border border-border bg-muted/10 relative group"
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setWeddingSchedule(weddingSchedule.filter((_, i) => i !== dIdx))
                      }
                      className="absolute top-2 right-2 text-muted-foreground/30 hover:text-destructive transition-colors p-1"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>

                    <div className="space-y-4">
                      <div className="max-w-xs space-y-2">
                        <Label className="text-[10px] font-semibold uppercase text-muted-foreground">
                          {"កាលបរិច្ឆេទ (ឧ. ថ្ងៃទី១ - ពេលព្រឹក)"}
                        </Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button 
                              variant="outline" 
                              className="w-full justify-start h-9 bg-background border-border font-medium text-left px-3 text-xs"
                            >
                              <CalendarIcon className="mr-2 h-3 w-3 opacity-50" />
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

                      <div className="space-y-3">
                        {day.groups[0].activities.map((act: any, aIdx: number) => (
                          <div key={aIdx} className="flex gap-3 items-start relative group/act">
                            <div className="space-y-1">
                              <Label className="text-[8px] font-bold text-muted-foreground uppercase ml-1">ម៉ោង</Label>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button 
                                    variant="outline"
                                    className="w-24 h-8 bg-background border-border text-[#f41f4d] font-bold text-center text-xs flex items-center justify-center gap-1.5 p-0"
                                  >
                                    <Clock className="h-2.5 w-2.5 opacity-50" />
                                    {formatKhmerTimeStr(act.time)}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-48 p-3" align="center">
                                  <div className="space-y-3">
                                    <Label className="text-[10px] font-black uppercase text-muted-foreground flex items-center gap-2">
                                      <Clock className="h-3 w-3" /> កំណត់ម៉ោង
                                    </Label>
                                    <div className="flex items-center justify-center gap-2">
                                      <select
                                        className="bg-background border border-border rounded-md px-2 py-1 text-sm font-bold outline-none focus:ring-2 focus:ring-[#f41f4d]/20 appearance-none min-w-15 text-center cursor-pointer"
                                        value={act.time ? act.time.split(":")[0] : "00"}
                                        onChange={(e) => {
                                          const h = e.target.value;
                                          const m = act.time ? act.time.split(":")[1] || "00" : "00";
                                          const n = [...weddingSchedule];
                                          n[dIdx].groups[0].activities[aIdx].time = `${h}:${m}`;
                                          setWeddingSchedule(n);
                                        }}
                                      >
                                        {Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, "0")).map(h => (
                                          <option key={h} value={h}>{toKhmerDigits(h)}</option>
                                        ))}
                                      </select>
                                      <span className="font-bold">:</span>
                                      <select
                                        className="bg-background border border-border rounded-md px-2 py-1 text-sm font-bold outline-none focus:ring-2 focus:ring-[#f41f4d]/20 appearance-none min-w-15 text-center cursor-pointer"
                                        value={act.time ? act.time.split(":")[1] || "00" : "00"}
                                        onChange={(e) => {
                                          const h = act.time ? act.time.split(":")[0] || "00" : "00";
                                          const m = e.target.value;
                                          const n = [...weddingSchedule];
                                          n[dIdx].groups[0].activities[aIdx].time = `${h}:${m}`;
                                          setWeddingSchedule(n);
                                        }}
                                      >
                                        {Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, "0")).map(m => (
                                          <option key={m} value={m}>{toKhmerDigits(m)}</option>
                                        ))}
                                      </select>
                                    </div>
                                  </div>
                                </PopoverContent>
                              </Popover>
                            </div>
                            <div className="flex-1 space-y-1">
                              <Label className="text-[8px] font-bold text-muted-foreground uppercase ml-1">ឈ្មោះកម្មវិធី</Label>
                              <Input
                                placeholder="ឧ. ពិធីដង្ហែជំនូន"
                                value={act.title}
                                onChange={(e) => {
                                  const n = [...weddingSchedule];
                                  n[dIdx].groups[0].activities[aIdx].title = e.target.value;
                                  setWeddingSchedule(n);
                                }}
                                className="h-8 bg-background border-border rounded-md px-3 text-xs"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                const n = [...weddingSchedule];
                                n[dIdx].groups[0].activities = n[dIdx].groups[0].activities.filter((_: any, i: number) => i !== aIdx);
                                setWeddingSchedule(n);
                              }}
                              className="mt-6 text-muted-foreground/20 hover:text-destructive opacity-0 group-hover/act:opacity-100 transition-all"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}

                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const n = [...weddingSchedule];
                            n[dIdx].groups[0].activities.push({ time: "", title: "", description: "" });
                            setWeddingSchedule(n);
                          }}
                          className="w-full h-8 border border-dashed border-border rounded-md hover:bg-muted/30 text-[9px] uppercase font-bold text-muted-foreground transition-all flex items-center justify-center gap-2"
                        >
                          <Plus className="h-3 w-3" /> {"បន្ថែមសកម្មភាព"}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CARD 3: SETTINGS - Decreased Padding */}
          <div className="bg-card/40 border border-border rounded-md p-5 flex items-center shadow-sm">
            <div className="flex items-center gap-4">
              <input
                type="checkbox"
                id="midnight_drawer_prevent"
                checked={preventDuplicateGuests}
                onChange={(e) => setPreventDuplicateGuests(e.target.checked)}
                className="h-5 w-5 rounded-md border-border bg-muted/30 text-primary focus:ring-primary/20 accent-primary cursor-pointer"
              />
              <Label
                htmlFor="midnight_drawer_prevent"
                className="text-xs font-semibold text-foreground cursor-pointer"
              >
                {"មិនអនុញ្ញាតឱ្យមានភ្ញៀវឈ្មោះដូចគ្នា"}
              </Label>
            </div>
          </div>

          {/* CARD 3: ASSETS - Dash style upload as image */}
          <div className="bg-card/40 border border-border rounded-md p-5 space-y-6 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label className="text-[11px] font-semibold ​ uppercase">
                  {"រូបភាពបដា"} *(មិនចាំបាច់)
                </Label>
                <div className="aspect-16/10 rounded-md border border-dashed border-border bg-muted/20 flex flex-col items-center justify-center relative overflow-hidden group hover:border-primary/50 transition-all">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setBanner(e.target.files?.[0] || null)}
                    className="absolute inset-0 opacity-0 z-10 cursor-pointer"
                  />
                  {banner ? (
                    <img
                      src={URL.createObjectURL(banner)}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-2 ​/30">
                      <Upload className="h-5 w-5" />
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[11px] font-semibold ​ uppercase">
                  KHQR ប្រាក់ដុល្លារ *(មិនចាំបាច់)
                </Label>
                <div className="aspect-16/10 rounded-md border border-dashed border-border bg-muted/20 flex flex-col items-center justify-center relative overflow-hidden group hover:border-primary/50 transition-all">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setKhqrUSD(e.target.files?.[0] || null)}
                    className="absolute inset-0 opacity-0 z-10 cursor-pointer"
                  />
                  {khqrUSD ? (
                    <img
                      src={URL.createObjectURL(khqrUSD)}
                      className="h-full w-full object-contain p-2"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-2 ​/30">
                      <Upload className="h-5 w-5" />
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[11px] font-semibold ​ uppercase">
                  KHQR ប្រាក់រៀល *(មិនចាំបាច់)
                </Label>
                <div className="aspect-16/10 rounded-md border border-dashed border-border bg-muted/20 flex flex-col items-center justify-center relative overflow-hidden group hover:border-primary/50 transition-all">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setKhqrKHR(e.target.files?.[0] || null)}
                    className="absolute inset-0 opacity-0 z-10 cursor-pointer"
                  />
                  {khqrKHR ? (
                    <img
                      src={URL.createObjectURL(khqrKHR)}
                      className="h-full w-full object-contain p-2"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-2 ​/30">
                      <Upload className="h-5 w-5" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card/40 border border-border rounded-md p-5 space-y-4 shadow-sm">
            <Label className="text-xs font-semibold ​ uppercase">
              {"ព័ត៌មានបន្ថែម"}
            </Label>
            <div className="rounded-md border border-border bg-muted/20 overflow-hidden text-foreground text-sm px-4 py-3">
              <RichTextEditor
                value={description}
                onChange={setDescription}
                className="min-h-37.5"
                placeholder={"បញ្ចូលព័ត៌មានផ្សេងៗ..."}
              />
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER - Red solid button from image */}
      <div className="h-20 bg-card border-t border-border flex items-center justify-center px-4 z-50 shrink-0">
        <form onSubmit={handleSubmit} className="w-full max-w-4xl">
          <Button
            type="submit"
            disabled={loading}
            className="w-full cursor-pointer h-11 rounded-md font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-all flex items-center justify-center gap-2 text-sm shadow-lg"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle2 className="h-4 w-4" />
            )}
            <span>{loading ? "កំពុងរក្សាទុក..." : "រក្សាទុក"}</span>
          </Button>
        </form>
      </div>
    </div>
  );

  const trigger = (
    <Button
      size="lg"
      className="h-10 px-6 cursor-pointer rounded-md font-bold bg-primary text-primary-foreground shadow transition-all hover:bg-primary/90 flex items-center gap-2 text-sm"
    >
      <Plus className="h-5 w-5" />
      <span className="uppercase">{"បង្កើតព្រឹត្តិការណ៍ថ្មី"}</span>
    </Button>
  );

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>{trigger}</DrawerTrigger>
      <DrawerContent className="fixed inset-0! top-0! bottom-0! left-0! right-0! mt-0! max-h-screen! h-screen! w-screen max-w-none rounded-none! border-none p-0 bg-background overflow-hidden [&>div:first-child]:hidden">
        {renderFormContent()}
      </DrawerContent>
    </Drawer>
  );
}
