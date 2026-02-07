"use client";

import Link from "next/link";
import { useLanguage } from "@/providers/language-provider";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Button } from "@/components/ui/button";
import { ArrowRight, LayoutDashboard, Calendar, ChevronLeft, ChevronRight, Loader2, LogIn } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getEvents } from "@/services/event.service";
import { Event } from "@/types";
import { useState, useEffect } from "react";
import { formatDate, cn } from "@/lib/utils";
import Image from "next/image";
import { useAuth } from "@/providers/auth-provider";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [featuredIndex, setFeaturedIndex] = useState(0);

  useEffect(() => {
    async function fetchEvents() {
      try {
        const data = await getEvents();
        const activeEvents = data.filter(e => e.status === 'active');
        setEvents(activeEvents); 
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    fetchEvents();
  }, []);

  useEffect(() => {
    if (events.length <= 1) return;
    const interval = setInterval(() => {
      setFeaturedIndex((prev) => (prev + 1) % events.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [events.length]);

  const nextSlide = () => setFeaturedIndex((prev) => (prev + 1) % events.length);
  const prevSlide = () => setFeaturedIndex((prev) => (prev - 1 + events.length) % events.length);

  const featuredEvent = events[featuredIndex];

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground selection:bg-primary/10">
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background">
        <div className="container mx-auto max-w-7xl flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
              B
            </div>
            <span className="text-xl font-bold tracking-tight text-foreground">Banhchi</span>
          </Link>
          <nav className="hidden md:flex gap-8 text-sm font-medium">
            <Link href="#events" className="text-muted-foreground hover:text-primary transition-colors">{t('events')}</Link>
            <Link href="#about" className="text-muted-foreground hover:text-primary transition-colors">About</Link>
          </nav>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            {user ? (
              <Link href="/admin">
                <Button size="sm" variant="outline" className="gap-2 border-zinc-200 hover:bg-zinc-50 rounded-xl transition-all">
                  <LayoutDashboard className="h-4 w-4" />
                  {t('dashboard')}
                </Button>
              </Link>
            ) : (
              <Link href="/login">
                <Button size="sm" variant="ghost" className="gap-2 opacity-50 hover:opacity-100 rounded-xl">
                  <LogIn className="h-4 w-4" />
                  Admin
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        {!loading && events.length > 0 && featuredEvent && (
          <section className="relative h-[500px] sm:h-[650px] overflow-hidden bg-zinc-950">
            <div className="absolute inset-0">
              {featuredEvent.bannerUrl && featuredEvent.bannerUrl !== "" ? (
                <Image 
                  src={featuredEvent.bannerUrl} 
                  alt={featuredEvent.title} 
                  fill
                  priority
                  className="object-cover opacity-50 grayscale-[0.2]"
                />
              ) : (
                <div className="h-full w-full bg-zinc-900" />
              )}
              {/* Sophisticated Cinematic Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/80 to-transparent opacity-80" />
            </div>

            {events.length > 1 && (
              <>
                <button
                  onClick={prevSlide}
                  className="absolute left-6 top-1/2 -translate-y-1/2 z-20 h-12 w-12 rounded-full bg-black/20 text-white hover:bg-black/40 border border-white/10 flex items-center justify-center"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  onClick={nextSlide}
                  className="absolute right-6 top-1/2 -translate-y-1/2 z-20 h-12 w-12 rounded-full bg-black/20 text-white hover:bg-black/40 border border-white/10 flex items-center justify-center"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}

            <div className="relative h-full container mx-auto max-w-7xl px-8 sm:px-12 flex items-end pb-16 sm:pb-24">
              <div className="max-w-3xl text-white" key={featuredIndex}>
                <div className="flex flex-wrap items-center gap-3 mb-8">
                  <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full border border-white/10 shadow-sm">
                    <span className={`h-2 w-2 rounded-full ${featuredEvent.status === 'active' ? 'bg-white animate-pulse' : 'bg-white/40'}`}></span>
                    <span className="text-[10px] uppercase font-black tracking-widest leading-none">{featuredEvent.status === 'active' ? t('active') : t('completed')}</span>
                  </div>
                  <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full border border-white/10 shadow-sm text-[10px] uppercase font-black tracking-widest leading-none">
                    <Calendar className="h-3.5 w-3.5 opacity-60" />
                    {formatDate(featuredEvent.eventDate, language)}
                  </div>
                </div>

                <h1 className={cn(
                  "text-4xl sm:text-5xl lg:text-6xl font-black mb-8 leading-tight tracking-tight",
                  language === 'kh' ? 'font-moul' : ''
                )}>
                  {featuredEvent.title}
                </h1>

                <Link href={`/event/${featuredEvent.id}`}>
                  <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold h-12 px-8 rounded-lg">
                    {t('view_event_details')}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                {events.length > 1 && (
                  <div className="flex gap-2 mt-8">
                    {events.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setFeaturedIndex(i)}
                        className={`h-1.5 rounded-full ${i === featuredIndex ? 'w-8 bg-white' : 'w-2 bg-white/30 hover:bg-white/50'}`}
                        aria-label={`Go to slide ${i + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {!loading && events.length === 0 && (
          <section className="relative px-4 py-32 text-center bg-secondary">
            <div className="mx-auto max-w-2xl">
              <div className="h-20 w-20 mx-auto mb-6 rounded-full bg-background border border-border flex items-center justify-center">
                <Calendar className="h-10 w-10 opacity-20" />
              </div>
              <h2 className="text-3xl font-bold mb-3">{t('no_events')}</h2>
              <p className="text-lg text-muted-foreground">{t('no_events_desc')}</p>
            </div>
          </section>
        )}

        {!loading && events.length > 0 && (
          <section id="events" className="py-20 bg-background">
            <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="text-center max-w-3xl mx-auto mb-16">
                <h2 className="text-4xl font-black tracking-tight mb-4">
                  {events.length === 1 ? t('featured_event') : t('all_events')}
                </h2>
                <p className="text-xl text-muted-foreground">
                  {events.length === 1 ? t('explore_complete_info') : t('browse_all_celebrations')}
                </p>
              </div>

              <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
                {events.map((event) => (
                  <Link href={`/event/${event.id}`} key={event.id} className="group block">
                    <Card className="h-full overflow-hidden border-zinc-100 bg-white rounded-[2rem] shadow-sm hover:shadow-md transition-all">
                      <div className="aspect-[16/10] w-full overflow-hidden bg-zinc-50 relative">
                {event.bannerUrl && event.bannerUrl !== "" ? (
                  <Image 
                    src={event.bannerUrl} 
                    alt={event.title} 
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full bg-zinc-50">
                    <Calendar className="h-16 w-16 opacity-10" />
                  </div>
                )}
                 <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                 <div className="absolute bottom-6 left-6 right-6">
                    <Badge className="bg-white/90 backdrop-blur-sm text-zinc-900 border border-zinc-100 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm">
                      {event.status === 'active' ? t('active') : t('completed')}
                    </Badge>
                 </div>
                      </div>
                      <CardHeader className="p-8">
                        <CardTitle className="text-2xl font-black text-zinc-900 line-clamp-2 hover:text-primary transition-colors mb-4 leading-tight">
                          {event.title}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-zinc-400">
                           <Calendar className="h-3.5 w-3.5 opacity-60" />
                           {formatDate(event.eventDate, language)}
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {loading && (
          <section className="py-32 text-center">
            <Loader2 className="animate-spin h-12 w-12 text-primary mx-auto" />
            <p className="mt-4 text-muted-foreground font-medium">{t('loading')}...</p>
          </section>
        )}

        <section id="about" className="py-32 bg-background relative overflow-hidden border-t border-border">
          <div className="container mx-auto max-w-7xl px-4 text-center">
            <h2 className="text-4xl font-black mb-8 tracking-tight text-foreground">{t('landing_title')}</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed font-medium">
              {t('landing_subtitle')}
            </p>
            {!user && (
              <div className="flex justify-center">
                <Link href="/login">
                  <Button size="lg" variant="outline" className="rounded-xl px-12 h-14 text-base font-bold border-border hover:bg-secondary">
                    Admin Portal
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-16 bg-background">
        <div className="container mx-auto max-w-7xl px-4 flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold shadow-sm">
              B
            </div>
            <span className="text-xl font-bold tracking-tight text-foreground">Banhchi</span>
          </div>
          <p className="text-muted-foreground font-medium">
            © {new Date().getFullYear()} — {t('all_rights_reserved')}
          </p>
        </div>
      </footer>
    </div>
  );
}
