"use client";

import { Loader2 } from "lucide-react";

export default function PublicLoading() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-8 space-y-4">
      <div className="relative">
        <div className="h-16 w-16 rounded-3xl bg-primary/5 animate-pulse" />
        <Loader2 className="h-8 w-8 animate-spin text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
      </div>
      <p className="text-xs font-black uppercase tracking-[0.3em] text-zinc-400 animate-pulse">
        Loading Banhchi...
      </p>
    </div>
  );
}
