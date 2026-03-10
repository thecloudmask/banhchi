"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, usePathname } from "next/navigation";
import { getEventById } from "@/services/event.service";
import { getContentsByEventId, getContentById, Content } from "@/services/content.service";
import { useAuth } from "@/providers/auth-provider";
import { Event } from "@/types";
import { useLanguage } from "@/providers/language-provider";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Calendar, MapPin, ArrowLeft, Clock, Share2, Navigation, Image as ImageIcon, Smartphone, Plus, Lock, ArrowRight, ShieldCheck, Users, FileText, LayoutDashboard, X, ChevronLeft, ChevronRight, Heart } from "lucide-react";
import { formatDate, cn } from "@/lib/utils";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { compressImage } from "@/lib/cloudinary";
import { Toaster } from "@/components/ui/sonner";
import { AgendaRenderer } from "../components/rendering/agenda-renderer";
import { ArticleRenderer } from "../components/rendering/article-renderer";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
}

const getCategoryTheme = (category?: string) => {
  const themes: Record<string, {
    primary: string,
    accent: string,
    bg: string,
    card: string,
    badge: string,
    icon: string,
    button: string,
  }> = {
    wedding: {
      primary: "text-rose-600",
      accent: "bg-rose-50",
      bg: "bg-rose-50/20",
      card: "bg-white border-rose-100 hover:border-rose-200 shadow-sm hover:shadow-md",
      badge: "bg-rose-500 text-white",
      icon: "text-rose-400 group-hover:text-rose-600",
      button: "bg-rose-600 hover:bg-rose-700 shadow-rose-200",
    },
    funeral: {
      primary: "text-zinc-900",
      accent: "bg-zinc-100",
      bg: "bg-zinc-50",
      card: "bg-white border-zinc-200 hover:border-zinc-300 shadow-sm hover:shadow-md",
      badge: "bg-zinc-800 text-white",
      icon: "text-zinc-500 group-hover:text-zinc-900",
      button: "bg-zinc-900 hover:bg-zinc-800 shadow-zinc-200",
    },
    merit_making: {
      primary: "text-orange-600",
      accent: "bg-orange-50",
      bg: "bg-orange-50/20",
      card: "bg-white border-orange-100 hover:border-orange-200 shadow-sm hover:shadow-md",
      badge: "bg-orange-500 text-white",
      icon: "text-orange-400 group-hover:text-orange-600",
      button: "bg-orange-600 hover:bg-orange-700 shadow-orange-200",
    },
    inauguration: {
      primary: "text-indigo-600",
      accent: "bg-indigo-50",
      bg: "bg-indigo-50/20",
      card: "bg-white border-indigo-100 hover:border-indigo-200 shadow-sm hover:shadow-md",
      badge: "bg-indigo-600 text-white",
      icon: "text-indigo-400 group-hover:text-indigo-600",
      button: "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200",
    },
    memorial: {
      primary: "text-slate-600",
      accent: "bg-slate-50",
      bg: "bg-slate-50/20",
      card: "bg-white border-slate-100 hover:border-slate-200 shadow-sm hover:shadow-md",
      badge: "bg-slate-500 text-white",
      icon: "text-slate-400 group-hover:text-slate-600",
      button: "bg-slate-600 hover:bg-slate-700 shadow-slate-200",
    },
  };

  return themes[category || "default"] || {
    primary: "text-blue-600",
    accent: "bg-blue-50",
    bg: "bg-zinc-50/50",
    card: "bg-white border-zinc-100 hover:border-zinc-200 shadow-sm hover:shadow-md",
    badge: "bg-zinc-900 text-white",
    icon: "text-zinc-300 group-hover:text-primary",
    button: "bg-zinc-900 hover:bg-zinc-800 shadow-zinc-200",
  };
};

export default function PublicEventClient() {
  const { user } = useAuth();
  const params = useParams();
  const pathname = usePathname();
  
  // Robustly determine eventId using both params and window location (fallback for static export)
  const [eventId, setEventId] = useState<string | null>(null);

  useEffect(() => {
    const extractId = () => {
      console.log('[Event Route Debug] params:', params, 'pathname:', pathname);
      
      // 1. Try to get from params
      if (params?.id) {
         const id = Array.isArray(params.id) ? params.id[0] : params.id;
         console.log('[Event Route Debug] Extracted from params:', id);
         if (id && id !== 'index.html') return id;
      }
      
      // 2. Fallback: extract from URL
      if (pathname) {
         const parts = pathname.split('/').filter(Boolean);
         const eventIndex = parts.indexOf('event');
         if (eventIndex !== -1 && parts[eventIndex + 1]) {
            const extractedId = parts[eventIndex + 1];
            console.log('[Event Route Debug] Extracted from pathname:', extractedId);
            if (extractedId && extractedId !== 'index.html') return extractedId;
         }
      }
      console.log('[Event Route Debug] No ID found, returning null');
      return null;
    };

    const id = extractId();
    console.log('[Event Route Debug] Final eventId:', id);
    // Always update eventId, even if null, to trigger re-renders on route changes
    setEventId(id);
  }, [params, pathname]);

  const { t, language } = useLanguage();
  
  const [event, setEvent] = useState<Event | null>(null);
  const [content, setContent] = useState<Content | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: false });
  
  const [isLocked, setIsLocked] = useState(false);
  const [pin, setPin] = useState("");
  const [unlocking, setUnlocking] = useState(false);
  const [photoIndex, setPhotoIndex] = useState<number | null>(null);
  const [photoList, setPhotoList] = useState<string[]>([]);

  const photoListMemo = useRef<string[]>([]);
  const giftRef = useRef<HTMLDivElement>(null);
  const theme = getCategoryTheme(event?.category);

  const handlePrev = () => {
    if (photoIndex === null) return;
    setPhotoIndex(prev => prev! > 0 ? prev! - 1 : photoList.length - 1);
  };

  const handleNext = () => {
    if (photoIndex === null) return;
    setPhotoIndex(prev => prev! < photoList.length - 1 ? prev! + 1 : 0);
  };

  useEffect(() => {
    if (eventId) {
      setLoading(true); // Reset loading when ID changes
      fetchData();
    }
  }, [eventId]);

  useEffect(() => {
    if (!event) return;

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
    if (!eventId) return;
    console.log("FETCHING: ID =", eventId);
    try {
      // 1. Try to find an Event with this ID
      const eventData = await getEventById(eventId);
      console.log("FETCHING: Event result =", eventData);
      
      if (eventData) {
          const contentsData = await getContentsByEventId(eventId);
          setEvent(eventData);
          if (contentsData && contentsData.length > 0) {
            setContent(contentsData[0]);
          }
      } else {
          console.log("FETCHING: Not an event. Checking for Content ID...");
          // 2. If not an event, maybe it receives a Content ID directly?
          const contentData = await getContentById(eventId);
          console.log("FETCHING: Content result =", contentData);
          
          if (contentData) {
             console.log("Found standalone content:", contentData);
             setContent(contentData);
             // Create a dummy event object to satisfy the UI requirements
             setEvent({
                 id: contentData.id,
                 title: contentData.title,
                 status: 'active',
                 eventDate: new Date(contentData.createdAt || Date.now()),
                 createdAt: contentData.createdAt,
                 updatedAt: contentData.updatedAt,
                 passcode: "",
                 bannerUrl: contentData.thumbnail,
                 location: "",
                 description: contentData.description
             } as any); 
          }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (String(pin) === String(event?.passcode)) {
      setUnlocking(true);
      setTimeout(() => {
        if (event) {
          sessionStorage.setItem(`unlocked_${event.id}`, "true");
          setIsLocked(false);
        }
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

  const scrollToGift = () => {
    giftRef.current?.scrollIntoView({ behavior: 'smooth' });
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

  if (!eventId) return <div className="min-h-screen bg-background flex items-center justify-center p-4"><span className="text-muted-foreground font-medium uppercase tracking-widest text-xs">{t('event_not_found')}</span></div>;
  
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

  const isAgenda = content?.type === 'agenda' || content?.type === 'wedding' || content?.type === 'funeral';
  const isArticle = content?.type === 'article';

  // --- DEFAULT EVENT VIEW MODE ---
  return (
    <div className="min-h-screen bg-white text-zinc-900 selection:bg-primary/10 overflow-x-hidden">

      <header className="sticky top-0 z-50 bg-white border-b border-zinc-100">
        <div className="container mx-auto max-w-7xl h-16 sm:h-20 flex items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="h-10 w-48 sm:h-12 sm:w-64 relative items-center justify-center overflow-hidden transition-transform group-hover:scale-[1.02]">
              <Image 
                src="/SIDETH-THEAPKA.png" 
                alt="Logo" 
                fill
                className="object-contain object-left" 
                priority
              />
            </div>
          </Link>
          <div className="flex items-center gap-3 sm:gap-4">
            <LanguageSwitcher />
            <Button variant="ghost" size="icon" onClick={handleShare} className="rounded-xl h-9 w-9 sm:h-10 sm:w-10 bg-zinc-50 border border-zinc-100 hover:bg-zinc-100 transition-all">
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-16 relative z-10">
        <div className="space-y-6 sm:space-y-16">
          
          <section className="relative group animate-in fade-in duration-300">
             <div className="relative overflow-hidden rounded-[2.5rem] sm:rounded-[3.5rem] bg-zinc-50 shadow-md transition-all duration-300">
                <div className="aspect-3/2 sm:aspect-video w-full relative">
                   {event.bannerUrl ? (
                     <Image 
                       src={compressImage(event.bannerUrl, 'banner')} 
                       alt={event.title}
                       fill
                       priority
                       className="object-cover transition-transform duration-500 group-hover:scale-105" 
                     />
                   ) : (
                     <div className="w-full h-full flex items-center justify-center bg-zinc-50">
                        <ImageIcon className="h-24 w-24 text-zinc-200" />
                     </div>
                   )}
                   <div className="absolute inset-0 bg-black/0 group-hover/hero:bg-black/10 transition-colors duration-1000" />
                   <div className="absolute top-6 right-6 sm:top-10 sm:right-10 z-10 transition-all duration-700 group-hover/hero:scale-110">
                      <Badge className="bg-white/40 backdrop-blur-3xl text-zinc-900 border border-white/40 px-6 sm:px-10 py-3 sm:py-4 rounded-[2rem] text-[11px] font-black uppercase tracking-[0.5em] shadow-2xl">
                         {event.status === 'active' ? t('active') : t('completed')}
                      </Badge>
                   </div>
                </div>
             </div>

            {/* Premium Header / Invitation Intro */}
            <div className="p-10 sm:p-24 text-center relative overflow-hidden rounded-[3rem] sm:rounded-[5rem] bg-white border border-amber-500/10 shadow-inner group/header">
                  {/* Subtle Royal Aura Background */}
                  <div className="absolute -top-32 -left-32 w-80 h-80 bg-amber-100/20 rounded-full blur-[100px] pointer-events-none" />
                  <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-rose-100/10 rounded-full blur-[100px] pointer-events-none" />
                  
                  {/* Title Section */}
                  <div className="relative space-y-12">
                     <div className="space-y-4">
                        <div className="flex items-center justify-center gap-4 mb-4">
                           <div className="h-px w-12 bg-linear-to-r from-transparent via-amber-400 to-transparent" />
                           <Heart className="h-5 w-5 text-amber-500 fill-amber-500 animate-pulse" />
                           <div className="h-px w-12 bg-linear-to-l from-transparent via-amber-400 to-transparent" />
                        </div>
                        <h1 className={cn(
                          "text-xl sm:text-2xl font-black text-amber-950 leading-[1.05] sm:leading-tight tracking-tight drop-shadow-sm",
                          language === 'kh' ? 'font-moul tracking-normal' : ''
                        )}>
                          {event.title}
                        </h1>
                     </div>

                     {/* Groom & Bride Names (Premium Overlay) */}
                     {content?.type === 'wedding' && content.contentData?.groom && content.contentData?.bride && (
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-14 bg-amber-50/50 py-10 px-12 rounded-[2.5rem] border border-amber-100 shadow-sm transition-all duration-700 hover:shadow-lg group/lineage cursor-default">
                           <div className="space-y-2 text-center">
                              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-900/40">{t('wedding_groom') || "Groom"}</span>
                              <h3 className="text-3xl sm:text-5xl font-moul text-amber-800 transition-colors group-hover/lineage:text-amber-600">{content.contentData.groom.name}</h3>
                           </div>
                           <div className="flex flex-col items-center gap-2">
                              <div className="h-10 w-px bg-amber-200 hidden sm:block" />
                              <Heart className="h-8 w-8 text-amber-500 fill-amber-500 animate-bounce" />
                              <div className="h-10 w-px bg-amber-200 hidden sm:block" />
                           </div>
                           <div className="space-y-2 text-center">
                              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-900/40">{t('wedding_bride') || "Bride"}</span>
                              <h3 className="text-3xl sm:text-5xl font-moul text-amber-800 transition-colors group-hover/lineage:text-amber-600">{content.contentData.bride.name}</h3>
                           </div>
                        </div>
                     )}

                     {/* Action Buttons with High-End Styling */}
                     <div className="flex flex-wrap justify-center gap-6 pt-8">
                        <Button 
                           size="xl" 
                           onClick={addToCalendar} 
                           className={cn(
                              "h-18 rounded-2xl font-black px-12 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.2)] hover:shadow-2xl hover:scale-[1.02] active:scale-95 transition-all text-white border-none bg-zinc-900 hover:bg-black",
                              event.category === 'wedding' ? "bg-amber-900 hover:bg-amber-950 shadow-amber-900/20" : ""
                           )}
                        >
                           <Plus className="h-5 w-5 mr-3 text-amber-400" />
                           {t('save_to_calendar')}
                        </Button>
                        <Button 
                           size="xl" 
                           variant="outline" 
                           onClick={scrollToGift} 
                           className="h-18 rounded-2xl border-amber-200 bg-white font-black px-12 hover:bg-amber-50 hover:border-amber-400 transition-all shadow-md group/gift"
                        >
                           <Heart className="h-5 w-5 mr-3 text-rose-500 group-hover:scale-125 transition-transform" />
                           {t('digital_gift_khqr')}
                        </Button>
                        {(event.location || event.mapUrl) && (
                          <Button size="xl" variant="outline" asChild className="hidden lg:flex h-18 rounded-2xl border-amber-200 bg-white font-black px-12 hover:bg-amber-50 hover:border-amber-400 transition-all shadow-md">
                            <a href={event.mapUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location || "")}`} target="_blank">
                              <Navigation className="h-5 w-5 mr-3 text-amber-600" />
                              {t('get_directions')}
                            </a>
                          </Button>
                        )}
                     </div>
                  </div>
               </div>
            </section>

          {/* Unified Content Section (Dynamic Renderers) */}
          {content && event && (
             <section className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
                {isAgenda ? (
                   <AgendaRenderer content={content} event={event} theme={theme} />
                ) : (
                   <ArticleRenderer content={content} event={event} theme={theme} />
                )}
             </section>
          )}

          {/* Countdown Section - High Contrast Premium White */}
          {!timeLeft.isExpired && event.status === 'active' && (
            <section className="relative p-8 sm:p-20 rounded-[3rem] sm:rounded-[4rem] bg-gray-200 text-zinc-900 shadow-[0_30px_70px_-20px_rgba(0,0,0,0.12)] text-center overflow-hidden border-2 border-zinc-50 animate-in fade-in zoom-in-95 duration-1000 delay-200">
               {/* Background Decorative Glows - Soft Primary Tints */}
               <div className="absolute inset-0 z-0">
                  <div className="absolute -top-32 -left-32 w-96 h-96 bg-primary/5 blur-[120px] rounded-full opacity-60" />
                  <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-rose-500/5 blur-[120px] rounded-full opacity-40" />
               </div>

               <div className="relative z-10 space-y-12">
                  <div className="flex flex-col items-center gap-4">
                    <div className={cn(
                      "inline-flex items-center gap-3 px-6 py-2 rounded-full bg-zinc-50 border border-zinc-200/60 shadow-xs",
                      theme.primary
                    )}>
                       <div className={cn("h-1.5 w-1.5 rounded-full animate-pulse shadow-[0_0_8px_rgba(0,0,0,0.1)]", theme.badge)} />
                       <span className={cn(
                         "text-xs sm:text-sm font-black uppercase tracking-[0.2em] text-zinc-600",
                         language === 'kh' ? 'font-moul tracking-normal pt-1' : ''
                       )}>
                        {t('countdown_title')}
                       </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8">
                     {[
                       { label: t('days'), value: timeLeft.days },
                       { label: t('hours'), value: timeLeft.hours },
                       { label: t('minutes'), value: timeLeft.minutes },
                       { label: t('seconds'), value: timeLeft.seconds }
                     ].map((item, idx) => (
                       <div key={idx} className="group relative">
                          <div className="absolute inset-0 bg-primary/20 rounded-[2.5rem] blur-2xl opacity-0 group-hover:opacity-40 transition-all duration-700" />
                          <div className="relative bg-zinc-50/50 border border-zinc-100 p-6 sm:p-10 rounded-[2rem] sm:rounded-[2.5rem] shadow-xs transition-all duration-500 hover:scale-[1.05] hover:bg-white hover:border-primary/30 hover:shadow-2xl">
                            <span className={cn(
                              "block text-4xl sm:text-6xl font-black tabular-nums mb-3 transition-colors duration-500",
                              language === 'kh' ? 'tracking-normal' : 'tracking-tighter',
                              "text-primary group-hover:text-primary-dark"
                            )}>
                              {String(item.value).padStart(2, '0')}
                            </span>
                            <span className={cn(
                              "text-xs sm:text-sm font-bold uppercase tracking-widest text-zinc-400 group-hover:text-zinc-600 transition-colors",
                              language === 'kh' ? 'font-moul text-xs' : ''
                            )}>
                              {item.label}
                            </span>
                          </div>
                       </div>
                     ))}
                  </div>
               </div>
            </section>
          )}

          {/* Event Gallery */}
          {event.galleryUrls && event.galleryUrls.length > 0 && (
             <section className="space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300 fill-mode-backwards">
                <div className="text-center space-y-4">
                  <h2 className={`text-4xl font-black tracking-tight text-zinc-900 ${language === 'kh' ? 'font-moul' : ''}`}>
                    {t('event_gallery')}
                  </h2>
                  <div className="h-1.5 w-16 bg-primary mx-auto rounded-full" />
                </div>
                
                <div className="columns-2 md:columns-3 lg:columns-4 gap-4 sm:gap-8 space-y-4 sm:space-y-8">
                  {event.galleryUrls.map((url, idx) => (
                      <div 
                        key={idx} 
                        onClick={() => { setPhotoList(event.galleryUrls || []); setPhotoIndex(idx); }}
                        className="break-inside-avoid relative rounded-[2rem] sm:rounded-[3rem] overflow-hidden border border-zinc-100 bg-white group cursor-zoom-in transition-all duration-700 hover:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] hover:-translate-y-2"
                      >
                        <div className={cn(
                          "relative w-full overflow-hidden",
                          idx % 5 === 0 ? "aspect-3/4" : idx % 5 === 1 ? "aspect-square" : idx % 5 === 2 ? "aspect-4/5" : idx % 5 === 3 ? "aspect-2/3" : "aspect-3/5"
                        )}>
                          <Image 
                            src={compressImage(url, 'large')} 
                            alt="" 
                            fill 
                            className="object-cover transition-transform duration-300 group-hover:scale-105" 
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                          <div className="absolute top-6 right-6 h-12 w-12 rounded-full bg-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100 shadow-lg border border-white/20">
                              <Plus className="h-5 w-5 text-white" />
                          </div>
                        </div>
                      </div>
                  ))}
                </div>
             </section>
          )}

          {/* Lightbox / Image Preview Modal */}
          {photoIndex !== null && (
            <div 
              className="fixed inset-0 z-100 bg-black/95 flex items-center justify-center p-4 sm:p-10 animate-in fade-in duration-300"
              onClick={() => setPhotoIndex(null)}
            >
              <button 
                className="absolute top-6 right-6 h-12 w-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all z-110 active:scale-95 shadow-lg scale-110"
                onClick={(e) => { e.stopPropagation(); setPhotoIndex(null); }}
              >
                <X className="h-6 w-6" />
              </button>

              {photoList.length > 1 && (
                <>
                  <button 
                    className="absolute left-4 sm:left-10 top-1/2 -translate-y-1/2 h-16 w-16 sm:h-24 sm:w-24 rounded-full bg-white/5 hover:bg-white/10 text-white flex items-center justify-center transition-all z-110 active:scale-90 group"
                    onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                  >
                    <ChevronLeft className="h-8 w-8 sm:h-12 sm:w-12 group-hover:-translate-x-2 transition-transform" />
                  </button>
                  <button 
                    className="absolute right-4 sm:right-10 top-1/2 -translate-y-1/2 h-16 w-16 sm:h-24 sm:w-24 rounded-full bg-white/5 hover:bg-white/10 text-white flex items-center justify-center transition-all z-110 active:scale-90 group"
                    onClick={(e) => { e.stopPropagation(); handleNext(); }}
                  >
                    <ChevronRight className="h-8 w-8 sm:h-12 sm:w-12 group-hover:translate-x-2 transition-transform" />
                  </button>
                </>
              )}
              
              <div className="relative w-full h-full max-w-7xl max-h-[85vh] flex flex-col items-center justify-center" onClick={(e) => e.stopPropagation()}>
                <div className="relative w-full h-full">
                  <Image 
                    src={photoList[photoIndex]} 
                    alt="Gallery Preview" 
                    fill
                    className="object-contain rounded-2xl shadow-lg animate-in zoom-in-95 duration-300 ease-out"
                    unoptimized
                  />
                </div>
                
                {photoList.length > 1 && (
                  <div className="mt-8 px-6 py-2 rounded-full bg-white/10 border border-white/10 text-white/50 text-[10px] font-black uppercase tracking-[0.4em]">
                    <span className="text-white">{photoIndex + 1}</span> / {photoList.length}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Bank QR */}
          {event.bankQrUrl && (
            <section ref={giftRef} className="text-center space-y-12 animate-in fade-in duration-700">
                <div className="max-w-md mx-auto space-y-4">
                  <h2 className="text-3xl font-black tracking-tight text-zinc-900">{t('digital_gift_khqr')}</h2>
                  <p className="text-zinc-500 font-medium text-sm">{t('digital_gift_desc')}</p>
                </div>
                
                <div className="inline-block relative">
                   <div className="absolute -inset-4 bg-zinc-50 rounded-[3rem] -z-10" />
                   <div className="p-10 bg-white rounded-[2.5rem] shadow-sm border border-zinc-100">
                      <div className="relative aspect-3/4 w-full max-w-sm mx-auto p-2">
                         <div className="relative w-full h-full rounded-2xl overflow-hidden">
                           <Image 
                             src={event.bankQrUrl} 
                             alt="Bank QR"
                             fill
                             className="object-cover" 
                           />
                         </div>
                         <div className="absolute inset-0 border border-zinc-100/50 rounded-3xl pointer-events-none" />
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

          <footer className="pt-24 pb-16 text-center space-y-12 border-t border-zinc-100">
              <Link href="/" className="inline-flex relative items-center justify-center transition-transform hover:scale-105">
                <div className="relative h-24 w-64 sm:h-32 sm:w-80">
                  <Image 
                    src="/SIDETH-THEAPKA.png" 
                    alt="Logo" 
                    fill
                    className="object-contain" 
                  />
                </div>
              </Link>
              <div className="flex flex-col items-center gap-4">
                <p className="text-zinc-400 font-bold text-[10px] uppercase tracking-[0.4em]">{t('all_rights_reserved')}</p>
                <div className="h-1 w-12 bg-zinc-100 rounded-full" />
              </div>
          </footer>
        </div>
      </main>

      <Toaster position="top-center" />

      {/* Mobile Action Dock */}
      <div className="sm:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-md">
        <div className="bg-white border border-zinc-200 rounded-3xl p-2.5 shadow-xl flex items-center justify-between gap-1.5">
            {(event?.location || event?.mapUrl) && (
              <Button asChild title={t('directions')} className={cn("flex-1 h-14 rounded-2xl font-black text-xs uppercase tracking-widest text-white border-none shadow-md", theme.button)}>
                <a href={event?.mapUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event?.location || "")}`} target="_blank">
                  <Navigation className="h-4 w-4 mr-2" />
                  {t('directions')}
                </a>
              </Button>
            )}
            <Button onClick={scrollToGift} variant="secondary" title={t('digital_gift_khqr')} className="h-14 w-14 rounded-2xl bg-rose-50 border-rose-100 text-rose-600 shrink-0">
               <Heart className="h-5 w-5" />
            </Button>
            <Button onClick={handleShare} variant="secondary" title={t('share_event')} className="h-14 w-14 rounded-2xl bg-zinc-50 border-zinc-100 text-zinc-900 shrink-0">
              <Share2 className="h-5 w-5" />
            </Button>
        </div>
      </div>
    </div>
  );
}
