"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { useLanguage } from "@/providers/language-provider";

export function Breadcrumbs() {
  const pathname = usePathname();
  const { t } = useLanguage();
  
  const segments = pathname.split("/").filter(Boolean);
  
  if (segments.length <= 1) return null; // Don't show on root /admin

  return (
    <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground/60 mb-6 bg-white/40 backdrop-blur-sm px-4 py-2 rounded-full w-fit border border-white/50">
      <Link href="/admin" className="hover:text-primary transition-colors flex items-center gap-1.5">
        <Home className="h-3 w-3" />
        {t('dashboard') || "Home"}
      </Link>
      
      {segments.slice(1).map((segment, index) => {
        const path = `/${segments.slice(0, index + 2).join("/")}`;
        const isLast = index === segments.length - 2;
        
        // Handle dynamic IDs (simple check for long strings/uuids)
        const displayLabel = segment.length > 15 ? "DETAILS" : segment.toUpperCase();

        return (
          <div key={path} className="flex items-center gap-2">
            <ChevronRight className="h-2.5 w-2.5 opacity-30" />
            {isLast ? (
              <span className="text-primary">{displayLabel}</span>
            ) : (
              <Link href={path} className="hover:text-primary transition-colors">
                {displayLabel}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}
