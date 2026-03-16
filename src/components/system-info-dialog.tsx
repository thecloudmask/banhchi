"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Info, Phone, MessageCircle, Clock, Smartphone } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export function SystemInfoDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full text-muted-foreground hover:text-primary"
        >
          <Info className="h-5 w-5" />
          <span className="sr-only">{"ព័ត៌មានប្រព័ន្ធ"}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-105 p-0 overflow-hidden border border-border shadow-2xl rounded-3xl bg-background">
        {/* Header Section */}
        <div className="bg-card text-foreground pt-6 pb-4 px-6 flex flex-col items-center justify-center text-center relative border-b border-border">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-8 w-8 bg-foreground rounded-lg flex items-center justify-center text-background shadow-md shadow-foreground/10">
              <span className="text-lg font-black">S</span>
            </div>
            <DialogTitle className="text-lg font-black italic uppercase">
              {"Sideth-Theapka"}
            </DialogTitle>
            <div className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-muted text-muted-foreground border border-border ml-1">
              v1.0.0
            </div>
          </div>
          <DialogDescription className="text-muted-foreground/60 text-[10px] uppercase font-medium">
            Digital Event Companion
          </DialogDescription>
        </div>

        <div className="p-5 bg-background space-y-5">
          {/* Ownership Section */}
          <div className="text-center">
            <p className="text-[10px] text-muted-foreground font-bold uppercase mb-1">
              {"ត្រូវបានអភិវឌ្ឍជូន"}
            </p>
            <h3 className="font-black text-base text-foreground italic underline decoration-rose-500 underline-offset-4">
              {"ម្ចាស់កម្មវិធី"}
            </h3>
          </div>

          <Separator className="bg-border" />

          {/* Support Section - Side by Side */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-foreground justify-center">
              <Smartphone className="h-4 w-4 text-rose-500" />
              <h4 className="font-black text-xs uppercase">
                {"ជំនួយបច្ចេកទេស"}
              </h4>
            </div>

            <div className="flex flex-row items-center gap-4 bg-muted/30 rounded-2xl p-4 border border-border">
              {/* QR Code Column */}
              <div className="flex flex-col items-center gap-2 shrink-0">
                <div className="bg-white p-1.5 rounded-xl border border-border shadow-sm">
                  <img src="/mengley.svg" alt="Support" className="w-20 h-20" />
                </div>
                <span className="text-[9px] font-bold uppercase text-muted-foreground text-center leading-tight w-20">
                  {"ស្កេន"}
                </span>
              </div>

              {/* Contact Info Column */}
              <div className="flex-1 space-y-3 min-w-0">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center shrink-0">
                    <Phone className="h-4 w-4 text-rose-500" />
                  </div>
                  <div className="overflow-hidden">
                    <div className="text-[10px] text-muted-foreground font-bold uppercase">
                      {"លេខទូរស័ព្ទ"}
                    </div>
                    <div className="text-sm font-black text-foreground font-mono truncate">
                      098 943 324
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center shrink-0">
                    <MessageCircle className="h-4 w-4 text-rose-500" />
                  </div>
                  <div className="overflow-hidden">
                    <div className="text-[10px] text-muted-foreground font-bold uppercase">
                      Telegram
                    </div>
                    <a
                      href="https://t.me/mengley_support"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-black text-rose-500 hover:underline truncate block"
                    >
                      @mengley_support
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center">
              <p className="text-[10px] text-muted-foreground/40 uppercase font-bold">
                {"ម៉ោងធ្វើការ"}: 8AM - 8PM
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
