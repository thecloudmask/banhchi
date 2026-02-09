"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Info, Phone, MessageCircle, Clock, Smartphone } from "lucide-react";
import { useLanguage } from "@/providers/language-provider";
import { Separator } from "@/components/ui/separator";

export function SystemInfoDialog() {
  const { t } = useLanguage();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-primary">
          <Info className="h-5 w-5" />
          <span className="sr-only">{t('system_info')}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-100 p-0 overflow-hidden border-0 shadow-2xl rounded-3xl">
        {/* Header Section */}
        <div className="bg-zinc-900 text-white p-8 flex flex-col items-center justify-center text-center">
            <div className="h-16 w-16 bg-white rounded-2xl flex items-center justify-center text-zinc-900 mb-4 shadow-lg shadow-white/10">
                <span className="text-3xl font-black">B</span>
            </div>
            <DialogTitle className="text-2xl font-black tracking-tight mb-2">{t('banhchi_system')}</DialogTitle>
            <DialogDescription className="sr-only">Support and system information for Banhchi.</DialogDescription>
            <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-800 text-zinc-300 border border-zinc-700">
                v1.0.0
            </div>
        </div>

        <div className="p-6 space-y-6 bg-white">
            {/* Ownership Section */}
            <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground font-medium">
                    {t('developed_for')}
                </p>
                <h3 className="font-bold text-lg text-primary">
                    {t('client_name_placeholder')}
                </h3>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
                    © 2026 {t('all_rights_reserved')}
                </p>
            </div>

            <Separator />

            {/* Support Section */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 text-zinc-900">
                    <div className="h-8 w-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                        <Smartphone className="h-4 w-4" />
                    </div>
                    <h4 className="font-bold text-sm uppercase tracking-wide">{t('tech_support')}</h4>
                </div>
                
                <p className="text-xs text-muted-foreground leading-relaxed pl-10">
                    {t('support_desc')}
                </p>

                <div className="bg-zinc-50 rounded-2xl p-4 space-y-3 border border-zinc-100 ml-2">
                    <div className="flex items-center gap-3">
                        <Phone className="h-4 w-4 text-zinc-400" />
                        <span className="text-sm font-bold text-zinc-700 font-mono">012 345 678</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <MessageCircle className="h-4 w-4 text-zinc-400" />
                        <a href="#" className="text-sm font-bold text-blue-600 hover:underline">@BanhchiDev</a>
                    </div>
                    <div className="flex items-center gap-3">
                        <Clock className="h-4 w-4 text-zinc-400" />
                        <span className="text-sm font-medium text-zinc-600">{t('working_hours')}: Mon-Sun, 8:00 AM - 8:00 PM</span>
                    </div>
                </div>
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
