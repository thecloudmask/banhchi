"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { getEventById, getGuests, deleteGuest, subscribeToGuests } from "@/services/event.service";
import { Event, Guest } from "@/types";
import { AddGuestDialog } from "@/components/add-guest-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Search, Wallet, Trash2, Pencil, Download, Smartphone, MessageSquare, ListFilter, ExternalLink, MoreVertical, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { cn, formatDate } from "@/lib/utils";
import { useLanguage } from "@/providers/language-provider";
import { useAuth } from "@/providers/auth-provider";
import { GuestHistoryDialog } from "@/components/guest-history-dialog";
import { PublicSettingsDialog } from "@/components/public-settings-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export default function EventDetailPage() {
  const { user, loading: authLoading } = useAuth();
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;
  const { t, language } = useLanguage();
  
  const [event, setEvent] = useState<Event | null>(null);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const eventData = await getEventById(eventId);
      setEvent(eventData);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load event data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && eventId) {
      fetchData();
      
      const unsubscribe = subscribeToGuests(eventId, (updatedGuests) => {
        setGuests(updatedGuests);
      });
      
      return () => unsubscribe();
    }
  }, [user, eventId]);

  const handleDeleteGuest = async (guestId: string) => {
    if (!confirm(t('delete_guest_confirm'))) return;
    try {
      await deleteGuest(eventId, guestId);
      toast.success(t('guest_deleted'));
      fetchData();
    } catch (error) {
      toast.error(t('failed_delete_guest'));
    }
  };

  const filteredGuests = useMemo(() => {
    if (!searchQuery) return guests;
    const q = searchQuery.toLowerCase();
    return guests.filter(g => 
      g.name.toLowerCase().includes(q) || 
      (g.note?.toLowerCase().includes(q))
    );
  }, [guests, searchQuery]);

  const totals = useMemo(() => {
    const res = {
      usd: { total: 0, cash: 0, qr: 0 },
      khr: { total: 0, cash: 0, qr: 0 }
    };
    guests.forEach(g => {
      const isQR = g.paymentMethod === 'qr';
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
        g.paymentMethod === 'qr' ? "QR/Bank" : "Cash",
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
  if (loading) return <div className="flex h-[70vh] items-center justify-center p-8"><Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" /></div>;
  if (!event) return <div className="text-center py-40 font-black text-slate-300">EVENT NOT FOUND</div>;

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-12 border-b border-gray-200">
        <div className="flex items-start gap-5">
           <Button variant="outline" size="icon" onClick={() => router.back()} className="rounded-xl border-gray-200 h-12 w-12 hover:bg-gray-50">
              <ArrowLeft className="h-5 w-5 text-gray-400" />
           </Button>
           <div className="space-y-2">
              <h1 className="text-4xl font-black tracking-tighter text-gray-900 leading-none">{event.title}</h1>
              <div className="flex items-center gap-4 text-xs font-bold text-gray-400 uppercase tracking-widest">
                 <span>{formatDate(event.eventDate)}</span>
                 <div className="h-1 w-1 rounded-full bg-gray-200" />
                 <a href={`/event/${event.id}`} target="_blank" className="text-primary hover:underline flex items-center gap-2">
                    {t('public_link')} <ExternalLink className="h-3 w-3" />
                 </a>
              </div>
           </div>
        </div>
        <div className="flex items-center gap-3">
           <PublicSettingsDialog event={event} onRefresh={fetchData} />
           <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="lg" className="h-12 rounded-xl border-gray-200 bg-white hover:bg-gray-50 font-bold gap-2 text-[10px] uppercase tracking-widest px-6">
                  <Download className="h-4 w-4 text-gray-400" />
                  {t('export')}
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
              </DropdownMenuContent>
           </DropdownMenu>
           <AddGuestDialog event={event} onSuccess={fetchData} />
        </div>
      </div>

      {/* Totals Section - Simplified */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Card className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <div className="space-y-3">
                 <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{t('total_usd')}</span>
                    <Wallet className="h-4 w-4 text-gray-300" />
                 </div>
                 <h2 className="text-3xl font-black text-gray-900 tracking-tighter">{formatUsd(totals.usd.total)}</h2>
                 <div className="flex gap-4 text-[10px] font-bold text-gray-400">
                    <span>{t('cash')}: {formatUsd(totals.usd.cash)}</span>
                    <span className="h-3 w-px bg-gray-100" />
                    <span>{t('bank')}: {formatUsd(totals.usd.qr)}</span>
                 </div>
              </div>
          </Card>
 
          <Card className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <div className="space-y-3">
                 <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{t('total_riel')}</span>
                    <Smartphone className="h-4 w-4 text-gray-300" />
                 </div>
                 <h2 className="text-3xl font-black text-gray-900 tracking-tighter">{formatKhr(totals.khr.total)} ៛</h2>
                 <div className="flex gap-4 text-[10px] font-bold text-gray-400">
                    <span>{t('cash')}: {formatKhr(totals.khr.cash)} ៛</span>
                    <span className="h-3 w-px bg-gray-100" />
                    <span>{t('bank')}: {formatKhr(totals.khr.qr)} ៛</span>
                 </div>
              </div>
          </Card>
      </div>

      {/* Guest Table Section - Simpler */}
      <div className="space-y-6 bg-white p-4 sm:p-8 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
           <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
              <Input 
                placeholder={t('search_placeholder')}
                className="h-11 pl-11 rounded-xl border-gray-200 bg-white font-bold text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
           </div>
           <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{filteredGuests.length} {t('guests')}</p>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
               <TableRow className="hover:bg-transparent border-gray-100 h-14 bg-gray-50/30">
                <TableHead className="px-6 text-[11px] font-black uppercase tracking-widest text-gray-900">{t('name')}</TableHead>
                <TableHead className="text-right px-6 text-[11px] font-black uppercase tracking-widest text-gray-900">{t('usd')}</TableHead>
                <TableHead className="text-right px-6 text-[11px] font-black uppercase tracking-widest text-gray-900">{t('riel')}</TableHead>
                <TableHead className="w-16 px-6"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredGuests.map((guest, idx) => (
                <TableRow key={guest.id} className="group hover:bg-gray-50/50 border-gray-50 h-16">
                  <TableCell className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-gray-900 tracking-tight">{guest.name}</span>
                      {guest.note && <span className="text-[10px] text-gray-400 truncate max-w-37.5">{guest.note}</span>}
                    </div>
                  </TableCell>
                  <TableCell className="text-right px-6 py-4">
                      {guest.amountUsd > 0 ? (
                        <span className="font-bold text-gray-900 truncate">{formatUsd(guest.amountUsd)}</span>
                      ) : (
                        <span className="opacity-10">-</span>
                      )}
                  </TableCell>
                  <TableCell className="text-right px-6 py-4">
                      {guest.amountKhr > 0 ? (
                        <span className="font-bold text-gray-400 truncate">{formatKhr(guest.amountKhr)} ៛</span>
                      ) : (
                        <span className="opacity-10">-</span>
                      )}
                  </TableCell>
                  <TableCell className="text-right px-6 py-4">
                    <DropdownMenu>
                       <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-300 hover:text-gray-900 rounded-lg">
                             <MoreVertical className="h-4 w-4" />
                          </Button>
                       </DropdownMenuTrigger>
                        <DropdownMenuContent className="rounded-2xl p-2 border-none shadow-md w-48">
                          <DropdownMenuItem onClick={() => handleThankYou(guest)} className="rounded-xl p-3 gap-3 cursor-pointer hover:bg-gray-50">
                             <MessageSquare className="h-4 w-4 text-orange-400" />
                             <span className="font-bold text-xs uppercase tracking-widest">{t('thank_you')}</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild className="rounded-xl p-3 gap-3 cursor-pointer hover:bg-gray-50">
                             <GuestHistoryDialog eventId={eventId} guest={guest} />
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
                  </TableCell>
                </TableRow>
              ))}
              {filteredGuests.length === 0 && (
                <TableRow>
                   <TableCell colSpan={4} className="h-40 text-center text-gray-200">
                      <p className="font-black uppercase tracking-widest text-[10px]">{t('no_records_found')}</p>
                   </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
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
    </div>
  );
}
