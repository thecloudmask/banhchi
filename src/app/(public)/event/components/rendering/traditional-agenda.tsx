import { cn } from "@/lib/utils";
import { useLanguage } from "@/providers/language-provider";
import { Content } from "@/services/content.service";
import { Event } from "@/types";
import { Clock, Calendar, Flower2 } from "lucide-react";

interface Props {
  content: Content;
  event: Event;
  theme: any;
}

export const TraditionalAgenda = ({ content, event, theme }: Props) => {
  const { t, language } = useLanguage();

  return (
    <div className="bg-[#fffdf8] p-3 sm:p-12 rounded-[3.5rem] sm:rounded-[6rem] shadow-[0_50px_100px_-20px_rgba(184,134,11,0.15)] relative border border-amber-200/40 animate-in fade-in zoom-in duration-1000 overflow-hidden transform-gpu">
      <div className="border border-amber-500/10 p-2 sm:p-6 rounded-[2.8rem] sm:rounded-[5.2rem] bg-white/50 backdrop-blur-sm shadow-inner relative z-10">
         <div className="border-[6px] sm:border-10 border-double border-amber-600/30 p-6 sm:p-32 md:p-40 relative overflow-hidden bg-white paper-texture rounded-[2.5rem] sm:rounded-[4.8rem]">
           
           {/* Elite Khmer Ornate Corners (Gold Leaf Style) */}
           <div className="absolute top-6 left-6 w-12 sm:w-28 h-12 sm:h-28 border-t-4 sm:border-t-10 border-l-4 sm:border-l-10 border-amber-500/20 rounded-tl-2xl sm:rounded-tl-[3rem] z-20" />
           <div className="absolute top-6 right-6 w-12 sm:w-28 h-12 sm:h-28 border-t-4 sm:border-t-10 border-r-4 sm:border-r-10 border-amber-500/20 rounded-tr-2xl sm:rounded-tr-[3rem] z-20" />
           <div className="absolute bottom-6 left-6 w-12 sm:w-28 h-12 sm:h-28 border-b-4 sm:border-b-10 border-l-4 sm:border-l-10 border-amber-500/20 rounded-bl-2xl sm:rounded-bl-[3rem] z-20" />
           <div className="absolute bottom-6 right-6 w-12 sm:w-28 h-12 sm:h-28 border-b-4 sm:border-b-10 border-r-4 sm:border-r-10 border-amber-500/20 rounded-br-2xl sm:rounded-br-[3rem] z-20" />

           <div className="absolute -top-40 -left-40 w-96 h-96 bg-amber-100/40 rounded-full blur-[120px] pointer-events-none" />
           <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-rose-100/30 rounded-full blur-[120px] pointer-events-none" />

           <div className="relative z-10 w-full text-center space-y-20 sm:space-y-32">
             {/* Elite Header Section */}
             <div className="space-y-8 sm:space-y-16">
                 <div className="flex items-center justify-center gap-6 mb-4">
                     <div className="h-0.5 sm:h-1 w-12 sm:w-32 bg-linear-to-r from-transparent via-amber-400 to-transparent" />
                     <Flower2 className="h-8 w-8 sm:h-12 sm:w-12 text-amber-500 opacity-60 animate-pulse" />
                     <div className="h-0.5 sm:h-1 w-12 sm:w-32 bg-linear-to-l from-transparent via-amber-400 to-transparent" />
                 </div>
                 <h2 className={cn(
                    "text-xl sm:text-3xl lg:text-4xl font-black text-amber-950 leading-tight drop-shadow-sm uppercase tracking-tight",
                    language === 'kh' ? 'font-kantumruy tracking-normal leading-[1.7]' : ''
                  )}>
                   {content.title}
                 </h2>
                 <div className="flex justify-center">
                    <div className="h-2 w-16 sm:w-40 rounded-full bg-linear-to-r from-transparent via-amber-500/20 to-transparent" />
                 </div>
             </div>

             {/* Description & Narrative */}
             {(content.description || content.body) && (
               <div className="max-w-4xl mx-auto space-y-12">
                 {content.description && (
                   <p className="text-amber-900/60 text-sm sm:text-base italic leading-relaxed font-kantumruy tracking-tight border-l-8 border-amber-500/10 pl-10 sm:pl-16 text-left">
                     {content.description}
                   </p>
                 )}
                 {content.body && (
                   <div className="text-amber-950 w-full px-4 sm:px-12 relative z-20">
                     <div 
                        className="content-body text-[15px] sm:text-3xl leading-loose font-medium prose prose-amber max-w-none text-center italic opacity-80" 
                        dangerouslySetInnerHTML={{ __html: content.body }} 
                     />
                   </div>
                 )}
               </div>
             )}

             {/* Agenda Section */}
             {content.agenda && content.agenda.length > 0 && (
               <div className="w-full pt-16">
                 <div className="inline-block relative mb-16 sm:mb-24 px-12 py-3 group">
                    <div className="absolute inset-0 bg-amber-600/5 rounded-full -skew-x-12 group-hover:bg-amber-600/10 transition-colors" />
                    <h3 className={cn("text-sm sm:text-xl font-black text-amber-800 relative z-10 uppercase tracking-[0.3em] drop-shadow-sm", language === 'kh' ? 'font-kantumruy tracking-normal' : '')}>
                      {event.category === 'merit_making' ? t('merit_agenda_schedule') : t('agenda_schedule')}
                    </h3>
                 </div>
                 
                 <div className="space-y-24 sm:space-y-32 text-left w-full max-w-5xl mx-auto">
                   {content.agenda.map((day, idx) => (
                     <div key={idx} className="relative group/day animate-in slide-in-from-bottom-8 duration-1000" style={{ animationDelay: `${idx * 150}ms` }}>
                       {day.date && (
                         <div className="mb-10 sm:mb-20 flex items-center gap-6 px-4">
                           <div className="h-12 w-12 sm:h-20 sm:w-20 rounded-2xl bg-amber-600 flex items-center justify-center text-white shrink-0 shadow-xl shadow-amber-500/20 relative z-20 group-hover/day:scale-110 transition-ultra">
                              <Calendar className="h-6 w-6 sm:h-10 sm:w-10" />
                           </div>
                           <div className="flex-1 border-b border-amber-100 pb-3">
                              <h4 className="text-sm sm:text-lg font-black text-amber-950 font-kantumruy tracking-wide drop-shadow-sm uppercase">
                                 {day.date}
                              </h4>
                           </div>
                         </div>
                       )}
                       
                       <div className={cn("space-y-6 sm:space-y-12", day.date ? "pl-0 sm:pl-32" : "")}>
                         {day.items?.map((item, i) => (
                           <div key={i} className="flex flex-col sm:flex-row gap-6 sm:gap-14 items-start text-amber-950 group/item p-8 sm:p-12 rounded-[2.5rem] hover:bg-amber-50/50 transition-ultra border border-transparent hover:border-amber-100 hover:shadow-2xl hover:shadow-amber-200/20">
                             <div className="shrink-0 w-max sm:w-48 pt-1">
                                <div className="flex flex-col items-center">
                                    <div className="flex items-center gap-3 text-amber-800 bg-white px-5 py-2.5 sm:px-8 sm:py-4 rounded-2xl border border-amber-100 shadow-sm w-full justify-center group-hover/item:border-amber-400 group-hover/item:shadow-lg transition-all">
                                        <Clock className="h-4 w-4 sm:h-6 sm:w-6 opacity-60 text-amber-500" />
                                        <span className="font-bold text-xs sm:text-sm tracking-tight">{item.time}</span>
                                    </div>
                                </div>
                             </div>
                             
                             <div className="flex-1 space-y-3 py-1 sm:py-4">
                               <p className="text-sm sm:text-xl leading-snug sm:leading-relaxed text-amber-950 font-black tracking-tight group-hover/item:text-amber-800 transition-colors">
                                   {item.description}
                               </p>
                               <div className="h-px w-0 group-hover/item:w-full bg-linear-to-r from-amber-300/40 to-transparent transition-all duration-1000 mt-4" />
                             </div>
                           </div>
                         ))}
                       </div>
                     </div>
                   ))}
                 </div>
               </div>
             )}

             {/* Committee Section */}
             {content.committee && content.committee.length > 0 && (
               <div className="w-full pt-16 sm:pt-32 border-t border-amber-100 mt-24 sm:mt-40">
                 <div className="inline-block relative mb-12 sm:mb-24 px-10 py-2">
                    <div className="absolute inset-0 bg-amber-50 rounded-lg -skew-x-12" />
                    <h3 className={cn("text-sm sm:text-xl font-black text-amber-900 relative z-10", language === 'kh' ? 'font-kantumruy tracking-normal' : '')}>
                      {event.category === 'merit_making' ? t('merit_committee_title') : t('committee_organizers')}
                    </h3>
                 </div>

                 <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-8 sm:gap-16 text-left max-w-6xl mx-auto px-4">
                   {content.committee.map((group, idx) => (
                     <div key={idx} className="flex flex-col gap-6 p-10 sm:p-14 rounded-[3rem] bg-linear-to-br from-[#fffdfa] to-[#fffaf5] border border-amber-100 shadow-sm hover:border-amber-400 hover:shadow-2xl hover:shadow-amber-100 transition-ultra group/comm">
                        <div className="flex items-center gap-3">
                             <div className="h-2 w-2 rounded-full bg-amber-500 transition-transform group-hover/comm:scale-150" />
                             <span className="font-kantumruy text-amber-700 text-[10px] sm:text-xs uppercase tracking-[0.2em] leading-relaxed transition-colors group-hover/comm:text-amber-950">{group.role}</span>
                        </div>
                        <span className="text-amber-950 font-black text-sm sm:text-lg leading-relaxed transition-colors group-hover/comm:text-amber-600">
                            {Array.isArray(group.members) ? group.members.join(", ") : group.members}
                        </span>
                     </div>
                   ))}
                 </div>
               </div>
             )}

             {/* Royal Blessing Seal */}
             <div className="pt-24 sm:pt-40 flex flex-col items-center gap-6 pb-6">
                <div className="h-px w-32 sm:w-64 bg-linear-to-r from-transparent via-amber-300 to-transparent opacity-40" />
                <div className="flex gap-4">
                   {[1,2,3].map(i => (
                      <div key={i} className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-amber-400 animate-pulse" />
                   ))}
                </div>
                <p className="font-kantumruy text-amber-800/20 text-[9px] sm:text-xs tracking-[1em] uppercase">Banhchi • Ceremonial Scroll</p>
             </div>
           </div>
         </div>
      </div>
    </div>
  );
};

