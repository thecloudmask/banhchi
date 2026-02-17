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
      <DialogContent className="sm:max-w-[420px] p-0 overflow-hidden border-0 shadow-2xl rounded-3xl">
        {/* Header Section */}
        <div className="bg-zinc-900 text-white pt-6 pb-4 px-6 flex flex-col items-center justify-center text-center relative border-b border-white/10">
             <div className="flex items-center gap-3 mb-2">
                <div className="h-8 w-8 bg-white rounded-lg flex items-center justify-center text-zinc-900 shadow-md shadow-white/10">
                    <span className="text-lg font-black">B</span>
                </div>
                <DialogTitle className="text-lg font-black tracking-tight">{t('banhchi_system')}</DialogTitle>
                <div className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-zinc-800 text-zinc-400 border border-zinc-700 ml-1">
                    v1.0.0
                </div>
            </div>
            <DialogDescription className="text-zinc-400 text-[10px] uppercase tracking-widest font-medium">Digital Event Companion</DialogDescription>
        </div>

        <div className="p-5 bg-white space-y-5">
            {/* Ownership Section */}
            <div className="text-center">
                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mb-1">
                    {t('developed_for')}
                </p>
                <h3 className="font-black text-base text-primary">
                    {t('client_name_placeholder')}
                </h3>
            </div>

            <Separator className="bg-zinc-100" />

            {/* Support Section - Side by Side */}
            <div className="space-y-3">
                <div className="flex items-center gap-2 text-zinc-900 justify-center">
                    <Smartphone className="h-4 w-4 text-blue-600" />
                    <h4 className="font-black text-xs uppercase tracking-wide">{t('tech_support')}</h4>
                </div>

                <div className="flex flex-row items-center gap-4 bg-zinc-50 rounded-2xl p-4 border border-zinc-100">
                    {/* QR Code Column */}
                    <div className="flex flex-col items-center gap-2 shrink-0">
                        <div className="bg-white p-1.5 rounded-xl border border-zinc-100 shadow-sm">
                            <img 
                                src="/mengley.svg" 
                                alt="Support" 
                                className="w-20 h-20"
                            />
                        </div>
                        <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 text-center leading-tight w-20">{t('scan')}</span>
                    </div>

                    {/* Contact Info Column */}
                    <div className="flex-1 space-y-3 min-w-0">
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                                <Phone className="h-4 w-4 text-blue-600" />
                            </div>
                            <div className="overflow-hidden">
                                <div className="text-[10px] text-zinc-400 font-bold uppercase">{t('phone') || "Phone"}</div>
                                <div className="text-sm font-black text-zinc-800 font-mono truncate">098 943 324</div>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                                <MessageCircle className="h-4 w-4 text-blue-600" />
                            </div>
                            <div className="overflow-hidden">
                                <div className="text-[10px] text-zinc-400 font-bold uppercase">Telegram</div>
                                <a href="https://t.me/mengley_support" target="_blank" rel="noopener noreferrer" className="text-sm font-black text-blue-600 hover:underline truncate block">@mengley_support</a>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="text-center">
                    <p className="text-[10px] text-zinc-300 uppercase tracking-widest font-bold">
                        {t('working_hours')}: 8AM - 8PM
                    </p>
                </div>
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
