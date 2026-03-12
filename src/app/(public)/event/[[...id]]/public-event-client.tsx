"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { useParams } from "next/navigation";
import { getEventById } from "@/services/event.service";
import { getContentsByEventId, getContentById, Content } from "@/services/content.service";
import { Event } from "@/types";
import { useLanguage } from "@/providers/language-provider";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Button } from "@/components/ui/button";
import { Loader2, Calendar, MapPin, ArrowLeft, Clock, Share2, Navigation, Lock, ArrowRight, Heart } from "lucide-react";
import { formatDate, cn } from "@/lib/utils";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { Toaster } from "@/components/ui/sonner";
import { AgendaRenderer } from "../components/rendering/agenda-renderer";
import { ArticleRenderer } from "../components/rendering/article-renderer";

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
  const params = useParams();
  // Handles both /event/[[...id]] (array) and /wedding/[id] etc (string)
  const rawId = params.id;
  const eventId = Array.isArray(rawId) ? rawId[0] : (rawId as string | undefined);
  const { t, language } = useLanguage();
  
  const [event, setEvent] = useState<Event | null>(null);
  const [content, setContent] = useState<Content | null>(null);
  const [loading, setLoading] = useState(true);
  const [pin, setPin] = useState("");
  const [unlocking, setUnlocking] = useState(false);
  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!eventId) return;
      
      try {
        setLoading(true);
        // 1. Try to find an Event with this ID
        const eventData = await getEventById(eventId);
        
        if (eventData) {
            // Find content reference for this event
            const contentsData = await getContentsByEventId(eventId);
            setEvent(eventData);
            if (contentsData && contentsData.length > 0) {
              setContent(contentsData[0]);
              setIsLocked(contentsData[0].status === 'draft'); // draft = locked in some sense, or use explicit pin logic if needed
            }
        } else {
            // 2. Fallback: maybe the ID is actually a Content ID
            const contentData = await getContentById(eventId);
            if (contentData) {
              setContent(contentData);
              setIsLocked(contentData.status === 'draft');
              // If content has an eventId, fetch event details for context
              if (contentData.eventId) {
                const eData = await getEventById(contentData.eventId);
                setEvent(eData);
              }
            }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [eventId]);

  const theme = useMemo(() => getCategoryTheme(event?.category), [event?.category]);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setUnlocking(true);
    // Simulate/Implement actual PIN check if needed
    setTimeout(() => {
      if (pin === "1234") { // Temporary mock PIN
        setIsLocked(false);
      } else {
        toast.error(t('invalid_pin'));
        setPin("");
      }
      setUnlocking(false);
    }, 1000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: content?.title || event?.title,
          text: content?.description || event?.title,
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

  if (!eventId || (!event && !content)) return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <h2 className="text-xl font-black mb-4 uppercase tracking-widest">{t('not_found')}</h2>
      <Link href="/"><Button variant="outline" className="rounded-xl">{t('back_to_home')}</Button></Link>
    </div>
  );

  if (isLocked) {
    return (
      <div className="min-h-screen bg-secondary/20 flex flex-col items-center justify-center p-6 sm:p-12">
        <Card className="w-full max-w-lg rounded-3xl border-none shadow-xl overflow-hidden">
          <CardContent className="p-10 sm:p-16">
             <div className="text-center mb-8">
                <Lock className="h-12 w-12 text-primary mx-auto mb-4" />
                <h1 className="text-2xl font-black">{t('content_protected')}</h1>
             </div>
             <form onSubmit={handleUnlock} className="space-y-6">
                <Input 
                  type="password"
                  placeholder="PIN"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  className="h-14 text-center text-2xl font-black rounded-2xl"
                />
                <Button className="w-full h-14 rounded-2xl font-black" disabled={unlocking}>
                   {unlocking ? <Loader2 className="h-4 w-4 animate-spin" /> : t('enter')}
                </Button>
             </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isAgenda = content?.type === 'agenda' || content?.type === 'wedding' || content?.type === 'funeral';

  // --- RENDER LOGIC ---
  if (content) {
    return (
      <div className="min-h-screen bg-slate-50/30 text-zinc-900 selection:bg-primary/10 overflow-x-hidden transform-gpu">
        <header className="sticky top-0 z-50 glass border-b border-white/40">
          <div className="container h-16 sm:h-20 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="h-10 w-48 sm:h-12 sm:w-64 relative items-center justify-center overflow-hidden transition-ultra group-hover:scale-[1.02]">
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
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleShare} 
                className="rounded-2xl h-10 w-10 sm:h-12 sm:w-12 bg-white/50 border border-white/60 hover:bg-white hover:shadow-xl transition-ultra"
              >
                <Share2 className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </header>

        <main className="container py-8 sm:py-20 animate-in fade-in slide-in-from-bottom-5 duration-1000">
          {isAgenda ? (
            <AgendaRenderer content={content} event={event!} theme={theme} />
          ) : (
            <ArticleRenderer content={content} event={event!} theme={theme} />
          )}
        </main>

        <footer className="border-t border-zinc-100 bg-zinc-50/50 py-12 sm:py-20 text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-300">
            © {new Date().getFullYear()} Banhchi Digital Event Companion
          </p>
        </footer>
        
        <Toaster position="bottom-center" />
      </div>
    );
  }

  // Fallback: If it's an Event without linked Content (Private/Internal Management Mode)
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 sm:p-12 selection:bg-primary/10 transition-ultra transform-gpu">
      <div className="w-full max-w-xl text-center space-y-12 animate-in fade-in zoom-in slide-in-from-bottom-10 duration-1000">
        <div className="h-32 w-32 bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200 flex items-center justify-center mx-auto mb-10 relative group border border-slate-100/50 transition-ultra hover:rotate-[-5deg] hover:scale-110">
          <div className="absolute inset-x-2 inset-y-2 bg-primary/5 rounded-[2.2rem]" />
          <Calendar className="h-14 w-14 text-primary relative z-10" />
        </div>
        
        <div className="space-y-6">
          <h1 className={cn(
            "text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight px-4",
            language === 'kh' ? 'font-kantumruy leading-[1.6]' : ''
          )}>
            {event?.title}
          </h1>
          <div className="h-2 w-16 bg-primary/20 mx-auto rounded-full" />
          <p className="text-slate-400 font-bold text-[11px] sm:text-sm uppercase tracking-[0.4em] leading-relaxed px-8">
            {language === 'kh' ? 'កាលវិភាគ និងព័ត៌មានលម្អិតសាធារណៈជន មិនទាន់ត្រូវបានផ្សព្វផ្សាយនៅឡើយទេ' : 'The public schedule and event details have not been published yet.'}
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-3xl p-10 sm:p-14 rounded-[3rem] shadow-xl border border-white flex flex-col items-stretch gap-10 w-full relative group transition-ultra hover:shadow-2xl hover:-translate-y-1">
          <div className="absolute inset-0 bg-linear-to-br from-primary/5 to-transparent rounded-[3rem] opacity-0 group-hover:opacity-100 transition-ultra" />
          
          <div className="flex items-center gap-6 justify-center relative z-10">
            <div className="h-14 w-14 rounded-2xl bg-slate-50 flex items-center justify-center text-primary shadow-inner border border-slate-100 transition-ultra group-hover:bg-white">
              <Clock className="h-7 w-7" />
            </div>
            <div className="text-left">
              <p className="text-[10px] font-black text-slate-400/60 uppercase tracking-widest leading-none mb-2">{t('event_date')}</p>
              <p className="text-xl font-black text-slate-800 tracking-tight">{formatDate(event!.eventDate, language)}</p>
            </div>
          </div>

          {event?.location && (
            <div className="pt-10 border-t border-slate-100/60 flex items-center gap-6 justify-center relative z-10">
              <div className="h-14 w-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 shadow-inner border border-slate-100 transition-ultra group-hover:bg-white group-hover:text-red-500">
                <MapPin className="h-7 w-7" />
              </div>
              <div className="text-left">
                <p className="text-[10px] font-black text-slate-400/60 uppercase tracking-widest leading-none mb-2">{t('location')}</p>
                <p className="text-base font-bold text-slate-600 line-clamp-1 group-hover:text-slate-900 transition-colors">{event.location}</p>
              </div>
            </div>
          )}
        </div>

        <div className="pt-12 flex flex-col items-center gap-8">
          <Link href="/">
            <Button variant="outline" className="rounded-[1.5rem] h-16 px-10 border-slate-200 bg-white font-black text-slate-500 hover:text-primary hover:border-primary/40 hover:bg-primary/5 transition-ultra shadow-sm hover:shadow-xl hover:-translate-y-0.5 uppercase text-xs tracking-widest">
              <ArrowLeft className="mr-4 h-4 w-4" />
              {t('back_to_home')}
            </Button>
          </Link>
          <div className="flex flex-col items-center gap-2 opacity-20">
            <p className="text-[10px] font-black uppercase tracking-[0.6em]">
              Banhchi
            </p>
            <p className="text-[8px] font-bold uppercase tracking-[0.3em]">Digital Event Companion</p>
          </div>
        </div>
      </div>
      <Toaster position="bottom-center" />
    </div>
  );
}
