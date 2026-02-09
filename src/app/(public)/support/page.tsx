"use client";

import { useLanguage } from "@/providers/language-provider";
import { Phone, MessageSquare, Clock, ArrowLeft, ShieldCheck, Zap } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function SupportPage() {
  const { t, language } = useLanguage();

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Abstract Background Decoration */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full -z-10 opacity-30">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto max-w-4xl px-6 text-center">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors mb-12 group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            {t('back_to_home')}
          </Link>
          
          <h1 className={cn(
            "text-3xl md:text-7xl font-black tracking-tighter mb-6",
            language === 'kh' ? 'font-moul leading-[1.6]! py-2 text-3xl md:text-6xl' : ''
          )}>
            {t('tech_support')}
          </h1>
          <p className="text-lg text-muted-foreground font-medium max-w-2xl mx-auto leading-relaxed">
            {t('support_desc')}
          </p>
        </div>
      </section>

      {/* Main Support Options */}
      <section className="pb-32">
        <div className="container mx-auto max-w-5xl px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {/* Primary Contact Cards */}
            <div className="space-y-6">
              <Card className="p-8 rounded-[2rem] border-border bg-white shadow-sm hover:shadow-xl transition-all group">
                <div className="flex items-start gap-6">
                  <div className="h-14 w-14 rounded-2xl bg-secondary flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                    <Phone className="h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{t('call_directly')}</p>
                    <h3 className="text-2xl font-black tracking-tight">098 943 324</h3>
                    <p className="text-sm text-muted-foreground font-medium">{t('urgent_issues_desc')}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-8 rounded-[2rem] border-border bg-white shadow-sm hover:shadow-xl transition-all group">
                <div className="flex items-start gap-6">
                  <div className="h-14 w-14 rounded-2xl bg-[#0088cc]/10 flex items-center justify-center text-[#0088cc] group-hover:bg-[#0088cc] group-hover:text-white transition-colors">
                    <MessageSquare className="h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{t('telegram_support')}</p>
                    <h3 className="text-2xl font-black tracking-tight">@mengley_support</h3>
                    <p className="text-sm text-muted-foreground font-medium">{t('message_anytime')}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-8 rounded-[2rem] border-border bg-white shadow-sm ">
                <div className="flex items-start gap-6">
                  <div className="h-14 w-14 rounded-2xl bg-zinc-50 flex items-center justify-center text-zinc-400">
                    <Clock className="h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{t('working_hours')}</p>
                    <h3 className="text-xl font-bold tracking-tight">{t('working_days')}</h3>
                    <p className="text-sm text-muted-foreground font-medium">{t('closed_days')}</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* QR Scan Section */}
            <Card className="p-8 rounded-[2.5rem] border-zinc-900 border-[3px] bg-zinc-900 text-white flex flex-col items-center justify-center text-center shadow-2xl overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-3xl rounded-full -mr-16 -mt-16" />
              
              <h3 className="text-xl font-black uppercase tracking-[0.2em] mb-8 relative z-10">{t('scan_for_support')}</h3>
              <div className="bg-white p-4 rounded-3xl shadow-inner mb-8 relative z-10">
                <Image 
                  src="/mengley.svg"
                  alt="Support QR"
                  width={250}
                  height={250}
                  className="rounded-lg"
                />
              </div>
              <p className="text-xs text-zinc-400 font-bold max-w-xs uppercase tracking-widest leading-relaxed relative z-10 px-4">
                {t('scan_desc')}
              </p>
            </Card>
          </div>

          {/* Trust Indicators */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center pt-12 border-t border-border">
            <div className="space-y-3 flex flex-col items-center">
              <ShieldCheck className="h-8 w-8 text-green-500" />
              <h4 className="text-xs font-black uppercase tracking-widest">{t('safe_secure')}</h4>
              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{t('data_protected_desc')}</p>
            </div>
            <div className="space-y-3 flex flex-col items-center">
              <Zap className="h-8 w-8 text-amber-500" />
              <h4 className="text-xs font-black uppercase tracking-widest">{t('fast_response')}</h4>
              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{t('available_peak_hours')}</p>
            </div>
            <div className="space-y-3 flex flex-col items-center">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center font-black text-primary text-sm">B</div>
              <h4 className="text-xs font-black uppercase tracking-widest">{t('expert_help')}</h4>
              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{t('dev_team_name')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section Concept */}
      <section className="py-24 bg-secondary/10">
        <div className="container mx-auto max-w-4xl px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black tracking-tight mb-4 uppercase">{t('faqs')}</h2>
            <div className="h-1 w-12 bg-primary mx-auto rounded-full" />
          </div>
          
          <div className="space-y-8">
            <div className="space-y-3">
              <h4 className="text-lg font-black tracking-tight">{t('faq_q1')}</h4>
              <p className="text-muted-foreground font-medium leading-relaxed">
                {t('faq_a1')}
              </p>
            </div>
            <div className="space-y-3">
              <h4 className="text-lg font-black tracking-tight">{t('faq_q2')}</h4>
              <p className="text-muted-foreground font-medium leading-relaxed">
                {t('faq_a2')}
              </p>
            </div>
            <div className="space-y-3">
              <h4 className="text-lg font-black tracking-tight">{t('faq_q3')}</h4>
              <p className="text-muted-foreground font-medium leading-relaxed">
                {t('faq_a3')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer minimal */}
      <footer className="py-12 text-center border-t border-border">
        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
          © {new Date().getFullYear()} — Banhchi Digital Event Companion
        </p>
      </footer>
    </div>
  );
}
