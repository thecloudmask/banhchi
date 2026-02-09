"use client";

import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Wallet, Building2, TrendingUp, PieChart as PieChartIcon } from "lucide-react";
import { useLanguage } from "@/providers/language-provider";
import { Guest } from "@/types";
import { cn } from "@/lib/utils";

interface AdminEventStatsProps {
  guests: Guest[];
}

export function AdminEventStats({ guests }: AdminEventStatsProps) {
  const { t } = useLanguage();

  const stats = useMemo(() => {
    const res = {
      usd: { total: 0, cash: 0, bank: 0 },
      khr: { total: 0, cash: 0, bank: 0 },
      counts: { cash: 0, bank: 0, total: guests.length }
    };

    guests.forEach(g => {
      const isCash = g.paymentMethod === 'cash';
      
      res.usd.total += g.amountUsd || 0;
      res.khr.total += g.amountKhr || 0;
      
      if (isCash) {
        res.usd.cash += g.amountUsd || 0;
        res.khr.cash += g.amountKhr || 0;
        res.counts.cash++;
      } else {
        res.usd.bank += g.amountUsd || 0;
        res.khr.bank += g.amountKhr || 0;
        res.counts.bank++;
      }
    });

    return res;
  }, [guests]);

  const formatUsd = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
  const formatKhr = (val: number) => new Intl.NumberFormat('km-KH').format(val);

  const bankPercentage = stats.counts.total > 0 ? (stats.counts.bank / stats.counts.total) * 100 : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Overall Total Card */}
      <Card className="p-8 rounded-[2rem] border-none bg-zinc-900 text-white shadow-2xl overflow-hidden relative group">
        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
          <TrendingUp size={80} />
        </div>
        <div className="relative z-10 space-y-6">
          <div className="flex items-center gap-3">
             <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center">
                <PieChartIcon className="h-5 w-5 text-primary" />
             </div>
             <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50">{t('total_contributions')}</span>
          </div>
          
          <div className="space-y-1">
             <h3 className="text-4xl font-black tracking-tighter">{formatUsd(stats.usd.total)}</h3>
             <p className="text-xl font-bold opacity-60 font-mono">{formatKhr(stats.khr.total)} ៛</p>
          </div>

          <div className="pt-4 border-t border-white/10 flex items-center justify-between">
            <div className="text-[10px] font-black uppercase tracking-widest opacity-40">
              {stats.counts.total} {t('guests')}
            </div>
            <div className="flex -space-x-2">
               {[1,2,3].map(i => (
                 <div key={i} className="h-6 w-6 rounded-full border-2 border-zinc-900 bg-zinc-800 flex items-center justify-center">
                   <div className="h-1 w-1 rounded-full bg-primary/40" />
                 </div>
               ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Cash vs Bank Comparison */}
      <Card className="md:col-span-2 p-8 rounded-[2rem] border border-gray-100 bg-white shadow-xl flex flex-col justify-between">
        <div className="flex flex-col sm:flex-row justify-between gap-8">
           {/* Cash Breakdown */}
           <div className="flex-1 space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-orange-50 flex items-center justify-center">
                  <Wallet className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                   <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{t('cash_in_hand')}</span>
                   <h4 className="text-lg font-black text-gray-900">{stats.counts.cash} {t('guests')}</h4>
                </div>
              </div>
              <div className="space-y-1 pl-13">
                 <p className="text-2xl font-black text-gray-900">{formatUsd(stats.usd.cash)}</p>
                 <p className="text-sm font-bold text-gray-400 font-mono">{formatKhr(stats.khr.cash)} ៛</p>
              </div>
           </div>

           {/* Bank Breakdown */}
           <div className="flex-1 space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                   <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{t('digital_transfers')}</span>
                   <h4 className="text-lg font-black text-gray-900">{stats.counts.bank} {t('guests')}</h4>
                </div>
              </div>
              <div className="space-y-1 pl-13">
                 <p className="text-2xl font-black text-gray-900">{formatUsd(stats.usd.bank)}</p>
                 <p className="text-sm font-bold text-gray-400 font-mono">{formatKhr(stats.khr.bank)} ៛</p>
              </div>
           </div>
        </div>

        {/* Visual Ratio Bar */}
        <div className="mt-8 space-y-3">
           <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
              <span className="text-orange-500">{t('cash')} {Math.round(100 - bankPercentage)}%</span>
              <span className="text-blue-500">{t('bank')} {Math.round(bankPercentage)}%</span>
           </div>
           <div className="h-3 w-full bg-gray-50 rounded-full overflow-hidden flex">
              <div 
                className="h-full bg-orange-400 transition-all duration-1000 ease-out" 
                style={{ width: `${100 - bankPercentage}%` }} 
              />
              <div 
                className="h-full bg-blue-500 transition-all duration-1000 ease-out" 
                style={{ width: `${bankPercentage}%` }} 
              />
           </div>
        </div>
      </Card>
    </div>
  );
}
