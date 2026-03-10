import { cn } from "@/lib/utils";
import { useLanguage } from "@/providers/language-provider";
import { Content } from "@/services/content.service";
import { Event } from "@/types";

interface Props {
  content: Content;
  event: Event;
  theme: any;
}

export const TraditionalAgenda = ({ content, event, theme }: Props) => {
  const { t, language } = useLanguage();

  return (
    <div className="bg-white p-2 sm:p-5 rounded-[2.5rem] sm:rounded-[3.5rem] shadow-xl relative border border-zinc-100 animate-in fade-in duration-500">
      <div className="border-[1.5px] border-blue-900/20 p-1.5 rounded-[2rem] sm:rounded-[3rem]">
        <div className="border-[6px] border-double border-blue-900 p-8 sm:p-20 relative overflow-hidden bg-white paper-texture min-h-75 flex flex-col items-center rounded-[1.5rem] sm:rounded-[2.5rem]">
          {/* Kbach Style Corners */}
          <div className="absolute top-4 left-4 w-12 h-12 border-t-[5px] border-l-[5px] border-blue-900 rounded-tl-2xl z-20" />
          <div className="absolute top-4 right-4 w-12 h-12 border-t-[5px] border-r-[5px] border-blue-900 rounded-tr-2xl z-20" />
          <div className="absolute bottom-4 left-4 w-12 h-12 border-b-[5px] border-l-[5px] border-blue-900 rounded-bl-2xl z-20" />
          <div className="absolute bottom-4 right-4 w-12 h-12 border-b-[5px] border-r-[5px] border-blue-900 rounded-br-2xl z-20" />

          <div className="relative z-10 w-full text-center space-y-12">
            <h2 className={cn("text-3xl sm:text-5xl font-black text-blue-900 font-moul", language === 'kh' ? '' : 'text-center')}>
              {content.title}
            </h2>

            {content.description && (
              <div className="text-blue-800 text-lg font-bold max-w-2xl mx-auto italic opacity-90 border-y py-4 border-blue-100/50">
                {content.description}
              </div>
            )}

            {content.body && (
              <div className="text-blue-900/90 text-justify w-full px-4 relative z-20">
                <div className="content-body text-base sm:text-lg leading-loose font-medium" dangerouslySetInnerHTML={{ __html: content.body }} />
              </div>
            )}

            {content.agenda && content.agenda.length > 0 && (
              <div className="w-full pt-8">
                <h3 className="text-2xl font-black text-blue-900 mb-8 inline-block border-b-2 border-blue-900/30 pb-2 px-10 font-moul">
                  {event.category === 'merit_making' ? t('merit_agenda_schedule') : t('agenda_schedule')}
                </h3>
                <div className="space-y-10 text-left w-full max-w-4xl mx-auto">
                  {content.agenda.map((day, idx) => (
                    <div key={idx} className="mb-8 last:mb-0">
                      {day.date && <div className="mb-4 pl-2"><h4 className="text-lg font-black text-blue-900 font-moul">{day.date}</h4></div>}
                      <div className={cn("space-y-4", day.date ? "pl-8 border-l-2 border-blue-200/60 ml-2" : "")}>
                        {day.items?.map((item, i) => (
                          <div key={i} className="flex gap-4 items-start text-blue-900 group">
                            <div className="w-30 shrink-0 font-bold text-xs leading-relaxed text-blue-700 bg-blue-50/50 px-2 py-2 rounded-lg text-center border border-blue-100/50">{item.time}</div>
                            <div className="flex-1 text-sm sm:text-base leading-relaxed text-slate-700 font-medium">{item.description}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {content.committee && content.committee.length > 0 && (
              <div className="w-full pt-8">
                <h3 className="text-2xl font-black text-blue-900 mb-8 inline-block border-b-2 border-blue-900/30 pb-2 px-10 font-moul">
                  {event.category === 'merit_making' ? t('merit_committee_title') : t('committee_organizers')}
                </h3>
                <div className="grid sm:grid-cols-2 gap-6 text-left max-w-4xl mx-auto">
                  {content.committee.map((group, idx) => (
                    <div key={idx} className="flex flex-row gap-3 items-baseline">
                      <span className="font-moul text-blue-900 text-xs sm:text-sm shrink-0">{group.role}</span>
                      <span className="text-slate-800 font-bold text-sm sm:text-base">{group.members.join(", ")}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
