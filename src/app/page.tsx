"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
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

// Helper: returns the correct public URL based on item category/type
function getPublicUrl(item: Event | Content): string {
  const isEvt = isEvent(item);
  const id = item.id;
  if (isEvt) {
    switch (item.category) {
      case 'wedding':      return `/wedding/${id}`;
      case 'funeral':      return `/funeral/${id}`;
      case 'merit_making': return `/merit-making/${id}`;
      case 'inauguration': return `/inauguration/${id}`;
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
      case 'wedding': return "bg-rose-500/90 text-white shadow-rose-500/20";
      case 'funeral': return "bg-zinc-800/90 text-white shadow-zinc-800/20";
      default: return "bg-primary/90 text-white shadow-primary/20";
    }
  };

  return (
    <Link href={getPublicUrl(item)} key={item.id} className="group block h-full">
      <Card className="premium-card h-full p-0 flex flex-col border border-zinc-100/50 rounded-[2rem] overflow-hidden hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-2 transition-all duration-500 bg-white">
        <div className="aspect-[4/3] w-full overflow-hidden bg-zinc-50 relative group-hover:scale-[1.02] origin-bottom transition-transform duration-700">
          {banner ? (
            <div className="absolute inset-0">
              <Image 
                src={banner} 
                alt={item.title} 
                fill
                className="object-cover object-top group-hover:scale-105 transition-ultra"
              />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full bg-linear-to-br from-primary/5 to-primary/10">
              {isEvt ? <Calendar className="h-8 w-8 text-primary/20" /> : <LayoutDashboard className="h-8 w-8 text-primary/20" />}
            </div>
          )}
          
          {/* Subtle Gradient Overlay */}
          <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-ultra" />
          
          <div className="absolute top-4 right-4 z-10">
              <Badge className={cn(
                "backdrop-blur-xl border border-white/30 px-5 py-2.5 rounded-full text-[10px] font-black uppercase shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-500 group-hover:scale-105",
                getBadgeStyles(),
                language === 'kh' ? 'tracking-normal' : 'tracking-[0.2em]'
              )}>
                {typeLabel}
              </Badge>
          </div>
        </div>
        
        <div className="p-6 sm:p-8 flex flex-col flex-1">
          <CardTitle 
            className={cn(
              "text-lg font-black text-foreground line-clamp-2 group-hover:text-primary transition-colors mb-4 leading-snug",
              language === 'kh' ? 'font-kantumruy text-base' : ''
            )}
          >
            {item.title}
          </CardTitle>
          
          <div className="flex items-center justify-between mt-auto pt-6 border-t border-slate-50">
            <span className={cn(
               "flex items-center gap-2 text-[10px] font-black uppercase text-muted-foreground/50 transition-colors group-hover:text-primary/70",
               language === 'kh' ? 'tracking-normal' : 'tracking-[0.2em]'
            )}>
               <Calendar className="h-3.5 w-3.5 opacity-40 group-hover:opacity-100 transition-opacity" />
               {formatDate(date, language)}
            </span>
            <div className="h-10 w-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white transition-ultra group-hover:rotate-[-8deg] shadow-inner group-hover:shadow-lg group-hover:shadow-primary/30">
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

        // Sort by date (Newest first)
        const sorted = [...publishedContents].sort((a, b) => {
          const dateA = new Date(a.createdAt);
          const dateB = new Date(b.createdAt);
          return dateB.getTime() - dateA.getTime();
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
    <div className="flex min-h-screen flex-col bg-zinc-50 text-foreground selection:bg-primary/20">
      {!loading && items.length > 0 && <NewsTicker items={items} />}
      <header className="fixed left-0 right-0 z-50 mx-auto w-full max-w-full lg:max-w-full bg-white/95 backdrop-blur-md border border-zinc-200">
        <div className="flex h-16 sm:h-20 items-center justify-between px-4 sm:px-8">
          <Link href="/" className="flex items-center gap-2 group shrink-0">
            <div className="flex h-9 w-32 sm:h-12 sm:w-64 items-center justify-start overflow-hidden transition-transform group-hover:scale-105">
              <img src="/SIDETH-THEAPKA.png" alt="Logo" className="w-full h-full object-contain object-left" />
            </div>
            <span className="text-lg sm:text-2xl font-black tracking-tighter text-foreground uppercase hidden xs:inline-block">
              {t('app_name')}
            </span>
          </Link>
          
          <nav className="hidden lg:flex items-center gap-10 text-xs font-black uppercase tracking-[0.2em]">
            <Link href="#feed" className="text-zinc-500 hover:text-primary transition-all duration-300 hover:scale-105 active:scale-95">{t('all_events')}</Link>
            <Link href="/support/" className="text-zinc-500 hover:text-primary transition-all duration-300 hover:scale-105 active:scale-95">{t('tech_support')}</Link>
          </nav>
          
          <div className="flex items-center gap-1 sm:gap-4">
            {user && (
              <Link href="/admin/">
                <Button variant="ghost" className="h-9 w-9 sm:h-11 sm:w-auto rounded-full p-0 sm:px-4 flex items-center justify-center border border-zinc-200 font-bold bg-white text-zinc-700 hover:bg-zinc-50 shadow-sm transition-all hover:scale-105 active:scale-95 group">
                   <LayoutDashboard className="h-4 w-4 sm:mr-2 text-primary" />
                   <span className="hidden sm:inline">{t('dashboard') || 'Dashboard'}</span>
                </Button>
              </Link>
            )}
            <Link 
              href="/support/" 
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
          <section className="relative h-svh min-h-150 sm:h-[85vh] sm:min-h-175 overflow-hidden bg-zinc-950 shadow-2xl">
            <div className="absolute inset-0">
              {(isEvent(featuredItem) ? featuredItem.bannerUrl : featuredItem.thumbnail) ? (
                <Image 
                  src={(isEvent(featuredItem) ? featuredItem.bannerUrl : featuredItem.thumbnail) || ""} 
                  alt={featuredItem.title} 
                  fill
                  priority
                  className="object-cover object-top opacity-80 scale-100 group-hover:scale-105 transition-ultra animate-in fade-in zoom-in duration-1000"
                />
              ) : (
                <div className="h-full w-full bg-linear-to-br from-primary/30 to-black" />
              )}
              {/* Simple Dark Overlay for Text Contrast */}
              <div className="absolute inset-0 bg-black/30 z-10" />
              <div className="absolute inset-x-0 bottom-0 h-2/3 bg-linear-to-t from-black/90 via-black/50 to-transparent z-10" />
            </div>

            {bannerItems.length > 1 && (
              <>
                <div className="absolute right-4 bottom-4 sm:left-16 sm:right-auto sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2 z-30 flex sm:flex-col gap-2 sm:gap-6">
                  <button
                    onClick={prevSlide}
                    className="h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-black/40 text-white hover:bg-primary border border-white/10 flex items-center justify-center transition-all hover:scale-105 active:scale-95 group"
                  >
                    <ChevronLeft className="h-6 w-6 group-hover:-translate-x-1 transition-all" />
                  </button>
                  <button
                    onClick={nextSlide}
                    className="h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-black/40 text-white hover:bg-primary border border-white/10 flex items-center justify-center transition-all hover:scale-105 active:scale-95 group"
                  >
                    <ChevronRight className="h-6 w-6 group-hover:translate-x-1 transition-ultra" />
                  </button>
                </div>

                {/* Pagination Indicator */}
                <div className="absolute left-6 bottom-8 sm:left-auto sm:right-16 sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2 z-30 flex sm:flex-col gap-2 sm:gap-4 items-center">
                  {bannerItems.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setFeaturedIndex(idx)}
                      className={cn(
                        "transition-ultra duration-700 rounded-full",
                        idx === featuredIndex ? "w-8 sm:w-2 h-2 sm:h-16 bg-primary shadow-[0_0_30px_rgba(var(--primary),0.8)]" : "w-2 h-2 bg-white/20 hover:bg-white/50"
                      )}
                    />
                  ))}
                </div>
              </>
            )}

            <div className="relative h-full container flex items-center pt-20">
              <div className="max-w-4xl" key={featuredIndex}>
                <div className="flex flex-wrap items-center gap-3 mb-6 animate-in slide-in-from-left-10 duration-1000 relative z-20">
                  <div className="inline-flex items-center gap-3 bg-primary text-white px-5 py-2 rounded-full border border-white/10 shadow-sm">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
                    </span>
                    <span className="text-[10px] uppercase font-black tracking-[0.2em] leading-none">
                      {isEvent(featuredItem) 
                        ? (featuredItem.status === 'active' ? t('active') : t('completed'))
                        : (t(featuredItem.type) || featuredItem.type)
                      }
                    </span>
                  </div>
                  <div className="inline-flex items-center gap-2 bg-black/50 px-5 py-2 rounded-full border border-white/10 shadow-sm text-[10px] uppercase font-bold tracking-[0.2em] leading-none text-white whitespace-nowrap">
                    <Calendar className="h-3.5 w-3.5 opacity-70" />
                    {isEvent(featuredItem) 
                      ? formatDate(featuredItem.eventDate, language)
                      : formatDate(featuredItem.createdAt, language)
                    }
                  </div>
                </div>

                <h1 className={cn(
                  "text-4xl sm:text-5xl lg:text-7xl font-black mb-8 leading-tight tracking-tighter text-white drop-shadow-md animate-in slide-in-from-left-16 duration-1000 delay-100 line-clamp-4 sm:line-clamp-3 max-w-3xl relative z-20",
                  language === 'kh' ? 'font-kantumruy text-2xl sm:text-3xl lg:text-4xl leading-[1.6]' : ''
                )}>
                  {featuredItem.title}
                </h1>

                <div className="flex flex-wrap items-center gap-6 animate-in slide-in-from-bottom-12 duration-1000 delay-200 relative z-20">
                  <Button asChild size="lg" className="bg-primary text-white hover:bg-primary/90 font-bold px-8 py-6 sm:py-4 rounded-full text-[13px] sm:text-base uppercase tracking-widest shadow-md transition-all hover:scale-105 active:scale-95 group w-full sm:w-auto">
                    <Link href={getPublicUrl(featuredItem)}>
                      {t('view_details')}
                      <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-all" />
                    </Link>
                  </Button>
                  {!isEvent(featuredItem) && (
                    <div className="hidden lg:flex items-center gap-4 text-white/40 uppercase font-black text-xs tracking-[0.4em]">
                      <div className="h-px w-12 bg-current" />
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
          <section id="feed" className="py-20 sm:py-32 relative bg-zinc-50 mt-12 sm:mt-16">
            <div className="absolute inset-0 bg-white/40 mask-image-linear-to-b from-transparent to-white" />
            <div className="container mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
              <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-24">
                <h2 className={cn(
                    "text-3xl sm:text-4xl lg:text-5xl font-black tracking-tighter mb-4 sm:mb-6 uppercase text-zinc-900",
                    language === 'kh' ? 'font-kantumruy tracking-normal leading-[1.6]' : ''
                )}>
                  {t('feed_title')}
                </h2>
                <p className="text-lg text-muted-foreground/80 leading-relaxed">
                  {t('feed_desc')}
                </p>
              </div>

              {/* Search & Filter Bar */}
              <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 sm:gap-6 mb-12 sm:mb-16">
                <div className="relative flex-1 w-full md:max-w-xl group">
                  <div className="absolute inset-0 bg-primary/5 rounded-2xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400 group-focus-within:text-primary transition-colors z-10" />
                  <Input 
                    placeholder={t('search_placeholder') || (language === 'kh' ? 'ស្វែងរកកម្មវិធី ឬខ្លឹមសារ...' : 'Search events or content...')}
                    className="pl-14 pr-12 h-14 sm:h-16 rounded-2xl bg-white/80 backdrop-blur-md border border-zinc-200/80 shadow-sm focus:ring-4 focus:ring-primary/10 transition-all duration-300 font-medium text-sm sm:text-base hover:border-primary/30"
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
                      { id: 'article', label: t('filter_articles') || (language === 'kh' ? 'អត្ថបទ' : 'Articles') },
                      { id: 'agenda', label: t('filter_agendas') || (language === 'kh' ? 'កម្មវិធីការងារ' : 'Agendas') },
                      { id: 'wedding', label: t('wedding') || (language === 'kh' ? 'អាពាហ៍ពិពាហ៍' : 'Wedding') },
                      { id: 'funeral', label: t('funeral') || (language === 'kh' ? 'បុណ្យសព' : 'Funeral') },
                    ].map((filter) => (
                      <Button
                        key={filter.id}
                        variant={activeFilter === filter.id ? 'default' : 'outline'}
                        onClick={() => setActiveFilter(filter.id)}
                        className={cn(
                          "rounded-full h-12 px-7 font-black uppercase text-[10px] tracking-widest whitespace-nowrap transition-all duration-300 border",
                          activeFilter === filter.id 
                            ? "bg-primary text-white shadow-[0_8px_20px_rgb(var(--primary)/0.25)] border-transparent scale-105" 
                            : "bg-white border-zinc-200/80 text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900 hover:border-zinc-300"
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

      <footer className="bg-white py-16 sm:py-20 border-t border-zinc-100 mt-auto relative z-10 w-full">
        <div className="container mx-auto max-w-7xl px-8 lg:px-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 mb-16">
            
            {/* Branding - Takes up more space on desktop */}
            <div className="sm:col-span-2 lg:col-span-4 space-y-6">
              <Link href="/" className="inline-block hover:opacity-80 transition-opacity">
                <div className="flex h-12 sm:h-14 items-center justify-start overflow-hidden">
                  <img src="/SIDETH-THEAPKA.png" alt="Logo" className="h-full w-auto object-contain object-left" />
                </div>
              </Link>
              <p className="text-sm text-zinc-500 leading-relaxed max-w-xs">
                {language === 'kh' 
                  ? "ប្រព័ន្ធគ្រប់គ្រងកម្មវិធីឌីជីថលផ្តល់នូវបទពិសោធន៍ថ្មីសម្រាប់គ្រប់កម្មវិធីរបស់អ្នក។"
                  : "Digital Event Companion providing a seamless experience for all your ceremonies."}
              </p>
            </div>

            {/* Support Links */}
            <div className="sm:col-span-1 lg:col-span-4 lg:col-start-6 space-y-6">
              <h4 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-900">{t('tech_support')}</h4>
              
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-zinc-50 flex items-center justify-center text-primary border border-zinc-100 shrink-0">
                    <Phone className="h-[18px] w-[18px]" />
                  </div>
                  <span className="text-sm font-bold text-zinc-600">098 943 324</span>
                </div>
                
                <div className="pt-2">
                  <div className="h-30 w-30 bg-white p-2.5 rounded-[1.2rem] border border-zinc-200/80 shadow-sm overflow-hidden flex items-center justify-center relative group isolate">
                    <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity z-[-1]" />
                    <Image 
                      src="/mengley.svg" 
                      alt="Support QR" 
                      width={100} 
                      height={100} 
                      className="object-contain"
                    />
                  </div>
                  <p className="text-[10px] font-bold text-zinc-400 mt-4 uppercase tracking-[0.15em] pl-1">SCAN FOR SUPPORT</p>
                </div>
              </div>
            </div>

            {/* Info */}
            <div className="sm:col-span-1 lg:col-span-3 space-y-6">
              <h4 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-900">System Info</h4>
              <div className="space-y-3">
                <p className="text-xs text-zinc-500 font-medium tracking-wide">Version 1.0.0 — Private Client</p>
                <div className="flex items-center gap-2 pt-1 text-[10px] text-emerald-600 font-bold uppercase tracking-[0.15em]">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse"></span>
                  System Online
                </div>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-zinc-100 flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left">
            <p className="text-[11px] font-medium text-zinc-400 tracking-wide">
              © {new Date().getFullYear()} — {t('all_rights_reserved')}
            </p>
            <p className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest">
               Developed for Private Client
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
