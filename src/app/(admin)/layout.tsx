"use client";

import { useLayoutEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import { LanguageSwitcher } from "@/components/language-switcher";
import { SystemInfoDialog } from "@/components/system-info-dialog";
import { useLanguage } from "@/providers/language-provider";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { LogOut, Loader2, Calendar, Globe } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, signOut } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();

  useLayoutEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace("/");
    } catch (error) {
      toast.error(t('failed_logout') || "Failed to log out");
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-center p-8 text-center">
         <div className="relative mb-8">
            <div className="h-20 w-20 rounded-3xl bg-primary/5 animate-pulse" />
            <Loader2 className="h-10 w-10 animate-spin text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
         </div>
         <h2 className="text-xl font-black tracking-tighter uppercase">{t('app_name')}</h2>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-zinc-50/50 text-zinc-900 selection:bg-primary/10">
      <header className="sticky top-0 z-50 w-full border-b border-zinc-200 bg-white backdrop-blur-xl">
        <div className="container mx-auto max-w-7xl flex h-16 items-center justify-between px-4 sm:px-6">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="flex h-10 w-32 items-center justify-center overflow-hidden">
              <img src="/SIDETH-THEAPKA.png" alt="Logo" className="w-full h-full object-contain object-left" />
            </div>
            <span className="text-xl font-black tracking-tighter hidden xs:inline-block">{t('admin') || "ADMIN"}</span>
          </Link>

          <div className="flex items-center gap-1 sm:gap-2">
            <div className="hidden sm:flex items-center gap-1 sm:gap-2">
              <Link href="/" target="_blank">
                <Button variant="ghost" size="sm" className="h-9 sm:h-10 rounded-xl gap-2 font-bold text-xs text-zinc-500 hover:text-primary">
                    <Globe className="h-4 w-4" />
                    <span className="hidden lg:inline">{t('view_website')}</span>
                </Button>
              </Link>
              <div className="h-4 w-px bg-zinc-200" />
              <SystemInfoDialog />
            </div>
            
            <LanguageSwitcher />
            
            <div className="h-6 w-px bg-zinc-200 mx-1" />

            <Button 
              variant="ghost" 
              onClick={handleSignOut} 
              className="rounded-xl hover:bg-destructive/5 hover:text-destructive transition-all p-2 sm:px-4 h-9 sm:h-10 font-black text-[10px] sm:text-xs uppercase tracking-widest"
              title={t('sign_out')}
            >
              <LogOut className="h-4 w-4 sm:mr-2 opacity-40" />
              <span className="hidden sm:inline">{t('sign_out')}</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-7xl py-12 px-6">
        {children}
      </main>
      
      <Toaster />
    </div>
  );
}
