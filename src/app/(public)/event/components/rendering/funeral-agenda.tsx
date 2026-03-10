import { cn } from "@/lib/utils";
import { useLanguage } from "@/providers/language-provider";
import { Content } from "@/services/content.service";
import { Event } from "@/types";

interface Props {
  content: Content;
  event: Event;
  theme: any;
}

export const FuneralAgenda = ({ content, event, theme }: Props) => {
  const { t, language } = useLanguage();

  return (
    <div className="bg-white p-4 sm:p-12 rounded-[2rem] sm:rounded-[3rem] shadow-2xl relative border border-zinc-200/50 animate-in fade-in duration-1000">
      <div className="border border-zinc-100 p-8 sm:p-24 relative overflow-hidden bg-white flex flex-col items-center rounded-2xl">
        {/* Solemn Background Texture */}
        <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none">
           <div className="w-full h-full bg-[radial-gradient(circle_at_2px_2px,#ccc_1px,transparent_0)] bg-size-[40px_40px]" />
        </div>

        <div className="relative z-10 w-full text-center space-y-16">
          <div className="space-y-8">
            <h2 className={cn(
              "text-3xl sm:text-6xl font-black text-zinc-900 leading-tight",
              language === 'kh' ? 'font-moul tracking-normal' : 'tracking-tighter'
            )}>
              {content.title}
            </h2>

            {content.description && (
              <div className="max-w-2xl mx-auto space-y-6">
                <div className="h-0.5 w-12 bg-zinc-200 mx-auto" />
                <p className="text-zinc-500 text-lg sm:text-xl font-medium leading-relaxed italic border-l-4 border-zinc-100 pl-8 text-left">
                  {content.description}
                </p>
                <div className="h-0.5 w-12 bg-zinc-200 mx-auto" />
              </div>
            )}
          </div>

          {content.body && (
            <div className="text-zinc-700 text-justify w-full px-4 sm:px-16 relative z-20">
              <div 
                className="content-body text-base sm:text-lg leading-loose font-medium prose prose-zinc max-w-none first-letter:text-5xl first-letter:font-black first-letter:text-zinc-900 first-letter:mr-2" 
                dangerouslySetInnerHTML={{ __html: content.body }} 
              />
            </div>
          )}

          {content.agenda && content.agenda.length > 0 && (
            <div className="w-full pt-16">
              <h3 className={cn("text-2xl font-black text-zinc-900 mb-12 border-b-2 border-zinc-900/5 pb-4 inline-block px-12 uppercase tracking-widest", language === 'kh' ? 'font-moul tracking-normal' : '')}>
                {t('funeral_agenda_schedule')}
              </h3>
              
              <div className="space-y-12 text-left w-full max-w-4xl mx-auto">
                {content.agenda.map((day, idx) => (
                  <div key={idx} className="mb-12 last:mb-0 group">
                    {day.date && (
                      <div className="mb-6 flex items-center gap-4">
                        <div className="h-px flex-1 bg-zinc-100" />
                        <h4 className="text-lg font-black text-zinc-900 uppercase tracking-widest group-hover:text-primary transition-colors">
                          {day.date}
                        </h4>
                        <div className="h-px flex-1 bg-zinc-100" />
                      </div>
                    )}
                    <div className="space-y-0.5 mt-4">
                      {day.items?.map((item, i) => (
                        <div key={i} className="flex gap-8 items-start text-zinc-900 group/item p-6 border-b border-zinc-50 hover:bg-zinc-50 transition-colors">
                          <div className="w-32 shrink-0 font-black text-xs sm:text-sm tracking-widest text-zinc-400 group-hover/item:text-zinc-900 transition-colors uppercase pt-1">
                            {item.time}
                          </div>
                          <div className="flex-1 text-sm sm:text-lg leading-relaxed text-zinc-600 group-hover/item:text-zinc-900 font-medium transition-colors">
                            {item.description}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {content.committee && content.committee.length > 0 && (
            <div className="w-full pt-16 border-t border-zinc-100">
              <h3 className={cn("text-xl font-black text-zinc-900 mb-12", language === 'kh' ? 'font-moul' : '')}>
                {t('funeral_committee_title')}
              </h3>
              <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-12 text-left max-w-5xl mx-auto px-4">
                {content.committee.map((group, idx) => (
                  <div key={idx} className="flex flex-col gap-4 p-8 border border-zinc-50 hover:border-zinc-200 transition-all rounded-3xl">
                    <span className="font-black text-xs uppercase tracking-[0.3em] text-zinc-300 border-b border-zinc-100 pb-2">{group.role}</span>
                    <span className="text-zinc-800 font-bold text-base sm:text-lg leading-relaxed flex flex-wrap gap-2">
                       {group.members.join(", ")}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
