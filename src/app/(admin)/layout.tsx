"use client";

import { useLayoutEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useLanguage } from "@/providers/language-provider";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { LogOut, Loader2, Calendar } from "lucide-react";
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
         <h2 className="text-xl font-black tracking-tighter">BANHCHI</h2>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-zinc-50/50 text-zinc-900 selection:bg-primary/10">
      <header className="sticky top-0 z-50 w-full border-b border-zinc-200 bg-white/80 backdrop-blur-xl">
        <div className="container mx-auto max-w-7xl flex h-20 items-center justify-between px-6">
          <Link href="/admin" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-white font-black shadow-xl shadow-primary/20">
              B
            </div>
            <span className="text-2xl font-black tracking-tighter hidden sm:inline-block">{t('admin') || "ADMIN"}</span>
          </Link>

          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <div className="h-6 w-px bg-zinc-200 mx-2" />
            <Button 
              variant="ghost" 
              onClick={handleSignOut} 
              className="rounded-2xl hover:bg-destructive/5 hover:text-destructive transition-all px-6 h-11 font-black text-xs uppercase tracking-widest"
            >
              <LogOut className="h-4 w-4 mr-3 opacity-40" />
              {t('sign_out')}
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
