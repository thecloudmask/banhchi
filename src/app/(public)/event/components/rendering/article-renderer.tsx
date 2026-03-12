import { cn, formatDate } from "@/lib/utils";
import { useLanguage } from "@/providers/language-provider";
import { Content } from "@/services/content.service";
import { Event } from "@/types";
import Image from "next/image";
import { compressImage } from "@/lib/cloudinary";
import { Calendar, Users } from "lucide-react";

interface Props {
  content: Content;
  event: Event;
  theme: any;
}

export const ArticleRenderer = ({ content, event, theme }: Props) => {
  const { t, language } = useLanguage();

  return (
    <div className="bg-white rounded-[3rem] sm:rounded-[4rem] shadow-2xl border border-slate-100/50 overflow-hidden animate-in fade-in slide-in-from-bottom-12 duration-1000 transform-gpu">
       {content.thumbnail && (
          <div className="aspect-video w-full relative group overflow-hidden">
             <Image 
               src={compressImage(content.thumbnail, 'banner')} 
               alt={content.title} 
               fill 
               className="object-cover transition-ultra group-hover:scale-105" 
               priority
             />
             <div className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent opacity-60" />
          </div>
       )}
       
       <div className="p-8 sm:p-20 lg:p-32 space-y-16 lg:space-y-24">
          <div className="max-w-4xl mx-auto space-y-12 lg:space-y-20">
             <div className="text-center space-y-8">
                <div className="flex justify-center items-center flex-wrap gap-4 text-slate-400 text-[10px] font-black uppercase tracking-[0.4em]">
                   <span className="flex items-center gap-2">
                     <Calendar className="h-3 w-3 opacity-50" />
                     {formatDate(content.createdAt, language)}
                   </span>
                   <span className="h-1.5 w-1.5 bg-slate-200 rounded-full" />
                   <span className="flex items-center gap-2">
                     <Users className="h-3 w-3 opacity-50" />
                     {t('written_by')} {content.author?.name || "Admin"}
                   </span>
                </div>
                
                <h2 className={cn(
                  "text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 leading-[1.1] tracking-tighter drop-shadow-sm", 
                  language === 'kh' ? 'font-kantumruy tracking-normal leading-[1.6]' : ''
                )}>
                   {content.title}
                </h2>
                
                <div className="h-1 w-20 bg-primary/20 mx-auto rounded-full" />
             </div>

             {content.description && (
                <div className="text-xl sm:text-3xl font-medium text-slate-500 italic border-l-8 border-primary/10 pl-10 sm:pl-12 leading-relaxed tracking-tight py-4">
                   {content.description}
                </div>
             )}

             <div className="content-body prose prose-slate prose-xl sm:prose-2xl max-w-none text-slate-700 selection:bg-primary/20 leading-[1.8] sm:leading-relaxed" dangerouslySetInnerHTML={{ __html: content.body }} />
          
             {/* Author Bio Section - Premium Card Style */}
             <div className="pt-20 border-t border-slate-100 flex flex-col items-center">
                <div className="premium-card flex flex-col sm:flex-row items-center gap-8 p-10 sm:p-12 w-full max-w-3xl bg-slate-50/50 backdrop-blur-sm border-slate-100">
                   <div className="h-24 w-24 sm:h-28 sm:w-28 bg-white p-1 rounded-[2rem] shadow-xl relative shrink-0 transition-ultra hover:rotate-6">
                      <div className="h-full w-full rounded-[1.8rem] overflow-hidden relative shadow-inner">
                        {content.author?.photoURL ? (
                          <Image src={content.author.photoURL} alt="" fill className="object-cover" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center bg-slate-100 text-slate-300">
                            <Users className="h-12 w-12" />
                          </div>
                        )}
                      </div>
                   </div>
                   <div className="flex-1 text-center sm:text-left space-y-2">
                      <div className="text-[10px] sm:text-xs font-black uppercase tracking-[0.3em] text-primary/60">{t('written_by')}</div>
                      <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{content.author?.name || "Banhchi Admin"}</div>
                      <p className="text-slate-400 text-sm sm:text-base font-medium">Banhchi Digital Event Specialist • Sharing stories and traditions.</p>
                   </div>
                </div>
             </div>
          </div>
       </div>
    </div>
  );
};
