import { cn, formatDate } from "@/lib/utils";
import { useLanguage } from "@/providers/language-provider";
import { Content } from "@/services/content.service";
import { Event } from "@/types";
import Image from "next/image";
import { compressImage } from "@/lib/cloudinary";
import { Users } from "lucide-react";

interface Props {
  content: Content;
  event: Event;
  theme: any;
}

export const ArticleRenderer = ({ content, event, theme }: Props) => {
  const { t, language } = useLanguage();

  return (
    <div className="bg-white rounded-[2.5rem] sm:rounded-[3.5rem] shadow-2xl border border-zinc-100 overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-1000">
       {content.thumbnail && (
          <div className="aspect-video w-full relative">
             <Image 
               src={compressImage(content.thumbnail, 'banner')} 
               alt={content.title} 
               fill 
               className="object-cover" 
             />
             <div className="absolute inset-0 bg-linear-to-t from-black/40 to-transparent" />
          </div>
       )}
       
       <div className="p-8 sm:p-20 space-y-16">
          <div className="max-w-4xl mx-auto space-y-12">
             <div className="text-center space-y-8">
                <div className="flex justify-center flex-wrap gap-4 text-zinc-400 text-[10px] font-black uppercase tracking-[0.4em]">
                   <span>{formatDate(content.createdAt, language)}</span>
                   <span className="h-1 w-1 bg-zinc-200 rounded-full my-auto" />
                   <span>{t('written_by')} {content.author?.name || "Admin"}</span>
                </div>
                <h2 className={cn(
                  "text-xl sm:text-2xl font-black text-zinc-900 leading-[1.1] tracking-tighter", 
                  language === 'kh' ? 'font-moul tracking-normal' : ''
                )}>
                   {content.title}
                </h2>
             </div>

             {content.description && (
                <div className="text-xl sm:text-2xl font-medium text-zinc-500 italic border-l-[6px] border-zinc-100 pl-8 leading-relaxed">
                   {content.description}
                </div>
             )}

             <div className="content-body prose prose-zinc prose-2xl max-w-none text-zinc-700 selection:bg-primary/20 leading-relaxed" dangerouslySetInnerHTML={{ __html: content.body }} />
          
             {/* Author Bio Section */}
             <div className="pt-16 border-t border-zinc-100 flex flex-col items-center gap-8">
                <div className="flex items-center gap-5 p-8 rounded-3xl bg-zinc-50 border border-zinc-100 w-full max-w-xl">
                   <div className="h-16 w-16 bg-zinc-200 rounded-2xl overflow-hidden relative shadow-inner">
                      {content.author?.photoURL ? (
                        <Image src={content.author.photoURL} alt="" fill className="object-cover" />
                      ) : (
                        <Users className="h-8 w-8 m-4 text-zinc-400" />
                      )}
                   </div>
                   <div className="flex-1">
                      <div className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-1">{t('written_by')}</div>
                      <div className="text-xl font-black text-zinc-900">{content.author?.name || "Banhchi Admin"}</div>
                   </div>
                </div>
             </div>
          </div>
       </div>
    </div>
  );
};
