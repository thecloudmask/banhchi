import { cn, formatDateTime, stripHtml } from "@/lib/utils";
import { useLanguage } from "@/providers/language-provider";
import { Content } from "@/services/content.service";
import { Event } from "@/types";
import Image from "next/image";
import Link from "next/link";
import { compressImage } from "@/lib/cloudinary";
import { Calendar, Users, ArrowLeft } from "lucide-react";

interface Props {
    content: Content;
    event: Event;
    theme: any;
}

export const ArticleRenderer = ({ content, event, theme }: Props) => {
    const { t, language } = useLanguage();

    return (
        <div className="bg-card/40 backdrop-blur-xl rounded-md border border-border overflow-hidden animate-in fade-in slide-in-from-bottom-12 duration-1000 transform-gpu">
            {content.thumbnail && (
                <div className="aspect-video w-full relative group overflow-hidden">
                    <Image
                        src={compressImage(content.thumbnail, "banner")}
                        alt={content.title}
                        fill
                        className="object-cover transition-all duration-1000 group-hover:scale-105"
                        priority
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-background via-transparent to-transparent opacity-80" />
                </div>
            )}

            <div className="p-8 sm:p-20 lg:p-32 space-y-16 lg:space-y-24">
                <div className="max-w-4xl mx-auto space-y-12 lg:space-y-20">
                    <div className="text-center space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                        <div className="flex justify-center items-center flex-wrap gap-4 text-muted-foreground text-[10px] font-black uppercase">
                            <span className="flex items-center gap-2">
                                <Calendar className="h-3.5 w-3.5 opacity-50 text-primary" />
                                <span>{formatDateTime(content.createdAt)}</span>
                            </span>
                            <span className="h-1.5 w-1.5 bg-border rounded-full" />
                            <span className="flex items-center gap-2">
                                <Users className="h-3.5 w-3.5 opacity-50 text-primary" />
                                <span>{t('written_by')} {content.author?.name || "Admin"}</span>
                            </span>
                        </div>

                        {content.eventId && (
                            <div className="flex justify-center pb-4">
                                <Link href={`/event/${content.eventId}`} className="group/back">
                                    <div className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-primary/5 border border-primary/10 text-[10px] font-black uppercase text-primary hover:bg-primary/10 hover:border-primary/20 transition-all duration-500">
                                        <ArrowLeft className="h-4 w-4 group-hover/back:-translate-x-1 transition-transform" />
                                        <span>{language === "kh" ? "ត្រឡប់ទៅកម្មវិធីវិញ" : "Back to Event Invitation"}</span>
                                    </div>
                                </Link>
                            </div>
                        )}

                        <h2 className={cn(
                            "text-3xl sm:text-5xl lg:text-7xl font-black text-foreground leading-[1.1] drop-shadow-sm", language === "kh" ? "font-kantumruy leading-[1.6] text-4xl sm:text-5xl" : "")}>
                            <span>{content.title}</span>
                        </h2>

                        <div className="h-1.5 w-24 bg-primary mx-auto rounded-full" />
                    </div>

                    {content.description && (
                        <div className="text-xl sm:text-3xl font-medium text-muted-foreground italic border-l-8 border-primary/20 pl-10 sm:pl-16 leading-relaxed py-8 bg-primary/5 rounded-r-md animate-in fade-in slide-in-from-left-8 duration-1000 delay-300">
                            <span>{stripHtml(content.description)}</span>
                        </div>
                    )}

                    <div
                        className="content-body prose prose-slate dark:prose-invert prose-xl sm:prose-2xl max-w-none text-foreground/80 selection:bg-primary/20 leading-[1.8] sm:leading-relaxed animate-in fade-in duration-1000 delay-500"
                        dangerouslySetInnerHTML={{ __html: content.body }}
                    />

                    {/* Author Bio Section - Premium Card Style */}
                    <div className="pt-20 border-t border-border flex flex-col items-center animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-700">
                        <div className="flex flex-col sm:flex-row items-center gap-8 p-10 sm:p-14 w-full max-w-3xl bg-muted/20 backdrop-blur-md rounded-md border border-border relative overflow-hidden group hover:border-primary/20 transition-all">
                            <div className="absolute top-0 right-0 h-40 w-40 bg-primary/5 blur-[60px] rounded-full pointer-events-none" />

                            <div className="h-24 w-24 sm:h-32 sm:w-32 bg-card p-1.5 rounded-md relative shrink-0 transition-all duration-700 hover:rotate-6 border border-border isolate">
                                <div className="h-full w-full rounded-md overflow-hidden relative shadow-inner">
                                    {content.author?.photoURL ? (
                                        <Image src={content.author.photoURL} alt="" fill className="object-cover" />
                                    ) : (
                                        <div className="h-full w-full flex items-center justify-center bg-muted text-muted-foreground">
                                            <Users className="h-12 w-12" />
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="flex-1 text-center sm:text-left space-y-3 relative z-10">
                                <div className="text-[10px] sm:text-xs font-black uppercase text-primary"><span>{t("written_by")}</span></div>
                                <div className="text-2xl sm:text-5xl font-black text-foreground"><span>{content.author?.name || "Mordok-Theapka Admin"}</span></div>
                                <p className="text-muted-foreground text-sm sm:text-lg font-medium opacity-60"><span>Mordok-Theapka Digital Event Specialist • Sharing stories and traditions.</span></p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
