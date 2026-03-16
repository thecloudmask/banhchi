"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { getEventById } from "@/services/event.service";
import {
  getContentsByEventId,
  getContentById,
  Content,
} from "@/services/content.service";
import { Event } from "@/types";
import { useLanguage } from "@/providers/language-provider";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  Calendar,
  MapPin,
  ArrowLeft,
  Clock,
  Share2,
  Lock,
  ArrowRight,
  Heart,
} from "lucide-react";
import { formatDateTime, cn } from "@/lib/utils";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { AgendaRenderer } from "../components/rendering/agenda-renderer";
import { ArticleRenderer } from "../components/rendering/article-renderer";
import { PublicHeader } from "@/components/layout/public-header";
import { PublicFooter } from "@/components/layout/public-footer";

const getCategoryTheme = (category?: string) => {
  const themes: Record<
    string,
    {
      primary: string;
      accent: string;
      bg: string;
      card: string;
      badge: string;
      icon: string;
      button: string;
    }
  > = {
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

  return (
    themes[category || "default"] || {
      primary: "text-blue-500",
      accent: "bg-blue-500/10",
      bg: "bg-background",
      card: "bg-card border-border shadow-2xl",
      badge: "bg-slate-700 text-white shadow-slate-500/10",
      icon: "text-blue-500",
      button: "bg-blue-500 hover:bg-blue-600 shadow-blue-500/20",
    }
  );
};

export default function PublicEventClient() {
  const params = useParams();
  const rawId = params.id;
  const eventId = Array.isArray(rawId)
    ? rawId[0]
    : (rawId as string | undefined);
  const { t, language } = useLanguage();

  const [event, setEvent] = useState<Event | null>(null);
  const [content, setContent] = useState<Content | null>(null);
  const [relatedContents, setRelatedContents] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [pin, setPin] = useState("");
  const [unlocking, setUnlocking] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [hideLayout, setHideLayout] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (hideLayout) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [hideLayout]);

  useEffect(() => {
    const fetchData = async () => {
      if (!eventId) return;

      try {
        setLoading(true);
        const eventData = await getEventById(eventId);

        if (eventData) {
          const contentsData = await getContentsByEventId(eventId);
          setEvent(eventData);
          setRelatedContents(contentsData || []);

          if (contentsData && contentsData.length > 0) {
            setContent(contentsData[0]);
            // Lock the page if the event has a passcode
            setIsLocked(!!(eventData.passcode && eventData.passcode.trim() !== ""));
          }
        } else {
          const contentData = await getContentById(eventId);
          if (contentData) {
            setContent(contentData);

            if (contentData.eventId) {
              const [eData, cData] = await Promise.all([
                getEventById(contentData.eventId),
                getContentsByEventId(contentData.eventId),
              ]);
              setEvent(eData);
              setRelatedContents(cData || []);
              // Lock based on passcode of the parent event
              if (eData?.passcode && eData.passcode.trim() !== "") {
                setIsLocked(true);
              }
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

  const theme = useMemo(
    () => getCategoryTheme(event?.category),
    [event?.category],
  );

  const effectiveContent = useMemo(() => {
    if (content) return content;
    if (
      event &&
      [
        "wedding",
        "buddhist",
        "funeral",
        "memorial",
        "inauguration",
        "custom",
      ].includes(event.category || "")
    ) {
      return {
        id: `v-${event.id}`,
        title: event.title,
        type:
          event.category === "buddhist"
            ? "agenda"
            : event.category === "custom"
              ? "article"
              : event.category,
        contentData: event.extraData || {},
        status: "published",
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
      if (event?.passcode && pin === event.passcode) {
        setIsLocked(false);
      } else {
        toast.error(t("invalid_pin"));
        setPin("");
      }
      setUnlocking(false);
    }, 800);
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
      toast.success(t("link_copied"));
    }
  };

  if (loading || !mounted)
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-6 opacity-60" />
        <span className="text-muted-foreground font-black uppercase text-xs">
          <span>{t("loading")}</span>
        </span>
      </div>
    );

  if (!eventId || (!event && !content))
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 text-center">
        <div className="h-24 w-24 bg-card border border-border rounded-3xl flex items-center justify-center mx-auto mb-8 text-muted-foreground">
          <Calendar className="h-10 w-10" />
        </div>
        <h2 className="text-2xl font-black text-foreground uppercase mb-8">
          <span>{t("not_found")}</span>
        </h2>
        <Link href="/">
          <Button
            variant="outline"
            className="h-14 px-8 rounded-2xl border-border hover:bg-accent uppercase font-black text-xs shadow-xl"
          >
            <span>{t("back_to_home")}</span>
          </Button>
        </Link>
      </div>
    );

  if (isLocked) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 sm:p-12 font-kantumruy">
        <Card className="w-full max-w-lg rounded-[2.5rem] bg-card border border-border shadow-2xl p-10 sm:p-16 text-center animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="mb-10">
            <div className="h-20 w-20 bg-muted/50 border border-primary/20 rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 text-primary shadow-xl shadow-primary/10">
              <Lock className="h-10 w-10" />
            </div>
            <h1 className="text-2xl font-black text-foreground uppercase mb-2">
              <span>{t("content_protected")}</span>
            </h1>
            <p className="text-muted-foreground text-xs uppercase font-bold">
              <span>Encrypted Data Access Required</span>
            </p>
          </div>
          <form onSubmit={handleUnlock} className="space-y-6">
            <div className="space-y-2 text-left">
              <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">
                <span>Access PIN</span>
              </label>
              <Input
                type="password"
                placeholder="••••"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="h-16 text-center text-3xl font-black rounded-2xl bg-muted/50 border-border text-foreground placeholder:text-muted-foreground/30 focus:border-primary focus:ring-primary/20"
                maxLength={4}
              />
            </div>
            <Button
              className="w-full h-16 rounded-2xl font-black bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20 text-white uppercase text-xs"
              disabled={unlocking}
            >
              {unlocking ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <span>{t("enter")}</span>
              )}
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  const isAgenda =
    effectiveContent?.type === "agenda" ||
    effectiveContent?.type === "wedding" ||
    effectiveContent?.type === "funeral";

  if (effectiveContent) {
    return (
      <div className="min-h-screen bg-background text-foreground selection:bg-primary/20 overflow-x-hidden font-kantumruy">
        {!hideLayout && (
          <PublicHeader
            actions={
              <Button
                variant="ghost"
                size="icon"
                onClick={handleShare}
                className="rounded-xl h-10 w-10 sm:h-12 sm:w-12 bg-muted/50 border border-border hover:bg-muted text-foreground transition-all hover:scale-105"
              >
                <Share2 className="h-5 w-5" />
              </Button>
            }
          />
        )}

        <main
          className={cn(
            "container mx-auto px-0 sm:px-12",
            !hideLayout && "py-24 sm:py-32",
          )}
        >
          <div className="max-w-4xl mx-auto space-y-24 sm:space-y-32">
            {isAgenda ? (
              <AgendaRenderer
                content={effectiveContent}
                event={event!}
                theme={theme}
                onCoverStateChange={(shown: boolean) => setHideLayout(shown)}
              />
            ) : (
              <ArticleRenderer
                content={effectiveContent}
                event={event!}
                theme={theme}
              />
            )}

            {/* Related Contents Section */}
            {relatedContents.filter((c) => c.id !== content?.id).length > 0 && (
              <div className="space-y-12 sm:space-y-20 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300 px-6 sm:px-0">
                <div className="flex flex-col items-center gap-6 text-center">
                  <div className="h-1.5 w-16 bg-primary rounded-full" />
                  <div className="space-y-2">
                    <h3 className="text-xl sm:text-3xl font-black text-foreground uppercase leading-none">
                      <span>
                        {language === "kh"
                          ? "អត្ថបទ និងរឿងរ៉ាវពាក់ព័ន្ធ"
                          : "Related Stories"}
                      </span>
                    </h3>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase">
                      <span>
                        {language === "kh"
                          ? "ស្វែងយល់បន្ថែមអំពីកម្មវិធីនេះ"
                          : "Discover more about this event"}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="grid gap-10 sm:grid-cols-2">
                  {relatedContents
                    .filter((c) => c.id !== content?.id)
                    .map((item) => (
                      <Link
                        key={item.id}
                        href={`/event/${item.id}`}
                        className="group"
                      >
                        <Card className="h-full overflow-hidden border-border bg-card/40 backdrop-blur-xl hover:bg-card hover:border-primary/20 transition-all duration-700 hover:shadow-[0_20px_50px_rgba(244,31,77,0.1)] hover:-translate-y-2 rounded-[2.5rem]">
                          <CardContent className="p-0 flex flex-col h-full">
                            <div className="aspect-4/3 relative overflow-hidden bg-muted/20">
                              {item.thumbnail ? (
                                <Image
                                  src={item.thumbnail}
                                  alt={item.title}
                                  fill
                                  className="object-cover transition-transform duration-1000 group-hover:scale-105"
                                />
                              ) : (
                                <div className="absolute inset-0 bg-muted/50 flex items-center justify-center">
                                  <Heart className="h-12 w-12 text-primary/5" />
                                </div>
                              )}
                              <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700" />
                              <div className="absolute top-4 right-4">
                                <div className="bg-primary/90 backdrop-blur-md text-white text-[9px] font-black uppercase px-3 py-1.5 rounded-full shadow-lg">
                                  <span>{item.type}</span>
                                </div>
                              </div>
                            </div>
                            <div className="p-10 space-y-5 flex-1 flex flex-col">
                              <div className="flex items-center gap-3 text-[10px] font-bold text-muted-foreground/60 uppercase">
                                <Calendar className="h-3.5 w-3.5 text-primary" />
                                <span>{formatDateTime(item.createdAt)}</span>
                              </div>
                              <h4 className="text-xl sm:text-2xl font-black text-foreground leading-tight group-hover:text-primary transition-colors line-clamp-2">
                                {item.title}
                              </h4>
                              <p className="text-sm text-muted-foreground font-medium line-clamp-3 leading-relaxed opacity-60 flex-1">
                                {item.description}
                              </p>
                              <div className="pt-4 flex items-center gap-2 text-primary font-black text-[10px] uppercase group-hover:gap-4 transition-all">
                                <span>
                                  <span>
                                    {language === "kh"
                                      ? "អានបន្ថែម"
                                      : "Read Full Story"}
                                  </span>
                                </span>
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
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 sm:p-12 selection:bg-primary/20 transition-all font-kantumruy text-center">
      <div className="w-full max-w-xl space-y-12 animate-in fade-in zoom-in slide-in-from-bottom-10 duration-1000">
        <div className="h-32 w-32 bg-card rounded-[2.5rem] shadow-2xl border border-border flex items-center justify-center mx-auto mb-10 relative group hover:rotate-[-5deg] hover:scale-110 transition-all isolate">
          <div className="absolute inset-x-2 inset-y-2 bg-primary/5 rounded-[2.2rem] -z-1" />
          <Calendar className="h-14 w-14 text-primary relative z-10" />
        </div>

        <div className="space-y-6">
          <h1
            className={cn(
              "text-3xl sm:text-5xl font-black text-foreground leading-tight px-4",
              language === "kh" ? "font-kantumruy leading-[1.6]" : "",
            )}
          >
            <span>{event?.title}</span>
          </h1>
          <div className="h-1.5 w-16 bg-primary mx-auto rounded-full" />
          <p className="text-muted-foreground font-bold text-[11px] sm:text-sm uppercase leading-relaxed px-8">
            <span>
              {language === "kh"
                ? "កាលវិភាគ និងព័ត៌មានលម្អិតសាធារណៈជន មិនទាន់ត្រូវបានផ្សព្វផ្សាយនៅឡើយទេ"
                : "The public schedule and event details have not been published yet."}
            </span>
          </p>
        </div>

        <Card className="p-10 sm:p-14 rounded-[3rem] shadow-2xl border-border bg-card flex flex-col items-stretch gap-10 w-full relative group hover:shadow-primary/5 hover:-translate-y-1 transition-all overflow-hidden text-left">
          <div className="flex items-center gap-6 justify-center text-center">
            <div className="h-14 w-14 rounded-2xl bg-muted/50 flex items-center justify-center text-primary border border-border group-hover:bg-muted transition-all">
              <Clock className="h-7 w-7" />
            </div>
            <div>
              <p className="text-[10px] font-black text-muted-foreground uppercase leading-none mb-2">
                <span>{t("event_date")}</span>
              </p>
              <p className="text-xl font-black text-foreground">
                <span>{event && formatDateTime(event.eventDate)}</span>
              </p>
            </div>
          </div>

          {event?.location && (
            <div className="pt-10 border-t border-border flex items-center gap-6 justify-center text-center">
              <div className="h-14 w-14 rounded-2xl bg-muted/50 flex items-center justify-center text-muted-foreground border border-border group-hover:text-primary transition-all">
                <MapPin className="h-7 w-7" />
              </div>
              <div>
                <p className="text-[10px] font-black text-muted-foreground uppercase leading-none mb-2">
                  <span>{t("location")}</span>
                </p>
                <p className="text-base font-bold text-muted-foreground/80 line-clamp-1 group-hover:text-foreground transition-colors">
                  <span>{event.location}</span>
                </p>
              </div>
            </div>
          )}
        </Card>

        <div className="pt-12 flex flex-col items-center gap-10">
          <Link href="/">
            <Button
              variant="outline"
              className="h-16 px-12 rounded-2xl border-border bg-card font-black text-muted-foreground hover:text-foreground hover:border-primary/50 hover:bg-primary/10 transition-all shadow-xl uppercase text-xs"
            >
              <ArrowLeft className="mr-4 h-4 w-4" />
              <span>{t("back_to_home")}</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
