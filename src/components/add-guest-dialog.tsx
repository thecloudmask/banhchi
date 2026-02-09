import { useState, useRef, useEffect } from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger, DrawerFooter, DrawerClose } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { addGuest, updateGuest } from "@/services/event.service";
import { Loader2, Plus, User, Wallet, CreditCard, Building2, Smartphone } from "lucide-react";
import { toast } from "sonner";
import { Guest, PaymentMethod, Event } from "@/types";
import { useLanguage } from "@/providers/language-provider";

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
  const [location, setLocation] = useState("");
  const [amountUsd, setAmountUsd] = useState("");
  const [amountKhr, setAmountKhr] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [note, setNote] = useState("");
  
  // Display versions for Elders
  const [displayUsd, setDisplayUsd] = useState("");
  const [displayKhr, setDisplayKhr] = useState("");

  const nameInputRef = useRef<HTMLInputElement>(null);

  // Payment method options
  const paymentOptions = [
    { value: "cash", label: t('cash'), icon: Wallet },
    { value: "ABA Bank", label: "ABA Bank", icon: Building2 },
    { value: "ACLEDA Bank", label: "ACLEDA Bank", icon: Building2 },
    { value: "Wing", label: "Wing", icon: Smartphone },
    { value: "TrueMoney", label: "TrueMoney", icon: CreditCard },
    { value: "PiPay", label: "PiPay", icon: Smartphone },
    { value: "Other Bank", label: t('other_bank'), icon: Building2 },
  ];

  useEffect(() => {
    if (guestToEdit) {
      setOpen(true);
      setName(guestToEdit.name);
      setLocation(guestToEdit.location || "");
      setAmountUsd(guestToEdit.amountUsd > 0 ? guestToEdit.amountUsd.toString() : "");
      setAmountKhr(guestToEdit.amountKhr > 0 ? guestToEdit.amountKhr.toString() : "");
      setDisplayUsd(guestToEdit.amountUsd > 0 ? formatWithCommas(guestToEdit.amountUsd.toString()) : "");
      setDisplayKhr(guestToEdit.amountKhr > 0 ? formatWithCommas(guestToEdit.amountKhr.toString()) : "");
      setPaymentMethod(guestToEdit.paymentMethod || "cash");
      setNote(guestToEdit.note || "");
    }
  }, [guestToEdit]);

  useEffect(() => {
    if (open) {
      setTimeout(() => {
        nameInputRef.current?.focus();
      }, 100);
    }
  }, [open]);

  const formatWithCommas = (value: string): string => {
    const cleanValue = value.replace(/[^\d.]/g, "");
    const parts = cleanValue.split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
  };

  const handleUsdChange = (value: string) => {
    const cleanValue = value.replace(/[^\d.]/g, "");
    setAmountUsd(cleanValue);
    setDisplayUsd(formatWithCommas(cleanValue));
  };

  const handleKhrChange = (value: string) => {
    const cleanValue = value.replace(/\D/g, "");
    setAmountKhr(cleanValue);
    setDisplayKhr(formatWithCommas(cleanValue));
  };

  const resetForm = () => {
    setName("");
    setLocation("");
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
        location: location.trim(),
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
        toast.success(`${t('toast_recorded')}: ${name}. Ready for next!`);
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
    if (success) {
      if (guestToEdit) {
        // If editing, close the drawer
        handleOpenChange(false);
      } else {
        // If adding new, reset form and refocus for continuous entry
        resetForm();
        setTimeout(() => {
          nameInputRef.current?.focus();
        }, 100);
      }
    }
  };

  return (
    <Drawer open={open} onOpenChange={handleOpenChange}>
      <DrawerTrigger asChild>
        {trigger || (
          <Button size="lg" className="rounded-xl h-12 px-6 font-bold bg-primary">
            <Plus className="h-5 w-5 mr-2" />
            {t('add_guest')}
          </Button>
        )}
      </DrawerTrigger>
      <DrawerContent className="inset-x-0 mx-auto max-w-[600px] max-h-[85vh] flex flex-col rounded-t-[10px] border bg-background outline-none">
        <DrawerHeader>
          <DrawerTitle className="text-2xl font-black">
            {guestToEdit ? t('edit_data') : t('record_new_gift')}
          </DrawerTitle>
          <p className="text-muted-foreground font-medium mt-1 text-xs uppercase tracking-widest">{t('elder_interface_tagline')}</p>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto px-6 -mx-1">
          <form onSubmit={handleManualSave} className="space-y-8 py-4">
            <div className="space-y-8">
              
              {/* 1. Name Input */}
              <div className="space-y-4">
                <Label className="text-sm font-black uppercase tracking-widest opacity-40 ml-2">{t('guest_name')}</Label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/40 group-focus-within:text-primary" />
                   <Input 
                    ref={nameInputRef}
                    placeholder={t('enter_name_placeholder')} 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-14 text-base sm:text-lg font-bold rounded-xl border-slate-200 bg-white pl-12 focus:border-primary shadow-sm"
                    autoComplete="off"
                  />
                </div>
              </div>

              {/* 2. Location Input */}
              <div className="space-y-4">
                <Label className="text-sm font-black uppercase tracking-widest opacity-40 ml-2">
                  {t('location')} <span className="text-gray-300">{t('optional_tag')}</span>
                </Label>
                <Input 
                  placeholder={t('enter_location')} 
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="h-14 text-base font-bold rounded-xl border-slate-200 bg-white focus:border-primary shadow-sm"
                  autoComplete="off"
                />
              </div>

              {/* 3. Amounts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                     <Label className="text-sm font-black uppercase tracking-widest ml-2 text-slate-400">{t('amount_usd_label')}</Label>
                     <div className="relative">
                        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-black text-slate-300">$</div>
                         <Input 
                           type="text"
                           inputMode="decimal"
                           placeholder="0"
                           value={displayUsd}
                           onChange={(e) => handleUsdChange(e.target.value)}
                           className="h-16 text-xl sm:text-2xl font-bold rounded-xl border-slate-200 bg-white text-slate-900 focus:border-primary transition-colors pl-14"
                           onFocus={(e) => e.target.select()}
                         />
                      </div>
                   </div>
 
                   <div className="space-y-4">
                      <Label className="text-sm font-black uppercase tracking-widest ml-2 text-slate-400">{t('amount_khr_label')}</Label>
                      <div className="relative">
                         <div className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-black text-slate-300">៛</div>
                         <Input 
                           type="text"
                           inputMode="numeric"
                           placeholder="0"
                           value={displayKhr}
                           onChange={(e) => handleKhrChange(e.target.value)}
                           className="h-16 text-xl sm:text-2xl font-bold rounded-xl border-slate-200 bg-white text-slate-900 focus:border-primary transition-colors pl-14"
                           onFocus={(e) => e.target.select()}
                         />
                      </div>
                   </div>
              </div>

              {/* 4. Payment Method Dropdown */}
              <div className="space-y-4">
                <Label className="text-sm font-black uppercase tracking-widest opacity-40 ml-2">{t('payment_method')}</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger className="h-14 rounded-xl border-slate-200 bg-white font-bold text-base">
                    <SelectValue placeholder={t('select_payment_method')} />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-slate-200">
                    {paymentOptions.map((option) => {
                      const Icon = option.icon;
                      return (
                        <SelectItem 
                          key={option.value} 
                          value={option.value}
                          className="h-12 cursor-pointer rounded-xl font-bold"
                        >
                          <div className="flex items-center gap-3">
                            <Icon className="h-4 w-4 text-muted-foreground" />
                            <span>{option.label}</span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              {/* 5. Note */}
              <div className="space-y-4">
                 <Label className="text-sm font-black uppercase tracking-widest opacity-40 ml-2">{t('note')}</Label>
                 <Textarea 
                   placeholder="..."
                   value={note}
                   onChange={(e) => setNote(e.target.value)}
                   className="min-h-24 rounded-xl text-base font-bold border-slate-200 bg-white focus:border-primary resize-none shadow-sm"
                 />
              </div>
            </div>
          </form>
        </div>

        <DrawerFooter className="mt-4 pb-12 sm:pb-8 border-t pt-4">
          <div className="flex gap-4">
            <DrawerClose asChild>
              <Button 
                type="button"
                variant="outline"
                size="lg"
                className="flex-1 h-12 rounded-xl font-bold border-slate-200"
              >
                {t('cancel')}
              </Button>
            </DrawerClose>
            <Button 
              type="submit" 
              size="lg" 
              disabled={loading}
              onClick={handleManualSave}
              className="flex-1 h-12 rounded-xl font-black text-base shadow-md hover:shadow-lg transition-all bg-primary hover:bg-primary/90"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  {t('saving')}
                </>
              ) : (
                guestToEdit ? t('update') : t('add_guest')
              )}
            </Button>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
