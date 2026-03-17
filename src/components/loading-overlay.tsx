"use client";

import React from "react";
import { Loader2, Sparkles, Heart } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingOverlayProps {
  isVisible: boolean;
  message?: string;
}

export function LoadingOverlay({ isVisible, message = "កំពុងរក្សាទុក..." }: LoadingOverlayProps) {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative flex flex-col items-center gap-6 p-10 rounded-[2.5rem] bg-card border border-border shadow-2xl animate-in zoom-in-95 duration-500">
        {/* Animated Background Elements */}
        <div className="absolute inset-x-10 inset-y-10 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        
        <div className="relative">
          <div className="h-24 w-24 bg-primary/10 rounded-[1.5rem] flex items-center justify-center relative animate-bounce">
            <Heart className="h-10 w-10 text-primary fill-primary animate-pulse" />
          </div>
          <div className="absolute -top-4 -right-4">
            <Sparkles className="h-8 w-8 text-yellow-500 animate-[spin_3s_linear_infinite]" />
          </div>
          <div className="absolute -bottom-2 -left-2">
            <Loader2 className="h-6 w-6 text-primary animate-spin" />
          </div>
        </div>

        <div className="space-y-2 text-center relative z-10">
          <h3 className="text-lg font-black text-foreground uppercase tracking-widest leading-none">
            {message}
          </h3>
          <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-50">
            Please wait while we process your request
          </p>
        </div>

        {/* Progress Bar (Indeterminate) */}
        <div className="w-48 h-1.5 bg-muted rounded-full overflow-hidden relative border border-border">
          <div className="absolute inset-0 bg-primary/20" />
          <div className="h-full bg-primary animate-[loading-bar_1.5s_infinite_linear] w-[40%] rounded-full shadow-[0_0_10px_rgba(244,31,77,0.5)]" />
        </div>
      </div>
    </div>
  );
}
