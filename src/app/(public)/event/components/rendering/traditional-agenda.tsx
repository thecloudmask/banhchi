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
    <div className="bg-card/40 backdrop-blur-xl p-3 sm:p-12 rounded-[3.5rem] sm:rounded-[6rem] shadow-2xl relative border border-border animate-in fade-in slide-in-from-bottom-12 duration-1000 overflow-hidden transform-gpu font-kantumruy">
      <div className="border border-border p-2 sm:p-6 rounded-[2.8rem] sm:rounded-[5.2rem] bg-muted/10 backdrop-blur-md shadow-inner relative z-10">
         <div className="border-[6px] sm:border-10 border-double border-border p-6 sm:p-20 md:p-32 relative overflow-hidden bg-muted/5 rounded-[2.5rem] sm:rounded-[4.8rem] isolate">
           
           {/* Decorative Ornaments */}
           <div className="absolute top-6 left-6 w-12 sm:w-28 h-12 sm:h-28 border-t-2 sm:border-t-8 border-l-2 sm:border-l-8 border-primary/20 rounded-tl-2xl sm:rounded-tl-[3rem] z-20" />
           <div className="absolute top-6 right-6 w-12 sm:w-28 h-12 sm:h-28 border-t-2 sm:border-t-8 border-r-2 sm:border-r-8 border-primary/20 rounded-tr-2xl sm:rounded-tr-[3rem] z-20" />
           <div className="absolute bottom-6 left-6 w-12 sm:w-28 h-12 sm:h-28 border-b-2 sm:border-b-8 border-l-2 sm:border-l-8 border-primary/20 rounded-bl-2xl sm:rounded-bl-[3rem] z-20" />
           <div className="absolute bottom-6 right-6 w-12 sm:w-28 h-12 sm:h-28 border-b-2 sm:border-b-8 border-r-2 sm:border-r-8 border-primary/20 rounded-br-2xl sm:rounded-br-[3rem] z-20" />

           <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none -z-1" />
           <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none -z-1" />

           <div className="relative z-10 w-full text-center space-y-20 sm:space-y-32">
             <div className="space-y-8 sm:space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                 <div className="flex items-center justify-center gap-6 mb-4">
                     <div className="h-0.5 sm:h-1 w-12 sm:w-32 bg-linear-to-r from-transparent via-primary/40 to-transparent" />
                     <Flower2 className="h-8 w-8 sm:h-12 sm:w-16 text-primary opacity-60 animate-pulse" />
                     <div className="h-0.5 sm:h-1 w-12 sm:w-32 bg-linear-to-l from-transparent via-primary/40 to-transparent" />
                 </div>
                 <h2 style={{fontFamily: "Kh Muol Light"}} className={cn(
                    "text-xl sm:text-3xl lg:text-5xl font-black text-foreground leading-tight drop-shadow-sm uppercase tracking-tight",
                    language === 'kh' ? 'tracking-normal leading-[1.7]' : ''
                  )}>
                   {content.title}
                 </h2>
                 <div className="flex justify-center">
                    <div className="h-2 w-16 sm:w-40 rounded-full bg-linear-to-r from-transparent via-primary/40 to-transparent" />
                 </div>
             </div>

             {(event.description || content.description || content.body) && (
               <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
                 {(event.description || content.description) && (
                   <div className="text-muted-foreground text-sm sm:text-2xl italic leading-relaxed font-medium border-l-8 border-primary/20 pl-10 sm:pl-16 text-left py-6 bg-muted/30 rounded-r-3xl transition-all hover:bg-muted/50">
                     {event.description || content.description}
                   </div>
                 )}
                 {content.body && (
                   <div className="text-foreground w-full px-4 sm:px-12 relative z-20">
                     <div 
                        className="content-body text-[15px] sm:text-3xl leading-loose font-medium prose prose-slate dark:prose-invert max-w-none text-center italic opacity-80" 
                        dangerouslySetInnerHTML={{ __html: content.body }} 
                     />
                   </div>
                 )}
               </div>
             )}

             {/* Agenda Section */}
             {content.agenda && content.agenda.length > 0 && (
               <div className="w-full pt-16 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500">
                 <div className="inline-block relative mb-16 sm:mb-24 px-12 py-3 group">
                    <div className="absolute inset-0 bg-primary/10 rounded-full -skew-x-12 group-hover:bg-primary/20 transition-all duration-500 shadow-xl" />
                    <h3 className={cn("text-xs sm:text-xl font-bold text-foreground relative z-10 uppercase tracking-[0.4em] drop-shadow-md", language === 'kh' ? 'font-kantumruy tracking-normal' : '')}>
                      {['merit_making', 'buddhist'].includes(event.category || "") ? t('merit_agenda_schedule') : t('agenda_schedule')}
                    </h3>
                 </div>
                 
                 <div className="space-y-24 sm:space-y-32 text-left w-full max-w-5xl mx-auto">
                   {content.agenda.map((day, idx) => (
                     <div key={idx} className="relative group/day animate-in slide-in-from-bottom-8 duration-1000" style={{ animationDelay: `${idx * 150}ms` }}>
                       {day.date && (
                         <div className="mb-10 sm:mb-20 flex items-center gap-6 px-4">
                           <div className="h-12 w-12 sm:h-20 sm:w-20 rounded-2xl bg-primary flex items-center justify-center text-white shrink-0 shadow-xl shadow-primary/20 relative z-20 group-hover/day:scale-110 transition-all">
                              <Calendar className="h-6 w-6 sm:h-10 sm:w-10" />
                           </div>
                           <div className="flex-1 border-b border-primary/20 pb-4">
                              <h4 className="text-sm sm:text-xl font-black text-foreground font-kantumruy tracking-wide drop-shadow-sm uppercase">
                                 {day.date}
                              </h4>
                           </div>
                         </div>
                       )}
                       
                       <div className={cn("space-y-6 sm:space-y-12", day.date ? "pl-0 sm:pl-32" : "")}>
                         {day.items?.map((item, i) => (
                           <div key={i} className="flex flex-col sm:flex-row gap-6 sm:gap-14 items-start text-foreground group/item p-8 sm:p-12 rounded-[2.5rem] hover:bg-primary/5 transition-all border border-transparent hover:border-primary/10 hover:shadow-2xl">
                             <div className="shrink-0 w-max sm:w-48 pt-1">
                                <div className="flex flex-col items-center">
                                    <div className="flex items-center gap-3 text-foreground bg-card/60 backdrop-blur-md px-5 py-2.5 sm:px-8 sm:py-4 rounded-2xl border border-border shadow-sm w-full justify-center group-hover/item:border-primary/50 group-hover/item:shadow-[0_0_20px_rgba(244,31,77,0.1)] transition-all">
                                        <Clock className="h-4 w-4 sm:h-6 sm:w-6 opacity-60 text-primary" />
                                        <span className="font-bold text-[11px] sm:text-sm tracking-tight">{item.time}</span>
                                    </div>
                                </div>
                             </div>
                             
                             <div className="flex-1 space-y-3 py-1 sm:py-4">
                               <p className="text-sm sm:text-2xl leading-snug sm:leading-relaxed text-foreground font-bold tracking-tight group-hover/item:text-primary transition-colors">
                                   {item.description}
                                </p>
                                <div className="h-px w-0 group-hover/item:w-full bg-linear-to-r from-primary/40 to-transparent transition-all duration-1000 mt-4" />
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
               <div className="w-full pt-16 sm:pt-40 border-t border-border mt-24 sm:mt-40 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-700">
                  <div className="inline-block relative mb-16 sm:mb-24 px-12 py-3 group">
                    <div className="absolute inset-0 bg-primary/10 rounded-full -skew-x-12 group-hover:bg-primary/20 transition-all duration-500 shadow-xl" />
                    <h3 className={cn("text-xs sm:text-xl font-bold text-foreground relative z-10 uppercase tracking-[0.4em] drop-shadow-md", language === 'kh' ? 'font-kantumruy tracking-normal' : '')}>
                      {['merit_making', 'buddhist'].includes(event.category || "") ? t('merit_committee_title') : t('committee_organizers')}
                    </h3>
                  </div>

                 <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-8 sm:gap-16 text-left max-w-6xl mx-auto px-4">
                   {content.committee.map((group, idx) => (
                     <div key={idx} className="flex flex-col gap-6 p-10 sm:p-16 rounded-[3rem] bg-muted/20 border border-border shadow-2xl hover:border-primary/30 transition-all group/comm relative overflow-hidden isolate">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl -z-1 opacity-50" />
                        
                        <div className="flex items-center gap-4">
                             <div className="h-1.5 w-1.5 sm:h-3 sm:w-3 rounded-full bg-primary group-hover/comm:scale-150 transition-transform" />
                             <span className="text-muted-foreground text-[10px] sm:text-xs font-black uppercase tracking-[0.3em] leading-relaxed group-hover/comm:text-primary transition-colors">{group.role}</span>
                        </div>
                        <span className="text-foreground font-black text-sm sm:text-2xl leading-relaxed transition-colors">
                            {Array.isArray(group.members) ? group.members.join(", ") : group.members}
                        </span>
                     </div>
                   ))}
                 </div>
               </div>
             )}

             {/* Footer Seal */}
             <div className="pt-24 sm:pt-48 flex flex-col items-center gap-10 pb-6 animate-in fade-in zoom-in duration-1000 delay-1000">
                <div className="h-px w-32 sm:w-96 bg-linear-to-r from-transparent via-primary/20 to-transparent" />
                <div className="flex gap-6">
                   {[1,2,3].map(i => (
                      <div key={i} className="h-2 w-2 sm:h-3 sm:w-3 rounded-full bg-primary/40 animate-pulse" />
                   ))}
                </div>
                <p className="text-muted-foreground/30 text-[9px] sm:text-xs font-black tracking-[1em] uppercase">Premium Memorial • SIDETH THEAPKA</p>
             </div>
           </div>
         </div>
      </div>
    </div>
   );
};
