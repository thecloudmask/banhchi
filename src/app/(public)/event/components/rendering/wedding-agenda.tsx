import React, { useState, useEffect } from "react";
import { cn, formatDateTime, formatKhmerTimeStr } from "@/lib/utils";
import { useLanguage } from "@/providers/language-provider";
import { Content } from "@/services/content.service";
import { Event } from "@/types";
import {
  Heart,
  MapPin,
  Mail,
  Calendar,
  ChevronDown,
  X,
  ZoomIn,
} from "lucide-react";
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

  const data: any = {
    ...contentData,
    ...extra,
    groom: {
      name: extra.groomName || contentData.groom?.name,
      fatherTitle: extra.groomFatherTitle || contentData.groom?.fatherTitle,
      father: extra.groomFatherName || contentData.groom?.fatherName,
      motherTitle: extra.groomMotherTitle || contentData.groom?.motherTitle,
      mother: extra.groomMotherName || contentData.groom?.motherName,
    },
    bride: {
      name: extra.brideName || contentData.bride?.name,
      fatherTitle: extra.brideFatherTitle || contentData.bride?.fatherTitle,
      father: extra.brideFatherName || contentData.bride?.fatherName,
      motherTitle: extra.brideMotherTitle || contentData.bride?.motherTitle,
      mother: extra.brideMotherName || contentData.bride?.motherName,
    },
    schedule: extra.schedule || contentData.schedule,
    location: extra.location ||
      contentData.location || { name: event.location, mapUrl: event.mapUrl },
    footerContent: extra.footerContent || contentData.footerContent,
    khqrUSDUrl:
      extra.khqrUSDUrl ||
      contentData.khqrUSDUrl ||
      extra.bankQrUrl ||
      contentData.bankQrUrl,
    khqrKHRUrl: extra.khqrKHRUrl || contentData.khqrKHRUrl,
  };

  const [mounted, setMounted] = useState(false);
  const [showCover, setShowCover] = useState(true);
  const [isOpening, setIsOpening] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  React.useEffect(() => {
    setMounted(true);
  }, []);

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
              className="absolute inset-0 w-full h-full object-cover z-[-2] blur-[2px] scale-105"
            />
          ) : (
            <div className="absolute inset-0 w-full h-full bg-card z-[-2]" />
          )}
          <div className="absolute inset-0 bg-black/25 bg-linear-to-b from-black/20 via-transparent to-black/95 z-[-1]" />

          {/* Top Texts */}
          <div className="relative z-10 w-full flex flex-col items-center p-6 sm:p-12 mt-20 sm:mt-32 space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-10 duration-1000">
            <h1
              style={{ fontFamily: "Kh Muol Light" }}
              className="text-2xl sm:text-4xl lg:text-6xl text-[#E5C170] drop-shadow-xl text-center leading-relaxed"
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
            : "opacity-100 min-h-screen overflow-y-auto",
        )}
      >
        {/* Subtle background overlay (optional pattern) */}
        <div className="absolute inset-0 bg-white/40 dark:bg-black/40 pointer-events-none" />

        <div className="max-w-2xl mx-auto pb-10 relative z-10 w-full">
          {/* Section 1: Hero */}
          <div className="relative rounded-none sm:rounded-[3rem] min-h-[700px] sm:h-screen flex flex-col items-center justify-between px-6 overflow-hidden">
            {/* Background Image that covers the screen as in the image */}
            <div className="absolute inset-0 z-[-2] overflow-hidden">
              {event.bannerUrl ? (
                <img
                  src={event.bannerUrl}
                  alt="Wedding Background"
                  className="w-full h-full object-cover blur-[2px] scale-105"
                />
              ) : (
                <div className="w-full h-full bg-[#E5DCC2] dark:bg-zinc-800" />
              )}
            </div>

            {/* Premium Overlays */}
            <div className="absolute inset-x-0 bottom-0 h-2/3 bg-linear-to-t from-[#FDFBF4] via-[#FDFBF4]/60 to-transparent dark:from-zinc-950 dark:via-zinc-950/60 dark:to-transparent z-[-1]" />
            <div className="absolute inset-0 bg-black/20 dark:bg-black/40 z-[-1]" />

            {/* Animated Flower/Heart Particles for Premium Feel */}
            {/* Static positions to avoid SSR/client hydration mismatch (no Math.random in render) */}
            <div className="absolute inset-0 pointer-events-none z-1 overflow-hidden opacity-40">
              {[
                { left: 8, top: 12, delay: 0.4, opacity: 0.6 },
                { left: 23, top: 55, delay: 1.2, opacity: 0.5 },
                { left: 40, top: 30, delay: 2.0, opacity: 0.7 },
                { left: 62, top: 72, delay: 0.8, opacity: 0.4 },
                { left: 78, top: 18, delay: 3.1, opacity: 0.65 },
                { left: 90, top: 45, delay: 1.5, opacity: 0.55 },
                { left: 15, top: 80, delay: 2.7, opacity: 0.5 },
                { left: 50, top: 90, delay: 0.2, opacity: 0.45 },
                { left: 35, top: 8, delay: 4.0, opacity: 0.7 },
                { left: 70, top: 60, delay: 3.5, opacity: 0.6 },
                { left: 55, top: 40, delay: 1.0, opacity: 0.5 },
                { left: 82, top: 85, delay: 2.3, opacity: 0.65 },
              ].map((p, i) => (
                <div
                  key={i}
                  className="absolute animate-float-slow"
                  style={{
                    left: `${p.left}%`,
                    top: `${p.top}%`,
                    animationDelay: `${p.delay}s`,
                    opacity: p.opacity,
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
                className="text-2xl sm:text-4xl text-[#C5A866] mb-8 sm:mb-10 drop-shadow-[0_2px_4px_rgba(0,0,0,0.1)]"
              >
                <span>សិរីមង្គលអាពាហ៍ពិពាហ៍</span>
              </h2>

              {/* Parents Section */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-20 w-full max-w-2xl mb-12 px-6">
                {/* Groom's Parents */}
                <div className="flex flex-col items-start text-left space-y-1 sm:space-y-2">
                  {(data.groom?.father || data.groom?.mother) && mounted && (
                    <div className="space-y-1">
                      {data.groom.father && (
                        <p className="text-white dark:text-zinc-200 text-[12px] sm:text-lg font-black drop-shadow-md">
                          <span className="text-[#E5C170] mr-2">
                            {data.groom.fatherTitle || "លោក"}
                          </span>
                          {data.groom.father}
                        </p>
                      )}
                      {data.groom.mother && (
                        <p className="text-white dark:text-zinc-200 text-[12px] sm:text-lg font-black drop-shadow-md">
                          <span className="text-[#E5C170] mr-2">
                            {data.groom.motherTitle || "លោកស្រី"}
                          </span>
                          {data.groom.mother}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Bride's Parents */}
                <div className="flex flex-col items-end text-right space-y-1 sm:space-y-2">
                  {(data.bride?.father || data.bride?.mother) && mounted && (
                    <div className="space-y-1">
                      {data.bride.father && (
                        <p className="text-white dark:text-zinc-200 text-[12px] sm:text-lg font-black drop-shadow-md">
                          <span className="text-[#E5C170] mr-2">
                            {data.bride.fatherTitle || "លោក"}
                          </span>
                          {data.bride.father}
                        </p>
                      )}
                      {data.bride.mother && (
                        <p className="text-white dark:text-zinc-200 text-[12px] sm:text-lg font-black drop-shadow-md">
                          <span className="text-[#E5C170] mr-2">
                            {data.bride.motherTitle || "លោកស្រី"}
                          </span>
                          {data.bride.mother}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Main Content Group in the middle */}
              <div className="flex flex-col items-center space-y-4 mb-12 relative px-4">
                <div
                  className="italic text-[#E5C170] text-3xl sm:text-4xl md:text-5xl drop-shadow-md mb-1"
                  style={{ fontFamily: "'Dancing Script', cursive, serif" }}
                >
                  The Wedding Day
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-6 w-full max-w-2xl text-3xl sm:text-5xl lg:text-5xl font-black text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.3)] filter contrast-125">
                  <span className="leading-tight mix-blend-plus-lighter">
                    {data?.groom?.name}
                  </span>
                  <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-lg group my-2 sm:my-0">
                    <Heart className="w-5 h-5 sm:w-7 sm:h-7 text-[#E5C170] fill-[#E5C170] group-hover:scale-125 transition-transform duration-500" />
                  </div>
                  <span className="leading-tight mix-blend-plus-lighter">
                    {data?.bride?.name}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 1.5: Invitation Statement (Clean Background) */}
          <div className="px-6 py-16 flex flex-col items-center text-center bg-[#FDFBF4] dark:bg-zinc-950 relative z-20">
            <h4
              style={{ fontFamily: "Kh Muol Light" }}
              className="text-[#5D534A] dark:text-[#EACD88] text-base sm:text-xl font-black mb-8 leading-relaxed"
            >
              <span>យើងខ្ញុំមានកិត្តិយសសូមគោរពអញ្ជើញ</span>
            </h4>
            {mounted && (
              <div
                className="text-[#5D534A] dark:text-zinc-300 text-[14px] sm:text-lg leading-loose max-w-xl mx-auto font-medium px-4"
                dangerouslySetInnerHTML={{
                  __html:
                    event.description ||
                    content.description ||
                    content.body ||
                    "ឯកឧត្តម លោកជំទាវ អ្នកឧកញ៉ា លោក លោកស្រី អ្នកនាងកញ្ញា អញ្ជើញចូលរួមជាអធិបតី និងជាភ្ញៀវកិត្តិយស ដើម្បីប្រសិទ្ធពរជ័យសិរីសួស្តី ជ័យមង្គល ក្នុងពិធីអាពាហ៍ពិពាហ៍ របស់យើងខ្ញុំជាកូនចៅ។",
                }}
              />
            )}
            <div className="w-24 h-px bg-linear-to-r from-transparent via-[#C5A866]/50 to-transparent mt-12 opacity-50" />
          </div>

          {/* Section: Wedding Program (Schedule) */}
          <div className="relative z-20 px-6 pb-6 flex flex-col items-center animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-400">
            <div className="relative w-full rounded-[2.5rem] sm:rounded-[3rem] overflow-hidden p-8 sm:p-12 isolate bg-white dark:bg-zinc-900 border border-black/5 dark:border-white/5 transform transition-transform hover:-translate-y-1">
              {/* Background of Card */}
              {event.bannerUrl ? (
                <img
                  src={event.bannerUrl}
                  alt="Background"
                  className="absolute inset-0 w-full h-full object-cover z-[-2] opacity-30 dark:opacity-50 contrast-125 grayscale-20"
                />
              ) : (
                <div className="absolute inset-0 w-full h-full bg-[#3B3A36] dark:bg-black/50 z-[-2]" />
              )}
              <div className="absolute inset-0 bg-linear-to-b from-white/95 via-white/90 to-white/98 dark:from-zinc-950/90 dark:via-zinc-950/80 dark:to-zinc-950/95 z-[-1]" />

              <div className="space-y-10 mt-20 text-center relative z-10 w-full">
                <div className="flex flex-col items-center">
                  <h3 className="text-[#C5A866] dark:text-[#EACD88] text-base sm:text-xl font-black mb-4 drop-shadow-sm">
                    <span>កម្មវិធីសិរីមង្គលអាពាហ៍ពិពាហ៍</span>
                  </h3>
                  <div className="flex items-center justify-center gap-3 mb-8 w-full max-w-xs mx-auto">
                    <div className="h-px flex-1 bg-linear-to-r from-transparent to-[#C5A866]" />
                    <Heart className="w-4 h-4 text-[#C5A866] fill-[#C5A866]/20" />
                    <div className="h-px flex-1 bg-linear-to-l from-transparent to-[#C5A866]" />
                  </div>
                </div>

                <div className="space-y-10 text-left">
                  {data?.schedule?.map((day: any, dIdx: number) => {
                    // Normalize: admin saves flat `activities[]`; content.service uses nested `groups[].activities[]`
                    // Support both formats transparently
                    const groups: { groupTitle?: string; activities: any[] }[] =
                      Array.isArray(day.groups) && day.groups.length > 0
                        ? day.groups
                        : [
                            {
                              groupTitle: "",
                              activities: day.activities || [],
                            },
                          ];

                    return (
                      <div key={dIdx} className="space-y-6">
                        <div className="flex items-center gap-3">
                          <div className="h-px flex-1 bg-linear-to-r from-transparent to-[#C5A866]/30" />
                          <span className="text-[#a38038] dark:text-[#EACD88] font-black text-xs sm:text-sm uppercase tracking-wider">
                            {day.dayLabel}
                          </span>
                          <div className="h-px flex-1 bg-linear-to-l from-transparent to-[#C5A866]/30" />
                        </div>

                        <div className="space-y-0 relative ml-2 sm:ml-4">
                          <div className="absolute left-0 top-2 bottom-2 w-0.5 bg-linear-to-b from-[#C5A866]/50 via-[#C5A866]/20 to-[#C5A866]/50" />

                          <div className="space-y-6">
                            {groups.map((group: any, gIdx: number) => (
                              <div key={gIdx} className="space-y-4">
                                {group.groupTitle && (
                                  <p className="text-[#C5A866] dark:text-[#EACD88]/80 text-[11px] font-black uppercase ml-6 tracking-widest">
                                    {group.groupTitle}
                                  </p>
                                )}
                                <div className="space-y-6">
                                  {group.activities?.map(
                                    (activity: any, aIdx: number) => (
                                      <div
                                        key={aIdx}
                                        className="relative pl-8 group"
                                      >
                                        <div className="absolute left-[-3px] top-1.5 w-2 h-2 rounded-full bg-[#C5A866] shadow-[0_0_8px_rgba(197,168,102,0.6)] group-hover:scale-150 transition-transform duration-300" />

                                        <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4 transition-all group-hover:translate-x-1 duration-300">
                                          <div className="text-[#a38038] dark:text-[#EACD88] font-black text-xs sm:text-sm whitespace-nowrap opacity-80">
                                            {formatKhmerTimeStr(activity.time)}
                                          </div>
                                          <div className="space-y-1">
                                            <p className="text-[#5D534A] dark:text-white text-[14px] sm:text-[16px] font-black leading-tight">
                                              {activity.title}
                                            </p>
                                            {activity.description && (
                                              <p className="text-[#5D534A]/60 dark:text-white/50 text-[11px] sm:text-xs leading-relaxed font-medium">
                                                {activity.description}
                                              </p>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    ),
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Location Detail */}
                <div className="pt-10 border-t border-[#C5A866]/20 space-y-6">
                  <div className="flex gap-4 sm:gap-5 items-start bg-[#C5A866]/5 dark:bg-white/5 p-5 rounded-3xl border border-[#C5A866]/10 backdrop-blur-md">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-[#C5A866] flex shrink-0 items-center justify-center text-white shadow-lg">
                      <MapPin className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <div className="space-y-1">
                      <h5 className="text-[#a38038] dark:text-[#EACD88] font-black text-[11px] sm:text-xs uppercase tracking-wider">
                        ទីតាំងកម្មវិធី
                      </h5>
                      <p className="text-[#5D534A] dark:text-white text-[13px] sm:text-[15px] leading-relaxed font-bold">
                        {data?.location?.name ||
                          "Kim Seng Wedding reception Hall"}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-center py-2">
                    <div className="bg-white p-4 rounded-[2rem] shadow-2xl shadow-black/10 border border-[#C5A866]/10">
                      <div className="w-24 h-24 sm:w-32 sm:h-32 flex items-center justify-center">
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(data?.location?.mapUrl || "https://maps.google.com")}`}
                          alt="QR Code"
                          className="w-full h-full object-contain"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Scroll Indicator */}
                  {data?.location?.mapUrl && (
                    <div className="flex justify-center -mb-2 mt-4 animate-bounce opacity-40">
                      <ChevronDown className="w-8 h-8 text-[#C5A866]" />
                    </div>
                  )}

                  {data?.location?.mapUrl && (
                    <a
                      href={data.location.mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-[#C5A866] text-white w-full py-4 rounded-2xl flex justify-center items-center gap-2 font-black text-[13px] sm:text-[15px] hover:bg-[#b3914a] transition-all shadow-xl shadow-[#C5A866]/20 active:scale-95"
                    >
                      <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span>ចុចទៅកាន់ទីតាំងកម្មវិធី</span>
                    </a>
                  )}

                  <div className="mt-8 pt-6 border-t border-[#C5A866]/10 flex flex-col sm:flex-row items-center justify-between gap-6">
                    <span className="text-[#a38038] dark:text-[#EACD88] font-black text-[11px] sm:text-xs uppercase tracking-widest">
                      ពណ៌សម្លៀកបំពាក់
                    </span>
                    <div className="flex items-center gap-3 bg-[#C5A866]/5 dark:bg-black/50 p-2 sm:px-4 sm:py-2 rounded-full border border-[#C5A866]/10 backdrop-blur-md">
                      <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white border-2 border-black/10 hover:scale-110 transition-transform cursor-pointer shadow-sm"></div>
                      <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#0F172A] border-2 border-white/20 hover:scale-110 transition-transform cursor-pointer shadow-sm"></div>
                      <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#8b9bb4] border-2 border-white/20 hover:scale-110 transition-transform cursor-pointer shadow-sm"></div>
                      <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#f8b4d9] border-2 border-white/20 hover:scale-110 transition-transform cursor-pointer shadow-sm"></div>
                      <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#EF4444] border-2 border-white/20 hover:scale-110 transition-transform cursor-pointer shadow-sm"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="w-24 h-px bg-linear-to-r from-transparent via-[#C5A866]/50 to-transparent mx-auto my-4 opacity-50" />

          {/* Section 2: Invitation & Countdown */}
          <div className="px-6 py-6 flex flex-col items-center text-center animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-200">
            <div className="border border-[#C5A866]/40 bg-white/50 dark:bg-zinc-900/50 rounded-full px-8 py-3 mb-8 shadow-sm relative isolate overflow-hidden">
              <div className="absolute inset-0 bg-[#C5A866]/5 -z-1" />
              <span className="text-[#a38038] dark:text-[#EACD88] font-black text-xs sm:text-sm uppercase">
                <span>យើងខ្ញុំកំពុងរង់ចាំថ្ងៃពិសេស</span>
              </span>
            </div>

            {mounted && (
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
            )}
          </div>

          <div className="w-24 h-px bg-linear-to-r from-transparent via-[#C5A866]/50 to-transparent mx-auto my-4 opacity-50" />

          {/* Section 3: Gallery */}
          {event.galleryUrls && event.galleryUrls.length > 0 && (
            <div className="px-6 py-8 flex flex-col items-center w-full animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300">
              <h3 className="text-[#C5A866] dark:text-[#EACD88] text-[15px] sm:text-lg font-black mb-6 text-center uppercase drop-shadow-sm">
                <span>កម្រងរូបភាពអាពាហ៍ពិពាហ៍របស់យើង</span>
              </h3>
              <div className="grid grid-cols-2 gap-4 sm:gap-6 w-full">
                {event.galleryUrls.slice(0, 8).map((url, i) => (
                  <div
                    key={i}
                    onClick={() => setSelectedImage(url)}
                    className="aspect-3/4 sm:aspect-4/5 rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden shadow-lg border-4 border-white dark:border-zinc-800 transform transition-all hover:scale-[1.03] hover:z-10 bg-[#E5DCC2] dark:bg-zinc-800 cursor-zoom-in group relative"
                  >
                    <img
                      src={url}
                      alt={`Gallery ${i}`}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="bg-white/20 backdrop-blur-md p-3 rounded-full border border-white/30 transform scale-75 group-hover:scale-100 transition-transform">
                        <ZoomIn className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="w-24 h-px bg-linear-to-r from-transparent via-[#C5A866]/50 to-transparent mx-auto mt-4 mb-2 opacity-50" />

          {/* Section 4: Gifts / Banking */}
          {(data.khqrUSDUrl || data.khqrKHRUrl) && mounted && (
            <div className="px-6 py-8 flex flex-col items-center w-full animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-400">
              <h3 className="text-[#C5A866] dark:text-[#EACD88] text-[18px] sm:text-2xl font-black mb-4 text-center uppercase drop-shadow-sm">
                <span>ចំណងដៃ</span>
              </h3>
              <p className="text-[#5D534A] dark:text-zinc-300 text-[12px] sm:text-[14px] leading-relaxed max-w-md mx-auto mb-8 text-center px-4 font-medium italic opacity-80">
                <span>
                  លោកអ្នកក៏អាចធ្វើចំណងដៃតាមរយៈធនាគារ ABA របស់យើងខ្ញុំបាន
                  ដោយស្កេន QR Code
                </span>
              </p>

              <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-8 w-full px-2">
                {data.khqrUSDUrl && (
                  <div className="flex flex-col items-center space-y-4">
                    <div className="relative group w-70 sm:w-75 rounded-[1.5rem] overflow-hidden shadow-2xl border-4 border-white dark:border-zinc-800 bg-white hover:border-[#C5A866] transition-all">
                      <img
                        src={data.khqrUSDUrl}
                        alt="KHQR USD"
                        className="w-full h-auto object-contain cursor-zoom-in"
                        onClick={() => setSelectedImage(data.khqrUSDUrl)}
                      />
                      <div className="bg-[#C5A866] text-white py-3 text-center text-[10px] sm:text-[12px] font-black uppercase tracking-widest shadow-lg">
                        ABA PAY (USD)
                      </div>
                    </div>
                  </div>
                )}
                {data.khqrKHRUrl && (
                  <div className="flex flex-col items-center space-y-4">
                    <div className="relative group w-70 sm:w-75 rounded-[1.5rem] overflow-hidden shadow-2xl border-4 border-white dark:border-zinc-800 bg-white hover:border-[#C5A866] transition-all">
                      <img
                        src={data.khqrKHRUrl}
                        alt="KHQR KHR"
                        className="w-full h-auto object-contain cursor-zoom-in"
                        onClick={() => setSelectedImage(data.khqrKHRUrl)}
                      />
                      <div className="bg-[#C5A866] text-white py-3 text-center text-[10px] sm:text-[12px] font-black uppercase tracking-widest shadow-lg">
                        ABA PAY (KHR)
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="w-24 h-px bg-linear-to-r from-transparent via-[#C5A866]/50 to-transparent mx-auto mt-4 mb-2 opacity-50" />

          {/* Section 5: Footer / Thank You */}
          <div className="px-6 pt-8 pb-16 flex flex-col items-center text-center animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-500">
            <h3 className="text-[#C5A866] dark:text-[#EACD88] text-base sm:text-xl font-black mb-4 drop-shadow-sm uppercase text-center px-4">
              <span>សូមថ្លែងអំណរគុណ</span>
            </h3>
            <p className="text-[#5D534A] dark:text-zinc-300 text-[13px] md:text-[15px] leading-loose max-w-md mx-auto mb-10 px-4 font-medium italic">
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
              មត៌ត ធៀបការ (Motorola Theapka) Event Management ©{" "}
              {mounted ? new Date().getFullYear() : ""}
            </p>
          </div>
        </div>
      </div>

      {/* Gallery Lightbox */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-999 bg-black/95 flex flex-col items-center justify-center p-4 sm:p-10 animate-in fade-in duration-300"
          onClick={() => setSelectedImage(null)}
        >
          <button
            className="absolute top-6 right-6 sm:top-10 sm:right-10 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white transition-all z-10 hover:rotate-90"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedImage(null);
            }}
          >
            <X className="w-6 h-6" />
          </button>

          <div
            className="relative w-full h-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedImage}
              alt="Gallery Preview"
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl animate-in zoom-in-95 fill-mode-both duration-500"
            />
          </div>
        </div>
      )}
    </>
  );
};
