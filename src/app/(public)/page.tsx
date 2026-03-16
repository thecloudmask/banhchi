"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  LayoutDashboard,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Phone,
  MessageCircle,
  Search,
  X,
  LifeBuoy,
  Zap,
  ShieldCheck,
  Smartphone,
  CheckCircle2,
} from "lucide-react";
import { Card, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getEvents } from "@/services/event.service";
import { Event } from "@/types";
import { useMemo, useState, useEffect } from "react";
import { formatDateTime, cn, stripHtml } from "@/lib/utils";
import Image from "next/image";
import { useAuth } from "@/providers/auth-provider";
import { Badge } from "@/components/ui/badge";
import { getAllContents, Content } from "@/services/content.service";
import { NewsTicker } from "@/components/news-ticker";
import { PublicHeader } from "@/components/layout/public-header";
import { compressImage } from "@/lib/cloudinary";

// Helper type guard
function isEvent(item: any): item is Event {
  return !!(item.eventDate || item.category || item._source === "events");
}

// Helper: returns the correct public URL based on item category/type
function getPublicUrl(item: Event | Content): string {
  const isEvt = isEvent(item);
  const id = item.id;
  if (isEvt) {
    switch (item.category) {
      case "wedding":
        return `/wedding/${id}`;
      case "buddhist":
        return `/merit-making/${id}`;
      default:
        return `/event/${id}`;
    }
  }
  switch ((item as Content).type) {
    case "wedding":
      return `/wedding/${id}`;
    case "funeral":
      return `/funeral/${id}`;
    case "article":
      return `/article/${id}`;
    default:
      return `/event/${id}`;
  }
}

function FeedSkeleton() {
  return (
    <div className="space-y-10 animate-pulse">
      <div className="lg:col-span-2 h-100 bg-muted/20 rounded-md border border-border/50" />
      <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-100 bg-muted/10 rounded-md border border-border/20"
          />
        ))}
      </div>
    </div>
  );
}

function FeedCard({
  item,
  featured = false,
}: {
  item: Event | Content;
  featured?: boolean;
}) {
  const isEvt = isEvent(item);
  const rawBanner = isEvt ? item.bannerUrl : item.thumbnail;
  const banner = rawBanner
    ? compressImage(rawBanner, featured ? "banner" : "thumbnail")
    : null;
  const date = isEvt ? item.eventDate : item.createdAt;

  const getLabel = (type: string) => {
    const labels: Record<string, string> = {
      wedding: "អាពាហ៍ពិពាហ៍",
      buddhist: "បុណ្យទាន",
      article: "អត្ថបទចំណេះដឹង",
      agenda: "កម្មវិធីបុណ្យ",
      poster: "ផ្សព្វផ្សាយ",
      active: "កំពុងប្រារព្ធ",
      completed: "បានបញ្ចប់",
      event: "កម្មវិធី",
    };
    return labels[type] || type;
  };

  const typeLabel = isEvt
    ? getLabel(item.category || "event")
    : getLabel((item as Content).type);

  const getBadgeStyles = () => {
    if (isEvt) {
      switch (item.category) {
        case "wedding":
          return "bg-primary text-primary-foreground shadow-primary/20";
        case "buddhist":
          return "bg-amber-500 text-white shadow-amber-500/20";
        default:
          return "bg-blue-500 text-white shadow-blue-500/20";
      }
    }
    switch (item.type) {
      case "article":
        return "bg-primary text-primary-foreground shadow-primary/20";
      case "agenda":
        return "bg-emerald-500 text-white shadow-emerald-500/20";
      default:
        return "bg-slate-700 text-white shadow-slate-500/10";
    }
  };

  return (
    <Link
      href={getPublicUrl(item)}
      key={item.id}
      className={cn(
        "group block h-full isolate transition-all duration-500",
        featured ? "lg:col-span-2" : "",
      )}
    >
      <Card
        className={cn(
          "h-full p-0 flex flex-col border border-border/50 rounded-md overflow-hidden hover:border-primary/50 transition-all duration-300 bg-card/50 backdrop-blur-sm shadow-sm hover:-translate-y-1",
          featured ? "md:flex-row min-h-112.5" : "flex-col",
        )}
      >
        <div
          className={cn(
            "overflow-hidden bg-muted/20 relative",
            featured ? "md:w-3/5" : "aspect-16/10 w-full",
          )}
        >
          {banner ? (
            <div className="absolute inset-0">
              <Image
                src={banner}
                alt={item.title}
                fill
                priority={featured}
                className="object-cover object-top group-hover:scale-110 transition-all duration-1000"
              />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full bg-linear-to-br from-foreground/5 to-foreground/10">
              {isEvt ? (
                <Calendar className="h-8 w-8 text-foreground/10" />
              ) : (
                <LayoutDashboard className="h-8 w-8 text-foreground/10" />
              )}
            </div>
          )}

          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-background via-transparent to-transparent opacity-80" />

          {/* Type Badge */}
          <div className="absolute top-5 left-5 z-10">
            <Badge
              className={cn(
                "border border-white/10 px-6 py-2 rounded-md text-[10px] font-black uppercase shadow-lg backdrop-blur-md",
                getBadgeStyles(),
              )}
            >
              <span>{typeLabel}</span>
            </Badge>
          </div>

          {/* Indicators Bar */}
          <div className="absolute top-5 right-5 z-10 flex items-center gap-2">
            {/* Payment Indicator */}
            {isEvt && item.bankQrUrl && (
              <div className="h-8 w-8 rounded-md bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-lg animate-in fade-in zoom-in duration-500">
                <Smartphone className="h-4 w-4" />
              </div>
            )}

            {/* Event Status */}
            {isEvt && item.status && (
              <div
                className={cn(
                  "px-4 py-1.5 rounded-md text-[9px] font-black uppercase backdrop-blur-md border shadow-lg",
                  item.status === "active"
                    ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                    : "bg-muted/50 text-muted-foreground border-border/50",
                )}
              >
                <div className="flex items-center gap-2">
                  {item.status === "active" && (
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                    </span>
                  )}
                  <span>{getLabel(item.status)}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div
          className={cn(
            "p-8 sm:p-10 flex flex-col flex-1",
            featured ? "md:w-2/5 justify-center" : "",
          )}
        >
          {/* Location if it's an event */}
          {isEvt && item.location && (
            <div className="flex items-center gap-2 text-[10px] font-bold text-primary uppercase mb-4 opacity-70">
              <span className="h-1 w-1 rounded-full bg-primary" />
              <span>{item.location}</span>
            </div>
          )}

          <CardTitle
            className={cn(
              "font-black text-foreground line-clamp-2 group-hover:text-primary transition-colors mb-4 leading-relaxed font-kantumruy",
              featured ? "text-2xl md:text-3xl lg:text-4xl" : "text-xl",
            )}
          >
            <span>{item.title}</span>
          </CardTitle>

          {((!isEvt && (item as Content).description) ||
            (isEvt && featured && item.description)) && (
            <p className="text-sm text-muted-foreground/80 line-clamp-2 md:line-clamp-3 mb-6 font-medium leading-relaxed">
              {stripHtml((item as any).description)}
            </p>
          )}

          {featured && (
            <div className="hidden md:block mb-8">
              <div className="inline-flex items-center gap-2 text-primary text-[10px] font-black uppercase group-hover:gap-4 transition-all">
                <span>មើលព័ត៌មានលម្អិត</span>
                <ArrowRight className="h-4 w-4" />
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mt-auto pt-8 border-t border-border/50">
            <div className="flex flex-col gap-1">
              <span className="text-[9px] font-black text-muted-foreground/40 uppercase">
                {isEvt ? "កាលបរិច្ឆេទកម្មវិធី" : "ចេញផ្សាយនៅ"}
              </span>
              <span
                className={cn(
                  "flex items-center gap-2.5 text-[10px] font-black uppercase text-muted-foreground transition-colors group-hover:text-foreground",
                )}
              >
                <Calendar className="h-4 w-4 text-primary opacity-60 group-hover:opacity-100" />
                <span>{formatDateTime(date)}</span>
              </span>
            </div>
            <div className="h-10 w-10 rounded-md bg-muted/30 border border-border flex items-center justify-center text-muted-foreground group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all">
              <ArrowRight className="h-5 w-5" />
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}

export default function Home() {
  const { signIn, signInWithGoogle, user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [items, setItems] = useState<(Event | Content)[]>([]);
  const [loading, setLoading] = useState(true);
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  useEffect(() => {
    async function fetchData() {
      try {
        const eventsPromise = getEvents();
        const contentsPromise = getAllContents();

        const [eventsResult, contentsResult] = await Promise.allSettled([
          eventsPromise,
          contentsPromise,
        ]);

        const eventsData =
          eventsResult.status === "fulfilled" ? eventsResult.value : [];
        const contentsData =
          contentsResult.status === "fulfilled" ? contentsResult.value : [];

        if (eventsResult.status === "rejected")
          console.error("Events fetch failed:", eventsResult.reason);
        if (contentsResult.status === "rejected")
          console.error("Contents fetch failed:", contentsResult.reason);

        const publishedContents = contentsData.filter(
          (c) => c.status === "published",
        );
        const combined = [...eventsData, ...publishedContents];

        const sorted = combined.sort((a, b) => {
          const getD = (item: Event | Content) => {
            const d = isEvent(item) ? item.eventDate : item.createdAt;
            if (!d) return 0;
            const timestamp = (d as any)?.seconds
              ? (d as any).seconds * 1000
              : d;
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

  const dynamicFilters = useMemo(() => {
    if (items.length === 0) return [{ id: "all", label: "ទាំងអស់" }];

    const groupMap: Record<string, string> = {
      buddhist: "buddhist",
      "merit-making": "buddhist",
      merit_making: "buddhist",
      agenda: "buddhist",
      memorial: "buddhist",
      funeral: "buddhist",
      inauguration: "buddhist",
    };

    const types = items
      .map((item) => {
        const rawType = isEvent(item) ? item.category : (item as Content).type;
        return groupMap[rawType || ""] || rawType;
      })
      .filter(Boolean) as string[];

    const uniqueTypes = Array.from(new Set(types));

    return [
      { id: "all", label: "ទាំងអស់" },
      ...uniqueTypes.map((type) => ({
        id: type,
        label:
          (
            {
              wedding: "អាពាហ៍ពិពាហ៍",
              buddhist: "កម្មវិធីបុណ្យ",
              article: "អត្ថបទចំណេះដឹង",
              poster: "ផ្សព្វផ្សាយ",
            } as Record<string, string>
          )[type] || type,
      })),
    ];
  }, [items]);

  const bannerItems = items.filter((item) => {
    if (isEvent(item)) return true;
    return item.type !== "article";
  });

  useEffect(() => {
    if (bannerItems.length <= 1) return;
    const interval = setInterval(() => {
      setFeaturedIndex((prev) => (prev + 1) % bannerItems.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [bannerItems.length]);

  const { ceremonies, articles } = useMemo(() => {
    const evts = items.filter(isEvent);
    const arts = items.filter((i) => !isEvent(i));
    return { ceremonies: evts, articles: arts };
  }, [items]);

  const filteredCeremonies = ceremonies.filter((item) => {
    const title = (item.title || "").toLowerCase();
    const query = (searchQuery || "").toLowerCase();
    const matchesSearch = title.includes(query);
    if (!matchesSearch) return false;

    if (activeFilter === "all" || activeFilter === "event") return true;

    const groupMap: Record<string, string> = {
      buddhist: "buddhist",
      "merit-making": "buddhist",
      merit_making: "buddhist",
      agenda: "buddhist",
      memorial: "buddhist",
      funeral: "buddhist",
      inauguration: "buddhist",
    };
    const group = groupMap[item.category || ""] || item.category;
    return group === activeFilter;
  });

  const filteredArticles = articles.filter((item) => {
    const title = (item.title || "").toLowerCase();
    const query = (searchQuery || "").toLowerCase();
    const description = (item as Content).description?.toLowerCase() || "";
    const matchesSearch = title.includes(query) || description.includes(query);
    if (!matchesSearch) return false;

    if (
      activeFilter === "all" ||
      activeFilter === "content" ||
      activeFilter === "article"
    )
      return true;

    const groupMap: Record<string, string> = {
      buddhist: "buddhist",
      "merit-making": "buddhist",
      merit_making: "buddhist",
      agenda: "buddhist",
      memorial: "buddhist",
      funeral: "buddhist",
      inauguration: "buddhist",
    };
    const group =
      groupMap[(item as Content).type || ""] || (item as Content).type;
    return group === activeFilter;
  });

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground selection:bg-primary/20 font-kantumruy overflow-x-hidden">
      {!loading && items.length > 0 && <NewsTicker items={items} />}

      <PublicHeader
        nav={
          <nav className="flex flex-col lg:flex-row lg:items-center gap-2 lg:gap-10">
            {[
              { id: "feed", label: "កម្មវិធីទាំងអស់" },
              { id: "features", label: "មុខងារពិសេស" },
            ].map((section) => (
              <Link
                key={section.id}
                href={`#${section.id}`}
                className="py-3 lg:py-0 text-[13px] font-bold uppercase text-muted-foreground/60 hover:text-primary transition-all duration-300 relative group/link font-kantumruy"
              >
                <span>{section.label}</span>
                <span className="absolute -bottom-1 left-0 w-0 h-px bg-primary transition-all duration-300 group-hover/link:w-full hidden lg:block" />
              </Link>
            ))}
          </nav>
        }
        actions={
          <div className="flex items-center gap-3">
            {user ? (
              <Link href="/admin/">
                <Button className="h-11 px-6 rounded-md bg-primary hover:bg-primary/90 text-white font-black text-[10px] uppercase shadow-xl shadow-primary/20 group">
                  <LayoutDashboard className="h-4 w-4 mr-2.5 group-hover:rotate-12 transition-transform" />
                  <span>ផ្ទាំងគ្រប់គ្រង</span>
                </Button>
              </Link>
            ) : (
              <Button
                onClick={() => router.push("/support")}
                className="h-11 px-6 rounded-md bg-primary hover:bg-primary/90 text-white font-black text-[10px] uppercase shadow-xl shadow-primary/20"
              >
                <span>ទំនាក់ទំនងយើង</span>
              </Button>
            )}
          </div>
        }
      />

      <main className="flex-1">
        {/* Modern Hero Section */}
        <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
          {/* Animated Background Decorations */}
          <div className="absolute top-1/4 -right-20 w-96 h-96 bg-primary/10 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-1/4 -left-20 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] animate-pulse delay-1000" />

          <div className="container mx-auto px-6 lg:px-12 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
              <div className="lg:col-span-7 space-y-10 text-center lg:text-left">
                <div className="inline-flex items-center gap-3 bg-primary/5 border border-primary/20 px-6 py-2.5 rounded-md text-primary font-black text-[10px] uppercase animate-in fade-in slide-in-from-left-4 duration-700">
                  <Zap className="h-4 w-4 fill-current" />
                  <span>The Future of Event Management</span>
                </div>

                <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-foreground leading-[1.4] uppercase font-kantumruy animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
                  <span className="text-4xl md:text-6xl lg:text-7xl font-black text-primary leading-[1.4] uppercase font-kantumruy animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
                    មត៌ត ធៀបការ
                  </span>
                  ដៃគូឌីជីថលសម្រាប់គ្រប់កម្មវិធីមង្គលរបស់អ្នក
                </h1>

                <p className="text-xl text-muted-foreground max-w-2xl mx-auto lg:mx-0 leading-relaxed font-medium animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
                  ប្រែក្លាយការគ្រប់គ្រងកម្មវិធីបែបប្រពៃណី
                  ឱ្យទៅជាសម័យកាលឌីជីថលដ៏ឆ្លាតវៃ និងសាមញ្ញ។
                </p>

                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 pt-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
                  <Button
                    size="lg"
                    className="h-16 px-10 rounded-md bg-primary text-white font-black text-sm uppercase shadow-2xl shadow-primary/30 group"
                  >
                    <Link href="#feed" className="flex items-center gap-3">
                      ស្វែងរកកម្មវិធីថ្មីៗ
                      <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="h-16 px-10 rounded-md border-border bg-card/50 backdrop-blur-sm font-black text-sm uppercase hover:bg-muted transition-all"
                  >
                    <Link href="/support">ជំនាញបច្ចេកទេស</Link>
                  </Button>
                </div>

                <div className="flex items-center justify-center lg:justify-start gap-8 pt-8 opacity-40 grayscale animate-in fade-in duration-1000 delay-500">
                  <div className="flex items-center gap-2 font-black text-xs uppercase">
                    <ShieldCheck className="h-5 w-5" /> Secured
                  </div>
                  <div className="flex items-center gap-2 font-black text-xs uppercase">
                    <Zap className="h-5 w-5" /> Fast
                  </div>
                  <div className="flex items-center gap-2 font-black text-xs uppercase">
                    <CheckCircle2 className="h-5 w-5" /> Trusted
                  </div>
                </div>
              </div>

              {/* Visual Element - Glass Cards */}
              <div className="lg:col-span-5 relative hidden lg:block animate-in fade-in zoom-in duration-1000">
                <div className="relative aspect-square">
                  <div className="absolute top-0 right-0 w-full h-full bg-linear-to-br from-primary/20 to-transparent rounded-md rotate-6 border border-primary/10 backdrop-blur-3xl" />
                  <div className="absolute inset-4 bg-card rounded-md border border-border shadow-2xl flex items-center justify-center overflow-hidden">
                    <Image
                      src="/SIDETH-THEAPKA.png"
                      alt="Hero Brand"
                      width={400}
                      height={200}
                      priority
                      className="object-contain dark:brightness-200 p-12"
                    />
                  </div>
                  {/* Floating Info Cards */}
                  <div className="absolute -top-10 -left-10 p-6 bg-card/80 backdrop-blur-xl border border-white/20 rounded-md shadow-2xl animate-bounce-slow">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-md bg-emerald-500/20 text-emerald-500 flex items-center justify-center">
                        <Zap className="h-6 w-6" />
                      </div>
                      <div>
                        <div className="text-[10px] font-black text-muted-foreground uppercase">
                          Instant Access
                        </div>
                        <div className="text-sm font-black">
                          Digital Invitations
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="absolute -bottom-10 -right-10 p-6 bg-card/80 backdrop-blur-xl border border-white/20 rounded-md shadow-2xl animate-bounce-slow delay-500">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-md bg-primary/20 text-primary flex items-center justify-center">
                        <Smartphone className="h-6 w-6" />
                      </div>
                      <div>
                        <div className="text-[10px] font-black text-muted-foreground uppercase">
                          Smart Tracking
                        </div>
                        <div className="text-sm font-black">Live Updates</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-32 relative bg-card/30">
          <div className="container mx-auto px-6 lg:px-12">
            <div className="text-center max-w-3xl mx-auto mb-24">
              <h2 className="text-3xl md:text-5xl font-black mb-6 uppercase font-kantumruy leading-relaxed">
                គោលបំណងរបស់យើង
              </h2>
              <div className="h-1.5 w-24 bg-primary mx-auto rounded-full mb-8" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {[
                {
                  icon: <Zap className="h-6 w-6" />,
                  title: "ការតាមដានរហ័ស",
                  desc: "គ្រប់គ្រងចំណូល-ចំណាយ និងស្ថិតិកម្មវិធីបានភ្លាមៗក្នុងដៃអ្នក។",
                  color: "primary",
                },
                {
                  icon: <Smartphone className="h-6 w-6" />,
                  title: "ធៀបកាឌីជីថល",
                  desc: "ផ្ញើសំបុត្រអញ្ជើញ និងទទួលការដឹងគុណពីភ្ញៀវតាមរយៈ QR Code។",
                  color: "emerald",
                },
                {
                  icon: <ShieldCheck className="h-6 w-6" />,
                  title: "សុវត្ថិភាពខ្ពស់",
                  desc: "ទិន្នន័យរបស់អ្នកត្រូវបានកូដនីយកម្ម និងរក្សាទុកដោយសុវត្ថិភាពបំផុត។",
                  color: "blue",
                },
              ].map((f, i) => (
                <div
                  key={i}
                  className="group p-10 rounded-md bg-background border border-border hover:border-primary/30 hover:shadow-2xl transition-all duration-500"
                >
                  <div
                    className={cn(
                      "h-16 w-16 rounded-md flex items-center justify-center mb-8 transition-all group-hover:scale-110",
                      f.color === "primary"
                        ? "bg-primary/10 text-primary"
                        : f.color === "emerald"
                          ? "bg-emerald-500/10 text-emerald-500"
                          : "bg-blue-500/10 text-blue-500",
                    )}
                  >
                    {f.icon}
                  </div>
                  <h3 className="text-2xl font-black mb-4 font-kantumruy">
                    {f.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed font-medium">
                    {f.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Feed Section */}
        <section id="feed" className="py-32 relative">
          <div className="container mx-auto max-w-7xl px-6 lg:px-12 relative z-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20">
              <div className="max-w-2xl">
                <h2 className="text-3xl md:text-6xl font-black mb-6 uppercase font-kantumruy">
                  ស្វែងរកកម្មវិធី និងចំណេះដឹង
                </h2>
                <p className="text-lg text-muted-foreground font-medium">
                  ចូលរួមជាមួយពួកយើង ដើម្បីទទួលបានបទពិសោធន៍ថ្មីៗ។
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 flex-1 md:max-w-lg lg:max-w-xl">
                <div className="relative flex-1 group">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
                  <Input
                    placeholder="ស្វែងរកកម្មវិធី ឬអត្ថបទ..."
                    className="pl-12 pr-12 h-14 rounded-md bg-muted/30 border-transparent focus:bg-card focus:border-primary/30"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-4 top-1/2 -translate-y-1/2 h-8 w-8 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground/50"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-3 mb-16 overflow-x-auto pb-4 scrollbar-hide">
              {dynamicFilters.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setActiveFilter(filter.id)}
                  className={cn(
                    "px-8 h-12 rounded-md font-black uppercase text-[10px] whitespace-nowrap transition-all border",
                    activeFilter === filter.id
                      ? "bg-primary text-white border-primary shadow-lg shadow-primary/20"
                      : "bg-muted/30 text-muted-foreground border-transparent hover:bg-muted",
                  )}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            {loading ? (
              <FeedSkeleton />
            ) : (
              <div className="space-y-24">
                {/* Ceremonies Section */}
                {filteredCeremonies.length > 0 && (
                  <div className="space-y-12">
                    <div className="flex items-center gap-4">
                      <div className="h-px flex-1 bg-border/50" />
                      <h3 className="text-xs font-black uppercase text-primary/60 px-4">
                        កម្មវិធីមង្គល
                      </h3>
                      <div className="h-px flex-1 bg-border/50" />
                    </div>
                    <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
                      {filteredCeremonies.map((item, index) => (
                        <FeedCard
                          key={item.id}
                          item={item}
                          featured={
                            index === 0 &&
                            searchQuery === "" &&
                            activeFilter === "all"
                          }
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Knowledge Hub Section */}
                {filteredArticles.length > 0 && (
                  <div className="space-y-12">
                    <div className="flex items-center gap-4">
                      <div className="h-px flex-1 bg-border/50" />
                      <h3 className="text-xs font-black uppercase text-primary/60 px-4">
                        បណ្ណាល័យចំណេះដឹង
                      </h3>
                      <div className="h-px flex-1 bg-border/50" />
                    </div>
                    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                      {filteredArticles.map((item) => (
                        <FeedCard key={item.id} item={item} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {!loading &&
              filteredCeremonies.length === 0 &&
              filteredArticles.length === 0 && (
                <div className="py-32 text-center rounded-md border border-dashed border-border flex flex-col items-center">
                  <div className="h-20 w-20 bg-muted/50 rounded-md flex items-center justify-center mb-8">
                    <Search className="h-8 w-8 text-muted-foreground/30" />
                  </div>
                  <h3 className="text-2xl font-black mb-2 uppercase font-kantumruy">
                    មិនមានលទ្ធផល
                  </h3>
                  <p className="text-muted-foreground font-medium mb-8 max-w-xs mx-auto">
                    សូមព្យាយាមស្វែងរកពាក្យផ្សេងទៀត។
                  </p>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setSearchQuery("");
                      setActiveFilter("all");
                    }}
                    className="text-primary font-black uppercase text-xs"
                  >
                    សម្អាតការស្វែងរក
                  </Button>
                </div>
              )}
          </div>
        </section>

        {/* Ready to Start Section */}
        <section className="py-40 relative">
          <div className="container mx-auto px-6 max-w-6xl">
            <div className="relative rounded-md bg-linear-to-br from-primary to-rose-600 p-12 md:p-24 overflow-hidden text-center text-white shadow-2xl">
              {/* Decorative Blobs */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 blur-[100px] rounded-full -mr-48 -mt-48" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 blur-[80px] rounded-full -ml-32 -mb-32" />

              <div className="relative z-10 space-y-10">
                <h2 className="text-4xl md:text-7xl font-black uppercase font-kantumruy leading-[1.6]">
                  តើអ្នកត្រៀមខ្លួនហើយឬនៅ?
                </h2>
                <p className="text-xl md:text-2xl text-white/80 font-medium max-w-2xl mx-auto">
                  ចូលរួមជាមួយគ្រួសាររាប់រយដែលកំពុងប្រើប្រាស់ ស៊ីដេត-ធៀបកា
                  ដើម្បីកម្មវិធីដ៏មានន័យ។
                </p>
                <div className="flex flex-wrap justify-center gap-6 pt-6">
                  <Button
                    size="lg"
                    className="h-16 px-12 rounded-md bg-white text-primary hover:bg-zinc-50 font-black text-sm uppercase shadow-2xl"
                  >
                    <Link href="/support">បង្កើតកម្មវិធីឥឡូវនេះ</Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="h-16 px-12 rounded-md border-white/30 bg-white/10 backdrop-blur-md text-white hover:bg-white/20 font-black text-sm uppercase transition-all"
                  >
                    <Link href="/support">ជំនាញបច្ចេកទេស</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
