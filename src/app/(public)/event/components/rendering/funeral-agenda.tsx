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
    <div className="bg-[#111827] p-3 sm:p-12 rounded-[3.5rem] sm:rounded-[6rem] shadow-2xl relative border border-white/5 animate-in fade-in slide-in-from-bottom-8 duration-1000 transform-gpu overflow-hidden font-kantumruy">
      <div className="border border-white/5 p-2 sm:p-6 rounded-[2.8rem] sm:rounded-[5.2rem] bg-[#0d1421]/50 backdrop-blur-xl shadow-inner relative z-10">
        <div className="border-[6px] sm:border-10 border-double border-white/5 p-6 sm:p-20 md:p-32 relative overflow-hidden bg-[#0d1421] rounded-[2.5rem] sm:rounded-[4.8rem] flex flex-col items-center isolate">
          {/* Solemn Background Pattern */}
          <div className="absolute inset-0 z-0 opacity-[0.05] pointer-events-none -z-1">
             <div className="w-full h-full bg-[radial-gradient(circle_at_2px_2px,rgba(255,255,255,0.1)_1px,transparent_0)] bg-size-[48px_48px]" />
          </div>

          <div className="relative z-10 w-full text-center space-y-20 lg:space-y-32">
            <div className="space-y-10">
              <h2 style={{fontFamily: "Kh Muol Light"}} className={cn(
                "text-xl sm:text-3xl lg:text-5xl font-black text-white leading-tight tracking-tight drop-shadow-sm uppercase",
                language === 'kh' ? 'tracking-normal leading-[1.7]' : ''
              )}>
                {content.title}
              </h2>

              {(event.description || content.description) && (
                <div className="max-w-4xl mx-auto space-y-10">
                  <div className="h-1.5 w-20 bg-white/5 mx-auto rounded-full" />
                  <div className="text-slate-400 text-sm sm:text-2xl font-medium leading-relaxed italic border-l-8 border-[#f41f4d]/20 pl-10 sm:pl-16 text-left tracking-tight py-4 bg-white/5 rounded-r-3xl">
                    {event.description || content.description}
                  </div>
                  <div className="h-1.5 w-20 bg-white/5 mx-auto rounded-full" />
                </div>
              )}
            </div>

            {content.body && (
              <div className="text-slate-100 text-center w-full px-4 sm:px-24 lg:px-40 relative z-20">
                <div 
                  className="content-body text-xl sm:text-3xl leading-loose font-medium prose prose-invert prose-slate max-w-none opacity-90 italic" 
                  dangerouslySetInnerHTML={{ __html: content.body }} 
                />
              </div>
            )}

            {content.agenda && content.agenda.length > 0 && (
              <div className="w-full pt-16 lg:pt-32">
                <div className="inline-block relative mb-16 sm:mb-32 px-12 py-4">
                  <div className="absolute inset-0 bg-[#f41f4d]/5 rounded-xl -skew-x-12 ring-1 ring-white/5" />
                  <h3 className={cn("text-sm sm:text-2xl font-black text-white relative z-10 uppercase tracking-[0.4em]", language === 'kh' ? 'font-kantumruy tracking-normal' : '')}>
                    {t('funeral_agenda_schedule')}
                  </h3>
                </div>
                
                <div className="space-y-20 sm:space-y-32 text-left w-full max-w-5xl mx-auto px-4 sm:px-0">
                  {content.agenda.map((day, idx) => (
                    <div key={idx} className="last:mb-0 group animate-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: `${idx * 150}ms` }}>
                      {day.date && (
                        <div className="mb-12 sm:mb-20 flex items-center gap-8">
                          <div className="h-px flex-1 bg-white/5" />
                          <h4 className="text-xs sm:text-lg font-black text-white uppercase tracking-[0.3em] bg-[#111827] px-10 py-3 rounded-2xl border border-white/5 shadow-2xl isolate overflow-hidden relative group-hover:border-[#f41f4d]/30 transition-all duration-500">
                             <div className="absolute inset-0 bg-gradient-to-r from-[#f41f4d]/5 via-transparent to-[#f41f4d]/5 -z-1" />
                            {day.date}
                          </h4>
                          <div className="h-px flex-1 bg-white/5" />
                        </div>
                      )}
                      <div className="space-y-6 sm:space-y-8">
                        {day.items?.map((item, i) => (
                          <div key={i} className="flex flex-col sm:flex-row gap-6 sm:gap-20 items-start text-white group/item p-10 sm:p-16 rounded-[3rem] bg-white/5 hover:bg-white/10 transition-all duration-700 border border-white/5 hover:border-[#f41f4d]/20 hover:shadow-2xl hover:shadow-[#f41f4d]/5 relative overflow-hidden isolate">
                            <div className="absolute top-0 left-0 w-32 h-32 bg-[#f41f4d]/5 blur-[60px] translate-x-[-50%] translate-y-[-50%] opacity-0 group-hover/item:opacity-100 transition-opacity -z-1" />
                            
                            <div className="w-max sm:w-48 shrink-0 font-black text-xs sm:text-base tracking-widest text-[#f41f4d]/60 group-hover/item:text-[#f41f4d] transition-colors uppercase pt-1 border-b border-[#f41f4d]/20 pb-2">
                              {item.time}
                            </div>
                            <div className="flex-1 text-sm sm:text-2xl leading-snug sm:leading-relaxed text-slate-300 group-hover/item:text-white font-bold transition-colors tracking-tight">
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
              <div className="w-full pt-16 lg:pt-32 border-t border-white/5 mt-24 sm:mt-40">
                <div className="inline-block relative mb-16 sm:mb-32 px-12 py-3 group">
                    <div className="absolute inset-0 bg-white/5 rounded-xl -skew-x-12 group-hover:bg-[#f41f4d]/5 transition-all duration-500" />
                    <h3 className={cn("text-sm sm:text-2xl font-black text-white relative z-10 uppercase tracking-[0.2em]", language === 'kh' ? 'font-kantumruy tracking-normal' : '')}>
                      {t('funeral_committee_title')}
                    </h3>
                </div>
                
                <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-8 sm:gap-16 text-left max-w-6xl mx-auto px-4">
                  {content.committee.map((group, idx) => (
                    <div key={idx} className="flex flex-col gap-8 p-10 sm:p-16 rounded-[3rem] bg-white/5 border border-white/5 hover:border-[#f41f4d]/30 hover:bg-white/10 transition-all duration-700 group/comm relative overflow-hidden isolate shadow-2xl">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-[#f41f4d]/5 blur-3xl -z-1 opacity-50" />
                      
                      <span className="font-black text-[10px] sm:text-xs uppercase tracking-[0.4em] text-slate-500 border-b border-white/5 pb-4 group-hover/comm:text-[#f41f4d] transition-colors">{group.role}</span>
                      <span className="text-white font-bold text-sm sm:text-2xl leading-[1.8] flex flex-wrap gap-2 group-hover/comm:text-white transition-colors">
                         {group.members.join(", ")}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="pt-24 sm:pt-48 flex flex-col items-center gap-10 pb-6">
                <div className="h-0.5 w-32 sm:w-96 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                <div className="flex gap-6">
                   {[1,2,3].map(i => (
                      <div key={i} className="h-2 w-2 sm:h-3 sm:w-3 rounded-full bg-[#f41f4d]/40 animate-pulse" />
                   ))}
                </div>
                <p className="text-slate-700 text-[9px] sm:text-xs font-black tracking-[1em] uppercase">Premium Memorial • SIDETH THEAPKA</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
