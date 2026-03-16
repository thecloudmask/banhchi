import { useState, useEffect } from "react";
import { cn, formatDateTime } from "@/lib/utils";
import { useLanguage } from "@/providers/language-provider";
import { Content } from "@/services/content.service";
import { Event } from "@/types";
import { Heart, MapPin, Mail, Calendar, ChevronDown } from "lucide-react";
import Image from "next/image";

interface Props {
  content: Content;
  event: Event;
  theme: any;
  onCoverStateChange?: (shown: boolean) => void;
}

export const WeddingAgenda = ({
  content,
  event,
  theme,
  onCoverStateChange,
}: Props) => {
  const { t, language } = useLanguage();

  // Combine content data with event extra data, prioritizing event level info
  const extra = event.extraData || {};
  const contentData = content.contentData || {};

  const data = {
    ...contentData,
    ...extra,
    groom: { name: extra.groomName || contentData.groom?.name },
    bride: { name: extra.brideName || contentData.bride?.name },
    schedule: extra.schedule || contentData.schedule,
    location: extra.location ||
      contentData.location || { name: event.location, mapUrl: event.mapUrl },
    footerContent: extra.footerContent,
  };

  const [showCover, setShowCover] = useState(true);
  const [isOpening, setIsOpening] = useState(false);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    if (onCoverStateChange) {
      onCoverStateChange(showCover);
    }
  }, [showCover, onCoverStateChange]);

  useEffect(() => {
    const dateVal = event.eventDate as any;
    let targetDate = dateVal?.toDate
      ? dateVal.toDate().getTime()
      : new Date(dateVal).getTime();

    // If there's an eventTime like "17:00" or "05:00 PM", try to adjust the targetDate
    if (event.eventTime) {
      try {
        const timeMatch = event.eventTime.match(/(\d{1,2})[:.](\d{2})/);
        if (timeMatch) {
          const hours = parseInt(timeMatch[1]);
          const minutes = parseInt(timeMatch[2]);
          const isPM =
            event.eventTime.toLowerCase().includes("pm") ||
            event.eventTime.includes("ល្ងាច");

          const d = new Date(targetDate);
          let h = hours;
          if (isPM && h < 12) h += 12;
          if (!isPM && h === 12) h = 0;

          d.setHours(h, minutes, 0, 0);
          targetDate = d.getTime();
        }
      } catch (e) {
        console.error("Error parsing eventTime for countdown:", e);
      }
    }

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance < 0) {
        clearInterval(interval);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor(
          (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
        ),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [event.eventDate, event.eventTime]);

  const handleOpenInvitation = () => {
    setIsOpening(true);
    setTimeout(() => setShowCover(false), 1000);
  };

  return (
    <>
      {/* Welcome Cover Overlay */}
      {showCover && (
        <div
          className={cn(
            "fixed inset-0 z-100 w-full h-full flex flex-col items-center justify-between transition-all duration-1000",
            isOpening
              ? "opacity-0 scale-110 pointer-events-none"
              : "opacity-100 scale-100",
          )}
        >
          {/* Background Image & Overlay */}
          {event.bannerUrl ? (
            <img
              src={event.bannerUrl}
              alt="Wedding Cover"
              className="absolute inset-0 w-full h-full object-cover z-[-2]"
            />
          ) : (
            <div className="absolute inset-0 w-full h-full bg-card z-[-2]" />
          )}
          <div className="absolute inset-0 bg-black/40 bg-linear-to-b from-black/20 via-transparent to-black/95 z-[-1]" />

          {/* Top Texts */}
          <div className="relative z-10 w-full flex flex-col items-center p-6 sm:p-12 mt-20 sm:mt-32 space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-10 duration-1000">
            <h1
              style={{ fontFamily: "Kh Muol Light" }}
              className="text-3xl sm:text-5xl lg:text-6xl text-[#E5C170] drop-shadow-xl text-center leading-relaxed"
            >
              <span>សិរីមង្គលអាពាហ៍ពិពាហ៍</span>
            </h1>
            <div className="text-2xl sm:text-4xl lg:text-5xl font-black text-white drop-shadow-xl text-center leading-relaxed">
              {data?.groom?.name} & {data?.bride?.name}
            </div>
            <p className="text-xl sm:text-2xl text-white/90 font-bold text-center mt-4">
              <span>សូមគោរពអញ្ជើញ</span>
            </p>

            <div className="w-full max-w-sm mt-8 opacity-80 flex items-center justify-center gap-4">
              <div className="h-px flex-1 bg-linear-to-r from-transparent via-white to-transparent" />
              <Heart className="h-6 w-6 text-white" />
              <div className="h-px flex-1 bg-linear-to-l from-transparent via-white to-transparent" />
            </div>
          </div>

          {/* Bottom Button */}
          <div className="relative z-10 mb-16 sm:mb-24 px-6 sm:px-12 animate-in fade-in slide-in-from-bottom-5 duration-1000 delay-500">
            <button
              onClick={handleOpenInvitation}
              className="bg-[#C5A866] hover:bg-[#B39655] text-white px-10 py-5 sm:px-14 sm:py-6 rounded-2xl sm:rounded-3xl font-bold flex items-center gap-3 transition-all transform hover:scale-105 hover:shadow-2xl hover:shadow-[#C5A866]/30 active:scale-95 shadow-xl disabled:opacity-50"
              disabled={isOpening}
            >
              <Mail className="h-6 w-6 sm:h-8 sm:w-8" />
              <span className="text-lg sm:text-2xl">
                <span>បើកធៀប</span>
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Main Agenda Content */}
      <div
        className={cn(
          "bg-[#FDFBF4] dark:bg-zinc-950 min-h-screen relative overflow-hidden transform-gpu font-kantumruy transition-all duration-1000",
          showCover && !isOpening
            ? "h-screen overflow-hidden opacity-0"
            : "opacity-100 min-h-screen",
        )}
      >
        {/* Subtle background overlay (optional pattern) */}
        <div className="absolute inset-0 bg-white/40 dark:bg-black/40 pointer-events-none" />

        <div className="max-w-2xl mx-auto pb-20 relative z-10 w-full">
          {/* Section 1: Hero */}
          <div className="relative rounded-none sm:rounded-[3rem] h-screen min-h-[600px] flex flex-col items-center justify-center px-6 overflow-hidden">
            {/* Background Image that covers the screen as in the image */}
            <div className="absolute inset-0 z-[-2]">
              {event.bannerUrl ? (
                <img
                  src={event.bannerUrl}
                  alt="Wedding Background"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-[#E5DCC2] dark:bg-zinc-800" />
              )}
            </div>

            {/* Premium Overlays */}
            <div className="absolute inset-x-0 bottom-0 h-2/3 bg-linear-to-t from-[#FDFBF4] via-[#FDFBF4]/60 to-transparent dark:from-zinc-950 dark:via-zinc-950/60 dark:to-transparent z-[-1]" />
            <div className="absolute inset-0 bg-black/5 dark:bg-black/20 z-[-1]" />

            {/* Animated Flower/Heart Particles for Premium Feel */}
            <div className="absolute inset-0 pointer-events-none z-1 overflow-hidden opacity-40">
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className="absolute animate-float-slow"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 5}s`,
                    opacity: Math.random() * 0.5 + 0.3,
                  }}
                >
                  <Heart
                    style={{
                      color: "#" + ["FFD700", "E5C170", "F41F4D"][i % 3],
                    }}
                    className="w-3 h-3 sm:w-4 sm:h-4 fill-current blur-[0.5px]"
                  />
                </div>
              ))}
            </div>

            <div className="flex flex-col items-center text-center animate-in fade-in slide-in-from-top-12 duration-1000 w-full pt-20">
              {/* Header Title */}
              <h2
                style={{ fontFamily: "Kh Muol Light" }}
                className="text-3xl sm:text-4xl text-[#C5A866] mb-12 sm:mb-16 drop-shadow-[0_2px_4px_rgba(0,0,0,0.1)]"
              >
                <span>សិរីមង្គលអាពាហ៍ពិពាហ៍</span>
              </h2>

              {/* Main Content Group in the middle */}
              <div className="flex flex-col items-center space-y-4 mb-20 relative px-4">
                <div
                  className="italic text-[#E5C170] text-3xl sm:text-4xl md:text-5xl drop-shadow-md mb-2"
                  style={{ fontFamily: "'Dancing Script', cursive, serif" }}
                >
                  The Wedding Day
                </div>

                <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 w-full max-w-2xl text-3xl sm:text-5xl lg:text-6xl font-black text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.3)] filter contrast-125">
                  <span className="leading-tight mix-blend-plus-lighter">
                    {data?.groom?.name}
                  </span>
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-lg group">
                    <Heart className="w-6 h-6 sm:w-8 sm:h-8 text-[#E5C170] fill-[#E5C170] group-hover:scale-125 transition-transform duration-500" />
                  </div>
                  <span className="leading-tight mix-blend-plus-lighter">
                    {data?.bride?.name}
                  </span>
                </div>
              </div>

              {/* Scroll Indicator */}
              <div className="absolute bottom-12 animate-bounce opacity-40">
                <ChevronDown className="w-8 h-8 text-[#C5A866]" />
              </div>
            </div>
          </div>

          {/* Section: Save the Date (Now outside the hero bg) */}
          <div className="relative z-20 -mt-20 px-6 flex flex-col items-center animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
            <div className="space-y-6 w-full max-w-sm sm:max-w-md bg-white/80 dark:bg-zinc-900/80 backdrop-blur-2xl border border-[#C5A866]/20 p-8 sm:p-10 rounded-[2.5rem] shadow-2xl shadow-black/5">
              <h4 className="text-[#C5A866] dark:text-[#EACD88] font-black text-[10px] sm:text-xs uppercase drop-shadow-sm text-center">
                SAVE THE DATE
              </h4>

              <div className="space-y-3 text-[#5D534A] dark:text-zinc-200 font-bold text-lg sm:text-2xl text-center">
                <p className="leading-relaxed">
                  {data?.schedule?.[0]?.dayLabel ||
                    (event.eventDate
                      ? formatDateTime(event.eventDate, false)
                      : "ថ្ងៃសៅរ៍ ទី២១ ខែមីនា ឆ្នាំ២០២៦")}
                </p>
                <p className="text-[#a38038] dark:text-[#EACD88]">
                  {data?.schedule?.[0]?.groups?.[0]?.activities?.[0]?.time ||
                    "ម៉ោង ០៥ : ១០ ល្ងាច"}
                </p>
                {event.eventDate &&
                  (() => {
                    const dVal = event.eventDate as any;
                    const d = dVal?.toDate ? dVal.toDate() : new Date(dVal);
                    return (
                      <div className="text-[13px] sm:text-sm font-black mt-6 flex items-center justify-center gap-3 opacity-90 text-[#C5A866] dark:text-[#EACD88]">
                        <span>{`${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}.${d.getFullYear()}`}</span>
                        <div className="w-1.5 h-1.5 rounded-full bg-[#E5C170] shadow-[0_0_5px_rgba(229,193,112,0.8)]" />
                        <span>
                          {event.eventTime ||
                            d.toLocaleTimeString("en-US", {
                              hour: "numeric",
                              minute: "2-digit",
                            })}
                        </span>
                      </div>
                    );
                  })()}
              </div>

              <div className="pt-4 flex items-center justify-center gap-2 text-[#5D534A]/80 dark:text-zinc-400 font-bold text-xs sm:text-sm">
                <div className="w-8 h-8 rounded-full bg-[#E5C170]/20 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4 text-[#C5A866]" />
                </div>
                <span>
                  {data?.location?.name || "Kim Seng Wedding reception Hall"}
                </span>
              </div>
            </div>
          </div>

          <div className="w-24 h-px bg-linear-to-r from-transparent via-[#C5A866]/50 to-transparent mx-auto my-8 opacity-50" />

          {/* Section 2: Invitation & Countdown */}
          <div className="px-6 py-12 flex flex-col items-center text-center animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-200">
            <h3 className="text-[#C5A866] dark:text-[#EACD88] text-base sm:text-xl font-black mb-6 drop-shadow-sm">
              <span>យើងខ្ញុំមានកិត្តិយសសូមគោរពអញ្ជើញ</span>
            </h3>
            <div className="flex items-center justify-center gap-3 mb-10 w-full max-w-xs mx-auto">
              <div className="h-px flex-1 bg-linear-to-r from-transparent to-[#C5A866]" />
              <Heart className="w-4 h-4 text-[#C5A866] fill-[#C5A866]/20" />
              <div className="h-px flex-1 bg-linear-to-l from-transparent to-[#C5A866]" />
            </div>

            <div
              className="text-[#5D534A] dark:text-zinc-300 text-[13px] sm:text-base leading-loose sm:leading-loose max-w-md mx-auto mb-16 px-4 font-medium"
              dangerouslySetInnerHTML={{
                __html:
                  event.description ||
                  content.description ||
                  content.body ||
                  "ឯកឧត្តម លោកជំទាវ អ្នកឧកញ៉ា លោក លោកស្រី អ្នកនាងកញ្ញា អញ្ជើញចូលរួមជាអធិបតី និងជាភ្ញៀវកិត្តិយស ដើម្បីប្រសិទ្ធពរជ័យសិរីសួស្តី ជ័យមង្គល ក្នុងពិធីអាពាហ៍ពិពាហ៍ របស់យើងខ្ញុំជាកូនចៅ។",
              }}
            />

            {/* Countdown */}
            <div className="border border-[#C5A866]/40 bg-white/50 dark:bg-zinc-900/50 rounded-full px-8 py-3 mb-12 shadow-sm relative isolate overflow-hidden">
              <div className="absolute inset-0 bg-[#C5A866]/5 -z-1" />
              <span className="text-[#a38038] dark:text-[#EACD88] font-black text-xs sm:text-sm uppercase">
                <span>យើងខ្ញុំកំពុងរង់ចាំថ្ងៃពិសេស</span>
              </span>
            </div>

            <div className="flex gap-4 sm:gap-6 w-full justify-center">
              {[
                { label: "ថ្ងៃ", val: timeLeft.days },
                { label: "ម៉ោង", val: timeLeft.hours },
                { label: "នាទី", val: timeLeft.minutes },
                { label: "វិនាទី", val: timeLeft.seconds },
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-center gap-3">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#C5A866] text-white flex items-center justify-center text-2xl sm:text-3xl font-black shadow-xl shadow-[#C5A866]/20 border border-[#b3914a] transform transition-transform hover:-translate-y-1">
                    {String(item.val).padStart(2, "0")}
                  </div>
                  <span className="text-[#a38038] dark:text-[#EACD88] text-[10px] sm:text-[11px] font-black uppercase">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="w-24 h-px bg-linear-to-r from-transparent via-[#C5A866]/50 to-transparent mx-auto my-8 opacity-50" />

          {/* Section 3: Gallery */}
          {event.galleryUrls && event.galleryUrls.length > 0 && (
            <div className="px-6 py-16 flex flex-col items-center w-full animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300">
              <h3 className="text-[#C5A866] dark:text-[#EACD88] text-[15px] sm:text-lg font-black mb-10 text-center uppercase drop-shadow-sm">
                <span>កម្រងរូបភាពអាពាហ៍ពិពាហ៍របស់យើង</span>
              </h3>
              <div className="grid grid-cols-2 gap-4 sm:gap-6 w-full">
                {event.galleryUrls.slice(0, 6).map((url, i) => (
                  <div
                    key={i}
                    className="aspect-[3/4] sm:aspect-[4/5] rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden shadow-lg border-4 border-white dark:border-zinc-800 transform transition-transform hover:scale-105 hover:z-10 bg-[#E5DCC2] dark:bg-zinc-800"
                  >
                    <img
                      src={url}
                      alt={`Gallery ${i}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 4: Schedule / Location Card */}
          <div className="px-6 py-12 flex flex-col items-center text-center animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-400">
            <h3 className="text-[#C5A866] dark:text-[#EACD88] text-base sm:text-xl font-black mb-6 drop-shadow-sm">
              <span>កម្មវិធីសិរីមង្គលអាពាហ៍ពិពាហ៍</span>
            </h3>
            <div className="flex items-center justify-center gap-3 mb-10 w-full max-w-xs mx-auto">
              <div className="h-px flex-1 bg-linear-to-r from-transparent to-[#C5A866]" />
              <Heart className="w-4 h-4 text-[#C5A866] fill-[#C5A866]/20" />
              <div className="h-px flex-1 bg-linear-to-l from-transparent to-[#C5A866]" />
            </div>

            <div className="relative w-full rounded-[2.5rem] sm:rounded-[3rem] overflow-hidden shadow-2xl p-8 sm:p-12 isolate bg-white dark:bg-zinc-900 border border-black/5 dark:border-white/5 transform transition-transform hover:-translate-y-1">
              {/* Background Image of Card */}
              {event.bannerUrl ? (
                <img
                  src={event.bannerUrl}
                  alt="Background"
                  className="absolute inset-0 w-full h-full object-cover z-[-2] opacity-30 dark:opacity-50 contrast-125 grayscale-[20%]"
                />
              ) : (
                <div className="absolute inset-0 w-full h-full bg-[#3B3A36] dark:bg-black/50 z-[-2]" />
              )}
              <div className="absolute inset-0 bg-linear-to-b from-white/90 via-white/80 to-white/95 dark:from-zinc-950/80 dark:via-zinc-950/70 dark:to-zinc-950/90 z-[-1]" />

              {/* Content inside card */}
              <div className="space-y-10 text-left relative z-10 w-full">
                {/* Full Schedule List */}
                <div className="space-y-8">
                  {data?.schedule?.map((day: any, dIdx: number) => (
                    <div key={dIdx} className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="h-px flex-1 bg-linear-to-r from-transparent to-black/10 dark:to-white/20" />
                        <span className="text-[#a38038] dark:text-[#EACD88] font-black text-[11px] sm:text-xs uppercase">
                          <span>{day.dayLabel}</span>
                        </span>
                        <div className="h-px flex-1 bg-linear-to-l from-transparent to-black/10 dark:to-white/20" />
                      </div>

                      <div className="space-y-6">
                        {day.groups?.map((group: any, gIdx: number) => (
                          <div key={gIdx} className="space-y-3">
                            {group.groupTitle && (
                              <p className="text-[#5D534A]/60 dark:text-white/60 text-[10px] font-bold uppercase ml-1">
                                {group.groupTitle}
                              </p>
                            )}
                            <div className="space-y-3">
                              {group.activities?.map(
                                (activity: any, aIdx: number) => (
                                  <div
                                    key={aIdx}
                                    className="flex gap-4 items-start bg-black/5 dark:bg-black/20 p-4 rounded-2xl border border-black/5 dark:border-white/5 backdrop-blur-sm transition-all hover:bg-black/10 dark:hover:bg-white/10"
                                  >
                                    <div className="text-[#a38038] dark:text-[#EACD88] font-black text-xs sm:text-sm whitespace-nowrap pt-0.5">
                                      {activity.time}
                                    </div>
                                    <div className="space-y-1">
                                      <p className="text-[#5D534A] dark:text-white text-sm sm:text-base font-bold leading-tight">
                                        {activity.title}
                                      </p>
                                      {activity.description && (
                                        <p className="text-[#5D534A]/60 dark:text-white/50 text-[11px] sm:text-xs leading-relaxed">
                                          {activity.description}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                ),
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Location Card Details */}
                <div className="pt-10 border-t border-black/10 dark:border-white/10 space-y-6">
                  <div className="flex gap-4 sm:gap-5 items-start bg-black/5 dark:bg-zinc-900/40 p-4 rounded-2xl border border-black/5 dark:border-white/10 backdrop-blur-md">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-[0.85rem] bg-[#C5A866]/80 flex shrink-0 items-center justify-center text-white backdrop-blur-md shadow-inner">
                      <MapPin className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <div>
                      <h5 className="text-[#a38038] dark:text-[#EACD88] font-black text-[11px] sm:text-xs mb-1.5 uppercase">
                        <span>ទីតាំងកម្មវិធី</span>
                      </h5>
                      <p className="text-[#5D534A] dark:text-white text-[13px] sm:text-[15px] leading-relaxed font-bold">
                        {data?.location?.name ||
                          "Kim Seng Wedding reception Hall"}
                      </p>
                    </div>
                  </div>

                  {/* QR Code Placeholder */}
                  <div className="flex justify-center py-4">
                    <div className="bg-white p-3 rounded-2xl shadow-2xl shadow-black/20 dark:shadow-black/50 transform hover:scale-105 transition-transform">
                      <div className="w-28 h-28 sm:w-36 sm:h-36 flex flex-col items-center justify-center p-1">
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(data?.location?.mapUrl || "https://maps.google.com")}`}
                          alt="QR Code"
                          className="w-full h-full object-contain"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Button */}
                  {data?.location?.mapUrl && (
                    <a
                      href={data.location.mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-[#C5A866] text-white w-full py-4 rounded-xl flex justify-center items-center gap-2 font-bold text-[13px] sm:text-[15px] hover:bg-[#b3914a] transition-all shadow-xl active:scale-95 border border-[#b3914a]"
                    >
                      <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span>ចុចទៅកាន់ទីតាំងកម្មវិធី</span>
                    </a>
                  )}

                  {/* Dress Code */}
                  <div className="mt-8 pt-5 border-t border-black/20 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <span className="text-[#a38038] dark:text-[#EACD88] font-black text-[11px] sm:text-xs uppercase">
                      <span>ពណ៌សម្លៀកបំពាក់</span>
                    </span>
                    <div className="flex items-center gap-3 bg-black/5 dark:bg-black/50 p-2 sm:px-4 sm:py-2 rounded-full border border-black/10 dark:border-white/5 backdrop-blur-md">
                      <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white border-2 border-black/10 dark:border-transparent hover:scale-110 transition-transform cursor-default"></div>
                      <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#0F172A] border-2 border-white/20 hover:scale-110 transition-transform cursor-default"></div>
                      <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#8b9bb4] border-2 border-white/20 hover:scale-110 transition-transform cursor-default"></div>
                      <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#f8b4d9] border-2 border-white/20 hover:scale-110 transition-transform cursor-default"></div>
                      <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#EF4444] border-2 border-white/20 hover:scale-110 transition-transform cursor-default"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="w-24 h-px bg-linear-to-r from-transparent via-[#C5A866]/50 to-transparent mx-auto mt-4 mb-2 opacity-50" />

          {/* Section 5: Footer / Thank You */}
          <div className="px-6 pt-12 pb-24 flex flex-col items-center text-center animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-500">
            <h3 className="text-[#C5A866] dark:text-[#EACD88] text-base sm:text-xl font-black mb-8 drop-shadow-sm uppercase text-center px-4">
              <span>សូមថ្លែងអំណរគុណ</span>
            </h3>
            <p className="text-[#5D534A] dark:text-zinc-300 text-[13px] md:text-[15px] leading-loose max-w-md mx-auto mb-16 px-4 font-medium italic">
              <span>
                {data?.footerContent ||
                  "វត្តមានឯកឧត្ដម លោកឧកញ៉ា លោកជំទាវ លោក លោកស្រី អ្នកនាងកញ្ញា ជាកិត្តិយសដ៏ខ្ពង់ខ្ពស់ ចំពោះគ្រួសាររបស់យើងខ្ញុំ។ សូមអធ្យាស្រ័យរាល់កំហុសឆ្គងដោយប្រការណាមួយ។"}
              </span>
            </p>

            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-4xl sm:rounded-[1.5rem] bg-[#f41f4d] flex items-center justify-center text-white shadow-xl shadow-[#f41f4d]/20 transition-transform hover:scale-105 mb-8">
              <img
                src="/SIDETH-THEAPKA.png"
                alt="Logo"
                className="w-10 sm:w-24 object-contain brightness-200"
              />
            </div>

            <p className="text-[#9CA3AF] text-[10px] sm:text-xs max-w-sm mx-auto mb-8 leading-relaxed font-bold px-4">
              ក្រុមការងាររៀបចំ សូមថ្លែងអំណរគុណដល់ម្ចាស់ពិធីអាពាហ៍ពិពាហ៍
              ដែលបានជ្រើសរើសសេវាកម្មរៀបចំធៀបឌីជីថលរបស់យើងខ្ញុំ។
              សូមជូនពរលោកទាំងពីរទទួលបាននូវសុភមង្គល និងជោគជ័យគ្រប់ភារកិច្ច។
            </p>

            <div className="flex items-center gap-4 justify-center mb-6">
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-[#0088cc] flex items-center justify-center shadow-lg transform hover:-translate-y-1 transition-all"
              >
                <span className="text-white font-black text-[10px]">TEL</span>
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-[#1877F2] flex items-center justify-center shadow-lg transform hover:-translate-y-1 transition-all"
              >
                <span className="text-white font-black text-[10px]">FB</span>
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-black flex items-center justify-center shadow-lg transform hover:-translate-y-1 transition-all"
              >
                <span className="text-white font-black text-[10px]">TT</span>
              </a>
            </div>

            <p className="text-[#C5A866]/80 text-[9px] sm:text-[10px] uppercase font-black border-t border-[#C5A866]/20 pt-8 w-full">
              មត៍ក (MORDOK) Event Management © {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </div>
    </>
  );
};
