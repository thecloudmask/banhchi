"use client";

import { cn, formatDateTime } from "@/lib/utils";
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
          'font-moul text-[8px]'
        )}>
          {"សេចក្តីជូនដំណឹង"}
        </span>
      </div>

      {/* Ticker Content */}
      <div className="flex-1 overflow-hidden">
        <div className="animate-ticker flex items-center">
          {displayItems.map((item, idx) => {
            const isEvt = isEvent(item);
            const date = isEvt ? item.eventDate : item.createdAt;
            
            const getPublicUrl = (item: Event | Content): string => {
              const isEvt = isEvent(item);
              const id = item.id;
              if (isEvt) {
                switch (item.category) {
                  case 'wedding':      return `/wedding/${id}`;
                  case 'buddhist':     return `/merit-making/${id}`;
                  default:             return `/event/${id}`;
                }
              }
              switch (item.type) {
                case 'wedding':      return `/wedding/${id}`;
                case 'funeral':      return `/funeral/${id}`;
                case 'article':      return `/article/${id}`;
                default:             return `/event/${id}`;
              }
            };
            
            return (
              <Link 
                key={`${item.id}-${idx}`}
                href={getPublicUrl(item)}
                className="inline-flex items-center gap-4 px-10 group border-r border-white/5 hover:bg-white/5 transition-colors py-3"
              >
                <span className="text-[11px] text-white/50 uppercase font-black tracking-widest leading-none">
                  {formatDateTime(date)}
                </span>
                
                <span className={cn(
                  "text-xs font-bold tracking-tight text-white transition-all group-hover:scale-[1.02] whitespace-nowrap",
                  'text-xs leading-normal'
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
