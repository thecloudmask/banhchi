"use client";

import { useLanguage } from "@/providers/language-provider";

import { PublicFooter } from "@/components/layout/public-footer";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Subtle background detail */}
      <div className="fixed inset-0 -z-10 h-full w-full bg-background bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#262626_1px,transparent_1px)] bg-size-[16px_16px] mask-[radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>

      <main className="flex-1 w-full animate-in fade-in slide-in-from-bottom-6 duration-1000 relative z-10">
        {children}
      </main>

      <PublicFooter />
    </div>
  );
}
