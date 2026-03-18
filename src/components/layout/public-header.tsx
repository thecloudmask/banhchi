"use client";

import React, { useState, ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface PublicHeaderProps {
  className?: string;
  nav?: ReactNode;
  actions?: ReactNode;
  transparent?: boolean;
}

export function PublicHeader({
  className,
  nav,
  actions,
  transparent = false,
}: PublicHeaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 h-16 sm:h-24 transition-all duration-500",
        transparent
          ? "bg-transparent"
          : "bg-background/80 backdrop-blur-xl border-b border-border/40 shadow-sm",
        className,
      )}
    >
      <div className="container mx-auto h-full flex items-center justify-between">
        {/* Left: Logo */}
        <div className="shrink-0">
          <Link href="/" className="flex items-center group">
            <div className="relative h-10 w-40 sm:h-14 sm:w-56 transition-transform duration-500 group-hover:scale-105">
              <Image
                src="/MORDOK-THEAPKA.png"
                alt="Logo"
                fill
                className="object-contain object-left dark:brightness-200"
                priority
              />
            </div>
          </Link>
        </div>

        {/* Desktop Navigation - Centered for Premium Look */}
        <div className="hidden lg:flex items-center justify-center flex-1 px-8">
          <div className="px-6 py-2 flex items-center gap-2">{nav}</div>
        </div>

        {/* Right side group */}
        <div className="flex items-center gap-4 sm:gap-6 shrink-0">
          {/* Desktop Only System Actions */}
          <div className="hidden lg:flex items-center gap-6 shrink-0">
            <ThemeToggle />

            {(actions || nav) && <div className="h-6 w-px bg-border/40 mx-1" />}

            <div className="flex items-center gap-4">{actions}</div>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center gap-4">
            <ThemeToggle />
            <div className="h-5 w-px bg-border/40" />
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-11 w-11 rounded-md hover:bg-accent/50 active:scale-95 transition-all border border-border/50"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="w-80 sm:max-w-md p-0 flex flex-col border-l border-border/30 bg-background/95 backdrop-blur-2xl"
              >
                <SheetHeader className="px-10 pt-16 pb-8 text-left border-none">
                  <div className="relative h-10 w-40 mb-8">
                    <Image
                      src="/MORDOK-THEAPKA.png"
                      alt="Logo"
                      fill
                      className="object-contain object-left dark:brightness-200"
                    />
                  </div>
                  <SheetTitle className="font-kantumruy font-black uppercase text-[10px] text-muted-foreground/30">
                    <span>មឺនុយបញ្ជា</span>
                  </SheetTitle>
                </SheetHeader>

                <div className="flex-1 px-10 overflow-y-auto">
                  <div
                    className="flex flex-col gap-4"
                    onClick={() => setIsOpen(false)}
                  >
                    {nav}
                  </div>
                </div>

                <div className="mt-auto p-10 bg-accent/20 border-t border-border/30">
                  <div className="w-full" onClick={() => setIsOpen(false)}>
                    {actions}
                  </div>
                  <div className="mt-10 pt-10 border-t border-border/10 flex flex-col items-center gap-2">
                    <p className="text-[10px] font-black uppercase text-muted-foreground/30">
                      © {mounted ? new Date().getFullYear() : ""} មត៌ក ធៀបការ (Mordok-Theapka)
                    </p>
                    <p className="text-[9px] font-bold uppercase text-primary/40">
                      Digital Event Companion
                    </p>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
