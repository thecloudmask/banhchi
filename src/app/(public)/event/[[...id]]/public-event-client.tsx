"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getEventById } from "@/services/event.service";
import { getContentsByEventId, getContentById, Content } from "@/services/content.service";
import { Event } from "@/types";
import { useLanguage } from "@/providers/language-provider";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Calendar, MapPin, ArrowLeft, Clock, Share2, Navigation, Image as ImageIcon, Smartphone, Plus, Lock, ArrowRight, ShieldCheck, Users, FileText } from "lucide-react";
import { formatDate, cn } from "@/lib/utils";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { compressImage } from "@/lib/cloudinary";

interface TimeLeft {
// ... existing interface ...
// (Note: Skipping to the component body because I need to replace a large block)
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
}

export default function PublicEventClient() {
  const params = useParams();
  
  // Robustly determine eventId using both params and window location (fallback for static export)
  const [eventId, setEventId] = useState<string | null>(null);

  useEffect(() => {
    const extractId = () => {
      // 1. Try to get from params
      if (params?.id) {
         const id = Array.isArray(params.id) ? params.id[0] : params.id;
         if (id && id !== 'index.html') return id;
      }
      
      // 2. Fallback: extract from URL
      if (typeof window !== 'undefined') {
         const path = window.location.pathname;
         const parts = path.split('/').filter(Boolean);
         const eventIndex = parts.indexOf('event');
         if (eventIndex !== -1 && parts[eventIndex + 1]) {
            const extractedId = parts[eventIndex + 1];
            if (extractedId && extractedId !== 'index.html') return extractedId;
         }
      }
      return null;
    };

    const id = extractId();
    if (id) {
      setEventId(id);
    } else {
      // If we are at /event with no ID, maybe we are still loading or it's a direct visit
      // We'll wait a bit or let the error catch it later
    }
  }, [params]);

  const { t, language } = useLanguage();
  
  const [event, setEvent] = useState<Event | null>(null);
  const [content, setContent] = useState<Content | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: false });
  
  const [isLocked, setIsLocked] = useState(false);
  const [pin, setPin] = useState("");
  const [unlocking, setUnlocking] = useState(false);

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

  if (!eventId) return <div className="min-h-screen bg-background flex items-center justify-center p-4"><span className="text-muted-foreground font-medium uppercase tracking-widest text-xs">{t('event_not_found')}</span></div>;

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

  // --- CONTENT VIEW MODE (Poster / Invitation Style) ---
  if (content) {
    const isAgenda = content.type === 'agenda';

    return (
      <div className="min-h-screen bg-zinc-50 text-zinc-900 selection:bg-blue-100 overflow-x-hidden font-sans pb-20">
         <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-zinc-100">
            <div className="container mx-auto max-w-5xl h-14 sm:h-16 flex items-center justify-between px-4 sm:px-6">
              <Link href="/" className="flex items-center gap-2 group">
                <div className="h-10 w-32 items-center justify-center overflow-hidden">
                  <img src="/SIDETH-THEAPKA.png" alt="Logo" className="w-full h-full object-contain object-left" />
                </div>
                <span className="font-black text-base sm:text-lg tracking-tight text-blue-900 uppercase">{t('app_name')}</span>
              </Link>
              <div className="flex items-center gap-3 sm:gap-4">
                <LanguageSwitcher />
              </div>
            </div>
          </header>

          <main className={cn(
            "container mx-auto px-4 py-8 sm:py-12",
            isAgenda ? "max-w-3xl" : "max-w-4xl"
          )}>
             
             {isAgenda ? (
               /* THE POSTER CARD */
               <div className="bg-white p-2 sm:p-5 rounded-2xl shadow-2xl relative">
                  <div className="border-[1.5px] border-blue-900/20 p-1.5 rounded-xl">
                    <div className="border-[6px] border-double border-blue-900 p-6 sm:p-14 relative overflow-hidden bg-white paper-texture min-h-225 flex flex-col items-center rounded-lg">
                       
                       {/* Enhanced Ornamental Corners (Kbach Style Simulation) */}
                       {/* Top Left */}
                       <div className="absolute top-4 left-4 w-12 h-12 border-t-[5px] border-l-[5px] border-blue-900 rounded-tl-2xl z-20" />
                       <div className="absolute top-6 left-6 w-5 h-5 border-t-[3px] border-l-[3px] border-blue-500 rounded-tl-lg z-20 opacity-40" />
                       
                       {/* Top Right */}
                       <div className="absolute top-4 right-4 w-12 h-12 border-t-[5px] border-r-[5px] border-blue-900 rounded-tr-2xl z-20" />
                       <div className="absolute top-6 right-6 w-5 h-5 border-t-[3px] border-r-[3px] border-blue-500 rounded-tr-lg z-20 opacity-40" />
                       
                       {/* Bottom Left */}
                       <div className="absolute bottom-4 left-4 w-12 h-12 border-b-[5px] border-l-[5px] border-blue-900 rounded-bl-2xl z-20" />
                       <div className="absolute bottom-6 left-6 w-5 h-5 border-b-[3px] border-l-[3px] border-blue-500 rounded-bl-lg z-20 opacity-40" />

                       {/* Bottom Right */}
                       <div className="absolute bottom-4 right-4 w-12 h-12 border-b-[5px] border-r-[5px] border-blue-900 rounded-br-2xl z-20" />
                       <div className="absolute bottom-6 right-6 w-5 h-5 border-b-[3px] border-r-[3px] border-blue-500 rounded-br-lg z-20 opacity-40" />

                       {/* Decorative Side Accents */}
                       <div className="absolute top-1/2 left-2 -translate-y-1/2 w-1 h-32 bg-linear-to-b from-transparent via-blue-900/20 to-transparent rounded-full" />
                       <div className="absolute top-1/2 right-2 -translate-y-1/2 w-1 h-32 bg-linear-to-b from-transparent via-blue-900/20 to-transparent rounded-full" />

                     {/* Subtle Background Mark */}
                     {content.thumbnail && (
                        <div className="absolute inset-0 z-0 opacity-[0.03]">
                           <Image 
                             src={compressImage(content.thumbnail, 'banner')} 
                             alt="" 
                             fill 
                             className="object-cover" 
                           />
                        </div>
                     )}

                     <div className="relative z-10 w-full text-center space-y-12">
                        <div className="space-y-6">
                           <h1 className={cn(
                             "text-3xl sm:text-5xl font-black text-blue-900 leading-normal tracking-wide drop-shadow-sm",
                             language === 'kh' ? 'font-moul tracking-normal' : ''
                           )}>
                             {content.title}
                           </h1>

                           {content.description && (
                              <div className="text-blue-800 text-lg sm:text-xl font-bold max-w-2xl mx-auto leading-relaxed italic opacity-90 border-y py-4 border-blue-100/50">
                                 {content.description}
                              </div>
                           )}
                        </div>

                        {content.body && (
                          <div className="text-blue-900/90 text-left w-full px-4 sm:px-8 relative z-20">
                             <div 
                               className="content-body text-base sm:text-lg leading-loose font-medium"
                               dangerouslySetInnerHTML={{ __html: content.body }} 
                             />
                          </div>
                        )}

                        {content.agenda && content.agenda.length > 0 && (
                           <div className="w-full pt-8">
                              <h2 className="text-2xl font-black text-blue-900 mb-8 inline-block border-b-2 border-blue-900/30 pb-2 px-10 font-moul">
                                 {t('agenda_schedule')}
                              </h2>
                              
                              <div className="space-y-6 text-left max-w-xl mx-auto">
                                 {(content.agenda[0]?.items || []).map((item, idx) => (
                                    <div key={idx} className="flex gap-6 items-start text-blue-900 group">
                                       <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-900 flex items-center justify-center text-xs font-black shrink-0 shadow-sm border border-blue-100 group-hover:bg-blue-900 group-hover:text-white transition-colors">
                                          {idx + 1}
                                       </div>
                                       <div className="pt-2">
                                          <div className="font-black text-lg mb-1 leading-none">{item.time}</div>
                                          <div className="font-medium text-blue-900/70">{item.description}</div>
                                       </div>
                                    </div>
                                 ))}
                              </div>
                           </div>
                        )}

                        {content.committee && content.committee.length > 0 && (
                           <div className="w-full pt-8 pb-12">
                              <h2 className="text-2xl font-black text-blue-900 mb-10 inline-block border-b-2 border-blue-900/30 pb-2 px-10 font-moul">
                                 {t('committee_organizers')}
                              </h2>
                              
                              <div className="grid sm:grid-cols-2 gap-x-12 gap-y-10 text-blue-900 text-left max-w-2xl mx-auto">
                                 {content.committee.map((group, idx) => (
                                    <div key={idx} className="space-y-3 p-6 rounded-2xl bg-zinc-50/50 border border-zinc-100">
                                       <h3 className="font-black text-lg text-blue-900 font-moul border-b border-blue-100 pb-2">
                                          {group.role}
                                       </h3>
                                       <p className="font-bold leading-relaxed text-zinc-600">
                                          {group.members.join(", ")}
                                       </p>
                                    </div>
                                 ))}
                              </div>
                           </div>
                        )}

                        <div className="pt-12 w-full border-t border-blue-100 text-blue-800/60 text-[10px] font-black uppercase tracking-[0.3em]">
                           {event.location && (
                              <div className="flex items-center justify-center gap-2 mb-4">
                                 <MapPin className="h-4 w-4" />
                                 {event.location}
                              </div>
                           )}
                           <div className="flex flex-col items-center gap-4">
                              <div className="flex items-center gap-3">
                                 <div className="h-px w-8 bg-blue-100" />
                                 <span>{t('thank_you')}</span>
                                 <div className="h-px w-8 bg-blue-100" />
                              </div>
                              <div className="flex items-center justify-center gap-3">
                                 <div className="h-12 w-36 items-center justify-center overflow-hidden">
                                    <img src="/SIDETH-THEAPKA.png" alt="Logo" className="w-full h-full object-contain object-left" />
                                 </div>
                                 <div className="text-left leading-none">
                                    <div className="font-black text-xs tracking-tight text-blue-900 uppercase">BANHCHI</div>
                                    <div className="text-[8px] font-bold text-zinc-400">{t('digital_companion')}</div>
                                 </div>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
              </div>
             ) : (
               /* ARTICLE / BLOG LAYOUT */
               <article className="bg-white rounded-[2.5rem] shadow-sm border border-zinc-100 overflow-hidden">
                  {content.thumbnail && (
                    <div className="aspect-video w-full relative">
                       <Image 
                         src={compressImage(content.thumbnail, 'banner')} 
                         alt={content.title} 
                         fill 
                         className="object-cover" 
                       />
                    </div>
                  )}
                  <div className="p-8 sm:p-16 space-y-10">
                     <div className="space-y-6 text-center">
                        <Badge variant="outline" className="rounded-full px-4 py-1 text-[10px] font-black uppercase tracking-widest text-zinc-400">
                           {content.type}
                        </Badge>
                        <h1 className={cn(
                          "text-3xl sm:text-5xl font-black text-zinc-900 leading-tight tracking-tighter",
                          language === 'kh' ? 'font-moul' : ''
                        )}>
                          {content.title}
                        </h1>
                        <div className="flex items-center justify-center gap-4 text-zinc-400 text-xs font-bold uppercase tracking-widest">
                           <span>{formatDate(content.createdAt, language)}</span>
                           <span className="h-1 w-1 bg-zinc-200 rounded-full" />
                           <span>{t('written_by')} {content.author?.name || "Admin"}</span>
                        </div>
                     </div>

                     <div className="max-w-2xl mx-auto">
                        {content.description && (
                           <div className="text-xl font-medium text-zinc-500 leading-relaxed italic mb-12 border-l-4 border-zinc-100 pl-8">
                              {content.description}
                           </div>
                        )}

                        <div 
                          className="content-body prose prose-zinc max-w-none"
                          dangerouslySetInnerHTML={{ __html: content.body }} 
                        />
                     </div>

                     <div className="pt-16 border-t border-zinc-50 flex flex-col items-center gap-8">
                        <div className="flex items-center gap-4 p-6 rounded-3xl bg-zinc-50 border border-zinc-100">
                           <div className="h-12 w-12 bg-zinc-200 rounded-2xl overflow-hidden relative">
                              {content.author?.photoURL ? (
                                <Image src={content.author.photoURL} alt="" fill className="object-cover" />
                              ) : (
                                <Users className="h-6 w-6 m-3 text-zinc-400" />
                              )}
                           </div>
                           <div>
                              <div className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-0.5">{t('written_by')}</div>
                              <div className="font-black text-zinc-900">{content.author?.name || "Banhchi Admin"}</div>
                           </div>
                        </div>
                        <Button variant="ghost" className="rounded-xl h-12 text-zinc-400 font-bold" onClick={handleShare}>
                           <Share2 className="h-4 w-4 mr-2" /> {t('share_article')}
                        </Button>
                     </div>
                  </div>
               </article>
             )}
          </main>
      </div>
    );
  }

  // --- DEFAULT EVENT VIEW MODE ---
  return (
    <div className="min-h-screen bg-white text-zinc-900 selection:bg-primary/10 overflow-x-hidden">

      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-zinc-100 transition-colors">
        <div className="container mx-auto max-w-7xl h-16 sm:h-20 flex items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="h-10 w-32 sm:h-12 sm:w-40 items-center justify-center overflow-hidden transition-transform">
              <img src="/SIDETH-THEAPKA.png" alt="Logo" className="w-full h-full object-contain object-left" />
            </div>
            <span className="font-black text-lg sm:text-xl tracking-tighter uppercase">BANHCHI</span>
          </Link>
          <div className="flex items-center gap-3 sm:gap-4">
            <LanguageSwitcher />
            <Button variant="ghost" size="icon" onClick={handleShare} className="rounded-xl h-9 w-9 sm:h-10 sm:w-10 bg-zinc-50 border border-zinc-100 hover:bg-zinc-100 shadow-sm transition-all">
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-24 relative z-10">
        <div className="space-y-6 sm:space-y-24">
          
          <section className="relative group">
            <div className="absolute inset-x-0 -top-20 -bottom-20 bg-zinc-50/50 rounded-[4rem] -z-10" />
            <div className="relative p-2 overflow-hidden rounded-[2.5rem] bg-white border border-zinc-100 shadow-sm">
               <div className="aspect-16/10 sm:aspect-video w-full rounded-[2rem] overflow-hidden shadow-sm relative">
                  {event.bannerUrl ? (
                    <Image 
                      src={compressImage(event.bannerUrl, 'banner')} 
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

               <div className="p-6 sm:p-16 text-center">
                  <h1 className={cn(
                    "text-3xl sm:text-6xl font-black text-zinc-900 leading-[1.1] sm:leading-tight tracking-tight sm:tracking-tighter mb-6 sm:mb-10",
                    language === 'kh' ? 'font-moul tracking-normal' : ''
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

          {/* Countdown */}
          {!timeLeft.isExpired && event.status === 'active' && (
            <section className="relative p-12 sm:p-20 rounded-[3rem] bg-zinc-900 text-white shadow-xl text-center overflow-hidden">
               <div className="absolute inset-0 bg-linear-to-br from-primary/10 to-transparent pointer-events-none" />
               <div className="relative z-10">
                  <div className={cn(
                    "inline-flex items-center gap-3 text-[10px] font-black uppercase text-white/40 mb-12",
                    language === 'kh' ? 'tracking-normal' : 'tracking-[0.4em]'
                  )}>
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
                         <span className={cn(
                           "text-5xl sm:text-7xl font-black text-white tabular-nums mb-2",
                           language === 'kh' ? 'tracking-normal' : 'tracking-tighter'
                         )}>
                           {String(item.value).padStart(2, '0')}
                         </span>
                         <span className="text-[10px] font-black uppercase tracking-widest text-white/30">{item.label}</span>
                       </div>
                     ))}
                  </div>
               </div>
            </section>
          )}

          {/* Bank QR */}
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
                           src={compressImage(event.bankQrUrl, 'thumbnail')} 
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
              <Link href="/" className="inline-flex h-16 w-48 items-center justify-center overflow-hidden hover:scale-105 transition-transform">
                <img src="/SIDETH-THEAPKA.png" alt="Logo" className="w-full h-full object-contain" />
              </Link>
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
