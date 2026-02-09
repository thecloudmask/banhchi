"use client";

import { useLanguage } from "@/providers/language-provider";
import { cn, formatDate } from "@/lib/utils";
import { Event } from "@/types";
import { Content } from "@/services/content.service";
import { Megaphone, Calendar, ArrowRight } from "lucide-react";
import Link from "next/link";

interface NewsTickerProps {
  items: (Event | Content)[];
}

function isEvent(item: Event | Content): item is Event {
  return (item as Event).eventDate !== undefined;
}

export function NewsTicker({ items }: NewsTickerProps) {
  const { t, language } = useLanguage();

  if (!items || items.length === 0) return null;

  // Double the items to create a seamless loop
  const displayItems = [...items, ...items];

  return (
    <div className="bg-primary text-primary-foreground h-11 flex items-center overflow-hidden border-b border-white/10 relative z-50 shadow-lg">
      {/* Label/Badge */}
      <div className="bg-primary px-6 h-full flex items-center gap-3 z-10 border-r border-white/10 shadow-[4px_0_15px_rgba(0,0,0,0.2)]">
        <div className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
        </div>
        <span className={cn(
          "text-[10px] font-black uppercase tracking-[0.2em] text-white whitespace-nowrap",
          language === 'kh' ? 'font-moul text-[8px]' : ''
        )}>
          {t('announcement') || "Updates"}
        </span>
      </div>

      {/* Ticker Content */}
      <div className="flex-1 overflow-hidden">
        <div className="animate-ticker flex items-center">
          {displayItems.map((item, idx) => {
            const isEvt = isEvent(item);
            const date = isEvt ? item.eventDate : item.createdAt;
            
            return (
              <Link 
                key={`${item.id}-${idx}`}
                href={`/event/${item.id}`}
                className="inline-flex items-center gap-4 px-10 group border-r border-white/5 hover:bg-white/5 transition-colors py-3"
              >
                <span className="text-[11px] text-white/50 uppercase font-black tracking-widest leading-none">
                  {formatDate(date, language)}
                </span>
                
                <span className={cn(
                  "text-sm font-bold tracking-tight text-white group-hover:text-white transition-opacity",
                  language === 'kh' ? 'text-xs leading-relaxed' : ''
                )}>
                  {item.title}
                </span>

                <ArrowRight className="h-3.5 w-3.5 text-white opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
