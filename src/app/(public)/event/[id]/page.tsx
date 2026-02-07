"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getEventById } from "@/services/event.service";
import { Event } from "@/types";
import { useLanguage } from "@/providers/language-provider";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Calendar, MapPin, ArrowLeft, Clock, Share2, Navigation, Image as ImageIcon, Smartphone, Plus, Lock, ArrowRight, ShieldCheck } from "lucide-react";
import { formatDate, cn } from "@/lib/utils";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import Image from "next/image";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
}

export default function PublicEventPage() {
  const params = useParams();
  const eventId = params.id as string;
  const { t, language } = useLanguage();
  
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: false });
  
  // PIN Protection State
  const [isLocked, setIsLocked] = useState(false);
  const [pin, setPin] = useState("");
  const [unlocking, setUnlocking] = useState(false);

  useEffect(() => {
    fetchData();
  }, [eventId]);

  useEffect(() => {
    if (!event) return;

    // Check if locked
    if (event.passcode) {
      const isUnlocked = sessionStorage.getItem(`unlocked_${event.id}`);
      if (!isUnlocked) {
        setIsLocked(true);
      }
    }

    const calculateTimeLeft = () => {
      if (!event || !event.eventDate) return;

      let eventDate: Date;
      const rawDate = event.eventDate;
      
      if (rawDate instanceof Date) {
        eventDate = rawDate;
      } else if (rawDate && typeof (rawDate as any).toDate === 'function') {
        eventDate = (rawDate as any).toDate();
      } else if (rawDate && (rawDate as any).seconds) {
        eventDate = new Date((rawDate as any).seconds * 1000);
      } else {
        eventDate = new Date(rawDate as any);
      }

      if (isNaN(eventDate.getTime())) return;

      const now = new Date();
      const difference = eventDate.getTime() - now.getTime();

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      setTimeLeft({ days, hours, minutes, seconds, isExpired: false });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [event]);

  const fetchData = async () => {
    try {
      const eventData = await getEventById(eventId);
      setEvent(eventData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === event?.passcode) {
      setUnlocking(true);
      setTimeout(() => {
        sessionStorage.setItem(`unlocked_${event.id}`, "true");
        setIsLocked(false);
        setUnlocking(false);
        toast.success(t('success'));
      }, 500);
    } else {
      toast.error(t('incorrect_pin'));
      setPin("");
    }
  };

  const addToCalendar = () => {
    if (!event || !event.eventDate) return;
    
    let date: Date;
    try {
      date = event.eventDate instanceof Date 
        ? event.eventDate 
        : (event.eventDate as any).toDate ? (event.eventDate as any).toDate() : new Date();
    } catch (e) {
      date = new Date();
    }

    const title = encodeURIComponent(event.title);
    const location = encodeURIComponent(event.location || "");
    const startTime = date.toISOString().replace(/-|:|\.\d\d\d/g, "");
    const endTime = new Date(date.getTime() + 4 * 60 * 60 * 1000).toISOString().replace(/-|:|\.\d\d\d/g, "");
    
    const url = `https://www.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startTime}/${endTime}&location=${location}#eventpage_6`;
    window.open(url, "_blank");
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: event?.title,
          text: `${t('invitation')}: ${event?.title}`,
          url: window.location.href,
        });
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success(t('link_copied'));
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
      <span className="text-muted-foreground font-medium">{t('loading')}</span>
    </div>
  );
  
  if (!event || event.status !== 'active') return (
    <div className="min-h-screen bg-secondary/30 flex flex-col items-center justify-center p-4">
      <div className="bg-card p-10 rounded-[2rem] shadow-sm text-center max-w-sm border border-border">
        <h2 className={`text-2xl font-bold mb-6 ${language === 'kh' ? 'font-moul' : ''}`}>{t('event_not_found')}</h2>
        <Link href="/">
          <Button variant="outline" className="rounded-xl h-12">
            <ArrowLeft className="mr-2 h-4 w-4" /> 
            {t('back_to_home')}
          </Button>
        </Link>
      </div>
    </div>
  );

  if (isLocked) {
    return (
      <div className="min-h-screen bg-secondary/20 flex flex-col items-center justify-center p-6 sm:p-12">
        <Card className="w-full max-w-lg rounded-3xl border-none shadow-xl overflow-hidden">
          <div className="bg-primary p-12 text-center relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-3xl -mr-32 -mt-32 rounded-full" />
             <div className="relative z-10 flex flex-col items-center">
                <div className="h-20 w-20 bg-background/20 backdrop-blur-md rounded-3xl flex items-center justify-center mb-8">
                   <Lock className="h-10 w-10 text-white" />
                </div>
                <h1 className={`text-3xl text-white font-black leading-tight ${language === 'kh' ? 'font-moul' : ''}`}>
                   {t('content_protected')}
                </h1>
                <p className="text-white/60 text-sm font-medium mt-4">
                   {t('enter_pin_desc')}
                </p>
             </div>
          </div>
          
          <CardContent className="p-10 sm:p-16">
             <form onSubmit={handleUnlock} className="space-y-8">
                <div className="flex justify-center gap-4">
                   <Input 
                      type="password"
                      inputMode="numeric"
                      maxLength={4}
                      value={pin}
                      onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                      placeholder="• • • •"
                      className="h-24 text-center text-5xl tracking-[0.5em] font-black rounded-3xl border-none bg-secondary/50 focus:bg-secondary focus:ring-8 focus:ring-primary/5 transition-all w-full max-w-60"
                      autoFocus
                   />
                </div>
                
                <Button 
                   size="xl"
                   disabled={pin.length < 4 || unlocking}
                   className="w-full h-18 rounded-[1.5rem] font-black text-xl shadow-2xl shadow-primary/20 scale-100 hover:scale-[1.02] active:scale-95 transition-all"
                >
                   {unlocking ? <Loader2 className="h-6 w-6 animate-spin" /> : (
                     <div className="flex items-center gap-3">
                        {t('enter_event')}
                        <ArrowRight className="h-6 w-6" />
                     </div>
                   )}
                </Button>
             </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-zinc-900 selection:bg-primary/10 overflow-x-hidden">

      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-zinc-100 transition-colors">
        <div className="container mx-auto max-w-7xl h-20 flex items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="h-10 w-10 bg-primary text-white rounded-xl flex items-center justify-center font-black shadow-sm group-hover:scale-105 transition-transform">B</div>
            <span className="font-black text-xl tracking-tighter">BANHCHI</span>
          </Link>
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <Button variant="ghost" size="icon" onClick={handleShare} className="rounded-xl h-10 w-10 bg-zinc-50 border border-zinc-100 hover:bg-zinc-100 shadow-sm transition-all">
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-7xl px-6 py-12 sm:py-24 relative z-10">
        <div className="space-y-12 sm:space-y-24">
          
          <section className="relative group">
            <div className="absolute inset-x-0 -top-20 -bottom-20 bg-zinc-50/50 rounded-[4rem] -z-10" />
            <div className="relative p-2 overflow-hidden rounded-[2.5rem] bg-white border border-zinc-100 shadow-sm">
               <div className="aspect-16/10 sm:aspect-video w-full rounded-[2rem] overflow-hidden shadow-sm relative">
                  {event.bannerUrl ? (
                    <Image 
                      src={event.bannerUrl} 
                      alt="" 
                      fill
                      priority
                      className="object-cover" 
                    />
                  ) : (
                    <div className="w-full h-full bg-zinc-100 flex items-center justify-center">
                       <ImageIcon className="h-20 w-20 text-zinc-300" />
                    </div>
                  )}
                  <div className="absolute top-6 right-6">
                     <Badge className="bg-white/90 backdrop-blur-sm text-zinc-900 border border-zinc-100 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm">
                        {event.status === 'active' ? t('active') : t('completed')}
                     </Badge>
                  </div>
               </div>

               <div className="p-8 sm:p-16 text-center">
                  <h1 className={cn(
                    "text-4xl sm:text-6xl font-black text-zinc-900 leading-[1.1] tracking-tighter mb-10",
                    language === 'kh' ? 'font-moul' : ''
                  )}>
                    {event.title}
                  </h1>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
                      <div className="p-6 rounded-2xl bg-zinc-50/50 border border-zinc-100/50 flex flex-col items-center hover:bg-zinc-50 transition-colors">
                         <Calendar className="h-4 w-4 text-primary mb-3" />
                         <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">{t('event_date')}</span>
                         <span className="text-base font-black">{formatDate(event.eventDate, language)}</span>
                      </div>
                      <div className="p-6 rounded-2xl bg-zinc-50/50 border border-zinc-100/50 flex flex-col items-center hover:bg-zinc-50 transition-colors">
                         <Clock className="h-4 w-4 text-primary mb-3" />
                         <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">{t('start_time')}</span>
                         <span className="text-base font-black">{event.eventTime || t('tba')}</span>
                      </div>
                      <div className="p-6 rounded-2xl bg-zinc-50/50 border border-zinc-100/50 flex flex-col items-center hover:bg-zinc-50 transition-colors">
                         <MapPin className="h-4 w-4 text-primary mb-3" />
                         <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">{t('location')}</span>
                         <span className="text-base font-black truncate w-full text-center px-2">{event.location || t('tba')}</span>
                      </div>
                   </div>

                   <div className="flex flex-wrap justify-center gap-4">
                      <Button size="xl" onClick={addToCalendar} className="h-14 rounded-2xl font-black px-10 shadow-sm hover:scale-[1.02] active:scale-95 transition-all">
                         <Plus className="h-5 w-5 mr-3" />
                         {t('save_to_calendar')}
                      </Button>
                      {(event.location || event.mapUrl) && (
                        <Button size="xl" variant="outline" asChild className="h-14 rounded-2xl border-zinc-200 bg-white font-black px-10 hover:bg-zinc-50 hover:scale-[1.02] active:scale-95 transition-all">
                          <a href={event.mapUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location || "")}`} target="_blank">
                            <Navigation className="h-5 w-5 mr-3" />
                            {t('get_directions')}
                          </a>
                        </Button>
                      )}
                   </div>
               </div>
            </div>
          </section>

          {/* Countdown - Refined */}
          {!timeLeft.isExpired && event.status === 'active' && (
            <section className="relative p-12 sm:p-20 rounded-[3rem] bg-zinc-900 text-white shadow-xl text-center overflow-hidden">
               <div className="absolute inset-0 bg-linear-to-br from-primary/10 to-transparent pointer-events-none" />
               <div className="relative z-10">
                  <div className="inline-flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.4em] text-white/40 mb-12">
                     <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                     {t('countdown_title')}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-12">
                    {[
                      { label: t('days'), value: timeLeft.days },
                      { label: t('hours'), value: timeLeft.hours },
                      { label: t('minutes'), value: timeLeft.minutes },
                      { label: t('seconds'), value: timeLeft.seconds }
                    ].map((item, idx) => (
                      <div key={idx} className="flex flex-col items-center">
                        <span className="text-5xl sm:text-7xl font-black tracking-tighter text-white tabular-nums mb-2">
                          {String(item.value).padStart(2, '0')}
                        </span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/30">{item.label}</span>
                      </div>
                    ))}
                  </div>
               </div>
            </section>
          )}

          {/* Bank QR - Elegant */}
          {event.bankQrUrl && (
            <section className="text-center space-y-12">
                <div className="max-w-md mx-auto space-y-4">
                  <h2 className="text-3xl font-black tracking-tight text-zinc-900">{t('digital_gift_khqr')}</h2>
                  <p className="text-zinc-500 font-medium text-sm">{t('digital_gift_desc')}</p>
                </div>
                
                <div className="inline-block relative">
                   <div className="absolute -inset-4 bg-zinc-50 rounded-[3rem] -z-10" />
                   <div className="p-10 bg-white rounded-[2.5rem] shadow-sm border border-zinc-100">
                      <div className="relative h-60 w-60 mx-auto">
                         <Image 
                           src={event.bankQrUrl} 
                           alt="Bank QR" 
                           fill
                           className="rounded-2xl object-contain mx-auto" 
                         />
                         <div className="absolute inset-0 border border-zinc-100/50 rounded-2xl pointer-events-none" />
                       </div>
                      <div className="mt-8 flex flex-col items-center">
                        <div className="h-10 px-6 bg-zinc-50 rounded-full flex items-center justify-center border border-zinc-100">
                           <ShieldCheck className="h-3.5 w-3.5 text-primary mr-2" />
                           <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Verified KHQR</span>
                        </div>
                      </div>
                   </div>
                </div>
            </section>
          )}

          <footer className="pt-24 text-center space-y-10 border-t border-zinc-100">
              <Link href="/" className="inline-flex h-12 w-12 bg-zinc-900 text-white rounded-2xl items-center justify-center font-black shadow-lg hover:scale-110 transition-transform">B</Link>
              <div className="flex flex-col items-center gap-2">
                <p className="text-zinc-400 font-bold text-[10px] uppercase tracking-[0.4em]">{t('all_rights_reserved')}</p>
                <div className="h-1 w-12 bg-zinc-100 rounded-full" />
              </div>
          </footer>
        </div>
      </main>
    </div>
  );
}
