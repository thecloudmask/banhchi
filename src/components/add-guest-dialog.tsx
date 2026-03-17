import { useState, useRef, useEffect } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerTrigger,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { addGuest, updateGuest } from "@/services/event.service";
import {
  Loader2,
  Plus,
  User,
  Wallet,
  CreditCard,
  Building2,
  Smartphone,
} from "lucide-react";
import { toast } from "sonner";
import { LoadingOverlay } from "./loading-overlay";
import { Guest, PaymentMethod, Event } from "@/types";

interface AddGuestDialogProps {
  event: Event;
  guestToEdit?: Guest | null;
  onClose?: () => void;
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export function AddGuestDialog({
  event,
  guestToEdit,
  onClose,
  trigger,
  onSuccess,
}: AddGuestDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  // No internationalization needed

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
    { value: "cash", label: "សាច់ប្រាក់", icon: Wallet },
    { value: "ABA Bank", label: "ABA Bank", icon: Building2 },
    { value: "ACLEDA Bank", label: "ACLEDA Bank", icon: Building2 },
    { value: "Wing", label: "Wing", icon: Smartphone },
    { value: "TrueMoney", label: "TrueMoney", icon: CreditCard },
    { value: "PiPay", label: "PiPay", icon: Smartphone },
    { value: "Other Bank", label: "ធនាគារផ្សេងៗ", icon: Building2 },
  ];

  useEffect(() => {
    if (guestToEdit) {
      setOpen(true);
      setName(guestToEdit.name);
      setLocation(guestToEdit.location || "");
      setAmountUsd(
        guestToEdit.amountUsd > 0 ? guestToEdit.amountUsd.toString() : "",
      );
      setAmountKhr(
        guestToEdit.amountKhr > 0 ? guestToEdit.amountKhr.toString() : "",
      );
      setDisplayUsd(
        guestToEdit.amountUsd > 0
          ? formatWithCommas(guestToEdit.amountUsd.toString())
          : "",
      );
      setDisplayKhr(
        guestToEdit.amountKhr > 0
          ? formatWithCommas(guestToEdit.amountKhr.toString())
          : "",
      );
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
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ", ");
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
      toast.error("សូមបញ្ចូលឈ្មោះភ្ញៀវ");
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
        note: note.trim(),
      };

      if (guestToEdit) {
        await updateGuest(event.id, guestToEdit.id, data);
        toast.success(`បានកែប្រែដោយជោគជ័យ: ${name}`);
      } else {
        await addGuest(event.id, data);
        toast.success(`បានកត់ត្រា៖ ${name}។ រួចរាល់សម្រាប់អ្នកបន្ទាប់!`);
      }

      if (onSuccess) onSuccess();
      return true;
    } catch (error) {
      console.error(error);
      toast.error("បរាជ័យក្នុងការរក្សាទុក");
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
          <Button
            size="sm"
            className="rounded-md h-9 px-4 font-bold bg-primary hover:bg-primary/90 text-primary-foreground text-xs uppercase"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            <span>បញ្ចូលភ្ញៀវ</span>
          </Button>
        )}
      </DrawerTrigger>
      <DrawerContent className="inset-x-0 mx-auto max-w-150 max-h-[85vh] flex flex-col rounded-t-[2rem] border-border bg-background outline-none">
        <LoadingOverlay isVisible={loading} />
        <DrawerHeader className="border-b border-border pb-4">
          <DrawerTitle className="text-xl font-bold text-foreground">
            {guestToEdit ? <span>កែប្រែទិន្នន័យ</span> : <span>កត់ត្រាការចងដៃថ្មី</span>}
          </DrawerTitle>
          <DrawerDescription className="text-muted-foreground font-medium mt-0.5 text-[10px] uppercase">
            <span>បច្ចេកវិទ្យាជំនួយការឌីជីថល សម្រាប់គ្រប់កម្មវិធី</span>
          </DrawerDescription>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto px-6 -mx-1">
          <form onSubmit={handleManualSave} className="space-y-8 py-4">
            <div className="space-y-8">
              {/* 1. Name Input */}
              <div className="space-y-2">
                <Label className="text-[10px] font-semibold uppercase text-muted-foreground ml-1">
                  <span>ឈ្មោះភ្ញៀវ</span>
                </Label>
                <div className="relative group">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50 group-focus-within:text-primary transition-colors" />
                  <Input
                    ref={nameInputRef}
                    placeholder={"ឧ. ឯកឧត្តម, លោកជំទាវ, លោក, អ្នកនាង..."}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-12 text-base font-bold rounded-md border-border bg-muted/30 text-foreground pl-10 placeholder:text-muted-foreground/30 focus:border-primary/40 focus:ring-primary/10"
                    autoComplete="off"
                  />
                </div>
              </div>

              {/* 2. Location Input */}
              <div className="space-y-2">
                <Label className="text-[10px] font-semibold uppercase text-muted-foreground ml-1">
                  <span>មកពីទីតាំង</span>{" "}
                  <span className="text-muted-foreground/30">
                    <span>(មិនមានក៏បាន)</span>
                  </span>
                </Label>
                <Input
                  placeholder={"ឧ. ភ្នំពេញ, បាត់ដំបង..."}
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="h-12 text-base font-bold rounded-md border-border bg-muted/30 text-foreground placeholder:text-muted-foreground/30 focus:border-primary/40 focus:ring-primary/10"
                  autoComplete="off"
                />
              </div>

              {/* 3. Amounts */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-semibold uppercase text-muted-foreground ml-1">
                    <span>ទឹកប្រាក់ (ដុល្លារ)</span>
                  </Label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-muted-foreground/30">
                      $
                    </div>
                    <Input
                      type="text"
                      inputMode="decimal"
                      placeholder="0"
                      value={displayUsd}
                      onChange={(e) => handleUsdChange(e.target.value)}
                      className="h-14 text-xl font-bold rounded-md border-border bg-muted/30 text-foreground placeholder:text-muted-foreground/30 focus:border-primary/40 focus:ring-primary/10 pl-10"
                      onFocus={(e) => e.target.select()}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-semibold uppercase text-muted-foreground ml-1">
                    <span>ទឹកប្រាក់ (រៀល)</span>
                  </Label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-muted-foreground/30">
                      ៛
                    </div>
                    <Input
                      type="text"
                      inputMode="numeric"
                      placeholder="0"
                      value={displayKhr}
                      onChange={(e) => handleKhrChange(e.target.value)}
                      className="h-14 text-xl font-bold rounded-md border-border bg-muted/30 text-foreground placeholder:text-muted-foreground/30 focus:border-primary/40 focus:ring-primary/10 pl-10"
                      onFocus={(e) => e.target.select()}
                    />
                  </div>
                </div>
              </div>

              {/* 4. Payment Method Dropdown */}
              <div className="space-y-2">
                <Label className="text-[10px] font-semibold uppercase text-muted-foreground ml-1">
                  <span>វិធីបង់ប្រាក់</span>
                </Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger className="h-12 rounded-md border-border bg-muted/30 text-foreground font-semibold text-sm">
                    <SelectValue placeholder={"ជ្រើសរើសវិធីបង់ប្រាក់"} />
                  </SelectTrigger>
                  <SelectContent className="rounded-md bg-card border-border text-foreground">
                    {paymentOptions.map((option) => {
                      const Icon = option.icon;
                      return (
                        <SelectItem
                          key={option.value}
                          value={option.value}
                          className="h-11 cursor-pointer rounded-md font-semibold text-sm hover:bg-accent focus:bg-accent focus:text-accent-foreground"
                        >
                          <div className="flex items-center gap-3">
                            <Icon className="h-4 w-4 text-muted-foreground/50" />
                            <span>{option.label}</span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              {/* 5. Note */}
              <div className="space-y-2">
                <Label className="text-[10px] font-semibold uppercase text-muted-foreground ml-1">
                  <span>សម្គាល់</span>
                </Label>
                <Textarea
                  placeholder="..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="min-h-20 rounded-md text-sm font-medium border-border bg-muted/30 text-foreground placeholder:text-muted-foreground/30 focus:border-primary/40 focus:ring-primary/10 resize-none px-4 py-3"
                />
              </div>
            </div>
          </form>
        </div>

        <DrawerFooter className="mt-2 pb-10 sm:pb-6 border-t border-border pt-4">
          <div className="flex gap-3">
            <DrawerClose asChild>
              <Button
                type="button"
                variant="ghost"
                className="flex-1 h-11 rounded-md font-semibold text-muted-foreground hover:text-foreground hover:bg-accent"
              >
                <span>បោះបង់</span>
              </Button>
            </DrawerClose>
            <Button
              type="submit"
              disabled={loading}
              onClick={handleManualSave}
              className="flex-1 h-11 rounded-md font-bold text-sm shadow-md transition-all bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  <span>កំពុងរក្សាទុក...</span>
                </>
              ) : guestToEdit ? (
                <span>កែប្រែ</span>
              ) : (
                <span>បញ្ចូលភ្ញៀវ</span>
              )}
            </Button>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
