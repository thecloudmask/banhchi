"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { useParams } from "next/navigation";
import { getEventById } from "@/services/event.service";
import { getContentsByEventId, getContentById, Content } from "@/services/content.service";
import { Event } from "@/types";
import { useLanguage } from "@/providers/language-provider";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Loader2, Calendar, MapPin, ArrowLeft, Clock, Share2, Navigation, Lock, ArrowRight, Heart } from "lucide-react";
import { formatDateTime, cn } from "@/lib/utils";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import Image from "next/image";
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
      primary: "text-[#f41f4d]",
      accent: "bg-[#f41f4d]/10",
      bg: "bg-background",
      card: "bg-card border-border shadow-2xl",
      badge: "bg-[#f41f4d] text-white shadow-rose-500/20",
      icon: "text-[#f41f4d]",
      button: "bg-[#f41f4d] hover:bg-[#f41f4d]/90 shadow-rose-500/20",
    },
    buddhist: {
      primary: "text-orange-500",
      accent: "bg-orange-500/10",
      bg: "bg-background",
      card: "bg-card border-border shadow-2xl",
      badge: "bg-orange-500 text-white shadow-orange-500/20",
      icon: "text-orange-500",
      button: "bg-orange-500 hover:bg-orange-600 shadow-orange-500/20",
    },
  };

  return themes[category || "default"] || {
    primary: "text-blue-500",
    accent: "bg-blue-500/10",
    bg: "bg-background",
    card: "bg-card border-border shadow-2xl",
    badge: "bg-slate-700 text-white shadow-slate-500/10",
    icon: "text-blue-500",
    button: "bg-blue-500 hover:bg-blue-600 shadow-blue-500/20",
  };
};

export default function PublicEventClient() {
  const params = useParams();
  const rawId = params.id;
  const eventId = Array.isArray(rawId) ? rawId[0] : (rawId as string | undefined);
  const { t, language } = useLanguage();
  
  const [event, setEvent] = useState<Event | null>(null);
  const [content, setContent] = useState<Content | null>(null);
  const [relatedContents, setRelatedContents] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [pin, setPin] = useState("");
  const [unlocking, setUnlocking] = useState(false);
  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!eventId) return;
      
      try {
        setLoading(true);
        // Try fetching as event first
        const eventData = await getEventById(eventId);
        
        if (eventData) {
            const contentsData = await getContentsByEventId(eventId);
            setEvent(eventData);
            setRelatedContents(contentsData || []);
            
            if (contentsData && contentsData.length > 0) {
              // If we are at the event root, show the first content (usually the agenda/main story)
              setContent(contentsData[0]);
              setIsLocked(contentsData[0].status === 'draft');
            }
        } else {
            // If not event, try fetching as content
            const contentData = await getContentById(eventId);
            if (contentData) {
              setContent(contentData);
              setIsLocked(contentData.status === 'draft');
              
              if (contentData.eventId) {
                const [eData, cData] = await Promise.all([
                  getEventById(contentData.eventId),
                  getContentsByEventId(contentData.eventId)
                ]);
                setEvent(eData);
                setRelatedContents(cData || []);
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

  // Create a virtual content object if it's a ceremony event but no explicit content post exists
  // This allows the premium wedding/agenda layouts to show even if only the event details are filled
  const effectiveContent = useMemo(() => {
    if (content) return content;
    if (event && ['wedding', 'buddhist', 'funeral', 'memorial', 'inauguration', 'custom'].includes(event.category || "")) {
      return {
        id: `v-${event.id}`,
        title: event.title,
        type: event.category === 'buddhist' ? 'agenda' : (event.category === 'custom' ? 'article' : event.category),
        contentData: event.extraData || {},
        status: 'published',
        createdAt: event.createdAt,
        updatedAt: event.createdAt,
        eventId: event.id,
        body: event.description || "",
      } as unknown as Content;
    }
    return null;
  }, [content, event]);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setUnlocking(true);
    setTimeout(() => {
      if (pin === "1234") {
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
      <Loader2 className="h-12 w-12 animate-spin text-[#f41f4d] mb-6 opacity-60" />
      <span className="text-muted-foreground font-black uppercase tracking-[0.2em] text-xs">{t('loading')}</span>
    </div>
  );

  if (!eventId || (!event && !content)) return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="text-center space-y-8 animate-in fade-in zoom-in duration-700">
        <div className="h-24 w-24 bg-card border border-border rounded-3xl flex items-center justify-center mx-auto mb-6 text-muted-foreground">
          <Calendar className="h-10 w-10" />
        </div>
        <h2 className="text-2xl font-black text-foreground uppercase tracking-tight">{t('not_found')}</h2>
        <Link href="/">
          <Button variant="outline" className="h-14 px-8 rounded-2xl border-border bg-card text-muted-foreground hover:bg-accent hover:text-foreground uppercase font-black text-xs tracking-widest shadow-xl">
            {t('back_to_home')}
          </Button>
        </Link>
      </div>
    </div>
  );

  if (isLocked) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 sm:p-12 font-kantumruy">
        <Card className="w-full max-w-lg rounded-[2.5rem] bg-card border border-border shadow-2xl p-10 sm:p-16 text-center animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="mb-10">
            <div className="h-20 w-20 bg-muted/50 border border-[#f41f4d]/20 rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 text-[#f41f4d] shadow-xl shadow-rose-500/10">
              <Lock className="h-10 w-10" />
            </div>
            <h1 className="text-2xl font-black text-foreground uppercase tracking-tight mb-2">{t('content_protected')}</h1>
            <p className="text-muted-foreground text-xs uppercase tracking-widest font-bold">Encrypted Data Access Required</p>
          </div>
          <form onSubmit={handleUnlock} className="space-y-6">
            <div className="space-y-2 text-left">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Access PIN</label>
              <Input 
                type="password"
                placeholder="••••"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="h-16 text-center text-3xl font-black rounded-2xl bg-muted/50 border-border text-foreground placeholder:text-muted-foreground/30 focus:border-[#f41f4d] focus:ring-[#f41f4d]/20"
                maxLength={4}
              />
            </div>
            <Button className="w-full h-16 rounded-2xl font-black bg-[#f41f4d] hover:bg-[#f41f4d]/90 shadow-xl shadow-rose-500/20 text-white uppercase tracking-widest text-xs" disabled={unlocking}>
              {unlocking ? <Loader2 className="h-4 w-4 animate-spin" /> : t('enter')}
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  const isAgenda = effectiveContent?.type === 'agenda' || effectiveContent?.type === 'wedding' || effectiveContent?.type === 'funeral';

  if (effectiveContent) {
    return (
      <div className="min-h-screen bg-background text-foreground selection:bg-[#f41f4d]/20 overflow-x-hidden transform-gpu font-kantumruy">
        <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border h-16 sm:h-20">
          <div className="container mx-auto px-6 sm:px-12 h-full flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="h-12 w-48 sm:h-14 sm:w-64 relative items-center justify-center overflow-hidden transition-all group-hover:scale-105">
                <Image 
                  src="/SIDETH-THEAPKA.png" 
                  alt="Logo" 
                  fill
                  className="object-contain object-left dark:brightness-200" 
                  priority
                />
              </div>
            </Link>
            <div className="flex items-center gap-3 sm:gap-4">
              <ThemeToggle />
              <LanguageSwitcher />
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleShare} 
                className="rounded-xl h-10 w-10 sm:h-12 sm:w-12 bg-muted/50 border border-border hover:bg-muted text-foreground transition-all hover:scale-105"
              >
                <Share2 className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-6 sm:px-12 py-24 sm:py-32 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="max-w-4xl mx-auto space-y-24 sm:space-y-32">
            {isAgenda ? (
              <AgendaRenderer content={effectiveContent} event={event!} theme={theme} />
            ) : (
              <ArticleRenderer content={effectiveContent} event={event!} theme={theme} />
            )}

            {/* Related Contents Section */}
            {relatedContents.filter(c => c.id !== content?.id).length > 0 && (
              <div className="space-y-12 sm:space-y-20 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300">
                 <div className="flex flex-col items-center gap-6 text-center">
                    <div className="h-1.5 w-16 bg-primary rounded-full" />
                    <div className="space-y-2">
                       <h3 className="text-xl sm:text-3xl font-black text-foreground uppercase tracking-widest leading-none">
                          {language === 'kh' ? 'អត្ថបទ និងរឿងរ៉ាវពាក់ព័ន្ធ' : 'Related Stories'}
                       </h3>
                       <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em]">
                          {language === 'kh' ? 'ស្វែងយល់បន្ថែមអំពីកម្មវិធីនេះ' : 'Discover more about this event'}
                       </p>
                    </div>
                 </div>

                 <div className="grid gap-10 sm:grid-cols-2">
                    {relatedContents.filter(c => c.id !== content?.id).map((item) => (
                      <Link key={item.id} href={`/event/${item.id}`} className="group">
                        <Card className="h-full overflow-hidden border-border bg-card/40 backdrop-blur-xl hover:bg-card hover:border-primary/20 transition-all duration-700 hover:shadow-[0_20px_50px_rgba(244,31,77,0.1)] hover:-translate-y-2 rounded-[2.5rem]">
                           <CardContent className="p-0 flex flex-col h-full">
                             <div className="aspect-4/3 relative overflow-hidden bg-muted/20">
                               {item.thumbnail ? (
                                 <Image src={item.thumbnail} alt={item.title} fill className="object-cover transition-transform duration-1000 group-hover:scale-105" />
                               ) : (
                                 <div className="absolute inset-0 bg-muted/50 flex items-center justify-center">
                                    <Heart className="h-12 w-12 text-primary/5" />
                                 </div>
                               )}
                               <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700" />
                               <div className="absolute top-4 right-4">
                                  <div className="bg-primary/90 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg">
                                     {item.type}
                                  </div>
                               </div>
                             </div>
                             <div className="p-10 space-y-5 flex-1 flex flex-col">
                                <div className="flex items-center gap-3 text-[10px] font-bold text-muted-foreground/60 uppercase tracking-[0.2em]">
                                   <Calendar className="h-3.5 w-3.5 text-primary" />
                                   <span>{formatDateTime(item.createdAt)}</span>
                                </div>
                                <h4 className="text-xl sm:text-2xl font-black text-foreground leading-tight group-hover:text-primary transition-colors line-clamp-2">
                                   {item.title}
                                </h4>
                                <p className="text-sm text-muted-foreground font-medium line-clamp-3 leading-relaxed opacity-60 flex-1">
                                   {item.description}
                                </p>
                                <div className="pt-4 flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-widest group-hover:gap-4 transition-all">
                                   <span>{language === 'kh' ? 'អានបន្ថែម' : 'Read Full Story'}</span>
                                   <ArrowRight className="h-3.5 w-3.5" />
                                </div>
                             </div>
                           </CardContent>
                         </Card>
                      </Link>
                    ))}
                 </div>
              </div>
            )}
          </div>
        </main>

         <footer className="border-t border-border bg-card py-16 text-center relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-[#f41f4d]/5 blur-[100px] pointer-events-none" />
          <div className="container relative z-10">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground mb-2">
              © {new Date().getFullYear()} SIDETH THEAPKA
            </p>
            <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">
              Digital Event Solutions Powered by Banhchi
            </p>
          </div>
        </footer>
      </div>
    );
  }

  // Fallback: If it's an Event without linked Content
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 sm:p-12 selection:bg-[#f41f4d]/20 transition-all font-kantumruy">
      <div className="w-full max-w-xl text-center space-y-12 animate-in fade-in zoom-in slide-in-from-bottom-10 duration-1000">
        <div className="h-32 w-32 bg-card rounded-[2.5rem] shadow-2xl border border-border flex items-center justify-center mx-auto mb-10 relative group transition-all hover:rotate-[-5deg] hover:scale-110 isolate">
          <div className="absolute inset-x-2 inset-y-2 bg-[#f41f4d]/5 rounded-[2.2rem] -z-1" />
          <Calendar className="h-14 w-14 text-[#f41f4d] relative z-10" />
        </div>
        
        <div className="space-y-6">
          <h1 className={cn(
            "text-3xl sm:text-5xl font-black text-foreground tracking-tight leading-tight px-4",
            language === 'kh' ? 'font-kantumruy leading-[1.6]' : ''
          )}>
            {event?.title}
          </h1>
          <div className="h-1.5 w-16 bg-[#f41f4d] mx-auto rounded-full" />
          <p className="text-muted-foreground font-bold text-[11px] sm:text-sm uppercase tracking-[0.25em] leading-relaxed px-8">
            {language === 'kh' ? 'កាលវិភាគ និងព័ត៌មានលម្អិតសាធារណៈជន មិនទាន់ត្រូវបានផ្សព្វផ្សាយនៅឡើយទេ' : 'The public schedule and event details have not been published yet.'}
          </p>
        </div>

        <div className="bg-card p-10 sm:p-14 rounded-[3rem] shadow-2xl border border-border flex flex-col items-stretch gap-10 w-full relative group transition-all hover:shadow-rose-500/5 hover:-translate-y-1 overflow-hidden">
          <div className="absolute inset-0 bg-linear-to-br from-[#f41f4d]/5 to-transparent rounded-[3rem] opacity-0 group-hover:opacity-100 transition-all" />
          
          <div className="flex items-center gap-6 justify-center relative z-10">
            <div className="h-14 w-14 rounded-2xl bg-muted/50 flex items-center justify-center text-[#f41f4d] border border-border transition-all group-hover:bg-muted">
              <Clock className="h-7 w-7" />
            </div>
            <div className="text-left">
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none mb-2">{t('event_date')}</p>
              <p className="text-xl font-black text-foreground tracking-tight">{event && formatDateTime(event.eventDate)}</p>
            </div>
          </div>

          {event?.location && (
            <div className="pt-10 border-t border-border flex items-center gap-6 justify-center relative z-10">
              <div className="h-14 w-14 rounded-2xl bg-muted/50 flex items-center justify-center text-muted-foreground border border-border transition-all group-hover:bg-muted group-hover:text-[#f41f4d]">
                <MapPin className="h-7 w-7" />
              </div>
              <div className="text-left">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none mb-2">{t('location')}</p>
                <p className="text-base font-bold text-muted-foreground/80 line-clamp-1 group-hover:text-foreground transition-colors">{event.location}</p>
              </div>
            </div>
          )}
        </div>

        <div className="pt-12 flex flex-col items-center gap-10">
          <Link href="/">
            <Button variant="outline" className="h-16 px-12 rounded-2xl border-border bg-card font-black text-muted-foreground hover:text-foreground hover:border-[#f41f4d]/50 hover:bg-[#f41f4d]/10 transition-all shadow-xl uppercase text-xs tracking-widest">
              <ArrowLeft className="mr-4 h-4 w-4" />
              {t('back_to_home')}
            </Button>
          </Link>
          <div className="flex flex-col items-center gap-3 opacity-20 group">
            <div className="flex h-10 w-40 items-center justify-center overflow-hidden dark:brightness-200">
               <img src="/SIDETH-THEAPKA.png" alt="Logo" className="w-full h-full object-contain" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
