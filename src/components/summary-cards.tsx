import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Users } from "lucide-react";

interface SummaryCardsProps {
  totalUsd: number;
  totalKhr: number;
  totalGuests: number;
}

export function SummaryCards({ totalUsd, totalKhr, totalGuests }: SummaryCardsProps) {
  // Format currency
  const formatUsd = (amount: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  
  const formatKhr = (amount: number) => 
    new Intl.NumberFormat('km-KH', { style: 'currency', currency: 'KHR' }).format(amount);

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total USD</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatUsd(totalUsd)}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Riel</CardTitle>
          <span className="text-sm font-bold text-muted-foreground">៛</span>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatKhr(totalKhr)}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Guests</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalGuests}</div>
        </CardContent>
      </Card>
    </div>
  );
}
