"use client";

import { useLanguage } from "@/providers/language-provider";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen bg-background flex flex-col items-center">
      {/* Subtle background detail */}
      <div className="fixed inset-0 -z-10 h-full w-full bg-white bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-size-[16px_16px] mask-[radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>
      
      <main className="w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
        {children}
      </main>

      <footer className="w-full py-6 text-center text-sm text-muted-foreground border-t bg-white/50 backdrop-blur-sm mt-auto">
        <p>Powered by <span className="font-semibold text-primary">{t('app_name')}</span> &copy; {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}
