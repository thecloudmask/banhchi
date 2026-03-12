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
    <div className="bg-white rounded-[3rem] sm:rounded-[4rem] shadow-2xl relative border border-slate-200/50 animate-in fade-in slide-in-from-bottom-8 duration-1000 transform-gpu overflow-hidden">
      <div className="border border-slate-100 p-6 sm:p-24 lg:p-32 relative overflow-hidden bg-white flex flex-col items-center rounded-[2.5rem]">
        {/* Solemn Professional Background Texture */}
        <div className="absolute inset-0 z-0 opacity-[0.02] pointer-events-none">
           <div className="w-full h-full bg-[radial-gradient(circle_at_2px_2px,#000_1px,transparent_0)] bg-size-[48px_48px]" />
        </div>

        <div className="relative z-10 w-full text-center space-y-20 lg:space-y-32">
          <div className="space-y-10">
            <h2 className={cn(
              "text-xl sm:text-3xl lg:text-4xl font-black text-slate-900 leading-tight tracking-tighter drop-shadow-sm",
              language === 'kh' ? 'font-kantumruy tracking-normal leading-[1.7]' : ''
            )}>
              {content.title}
            </h2>

            {content.description && (
              <div className="max-w-3xl mx-auto space-y-10">
                <div className="h-1.5 w-16 bg-slate-900/5 mx-auto rounded-full" />
                <p className="text-slate-500 text-sm sm:text-base font-medium leading-relaxed italic border-l-8 border-slate-100 pl-10 sm:pl-12 text-left tracking-tight">
                  {content.description}
                </p>
                <div className="h-1.5 w-16 bg-slate-900/5 mx-auto rounded-full" />
              </div>
            )}
          </div>

          {content.body && (
            <div className="text-slate-700 text-center w-full px-4 sm:px-24 lg:px-40 relative z-20">
              <div 
                className="content-body text-xl sm:text-3xl leading-loose font-medium prose prose-slate max-w-none opacity-90 italic" 
                dangerouslySetInnerHTML={{ __html: content.body }} 
              />
            </div>
          )}

          {content.agenda && content.agenda.length > 0 && (
            <div className="w-full pt-16 lg:pt-32">
              <div className="inline-block relative mb-16 sm:mb-24 px-12 py-3">
                <div className="absolute inset-0 bg-slate-900/5 rounded-full -skew-x-12" />
                <h3 className={cn("text-sm sm:text-xl font-black text-slate-900 relative z-10 uppercase tracking-[0.3em]", language === 'kh' ? 'font-kantumruy tracking-normal' : '')}>
                  {t('funeral_agenda_schedule')}
                </h3>
              </div>
              
              <div className="space-y-20 sm:space-y-32 text-left w-full max-w-5xl mx-auto px-4 sm:px-0">
                {content.agenda.map((day, idx) => (
                  <div key={idx} className="last:mb-0 group animate-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: `${idx * 150}ms` }}>
                    {day.date && (
                      <div className="mb-10 sm:mb-16 flex items-center gap-6">
                        <div className="h-px flex-1 bg-slate-200/60" />
                        <h4 className="text-sm sm:text-base font-black text-slate-950 uppercase tracking-[0.2em] bg-slate-50 px-8 py-2 rounded-full border border-slate-100 shadow-sm">
                          {day.date}
                        </h4>
                        <div className="h-px flex-1 bg-slate-200/60" />
                      </div>
                    )}
                    <div className="space-y-4">
                      {day.items?.map((item, i) => (
                        <div key={i} className="flex flex-col sm:flex-row gap-6 sm:gap-16 items-start text-slate-900 group/item p-8 sm:p-12 rounded-[2.5rem] hover:bg-slate-50 transition-ultra border border-transparent hover:border-slate-100 hover:shadow-xl hover:shadow-slate-200/40">
                          <div className="w-max sm:w-40 shrink-0 font-black text-xs sm:text-sm tracking-widest text-slate-400 group-hover/item:text-slate-900 transition-colors uppercase pt-1">
                            {item.time}
                          </div>
                          <div className="flex-1 text-sm sm:text-lg leading-snug sm:leading-relaxed text-slate-600 group-hover/item:text-slate-950 font-bold transition-colors tracking-tight">
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
            <div className="w-full pt-16 lg:pt-32 border-t border-slate-100 mt-20 sm:mt-32">
              <h3 className={cn("text-sm sm:text-xl font-black text-slate-900 mb-16 sm:mb-24 uppercase tracking-[0.2em]", language === 'kh' ? 'font-kantumruy tracking-normal' : '')}>
                {t('funeral_committee_title')}
              </h3>
              <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12 text-left max-w-6xl mx-auto px-4">
                {content.committee.map((group, idx) => (
                  <div key={idx} className="flex flex-col gap-6 p-10 sm:p-14 rounded-[3rem] bg-slate-50/50 border border-slate-100 hover:border-slate-300 hover:bg-white hover:shadow-2xl hover:shadow-slate-200/50 transition-ultra group/comm">
                    <span className="font-black text-[10px] sm:text-xs uppercase tracking-[0.4em] text-slate-400 border-b border-slate-200 pb-3 group-hover/comm:text-slate-900 transition-colors">{group.role}</span>
                    <span className="text-slate-800 font-bold text-sm sm:text-lg leading-[1.8] flex flex-wrap gap-2 group-hover/comm:text-black transition-colors">
                       {group.members.join(", ")}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Solemn Footer */}
          <div className="pt-20 sm:pt-40 pb-4">
            <div className="flex flex-col items-center gap-4 opacity-20">
              <div className="h-px w-24 bg-slate-900" />
              <p className="text-[10px] font-black uppercase tracking-[0.6em]">Banhchi Digital Tribute</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
