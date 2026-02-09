"use client";

import Link from "next/link";
import { useLanguage } from "@/providers/language-provider";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Button } from "@/components/ui/button";
import { ArrowRight, LayoutDashboard, Calendar, ChevronLeft, ChevronRight, Loader2, LogIn, Phone, MessageCircle, Search, X, SlidersHorizontal, Heart, Flower2, Bell, Sun, LifeBuoy } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getEvents } from "@/services/event.service";
import { Event } from "@/types";
import { useState, useEffect } from "react";
import { formatDate, cn } from "@/lib/utils";
import Image from "next/image";
import { useAuth } from "@/providers/auth-provider";
import { Badge } from "@/components/ui/badge";
import { getAllContents, Content } from "@/services/content.service";
import { NewsTicker } from "@/components/news-ticker";
import { compressImage } from "@/lib/cloudinary";

// Helper type guard
function isEvent(item: Event | Content): item is Event {
  return (item as Event).eventDate !== undefined;
}

function FeedCard({ item, language, t }: { item: Event | Content, language: string, t: any }) {
  const isEvt = isEvent(item);
  const rawBanner = isEvt ? item.bannerUrl : item.thumbnail;
  const banner = rawBanner ? compressImage(rawBanner, 'thumbnail') : null;
  const date = isEvt ? item.eventDate : item.createdAt;
  const category = isEvt ? item.category : item.type;
  
  const typeLabel = isEvt 
    ? (t(item.category || "") || t('event')) 
    : (t(item.type) || item.type);

  // Dynamic Badge Styling
  const getBadgeStyles = () => {
    if (isEvt) {
      switch (item.category) {
        case 'wedding': return "bg-rose-500/90 text-white shadow-rose-500/20";
        case 'funeral': return "bg-zinc-800/90 text-white shadow-zinc-800/20";
        case 'merit_making': return "bg-orange-500/90 text-white shadow-orange-500/20";
        case 'memorial': return "bg-slate-600/90 text-white shadow-slate-600/20";
        case 'inauguration': return "bg-indigo-600/90 text-white shadow-indigo-600/20";
        default: return "bg-primary/90 text-white shadow-primary/20";
      }
    }
    // Content types
    switch (item.type) {
      case 'article': return "bg-blue-600/90 text-white shadow-blue-600/20";
      case 'agenda': return "bg-emerald-600/90 text-white shadow-emerald-600/20";
      default: return "bg-primary/90 text-white shadow-primary/20";
    }
  };

  return (
    <Link href={`/event/${item.id}`} key={item.id} className="group block h-full">
      <Card className="h-full overflow-hidden border-border bg-white rounded-3xl shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 p-0">
        <div className="aspect-4/3 w-full overflow-hidden bg-secondary relative">
          {banner ? (
            <div className="absolute inset-0">
              <Image 
                src={banner} 
                alt={item.title} 
                fill
                className="object-cover object-top group-hover:scale-110 transition-transform duration-700"
              />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full bg-linear-to-br from-primary/5 to-primary/10">
              {isEvt ? <Calendar className="h-8 w-8 sm:h-12 sm:w-12 text-primary/20" /> : <LayoutDashboard className="h-8 w-8 sm:h-12 sm:w-12 text-primary/20" />}
            </div>
          )}
          <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-60" />
          <div className="absolute top-4 right-4">
              <Badge className={cn(
                "backdrop-blur-md border-none px-4 py-2 rounded-full text-[10px] font-black uppercase shadow-xl transition-transform group-hover:scale-110",
                getBadgeStyles(),
                language === 'kh' ? 'tracking-normal' : 'tracking-[0.2em]'
              )}>
                {typeLabel}
              </Badge>
          </div>
        </div>
        <div className="p-4 sm:p-10">
          <CardTitle className="text-lg sm:text-2xl font-black text-foreground line-clamp-2 group-hover:text-primary transition-colors mb-2 sm:mb-6 leading-tight sm:leading-[1.3]">
            {item.title}
          </CardTitle>
          <div className="flex items-center justify-between mt-auto pt-4 sm:pt-6 border-t border-border/50">
            <span className={cn(
               "flex items-center gap-1.5 sm:gap-2 text-[9px] sm:text-[11px] font-black uppercase text-muted-foreground/60 transition-colors group-hover:text-primary/60",
               language === 'kh' ? 'tracking-normal' : 'tracking-widest sm:tracking-[0.2em]'
            )}>
               <Calendar className="h-3.5 w-3.5 opacity-60" />
               {formatDate(date, language)}
            </span>
            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-2xl bg-secondary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-500 group-hover:rotate-[-10deg]">
              <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}

export default function Home() {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const [items, setItems] = useState<(Event | Content)[]>([]);
  const [loading, setLoading] = useState(true);
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  useEffect(() => {
    async function fetchData() {
      try {
        const [eventsData, contentsData] = await Promise.all([
          getEvents(),
          getAllContents()
        ]);

        const activeEvents = eventsData.filter(e => e.status === 'active');
        const publishedContents = contentsData.filter(c => c.status === 'published');

        // Combine and sort by date (Newest first)
        const combined = [...activeEvents, ...publishedContents].sort((a, b) => {
          const dateA = isEvent(a) ? new Date(a.eventDate as any) : new Date(a.createdAt);
          const dateB = isEvent(b) ? new Date(b.eventDate as any) : new Date(b.createdAt);
          return dateB.getTime() - dateA.getTime();
        });

        setItems(combined); 
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const bannerItems = items.filter(item => {
    if (isEvent(item)) return true;
    return item.type !== 'article';
  });

  useEffect(() => {
    if (bannerItems.length <= 1) return;
    const interval = setInterval(() => {
      setFeaturedIndex((prev) => (prev + 1) % bannerItems.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [bannerItems.length]);

  const nextSlide = () => setFeaturedIndex((prev) => (prev + 1) % bannerItems.length);
  const prevSlide = () => setFeaturedIndex((prev) => (prev - 1 + bannerItems.length) % bannerItems.length);

  const featuredItem = bannerItems[featuredIndex];

  const filteredItems = items.filter(item => {
    const isEvt = isEvent(item);
    const title = item.title.toLowerCase();
    const query = searchQuery.toLowerCase();
    
    // Safety check for description (only exists on Content)
    const description = !isEvt ? (item as Content).description?.toLowerCase() || "" : "";
    
    const matchesSearch = title.includes(query) || description.includes(query);
    
    if (!matchesSearch) return false;
    
    if (activeFilter === 'all') return true;
    if (activeFilter === 'event') return isEvt;
    if (!isEvt) {
      if (activeFilter === 'content') return true;
      return (item as Content).type === activeFilter;
    }
    
    return false;
  });

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground selection:bg-primary/10">
      {!loading && items.length > 0 && <NewsTicker items={items} />}
      <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur-md border-b border-border shadow-xs">
        <div className="container mx-auto max-w-7xl flex h-16 sm:h-20 items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-12 w-32 sm:h-16 sm:w-48 items-center justify-center overflow-hidden transition-transform">
              <img src="/SIDETH-THEAPKA.png" alt="Logo" className="w-full h-full object-contain object-left" />
            </div>
            <span className="text-lg sm:text-2xl font-black tracking-tighter text-foreground uppercase hidden xs:inline-block">
              {t('app_name')}
            </span>
          </Link>
          
          <nav className="hidden lg:flex items-center gap-8 text-sm font-bold uppercase tracking-widest">
            <Link href="#feed" className="text-muted-foreground hover:text-primary transition-colors">{t('all_events')}</Link>
            <Link href="/support" className="text-muted-foreground hover:text-primary transition-colors">{t('tech_support')}</Link>
          </nav>
          
          <div className="flex items-center gap-1 sm:gap-4">
            <Link 
              href="/support" 
              className="lg:hidden flex h-9 w-9 items-center justify-center rounded-xl bg-secondary text-primary hover:bg-primary hover:text-white transition-all shadow-xs"
              title={t('tech_support')}
            >
              <LifeBuoy className="h-4 w-4" />
            </Link>
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      <main className="flex-1">
        {!loading && items.length > 0 && featuredItem && (
          <section className="relative h-[80vh] sm:h-212.5 overflow-hidden bg-zinc-900 shadow-2xl">
            <div className="absolute inset-0">
              {(isEvent(featuredItem) ? featuredItem.bannerUrl : featuredItem.thumbnail) ? (
                <Image 
                  src={(isEvent(featuredItem) ? featuredItem.bannerUrl : featuredItem.thumbnail) || ""} 
                  alt={featuredItem.title} 
                  fill
                  priority
                  className="object-cover object-top opacity-90 scale-105 animate-in fade-in zoom-in duration-1000"
                />
              ) : (
                <div className="h-full w-full bg-linear-to-br from-primary/20 to-primary/5" />
              )}
              {/* Subtle Dark Overlay for Legibility */}
              <div className="absolute inset-0 bg-black/20" />
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-black/80 to-transparent" />
            </div>

            {bannerItems.length > 1 && (
              <>
                <div className="absolute left-4 right-4 bottom-8 sm:left-12 sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2 z-30 flex sm:flex-col justify-between sm:justify-start gap-4">
                  <button
                    onClick={prevSlide}
                    className="h-10 w-10 sm:h-14 sm:w-14 rounded-xl sm:rounded-2xl bg-white/10 backdrop-blur-2xl text-white hover:bg-primary hover:text-white border border-white/20 flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-2xl group"
                  >
                    <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6 group-hover:-translate-x-1 transition-transform" />
                  </button>
                  <button
                    onClick={nextSlide}
                    className="h-10 w-10 sm:h-14 sm:w-14 rounded-xl sm:rounded-2xl bg-white/10 backdrop-blur-2xl text-white hover:bg-primary hover:text-white border border-white/20 flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-2xl group"
                  >
                    <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>

                {/* Pagination Dots */}
                <div className="absolute right-4 sm:right-12 bottom-20 sm:top-1/2 sm:-translate-y-1/2 z-30 flex sm:flex-col gap-3">
                  {bannerItems.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setFeaturedIndex(idx)}
                      className={cn(
                        "transition-all duration-500 rounded-full",
                        idx === featuredIndex ? "w-6 sm:w-1.5 h-1.5 sm:h-12 bg-primary shadow-[0_0_15px_rgba(var(--primary),0.5)]" : "w-1.5 h-1.5 bg-white/30 hover:bg-white/60"
                      )}
                    />
                  ))}
                </div>
              </>
            )}

            <div className="relative h-full container mx-auto max-w-7xl px-4 sm:px-12 flex items-center pt-10 sm:pt-20">
              <div className="max-w-4xl" key={featuredIndex}>
                <div className="flex flex-wrap items-center gap-2 sm:gap-4 mb-4 sm:mb-8 animate-in slide-in-from-left-8 duration-700 delay-100">
                  <div className="inline-flex items-center gap-2 sm:gap-3 bg-primary text-white px-3 sm:px-5 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl border border-white/10 shadow-2xl shadow-primary/20">
                    <span className="relative flex h-2 w-2 sm:h-2.5 sm:w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 sm:h-2.5 sm:w-2.5 bg-white"></span>
                    </span>
                    <span className="text-[9px] sm:text-[11px] uppercase font-black tracking-[0.2em] leading-none">
                      {isEvent(featuredItem) 
                        ? (featuredItem.status === 'active' ? t('active') : t('completed'))
                        : (t(featuredItem.type) || featuredItem.type)
                      }
                    </span>
                  </div>
                  <div className="inline-flex items-center gap-2 sm:gap-3 bg-white/5 backdrop-blur-2xl px-3 sm:px-5 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl border border-white/10 shadow-lg text-[9px] sm:text-[11px] uppercase font-black tracking-[0.2em] leading-none text-white/80">
                    <Calendar className="h-3 sm:h-4 w-3 sm:w-4 opacity-60" />
                    {isEvent(featuredItem) 
                      ? formatDate(featuredItem.eventDate, language)
                      : formatDate(featuredItem.createdAt, language)
                    }
                  </div>
                </div>

                <h1 className={cn(
                  "text-3xl sm:text-7xl lg:text-8xl font-black mb-6 sm:mb-10 leading-[1.2] sm:leading-[1.05] tracking-tighter text-white drop-shadow-2xl animate-in slide-in-from-left-12 duration-1000 delay-200",
                  language === 'kh' ? 'font-moul tracking-normal leading-[1.6] sm:leading-[1.4] text-3xl sm:text-6xl' : ''
                )}>
                  {featuredItem.title}
                </h1>

                <div className="flex flex-wrap items-center gap-3 sm:gap-6 animate-in slide-in-from-bottom-8 duration-1000 delay-300">
                  <Button asChild size="xl" className="bg-primary text-white hover:bg-primary/90 font-black h-11 sm:h-20 px-6 sm:px-16 rounded-xl sm:rounded-[2rem] text-[10px] sm:text-base uppercase tracking-widest shadow-2xl shadow-primary/40 transition-all hover:scale-105 active:scale-95 group">
                    <Link href={`/event/${featuredItem.id}`}>
                      {t('view_details')}
                      <ArrowRight className="ml-2 sm:ml-3 h-4 w-4 sm:h-6 sm:w-6 group-hover:translate-x-2 transition-transform" />
                    </Link>
                  </Button>
                  {!isEvent(featuredItem) && (
                    <div className="hidden sm:flex items-center gap-3 text-white/40 uppercase font-black text-[10px] tracking-[0.3em]">
                      <div className="h-px w-8 bg-current" />
                      {t('discover_more')}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}



        {!loading && items.length === 0 && (
          <section className="relative px-4 py-32 text-center bg-secondary">
            <div className="mx-auto max-w-2xl">
              <div className="h-20 w-20 mx-auto mb-6 rounded-full bg-background border border-border flex items-center justify-center">
                <Calendar className="h-10 w-10 opacity-20" />
              </div>
              <h2 className="text-3xl font-bold mb-3">{t('no_items') || "No items found"}</h2>
              <p className="text-lg text-muted-foreground">{t('check_back_later') || "Check back later for updates."}</p>
            </div>
          </section>
        )}

        {!loading && items.length > 0 && (
          <section id="feed" className="py-12 sm:py-32 bg-background">
            <div className="container mx-auto max-w-7xl px-6 lg:px-12">
              <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-24">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tighter mb-4 sm:mb-6 uppercase">
                  {t('feed_title')}
                </h2>
                <p className="text-lg text-muted-foreground/80 leading-relaxed">
                  {t('feed_desc')}
                </p>
              </div>

              {/* Search & Filter Bar */}
              <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 sm:gap-6 mb-12 sm:mb-16">
                <div className="relative flex-1 w-full md:max-w-xl group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input 
                    placeholder={t('search_placeholder') || (language === 'kh' ? 'ស្វែងរកកម្មវិធី ឬខ្លឹមសារ...' : 'Search events or content...')}
                    className="pl-12 h-11 sm:h-14 rounded-xl sm:rounded-2xl bg-white border-border shadow-sm focus:ring-8 focus:ring-primary/5 transition-all font-medium text-sm sm:text-base"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery("")}
                      className="absolute right-4 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full flex items-center justify-center hover:bg-secondary transition-colors"
                    >
                      <X className="h-4 w-4 text-muted-foreground" />
                    </button>
                  )}
                </div>
                
                <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto no-scrollbar scroll-smooth -mx-6 px-6 sm:mx-0 sm:px-0">
                  <div className="flex items-center gap-2 px-1">
                    {[
                      { id: 'all', label: t('filter_all') || (language === 'kh' ? 'ទាំងអស់' : 'All') },
                      { id: 'event', label: t('filter_events') || (language === 'kh' ? 'កម្មវិធី' : 'Events') },
                      { id: 'article', label: t('filter_articles') || (language === 'kh' ? 'អត្ថបទ' : 'Articles') },
                      { id: 'agenda', label: t('filter_agendas') || (language === 'kh' ? 'កម្មវិធីការងារ' : 'Agendas') },
                    ].map((filter) => (
                      <Button
                        key={filter.id}
                        variant={activeFilter === filter.id ? 'default' : 'outline'}
                        onClick={() => setActiveFilter(filter.id)}
                        className={cn(
                          "rounded-full h-11 px-6 font-black uppercase text-[10px] tracking-widest whitespace-nowrap transition-all",
                          activeFilter === filter.id 
                            ? "shadow-xl shadow-primary/20 scale-105" 
                            : "bg-white border-border text-muted-foreground hover:bg-secondary hover:text-foreground"
                        )}
                      >
                        {filter.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-12 sm:space-y-24">
                {/* Results logic */}
                {filteredItems.length === 0 ? (
                  <div className="py-20 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="h-20 w-20 bg-secondary rounded-3xl flex items-center justify-center mx-auto mb-6">
                      <Search className="h-10 w-10 text-muted-foreground/30" />
                    </div>
                    <h3 className="text-xl font-black text-foreground mb-2">
                       {t('no_results') || (language === 'kh' ? 'មិនមានលទ្ធផលស្វែងរកទេ' : 'No results found')}
                    </h3>
                    <p className="text-muted-foreground font-medium">
                       {t('try_different_search') || (language === 'kh' ? 'សូមព្យាយាមស្វែងរកពាក្យផ្សេងទៀត' : 'Try searching for something else' )}
                    </p>
                    <Button 
                      variant="link" 
                      onClick={() => {setSearchQuery(""); setActiveFilter("all");}}
                      className="mt-4 text-primary font-black uppercase text-xs tracking-widest"
                    >
                      {t('clear_all_filters') || (language === 'kh' ? 'សម្អាតការស្វែងរក' : 'Clear all filters')}
                    </Button>
                  </div>
                ) : (
                  <>
                    {/* 1. EVENTS SECTION */}
                    {filteredItems.filter(isEvent).length > 0 && (
                      <div className="space-y-6 sm:space-y-10 animate-in fade-in duration-700">
                         <div className="flex items-center gap-3 sm:gap-8">
                            <div className="h-px bg-border flex-1" />
                            <h2 className={cn(
                              "text-sm sm:text-xl font-black text-foreground uppercase shrink-0",
                              language === 'kh' ? 'font-moul text-xs sm:text-lg tracking-normal' : 'tracking-widest sm:tracking-widest'
                            )}>
                              {t('upcoming_celebrations')}
                            </h2>
                            <div className="h-px bg-border flex-1" />
                         </div>
                         <div className="grid gap-6 sm:gap-10 sm:grid-cols-2 lg:grid-cols-3">
                            {filteredItems.filter(isEvent).map((item) => (
                               <FeedCard key={item.id} item={item} language={language} t={t} />
                            ))}
                         </div>
                      </div>
                    )}

                    {/* 2. CONTENTS SECTION */}
                    {filteredItems.filter(i => !isEvent(i)).length > 0 && (
                      <div className="space-y-6 sm:space-y-10 animate-in fade-in duration-1000">
                         <div className="flex items-center gap-3 sm:gap-8">
                            <div className="h-px bg-border flex-1" />
                            <h2 className={cn(
                              "text-sm sm:text-xl font-black text-foreground uppercase shrink-0",
                              language === 'kh' ? 'font-moul text-xs sm:text-lg tracking-normal' : 'tracking-widest sm:tracking-widest'
                            )}>
                              {t('content_updates')}
                            </h2>
                            <div className="h-px bg-border flex-1" />
                         </div>
                         <div className="grid gap-6 sm:gap-10 sm:grid-cols-2 lg:grid-cols-3">
                            {filteredItems.filter(i => !isEvent(i)).map((item) => (
                               <FeedCard key={item.id} item={item} language={language} t={t} />
                            ))}
                         </div>
                      </div>
                    )}
                  </>
                )}
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
      </main>

      <footer className="border-t border-border bg-white py-20">
        <div className="container mx-auto max-w-7xl px-6 lg:px-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
            {/* Branding */}
            <div className="space-y-6">
              <Link href="/" className="flex items-center gap-3">
                <div className="flex h-14 w-40 items-center justify-center overflow-hidden">
                  <img src="/SIDETH-THEAPKA.png" alt="Logo" className="w-full h-full object-contain object-left" />
                </div>
                <span className="text-xl font-black tracking-tighter text-foreground uppercase">{t('app_name')}</span>
              </Link>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
                {language === 'kh' 
                  ? "ប្រព័ន្ធគ្រប់គ្រងកម្មវិធីឌីជីថល ផ្តល់នូវបទពិសោធន៍ថ្មីសម្រាប់គ្រប់កម្មវិធីរបស់អ្នក។"
                  : "Digital Event Companion providing a seamless experience for all your ceremonies."}
              </p>
            </div>

            {/* Support Links */}
            <div className="space-y-6">
              <Link href="/support" className="group flex items-center justify-between">
                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-foreground group-hover:text-primary transition-colors">{t('tech_support')}</h4>
                <ArrowRight className="h-3 w-3 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </Link>
              <div className="space-y-4">
                <div className="flex items-center gap-3 group">
                  <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <Phone className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-bold text-muted-foreground group-hover:text-foreground transition-colors">098 943 324</span>
                </div>
                <div className="pt-2">
                  <div className="h-32 w-32 bg-white p-2 rounded-md border border-border shadow-sm overflow-hidden group hover:border-primary transition-colors">
                    <Image 
                      src="/mengley.svg" 
                      alt="Support QR" 
                      width={128} 
                      height={128} 
                      className="object-contain"
                    />
                  </div>
                  <p className="text-[10px] font-black text-muted-foreground mt-2 uppercase tracking-widest pl-1">SCAN FOR SUPPORT</p>
                </div>
              </div>
            </div>

            {/* Info */}
            <div className="space-y-6">
              <h4 className="text-xs font-black uppercase tracking-[0.2em] text-foreground">System Info</h4>
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground font-medium">Version 1.0.0 — Private Client</p>
                <div className="flex items-center gap-2 text-[10px] text-green-600 font-black uppercase tracking-widest">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></span>
                  System Online
                </div>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
              © {new Date().getFullYear()} — {t('all_rights_reserved')}
            </p>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
               Developed for Private Client
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
