"use client";

import { useLayoutEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import { SystemInfoDialog } from "@/components/system-info-dialog";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { LogOut, Loader2, Calendar, Globe, ExternalLink, Languages } from "lucide-react";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/theme-toggle";
import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, signOut } = useAuth();
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
      toast.error("បរាជ័យក្នុងការចាកចេញ");
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-center p-8 text-center">
         <Loader2 className="h-8 w-8 animate-spin text-rose-500 opacity-60 mb-4" />
         <h2 className="text-sm font-bold tracking-widest uppercase text-muted-foreground">{"BANHCHI"}</h2>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-rose-500/20 font-kantumruy">
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/90 backdrop-blur-xl">
        <div className="container mx-auto max-w-7xl flex h-14 items-center justify-between px-4 sm:px-6">
          <Link href="/admin" className="flex items-center gap-3 transition-opacity hover:opacity-80">
            <div className="flex h-9 w-40 items-center justify-center overflow-hidden">
              <img src="/SIDETH-THEAPKA.png" alt="Logo" className="w-full h-full object-contain object-left dark:brightness-200 dark:contrast-75" />
            </div>
            <div className="hidden xs:flex flex-col items-start leading-none gap-0.5">
              <span className="text-xs font-bold tracking-widest uppercase text-muted-foreground/80">{"គ្រប់គ្រង"}</span>
              <span className="text-[8px] font-semibold text-muted-foreground/40 uppercase tracking-widest">{"ផ្ទាំងគ្រប់គ្រង"}</span>
            </div>
          </Link>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <a href="/" className="group">
              <Button variant="ghost" size="sm" className="h-8 rounded-md gap-2 font-semibold text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground hover:bg-accent border border-transparent hover:border-border transition-all">
                  <div className="relative">
                    <Globe className="h-3.5 w-3.5 group-hover:rotate-12 transition-transform duration-500" />
                    <span className="absolute -top-1 -right-1 h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  </div>
                  <span className="hidden sm:inline">{"មើលគេហទំព័រ"}</span>
              </Button>
            </a>
            <div>
               <ThemeToggle />
            </div>
            <div className="hidden sm:block">
              <SystemInfoDialog />
            </div>
            <div className="h-5 w-px bg-border/50 mx-1" />
            <Button
              variant="ghost"
              onClick={handleSignOut}
              className="rounded-md hover:bg-rose-500/10 hover:text-rose-500 transition-all p-2 sm:px-3 h-8 font-semibold text-[10px] sm:text-xs uppercase tracking-widest text-muted-foreground"
                title={"ចាកចេញ"}
            >
              <LogOut className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">{"ចាកចេញ"}</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-7xl py-8 px-4 sm:px-6">
        {children}
      </main>
      
      <Toaster />
    </div>
  );
}
