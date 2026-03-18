"use client";

import Link from "next/link";
import { ArrowLeft, ShieldCheck, Zap } from "lucide-react";
import { useLanguage } from "@/providers/language-provider";
import { PublicHeader } from "@/components/layout/public-header";
import Image from "next/image";
import { PublicFooter } from "@/components/layout/public-footer";

export default function AboutBrandPage() {
  const { t } = useLanguage();

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground selection:bg-primary/20 font-kantumruy overflow-x-hidden">
      <PublicHeader />

      <main className="flex-1 pt-32 pb-40 relative">
         {/* Background Decorations */}
        <div className="absolute top-1/4 -right-20 w-96 h-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 -left-20 w-96 h-96 bg-rose-500/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="container mx-auto px-6 lg:px-12 relative z-10">
          <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-16 group">
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-xs font-black uppercase tracking-widest">ត្រឡប់ទៅទំព័រដើម</span>
          </Link>

          <div className="max-w-5xl mx-auto space-y-32">
            {/* Mission Hero */}
            <div className="space-y-10 text-center lg:text-left">
              <div className="inline-flex items-center gap-3 bg-primary/10 border border-primary/20 px-6 py-2.5 rounded-md text-primary font-black text-[10px] uppercase animate-in fade-in slide-in-from-left-4 duration-700">
                <Zap className="h-4 w-4 fill-current" />
                <span>The Story Behind Our Name</span>
              </div>
              <h1 className="text-4xl md:text-6xl lg:text-8xl font-black text-foreground leading-[1.2] font-kantumruy uppercase">
                រឿងរ៉ាវនៃឈ្មោះ <br className="hidden md:block" /> <span className="text-primary italic">មត៌ក ធៀបការ</span>
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed font-medium max-w-3xl">
                ការបញ្ចូលគ្នានៃបច្ចេកវិទ្យា និងការថេរបណ្តាំវប្បធម៌ខ្មែរ ដើម្បីកត់ត្រារាល់ការចងចាំដ៏មានតម្លៃបំផុតសម្រាប់គ្រួសារ និងសង្គមជាតិ។
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
              <div className="space-y-12 animate-in fade-in slide-in-from-left-8 duration-1000">
                <div className="space-y-6">
                   <div className="h-1.5 w-16 bg-primary rounded-full" />
                   <h2 className="text-3xl md:text-4xl font-black text-foreground font-kantumruy leading-relaxed">
                     {t("mordok_meaning_title")}
                   </h2>
                </div>
                <div className="p-10 rounded-md bg-card border border-border/50 relative overflow-hidden shadow-2xl">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-primary" />
                  <p className="text-xl text-muted-foreground leading-relaxed font-medium italic">
                    {t("mordok_meaning_desc")}
                  </p>
                </div>
              </div>

              <div className="space-y-16 animate-in fade-in slide-in-from-right-8 duration-1000">
                <div className="space-y-8">
                  <h3 className="text-2xl md:text-3xl font-black text-primary font-kantumruy leading-relaxed uppercase tracking-wide">
                    {t("why_name_mordok_theapka_title")}
                  </h3>
                  <p className="text-lg text-muted-foreground leading-relaxed font-medium">
                    {t("why_name_mordok_theapka_desc")}
                  </p>
                </div>

                <div className="flex items-start gap-8 p-10 rounded-md bg-primary/5 border border-primary/20 shadow-sm transition-all hover:bg-primary/8 duration-300">
                  <div className="h-20 w-20 shrink-0 rounded-md bg-primary/10 flex items-center justify-center text-primary shadow-lg shadow-primary/10">
                    <ShieldCheck className="h-10 w-10" />
                  </div>
                  <div className="space-y-3">
                    <p className="text-xs font-black text-foreground leading-relaxed font-kantumruy uppercase tracking-widest opacity-40">
                      ការប្តេជ្ញាចិត្តរបស់យើង
                    </p>
                    <p className="text-xl font-bold text-foreground/90 leading-relaxed font-kantumruy">
                      យើងមានមោទនភាពដែលបានក្លាយជាផ្នែកមួយនៃការថែរក្សា និងលើកកម្ពស់វប្បធម៌ខ្មែរតាមរយៈបច្ចេកវិទ្យាដ៏ទំនើប។
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Visual Callout */}
            <div className="relative aspect-video md:aspect-21/9 w-full rounded-md overflow-hidden shadow-2xl group border border-border/50 bg-card">
               <Image 
                  src="/MORDOK-THEAPKA.png" 
                  alt="Brand Concept" 
                  fill
                  className="object-contain p-12 md:p-32 opacity-80 group-hover:scale-105 group-hover:opacity-100 transition-all duration-1000"
               />
               <div className="absolute inset-0 bg-linear-to-t from-background/90 via-background/20 to-transparent" />
               <div className="absolute bottom-12 left-12 md:bottom-20 md:left-20">
                  <h4 className="text-3xl md:text-5xl font-black text-foreground uppercase tracking-widest font-kantumruy mb-1.5 md:mb-4">
                    មត៌ក ធៀបការ
                  </h4>
                  <p className="text-base md:text-xl text-primary font-black uppercase tracking-[0.2em]">
                    Digital Heritage for Every Ceremony
                  </p>
               </div>
            </div>

            {/* Quote Section */}
            <div className="py-20 text-center max-w-3xl mx-auto">
               <div className="text-6xl text-primary font-serif mb-8 opacity-20 italic">“</div>
               <blockquote className="text-2xl md:text-3xl font-bold text-foreground font-kantumruy italic leading-relaxed mb-8">
                  យើងជឿជាក់ថា រាល់ការកត់ត្រានៃការជួយគ្នា គឺជាមត៌កដ៏ថ្លៃថ្លាបំផុតដែលប្រជាជនខ្មែរគ្រប់រូបគួរតែថែរក្សា។
               </blockquote>
               <div className="h-1 w-20 bg-primary/20 mx-auto rounded-full" />
            </div>
          </div>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
