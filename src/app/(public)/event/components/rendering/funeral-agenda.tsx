import { cn, stripHtml } from "@/lib/utils";
import { MapPin, ExternalLink } from "lucide-react";
import { Content } from "@/services/content.service";
import { Event } from "@/types";

interface Props {
  content: Content;
  event: Event;
  theme: any;
}

export const FuneralAgenda = ({ content, event, theme }: Props) => {

  return (
    <div className="relative min-h-screen font-kantumruy">
      {/* Immersive Solemn Background */}
      {event.bannerUrl && (
        <div className="fixed inset-0 -z-10 overflow-hidden">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-110 blur-3xl opacity-20"
            style={{ backgroundImage: `url(${event.bannerUrl})` }}
          />
          <div className="absolute inset-0 bg-linear-to-b from-[#111827]/60 via-[#111827]/90 to-[#111827]" />
        </div>
      )}

      <div className="bg-[#111827]/60 backdrop-blur-2xl p-3 sm:p-12 rounded-md relative border border-white/5 animate-in fade-in slide-in-from-bottom-8 duration-700 transform-gpu overflow-hidden">
        <div className="border border-white/5 p-2 sm:p-6 rounded-md bg-[#0d1421]/30 backdrop-blur-xl shadow-inner relative z-10">
          <div className="border-[6px] sm:border-10 border-double border-white/5 p-6 sm:p-20 md:p-32 relative overflow-hidden bg-[#0d1421]/80 rounded-md flex flex-col items-center isolate">
          {/* Solemn Background Pattern */}
          <div className="absolute inset-0 z-0 opacity-[0.05] pointer-events-none -z-1">
            <div className="w-full h-full bg-[radial-gradient(circle_at_2px_2px,rgba(255,255,255,0.1)_1px,transparent_0)] bg-size-[48px_48px]" />
          </div>

          <div className="relative z-10 w-full text-center space-y-20 lg:space-y-32">
            <div className="space-y-10">
              {((event.extraData as any)?.donorName || content.contentData?.donorName) && (
                <div className="space-y-4">
                  <span className="text-[10px] sm:text-xs font-semibold uppercase text-slate-500 tracking-widest">
                    {"ម្ចាស់ដើមបុណ្យ / ម្ចាស់ដើមទាន"}
                  </span>
                  <p className="text-xl sm:text-4xl font-black text-white">
                    {event.extraData?.donorName || content.contentData?.donorName}
                  </p>
                </div>
              )}
              <h2
                style={{ fontFamily: "Kh Muol Light" }}
                className="text-xl sm:text-3xl lg:text-5xl font-black text-white leading-[1.7] drop-shadow-sm uppercase"
              >
                <span>{content.title}</span>
              </h2>

              {(event.description || content.description) && (
                <div className="max-w-4xl mx-auto space-y-10">
                  <div className="h-1.5 w-20 bg-white/5 mx-auto rounded-full" />
                  <div className="text-slate-400 text-sm sm:text-2xl font-medium leading-relaxed italic border-l-8 border-[#f41f4d]/20 pl-10 sm:pl-16 text-left py-4 bg-white/5 rounded-r-md">
                    <span>{stripHtml(event.description || content.description)}</span>
                  </div>
                  <div className="h-1.5 w-20 bg-white/5 mx-auto rounded-full" />
                </div>
              )}

              {(event.location || event.mapUrl) && (
                <div className="pt-12 flex flex-col items-center gap-6">
                  {event.location && (
                    <div className="flex items-center gap-3 text-slate-400">
                      <MapPin className="h-5 w-5 text-[#f41f4d] opacity-60" />
                      <span className="text-sm sm:text-2xl font-bold">{event.location}</span>
                    </div>
                  )}
                  {event.mapUrl && (
                    <a 
                      href={event.mapUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-[#f41f4d] text-white font-black text-[10px] sm:text-xs uppercase shadow-xl shadow-rose-500/20 hover:scale-105 transition-all active:scale-95"
                    >
                      <ExternalLink className="h-4 w-4" />
                      {"មើលផែនទី"}
                    </a>
                  )}
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
                  <h3 className="text-sm sm:text-2xl font-black text-white relative z-10 uppercase font-kantumruy">
                    <span>កម្មវិធីបុណ្យសព / កាលវិភាគ</span>
                  </h3>
                </div>

                <div className="space-y-20 sm:space-y-32 text-left w-full max-w-5xl mx-auto px-4 sm:px-0">
                  {content.agenda.map((day, idx) => (
                    <div
                      key={idx}
                      className="last:mb-0 group animate-in slide-in-from-bottom-4 duration-700"
                      style={{ animationDelay: `${idx * 150}ms` }}
                    >
                      {day.date && (
                        <div className="mb-12 sm:mb-20 flex items-center gap-8">
                          <div className="h-px flex-1 bg-white/5" />
                          <h4 className="text-xs sm:text-lg font-black text-white uppercase bg-[#111827] px-10 py-3 rounded-md border border-white/5 isolate overflow-hidden relative group-hover:border-[#f41f4d]/30 transition-all duration-500">
                            <div className="absolute inset-0 bg-gradient-to-r from-[#f41f4d]/5 via-transparent to-[#f41f4d]/5 -z-1" />
                            <span>{day.date}</span>
                          </h4>
                          <div className="h-px flex-1 bg-white/5" />
                        </div>
                      )}
                      <div className="space-y-6 sm:space-y-8">
                        {day.items?.map((item, i) => (
                          <div
                            key={i}
                            className="flex flex-col sm:flex-row gap-6 sm:gap-20 items-start text-white group/item p-10 sm:p-16 rounded-md bg-white/5 hover:bg-white/10 transition-all duration-700 border border-white/5 hover:border-[#f41f4d]/20 relative overflow-hidden isolate"
                          >
                            <div className="absolute top-0 left-0 w-32 h-32 bg-[#f41f4d]/5 blur-[60px] translate-x-[-50%] translate-y-[-50%] opacity-0 group-hover/item:opacity-100 transition-opacity -z-1" />

                            <div className="w-max sm:w-48 shrink-0 font-black text-xs sm:text-base text-[#f41f4d]/60 group-hover/item:text-[#f41f4d] transition-colors uppercase pt-1 border-b border-[#f41f4d]/20 pb-2">
                              <span>{item.time}</span>
                            </div>
                            <div className="flex-1 text-sm sm:text-2xl leading-snug sm:leading-relaxed text-slate-300 group-hover/item:text-white font-bold transition-colors">
                               <span>{item.description}</span>
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
                  <h3 className="text-sm sm:text-2xl font-black text-white relative z-10 uppercase font-kantumruy">
                    <span>ក្រុមគ្រួសារ និងសាច់ញាតិ</span>
                  </h3>
                </div>

                <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-8 sm:gap-16 text-left max-w-6xl mx-auto px-4">
                  {content.committee.map((group, idx) => (
                    <div
                      key={idx}
                      className="flex flex-col gap-8 p-10 sm:p-16 rounded-md bg-white/5 border border-white/5 hover:border-[#f41f4d]/30 hover:bg-white/10 transition-all duration-700 group/comm relative overflow-hidden isolate shadow-sm"
                    >
                      <div className="absolute top-0 right-0 w-32 h-32 bg-[#f41f4d]/5 blur-3xl -z-1 opacity-50" />

                      <span className="font-black text-[10px] sm:text-xs uppercase text-slate-500 border-b border-white/5 pb-4 group-hover/comm:text-[#f41f4d] transition-colors">
                        <span>{group.role}</span>
                      </span>
                      <span className="text-white font-bold text-sm sm:text-2xl leading-[1.8] flex flex-wrap gap-2 group-hover/comm:text-white transition-colors">
                        <span>{group.members.join(", ")}</span>
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
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-2 w-2 sm:h-3 sm:w-3 rounded-full bg-[#f41f4d]/40 animate-pulse"
                  />
                ))}
              </div>
              <p className="text-slate-700 text-[9px] sm:text-xs font-black uppercase">
                Premium Memorial • Motorola Theapka
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);
};
