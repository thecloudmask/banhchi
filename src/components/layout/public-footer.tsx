"use client";
import React, { useState, useEffect } from "react";

import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { LifeBuoy, Phone, MessageCircle, ShieldCheck } from "lucide-react";

interface PublicFooterProps {
  className?: string;
  variant?: "default" | "premium";
}

export function PublicFooter({
  className,
  variant = "default",
}: PublicFooterProps) {
  const [mounted, setMounted] = useState(false);
  
  React.useEffect(() => {
    setMounted(true);
  }, []);

  const year = mounted ? new Date().getFullYear() : "";

  if (variant === "premium") {
    return (
      <footer
        className={cn(
          "border-t border-[#C5A866]/10 bg-card py-20 text-center relative px-6 overflow-hidden",
          className,
        )}
      >
        {/* Decorative elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-px bg-linear-to-r from-transparent via-[#C5A866]/30 to-transparent" />

        <div className="container relative z-10 mx-auto max-w-5xl">
          <div className="flex flex-col items-center gap-10 mb-16">
            <Link
              href="/"
              className="inline-block transition-all duration-500 hover:scale-105"
            >
              <div className="relative h-20 w-64 sm:h-24 sm:w-72">
                <Image
                  src="/SIDETH-THEAPKA.png"
                  alt="Logo"
                  fill
                  className="object-contain dark:brightness-200"
                />
              </div>
            </Link>

            <div className="flex flex-wrap justify-center gap-x-12 gap-y-6">
              <Link
                href="/privacy"
                className="text-[#C5A866] text-[10px] font-black uppercase hover:opacity-70 transition-opacity"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="text-[#C5A866] text-[10px] font-black uppercase hover:opacity-70 transition-opacity"
              >
                Terms of Use
              </Link>
              <Link
                href="/support"
                className="text-[#C5A866] text-[10px] font-black uppercase hover:opacity-70 transition-opacity"
              >
                សេវាគាំទ្រ
              </Link>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-center gap-4">
              <div className="h-px w-12 bg-[#C5A866]/20" />
              <p className="text-[#C5A866] text-[11px] font-black uppercase">
                © {year} មត៌ត ធៀបការ (Motorola Theapka)
              </p>
              <div className="h-px w-12 bg-[#C5A866]/20" />
            </div>
            <p className="text-[10px] font-bold uppercase text-[#C5A866]/40 leading-relaxed max-w-md mx-auto">
              <span>សេវាគ្រប់គ្រងពិធីឌីជីថល ផ្តល់ជូនដោយ មត៌ត ធៀបការ (Motorola Theapka)</span>
            </p>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer
      className={cn(
        "bg-card py-24 border-t border-border relative z-10 w-full overflow-hidden",
        className,
      )}
    >
      <div className="container mx-auto max-w-7xl px-8 lg:px-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-20">
          {/* Brand Column */}
          <div className="space-y-8">
            <Link
              href="/"
              className="inline-block transition-all duration-300 hover:opacity-70"
            >
              <div className="relative h-12 w-48">
                <Image
                  src="/SIDETH-THEAPKA.png"
                  alt="Logo"
                  fill
                  className="object-contain object-left dark:brightness-200"
                />
              </div>
            </Link>
            <p className="text-[13px] text-muted-foreground/80 leading-relaxed font-medium">
              សេវាគ្រប់គ្រងពិធីឌីជីថល និងការកត់ត្រាចំណងដៃទំនើប
              ដើម្បីជួយសម្រួលដល់ម្ចាស់កម្មវិធីក្នុងសម័យកាលឌីជីថល។
            </p>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-md bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20 shadow-sm shadow-emerald-500/5">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-foreground">
                  Secure System
                </p>
                <p className="text-[9px] font-bold text-muted-foreground uppercase">
                  End-to-End Encrypted
                </p>
              </div>
            </div>
          </div>

          {/* Quick Links Column */}
          <div className="space-y-8 lg:ml-8">
            <h4 className="text-[11px] font-black uppercase text-foreground border-l-2 border-primary pl-3 py-0.5">
              តំណភ្ជាប់រហ័ស
            </h4>
            <ul className="space-y-4">
              {[
                { label: "សេវាគាំទ្រ", href: "/support" },
                { label: "Privacy Policy", href: "/privacy" },
                { label: "Terms of Use", href: "/terms" },
                { label: "ជំនួយបច្ចេកទេស", href: "/support" },
              ].map((link, i) => (
                <li key={i}>
                  <Link
                    href={link.href}
                    className="text-[13px] text-muted-foreground hover:text-primary transition-colors font-medium"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Event Types Column */}
          <div className="space-y-8">
            <h4 className="text-[11px] font-black uppercase text-foreground border-l-2 border-primary pl-3 py-0.5">
              សេវាកម្មរបស់យើង
            </h4>
            <ul className="space-y-4">
              {[
                { label: "អាពាហ៍ពិពាហ៍" },
                { label: "បុណ្យទាន" },
                { label: "កម្មវិធីបុណ្យ" },
                { label: "សេចក្តីជូនដំណឹង" },
              ].map((item, i) => (
                <li
                  key={i}
                  className="text-[13px] text-muted-foreground flex items-center gap-2 group cursor-default"
                >
                  <span className="h-1 w-1 rounded-full bg-border group-hover:bg-primary transition-colors" />
                  <span className="font-medium">{item.label}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Column */}
          <div className="space-y-8">
            <h4 className="text-[11px] font-black uppercase text-foreground border-l-2 border-primary pl-3 py-0.5">
              ទំនាក់ទំនងយើង
            </h4>
            <div className="space-y-6">
              <div className="flex items-center gap-4 group">
                <div className="h-10 w-10 rounded-md bg-muted/50 flex items-center justify-center text-primary border border-border group-hover:bg-primary/10 transition-colors">
                  <Phone className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[9px] font-black text-muted-foreground uppercase opacity-40">
                    Call Hotline
                  </p>
                  <p className="text-sm font-black text-foreground">
                    098 943 324
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 group">
                <div className="h-10 w-10 rounded-md bg-muted/50 flex items-center justify-center text-blue-500 border border-border group-hover:bg-blue-500/10 transition-colors">
                  <MessageCircle className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[9px] font-black text-muted-foreground uppercase opacity-40">
                    Telegram
                  </p>
                  <a
                    href="https://t.me/theapka_support"
                    target="_blank"
                    className="text-sm font-black text-foreground hover:text-primary transition-colors"
                  >
                    @theapka_support
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-4 p-3 rounded-md bg-muted/30 border border-border/50">
                <Image
                  src="/mengley.svg"
                  alt="Support QR"
                  width={40}
                  height={40}
                  className=""
                />
                <p className="text-[10px] font-black text-muted-foreground/50 uppercase leading-tight">
                  ស្កេនដើម្បីសាកសួរ
                  <br />
                  ព័ត៌មានបន្ថែម
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-10 border-t border-border/50 flex flex-col sm:flex-row justify-between items-center gap-8">
          <div className="flex flex-col items-center sm:items-start gap-1">
            <p className="text-[10px] font-black text-foreground uppercase">
              © {year} មត៌ត ធៀបការ (Motorola Theapka)
            </p>
            <p className="text-[9px] font-bold text-muted-foreground/30 uppercase">
              Digital Solutions for Modern Events
            </p>
          </div>

          <div className="flex items-center gap-10">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[10px] font-black uppercase text-emerald-600/60">
                Server: Active
              </span>
            </div>
            <p className="text-[9px] font-bold text-muted-foreground/40 uppercase">
              V1.0.4-PRO
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
