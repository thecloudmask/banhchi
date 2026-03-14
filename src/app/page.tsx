"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/providers/language-provider";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { ArrowRight, LayoutDashboard, Calendar, ChevronLeft, ChevronRight, Loader2, Phone, MessageCircle, Search, X, LifeBuoy, Activity, Globe } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getEvents } from "@/services/event.service";
import { Event } from "@/types";
import { useState, useEffect } from "react";
import { formatDateTime, cn } from "@/lib/utils";
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

// Helper: returns the correct public URL based on item category/type
function getPublicUrl(item: Event | Content): string {
  const isEvt = isEvent(item);
  const id = item.id;
  if (isEvt) {
    switch (item.category) {
      case 'wedding':      return `/wedding/${id}`;
      case 'buddhist':     return `/merit-making/${id}`; // Keep path for UX if needed, or change to /buddhist/
      default:             return `/event/${id}`;
    }
  }
  // Content types
  switch ((item as Content).type) {
    case 'wedding':      return `/wedding/${id}`;
    case 'funeral':      return `/funeral/${id}`;
    case 'article':      return `/article/${id}`;
    default:             return `/event/${id}`;
  }
}

function FeedCard({ item, language, t }: { item: Event | Content, language: string, t: any }) {
  const isEvt = isEvent(item);
  const rawBanner = isEvt ? item.bannerUrl : item.thumbnail;
  const banner = rawBanner ? compressImage(rawBanner, 'thumbnail') : null;
  const date = isEvt ? item.eventDate : item.createdAt;
  
  const typeLabel = isEvt 
    ? (t(item.category || "") || t('event')) 
    : (t(item.type) || item.type);

  // Dynamic Badge Styling
  const getBadgeStyles = () => {
    if (isEvt) {
      switch (item.category) {
        case 'wedding': return "bg-primary text-primary-foreground shadow-primary/20";
        case 'buddhist': return "bg-orange-500 text-white shadow-orange-500/20";
        default: return "bg-blue-500 text-white shadow-blue-500/20";
      }
    }
    // Content types
    switch (item.type) {
      case 'article': return "bg-primary text-primary-foreground shadow-primary/20";
      case 'agenda': return "bg-emerald-500 text-white shadow-emerald-500/20";
      default: return "bg-slate-700 text-white shadow-slate-500/10";
    }
  };

  return (
    <Link href={getPublicUrl(item)} key={item.id} className="group block h-full">
      <Card className="h-full p-0 flex flex-col border border-border rounded-[2.5rem] overflow-hidden hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-2 transition-all duration-500 bg-card">
        <div className="aspect-16/10 w-full overflow-hidden bg-muted/5 relative group-hover:scale-[1.02] origin-bottom transition-transform duration-700">
          {banner ? (
            <div className="absolute inset-0">
              <Image 
                src={banner} 
                alt={item.title} 
                fill
                className="object-cover object-top group-hover:scale-105 transition-all duration-700"
              />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full bg-linear-to-br from-foreground/5 to-foreground/10">
              {isEvt ? <Calendar className="h-8 w-8 text-foreground/10" /> : <LayoutDashboard className="h-8 w-8 text-foreground/10" />}
            </div>
          )}
          
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-background via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-all duration-700" />
          
          <div className="absolute top-4 right-4 z-10">
              <Badge className={cn(
                "backdrop-blur-xl border border-white/10 px-5 py-2.5 rounded-full text-[10px] font-black uppercase shadow-xl transition-all duration-500 group-hover:scale-110",
                getBadgeStyles(),
                language === 'kh' ? 'tracking-normal' : 'tracking-[0.2em]'
              )}>
                {typeLabel}
              </Badge>
          </div>
        </div>
        
        <div className="p-8 flex flex-col flex-1">
          <CardTitle 
            className={cn(
              "text-lg font-black text-foreground line-clamp-2 group-hover:text-primary transition-colors mb-6 leading-relaxed",
              language === 'kh' ? 'font-kantumruy text-base' : ''
            )}
          >
            {item.title}
          </CardTitle>
          
          <div className="flex items-center justify-between mt-auto pt-6 border-t border-border">
            <span className={cn(
               "flex items-center gap-2 text-[10px] font-black uppercase text-muted-foreground transition-colors group-hover:text-foreground",
               language === 'kh' ? 'tracking-normal' : 'tracking-[0.2em]'
            )}>
               <Calendar className="h-3.5 w-3.5 opacity-40 group-hover:opacity-100 transition-opacity text-primary" />
               {formatDateTime(date)}
            </span>
            <div className="h-10 w-10 rounded-2xl bg-muted/50 flex items-center justify-center text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-all group-hover:rotate-[-8deg] shadow-inner group-hover:shadow-lg group-hover:shadow-primary/30">
              <ArrowRight className="h-4 w-4" />
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}

export default function Home() {
  const { signIn, signInWithGoogle, user, loading: authLoading } = useAuth();
  const { t, language } = useLanguage();
  const router = useRouter();

  // Removed automatic redirect to allow admins to view the public site

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

        const publishedContents = contentsData.filter(c => c.status === 'published');
        const combined = [...eventsData, ...publishedContents];

        // Sort by date (Newest first)
        const sorted = combined.sort((a, b) => {
          const getD = (item: Event | Content) => {
            const d = isEvent(item) ? item.eventDate : item.createdAt;
            if (!d) return 0;
            const timestamp = (d as any)?.seconds ? (d as any).seconds * 1000 : d;
            const date = new Date(timestamp as any);
            return isNaN(date.getTime()) ? 0 : date.getTime();
          };
          return getD(b) - getD(a);
        });

        setItems(sorted); 
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
    const title = (item.title || "").toLowerCase();
    const query = (searchQuery || "").toLowerCase();
    
    // Safety check for description (only exists on Content)
    const description = !isEvt ? (item as Content).description?.toLowerCase() || "" : "";
    
    const matchesSearch = title.includes(query) || description.includes(query);
    
    if (!matchesSearch) return false;
    
    if (activeFilter === 'all') return true;
    
    if (isEvt) {
      if (activeFilter === 'event') return true;
      return item.category === activeFilter;
    } else {
      if (activeFilter === 'content') return true;
      const contentType = (item as Content).type;
      
      // Map agenda type to buddhist for filtering consistency if needed
      if (activeFilter === 'buddhist' && contentType === 'agenda') return true;
      
      return contentType === activeFilter;
    }
  });

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground selection:bg-primary/20 font-kantumruy">
      {!loading && items.length > 0 && <NewsTicker items={items} />}
      <header className="fixed left-0 right-0 z-50 mx-auto w-full max-w-full lg:max-w-full bg-background/90 backdrop-blur-xl border-b border-border">
        <div className="flex h-16 sm:h-20 items-center justify-between px-4 sm:px-8">
          <Link href="/" className="flex items-center gap-2 group shrink-0">
            <div className="flex h-9 w-32 sm:h-12 sm:w-64 items-center justify-start overflow-hidden transition-transform group-hover:scale-105 relative">
              <Image 
                src="/SIDETH-THEAPKA.png" 
                alt="Logo" 
                fill
                className="object-contain object-left dark:brightness-200" 
              />
            </div>
          </Link>
          
          <nav className="hidden lg:flex items-center gap-10 text-[10px] font-black uppercase tracking-[0.2em]">
            <Link href="#feed" className="text-muted-foreground hover:text-primary transition-all duration-300 hover:tracking-[0.25em]">{t('all_events')}</Link>
            <Link href="/support/" className="text-muted-foreground hover:text-primary transition-all duration-300 hover:tracking-[0.25em]">{t('tech_support')}</Link>
          </nav>
          
          <div className="flex items-center gap-1 sm:gap-4">
            {user && (
              <Link href="/admin/">
                <Button variant="ghost" className="h-9 w-9 sm:h-11 sm:w-auto rounded-xl p-0 sm:px-4 flex items-center justify-center border border-border bg-card hover:bg-accent shadow-sm transition-all hover:scale-105 group">
                   <LayoutDashboard className="h-4 w-4 sm:mr-2 text-primary" />
                   <span className="hidden sm:inline font-bold text-xs uppercase tracking-widest">{t('dashboard')}</span>
                </Button>
              </Link>
            )}
            <Link 
              href="/support/" 
              className="lg:hidden flex h-9 w-9 items-center justify-center rounded-xl bg-muted/50 text-muted-foreground hover:bg-primary hover:text-white transition-all shadow-xs border border-border"
              title={t('tech_support')}
            >
              <LifeBuoy className="h-4 w-4" />
            </Link>
            <ThemeToggle />
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      <main className="flex-1">
        {!loading && items.length > 0 && featuredItem && (
          <section className="relative h-svh min-h-150 sm:h-[85vh] sm:min-h-175 overflow-hidden bg-zinc-950 shadow-2xl">
            <div className="absolute inset-0">
              {(isEvent(featuredItem) ? featuredItem.bannerUrl : featuredItem.thumbnail) ? (
                <Image 
                  src={(isEvent(featuredItem) ? featuredItem.bannerUrl : featuredItem.thumbnail) || ""} 
                  alt={featuredItem.title} 
                  fill
                  priority
                  className="object-cover object-top opacity-60 scale-100 transition-all duration-1000 group-hover:scale-105"
                />
              ) : (
                <div className="h-full w-full bg-linear-to-br from-primary/20 to-black" />
              )}
              {/* Premium Gradient Overlays */}
              <div className="absolute inset-x-0 bottom-0 h-full bg-linear-to-t from-background via-background/40 to-transparent z-10" />
              <div className="absolute inset-0 bg-black/20 z-10" />
            </div>

            {bannerItems.length > 1 && (
              <>
                <div className="absolute right-4 bottom-4 sm:left-16 sm:right-auto sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2 z-30 flex sm:flex-col gap-2 sm:gap-6">
                  <button
                    onClick={prevSlide}
                    className="h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-white/5 text-white hover:bg-primary border border-white/10 flex items-center justify-center transition-all hover:scale-105 active:scale-95 group backdrop-blur-md"
                  >
                    <ChevronLeft className="h-6 w-6 group-hover:-translate-x-1 transition-all" />
                  </button>
                  <button
                    onClick={nextSlide}
                    className="h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-white/5 text-white hover:bg-primary border border-white/10 flex items-center justify-center transition-all hover:scale-105 active:scale-95 group backdrop-blur-md"
                  >
                    <ChevronRight className="h-6 w-6 group-hover:translate-x-1 transition-all" />
                  </button>
                </div>

                {/* Pagination Indicator */}
                <div className="absolute left-6 bottom-8 sm:left-auto sm:right-16 sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2 z-30 flex sm:flex-col gap-2 sm:gap-4 items-center">
                  {bannerItems.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setFeaturedIndex(idx)}
                      className={cn(
                        "transition-all duration-700 rounded-full",
                        idx === featuredIndex ? "w-8 sm:w-2 h-2 sm:h-16 bg-primary shadow-[0_0_20px_rgba(var(--primary),0.6)]" : "w-2 h-2 bg-white/40 hover:bg-white/60"
                      )}
                    />
                  ))}
                </div>
              </>
            )}

            <div className="relative h-full container mx-auto flex items-center pt-20 px-6 sm:px-12">
              <div className="max-w-4xl" key={featuredIndex}>
                <div className="flex flex-wrap items-center gap-3 mb-8 animate-in slide-in-from-left-10 duration-1000 relative z-20">
                  <div className="inline-flex items-center gap-3 bg-primary text-primary-foreground px-6 py-2.5 rounded-full border border-white/10 shadow-lg shadow-primary/20">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                    </span>
                    <span className="text-[10px] uppercase font-black tracking-[0.2em] leading-none">
                      {isEvent(featuredItem) 
                        ? (featuredItem.status === 'active' ? t('active') : t('completed'))
                        : (t(featuredItem.type) || featuredItem.type)
                      }
                    </span>
                  </div>
                  <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-6 py-2.5 rounded-full border border-white/20 text-[10px] uppercase font-bold tracking-[0.2em] text-white/90">
                    <Calendar className="h-3.5 w-3.5 opacity-70" />
                    {isEvent(featuredItem) 
                      ? formatDateTime(featuredItem.eventDate)
                      : formatDateTime(featuredItem.createdAt)
                    }
                  </div>
                </div>

                <h1 className={cn(
                  "text-4xl sm:text-5xl lg:text-7xl font-black mb-10 leading-tight tracking-tighter text-white animate-in slide-in-from-left-16 duration-1000 delay-100 line-clamp-4 sm:line-clamp-3 max-w-3xl relative z-20",
                  language === 'kh' ? 'font-kantumruy text-2xl sm:text-4xl lg:text-5xl leading-[1.6]' : ''
                )}>
                  {featuredItem.title}
                </h1>

                <div className="flex flex-wrap items-center gap-6 animate-in slide-in-from-bottom-12 duration-1000 delay-200 relative z-20">
                  <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 font-black px-10 py-7 rounded-2xl text-sm sm:text-base uppercase tracking-[0.2em] shadow-2xl shadow-primary/40 transition-all hover:scale-105 active:scale-95 group w-full sm:w-auto">
                    <Link href={getPublicUrl(featuredItem)}>
                      {t('view_details')}
                      <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-all" />
                    </Link>
                  </Button>
                  {!isEvent(featuredItem) && (
                    <div className="hidden lg:flex items-center gap-4 text-white/50 uppercase font-black text-xs tracking-[0.4em]">
                      <div className="h-px w-12 bg-current opacity-30" />
                      {t('discover_more')}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

        {!loading && items.length === 0 && (
          <section className="relative px-4 py-40 text-center bg-background">
            <div className="mx-auto max-w-2xl bg-card border border-border rounded-[3rem] p-12 shadow-2xl">
              <div className="h-20 w-20 mx-auto mb-8 rounded-2xl bg-muted/50 border border-border flex items-center justify-center">
                <Calendar className="h-10 w-10 text-muted-foreground/30" />
              </div>
              <h2 className="text-3xl font-black mb-4 text-foreground uppercase tracking-tight">{t('no_items')}</h2>
              <p className="text-muted-foreground font-medium">{t('check_back_later')}</p>
            </div>
          </section>
        )}

        {!loading && items.length > 0 && (
          <section id="feed" className="py-24 sm:py-32 relative bg-background">
            <div className="container mx-auto max-w-7xl px-6 lg:px-12 relative z-10">
              <div className="text-center max-w-3xl mx-auto mb-20 sm:mb-28">
                <h2 className={cn(
                    "text-3xl sm:text-4xl lg:text-6xl font-black tracking-tighter mb-6 uppercase text-foreground leading-tight",
                    language === 'kh' ? 'font-kantumruy tracking-normal leading-[1.6]' : ''
                )}>
                  {t('feed_title')}
                </h2>
                <div className="h-1.5 w-24 bg-primary mx-auto rounded-full mb-8" />
                <p className="text-lg text-muted-foreground leading-relaxed font-medium">
                  {t('feed_desc')}
                </p>
              </div>

              {/* Search & Filter Bar */}
              <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-6 mb-16 sm:mb-20">
                <div className="relative flex-1 w-full md:max-w-xl group">
                  <div className="absolute -inset-1 bg-primary/10 rounded-[2rem] blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/50 group-focus-within:text-primary transition-colors z-10" />
                  <Input 
                    placeholder={t('search_placeholder')}
                    className="pl-16 pr-14 h-16 sm:h-20 rounded-[1.5rem] bg-card border-border text-foreground placeholder:text-muted-foreground/30 focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-300 font-bold text-base hover:bg-card/80"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery("")}
                      className="absolute right-5 top-1/2 -translate-y-1/2 h-10 w-10 rounded-xl flex items-center justify-center hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  )}
                </div>
                
                <div className="flex items-center gap-3 overflow-x-auto overflow-y-hidden pb-2 md:pb-0 w-full md:w-auto scrollbar-hide -mx-6 px-6 sm:mx-0 sm:px-0">
                  {[
                    { id: 'all', label: t('filter_all') },
                    { id: 'article', label: t('filter_articles') },
                    { id: 'wedding', label: t('wedding') },
                    { id: 'buddhist', label: t('buddhist') },
                    { id: 'poster', label: t('filter_posters') },
                  ].map((filter) => (
                    <Button
                      key={filter.id}
                      variant={activeFilter === filter.id ? 'default' : 'outline'}
                      onClick={() => setActiveFilter(filter.id)}
                      className={cn(
                        "rounded-2xl h-14 sm:h-16 px-8 font-black uppercase text-[10px] tracking-widest whitespace-nowrap transition-all duration-500 border shrink-0",
                        activeFilter === filter.id 
                          ? "bg-primary text-primary-foreground shadow-2xl shadow-primary/30 border-transparent scale-105" 
                          : "bg-card border-border text-muted-foreground hover:bg-accent hover:text-foreground"
                      )}
                    >
                      {filter.label}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-24 sm:space-y-32">
                {filteredItems.length === 0 ? (
                  <div className="py-24 text-center animate-in fade-in slide-in-from-bottom-8 duration-700 max-w-lg mx-auto bg-card border border-border rounded-[3rem] p-12 shadow-2xl">
                    <div className="h-24 w-24 bg-muted/50 border border-border rounded-3xl flex items-center justify-center mx-auto mb-8 text-muted-foreground/30">
                      <Search className="h-10 w-10" />
                    </div>
                    <h3 className="text-2xl font-black text-foreground mb-3 uppercase tracking-tight">
                       {t('no_results')}
                    </h3>
                    <p className="text-muted-foreground font-medium mb-8">
                       {t('try_different_search')}
                    </p>
                    <Button 
                      variant="ghost" 
                      onClick={() => {setSearchQuery(""); setActiveFilter("all");}}
                      className="text-primary font-black uppercase text-xs tracking-[0.2em] hover:bg-primary/10 rounded-xl px-10 h-14 transition-all"
                    >
                      {t('clear_all_filters')}
                    </Button>
                  </div>
                ) : (
                  <>
                    {/* Events Section */}
                    {filteredItems.filter(i => isEvent(i)).length > 0 && (
                      <div className="space-y-12 sm:space-y-20 animate-in fade-in duration-1000">
                         <div className="flex items-center gap-8">
                            <div className="h-px bg-border flex-1" />
                            <h2 className={cn(
                              "text-sm sm:text-2xl font-black text-foreground uppercase shrink-0 tracking-widest",
                              language === 'kh' ? 'font-moul text-xs sm:text-xl' : ''
                            )}>
                              {t('upcoming_celebrations')}
                            </h2>
                            <div className="h-px bg-border flex-1" />
                         </div>
                         <div className="grid gap-10 sm:gap-12 sm:grid-cols-2 lg:grid-cols-3">
                            {filteredItems.filter(i => isEvent(i)).map((item) => (
                               <FeedCard key={item.id} item={item} language={language} t={t} />
                            ))}
                         </div>
                      </div>
                    )}

                    {/* Content Section */}
                    {filteredItems.filter(i => !isEvent(i)).length > 0 && (
                      <div className="space-y-12 sm:space-y-20 animate-in fade-in duration-1000">
                         <div className="flex items-center gap-8">
                            <div className="h-px bg-border flex-1" />
                            <h2 className={cn(
                              "text-sm sm:text-2xl font-black text-foreground uppercase shrink-0 tracking-widest",
                              language === 'kh' ? 'font-moul text-xs sm:text-xl' : ''
                            )}>
                              {t('content_updates')}
                            </h2>
                            <div className="h-px bg-border flex-1" />
                         </div>
                         <div className="grid gap-10 sm:gap-12 sm:grid-cols-2 lg:grid-cols-3">
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
          <section className="py-40 text-center bg-background">
            <Loader2 className="animate-spin h-14 w-14 text-primary mx-auto mb-6 opacity-60" />
            <p className="text-muted-foreground font-bold uppercase tracking-widest text-xs">{t('loading')}...</p>
          </section>
        )}
      </main>

      <footer className="bg-card py-20 border-t border-border mt-auto relative z-10 w-full overflow-hidden">
        {/* Abstract Background Element */}
        <div className="absolute top-0 right-0 h-96 w-96 bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 h-96 w-96 bg-[#3b82f6]/5 blur-[120px] rounded-full pointer-events-none" />

        <div className="container mx-auto max-w-7xl px-8 lg:px-12 relative z-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-16 lg:gap-12 mb-20">
            
            <div className="sm:col-span-2 lg:col-span-12 flex flex-col items-center text-center space-y-8 mb-12">
              <Link href="/" className="inline-block hover:scale-105 transition-transform duration-500">
                <div className="flex h-16 sm:h-24 items-center justify-center overflow-hidden relative">
                  <Image 
                    src="/SIDETH-THEAPKA.png" 
                    alt="Logo" 
                    fill
                    className="object-contain dark:brightness-200" 
                  />
                </div>
              </Link>
              <div className="max-w-2xl space-y-4">
                <h3 className="text-xl font-black text-foreground uppercase tracking-[0.2em]">{t('app_name')}</h3>
                <p className="text-muted-foreground leading-relaxed font-medium">
                  {language === 'kh' 
                    ? "ប្រព័ន្ធគ្រប់គ្រងកម្មវិធីឌីជីថលផ្តល់នូវបទពិសោធន៍ថ្មីសម្រាប់គ្រប់កម្មវិធីរបស់អ្នក។ យើងបង្កើតតំណភ្ជាប់ដ៏មានន័យ រវាងបច្ចេកវិទ្យា និងទំនៀមទំលាប់ប្រពៃណីរបស់ខ្មែរ។"
                    : "Digital Event Companion providing a seamless experience for all your ceremonies. We bridge the gap between modern technology and beautiful Khmer traditions."}
                </p>
              </div>
            </div>

            {/* Support Links */}
            <div className="sm:col-span-2 lg:col-span-6 space-y-8 bg-muted/5 backdrop-blur-md rounded-[2.5rem] p-10 border border-border shadow-2xl">
              <div className="flex items-center gap-4 mb-2">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                  <LifeBuoy className="h-6 w-6" />
                </div>
                <h4 className="text-sm font-black uppercase tracking-[0.25em] text-foreground">{t('tech_support')}</h4>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                <div className="space-y-6">
                  <div className="flex items-center gap-5">
                    <div className="h-12 w-12 rounded-full bg-muted/50 flex items-center justify-center text-primary border border-border shrink-0">
                      <Phone className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Contact Phone</p>
                      <span className="text-lg font-black text-foreground tracking-widest">098 943 324</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-5 pt-2">
                    <div className="h-12 w-12 rounded-full bg-muted/50 flex items-center justify-center text-[#0ea5e9] border border-border shrink-0">
                      <MessageCircle className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Telegram Chat</p>
                      <span className="text-lg font-black text-foreground tracking-widest">@Sideth_Theapka</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col items-center sm:items-end justify-center">
                  <div className="h-28 w-28 bg-white p-2.5 rounded-[1.5rem] border border-border shadow-2xl relative group overflow-hidden">
                    <Image 
                      src="/mengley.svg" 
                      alt="Support QR" 
                      width={100} 
                      height={100} 
                      className="object-contain"
                    />
                  </div>
                  <p className="text-[8px] font-black text-muted-foreground mt-4 uppercase tracking-[0.25em]">SCAN FOR LIVE ASSISTANT</p>
                </div>
              </div>
            </div>

            {/* System Status & Quick Info */}
            <div className="sm:col-span-2 lg:col-span-6 space-y-8 bg-card rounded-[2.5rem] p-10 border border-border shadow-2xl">
              <div className="flex items-center gap-4 mb-2">
                <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                  <Activity className="h-6 w-6" />
                </div>
                <h4 className="text-sm font-black uppercase tracking-[0.25em] text-foreground">System Dynamics</h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="bg-muted/50 rounded-2xl p-5 border border-border">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">Build Identifier</p>
                    <p className="text-sm text-foreground font-bold tracking-widest">V1.0.4-PRO • PRIVATE CLIENT</p>
                  </div>
                  <div className="bg-muted/50 rounded-2xl p-5 border border-border">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">Security Status</p>
                    <div className="flex items-center gap-2 text-[10px] text-emerald-400 font-bold uppercase tracking-widest">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse"></span>
                      End-to-End Encrypted
                    </div>
                  </div>
                </div>

                <div className="flex flex-col justify-between">
                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Deployment Node</p>
                    <p className="text-xs text-foreground font-bold tracking-widest flex items-center gap-2 uppercase">
                      <Globe className="h-3 w-3 text-primary" />
                      Phnom Penh, Cambodia
                    </p>
                  </div>
                  <div className="pt-4 flex gap-3">
                    <div className="h-1 w-full bg-muted/50 rounded-full overflow-hidden">
                       <div className="h-full w-[85%] bg-primary animate-pulse" />
                    </div>
                    <span className="text-[8px] font-black text-muted-foreground/40 whitespace-nowrap">LOAD 12%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-10 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-6">
              <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-[0.2em]">
                PRIVACY POLICY
              </p>
              <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-[0.2em]">
                SERVICE STATUS
              </p>
            </div>
            <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-[0.3em]">
               © {new Date().getFullYear()} SIDETH THEAPKA • DIGITAL SOLUTIONS
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
