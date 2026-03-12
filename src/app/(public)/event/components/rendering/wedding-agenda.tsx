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
    <div className="bg-[#fffdf8] p-3 sm:p-12 rounded-[3.5rem] sm:rounded-[6rem] shadow-xl relative border border-amber-200/40 overflow-hidden transform-gpu">
      {/* Royal Silk Textured Frame */}
      <div className="absolute inset-4 sm:inset-6 rounded-[3rem] sm:rounded-[5rem] border border-amber-500/10 pointer-events-none" />
      
      <div className="border border-amber-500/10 p-2 sm:p-6 rounded-[2.8rem] sm:rounded-[5.2rem] bg-white/50 backdrop-blur-sm shadow-inner relative">
        <div className="border-[6px] sm:border-10 border-double border-amber-600/30 p-6 sm:p-32 md:p-40 relative overflow-hidden bg-white paper-texture rounded-[2.5rem] sm:rounded-[4.8rem]">
          
          {/* Elite Ornate Corners (Gold Leaf Style) */}
          <div className="absolute top-6 left-6 w-12 sm:w-28 h-12 sm:h-28 border-t-4 sm:border-t-10 border-l-4 sm:border-l-10 border-amber-500/20 rounded-tl-2xl sm:rounded-tl-[3rem] z-20" />
          <div className="absolute top-6 right-6 w-12 sm:w-28 h-12 sm:h-28 border-t-4 sm:border-t-10 border-r-4 sm:border-r-10 border-amber-500/20 rounded-tr-2xl sm:rounded-tr-[3rem] z-20" />
          <div className="absolute bottom-6 left-6 w-12 sm:w-28 h-12 sm:h-28 border-b-4 sm:border-b-10 border-l-4 sm:border-l-10 border-amber-500/20 rounded-bl-2xl sm:rounded-bl-[3rem] z-20" />
          <div className="absolute bottom-6 right-6 w-12 sm:w-28 h-12 sm:h-28 border-b-4 sm:border-b-10 border-r-4 sm:border-r-10 border-amber-500/20 rounded-br-2xl sm:rounded-br-[3rem] z-20" />
          
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-amber-100/40 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-rose-100/30 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 w-full text-center space-y-8 sm:space-y-24">
            {/* Elite Header Section */}
            <div className="space-y-8 sm:space-y-20">
               <div className="space-y-4 sm:space-y-10">
                 <h2 style={{fontFamily: "Kh Muol"}} className={cn(
                    "text-xl sm:text-3xl lg:text-4xl font-black text-amber-950 leading-tight drop-shadow-sm uppercase tracking-tight",
                    language === 'kh' ? 'tracking-normal leading-[1.6]' : ''
                  )}>
                    {content.title}
                  </h2>
                  <div className="flex items-center justify-center gap-4 sm:gap-12 opacity-40">
                     <div className="h-0.5 sm:h-1 w-12 sm:w-32 bg-linear-to-r from-transparent via-amber-400 to-transparent" />
                     <div className="h-2 w-2 sm:h-4 sm:w-4 rounded-full border-2 border-amber-500" />
                     <div className="h-0.5 sm:h-1 w-12 sm:w-32 bg-linear-to-l from-transparent via-amber-400 to-transparent" />
                  </div>
               </div>

               {/* Central Heart Medallion */}
               <div className="flex justify-center mb-8 relative">
                  <div className="absolute inset-0 bg-amber-400/10 blur-2xl rounded-full scale-150" />
                  <div className="h-16 w-16 sm:h-32 sm:w-32 rounded-full bg-white flex items-center justify-center border-4 sm:border-8 border-amber-500 shadow-xl relative z-10 transition-transform hover:scale-105">
                     <Heart className="h-8 w-8 sm:h-16 sm:w-16 text-amber-600 fill-amber-500" />
                  </div>
               </div>

              {/* Royal Lineage Layout */}
              {data?.groom && data?.bride && (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-32 relative py-12 items-center">
                    {/* Floating Heart Connection */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 hidden md:flex flex-col items-center gap-2 opacity-5">
                       <Heart className="h-48 w-48 text-amber-800 fill-amber-500" />
                       <p style={{fontFamily: "Kh Muol"}} className="text-amber-900/40 text-base sm:text-sm text-center md:text-right font-medium">ជាគូរនឹង</p>
                    </div>

                    {/* Groom Side */}
                    <div className="space-y-4 sm:space-y-8 relative z-10">
                       <div className="space-y-2 italic text-amber-900/40 text-[11px] sm:text-sm text-center md:text-right font-medium">
                          <p>លោក <span className="font-kantumruy text-amber-900/70">{data.groom.father}</span></p>
                          <p>លោកស្រី <span className="font-kantumruy text-amber-900/70">{data.groom.mother}</span></p>
                       </div>
                       <div className="space-y-3">
                          <h6 className="text-[10px] sm:text-sm font-kantumruy text-amber-800/40 uppercase tracking-widest">កូនប្រុសនាម</h6>
                          <h3 className="text-xl sm:text-3xl font-kantumruy text-amber-800 leading-snug drop-shadow-sm">{data.groom.name}</h3>
                       </div>
                    </div>

                    {/* Bride Side */}
                    <div className="space-y-4 sm:space-y-8 relative z-10">
                       <div className="space-y-2 italic text-amber-900/40 text-[11px] sm:text-sm text-center md:text-left font-medium">
                          <p>លោក <span className="font-kantumruy text-amber-900/70">{data.bride.father}</span></p>
                          <p>លោកស្រី <span className="font-kantumruy text-amber-900/70">{data.bride.mother}</span></p>
                       </div>
                       <div className="space-y-3">
                          <h6 className="text-[10px] sm:text-sm font-kantumruy text-amber-800/40 uppercase tracking-widest">កូនស្រីនាម</h6>
                          <h3 className="text-xl sm:text-3xl font-kantumruy text-amber-800 leading-snug drop-shadow-sm">{data.bride.name}</h3>
                       </div>
                    </div>
                 </div>
              )}

              {content.description && (
                <div className="max-w-4xl mx-auto px-1 sm:px-10">
                  <p className="text-amber-900/60 text-[11px] sm:text-xl italic leading-relaxed font-kantumruy tracking-tight">
                    {content.description}
                  </p>
                </div>
              )}
            </div>

            {/* Venue & Location Section */}
            {data?.location && (
               <div className="flex flex-col items-center gap-6 sm:gap-10 py-12 sm:py-20 bg-amber-50/20 rounded-[3rem] border border-amber-500/5 group hover:bg-amber-50/40 transition-colors">
                  <div className="h-16 w-16 sm:h-24 sm:w-24 rounded-3xl bg-white shadow-xl flex items-center justify-center text-amber-600 group-hover:rotate-6 transition-transform">
                     <MapPin className="h-8 w-8 sm:h-12 sm:w-12 text-rose-500" />
                  </div>
                  <div className="space-y-4">
                     <h4 className="text-xl sm:text-2xl italic text-amber-900 text-center leading-tight tracking-tight">{data.location.name}</h4>
                     <p className="text-slate-400 font-medium max-w-xl text-xs sm:text-lg text-center px-12 leading-relaxed">{data.location.address}</p>
                  </div>
                  {data.location.mapUrl && (
                     <a 
                        href={data.location.mapUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-[10px] sm:text-xs font-black uppercase tracking-[0.3em] text-white bg-amber-600 px-10 sm:px-16 py-4 sm:py-6 rounded-full hover:bg-amber-700 hover:shadow-lg transition-all border border-amber-500/20 active:scale-95 hover:-translate-y-0.5"
                     >
                        {t('view_on_map') || "Explore Location"}
                     </a>
                  )}
               </div>
            )}

            {/* Narrative Context */}
            {content.body && (
              <div className="text-amber-950 w-full px-4 sm:px-32 relative z-20">
                <div 
                  className="content-body text-[15px] sm:text-3xl leading-[2] sm:leading-[2.8] font-medium prose prose-amber max-w-none text-center italic opacity-80 py-12 sm:py-24" 
                  dangerouslySetInnerHTML={{ __html: content.body }} 
                />
              </div>
            )}

            {/* Prestige Nested Agenda Section (3 Levels) */}
            {data?.schedule && data.schedule.length > 0 && (
              <div className="w-full pt-6 sm:pt-12 pb-4 sm:pb-10">
                <div className="flex flex-col items-center gap-2 sm:gap-4 mb-8 sm:mb-16">
                   <h3 className={cn("text-sm sm:text-xl font-black text-amber-800 px-4 sm:px-12 uppercase tracking-[0.1em] sm:tracking-[0.2em] drop-shadow-sm text-center", language === 'kh' ? 'font-kantumruy tracking-normal' : '')}>
                     {t('wedding_agenda_schedule')}
                   </h3>
                   <div className="flex items-center gap-2">
                       <div className="h-px sm:h-0.5 w-6 sm:w-32 bg-linear-to-r from-transparent via-amber-400 to-transparent" />
                       <Heart className="h-3 w-3 sm:h-4 sm:w-4 text-amber-500 fill-amber-500" />
                       <div className="h-px sm:h-0.5 w-6 sm:w-32 bg-linear-to-l from-transparent via-amber-400 to-transparent" />
                   </div>
                </div>
                
                <div className="space-y-8 sm:space-y-16 text-left w-full max-w-4xl mx-auto">
                  {data.schedule.map((day, idx) => (
                    <div key={day.id} className="last:mb-0 relative group">
                      {day.dayLabel && (
                        <div className="mb-4 sm:mb-10 flex justify-center sticky top-2 sm:top-10 z-30 px-2">
                          <div className="relative group/day w-full sm:w-auto">
                            <div className="absolute inset-0 bg-amber-600 blur-lg opacity-10 group-hover/day:opacity-20 transition-opacity" />
                            <div style={{fontFamily: "Khmer OS Muol Light"}} className="relative px-4 sm:px-12 py-2.5 sm:py-4 rounded-lg sm:rounded-xl bg-amber-700 text-white font-black text-[11px] sm:text-lg uppercase tracking-wider sm:tracking-widest shadow-md border sm:border-2 border-amber-500 transition-transform hover:-translate-y-0.5 cursor-default text-center">
                              {day.dayLabel}
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <div className="space-y-6 sm:space-y-10">
                         {day.groups.map((group) => (
                            <div key={group.id} className="relative pl-3 sm:pl-10">
                                {/* Group Title with Ornament */}
                               {group.groupTitle && (
                                <div className="flex items-center gap-2 sm:gap-4 mb-4 sm:mb-6 group/group-title">
                                   <div className="h-px sm:h-0.5 w-6 sm:w-8 bg-amber-400/40 shrink-0" />
                                   <h4 className="font-kantumruy text-amber-700 text-[13px] sm:text-sm tracking-wide bg-linear-to-r from-amber-50/50 to-transparent px-3 sm:px-5 py-1 sm:py-1.5 rounded-r-full">{group.groupTitle}</h4>
                                </div>
                               )}

                               {/* Activities Level */}
                               <div className="space-y-0 sm:space-y-2 border-l border-amber-200/60 ml-3 sm:ml-5">
                                  {group.activities.map((act, i) => (
                                     <div key={i} className="flex flex-col items-start gap-2 sm:gap-3 text-amber-950 group/item relative py-4 sm:py-5 pl-6 sm:pl-10">
                                        {/* Connector dot */}
                                        <div className="absolute left-0 top-6 sm:top-7 h-3 w-3 sm:h-3.5 sm:w-3.5 rounded-full bg-white border-2 border-amber-500 z-10 -translate-x-[6.5px] sm:-translate-x-[7.5px]" />
                                        
                                        {/* Time pill */}
                                        <div className="font-bold text-[10px] sm:text-[11px] text-amber-800 bg-[#fffdfa] px-3 sm:px-4 py-1 sm:py-1.5 rounded-full border border-amber-200 shadow-sm w-max hover:border-amber-400 hover:bg-white transition-colors">
                                           {act.time}
                                        </div>

                                        {/* Title + Description */}
                                        <div className="flex-1 space-y-1 sm:space-y-1.5 text-left transition-transform sm:group-hover/item:translate-x-1 mt-1">
                                           <h5 className="text-[13px] sm:text-base font-black text-amber-900 tracking-tight leading-snug">{act.title}</h5>
                                           {act.description && (
                                              <p className="text-[11px] sm:text-[13px] leading-relaxed text-amber-900/70 font-medium italic">
                                                 {act.description}
                                              </p>
                                           )}
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
                   <h3 className={cn("text-sm sm:text-2xl font-black text-amber-900 py-3 sm:py-6", language === 'kh' ? 'font-kantumruy tracking-normal' : '')}>
                     {t('wedding_committee_title')}
                   </h3>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-x-16 sm:gap-y-14 text-left max-w-6xl mx-auto px-1 sm:px-8">
                  {content.committee.map((group, idx) => (
                    <div key={idx} className="flex flex-col gap-2 sm:gap-6 p-4 sm:p-12 rounded-xl sm:rounded-[3rem] bg-gradient-to-br from-[#fffdfa] to-[#fffaf5] border sm:border-2 border-amber-100 shadow-sm hover:border-amber-300 transition-colors relative overflow-hidden group/card text-center sm:text-left">
                      <div className="absolute top-0 right-0 w-16 sm:w-48 h-16 sm:h-48 bg-amber-100/10 blur-xl rounded-full -mr-8 sm:-mr-24 -mt-8 sm:-mt-24 group-hover/card:bg-amber-100/30 transition-colors" />
                      
                      <div className="flex items-center justify-center sm:justify-start gap-2">
                         <div className="h-1.5 w-1.5 sm:h-3 sm:w-3 rounded-full bg-amber-500 shrink-0" />
                         <span className="font-kantumruy text-amber-700 text-[9px] sm:text-sm tracking-[0.1em] sm:tracking-[0.2em] leading-relaxed uppercase">{group.role}</span>
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
                      "h-4 w-4 sm:h-6 sm:w-6 text-amber-500 fill-amber-400 transition-transform",
                      i % 2 === 0 ? "scale-75 opacity-60" : ""
                    )} 
                   />
                 ))}
               </div>
               <p className="font-kantumruy text-amber-800/30 text-[9px] sm:text-xs tracking-[0.3em] sm:tracking-[1em] uppercase px-4 sm:px-6">Royal Celebration • Banhchi</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
