import { useState, useRef, useEffect } from "react";
import { 
  Drawer, 
  DrawerContent, 
  DrawerHeader, 
  DrawerTitle, 
  DrawerDescription,
  DrawerTrigger,
  DrawerFooter,
  DrawerClose 
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { addExpense, updateExpense } from "@/services/expense.service";
import { Loader2, Plus, ShoppingBag, Receipt, Wand2 } from "lucide-react";


import { toast } from "sonner";
import { Expense, Event, PaymentMethod } from "@/types";
import { Wallet, CreditCard, Building2, Smartphone } from "lucide-react";

interface AddExpenseDialogProps {
  event: Event;
  expenseToEdit?: Expense | null;
  onClose?: () => void;
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export function AddExpenseDialog({ event, expenseToEdit, onClose, trigger, onSuccess }: AddExpenseDialogProps) {


  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  // No internationalization needed
  
  // Form State
  const [name, setName] = useState("");

  const [actualAmount, setActualAmount] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [currency, setCurrency] = useState<'USD' | "KHR">("USD");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [note, setNote] = useState("");
  
  // Display versions

  const [displayActual, setDisplayActual] = useState("");

  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (expenseToEdit) {
      setOpen(true);
      setName(expenseToEdit.name);
      setActualAmount(expenseToEdit.actualAmount.toString());
      setDisplayActual(formatWithCommas(expenseToEdit.actualAmount.toString()));
      setInvoiceNumber(expenseToEdit.invoiceNumber || "");
      setCurrency(expenseToEdit.currency);
      setPaymentMethod(expenseToEdit.paymentMethod || "cash");
      setNote(expenseToEdit.note || "");
    } else {
        resetForm();
    }
  }, [expenseToEdit]);

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



  const handleActualChange = (value: string) => {
    const cleanValue = value.replace(/[^\d.]/g, "");
    setActualAmount(cleanValue);
    setDisplayActual(formatWithCommas(cleanValue));
  };

  const resetForm = (full = true) => {
    setName("");
    setActualAmount("");
    setDisplayActual("");
    setInvoiceNumber("");
    setNote("");
    if (full) {
      setCurrency("USD");
      setPaymentMethod("cash");
    }
  };

  const generateInvoice = () => {
    const prefix = "INV";
    const random = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    setInvoiceNumber(`${prefix}-${random}`);
  };

  const handleOpenChange = (val: boolean) => {
    setOpen(val);
    if (!val) {
      resetForm(true);
      if (onClose) onClose();
    }
  };

  const saveData = async () => {
    if (!name.trim()) {
      toast.error("សូមបញ្ចូលឈ្មោះចំណាយ");
      nameInputRef.current?.focus();
      return false;
    }

    try {
      setLoading(true);
      
      const data = {
        name: name.trim(),
        budgetAmount: 0,
        actualAmount: parseFloat(actualAmount) || 0,
        invoiceNumber: invoiceNumber.trim(),
        currency,
        paymentMethod,
        note: note.trim()
      };

      if (expenseToEdit) {
        await updateExpense(event.id, expenseToEdit.id, data);
        toast.success("បានកែប្រែដោយជោគជ័យ");
      } else {
        await addExpense(event.id, data);
        toast.success("បានកត់ត្រាដោយជោគជ័យ");
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await saveData();
    if (success) {
      if (expenseToEdit) {
        handleOpenChange(false);
      } else {
        // For new items, keep dialog open and partial reset
        resetForm(false);
        setTimeout(() => {
          nameInputRef.current?.focus();
        }, 100);
      }
    }
  };

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



  return (
    <Drawer open={open} onOpenChange={handleOpenChange}>
      <DrawerTrigger asChild>
        {trigger || (
          <Button size="lg" className="rounded-xl h-12 px-6 font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20">
            <Plus className="h-5 w-5 mr-2" />
            {"បន្ថែមការចំណាយ"}
          </Button>
        )}
      </DrawerTrigger>
      <DrawerContent className="inset-x-0 mx-auto max-w-150 max-h-[85vh] flex flex-col rounded-t-[2rem] border-border bg-background text-foreground outline-none">
        <DrawerHeader className="border-b border-border pb-4">
          <DrawerTitle className="text-2xl font-black text-foreground">
            {expenseToEdit ? "កែប្រែការចំណាយ" : "បន្ថែមការចំណាយ"}
          </DrawerTitle>
          <DrawerDescription className="text-muted-foreground font-medium mt-0.5 text-[10px] uppercase">
            សូមបំពេញព័ត៌មានខាងក្រោមដើម្បីកត់ត្រាការចំណាយរបស់លោកអ្នក
          </DrawerDescription>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto px-6 -mx-1 scrollbar-hide">
          <form onSubmit={handleSubmit} className="space-y-6 py-6">
            <div className="space-y-6">
              
              {/* Item Name */}
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase  text-muted-foreground ml-1">
                  {"ឈ្មោះចំណាយ"}
                </Label>
                <div className="relative group">
                  <ShoppingBag className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/50 group-focus-within:text-primary transition-colors" />
                   <Input 
                    ref={nameInputRef}
                    placeholder="..." 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-14 text-base font-bold rounded-2xl border-border bg-muted/30 pl-12 shadow-sm focus:border-primary focus:ring-1 focus:ring-primary text-foreground placeholder:text-muted-foreground/30"
                    autoComplete="off"
                  />
                </div>
              </div>
              
              {/* Invoice Number */}
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase  text-muted-foreground ml-1">
                  {"លេខវិក្កយបត្រ"}
                </Label>
                <div className="relative group">
                  <Receipt className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/50 group-focus-within:text-primary transition-colors" />
                   <Input 
                    placeholder="INV-..." 
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    className="h-14 text-base font-bold rounded-2xl border-border bg-muted/30 pl-12 pr-12 shadow-sm focus:border-primary focus:ring-1 focus:ring-primary text-foreground placeholder:text-muted-foreground/30"
                    autoComplete="off"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-xl hover:bg-accent text-muted-foreground hover:text-primary"
                    onClick={generateInvoice}
                    title={"បង្កើតលេខវិក្កយបត្រ"}
                  >
                    <Wand2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Currency Selection */}
               <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase  text-muted-foreground ml-1">
                  {"រូបិយប័ណ្ណ"}
                </Label>
                <Select value={currency} onValueChange={(val: any) => setCurrency(val)}>
                  <SelectTrigger className="h-14 rounded-2xl border-border bg-muted/30 font-bold text-base focus:border-primary focus:ring-1 focus:ring-primary text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-border bg-card text-foreground">
                    <SelectItem value="USD" className="font-bold cursor-pointer focus:bg-primary focus:text-white">USD ($)</SelectItem>
                    <SelectItem value="KHR" className="font-bold cursor-pointer focus:bg-primary focus:text-white">KHR (៛)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Payment Method Dropdown */}
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase  text-muted-foreground ml-1">
                  {"វិធីបង់ប្រាក់"}
                </Label>
                <Select value={paymentMethod} onValueChange={(val: any) => setPaymentMethod(val)}>
                  <SelectTrigger className="h-14 rounded-2xl border-border bg-muted/30 font-bold text-base focus:border-primary focus:ring-1 focus:ring-primary text-foreground">
                    <SelectValue placeholder={"ជ្រើសរើសវិធីបង់ប្រាក់"} />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-border bg-card text-foreground">
                    {paymentOptions.map((option) => {
                      const Icon = option.icon;
                      return (
                        <SelectItem 
                          key={option.value} 
                          value={option.value}
                          className="h-12 cursor-pointer rounded-xl font-bold focus:bg-primary focus:text-white"
                        >
                          <div className="flex items-center gap-3">
                            <Icon className="h-4 w-4 text-muted-foreground/50 group-focus:text-primary-foreground" />
                            <span>{option.label}</span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              {/* Amounts Grid */}
               <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase  text-muted-foreground ml-1">
                    {"ទឹកប្រាក់ចំណាយ"}
                  </Label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-muted-foreground/30 group-focus-within:text-primary transition-colors text-lg">
                      {currency === 'USD' ? '$' : '៛'}
                    </div>
                    <Input 
                      placeholder="0"
                      value={displayActual}
                      onChange={(e) => handleActualChange(e.target.value)}
                      className="h-14 text-xl font-black rounded-2xl border-border bg-muted/30 pl-10 shadow-sm focus:border-primary focus:ring-1 focus:ring-primary text-foreground"
                      inputMode="decimal"
                    />
                  </div>
                </div>
              </div>

              {/* Note */}
               <div className="space-y-2">
                 <Label className="text-[10px] font-black uppercase  text-muted-foreground ml-1">
                  {"សម្គាល់"}
                 </Label>
                 <Textarea 
                   placeholder="..."
                   value={note}
                   onChange={(e) => setNote(e.target.value)}
                   className="min-h-24 rounded-2xl text-base font-bold border-border bg-muted/30 resize-none shadow-sm focus:border-primary focus:ring-1 focus:ring-primary text-foreground placeholder:text-muted-foreground/30"
                 />
              </div>
            </div>
          </form>
        </div>

        <DrawerFooter className="pb-10 pt-4 border-t border-border px-6 bg-accent/20 rounded-b-none">
          <div className="flex gap-4">
            <DrawerClose asChild>
              <Button variant="outline" className="flex-1 h-14 rounded-2xl font-bold border-border bg-muted/30 text-muted-foreground hover:bg-accent hover:text-foreground transition-all">
                {"បោះបង់"}
              </Button>
            </DrawerClose>
            <Button 
              disabled={loading}
              onClick={handleSubmit}
              className="flex-1 h-14 rounded-2xl font-black text-primary-foreground shadow-xl shadow-primary/20 bg-primary hover:bg-primary/90 active:scale-95 transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  {"កំពុងរក្សាទុក..."}
                </>
              ) : (
                expenseToEdit ? "កែប្រែ" : "រក្សាទុក"
              )}
            </Button>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
