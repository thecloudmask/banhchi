"use client";

import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { addGuest, updateGuest } from "@/services/event.service";
import { Loader2, Plus, Wallet, Smartphone, User, Wallet2, Smartphone as PhoneIcon } from "lucide-react";
import { toast } from "sonner";
import { Guest, PaymentMethod, Event } from "@/types";
import { useLanguage } from "@/providers/language-provider";
import { cn } from "@/lib/utils";

interface AddGuestDialogProps {
  event: Event;
  guestToEdit?: Guest | null;
  onClose?: () => void;
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export function AddGuestDialog({ event, guestToEdit, onClose, trigger, onSuccess }: AddGuestDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { t, language } = useLanguage();
  
  // Form State
  const [name, setName] = useState("");
  const [amountUsd, setAmountUsd] = useState("");
  const [amountKhr, setAmountKhr] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [note, setNote] = useState("");
  
  // Display versions for Elders
  const [displayUsd, setDisplayUsd] = useState("");
  const [displayKhr, setDisplayKhr] = useState("");

  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (guestToEdit) {
      setOpen(true);
      setName(guestToEdit.name);
      setAmountUsd(guestToEdit.amountUsd > 0 ? guestToEdit.amountUsd.toString() : "");
      setAmountKhr(guestToEdit.amountKhr > 0 ? guestToEdit.amountKhr.toString() : "");
      setDisplayUsd(guestToEdit.amountUsd > 0 ? formatWithCommas(guestToEdit.amountUsd.toString()) : "");
      setDisplayKhr(guestToEdit.amountKhr > 0 ? formatWithCommas(guestToEdit.amountKhr.toString()) : "");
      setPaymentMethod(guestToEdit.paymentMethod || "cash");
      setNote(guestToEdit.note || "");
    } else if (!open) {
      resetForm();
    }
  }, [guestToEdit, open]);

  useEffect(() => {
    if (open) {
      setTimeout(() => nameInputRef.current?.focus(), 150);
    }
  }, [open]);

  const formatWithCommas = (val: string) => {
    if (!val) return "";
    const clean = val.replace(/[^\d.]/g, "");
    if (!clean) return "";
    const parts = clean.split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
  };

  const handleUsdChange = (value: string) => {
    const rawValue = value.replace(/[^\d.]/g, "");
    setAmountUsd(rawValue);
    setDisplayUsd(formatWithCommas(rawValue));
  };

  const handleKhrChange = (value: string) => {
    const rawValue = value.replace(/[^\d]/g, "");
    setAmountKhr(rawValue);
    setDisplayKhr(formatWithCommas(rawValue));
  };

  const resetForm = () => {
    setName("");
    setAmountUsd("");
    setAmountKhr("");
    setDisplayUsd("");
    setDisplayKhr("");
    setPaymentMethod("cash");
    setNote("");
  };

  const handleOpenChange = (val: boolean) => {
    setOpen(val);
    if (!val) {
      resetForm();
      if (onClose) onClose();
    }
  };

  const saveData = async () => {
    if (!name.trim()) {
      toast.error(t('validation_enter_name'));
      nameInputRef.current?.focus();
      return false;
    }

    try {
      setLoading(true);
      
      const data = {
        name: name.trim(),
        amountUsd: parseFloat(amountUsd) || 0,
        amountKhr: parseInt(amountKhr.replace(/\D/g, "")) || 0,
        paymentMethod,
        note: note.trim()
      };

      if (guestToEdit) {
        await updateGuest(event.id, guestToEdit.id, data);
        toast.success(`${t('toast_updated')}: ${name}`);
      } else {
        await addGuest(event.id, data);
        toast.success(`${t('toast_recorded')}: ${name}`);
      }

      if (onSuccess) onSuccess();
      return true;
    } catch (error) {
      console.error(error);
      toast.error(t('toast_failed_save'));
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleManualSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await saveData();
    if (success) handleOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="lg" className="rounded-xl h-12 px-6 font-bold bg-primary">
            <Plus className="h-5 w-5 mr-2" />
            {t('add_guest')}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl rounded-3xl p-0 border border-border shadow-sm overflow-hidden max-h-[96vh] flex flex-col">
        <div className="p-8 pb-4 shrink-0 border-b border-border">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black">
              {guestToEdit ? t('edit_data') : t('record_new_gift')}
            </DialogTitle>
            <p className="text-muted-foreground font-medium mt-1 text-xs uppercase tracking-widest">{t('elder_interface_tagline')}</p>
          </DialogHeader>
        </div>

        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleManualSave} className="p-8 sm:p-10 space-y-12">
            <div className="space-y-10">
              
              {/* 1. Payment Method Toggle */}
              <div className="grid grid-cols-2 gap-3">
                 <button
                   type="button"
                   onClick={() => setPaymentMethod('cash')}
                   className={cn(
                     "h-14 flex items-center justify-center gap-3 rounded-xl border font-bold",
                     paymentMethod === 'cash' ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground opacity-50"
                   )}
                 >
                   <Wallet2 className="h-5 w-5" />
                   <span className="text-sm">{language === 'kh' ? 'សាច់ប្រាក់' : 'Cash'}</span>
                 </button>
                 <button
                   type="button"
                   onClick={() => setPaymentMethod('qr')}
                   className={cn(
                     "h-14 flex items-center justify-center gap-3 rounded-xl border font-bold",
                     paymentMethod === 'qr' ? "border-blue-600 bg-blue-50 text-blue-600" : "border-border text-muted-foreground opacity-50"
                   )}
                 >
                   <PhoneIcon className="h-5 w-5" />
                   <span className="text-sm">{language === 'kh' ? 'ធនាគារ' : 'Bank'}</span>
                 </button>
              </div>

              {/* 2. Name Input */}
              <div className="space-y-4">
                <Label className="text-sm font-black uppercase tracking-widest opacity-40 ml-2">{t('guest_name')}</Label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/40 group-focus-within:text-primary" />
                   <Input 
                    ref={nameInputRef}
                    placeholder={t('enter_name_placeholder')} 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-14 text-lg font-bold rounded-xl border-slate-200 bg-white pl-12 focus:border-primary shadow-sm"
                    autoComplete="off"
                  />
                </div>
              </div>

              {/* 3. Amounts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                     <Label className="text-sm font-black uppercase tracking-widest ml-2 text-slate-400">Amount ($ USD)</Label>
                     <div className="relative">
                        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-black text-slate-300">$</div>
                         <Input 
                           type="text"
                           inputMode="decimal"
                           placeholder="0"
                           value={displayUsd}
                           onChange={(e) => handleUsdChange(e.target.value)}
                           className="h-16 text-2xl font-bold rounded-xl border-slate-200 bg-white text-slate-900 focus:border-primary transition-colors pl-14"
                           onFocus={(e) => e.target.select()}
                         />
                      </div>
                   </div>
 
                   <div className="space-y-4">
                      <Label className="text-sm font-black uppercase tracking-widest ml-2 text-slate-400">Amount (៛ KHR)</Label>
                      <div className="relative">
                         <div className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-black text-slate-300">៛</div>
                         <Input 
                           type="text"
                           inputMode="numeric"
                           placeholder="0"
                           value={displayKhr}
                           onChange={(e) => handleKhrChange(e.target.value)}
                           className="h-16 text-2xl font-bold rounded-xl border-slate-200 bg-white text-slate-900 focus:border-primary transition-colors pl-14"
                           onFocus={(e) => e.target.select()}
                         />
                      </div>
                   </div>
              </div>

              {/* 4. Note */}
              <div className="space-y-4">
                 <Label className="text-sm font-black uppercase tracking-widest opacity-40 ml-2">{t('note')}</Label>
                 <Textarea 
                   placeholder="..."
                   value={note}
                   onChange={(e) => setNote(e.target.value)}
                   className="min-h-28 rounded-xl border-slate-200 bg-white font-medium shadow-sm resize-none focus:border-primary p-4"
                 />
              </div>
            </div>

            <DialogFooter className="gap-3 pt-6 border-t border-border mt-2">
                <Button type="button" variant="ghost" onClick={() => handleOpenChange(false)} className="h-12 rounded-xl font-bold flex-1">
                  {t('cancel')}
                </Button>
                <Button type="submit" disabled={loading} className="h-12 rounded-xl font-black text-sm flex-2 shadow-sm">
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Save Entry"}
                </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
