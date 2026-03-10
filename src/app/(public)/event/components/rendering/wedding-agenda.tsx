import { cn } from "@/lib/utils";
import { useLanguage } from "@/providers/language-provider";
import { Content } from "@/services/content.service";
import { Event } from "@/types";
import { Heart, MapPin } from "lucide-react";

interface Props {
  content: Content;
  event: Event;
  theme: any;
}

export const WeddingAgenda = ({ content, event, theme }: Props) => {
  const { t, language } = useLanguage();
  const data = content.contentData;

  return (
    <div className="bg-[#fcfaf5] p-2 sm:p-10 rounded-[2.5rem] sm:rounded-[5rem] shadow-[0_40px_80px_-15px_rgba(184,134,11,0.2)] relative border border-amber-100/50 animate-in fade-in duration-1000 overflow-hidden">
      {/* Royal Silk Frame */}
      <div className="absolute inset-2 sm:inset-4 rounded-[2rem] sm:rounded-[4rem] border border-amber-500/10 pointer-events-none" />
      
      <div className="border border-amber-500/20 p-1.5 sm:p-4 rounded-[1.8rem] sm:rounded-[4.2rem] bg-[#fffcf8] shadow-inner">
        <div className="border-4 sm:border-[6px] border-double border-amber-600/50 p-4 sm:p-24 relative overflow-hidden bg-white paper-texture rounded-[1.5rem] sm:rounded-[4rem]">
          
          {/* Traditional Kbach Ornaments (Gold Foil) */}
          <div className="absolute top-4 sm:top-8 left-4 sm:left-8 w-8 sm:w-20 h-8 sm:h-20 border-t-[3px] sm:border-t-[8px] border-l-[3px] sm:border-l-[8px] border-amber-500/30 rounded-tl-xl sm:rounded-tl-3xl z-20" />
          <div className="absolute top-4 sm:top-8 right-4 sm:right-8 w-8 sm:w-20 h-8 sm:h-20 border-t-[3px] sm:border-t-[8px] border-r-[3px] sm:border-r-[8px] border-amber-500/30 rounded-tr-xl sm:rounded-tr-3xl z-20" />
          <div className="absolute bottom-4 sm:bottom-8 left-4 sm:left-8 w-8 sm:w-20 h-8 sm:h-20 border-b-[3px] sm:border-b-[8px] border-l-[3px] sm:border-l-[8px] border-amber-500/30 rounded-bl-xl sm:rounded-bl-3xl z-20" />
          <div className="absolute bottom-4 sm:bottom-8 right-4 sm:right-8 w-8 sm:w-20 h-8 sm:h-20 border-b-[3px] sm:border-b-[8px] border-r-[3px] sm:border-r-[8px] border-amber-500/30 rounded-br-xl sm:rounded-br-3xl z-20" />
          
          <div className="absolute -top-32 -left-32 w-64 sm:w-96 h-64 sm:h-96 bg-amber-100/30 rounded-full blur-[80px] sm:blur-[100px] pointer-events-none" />
          <div className="absolute -bottom-32 -right-32 w-64 sm:w-96 h-64 sm:h-96 bg-rose-100/20 rounded-full blur-[80px] sm:blur-[100px] pointer-events-none" />

          <div className="relative z-10 w-full text-center space-y-8 sm:space-y-24">
            {/* Elite Header Section */}
            <div className="space-y-6 sm:space-y-12">
               <div className="space-y-3 sm:space-y-6">
                 <h2 className={cn(
                    "text-xl sm:text-5xl font-black text-amber-950 leading-tight drop-shadow-sm uppercase",
                    language === 'kh' ? 'font-moul tracking-normal' : 'tracking-tighter'
                  )}>
                    {content.title}
                  </h2>
                  <div className="flex items-center justify-center gap-2 sm:gap-6">
                     <div className="h-px sm:h-0.5 w-8 sm:w-16 bg-linear-to-r from-transparent via-amber-300 to-transparent" />
                     <div className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-amber-500" />
                     <div className="h-px sm:h-0.5 w-8 sm:w-16 bg-linear-to-l from-transparent via-amber-300 to-transparent" />
                  </div>
               </div>

               {/* Heart Medallion */}
               <div className="flex justify-center mb-2 sm:mb-10 relative">
                  <div className="absolute inset-0 bg-amber-400/20 blur-2xl sm:blur-3xl rounded-full scale-125 sm:scale-150 animate-pulse" />
                  <div className="h-12 w-12 sm:h-24 sm:w-24 rounded-full bg-white flex items-center justify-center border-2 sm:border-[5px] border-amber-500 shadow-[0_10px_30px_-10px_rgba(184,134,11,0.5)] relative z-10">
                     <Heart className="h-6 w-6 sm:h-12 sm:w-12 text-amber-600 fill-amber-500 animate-in zoom-in-50 duration-1000" />
                  </div>
               </div>

              {/* Royal Groom & Bride Lineage */}
              {data?.groom && data?.bride && (
                 <div className="grid grid-cols-2 gap-4 sm:gap-8 md:gap-24 relative mb-4 sm:mb-16 items-start">
                    {/* Centered Connector Indicator */}
                    <div className="absolute top-[55%] sm:top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 opacity-20 sm:opacity-10 z-0">
                       <Heart className="h-10 w-10 sm:h-40 sm:w-40 text-amber-600 fill-amber-500/20" />
                       <p className="text-[8px] sm:text-base font-moul text-amber-800 tracking-wide translate-y-[-5px] sm:translate-y-0 whitespace-nowrap text-center">ជាគូនឹង</p>
                    </div>

                    {/* Groom Side */}
                    <div className="space-y-2 sm:space-y-4 relative z-10">
                       <div className="space-y-0.5 sm:space-y-1 italic text-amber-900/60 text-[9px] sm:text-sm text-center md:text-left">
                          <p>លោក <span className="font-moul">{data.groom.father}</span></p>
                          <p>លោកស្រី <span className="font-moul">{data.groom.mother}</span></p>
                       </div>
                       <div className="space-y-0.5">
                          <h6 className="text-[8px] sm:text-base font-moul text-amber-800/80 tracking-wide">កូនប្រុសនាម</h6>
                          <h3 className="text-base sm:text-5xl font-moul text-amber-800 tracking-wide leading-snug">{data.groom.name}</h3>
                       </div>
                    </div>

                    {/* Bride Side */}
                    <div className="space-y-2 sm:space-y-4 relative z-10">
                       <div className="space-y-0.5 sm:space-y-1 italic text-amber-900/60 text-[9px] sm:text-sm text-center md:text-right">
                          <p>លោក <span className="font-moul">{data.bride.father}</span></p>
                          <p>លោកស្រី <span className="font-moul">{data.bride.mother}</span></p>
                       </div>
                       <div className="space-y-0.5">
                          <h6 className="text-[8px] sm:text-base font-moul text-amber-800/80 tracking-wide">កូនស្រីនាម</h6>
                          <h3 className="text-base sm:text-5xl font-moul text-amber-800 tracking-wide leading-snug">{data.bride.name}</h3>
                       </div>
                    </div>
                 </div>
              )}

              {content.description && (
                <div className="max-w-4xl mx-auto px-1 sm:px-10">
                  <p className="text-amber-900/60 text-[11px] sm:text-xl italic leading-relaxed font-moul tracking-tight">
                    {content.description}
                  </p>
                </div>
              )}
            </div>

            {/* Venue Location Section */}
            {data?.location && (
               <div className="flex flex-col items-center gap-2 sm:gap-4 py-4 sm:py-8 border-y border-amber-500/10">
                  <div className="flex items-center gap-2 sm:gap-3 text-amber-600 font-bold text-sm sm:text-2xl">
                     <MapPin className="h-4 w-4 sm:h-6 sm:w-6 shrink-0" />
                     <span className="font-serif italic text-center leading-tight">{data.location.name}</span>
                  </div>
                  <p className="text-zinc-500 font-medium max-w-xl text-[10px] sm:text-base text-center px-4 leading-relaxed">{data.location.address}</p>
                  {data.location.mapUrl && (
                     <a 
                        href={data.location.mapUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-[9px] sm:text-xs font-black uppercase tracking-[0.1em] sm:tracking-[0.2em] text-amber-700 bg-amber-50 px-5 sm:px-8 py-1.5 sm:py-3 rounded-full hover:bg-amber-100 transition-colors border border-amber-100"
                     >
                        {t('view_on_map') || "View Location"}
                     </a>
                  )}
               </div>
            )}

            {/* Narrative Body */}
            {content.body && (
              <div className="text-amber-950 w-full px-1 sm:px-24 relative z-20">
                <div 
                  className="content-body text-[13px] sm:text-2xl leading-[2] sm:leading-[2.6] font-medium prose prose-amber max-w-none text-center italic opacity-90 py-4 sm:py-16" 
                  dangerouslySetInnerHTML={{ __html: content.body }} 
                />
              </div>
            )}

            {/* Prestige Nested Agenda Section (3 Levels) */}
            {data?.schedule && data.schedule.length > 0 && (
              <div className="w-full pt-6 sm:pt-12 pb-4 sm:pb-10">
                <div className="flex flex-col items-center gap-2 sm:gap-6 mb-8 sm:mb-24">
                   <h3 className={cn("text-base sm:text-5xl font-black text-amber-800 px-4 sm:px-12 uppercase tracking-[0.1em] sm:tracking-[0.4em] drop-shadow-sm text-center", language === 'kh' ? 'font-moul tracking-normal' : '')}>
                     {t('wedding_agenda_schedule')}
                   </h3>
                   <div className="flex items-center gap-2">
                       <div className="h-px sm:h-0.5 w-6 sm:w-48 bg-linear-to-r from-transparent via-amber-400 to-transparent" />
                       <Heart className="h-3 w-3 sm:h-4 sm:w-4 text-amber-500 fill-amber-500 animate-bounce" />
                       <div className="h-px sm:h-0.5 w-6 sm:w-48 bg-linear-to-l from-transparent via-amber-400 to-transparent" />
                   </div>
                </div>
                
                <div className="space-y-8 sm:space-y-32 text-left w-full max-w-6xl mx-auto">
                  {data.schedule.map((day, idx) => (
                    <div key={day.id} className="last:mb-0 relative group">
                      {day.dayLabel && (
                        <div className="mb-4 sm:mb-20 flex justify-center sticky top-2 sm:top-10 z-30 px-2">
                          <div className="relative group/day w-full sm:w-auto">
                            <div className="absolute inset-0 bg-amber-600 blur-xl sm:blur-2xl opacity-10 group-hover/day:opacity-30 transition-opacity" />
                            <div style={{fontFamily: "Khmer OS Muol Light"}} className="relative px-4 sm:px-16 py-2.5 sm:py-6 rounded-lg sm:rounded-2xl bg-amber-700 text-white font-black text-[11px] sm:text-xl uppercase tracking-wider sm:tracking-widest shadow-md sm:shadow-[0_8px_24px_-6px_rgba(184,134,11,0.6)] border sm:border-2 border-amber-500 hover:-translate-y-1 transition-all cursor-default text-center">
                              {day.dayLabel}
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <div className="space-y-8 sm:space-y-16">
                         {day.groups.map((group) => (
                            <div key={group.id} className="relative pl-3 sm:pl-16">
                                {/* Group Title with Ornament */}
                               {group.groupTitle && (
                                <div className="flex items-center gap-2 sm:gap-6 mb-4 sm:mb-10 group/group-title">
                                   <div className="h-px sm:h-0.5 w-6 sm:w-12 bg-amber-400/40 shrink-0" />
                                   <h4 className="font-moul text-amber-700 text-[13px] sm:text-2xl tracking-wide bg-linear-to-r from-amber-50/50 to-transparent px-3 sm:px-6 py-1 sm:py-2 rounded-r-full">{group.groupTitle}</h4>
                                </div>
                               )}

                               {/* Activities Level */}
                               <div className="space-y-2 sm:space-y-4 border-l-2 sm:border-l-[4px] border-amber-100/60 ml-2 sm:ml-4">
                                  {group.activities.map((act, i) => (
                                     <div key={i} className="flex flex-col sm:flex-row sm:items-center items-start gap-2 sm:gap-14 text-amber-950 group/item relative py-2 sm:py-8 pl-4 sm:pl-0">
                                        {/* Connector dot */}
                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 sm:top-auto sm:translate-y-0 h-2.5 w-2.5 sm:h-6 sm:w-6 rounded-full bg-white border-2 sm:border-4 border-amber-500 z-10 -translate-x-1.5 sm:-translate-x-[1.75rem]" />
                                        
                                        {/* Time pill */}
                                        <div className="shrink-0 w-max sm:w-auto">
                                           <div className="font-bold text-[10px] sm:text-xl text-amber-800 bg-[#fffdfa] px-3 sm:px-12 py-1.5 sm:py-5 rounded-lg sm:rounded-[2rem] border sm:border-2 border-amber-200 shadow-sm text-center min-w-[5rem] sm:min-w-[18rem] hover:border-amber-500 hover:bg-white transition-all duration-500">
                                              {act.time}
                                           </div>
                                        </div>

                                        {/* Title + Description */}
                                        <div className="flex-1 space-y-0.5 sm:space-y-3 py-1 sm:py-4 text-left transition-transform duration-700 sm:group-hover/item:translate-x-3">
                                           <h5 className="text-[13px] sm:text-3xl font-black text-amber-900 tracking-tight leading-snug">{act.title}</h5>
                                           {act.description && (
                                              <p className="text-[11px] sm:text-xl leading-relaxed text-amber-900/70 font-medium italic">
                                                 {act.description}
                                              </p>
                                           )}
                                           <div className="h-px w-0 group-hover:w-full bg-linear-to-r from-amber-200/50 to-transparent transition-all duration-1000 mt-1 sm:mt-4" />
                                        </div>
                                     </div>
                                  ))}
                               </div>
                            </div>
                         ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Grand Committee Section */}
            {content.committee && content.committee.length > 0 && (
              <div className="w-full pt-8 sm:pt-24 pb-4 sm:pb-12 mt-8 sm:mt-24 border-t-2 sm:border-t-[8px] border-double border-amber-500/30">
                <div className="inline-block relative mb-6 sm:mb-20 px-4 sm:px-20 group/title">
                   <div className="absolute inset-0 bg-amber-50/50 -skew-x-12 rounded-xl sm:rounded-2xl -z-10 group-hover/title:bg-amber-100 transition-colors" />
                   <h3 className={cn("text-base sm:text-4xl font-black text-amber-900 py-3 sm:py-6", language === 'kh' ? 'font-moul tracking-normal' : '')}>
                     {t('wedding_committee_title')}
                   </h3>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-x-16 sm:gap-y-14 text-left max-w-6xl mx-auto px-1 sm:px-8">
                  {content.committee.map((group, idx) => (
                    <div key={idx} className="flex flex-col gap-2 sm:gap-6 p-4 sm:p-12 rounded-xl sm:rounded-[3rem] bg-gradient-to-br from-[#fffdfa] to-[#fffaf5] border sm:border-2 border-amber-100 shadow-sm hover:border-amber-300 transition-all duration-500 relative overflow-hidden group/card text-center sm:text-left">
                      <div className="absolute top-0 right-0 w-16 sm:w-48 h-16 sm:h-48 bg-amber-100/10 blur-2xl sm:blur-3xl rounded-full -mr-8 sm:-mr-24 -mt-8 sm:-mt-24 group-hover/card:bg-amber-100/30 transition-colors" />
                      
                      <div className="flex items-center justify-center sm:justify-start gap-2">
                         <div className="h-1.5 w-1.5 sm:h-3 sm:w-3 rounded-full bg-amber-500 shrink-0" />
                         <span className="font-moul text-amber-700 text-[9px] sm:text-sm tracking-[0.1em] sm:tracking-[0.2em] leading-relaxed uppercase">{group.role}</span>
                      </div>
                      <span className="text-amber-950 font-black text-xs sm:text-3xl leading-snug sm:leading-[1.7] tracking-tight relative z-10 transition-colors group-hover/card:text-amber-600">
                        {Array.isArray(group.members) ? group.members.join(", ") : group.members}
                      </span>
                    </div>
                  ))}
               </div>
              </div>
            )}

            {/* Closing / Footer Content Section */}
            {data?.footerContent && (
              <div className="w-full pt-8 sm:pt-20 pb-4 sm:pb-12 px-1 sm:px-24 text-center border-t border-amber-500/10">
                <div className="relative group/footer">
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-24 sm:w-32 h-px bg-linear-to-r from-transparent via-amber-300 to-transparent" />
                  <div 
                    className="content-body text-[13px] sm:text-2xl leading-[1.8] sm:leading-[2.2] font-medium prose prose-amber max-w-none text-amber-900/80 italic py-4 sm:py-10" 
                    dangerouslySetInnerHTML={{ __html: data.footerContent }} 
                  />
                  <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-24 sm:w-32 h-px bg-linear-to-l from-transparent via-amber-300 to-transparent" />
                </div>
              </div>
            )}

            {/* Royal Blessing Seal */}
            <div className="pt-8 sm:pt-24 flex flex-col items-center gap-4 sm:gap-8 pb-4 sm:pb-10">
               <div className="h-px w-32 sm:w-96 bg-linear-to-r from-transparent via-amber-300 to-transparent" />
               <div className="flex gap-3 sm:gap-6">
                 {[1,2,3,4,5].map(i => (
                   <Heart 
                    key={i} 
                    className={cn(
                      "h-4 w-4 sm:h-6 sm:w-6 text-amber-500 fill-amber-400 transition-all duration-1000",
                      i % 2 === 0 ? "scale-75 opacity-40 animate-pulse" : "animate-bounce delay-300"
                    )} 
                   />
                 ))}
               </div>
               <p className="font-moul text-amber-800/30 text-[9px] sm:text-xs tracking-[0.3em] sm:tracking-[1em] uppercase px-4 sm:px-6">Royal Celebration • Banhchi</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
