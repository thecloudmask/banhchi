"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { getEventById } from "@/services/event.service";
import { subscribeToExpenses, deleteExpense } from "@/services/expense.service";
import { Event, Expense } from "@/types";
import { AddExpenseDialog } from "@/components/add-expense-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Search, Trash2, Pencil, Loader2, Receipt, TrendingDown, DollarSign, Wallet, Building2, PieChart, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { cn, formatDate } from "@/lib/utils";
import { useLanguage } from "@/providers/language-provider";
import { useAuth } from "@/providers/auth-provider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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

  const { t } = useLanguage();
  
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
      toast.error("Failed to load event data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && currentEventId) {
      fetchData();
      
      const unsubscribe = subscribeToExpenses(currentEventId, (updatedExpenses) => {
        setExpenses(updatedExpenses);
      });
      
      return () => unsubscribe();
    }
  }, [user, currentEventId]);

  const handleDeleteExpense = async (expenseId: string) => {
    if (!currentEventId || !confirm(t('delete_expense_confirm'))) return;
    try {
      await deleteExpense(currentEventId!, expenseId);
      toast.success(t('expense_deleted'));
    } catch (error) {
      console.error(error);
      toast.error(t('failed_delete_expense'));
    }
  };

  const filteredExpenses = useMemo(() => {
    return expenses.filter(expense => {
      const matchesSearch = expense.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        expense.invoiceNumber?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const method = expense.paymentMethod || 'cash';
      const matchesFilter = paymentFilter === 'all' || method === paymentFilter;

      return matchesSearch && matchesFilter;
    });
  }, [expenses, searchQuery, paymentFilter]);

  const totals = useMemo(() => {
    return expenses.reduce((acc, curr) => {
      const actual = curr.actualAmount || 0;
      
      const method = curr.paymentMethod || 'cash';
      const isCash = method === 'cash';

      if (curr.currency === 'USD') {
        acc.actualUsd += actual;
        if (isCash) acc.cashUsd += actual;
        else acc.bankUsd += actual;
      } else {
        acc.actualKhr += actual;
        if (isCash) acc.cashKhr += actual;
        else acc.bankKhr += actual;
      }
      return acc;
    }, { 
      actualUsd: 0, 
      actualKhr: 0,
      cashUsd: 0, cashKhr: 0,
      bankUsd: 0, bankKhr: 0
    });
  }, [expenses]);

  const formatUsd = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
  const formatKhr = (val: number) => new Intl.NumberFormat('km-KH').format(val) + " ៛";



  if (authLoading || !user) return null;
  if (!currentEventId) return null;
  if (loading) return <div className="flex h-[70vh] items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" /></div>;
  if (!event) return <div className="text-center py-40 font-black">EVENT NOT FOUND</div>;

  return (
    <div className="space-y-10 sm:space-y-12">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-gray-100">
        <div className="flex items-start gap-3 sm:gap-5">
           <Button variant="outline" size="icon" onClick={() => router.back()} className="rounded-xl border-gray-200 h-10 w-10 sm:h-12 sm:w-12 hover:bg-gray-50 bg-white">
              <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
           </Button>
           <div className="space-y-2">
              <h1 className="text-2xl sm:text-4xl font-black tracking-tighter text-gray-900 leading-none">{t('expenses')}</h1>
              <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
                 <span className="text-primary truncate max-w-[200px]">{event.title}</span>
                 <div className="h-1 w-1 rounded-full bg-gray-200" />
                 <span>{expenses.length} {t('items')}</span>
              </div>
           </div>
        </div>
        <div className="flex items-center gap-3">
            <AddExpenseDialog 
              event={event} 
              onSuccess={() => setEditingExpense(null)} 
            />
        </div>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <Card className="p-8 sm:p-10 rounded-[2.5rem] border-none shadow-sm bg-blue-600 text-white relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 -mr-16 -mt-16 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
             <div className="relative z-10 flex items-start justify-between">
                <div className="space-y-6">
                   <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center">
                      <DollarSign className="h-5 w-5 text-white" />
                   </div>
                   <div>
                      <div className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">{t('spending_usd')}</div>
                      <div className="text-3xl sm:text-4xl font-black">{formatUsd(totals.actualUsd)}</div>
                   </div>
                </div>
                <div className="text-right">
                   <TrendingDown className="h-8 w-8 text-white/20" />
                </div>
             </div>
          </Card>

          <Card className="p-8 sm:p-10 rounded-[2.5rem] border-none shadow-sm bg-emerald-600 text-white relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 -mr-16 -mt-16 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
             <div className="relative z-10 flex items-start justify-between">
                <div className="space-y-6">
                   <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center">
                      <div className="text-lg font-black text-white">៛</div>
                   </div>
                   <div>
                      <div className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">{t('spending_khr')}</div>
                      <div className="text-3xl sm:text-4xl font-black">{formatKhr(totals.actualKhr)}</div>
                   </div>
                </div>
                <div className="text-right">
                   <TrendingDown className="h-8 w-8 text-white/20" />
                </div>
             </div>
          </Card>

          {/* Cash Subtotal */}
          <Card className="p-8 sm:p-10 rounded-[2.5rem] border-none shadow-sm bg-orange-500 text-white relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 -mr-16 -mt-16 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
             <div className="relative z-10 flex items-start justify-between">
                <div className="space-y-6">
                   <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center">
                      <Wallet className="h-5 w-5 text-white" />
                   </div>
                   <div>
                      <div className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">{t('cash_subtotal')}</div>
                      <div className="text-3xl sm:text-4xl font-black">{formatUsd(totals.cashUsd)}</div>
                      <div className="text-[10px] font-bold opacity-40 mt-1 uppercase tracking-tighter italic">{formatKhr(totals.cashKhr)}</div>
                   </div>
                </div>
                <div className="text-right">
                   <TrendingDown className="h-8 w-8 text-white/20" />
                </div>
             </div>
          </Card>

          {/* Bank Subtotal */}
          <Card className="p-8 sm:p-10 rounded-[2.5rem] border-none shadow-sm bg-indigo-500 text-white relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 -mr-16 -mt-16 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
             <div className="relative z-10 flex items-start justify-between">
                <div className="space-y-6">
                   <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center">
                      <Building2 className="h-5 w-5 text-white" />
                   </div>
                   <div>
                      <div className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">{t('bank_subtotal')}</div>
                      <div className="text-3xl sm:text-4xl font-black">{formatUsd(totals.bankUsd)}</div>
                      <div className="text-[10px] font-bold opacity-40 mt-1 uppercase tracking-tighter italic">{formatKhr(totals.bankKhr)}</div>
                   </div>
                </div>
                <div className="text-right">
                   <TrendingDown className="h-8 w-8 text-white/20" />
                </div>
             </div>
          </Card>
      </div>

      {/* Main Content */}
      <Card className="rounded-[2.5rem] border-gray-100 shadow-sm bg-white">
        <div className="p-6 sm:p-8 border-b border-gray-50 flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-4 w-full lg:w-auto">
             <div className="h-12 w-12 rounded-2xl bg-gray-50 flex items-center justify-center shrink-0">
                <Receipt className="h-6 w-6 text-gray-400" />
             </div>
             <div>
                <h2 className="text-lg font-black text-gray-900">{filteredExpenses.length} {t('items')}</h2>
                <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">{t('expense_list')}</div>
             </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
             <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                <SelectTrigger className="w-full sm:w-[200px] h-12 rounded-xl border-gray-100 bg-gray-50/50 font-bold focus:bg-white transition-all">
                   <div className="flex items-center gap-2 text-gray-600 w-full text-left">
                       <Filter className="h-4 w-4 shrink-0" />
                       <span className="truncate flex-1">{paymentFilter === 'all' ? t('all_methods') : paymentFilter === 'cash' ? t('cash') : paymentFilter}</span>
                   </div>
                </SelectTrigger>
                <SelectContent className="rounded-xl border-gray-100 font-bold z-[100]" position="popper">
                    <SelectItem value="all">{t('all_methods')}</SelectItem>
                    <SelectItem value="cash">{t('cash')}</SelectItem>
                    <SelectItem value="ABA Bank">ABA Bank</SelectItem>
                    <SelectItem value="ACLEDA Bank">ACLEDA Bank</SelectItem>
                    <SelectItem value="Wing">Wing</SelectItem>
                    <SelectItem value="TrueMoney">TrueMoney</SelectItem>
                    <SelectItem value="PiPay">PiPay</SelectItem>
                    <SelectItem value="Other Bank">{t('other_bank')}</SelectItem>
                </SelectContent>
             </Select>

             <div className="relative w-full sm:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input 
                  placeholder={t('search_placeholder')}
                  className="pl-12 h-12 rounded-xl border-gray-100 bg-gray-50/50 focus:bg-white transition-all font-bold"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
             </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50/50">
              <TableRow className="hover:bg-transparent border-gray-50">
                <TableHead className="w-[40%] px-8 h-14 font-black text-[10px] uppercase tracking-widest text-gray-400">{t('expense_name')}</TableHead>
                <TableHead className="px-6 font-black text-[10px] uppercase tracking-widest text-gray-400">{t('actual_expense')}</TableHead>
                <TableHead className="px-6 font-black text-[10px] uppercase tracking-widest text-gray-400">{t('payment_method')}</TableHead>
                <TableHead className="px-6 font-black text-[10px] uppercase tracking-widest text-gray-400">{t('invoice_number')}</TableHead>
                <TableHead className="w-[100px] text-right px-8"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredExpenses.length > 0 ? (
                filteredExpenses.map((expense) => (
                  <TableRow key={expense.id} className="group hover:bg-gray-50/50 transition-colors border-gray-50">
                    <TableCell className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-xl bg-gray-50 flex items-center justify-center shrink-0 group-hover:bg-white transition-colors">
                          <Receipt className="h-4 w-4 text-gray-300" />
                        </div>
                        <div className="space-y-0.5">
                          <div className="font-bold text-gray-900 text-sm sm:text-base">{expense.name}</div>
                          {expense.note && <div className="text-[10px] font-medium text-gray-400 italic line-clamp-1">{expense.note}</div>}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-6 font-black text-gray-900 text-sm">
                       {expense.currency === 'USD' ? formatUsd(expense.actualAmount) : formatKhr(expense.actualAmount)}
                    </TableCell>
                    <TableCell className="px-6 py-6">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-50 rounded-lg text-[10px] font-black text-gray-400 uppercase tracking-tight">
                            {expense.paymentMethod === 'cash' ? t('cash') : (expense.paymentMethod || t('cash'))}
                        </div>
                    </TableCell>
                    <TableCell className="px-6 py-6">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-50 rounded-lg text-[10px] font-black text-gray-400 uppercase tracking-tight">
                            {expense.invoiceNumber || t('tba')}
                        </div>
                    </TableCell>
                    <TableCell className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-9 w-9 rounded-xl hover:bg-amber-50 hover:text-amber-600"
                          onClick={() => setEditingExpense(expense)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-9 w-9 rounded-xl hover:bg-red-50 hover:text-red-600"
                          onClick={() => handleDeleteExpense(expense.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-64 text-center">
                    <div className="flex flex-col items-center justify-center gap-3 opacity-20">
                      <div className="h-16 w-16 bg-gray-100 rounded-3xl flex items-center justify-center">
                        <Receipt className="h-8 w-8" />
                      </div>
                      <span className="font-black text-xs uppercase tracking-widest">{t('no_records_found')}</span>
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
