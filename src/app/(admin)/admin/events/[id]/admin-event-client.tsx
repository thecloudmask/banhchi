"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  getEventById,
  deleteGuest,
  subscribeToGuests,
  updateEvent,
} from "@/services/event.service";
import { Event, Guest } from "@/types";
import { AddGuestDialog } from "@/components/add-guest-dialog";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Search,
  Trash2,
  Pencil,
  Download,
  MessageSquare,
  ListFilter,
  ExternalLink,
  MoreVertical,
  Loader2,
  TrendingDown,
  Receipt,
  Clock,
  Calendar as CalendarIcon,
  Plus,
  Palette,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  cn,
  formatDateTime,
  toKhmerDigits,
  formatKhmerTimeStr,
} from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";
import { GuestHistoryDialog } from "@/components/guest-history-dialog";
import { PublicSettingsDialog } from "@/components/public-settings-dialog";
import { TrackingReportDialog } from "@/components/tracking-report-dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AdminEventLogsFeed } from "@/components/admin-event-logs-feed";
import { Printer, History, Activity } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import Link from "next/link";
import { LoadingOverlay } from "@/components/loading-overlay";

export default function AdminEventClient() {
  const { user, loading: authLoading } = useAuth();
  const params = useParams();
  const router = useRouter();

  // Robustly determine eventId using both params and window location (fallback for static export)
  const [currentEventId, setCurrentEventId] = useState<string | null>(null);

  useEffect(() => {
    // 1. Try to get from params
    if (params?.id) {
      const id = Array.isArray(params.id) ? params.id[0] : params.id;
      if (id) {
        setCurrentEventId(id);
        return;
      }
    }

    // 2. Fallback: extract from URL if params is empty (happens with static export rewrites)
    if (typeof window !== "undefined") {
      const path = window.location.pathname;
      // Expected path: /admin/events/[ID]
      const parts = path.split("/");
      const eventsIndex = parts.indexOf("events");
      if (eventsIndex !== -1 && parts[eventsIndex + 1]) {
        const extractedId = parts[eventsIndex + 1];
        // simple validation to avoid picking up sub-routes incorrectly if any
        if (extractedId && extractedId !== "index.html") {
          setCurrentEventId(extractedId);
        }
      }
    }
  }, [params]);

  const [event, setEvent] = useState<Event | null>(null);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPaymentMethod, setFilterPaymentMethod] = useState<string>("all");
  const [filterLocation, setFilterLocation] = useState<string>("all");
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [editEventDate, setEditEventDate] = useState<Date | undefined>(
    undefined,
  );
  const [displayCount, setDisplayCount] = useState(24);

  // Schedule state
  type ScheduleActivity = { time: string; title: string; description: string };
  type ScheduleDay = {
    id: string;
    dayLabel: string;
    activities: ScheduleActivity[];
  };
  const [schedule, setSchedule] = useState<ScheduleDay[]>([]);
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [dressColors, setDressColors] = useState<
    { color: string; name: string; meaning: string }[]
  >([]);

  const fetchData = async (showLoading = true) => {
    if (!currentEventId) return;
    try {
      if (showLoading) setLoading(true);
      const eventData = await getEventById(currentEventId);
      setEvent(eventData);
      if (eventData?.eventDate) {
        const dateVal = eventData.eventDate;
        let d: Date;

        if (dateVal && typeof (dateVal as any).toDate === "function") {
          d = (dateVal as any).toDate();
        } else if (dateVal instanceof Date) {
          d = dateVal;
        } else {
          d = new Date(dateVal as any);
        }
        setEditEventDate(d);
      }
    } catch (error) {
      console.error("Data Fetch Error:", error);
      toast.error("បរាជ័យក្នុងការទាញយកទិន្នន័យ");
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    if (user && currentEventId) {
      fetchData(true);

      const unsubscribe = subscribeToGuests(currentEventId, (updatedGuests) => {
        setGuests(updatedGuests);
      });

      return () => unsubscribe();
    }
  }, [user, currentEventId]);

  // Sync schedule from event.extraData when event loads
  useEffect(() => {
    if (event?.extraData?.schedule) {
      setSchedule(event.extraData.schedule);
    } else if (event && !event.extraData?.schedule) {
      // Default empty day
      setSchedule([
        {
          id: `day_${Date.now()}`,
          dayLabel: "",
          activities: [{ time: "", title: "", description: "" }],
        },
      ]);
    }
  }, [event?.id]);

  // Sync dressColors from event.extraData
  useEffect(() => {
    if (event?.extraData?.dressColors) {
      setDressColors(event.extraData.dressColors);
    } else {
      setDressColors([]);
    }
  }, [event?.id]);

  const handleSaveSchedule = async () => {
    if (!event) return;
    try {
      setScheduleLoading(true);
      const cleanSchedule = (schedule || [])
        .map((day) => ({
          ...day,
          activities: (day.activities || []).filter(
            (a) => a.time?.trim() || a.title?.trim(),
          ),
        }))
        .filter(
          (day) =>
            day.dayLabel?.trim() ||
            (day.activities && day.activities.length > 0),
        );
      await updateEvent(event.id, {
        extraData: { ...event.extraData, schedule: cleanSchedule },
      });
      toast.success("បានរក្សាទុកស្រអីកាលវិភាគ");
      await fetchData(false);
    } catch (e) {
      toast.error("បរាជ័យក្នុងការរក្សាទុក");
    } finally {
      setScheduleLoading(false);
    }
  };

  const handleDeleteGuest = async (guestId: string) => {
    if (!currentEventId || !confirm("តើអ្នកពិតជាចង់លុបភ្ញៀវនេះមែនទេ?")) return;
    try {
      await deleteGuest(currentEventId!, guestId);
      toast.success("បានលុបភ្ញៀវ");
      fetchData(false);
    } catch (error) {
      toast.error("បរាជ័យក្នុងការលុបភ្ញៀវ");
    }
  };

  const filteredGuests = useMemo(() => {
    let result = guests || [];

    // Filter by search query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (g: Guest) =>
          g.name.toLowerCase().includes(q) ||
          g.note?.toLowerCase().includes(q) ||
          g.location?.toLowerCase().includes(q),
      );
    }

    // Filter by payment method
    if (filterPaymentMethod !== "all") {
      if (filterPaymentMethod === "cash") {
        result = result.filter(
          (g: Guest) => g.paymentMethod === filterPaymentMethod,
        );
      } else if (filterPaymentMethod === "others") {
        result = result.filter(
          (g: Guest) =>
            !["aba", "acleda", "chipmong", "wing", "cash"].includes(
              g.paymentMethod,
            ),
        );
      } else {
        result = result.filter(
          (g: Guest) => g.paymentMethod === filterPaymentMethod,
        );
      }
    }

    // Filter by location
    if (filterLocation !== "all") {
      result = result.filter((g: Guest) => g.location === filterLocation);
    }

    return result;
  }, [guests, searchQuery, filterPaymentMethod, filterLocation]);

  // Get unique locations for filter
  const uniqueLocations = useMemo(() => {
    const uniqueLocations = Array.from(
      new Set(guests?.map((g: Guest) => g.location).filter(Boolean)),
    ).sort();
    return uniqueLocations;
  }, [guests]);

  const totals = useMemo(() => {
    const res = {
      usd: { total: 0, cash: 0, qr: 0 },
      khr: { total: 0, cash: 0, qr: 0 },
    };
    (guests || []).forEach((g) => {
      const isQR = g.paymentMethod !== "cash";
      res.usd.total += g.amountUsd || 0;
      res.khr.total += g.amountKhr || 0;
      if (isQR) {
        res.usd.qr += g.amountUsd || 0;
        res.khr.qr += g.amountKhr || 0;
      } else {
        res.usd.cash += g.amountUsd || 0;
        res.khr.cash += g.amountKhr || 0;
      }
    });
    return res;
  }, [guests]);

  const downloadCSV = (type: "full" | "invitation" = "full") => {
    if (!event || !guests || guests.length === 0) return;

    let headers: string[] = [];
    let rows: any[][] = [];

    if (type === "invitation") {
      headers = ["ល.រ", "ឈ្មោះភ្ញៀវ", "ចំណាំ"];
      rows = (guests || []).map((g, index) => [
        index + 1,
        `"${g.name}"`,
        `"${g.note || ""}"`,
      ]);
    } else {
      headers = [
        "ល.រ",
        "ឈ្មោះ",
        "ចំនួន (USD)",
        "ចំនួន (KHR)",
        "វិធីបង់ប្រាក់",
        "ចំណាំ",
      ];
      rows = (guests || []).map((g, index) => [
        index + 1,
        `"${g.name}"`,
        g.amountUsd,
        g.amountKhr,
        g.paymentMethod === "cash" ? "សាច់ប្រាក់" : g.paymentMethod || "",
        `"${g.note || ""}"`,
      ]);

      rows.push([], ["", "សរុប", totals.usd.total, totals.khr.total, "", ""]);
      rows.push([
        "",
        "សាច់ប្រាក់សុទ្ធ",
        totals.usd.cash,
        totals.khr.cash,
        "",
        "",
      ]);
      rows.push(["", "ផ្ទេរតាមធនាគារ", totals.usd.qr, totals.khr.qr, "", ""]);
    }

    const csvContent = [headers, ...rows].map((e) => e.join(", ")).join("\n");

    const blob = new Blob(["\ufeff" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `Mordok-Theapka_${(event.title || "Event").replace(/\s+/g, "_")}_${type}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("បានទាញយកទិន្នន័យ");
  };

  const handlePrint = () => {
    window.print();
  };

  const handleThankYou = (guest: Guest) => {
    if (!event) return;

    const parts = [];
    if (guest?.amountUsd && guest.amountUsd > 0)
      parts.push(`$${guest.amountUsd}`);
    if (guest?.amountKhr && guest.amountKhr > 0)
      parts.push(`${guest.amountKhr.toLocaleString()} ៛`);

    const amountStr = parts.join("និង");
    const textToCopy = `សូមអរគុណ ${guest.name} ដែលបានចូលរួមកម្មវិធី"${event.title}"និងបានឧបត្ថម្ភ${amountStr ? `ចំនួន ${amountStr}` : ""}។`;

    navigator.clipboard.writeText(textToCopy);
    toast.success("សារថ្លែងអំណរគុណត្រូវបានចម្លងទុក!");
  };

  const formatUsd = (val: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(val);
  const formatKhr = (val: number) => new Intl.NumberFormat("km-KH").format(val);

  if (authLoading || !user) return null;
  if (!currentEventId)
    return (
      <div className="text-center py-40 font-black text-muted-foreground uppercase text-sm bg-background min-h-screen">
        {"សូមជ្រើសរើសកម្មវិធី"}
      </div>
    );
  if (loading)
    return (
      <div className="flex h-screen items-center justify-center p-8 bg-background">
        <LoadingOverlay isVisible={true} message="កំពុងទាញយកទិន្នន័យ..." />
      </div>
    );
  if (!event)
    return (
      <div className="text-center py-40 font-black text-muted-foreground bg-background min-h-screen">
        {"រកមិនឃើញកម្មវិធី"}
      </div>
    );

  return (
    <div className="space-y-6 bg-background min-h-screen text-foreground p-4 sm:p-6 font-kantumruy relative">
      <LoadingOverlay isVisible={scheduleLoading} />
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-6 border-b border-border">
        <div className="flex items-start gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.back()}
            className="rounded-md border-border bg-card hover:bg-accent h-10 w-10 shrink-0"
          >
            <ArrowLeft className="h-4 w-4 text-muted-foreground" />
          </Button>
          <div className="space-y-1.5 overflow-hidden">
            <h1 className="text-xl sm:text-4xl font-black text-foreground leading-tight line-clamp-2">
              {event.title}
            </h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[10px] font-black text-muted-foreground uppercase">
              <span className="text-primary px-2.5 py-0.5 rounded-full bg-primary/5 border border-primary/10">
                {event.category === "wedding"
                  ? "អាពាហ៍ពិពាហ៍"
                  : event.category === "buddhist"
                    ? "កម្មវិធីបុណ្យ"
                    : "កម្មវិធីផ្សេងៗ"}
              </span>
              <div className="h-1 w-1 rounded-full bg-border" />
              <div className="flex items-center gap-1.5">
                <CalendarIcon className="h-3 w-3 opacity-50" />
                <span>{formatDateTime(event.eventDate)}</span>
              </div>
              <div className="hidden sm:block h-1 w-1 rounded-full bg-border" />
              <a
                href={`/event/${event.id}`}
                target="_blank"
                className="text-primary hover:text-primary/80 flex items-center gap-1.5 shrink-0 transition-colors"
              >
                {"តំណភ្ជាប់សាធារណៈ"} <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          <div className="flex-1 sm:flex-none">
            <Link href={`/admin/events/${event.id}/expenses`}>
              <Button
                variant="outline"
                size="sm"
                className="h-9 w-full cursor-pointer rounded-md border-border bg-card hover:bg-accent text-accent-foreground font-semibold gap-2 text-xs uppercase px-4"
              >
                <TrendingDown className="h-3.5 w-3.5 text-primary" />
                {"ចំណាយ"}
              </Button>
            </Link>
          </div>
          <div className="flex-1 sm:flex-none">
            <PublicSettingsDialog
              event={event}
              onRefresh={() => fetchData(false)}
            />
          </div>
          <div className="flex-1 sm:flex-none">
            <TrackingReportDialog
              event={event}
              onRefresh={() => fetchData(false)}
            />
          </div>
          <div className="flex-1 sm:flex-none">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 w-full cursor-pointer rounded-md border-border bg-card hover:bg-accent text-accent-foreground font-semibold gap-2 text-xs uppercase px-4"
                >
                  <Download className="h-3.5 w-3.5 text-muted-foreground" />
                  {"ទាញយកទិន្នន័យ"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="rounded-md p-2 bg-card border-border shadow-xl w-56">
                <DropdownMenuLabel className="font-semibold text-[10px] uppercase text-muted-foreground px-3 py-2">
                  {"របាយការណ៍"}
                </DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => downloadCSV("full")}
                  className="rounded-md p-3 gap-3 cursor-pointer text-foreground hover:bg-accent focus:bg-accent"
                >
                  <Download className="h-4 w-4 text-primary" />
                  <span className="font-semibold text-sm">
                    {"បញ្ជីប្រតិបត្តិការសរុប"}
                  </span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => downloadCSV("invitation")}
                  className="rounded-md p-3 gap-3 cursor-pointer text-foreground hover:bg-accent focus:bg-accent"
                >
                  <ListFilter className="h-4 w-4 text-muted-foreground" />
                  <span className="font-semibold text-sm">
                    {"បញ្ជីផ្ទៀងផ្ទាត់ភ្ញៀវ"}
                  </span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="my-1 bg-border" />
                <DropdownMenuItem
                  onClick={handlePrint}
                  className="rounded-md p-3 gap-3 cursor-pointer text-foreground hover:bg-accent focus:bg-accent"
                >
                  <Printer className="h-4 w-4 text-primary" />
                  <span className="font-semibold text-sm">
                    {"បោះពុម្ពបញ្ជី"}
                  </span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="w-full sm:w-auto">
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 w-full rounded-md border-border bg-card hover:bg-accent text-accent-foreground font-semibold gap-2 text-xs uppercase px-4"
                >
                  <History className="h-3.5 w-3.5 text-primary" />
                  {"សកម្មភាព"}
                </Button>
              </SheetTrigger>
              <SheetContent className="sm:max-w-md p-0 border-border bg-background">
                <SheetHeader className="sr-only">
                  <SheetTitle>{"សកម្មភាព"}</SheetTitle>
                  <SheetDescription>{"កំណត់ត្រាក្រុមការងារ"}</SheetDescription>
                </SheetHeader>
                <AdminEventLogsFeed
                  eventId={event?.id || ""}
                  refreshKey={guests?.length || 0}
                />
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center bg-accent/40 border border-border p-1.5 rounded-md gap-1 overflow-x-auto no-print">
        {[
          { id: "overview", label: "ទូទៅ", icon: Activity },
          { id: "receipts", label: "ភ្ញៀវ & ចំណងដៃ", icon: Receipt },
          { id: "edit", label: "កែប្រែ", icon: Pencil },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "cursor-pointer flex items-center gap-2 px-4 py-2 rounded-md font-semibold text-[11px] uppercase transition-all shrink-0",
              activeTab === tab.id
                ? "bg-primary text-primary-foreground shadow-md"
                : "text-muted-foreground hover:text-foreground hover:bg-accent",
            )}
          >
            <tab.icon
              className={cn(
                "h-3.5 w-3.5",
                activeTab === tab.id
                  ? "text-primary-foreground"
                  : "text-primary",
              )}
            />
            {tab.label}
          </button>
        ))}
      </div>

      {/* DASHBOARD VIEWS */}

      {activeTab === "overview" && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 no-print">
            {event.category === "wedding" ? (
              <>
                <div className="bg-card/40 border border-border rounded-[1.5rem] p-6 space-y-4 hover:border-primary/20 transition-all hover:shadow-xl hover:shadow-primary/5">
                  <span className="text-[10px] font-black uppercase text-muted-foreground">
                    កូនប្រុស
                  </span>
                  <p className="text-2xl font-black text-foreground truncate">
                    {event.extraData?.groomName || "-"}
                  </p>
                </div>
                <div className="bg-card/40 border border-border rounded-[1.5rem] p-6 space-y-4 hover:border-primary/20 transition-all hover:shadow-xl hover:shadow-primary/5">
                  <span className="text-[10px] font-black uppercase text-muted-foreground">
                    កូនស្រី
                  </span>
                  <p className="text-2xl font-black text-foreground truncate">
                    {event.extraData?.brideName || "-"}
                  </p>
                </div>
              </>
            ) : (
              <div className="bg-card/40 border border-border rounded-[1.5rem] p-6 space-y-4 hover:border-primary/20 transition-all hover:shadow-xl hover:shadow-primary/5 col-span-2">
                <span className="text-[10px] font-black uppercase text-muted-foreground">
                  {event.category === "buddhist"
                    ? "ម្ចាស់ដើមបុណ្យ / ម្ចាស់ដើមទាន"
                    : "ឈ្មោះកម្មវិធី"}
                </span>
                <p className="text-2xl font-black text-foreground truncate">
                  {event.category === "buddhist"
                    ? event.extraData?.donorName || "-"
                    : event.title}
                </p>
              </div>
            )}
            <div className="bg-card/40 border border-border rounded-[1.5rem] p-6 space-y-4 hover:border-primary/20 transition-all hover:shadow-xl hover:shadow-primary/5">
              <span className="text-[10px] font-black uppercase text-muted-foreground">
                ភ្ញៀវសរុប
              </span>
              <p className="text-3xl font-black text-foreground">
                {guests.length}{" "}
                <span className="text-muted-foreground text-sm font-bold">
                  នាក់
                </span>
              </p>
            </div>
            <div className="bg-card/40 border border-border rounded-[1.5rem] p-6 space-y-4 hover:border-primary/20 transition-all hover:shadow-xl hover:shadow-primary/5">
              <span className="text-[10px] font-black uppercase text-muted-foreground">
                ថ្ងៃកម្មវិធី
              </span>
              <p className="text-lg font-black text-foreground">
                {formatDateTime(event.eventDate)}
              </p>
              {event.eventTime && (
                <p className="text-xs text-primary font-black uppercase">
                  {event.eventTime}
                </p>
              )}
            </div>
          </div>
          <div className="bg-card/40 border border-border rounded-[2rem] p-8 space-y-6 relative overflow-hidden group hover:border-primary/30 transition-all duration-500">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[80px] rounded-full pointer-events-none group-hover:bg-primary/10 transition-all duration-700" />
            <div className="flex items-center gap-3">
              <div className="h-1.5 w-8 bg-primary rounded-full" />
              <span className="text-[10px] font-black uppercase text-muted-foreground">
                {"ចំណងដៃថ្មីៗ"}
              </span>
            </div>
            <p className="text-sm text-muted-foreground font-medium">
              {"បានទទួលបានចំណងដៃសរុប"} {guests.length} {"នាក់"}
            </p>
            <div className="grid grid-cols-2 gap-8 pt-6 border-t border-border/50">
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase text-muted-foreground/60">
                  សរុប (USD)
                </p>
                <p className="text-4xl font-black text-primary">
                  {formatUsd(totals.usd.total)}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase text-muted-foreground/60">
                  សរុប (KHR)
                </p>
                <p className="text-4xl font-black text-primary">
                  {formatKhr(totals.khr.total)} ៛
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. SHARED STATS & GUESTS (Visible Always for Non-Weddings, or on Guest Tab for Weddings) */}
      {activeTab === "receipts" && (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Stats Cards Section */}
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 no-print">
            <div className="bg-primary/10 border border-primary/20 rounded-md p-5 space-y-3 relative overflow-hidden">
              <span className="text-[10px] font-semibold uppercase text-primary">
                {"សរុបទាំងអស់"}
              </span>
              <p className="text-2xl font-bold text-foreground">
                {guests.length}{" "}
                <span className="text-muted-foreground text-sm">{"នាក់"}</span>
              </p>
              <div className="flex gap-3 text-[10px] font-semibold text-muted-foreground">
                <span>{formatUsd(totals.usd.total)}</span>
                <span>·</span>
                <span>{formatKhr(totals.khr.total)} ៛</span>
              </div>
            </div>
            <div className="bg-card/40 border border-border rounded-md p-5 space-y-3">
              <span className="text-[10px] font-semibold uppercase text-muted-foreground">
                {"សរុប (ដុល្លារ)"}
              </span>
              <p className="text-2xl font-bold text-primary">
                {formatUsd(totals.usd.total + totals.khr.total / 4000)}
              </p>
              <p className="text-[10px] text-muted-foreground/60 uppercase">
                {"អត្រាប្តូរប្រាក់៖ ១ ដុល្លារ = ៤,០០០ រៀល"}
              </p>
            </div>
            <div className="bg-card/40 border border-border rounded-md p-5 space-y-3">
              <span className="text-[10px] font-semibold uppercase text-muted-foreground">
                {"សរុបសាច់ប្រាក់សុទ្ធ"}
              </span>
              <p className="text-xl font-bold text-foreground">
                {formatUsd(totals.usd.cash)}
              </p>
              <p className="text-sm text-muted-foreground font-mono">
                {formatKhr(totals.khr.cash)} ៛
              </p>
            </div>
            <div className="bg-card/40 border border-border rounded-md p-5 space-y-3">
              <span className="text-[10px] font-semibold uppercase text-muted-foreground">
                {"សរុបតាមធនាគារ"}
              </span>
              <p className="text-xl font-bold text-foreground">
                {formatUsd(totals.usd.qr)}
              </p>
              <p className="text-sm text-muted-foreground font-mono">
                {formatKhr(totals.khr.qr)} ៛
              </p>
            </div>
          </div>

          <div className="space-y-5 bg-card/40 border border-border rounded-[1.5rem] p-4 sm:p-6">
            <div className="flex flex-col xl:flex-row xl:justify-between gap-6">
              <div className="flex flex-col gap-3 flex-1">
                <div className="relative w-full sm:max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={"ស្វែងរកឈ្មោះភ្ញៀវ លេខទូរស័ព្ទ..."}
                    className="h-11 pl-10 rounded-xl border-border bg-background shadow-inner text-foreground placeholder:text-muted-foreground font-semibold text-sm focus-visible:ring-primary/20"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setDisplayCount(24);
                    }}
                  />
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Select
                    value={filterPaymentMethod}
                    onValueChange={setFilterPaymentMethod}
                  >
                    <SelectTrigger className="w-full sm:w-40 h-10 rounded-md border-border bg-accent/50 text-muted-foreground font-semibold text-xs">
                      <div className="flex items-center gap-2">
                        <ListFilter className="h-3.5 w-3.5 text-muted-foreground" />
                        <SelectValue placeholder={"ការបង់ប្រាក់"} />
                      </div>
                    </SelectTrigger>
                    <SelectContent className="rounded-md bg-card border-border text-foreground">
                      <SelectItem value="all" className="font-semibold text-xs">
                        {"គ្រប់វិធី"}
                      </SelectItem>
                      <SelectItem
                        value="cash"
                        className="font-semibold text-xs"
                      >
                        {"សាច់ប្រាក់"}
                      </SelectItem>
                      <SelectItem
                        value="bank"
                        className="font-semibold text-xs"
                      >
                        {"ធនាគារ"}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {uniqueLocations.length > 0 && (
                    <Select
                      value={filterLocation}
                      onValueChange={setFilterLocation}
                    >
                      <SelectTrigger className="w-full sm:w-40 h-10 rounded-md border-border bg-accent/50 text-muted-foreground font-semibold text-xs">
                        <div className="flex items-center gap-2">
                          <ListFilter className="h-3.5 w-3.5 text-muted-foreground" />
                          <SelectValue placeholder={"ទីតាំង"} />
                        </div>
                      </SelectTrigger>
                      <SelectContent className="rounded-md bg-card border-border text-foreground max-h-48">
                        <SelectItem
                          value="all"
                          className="font-semibold text-xs"
                        >
                          {"គ្រប់ទីតាំង"}
                        </SelectItem>
                        {uniqueLocations?.map((location) => (
                          <SelectItem
                            key={location}
                            value={location || ""}
                            className="font-semibold text-xs"
                          >
                            {location}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  {(filterPaymentMethod !== "all" ||
                    filterLocation !== "all") && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setFilterPaymentMethod("all");
                        setFilterLocation("all");
                      }}
                      className="h-9 px-3 text-xs font-semibold text-muted-foreground hover:text-foreground"
                    >
                      {"សម្អាត"}
                    </Button>
                  )}
                  <p className="ml-auto text-[10px] font-semibold uppercase text-muted-foreground/60">
                    {filteredGuests.length} {"នាក់"}
                  </p>
                </div>
              </div>

              <div>
                <AddGuestDialog
                  event={event}
                  onSuccess={() => fetchData(false)}
                />
              </div>
            </div>

            {filteredGuests.length === 0 ? (
              <div className="h-40 flex items-center justify-center">
                <p className="font-semibold uppercase text-[11px] text-muted-foreground/50">
                  {"រកមិនឃើញទិន្នន័យ"}
                </p>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {filteredGuests?.slice(0, displayCount).map((guest, index) => (
                    <div
                      key={guest.id}
                      className="relative p-7 rounded-[1.5rem] border border-border bg-card/40 hover:bg-card hover:border-primary/20 transition-all duration-500 hover:shadow-xl hover:shadow-primary/5 group animate-in fade-in zoom-in"
                      style={{ animationDelay: `${(index % 12) * 20}ms` }}
                    >
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-full"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="rounded-xl p-2.5 bg-card border-border shadow-2xl w-48 backdrop-blur-xl">
                          <DropdownMenuItem
                            onClick={() => handleThankYou(guest)}
                            className="rounded-lg p-3 gap-3 cursor-pointer text-foreground hover:bg-accent focus:bg-accent"
                          >
                            <MessageSquare className="h-4 w-4 text-amber-500" />
                            <span className="font-bold text-xs uppercase">
                              {"អរគុណ"}
                            </span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            asChild
                            className="rounded-lg p-3 gap-3 cursor-pointer text-foreground hover:bg-accent focus:bg-accent"
                          >
                            <GuestHistoryDialog
                              eventId={currentEventId}
                              guest={guest}
                            />
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-border/50 my-2" />
                          <DropdownMenuItem
                            onClick={() => setEditingGuest(guest)}
                            className="rounded-lg p-3 gap-3 cursor-pointer text-foreground hover:bg-accent focus:bg-accent"
                          >
                            <Pencil className="h-4 w-4 text-primary" />
                            <span className="font-bold text-xs uppercase">
                              {"កែប្រែ"}
                            </span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteGuest(guest.id)}
                            className="rounded-lg p-3 gap-3 cursor-pointer text-red-500 hover:bg-red-500/10 focus:bg-red-500/10 h-10"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="font-bold text-xs uppercase">
                              {"លុប"}
                            </span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="mb-3">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="inline-flex items-center justify-center min-w-7 h-5 px-1.5 rounded-md bg-primary text-primary-foreground text-[10px] font-bold">
                          {index + 1}
                        </span>
                        <h3 className="text-base font-bold text-foreground truncate">
                          {guest.name}
                        </h3>
                      </div>
                      {guest.location && (
                        <p className="text-xs text-muted-foreground ml-9">
                          {guest.location}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mb-3 pb-3 border-b border-border/50">
                      <div className="flex-1">
                        <div className="text-[10px] font-semibold text-muted-foreground uppercase mb-0.5">
                          USD
                        </div>
                        {guest.amountUsd > 0 ? (
                          <div className="text-lg font-bold text-foreground">
                            {formatUsd(guest.amountUsd)}
                          </div>
                        ) : (
                          <div className="text-lg font-bold text-muted-foreground/20">
                            -
                          </div>
                        )}
                      </div>
                      <div className="h-8 w-px bg-border/50" />
                      <div className="flex-1">
                        <div className="text-[10px] font-semibold text-muted-foreground uppercase mb-0.5">
                          KHR
                        </div>
                        {guest.amountKhr > 0 ? (
                          <div className="text-lg font-bold text-foreground">
                            {formatKhr(guest.amountKhr)} ៛
                          </div>
                        ) : (
                          <div className="text-lg font-bold text-muted-foreground/20">
                            -
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span
                        className={cn(
                          "inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase",
                          guest.paymentMethod === "cash"
                            ? "bg-emerald-500/10 text-emerald-500"
                            : "bg-blue-500/10 text-blue-500",
                        )}
                      >
                        {guest.paymentMethod === "cash"
                          ? "សាច់ប្រាក់"
                          : guest.paymentMethod}
                      </span>
                      {guest.note && (
                        <p className="text-[11px] text-muted-foreground truncate ml-2 max-w-24 italic">
                          {guest.note}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
                </div>

                {filteredGuests.length > displayCount && (
                  <div className="flex justify-center pt-8">
                    <Button
                      variant="outline"
                      onClick={() => setDisplayCount(prev => prev + 48)}
                      className="h-11 px-10 rounded-xl border-primary/20 bg-primary/5 text-primary font-bold hover:bg-primary hover:text-white transition-all shadow-lg shadow-primary/5"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      {"បង្ហាញបន្ថែម"} ({filteredGuests.length - displayCount} {"នាក់ទៀត"})
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>

          {editingGuest && (
            <AddGuestDialog
              event={event}
              guestToEdit={editingGuest}
              onClose={() => setEditingGuest(null)}
              onSuccess={() => fetchData(false)}
              trigger={<span className="hidden" />}
            />
          )}

          {/* Print View Only (Hidden on screen) */}
          <div className="hidden print:block p-8">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-black mb-2">{event.title}</h1>
              <p className="text-lg font-bold text-gray-500 uppercase">
                {formatDateTime(event.eventDate)}
              </p>
              <div className="mt-8 grid grid-cols-2 gap-8 border-y-2 border-black py-8">
                <div>
                  <p className="text-xs font-black uppercase mb-1">
                    សរុប (USD)
                  </p>
                  <p className="text-3xl font-black">
                    {formatUsd(totals.usd.total)}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-black uppercase mb-1">
                    សរុប (KHR)
                  </p>
                  <p className="text-3xl font-black">
                    {formatKhr(totals.khr.total)} ៛
                  </p>
                </div>
              </div>
            </div>

            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-foreground">
                  <th className="text-left py-4 font-black uppercase text-xs">
                    ល.រ
                  </th>
                  <th className="text-left py-4 font-black uppercase text-xs">
                    ឈ្មោះភ្ញៀវ
                  </th>
                  <th className="text-left py-4 font-black uppercase text-xs">
                    ទីតាំង
                  </th>
                  <th className="text-right py-4 font-black uppercase text-xs">
                    ចំនួន (USD)
                  </th>
                  <th className="text-right py-4 font-black uppercase text-xs">
                    ចំនួន (KHR)
                  </th>
                  <th className="text-left py-4 font-black uppercase text-xs pl-8">
                    ចំណាំ
                  </th>
                </tr>
              </thead>
              <tbody>
                {guests?.map((g, i) => (
                  <tr key={g.id} className="border-b border-gray-200">
                    <td className="py-4 font-bold text-sm">{i + 1}</td>
                    <td className="py-4 font-black text-sm">{g.name}</td>
                    <td className="py-4 font-bold text-sm text-gray-500">
                      {g.location || "-"}
                    </td>
                    <td className="py-4 text-right font-black text-sm">
                      {g.amountUsd > 0 ? formatUsd(g.amountUsd) : "-"}
                    </td>
                    <td className="py-4 text-right font-black text-sm">
                      {g.amountKhr > 0 ? formatKhr(g.amountKhr) : "-"}
                    </td>
                    <td className="py-4 text-left text-xs font-medium text-gray-400 pl-8">
                      {g.note || ""}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-12 text-center text-[10px] font-bold text-gray-400 uppercase">
              រៀបរៀងដោយ មត៌ក ធៀបការ (Mordok-Theapka) Digital Event Companion •{" "}
              {new Date().toLocaleDateString()}
            </div>
          </div>
        </div>
      )}

      {event.category === "wedding" && activeTab === "schedule" && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">
                  {"កាលវិភាគរបៀបវរៈ"}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {"រៀបចំកម្មវិធីតាមលំដាប់លំដោយ"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setSchedule((prev) => [
                    ...prev,
                    {
                      id: `day_${Date.now()}`,
                      dayLabel: "",
                      activities: [{ time: "", title: "", description: "" }],
                    },
                  ])
                }
                className="h-9 rounded-md border-border bg-card hover:bg-accent text-muted-foreground font-semibold text-xs px-4"
              >
                <Plus className="h-3.5 w-3.5 mr-1.5" />
                {"បន្ថែមថ្ងៃ"}
              </Button>
              <Button
                size="sm"
                onClick={handleSaveSchedule}
                disabled={scheduleLoading}
                className="h-9 rounded-md bg-primary hover:bg-primary/90 text-white font-bold px-6 shadow-lg shadow-primary/20"
              >
                {scheduleLoading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                ) : null}
                {"រក្សាទុក"}
              </Button>
            </div>
          </div>

          {/* Days */}
          {!schedule || schedule.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-border rounded-md">
              <Clock className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-[11px] font-semibold uppercase text-muted-foreground/50">
                {"មិនទាន់មានកាលវិភាគ។ ចុច «បន្ថែមថ្ងៃ» ដើម្បីចាប់ផ្ដើម"}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {(schedule || []).map((day, dayIndex) => (
                <div
                  key={day.id}
                  className="bg-card/40 border border-border rounded-md overflow-hidden"
                >
                  {/* Day Header */}
                  <div className="flex items-center gap-3 p-4 border-b border-border bg-primary/5">
                    <div className="h-7 w-7 rounded-md bg-primary/20 flex items-center justify-center shrink-0">
                      <span className="text-[10px] font-black text-primary">
                        {dayIndex + 1}
                      </span>
                    </div>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="ghost"
                          className="h-10 border-0 bg-transparent text-foreground font-bold text-base flex-1 justify-start hover:bg-black/5 hover:text-[#f41f4d] transition-all px-4"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {day.dayLabel || "ជ្រើសរើសថ្ងៃ"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          onSelect={(d) => {
                            if (!d) return;
                            const s = [...schedule];
                            s[dayIndex].dayLabel = formatDateTime(d, false);
                            setSchedule(s);
                          }}
                          className="font-kantumruy"
                        />
                      </PopoverContent>
                    </Popover>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        setSchedule(schedule.filter((_, i) => i !== dayIndex))
                      }
                      className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-md shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Activities */}
                  <div className="p-4 space-y-3">
                    {day.activities?.map((act, actIndex) => (
                      <div
                        key={actIndex}
                        className="group flex gap-3 items-start p-4 bg-accent/30 rounded-md border border-border hover:bg-accent/50 transition-all"
                      >
                        {/* Time */}
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-32 h-10 shrink-0 border-0 bg-muted/50 shadow-inner rounded-md font-black text-primary text-center text-sm focus:ring-0 flex items-center justify-center gap-2"
                            >
                              <Clock className="h-3.5 w-3.5 opacity-50" />
                              {formatKhmerTimeStr(act.time)}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-48 p-3" align="center">
                            <div className="space-y-3">
                              <Label className="text-[10px] font-black uppercase text-muted-foreground flex items-center gap-2">
                                <Clock className="h-3 w-3" /> កំណត់ម៉ោងកម្មវិធី
                              </Label>
                              <div className="flex items-center justify-center gap-2">
                                <select
                                  className="bg-background border border-border rounded-md px-2 py-1.5 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 appearance-none min-w-15 text-center cursor-pointer"
                                  value={
                                    act.time ? act.time.split(":")[0] : "00"
                                  }
                                  onChange={(e) => {
                                    const h = e.target.value;
                                    const m = act.time
                                      ? act.time.split(":")[1] || "00"
                                      : "00";
                                    const s = [...schedule];
                                    if (!s[dayIndex].activities)
                                      s[dayIndex].activities = [];
                                    s[dayIndex].activities[actIndex].time =
                                      `${h}:${m}`;
                                    setSchedule(s);
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
                                  className="bg-background border border-border rounded-md px-2 py-1.5 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 appearance-none min-w-15 text-center cursor-pointer"
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
                                    const s = [...schedule];
                                    if (!s[dayIndex].activities)
                                      s[dayIndex].activities = [];
                                    s[dayIndex].activities[actIndex].time =
                                      `${h}:${m}`;
                                    setSchedule(s);
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
                        {/* Title + Description */}
                        <div className="flex-1 space-y-2">
                          <Input
                            placeholder={"ចំណងជើងកម្មវិធី"}
                            value={act.title}
                            onChange={(e) => {
                              const s = [...schedule];
                              if (!s[dayIndex].activities)
                                s[dayIndex].activities = [];
                              s[dayIndex].activities[actIndex].title =
                                e.target.value;
                              setSchedule(s);
                            }}
                            className="h-10 border-0 bg-transparent font-bold text-foreground text-sm px-0 placeholder:text-muted-foreground/30 focus:ring-0"
                          />
                          <Textarea
                            placeholder={"ការពិពណ៌នាលម្អិត (មិនចាំបាច់)"}
                            value={act.description}
                            onChange={(e) => {
                              const s = [...schedule];
                              if (!s[dayIndex].activities)
                                s[dayIndex].activities = [];
                              s[dayIndex].activities[actIndex].description =
                                e.target.value;
                              setSchedule(s);
                            }}
                            className="min-h-16 border-0 bg-muted/50 shadow-inner rounded-md text-muted-foreground font-medium p-3 text-sm resize-none focus:ring-0 placeholder:text-muted-foreground/30"
                          />
                        </div>
                        {/* Delete activity */}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            const s = [...schedule];
                            s[dayIndex].activities = s[
                              dayIndex
                            ].activities.filter((_, i) => i !== actIndex);
                            setSchedule(s);
                          }}
                          className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-md shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}

                    {/* Add activity */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const s = [...schedule];
                        if (!s[dayIndex].activities)
                          s[dayIndex].activities = [];
                        s[dayIndex].activities.push({
                          time: "",
                          title: "",
                          description: "",
                        });
                        setSchedule(s);
                      }}
                      className="w-full h-9 rounded-md border border-dashed border-border text-muted-foreground hover:text-primary hover:border-primary/40 hover:bg-primary/5 font-semibold text-xs uppercase transition-all"
                    >
                      <Plus className="h-3.5 w-3.5 mr-1.5" />
                      {"បន្ថែមកម្មវិធី"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Save footer */}
          {schedule.length > 0 && (
            <div className="flex justify-end pt-2">
              <Button
                onClick={handleSaveSchedule}
                disabled={scheduleLoading}
                className="h-10 rounded-md bg-primary hover:bg-primary/90 text-white font-bold px-10 shadow-lg shadow-primary/20"
              >
                {scheduleLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                {"រក្សាទុកកាលវិភាគ"}
              </Button>
            </div>
          )}
        </div>
      )}

      {activeTab === "edit" && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-card/40 border border-border rounded-md p-5 sm:p-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center">
                <Pencil className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">
                  {"កែសម្រួលព័ត៌មាន"}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {"កំណត់ព័ត៌មានកម្មវិធី"}
                </p>
              </div>
            </div>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const updatedData = {
                  title: formData.get("title") as string,
                  eventTime: formData.get("eventTime") as string,
                  eventDate: editEventDate,
                  extraData: {
                    ...event.extraData,
                    ...(event.category === "wedding"
                      ? {
                          groomName: formData.get("groomName") as string,
                          brideName: formData.get("brideName") as string,
                          groomFatherTitle: formData.get(
                            "groomFatherTitle",
                          ) as string,
                          groomFatherName: formData.get(
                            "groomFatherName",
                          ) as string,
                          groomMotherTitle: formData.get(
                            "groomMotherTitle",
                          ) as string,
                          groomMotherName: formData.get(
                            "groomMotherName",
                          ) as string,
                          brideFatherTitle: formData.get(
                            "brideFatherTitle",
                          ) as string,
                          brideFatherName: formData.get(
                            "brideFatherName",
                          ) as string,
                          brideMotherTitle: formData.get(
                            "brideMotherTitle",
                          ) as string,
                          brideMotherName: formData.get(
                            "brideMotherName",
                          ) as string,
                        }
                      : event.category === "buddhist"
                        ? {
                            donorName: formData.get("donorName") as string,
                          }
                        : {}),
                    dressColors: dressColors,
                  },
                };
                try {
                  setLoading(true);
                  await updateEvent(event.id, updatedData);
                  toast.success("ព័ត៌មានត្រូវបានរក្សាទុក");
                  fetchData(false);
                } catch (err) {
                  toast.error("មានបញ្ហាក្នុងការរក្សាទុក");
                } finally {
                  setLoading(false);
                }
              }}
              className="grid grid-cols-1 md:grid-cols-2 gap-5"
            >
              <div className="space-y-2">
                <label className="text-[10px] font-semibold uppercase text-muted-foreground">
                  {"ឈ្មោះកម្មវិធី"}
                </label>
                <Input
                  name="title"
                  defaultValue={event.title}
                  className="h-10 rounded-md border-border bg-accent/50 text-foreground font-medium placeholder:text-muted-foreground/30"
                />
              </div>

              {event.category === "buddhist" && (
                <div className="space-y-2">
                  <label className="text-[10px] font-semibold uppercase text-muted-foreground">
                    {"ឈ្មោះម្ចាស់បុណ្យ"}
                  </label>
                  <Input
                    name="donorName"
                    defaultValue={event.extraData?.donorName}
                    placeholder="ឧ. ឧបាសក ឡុង ប៊ុនធឿន"
                    className="h-10 rounded-md border-border bg-accent/50 text-foreground font-medium placeholder:text-muted-foreground/30"
                  />
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[10px] font-semibold uppercase text-muted-foreground">
                  {"ម៉ោង"}
                </label>
                <Input
                  name="eventTime"
                  defaultValue={event.eventTime}
                  placeholder="ឧ. 7:00 ព្រឹក"
                  className="h-10 rounded-md border-border bg-accent/50 text-foreground font-medium placeholder:text-muted-foreground/30"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-semibold uppercase text-muted-foreground">
                  {"ថ្ងៃទី និង ម៉ោងកម្មវិធី"}
                </label>
                <div className="grid grid-cols-1 gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="h-10 justify-start cursor-pointer text-left font-medium bg-accent/50 border-border text-foreground hover:bg-accent hover:text-foreground rounded-md w-full px-4"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
                        {editEventDate
                          ? formatDateTime(editEventDate)
                          : "ជ្រើសរើសថ្ងៃ និង ម៉ោង"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-auto p-0 bg-card border-border"
                      align="start"
                    >
                      <Calendar
                        mode="single"
                        selected={editEventDate}
                        onSelect={(date) => {
                          if (!date) return;
                          const newDate = new Date(date);
                          if (
                            editEventDate &&
                            !isNaN(editEventDate.getTime())
                          ) {
                            newDate.setHours(editEventDate.getHours());
                            newDate.setMinutes(editEventDate.getMinutes());
                          } else {
                            const now = new Date();
                            newDate.setHours(now.getHours());
                            newDate.setMinutes(now.getMinutes());
                          }
                          setEditEventDate(newDate);
                        }}
                        className="bg-card text-foreground rounded-t-md font-kantumruy"
                      />
                      <div className="p-4 border-t border-border flex items-center justify-between gap-4 bg-accent/5">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 opacity-50" />
                          <span className="text-xs font-bold uppercase">
                            កំណត់ម៉ោង
                          </span>
                        </div>
                        <div className="flex items-center justify-center gap-2">
                          <select
                            className="bg-background border border-border rounded-md px-3 py-1 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 appearance-none min-w-17.5 text-center cursor-pointer"
                            value={
                              editEventDate && !isNaN(editEventDate.getTime())
                                ? format(editEventDate, "HH")
                                : "00"
                            }
                            onChange={(e) => {
                              const h = e.target.value;
                              const n = new Date(
                                editEventDate && !isNaN(editEventDate.getTime())
                                  ? editEventDate
                                  : new Date(),
                              );
                              n.setHours(parseInt(h, 10));
                              if (isNaN(n.getMinutes())) n.setMinutes(0);
                              n.setSeconds(0);
                              setEditEventDate(n);
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
                            className="bg-background border border-border rounded-md px-3 py-1 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 appearance-none min-w-17.5 text-center cursor-pointer"
                            value={
                              editEventDate && !isNaN(editEventDate.getTime())
                                ? format(editEventDate, "mm")
                                : "00"
                            }
                            onChange={(e) => {
                              const m = e.target.value;
                              const n = new Date(
                                editEventDate && !isNaN(editEventDate.getTime())
                                  ? editEventDate
                                  : new Date(),
                              );
                              n.setMinutes(parseInt(m, 10));
                              if (isNaN(n.getHours())) n.setHours(0);
                              n.setSeconds(0);
                              setEditEventDate(n);
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
                  {editEventDate && (
                    <p className="text-[10px] text-primary font-bold">
                      {formatDateTime(editEventDate)}
                    </p>
                  )}
                </div>
              </div>

              {event.category === "wedding" && (
                <>
                  <div className="space-y-2">
                    <label className="text-[10px] font-semibold uppercase text-muted-foreground">
                      {"ឈ្មោះកូនប្រុស"}
                    </label>
                    <Input
                      name="groomName"
                      defaultValue={event.extraData?.groomName}
                      className="h-10 rounded-md border-border bg-accent/50 text-foreground font-medium placeholder:text-muted-foreground/30"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-semibold uppercase text-muted-foreground">
                      {"ឈ្មោះកូនស្រី"}
                    </label>
                    <Input
                      name="brideName"
                      defaultValue={event.extraData?.brideName}
                      className="h-10 rounded-md border-border bg-accent/50 text-foreground font-medium placeholder:text-muted-foreground/30"
                    />
                  </div>

                  {/* Parents Section - Groom */}
                  <div className="space-y-4 col-span-1 md:col-span-2 p-4 border rounded-md bg-muted/20">
                    <h4 className="text-sm font-bold text-[#C5A866]">
                      ព័ត៌មានមាតាបិតាកូនប្រុស
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-semibold uppercase text-muted-foreground">
                          ងារឪពុក
                        </label>
                        <Input
                          name="groomFatherTitle"
                          defaultValue={event.extraData?.groomFatherTitle}
                          placeholder="ឧ. លោក / ឯកឧត្តម"
                          className="h-10 text-foreground text-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-semibold uppercase text-muted-foreground">
                          ឈ្មោះឪពុក
                        </label>
                        <Input
                          name="groomFatherName"
                          defaultValue={event.extraData?.groomFatherName}
                          placeholder="ឧ. ឈន ស៊ីដេត"
                          className="h-10 text-foreground text-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-semibold uppercase text-muted-foreground">
                          ងារម្ដាយ
                        </label>
                        <Input
                          name="groomMotherTitle"
                          defaultValue={event.extraData?.groomMotherTitle}
                          placeholder="ឧ. លោកស្រី / លោកជំទាវ"
                          className="h-10 text-foreground text-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-semibold uppercase text-muted-foreground">
                          ឈ្មោះម្ដាយ
                        </label>
                        <Input
                          name="groomMotherName"
                          defaultValue={event.extraData?.groomMotherName}
                          placeholder="ឧ. ម៉ម សុផាត"
                          className="h-10 text-foreground text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Parents Section - Bride */}
                  <div className="space-y-4 col-span-1 md:col-span-2 p-4 border rounded-md bg-muted/20">
                    <h4 className="text-sm font-bold text-[#C5A866]">
                      ព័ត៌មានមាតាបិតាកូនស្រី
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-semibold uppercase text-muted-foreground">
                          ងារឪពុក
                        </label>
                        <Input
                          name="brideFatherTitle"
                          defaultValue={event.extraData?.brideFatherTitle}
                          placeholder="ឧ. លោក / ឯកឧត្តម"
                          className="h-10 text-foreground text-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-semibold uppercase text-muted-foreground">
                          ឈ្មោះឪពុក
                        </label>
                        <Input
                          name="brideFatherName"
                          defaultValue={event.extraData?.brideFatherName}
                          placeholder="ឧ. ស៊ីម ច័ន្ទសុធានេត្រ"
                          className="h-10 text-foreground text-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-semibold uppercase text-muted-foreground">
                          ងារម្ដាយ
                        </label>
                        <Input
                          name="brideMotherTitle"
                          defaultValue={event.extraData?.brideMotherTitle}
                          placeholder="ឧ. លោកស្រី / លោកជំទាវ"
                          className="h-10 text-foreground text-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-semibold uppercase text-muted-foreground">
                          ឈ្មោះម្ដាយ
                        </label>
                        <Input
                          name="brideMotherName"
                          defaultValue={event.extraData?.brideMotherName}
                          placeholder="ឧ. អ៊ុក សោភា"
                          className="h-10 text-foreground text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Dress Code Section */}
              <div className="space-y-6 col-span-1 md:col-span-2 pt-6 border-t border-border mt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center">
                      <Palette className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-foreground">
                        ពណ៌សម្លៀកបំពាក់ចូលរួម (Dress Code)
                      </h4>
                      <p className="text-[10px] text-muted-foreground uppercase font-black">
                        កំណត់ពណ៌ និងអត្ថន័យសម្រាប់ផ្ទាំងធៀប
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setDressColors([
                        ...dressColors,
                        { color: "#E5C170", name: "", meaning: "" },
                      ])
                    }
                    className="h-9 rounded-md border-border bg-card hover:bg-accent text-primary font-bold text-xs px-4"
                  >
                    <Plus className="h-3.5 w-3.5 mr-1.5" />
                    បន្ថែមពណ៌
                  </Button>
                </div>

                {dressColors.length === 0 ? (
                  <div className="text-center py-10 border border-dashed border-border rounded-xl bg-accent/5">
                    <p className="text-xs font-bold text-muted-foreground/50 uppercase">
                      មិនទាន់មានពណ៌សម្លៀកបំពាក់នៅឡើយទេ
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {dressColors.map((dc, idx) => (
                      <div
                        key={idx}
                        className="group relative p-5 rounded-2xl bg-card border border-border hover:border-primary/20 transition-all shadow-sm"
                      >
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            setDressColors(
                              dressColors.filter((_, i) => i !== idx),
                            )
                          }
                          className="absolute -top-2 -right-2 h-7 w-7 rounded-full bg-red-500 text-white shadow-lg hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>

                        <div className="flex gap-4">
                          <div className="space-y-2">
                            <label className="text-[9px] font-black uppercase text-muted-foreground">
                              ពណ៌
                            </label>
                            <div className="relative">
                              <input
                                type="color"
                                value={dc.color}
                                onChange={(e) => {
                                  const newColors = [...dressColors];
                                  newColors[idx].color = e.target.value;
                                  setDressColors(newColors);
                                }}
                                className="h-12 w-12 rounded-lg border-2 border-border cursor-pointer bg-accent/20 transition-all hover:scale-105"
                              />
                            </div>
                          </div>

                          <div className="flex-1 space-y-4">
                            <div className="space-y-1.5">
                              <label className="text-[9px] font-black uppercase text-muted-foreground">
                                ឈ្មោះពណ៌ (Khmer/English)
                              </label>
                              <Input
                                value={dc.name}
                                onChange={(e) => {
                                  const newColors = [...dressColors];
                                  newColors[idx].name = e.target.value;
                                  setDressColors(newColors);
                                }}
                                placeholder="ឧ. ពណ៌ផ្កាឈូក (Pink)"
                                className="h-9 text-xs font-bold border-border bg-accent/10"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-[9px] font-black uppercase text-muted-foreground">
                                អត្ថន័យពណ៌
                              </label>
                              <Input
                                value={dc.meaning}
                                onChange={(e) => {
                                  const newColors = [...dressColors];
                                  newColors[idx].meaning = e.target.value;
                                  setDressColors(newColors);
                                }}
                                placeholder="ឧ. តំណាងឱ្យសេចក្តីស្រឡាញ់ដ៏ផ្អែមល្ហែម"
                                className="h-9 text-[11px] font-medium border-border bg-accent/10 italic"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="md:col-span-2 pt-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="h-11 w-full sm:w-auto px-10 rounded-md bg-[#f41f4d] hover:bg-[#d91a45] text-white font-bold shadow-lg transition-all"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  {"រក្សាទុកព័ត៌មាន"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
