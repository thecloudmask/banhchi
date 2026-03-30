"use client";

import React, { useState, useEffect } from "react";
import {
  getEventByTrackingToken,
  subscribeToGuests,
} from "@/services/event.service";
import { subscribeToExpenses } from "@/services/expense.service";
import { useLanguage } from "@/providers/language-provider";
import { Event, Guest, Expense } from "@/types";
import {
  Loader2,
  Lock,
  FileText,
  X,
  ChevronDown,
  ChevronUp,
  Search,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";

interface Props {
  token: string;
}

export default function TrackingClient({ token }: Props) {
  const { t } = useLanguage();
  const [event, setEvent] = useState<Event | null>(null);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Security
  const [pin, setPin] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinError, setPinError] = useState("");

  const [expandedSection, setExpandedSection] = useState<
    "income" | "expenses" | "balance" | null
  >("balance");
  const [searchQuery, setSearchQuery] = useState("");
  const [displayLimit, setDisplayLimit] = useState(30);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const ev = await getEventByTrackingToken(token);
        if (!ev) {
          setError(t("event_not_found"));
          setLoading(false);
          return;
        }
        setEvent(ev);

        // If no PIN required, auto-authenticate
        if (!ev.trackingPin) {
          setIsAuthenticated(true);
        }
      } catch (err) {
        console.error(err);
        setError("Error loading event");
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [token, t]);

  useEffect(() => {
    if (isAuthenticated && event) {
      const unsubGuests = subscribeToGuests(event.id, (fetchedGuests) => {
        setGuests(fetchedGuests);
      });
      const unsubExpenses = subscribeToExpenses(event.id, (fetchedExpenses) => {
        setExpenses(fetchedExpenses);
      });

      return () => {
        unsubGuests();
        unsubExpenses();
      };
    }
  }, [isAuthenticated, event, event?.id]);

  const handleVerifyPin = () => {
    if (event?.trackingPin && pin !== event.trackingPin) {
      setPinError(t("incorrect_pin"));
      return;
    }
    setPinError("");
    setIsAuthenticated(true);
  };

  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4">
        <Card className="max-w-md w-full p-8 text-center bg-white shadow-xl rounded-3xl">
          <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <X className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold mb-2">
            {error || t("event_not_found")}
          </h2>
          <p className="text-zinc-500">{t("event_not_found_desc")}</p>
        </Card>
      </div>
    );
  }

  // --- Calculations ---
  // Income
  const totalUsdIncome = guests.reduce(
    (sum, g) => sum + (Number(g.amountUsd) || 0),
    0,
  );
  const totalKhrIncome = guests.reduce(
    (sum, g) => sum + (Number(g.amountKhr) || 0),
    0,
  );

  // Expenses
  const totalUsdExpenses = expenses
    .filter((e) => e.currency === "USD")
    .reduce((sum, e) => sum + (Number(e.actualAmount) || 0), 0);
  const totalKhrExpenses = expenses
    .filter((e) => e.currency === "KHR")
    .reduce((sum, e) => sum + (Number(e.actualAmount) || 0), 0);

  // Balance
  const balanceUsd = totalUsdIncome - totalUsdExpenses;
  const balanceKhr = totalKhrIncome - totalKhrExpenses;

  // Combined Totals (1 USD = 4000 KHR)
  const EXCHANGE_RATE = 4000;
  const combinedBalanceUsd = balanceUsd + balanceKhr / EXCHANGE_RATE;
  const combinedIncomeUsd = totalUsdIncome + totalKhrIncome / EXCHANGE_RATE;
  const combinedExpensesUsd =
    totalUsdExpenses + totalKhrExpenses / EXCHANGE_RATE;

  // Filtered lists
  const filteredGuests = guests.filter((g) =>
    g.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );
  const filteredExpenses = expenses.filter((e) =>
    e.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // --- PIN Entry View ---
  if (!isAuthenticated) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4 relative overflow-hidden">
        {/* Abstract Background Elements */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl"></div>

        <Card className="max-w-md w-full p-8 text-center bg-card/80 backdrop-blur-xl shadow-2xl shadow-primary/10 rounded-[2.5rem] relative z-10 border border-border">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
            <Lock className="w-10 h-10 text-primary" />
          </div>

          <h2 className="text-2xl font-black mb-2 tracking-tight text-zinc-900 dark:text-zinc-100">
            {t("content_protected")}
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400 mb-8 text-sm max-w-xs mx-auto">
            {event.title}
            <br />
            {t("enter_tracking_pin_desc")}
          </p>

          <div className="space-y-4">
            <div>
              <Input
                type="password"
                placeholder="****"
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value);
                  setPinError("");
                }}
                maxLength={4}
                className="text-center text-3xl tracking-[0.5em] font-black h-16 rounded-2xl bg-accent/50 border-none focus-visible:ring-2 focus-visible:ring-primary/50 placeholder:text-muted-foreground/30 transition-all font-sans text-foreground"
                onKeyDown={(e) => e.key === "Enter" && handleVerifyPin()}
              />
              {pinError && (
                <p className="text-red-500 text-sm mt-3 font-semibold animate-in slide-in-from-top-1 opacity-100">
                  {pinError}
                </p>
              )}
            </div>

            <Button
              onClick={handleVerifyPin}
              className="w-full h-14 rounded-2xl font-black text-base shadow-lg hover:shadow-xl transition-all active:scale-[0.98]"
            >
              ផ្ទៀងផ្ទាត់
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // --- Report View ---
  return (
    <div className="min-h-screen bg-background text-foreground pb-20 font-sans tracking-tight">
      {/* Header Banner */}
      <div className="bg-card/40 border-b border-border backdrop-blur-xl pt-8 pb-10 px-4 mb-8 shadow-sm">
        <div className="max-w-3xl mx-auto text-center">
          {event.bannerUrl && (
            <div className="w-24 h-24 mx-auto mb-6 rounded-full overflow-hidden border-4 border-white shadow-lg relative">
              <Image
                src={event.bannerUrl}
                alt="Banner"
                fill
                className="object-cover"
              />
            </div>
          )}
          <h1 className="text-2xl sm:text-3xl font-black mb-2 text-foreground">
            {event.title}
          </h1>
          <p className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-semibold tracking-wide">
            <FileText className="w-4 h-4" />
            {t("tracking_report")}
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 space-y-6">
        {/* Main Income Card (Matches Admin Dashboard) */}
        <Card className="overflow-hidden bg-card/60 backdrop-blur-xl border border-border shadow-xl shadow-primary/5 hover:shadow-2xl hover:shadow-primary/10 rounded-[2rem] relative group hover:border-primary/30 transition-all duration-500 text-foreground">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[80px] rounded-full pointer-events-none group-hover:bg-primary/10 transition-all duration-700" />

          <div
            className="p-6 cursor-pointer flex items-center justify-between relative z-10"
            onClick={() =>
              setExpandedSection(
                expandedSection === "balance" ? null : "balance",
              )
            }
          >
            <h2 className="text-lg font-black flex items-center gap-2">
              ចំណូលសរុបពីចំណងដៃ (Total Income)
            </h2>
            {expandedSection === "balance" ? (
              <ChevronUp className="w-5 h-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-5 h-5 text-muted-foreground" />
            )}
          </div>

          {expandedSection === "balance" && (
            <div className="px-6 pb-6 pt-2 animate-in slide-in-from-top-2 fade-in duration-300 relative z-10">
              <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 mb-4 flex flex-col items-center justify-center text-center shadow-inner">
                <div className="text-primary text-xs font-bold mb-1 uppercase tracking-wider">
                  Total Combined Income (USD)
                </div>
                <div className="text-4xl sm:text-5xl font-black tracking-tight text-primary">
                  $
                  {combinedIncomeUsd.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </div>
                <div className="text-[10px] text-muted-foreground mt-2 uppercase tracking-wide font-semibold">
                  Exchange Rate: 1 USD = {EXCHANGE_RATE} ៛
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-accent/30 rounded-2xl p-4 border border-border">
                  <div className="text-muted-foreground text-[10px] font-bold mb-1 uppercase tracking-wider">
                    Total USD
                  </div>
                  <div className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
                    $
                    {totalUsdIncome.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}
                  </div>
                </div>
                <div className="bg-accent/30 rounded-2xl p-4 border border-border">
                  <div className="text-muted-foreground text-[10px] font-bold mb-1 uppercase tracking-wider">
                    Total KHR
                  </div>
                  <div className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
                    {totalKhrIncome.toLocaleString()} ៛
                  </div>
                </div>
              </div>

              {/* Show expenses and net balance summary horizontally */}
              {(totalUsdExpenses > 0 || totalKhrExpenses > 0) && (
                <div className="mt-4 flex flex-col sm:flex-row gap-4 border-t border-border/50 pt-4">
                  <div className="flex-1 rounded-xl p-4 bg-muted/30 border border-border flex flex-col items-center justify-center">
                    <span className="text-[10px] font-bold uppercase text-muted-foreground">
                      Total Expenses
                    </span>
                    <span className="text-xl font-bold text-red-500">
                      -$
                      {combinedExpensesUsd.toLocaleString(undefined, {
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                  <div className="flex-1 rounded-xl p-4 bg-primary/5 border border-primary/20 flex flex-col items-center justify-center">
                    <span className="text-[10px] font-bold uppercase text-primary">
                      Net Balance
                    </span>
                    <span
                      className={`text-xl font-bold ${combinedBalanceUsd >= 0 ? "text-emerald-500" : "text-red-500"}`}
                    >
                      $
                      {combinedBalanceUsd.toLocaleString(undefined, {
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </Card>

        {/* Income Details */}
        <Card className="overflow-hidden bg-card/40 backdrop-blur-xl border border-border shadow-xl shadow-primary/5 hover:shadow-2xl hover:shadow-primary/10 rounded-[2rem] group hover:border-primary/30 transition-all duration-500">
          <div
            className="p-6 cursor-pointer flex items-center justify-between hover:bg-accent/40 transition-colors"
            onClick={() =>
              setExpandedSection(expandedSection === "income" ? null : "income")
            }
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center shadow-inner">
                <div className="text-lg font-black">+</div>
              </div>
              <div>
                <h2 className="text-base font-black text-foreground">
                  {t("total_contributions")}
                </h2>
                <div className="text-xs font-semibold text-muted-foreground">
                  {guests.length} {t("guests")}
                </div>
              </div>
            </div>
            {expandedSection === "income" ? (
              <ChevronUp className="w-5 h-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-5 h-5 text-muted-foreground" />
            )}
          </div>

          {expandedSection === "income" && (
            <div className="px-6 pb-6 pt-4 animate-in slide-in-from-top-2 fade-in duration-300 border-t border-border/50">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="text-zinc-500 text-xs font-semibold mb-1">
                    Total USD
                  </div>
                  <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                    ${totalUsdIncome.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-zinc-500 text-xs font-semibold mb-1">
                    Total KHR
                  </div>
                  <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                    {totalKhrIncome.toLocaleString()} ៛
                  </div>
                </div>
              </div>

              <div className="bg-accent/30 p-3 rounded-xl mb-6 flex justify-between items-center border border-emerald-500/20 shadow-inner">
                <span className="text-xs font-bold text-muted-foreground uppercase">
                  Combined in USD:
                </span>
                <span className="text-lg font-black text-emerald-500">
                  $
                  {combinedIncomeUsd.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>

              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-foreground">
                  {t("guest_contributions_list")}
                </h3>
                <div className="relative w-48 sm:w-80">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="ស្វែងរកភ្ញៀវ..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setDisplayLimit(30);
                    }}
                    className="h-10 pl-9 text-xs rounded-full bg-accent/40 border-border focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all text-foreground"
                  />
                </div>
              </div>

              <div className="space-y-3 max-h-none overflow-visible pr-2">
                {filteredGuests.slice(0, displayLimit).map((g, i) => (
                  <div
                    key={g.id}
                    className="flex justify-between items-center p-3 sm:p-4 rounded-2xl bg-card border border-border group-hover:border-primary/10 transition-colors"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-xs font-bold text-muted-foreground shrink-0">
                        {i + 1}
                      </div>
                      <div className="font-bold text-sm truncate text-foreground">
                        {g.name}
                      </div>
                    </div>
                    <div className="text-right font-black text-sm shrink-0 pl-4">
                      {g.amountUsd > 0 && (
                        <span className="text-emerald-500">${g.amountUsd}</span>
                      )}
                      {g.amountUsd > 0 && g.amountKhr > 0 && (
                        <span className="text-muted-foreground mx-1">/</span>
                      )}
                      {g.amountKhr > 0 && (
                        <span className="text-emerald-500">
                          {g.amountKhr.toLocaleString()}៛
                        </span>
                      )}
                    </div>
                  </div>
                ))}
                
                {filteredGuests.length > displayLimit && (
                  <div className="flex justify-center pt-4">
                    <Button 
                      variant="ghost"
                      size="sm"
                      className="text-primary font-bold text-[10px] uppercase tracking-wider hover:bg-primary/5 rounded-full px-6"
                      onClick={() => setDisplayLimit(prev => prev + 50)}
                    >
                      បង្ហាញបន្ថែម ({filteredGuests.length - displayLimit} នាក់ទៀត)
                    </Button>
                  </div>
                )}
                {filteredGuests.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground text-sm font-medium">
                    មិនទាន់មានទិន្នន័យ
                  </div>
                )}
              </div>
            </div>
          )}
        </Card>

        {/* Expenses Details */}
        <Card className="overflow-hidden bg-card/40 backdrop-blur-xl border border-border shadow-xl shadow-primary/5 hover:shadow-2xl hover:shadow-primary/10 rounded-[2rem] group hover:border-primary/30 transition-all duration-500">
          <div
            className="p-6 cursor-pointer flex items-center justify-between hover:bg-accent/40 transition-colors"
            onClick={() =>
              setExpandedSection(
                expandedSection === "expenses" ? null : "expenses",
              )
            }
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center shadow-inner">
                <div className="text-lg font-black">-</div>
              </div>
              <div>
                <h2 className="text-base font-black text-foreground">
                  {t("expenses")}
                </h2>
                <div className="text-xs font-semibold text-muted-foreground">
                  {expenses.length} {t("items")}
                </div>
              </div>
            </div>
            {expandedSection === "expenses" ? (
              <ChevronUp className="w-5 h-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-5 h-5 text-muted-foreground" />
            )}
          </div>

          {expandedSection === "expenses" && (
            <div className="px-6 pb-6 pt-4 animate-in slide-in-from-top-2 fade-in duration-300 border-t border-border/50">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="text-zinc-500 text-xs font-semibold mb-1">
                    Total USD
                  </div>
                  <div className="text-xl font-black text-red-500">
                    ${totalUsdExpenses.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-zinc-500 text-xs font-semibold mb-1">
                    Total KHR
                  </div>
                  <div className="text-xl font-black text-red-500">
                    {totalKhrExpenses.toLocaleString()} ៛
                  </div>
                </div>
              </div>

              <div className="bg-accent/30 p-3 rounded-xl mb-6 flex justify-between items-center border border-red-500/20 shadow-inner">
                <span className="text-xs font-bold text-muted-foreground uppercase">
                  Combined in USD:
                </span>
                <span className="text-lg font-black text-red-500">
                  $
                  {combinedExpensesUsd.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>

              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-foreground">
                  {t("expense_list")}
                </h3>
                <div className="relative w-32 sm:w-48">
                  <Search className="w-3 h-3 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="ស្វែងរកចំណាយ..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-8 pl-8 text-xs rounded-lg bg-accent/40 border-border text-foreground"
                  />
                </div>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                {filteredExpenses.map((e, i) => (
                  <div
                    key={e.id}
                    className="flex justify-between items-center p-3 sm:p-4 rounded-2xl bg-card border border-border group-hover:border-primary/10 transition-colors"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-xs font-bold text-muted-foreground shrink-0">
                        {i + 1}
                      </div>
                      <div className="font-bold text-sm truncate text-foreground">
                        {e.name}
                      </div>
                    </div>
                    <div className="text-right font-black text-sm shrink-0 pl-4 text-red-500">
                      {e.currency === "USD" ? "$" : ""}
                      {e.actualAmount.toLocaleString()}
                      {e.currency === "KHR" ? "៛" : ""}
                    </div>
                  </div>
                ))}
                {filteredExpenses.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground text-sm font-medium">
                    មិនទាន់មានទិន្នន័យ
                  </div>
                )}
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
