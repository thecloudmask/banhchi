"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { getEventById, deleteGuest, subscribeToGuests } from "@/services/event.service";
import { Event, Guest } from "@/types";
import { AddGuestDialog } from "@/components/add-guest-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Search, Wallet, Trash2, Pencil, Download, Smartphone, MessageSquare, ListFilter, ExternalLink, MoreVertical, Loader2, CreditCard, TrendingDown, Receipt } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { cn, formatDate } from "@/lib/utils";
import { useLanguage } from "@/providers/language-provider";
import { useAuth } from "@/providers/auth-provider";
import { GuestHistoryDialog } from "@/components/guest-history-dialog";
import { PublicSettingsDialog } from "@/components/public-settings-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AdminEventLogsFeed } from "@/components/admin-event-logs-feed";
import { Printer, History, Activity, TrendingUp, PieChart, Building2 } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import Link from "next/link";

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
    if (typeof window !== 'undefined') {
       const path = window.location.pathname;
       // Expected path: /admin/events/[ID]
       const parts = path.split('/');
       const eventsIndex = parts.indexOf('events');
       if (eventsIndex !== -1 && parts[eventsIndex + 1]) {
          const extractedId = parts[eventsIndex + 1];
          // simple validation to avoid picking up sub-routes incorrectly if any
          if (extractedId && extractedId !== 'index.html') {
             setCurrentEventId(extractedId);
          }
       }
    }
  }, [params]);

  const { t, language } = useLanguage();
  
  const [event, setEvent] = useState<Event | null>(null);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPaymentMethod, setFilterPaymentMethod] = useState<string>("all");
  const [filterLocation, setFilterLocation] = useState<string>("all");
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);

  const fetchData = async (showLoading = true) => {
    if (!currentEventId) return;
    try {
      if (showLoading) setLoading(true);
      const eventData = await getEventById(currentEventId);
      setEvent(eventData);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load event data");
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

  const handleDeleteGuest = async (guestId: string) => {
    if (!currentEventId || !confirm(t('delete_guest_confirm'))) return;
    try {
      await deleteGuest(currentEventId!, guestId);
      toast.success(t('guest_deleted'));
      fetchData(false);
    } catch (error) {
      toast.error(t('failed_delete_guest'));
    }
  };

  const filteredGuests = useMemo(() => {
    let result = guests;
    
    // Filter by search query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(g => 
        g.name.toLowerCase().includes(q) || 
        (g.note?.toLowerCase().includes(q)) ||
        (g.location?.toLowerCase().includes(q))
      );
    }
    
    // Filter by payment method
    if (filterPaymentMethod !== "all") {
      if (filterPaymentMethod === "cash") {
        result = result.filter(g => g.paymentMethod === "cash");
      } else if (filterPaymentMethod === "bank") {
        result = result.filter(g => g.paymentMethod !== "cash");
      }
    }
    
    // Filter by location
    if (filterLocation !== "all") {
      result = result.filter(g => g.location === filterLocation);
    }
    
    return result;
  }, [guests, searchQuery, filterPaymentMethod, filterLocation]);

  // Get unique locations for filter
  const uniqueLocations = useMemo(() => {
    const locations = guests
      .map(g => g.location)
      .filter((loc): loc is string => !!loc && loc.trim() !== "");
    return Array.from(new Set(locations)).sort();
  }, [guests]);

  const totals = useMemo(() => {
    const res = {
      usd: { total: 0, cash: 0, qr: 0 },
      khr: { total: 0, cash: 0, qr: 0 }
    };
    guests.forEach(g => {
      const isQR = g.paymentMethod !== 'cash';
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

  const downloadCSV = (type: 'full' | 'invitation' = 'full') => {
    if (!event || guests.length === 0) return;

    let headers: string[] = [];
    let rows: any[][] = [];

    if (type === 'invitation') {
      headers = ["No.", "Guest Name", "Note"];
      rows = guests.map((g, index) => [index + 1, `"${g.name}"`, `"${g.note || ""}"`]);
    } else {
      headers = ["No.", "Name", "Amount USD", "Amount KHR", "Payment Method", "Note"];
      rows = guests.map((g, index) => [
        index + 1,
        `"${g.name}"`,
        g.amountUsd,
        g.amountKhr,
        g.paymentMethod === 'cash' ? "Cash" : g.paymentMethod,
        `"${g.note || ""}"`
      ]);
      
      rows.push([], ["", "TOTAL", totals.usd.total, totals.khr.total, "", ""]);
      rows.push(["", "CASH IN-HAND", totals.usd.cash, totals.khr.cash, "", ""]);
      rows.push(["", "QR TRANSFER", totals.usd.qr, totals.khr.qr, "", ""]);
    }

    const csvContent = [headers, ...rows]
      .map(e => e.join(","))
      .join("\n");

    const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Banhchi_${event.title.replace(/\s+/g, '_')}_${type}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Exported ${type} list`);
  };
 
  const handlePrint = () => {
    window.print();
  };

  const handleThankYou = (guest: Guest) => {
    if (!event) return;
    
    let parts = [];
    if (guest.amountUsd > 0) parts.push(`$${guest.amountUsd}`);
    if (guest.amountKhr > 0) parts.push(`${guest.amountKhr.toLocaleString()} ៛`);
    
    const amountStr = parts.join(" និង ");
    const textToCopy = language === 'kh' 
      ? `សូមអរគុណ ${guest.name} ដែលបានចូលរួមកម្មវិធី "${event.title}" និងបានឧបត្ថម្ភ${amountStr ? `ចំនួន ${amountStr}` : ''}។` 
      : `Thank you ${guest.name} for attending "${event.title}" ${amountStr ? `with a contribution of ${amountStr}` : ''}.`;
    
    navigator.clipboard.writeText(textToCopy);
    toast.success(t('copied_thank_you'));
  };

  const formatUsd = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
  const formatKhr = (val: number) => new Intl.NumberFormat('km-KH').format(val);

  if (authLoading || !user) return null;
  if (!currentEventId) return <div className="text-center py-40 font-black text-slate-300 uppercase tracking-widest text-sm">Select an event</div>;
  if (loading) return <div className="flex h-[70vh] items-center justify-center p-8"><Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" /></div>;
  if (!event) return <div className="text-center py-40 font-black text-slate-300">EVENT NOT FOUND</div>;

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 sm:gap-8 pb-8 sm:pb-12 border-b border-gray-200">
        <div className="flex items-start gap-3 sm:gap-5">
           <Button variant="outline" size="icon" onClick={() => router.back()} className="rounded-xl border-gray-200 h-10 w-10 sm:h-12 sm:w-12 hover:bg-gray-50 shrink-0">
              <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
           </Button>
           <div className="space-y-1 sm:space-y-2 overflow-hidden">
              <h1 className="text-xl sm:text-4xl font-black tracking-tighter text-gray-900 leading-tight sm:leading-none line-clamp-2">{event.title}</h1>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-widest">
                 <span className="text-primary">{t(event.category || "") || event.category}</span>
                 <div className="h-1 w-1 rounded-full bg-gray-200" />
                 <span>{formatDate(event.eventDate)}</span>
                 <div className="hidden sm:block h-1 w-1 rounded-full bg-gray-200" />
                 <a href={`/event/${event.id}`} target="_blank" className="text-primary hover:underline flex items-center gap-1.5 shrink-0">
                    {t('public_link')} <ExternalLink className="h-3 w-3" />
                 </a>
              </div>
           </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full lg:w-auto">
           <div className="flex-1 sm:flex-none">
              <Link href={`/admin/events/${event.id}/expenses`}>
                <Button variant="outline" size="lg" className="h-10 sm:h-12 w-full rounded-xl border-gray-200 bg-white hover:bg-gray-50 font-bold gap-2 text-[10px] uppercase tracking-widest px-4 sm:px-6">
                  <TrendingDown className="h-4 w-4 text-red-500" />
                  <span className="hidden xs:inline">{t('expenses')}</span>
                  <span className="xs:hidden">{t('expenses')}</span>
                </Button>
              </Link>
           </div>
           <div className="flex-1 sm:flex-none">
              <PublicSettingsDialog event={event} onRefresh={() => fetchData(false)} />
           </div>
           <div className="flex-1 sm:flex-none">
              <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="lg" className="h-10 sm:h-12 w-full rounded-xl border-gray-200 bg-white hover:bg-gray-50 font-bold gap-2 text-[10px] uppercase tracking-widest px-4 sm:px-6">
                      <Download className="h-4 w-4 text-gray-400" />
                      <span className="hidden xs:inline">{t('export')}</span>
                      <span className="xs:hidden">{t('export')}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="rounded-3xl p-3 border-none shadow-md w-64">
                    <DropdownMenuLabel className="font-black text-[10px] uppercase tracking-widest opacity-30 px-4 py-4">{t('reports')}</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => downloadCSV('full')} className="rounded-2xl p-4 gap-4 cursor-pointer hover:bg-gray-50">
                      <Download className="h-5 w-5 text-primary" />
                      <span className="font-bold text-sm">{t('full_report')}</span>
                    </DropdownMenuItem>
                     <DropdownMenuItem onClick={() => downloadCSV('invitation')} className="rounded-2xl p-4 gap-4 cursor-pointer hover:bg-gray-50">
                      <ListFilter className="h-5 w-5 text-gray-400" />
                      <span className="font-bold text-sm">{t('invitation_checklist')}</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="my-2 bg-gray-50" />
                    <DropdownMenuItem onClick={handlePrint} className="rounded-2xl p-4 gap-4 cursor-pointer hover:bg-gray-50">
                      <Printer className="h-5 w-5 text-primary" />
                      <span className="font-bold text-sm">{t('print_report') || "Print Report"}</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
              </DropdownMenu>
           </div>
            <div className="w-full sm:w-auto">
              <Sheet>
                 <SheetTrigger asChild>
                     <Button variant="outline" size="lg" className="h-12 w-full rounded-xl border-gray-200 bg-white hover:bg-gray-50 font-bold gap-2 text-[10px] uppercase tracking-widest px-4 sm:px-6">
                        <History className="h-4 w-4 text-primary" />
                        {t('activity') || "Activity"}
                     </Button>
                 </SheetTrigger>
                 <SheetContent className="sm:max-w-md p-0 border-none">
                    <SheetHeader className="sr-only">
                       <SheetTitle>{t('activity')}</SheetTitle>
                       <SheetDescription>{t('admin_audit_logs')}</SheetDescription>
                    </SheetHeader>
                    <AdminEventLogsFeed eventId={event.id} refreshKey={guests.length} />
                 </SheetContent>
              </Sheet>
            </div>
            <div className="w-full sm:w-auto">
               <AddGuestDialog event={event} onSuccess={() => fetchData(false)} />
            </div>
         </div>
      </div>

      {/* Stats Cards Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 no-print">
          {/* Grand Total Card */}
          <Card className="bg-zinc-900 p-6 rounded-2xl border-none shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                 <Wallet size={80} className="text-white" />
              </div>
              <div className="relative z-10 space-y-3">
                 <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/50">{t('grand_total')}</span>
                    <TrendingUp className="h-4 w-4 text-primary" />
                 </div>
                 <h2 className="text-3xl font-black text-white tracking-tighter">{guests.length} {t('guests')}</h2>
                 <div className="flex gap-4 text-[10px] font-bold text-white/40">
                    <span>{formatUsd(totals.usd.total)}</span>
                    <span className="h-3 w-px bg-white/10" />
                    <span>{formatKhr(totals.khr.total)} ៛</span>
                 </div>
              </div>
          </Card>
 
          {/* Estimated Value Card */}
          <Card className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
              <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{t('net_worth_usd')}</span>
                    <PieChart className="h-4 w-4 text-emerald-500" />
                  </div>
                 <h2 className="text-3xl font-black text-emerald-600 tracking-tighter">
                    {formatUsd(totals.usd.total + (totals.khr.total / 4000))}
                 </h2>
                 <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t('exchange_rate_info')}</p>
              </div>
          </Card>
 
           {/* Cash Subtotal Card */}
          <Card className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
              <div className="space-y-3">
                 <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{t('cash_subtotal')}</span>
                    <Wallet className="h-4 w-4 text-orange-400" />
                 </div>
                 <div className="space-y-0.5">
                    <h2 className="text-2xl font-black text-gray-900 tracking-tighter">{formatUsd(totals.usd.cash)}</h2>
                    <p className="text-sm font-bold text-gray-400 font-mono">{formatKhr(totals.khr.cash)} ៛</p>
                 </div>
              </div>
          </Card>
 
          {/* Bank Subtotal Card */}
          <Card className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
              <div className="space-y-3">
                 <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{t('bank_subtotal')}</span>
                    <Building2 className="h-4 w-4 text-blue-500" />
                 </div>
                 <div className="space-y-0.5">
                    <h2 className="text-2xl font-black text-gray-900 tracking-tighter">{formatUsd(totals.usd.qr)}</h2>
                    <p className="text-sm font-bold text-gray-400 font-mono">{formatKhr(totals.khr.qr)} ៛</p>
                 </div>
              </div>
          </Card>
      </div>
 
      {/* Guest List Management */}
      <div className="space-y-6 bg-white p-4 sm:p-8 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex flex-col gap-4 px-2">
           {/* Search */}
            <div className="relative w-full sm:max-w-xs">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
               <Input 
                 placeholder={t('search_placeholder')}
                 className="h-12 sm:h-11 pl-11 rounded-xl border-gray-200 bg-white font-bold text-base sm:text-sm"
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
               />
            </div>

           {/* Filters Row */}
           <div className="flex flex-wrap items-center gap-3">
             {/* Payment Method Filter */}
               <Select value={filterPaymentMethod} onValueChange={setFilterPaymentMethod}>
                 <SelectTrigger className="w-full sm:w-45 h-12 sm:h-10 rounded-xl border-gray-200 bg-white font-bold text-xs">
                  <div className="flex items-center gap-2">
                    <ListFilter className="h-3.5 w-3.5 text-gray-400" />
                    <SelectValue placeholder={t('payment')} />
                  </div>
                </SelectTrigger>
               <SelectContent className="rounded-xl">
                 <SelectItem value="all" className="font-bold text-xs">
                   {t('all_methods')}
                 </SelectItem>
                 <SelectItem value="cash" className="font-bold text-xs">
                   {t('cash')}
                 </SelectItem>
                 <SelectItem value="bank" className="font-bold text-xs">
                   {t('bank')}
                 </SelectItem>
               </SelectContent>
             </Select>

             {/* Location Filter */}
              {uniqueLocations.length > 0 && (
                <Select value={filterLocation} onValueChange={setFilterLocation}>
                  <SelectTrigger className="w-full sm:w-45 h-12 sm:h-10 rounded-xl border-gray-200 bg-white font-bold text-xs">
                   <div className="flex items-center gap-2">
                     <ListFilter className="h-3.5 w-3.5 text-gray-400" />
                     <SelectValue placeholder={t('location')} />
                   </div>
                  </SelectTrigger>
                  <SelectContent className="rounded-xl max-h-50">
                   <SelectItem value="all" className="font-bold text-xs">
                     {t('all_locations')}
                   </SelectItem>
                   {uniqueLocations.map((location) => (
                     <SelectItem key={location} value={location} className="font-bold text-xs">
                       {location}
                     </SelectItem>
                   ))}
                 </SelectContent>
               </Select>
             )}

             {/* Clear Filters Button */}
             {(filterPaymentMethod !== "all" || filterLocation !== "all") && (
               <Button
                 variant="ghost"
                 size="sm"
                 onClick={() => {
                   setFilterPaymentMethod("all");
                   setFilterLocation("all");
                 }}
                 className="h-10 px-3 text-xs font-bold text-gray-500 hover:text-gray-900"
               >
                 {t('clear')}
               </Button>
             )}

             {/* Guest Count */}
             <p className="ml-auto text-[10px] font-black uppercase tracking-widest text-gray-400">
               {filteredGuests.length} {t('guests')}
             </p>
           </div>
        </div>

        {filteredGuests.length === 0 ? (
          <div className="h-40 flex items-center justify-center text-center text-gray-200">
            <p className="font-black uppercase tracking-widest text-[10px]">{t('no_records_found')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredGuests.map((guest, index) => (
              <Card key={guest.id} className="relative p-6 rounded-3xl border border-gray-100 bg-white hover:shadow-lg hover:border-gray-200 transition-all duration-300 ease-in-out group">
                {/* Actions Dropdown - Top Right */}
                <div className="absolute top-4 right-4 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="rounded-2xl p-2 border-none shadow-md w-48">
                      <DropdownMenuItem onClick={() => handleThankYou(guest)} className="rounded-xl p-3 gap-3 cursor-pointer hover:bg-gray-50">
                        <MessageSquare className="h-4 w-4 text-orange-400" />
                        <span className="font-bold text-xs uppercase tracking-widest">{t('thank_you')}</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="rounded-xl p-3 gap-3 cursor-pointer hover:bg-gray-50">
                        <GuestHistoryDialog eventId={currentEventId} guest={guest} />
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-gray-50" />
                      <DropdownMenuItem onClick={() => setEditingGuest(guest)} className="rounded-xl p-3 gap-3 cursor-pointer hover:bg-gray-50">
                        <Pencil className="h-4 w-4 text-primary" />
                        <span className="font-bold text-xs uppercase tracking-widest">{t('edit')}</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDeleteGuest(guest.id)} className="rounded-xl p-3 gap-3 cursor-pointer text-destructive focus:text-destructive hover:bg-destructive/5">
                        <Trash2 className="h-4 w-4" />
                        <span className="font-bold text-xs uppercase tracking-widest">{t('delete')}</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Header: Serial Number + Name */}
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="inline-flex items-center justify-center min-w-8 h-6 px-2 rounded-md bg-primary text-white text-[10px] font-black shadow-sm shadow-primary/20">
                      {index + 1}
                    </span>
                    <h3 className="text-lg font-black text-gray-900 tracking-tight truncate">{guest.name}</h3>
                  </div>
                  {guest.location && (
                    <p className="text-xs text-gray-500 font-medium ml-9">{guest.location}</p>
                  )}
                </div>

                {/* Payment Amounts - Horizontal Layout */}
                <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
                  {/* USD */}
                  <div className="flex-1">
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">USD</div>
                    {guest.amountUsd > 0 ? (
                      <div className="text-xl font-black text-gray-900">{formatUsd(guest.amountUsd)}</div>
                    ) : (
                      <div className="text-xl font-bold text-gray-200">-</div>
                    )}
                  </div>
                  {/* Divider */}
                  <div className="h-10 w-px bg-gray-200"></div>
                  {/* KHR */}
                  <div className="flex-1">
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">KHR</div>
                    {guest.amountKhr > 0 ? (
                      <div className="text-xl font-black text-gray-900">{formatKhr(guest.amountKhr)} ៛</div>
                    ) : (
                      <div className="text-xl font-bold text-gray-200">-</div>
                    )}
                  </div>
                </div>

                {/* Footer: Payment Method + Note */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      {t('payment_method')}
                    </span>
                    <span className={cn(
                      "inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider",
                      guest.paymentMethod === 'cash' 
                        ? "bg-green-500 text-white" 
                        : "bg-blue-500 text-white"
                    )}>
                      {guest.paymentMethod === 'cash' ? t('cash') : guest.paymentMethod}
                    </span>
                  </div>
                  {guest.note && (
                    <p className="text-xs text-gray-400 line-clamp-2 pt-2">{guest.note}</p>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
      
      {editingGuest && (
        <AddGuestDialog 
          event={event}
          guestToEdit={editingGuest}
          onClose={() => setEditingGuest(null)}
          onSuccess={fetchData}
          trigger={<span className="hidden"/>}
        />
      )}
 
      {/* Print View Only (Hidden on screen) */}
      <div className="hidden print:block p-8">
         <div className="text-center mb-12">
            <h1 className="text-4xl font-black mb-2">{event.title}</h1>
            <p className="text-lg font-bold text-gray-500 uppercase tracking-widest">{formatDate(event.eventDate)}</p>
            <div className="mt-8 grid grid-cols-2 gap-8 border-y-2 border-black py-8">
               <div>
                  <p className="text-xs font-black uppercase mb-1">Total USD</p>
                  <p className="text-3xl font-black">{formatUsd(totals.usd.total)}</p>
               </div>
               <div>
                  <p className="text-xs font-black uppercase mb-1">Total KHR</p>
                  <p className="text-3xl font-black">{formatKhr(totals.khr.total)} ៛</p>
               </div>
            </div>
         </div>
 
         <table className="w-full border-collapse">
            <thead>
               <tr className="border-b-2 border-black">
                  <th className="text-left py-4 font-black uppercase text-xs">No.</th>
                  <th className="text-left py-4 font-black uppercase text-xs">Guest Name</th>
                  <th className="text-left py-4 font-black uppercase text-xs">Location</th>
                  <th className="text-right py-4 font-black uppercase text-xs">Amount USD</th>
                  <th className="text-right py-4 font-black uppercase text-xs">Amount KHR</th>
                  <th className="text-left py-4 font-black uppercase text-xs pl-8">Note</th>
               </tr>
            </thead>
            <tbody>
               {guests.map((g, i) => (
                  <tr key={g.id} className="border-b border-gray-200">
                     <td className="py-4 font-bold text-sm">{i + 1}</td>
                     <td className="py-4 font-black text-sm">{g.name}</td>
                     <td className="py-4 font-bold text-sm text-gray-500">{g.location || '-'}</td>
                     <td className="py-4 text-right font-black text-sm">{g.amountUsd > 0 ? formatUsd(g.amountUsd) : '-'}</td>
                     <td className="py-4 text-right font-black text-sm">{g.amountKhr > 0 ? formatKhr(g.amountKhr) : '-'}</td>
                     <td className="py-4 text-left text-xs font-medium text-gray-400 pl-8">{g.note || ''}</td>
                  </tr>
               ))}
            </tbody>
         </table>
         
         <div className="mt-12 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            Generated via Banhchi Digital Event Companion • {new Date().toLocaleDateString()}
         </div>
      </div>
    </div>
  );
}
