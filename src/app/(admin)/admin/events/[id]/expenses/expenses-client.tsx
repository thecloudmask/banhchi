"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { getEventById } from "@/services/event.service";
import { subscribeToExpenses, deleteExpense } from "@/services/expense.service";
import { Event, Expense } from "@/types";
import { AddExpenseDialog } from "@/components/add-expense-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ArrowLeft,
  Search,
  Trash2,
  Pencil,
  Loader2,
  Receipt,
  DollarSign,
  Wallet,
  Building2,
  Filter,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { cn, formatDateTime } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ExpensesClient() {
  const { user, loading: authLoading } = useAuth();
  const params = useParams();
  const router = useRouter();

  const [currentEventId, setCurrentEventId] = useState<string | null>(null);

  useEffect(() => {
    if (params?.id) {
      const id = Array.isArray(params.id) ? params.id[0] : params.id;
      if (id) setCurrentEventId(id);
    }
  }, [params]);

  const [event, setEvent] = useState<Event | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [paymentFilter, setPaymentFilter] = useState<string>("all");
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  const fetchData = async () => {
    if (!currentEventId) return;
    try {
      const eventData = await getEventById(currentEventId);
      setEvent(eventData);
    } catch (error) {
      console.error(error);
      toast.error("បរាជ័យក្នុងការទាញយកទិន្នន័យ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && currentEventId) {
      fetchData();

      const unsubscribe = subscribeToExpenses(
        currentEventId,
        (updatedExpenses) => {
          setExpenses(updatedExpenses);
        },
      );

      return () => unsubscribe();
    }
  }, [user, currentEventId]);

  const handleDeleteExpense = async (expenseId: string) => {
    if (!currentEventId || !confirm("តើអ្នកពិតជាចង់លុបការចំណាយនេះមែនទេ?"))
      return;
    try {
      await deleteExpense(currentEventId!, expenseId);
      toast.success("បានលុបការចំណាយ");
    } catch (error) {
      console.error(error);
      toast.error("បរាជ័យក្នុងការលុបការចំណាយ");
    }
  };

  const filteredExpenses = useMemo(() => {
    return expenses.filter((expense) => {
      const matchesSearch =
        expense.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        expense.invoiceNumber
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase());

      const method = expense.paymentMethod || "cash";
      const matchesFilter = paymentFilter === "all" || method === paymentFilter;

      return matchesSearch && matchesFilter;
    });
  }, [expenses, searchQuery, paymentFilter]);

  const totals = useMemo(() => {
    return expenses.reduce(
      (acc, curr) => {
        const actual = curr.actualAmount || 0;

        const method = curr.paymentMethod || "cash";
        const isCash = method === "cash";

        if (curr.currency === "USD") {
          acc.actualUsd += actual;
          if (isCash) acc.cashUsd += actual;
          else acc.bankUsd += actual;
        } else {
          acc.actualKhr += actual;
          if (isCash) acc.cashKhr += actual;
          else acc.bankKhr += actual;
        }
        return acc;
      },
      {
        actualUsd: 0,
        actualKhr: 0,
        cashUsd: 0,
        cashKhr: 0,
        bankUsd: 0,
        bankKhr: 0,
      },
    );
  }, [expenses]);

  const formatUsd = (val: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(val);
  const formatKhr = (val: number) =>
    new Intl.NumberFormat("km-KH").format(val) + "៛";

  if (authLoading || !user) return null;
  if (!currentEventId) return null;

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="text-center py-40 font-black text-muted-foreground uppercase text-sm bg-background min-h-screen">
        រកមិនឃើញកម្មវិធី
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-background min-h-screen text-foreground p-4 sm:p-6 font-kantumruy animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-6 border-b border-border">
        <div className="flex items-start gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.back()}
            className="rounded-md border-border bg-card hover:bg-accent h-10 w-10 shrink-0 transition-all"
          >
            <ArrowLeft className="h-4 w-4 text-muted-foreground" />
          </Button>
          <div className="space-y-1 overflow-hidden">
            <h1 className="text-xl sm:text-3xl font-bold text-foreground leading-tight line-clamp-2">
              {"ចំណាយ"}
            </h1>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-semibold text-muted-foreground uppercase">
              <span className="text-primary truncate max-w-[200px]">
                {event.title}
              </span>
              <div className="h-1 w-1 rounded-full bg-border" />
              <span>
                {expenses.length} {"មុខ"}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <AddExpenseDialog
            event={event}
            onSuccess={() => setEditingExpense(null)}
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6 rounded-md border-none shadow-xl shadow-blue-500/5 bg-blue-600/90 text-white relative overflow-hidden group animate-in fade-in zoom-in duration-500">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 -mr-12 -mt-12 rounded-full blur-xl group-hover:scale-150 transition-transform duration-700" />
          <div className="relative z-10 space-y-4">
            <div className="h-8 w-8 rounded-md bg-white/20 flex items-center justify-center">
              <DollarSign className="h-4 w-4 text-white" />
            </div>
            <div>
              <div className="text-[10px] font-semibold uppercase opacity-60 mb-0.5">
                {"ចំណាយសរុប (USD)"}
              </div>
              <div className="text-xl font-bold">
                {formatUsd(totals.actualUsd)}
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6 rounded-md border-none shadow-xl shadow-emerald-500/5 bg-emerald-600/90 text-white relative overflow-hidden group animate-in fade-in zoom-in duration-500 delay-75">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 -mr-12 -mt-12 rounded-full blur-xl group-hover:scale-150 transition-transform duration-700" />
          <div className="relative z-10 space-y-4">
            <div className="h-8 w-8 rounded-md bg-white/20 flex items-center justify-center">
              <div className="text-lg font-bold text-white">៛</div>
            </div>
            <div>
              <div className="text-[10px] font-semibold uppercase opacity-60 mb-0.5">
                {"ចំណាយសរុប (KHR)"}
              </div>
              <div className="text-xl font-bold">
                {formatKhr(totals.actualKhr)}
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6 rounded-md border-none shadow-xl shadow-orange-500/5 bg-orange-500/90 text-white relative overflow-hidden group animate-in fade-in zoom-in duration-500 delay-100">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 -mr-12 -mt-12 rounded-full blur-xl group-hover:scale-150 transition-transform duration-700" />
          <div className="relative z-10 space-y-4">
            <div className="h-8 w-8 rounded-md bg-white/20 flex items-center justify-center">
              <Wallet className="h-4 w-4 text-white" />
            </div>
            <div>
              <div className="text-[10px] font-semibold uppercase opacity-60 mb-0.5">
                {"សរុបសាច់ប្រាក់សុទ្ធ"}
              </div>
              <div className="text-base font-bold">
                {formatUsd(totals.cashUsd)}
              </div>
              <div className="text-sm font-semibold opacity-80">
                {formatKhr(totals.cashKhr)}
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6 rounded-md border-none shadow-xl shadow-indigo-500/5 bg-indigo-500/90 text-white relative overflow-hidden group animate-in fade-in zoom-in duration-500 delay-150">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 -mr-12 -mt-12 rounded-full blur-xl group-hover:scale-150 transition-transform duration-700" />
          <div className="relative z-10 space-y-4">
            <div className="h-8 w-8 rounded-md bg-white/20 flex items-center justify-center">
              <Building2 className="h-4 w-4 text-white" />
            </div>
            <div>
              <div className="text-[10px] font-semibold uppercase opacity-60 mb-0.5">
                {"សរុបតាមធនាគារ"}
              </div>
              <div className="text-base font-bold">
                {formatUsd(totals.bankUsd)}
              </div>
              <div className="text-sm font-semibold opacity-80">
                {formatKhr(totals.bankKhr)}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Content */}
      <Card className="rounded-md border-border shadow-2xl shadow-primary/5 bg-card/40 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-700">
        <div className="p-4 sm:p-6 border-b border-border flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-3 w-full lg:w-auto">
            <div className="h-10 w-10 rounded-md bg-primary/5 border border-primary/10 flex items-center justify-center shrink-0">
              <Receipt className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">
                {filteredExpenses.length} {"មុខ"}
              </h2>
              <div className="text-[10px] font-bold text-muted-foreground uppercase">
                {"បញ្ជីចំណាយលម្អិត"}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
            <Select value={paymentFilter} onValueChange={setPaymentFilter}>
              <SelectTrigger className="w-full sm:w-45 h-10 rounded-md border-border bg-accent/50 text-accent-foreground font-semibold focus:bg-accent transition-all text-[10px] uppercase">
                <div className="flex items-center gap-2 text-muted-foreground w-full text-left">
                  <Filter className="h-3.5 w-3.5 shrink-0 text-primary" />
                  <span className="truncate flex-1">
                    {paymentFilter === "all"
                      ? "គ្រប់វិធី"
                      : paymentFilter === "cash"
                        ? "សាច់ប្រាក់"
                        : paymentFilter}
                  </span>
                </div>
              </SelectTrigger>
              <SelectContent
                className="rounded-md bg-card border-border text-foreground font-semibold z-[100]"
                position="popper"
              >
                <SelectItem value="all" className="rounded-md focus:bg-accent">
                  {"គ្រប់វិធី"}
                </SelectItem>
                <SelectItem value="cash" className="rounded-md focus:bg-accent">
                  {"សាច់ប្រាក់"}
                </SelectItem>
                <SelectItem
                  value="ABA Bank"
                  className="rounded-md focus:bg-accent"
                >
                  ABA Bank
                </SelectItem>
                <SelectItem
                  value="ACLEDA Bank"
                  className="rounded-md focus:bg-accent"
                >
                  ACLEDA Bank
                </SelectItem>
                <SelectItem value="Wing" className="rounded-md focus:bg-accent">
                  Wing
                </SelectItem>
                <SelectItem
                  value="TrueMoney"
                  className="rounded-md focus:bg-accent"
                >
                  TrueMoney
                </SelectItem>
                <SelectItem
                  value="PiPay"
                  className="rounded-md focus:bg-accent"
                >
                  PiPay
                </SelectItem>
                <SelectItem
                  value="Other Bank"
                  className="rounded-md focus:bg-accent"
                >
                  {"ធនាគារផ្សេងៗ"}
                </SelectItem>
              </SelectContent>
            </Select>

            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50" />
              <Input
                placeholder={"ស្វែងរក..."}
                className="pl-9 h-10 rounded-md border-border bg-accent/50 focus:bg-accent transition-all font-semibold text-foreground text-xs"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="hover:bg-transparent border-border">
                <TableHead className="w-[40%] px-6 h-12 font-bold text-[10px] uppercase text-muted-foreground">
                  {"ឈ្មោះចំណាយ"}
                </TableHead>
                <TableHead className="px-4 font-bold text-[10px] uppercase text-muted-foreground">
                  {"ទឹកប្រាក់"}
                </TableHead>
                <TableHead className="px-4 font-bold text-[10px] uppercase text-muted-foreground">
                  {"បង់ប្រាក់តាម"}
                </TableHead>
                <TableHead className="px-4 font-bold text-[10px] uppercase text-muted-foreground">
                  {"លេខវិក្កយបត្រ"}
                </TableHead>
                <TableHead className="w-20 text-right px-6"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredExpenses.length > 0 ? (
                filteredExpenses.map((expense) => (
                  <TableRow
                    key={expense.id}
                    className="group hover:bg-accent/40 transition-colors border-border"
                  >
                    <TableCell className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center shrink-0 group-hover:bg-accent transition-colors">
                          <Receipt className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                        <div className="space-y-0.5">
                          <div className="font-bold text-foreground text-sm group-hover:text-primary transition-colors">
                            {expense.name}
                          </div>
                          {expense.note && (
                            <div className="text-[11px] font-medium text-muted-foreground italic line-clamp-1 opacity-60">
                              {expense.note}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-5 font-bold text-foreground text-sm">
                      {expense.currency === "USD"
                        ? formatUsd(expense.actualAmount)
                        : formatKhr(expense.actualAmount)}
                    </TableCell>
                    <TableCell className="px-4 py-5">
                      <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-muted rounded-md text-[9px] font-bold text-muted-foreground uppercase group-hover:bg-primary/5 group-hover:text-primary transition-all">
                        {expense.paymentMethod === "cash"
                          ? "សាច់ប្រាក់"
                          : expense.paymentMethod || "សាច់ប្រាក់"}
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-5">
                      <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-muted rounded-md text-[9px] font-bold text-muted-foreground uppercase opacity-60">
                        {expense.invoiceNumber || "មិនមាន"}
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-5 text-right">
                      <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-md border border-border hover:bg-primary/5 text-muted-foreground hover:text-primary transition-all"
                          onClick={() => setEditingExpense(expense)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-md border border-border hover:bg-destructive/5 text-muted-foreground hover:text-destructive transition-all"
                          onClick={() => handleDeleteExpense(expense.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-64 text-center">
                    <div className="flex flex-col items-center justify-center gap-3 opacity-20">
                      <div className="h-16 w-16 bg-muted rounded-md flex items-center justify-center">
                        <Receipt className="h-7 w-7 text-foreground" />
                      </div>
                      <span className="font-bold text-[10px] uppercase text-foreground">
                        {"រកមិនឃើញទិន្នន័យ"}
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Edit Dialog */}
      {editingExpense && (
        <AddExpenseDialog
          event={event}
          expenseToEdit={editingExpense}
          onClose={() => setEditingExpense(null)}
          onSuccess={() => setEditingExpense(null)}
        />
      )}
    </div>
  );
}
