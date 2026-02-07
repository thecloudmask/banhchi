"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ShieldAlert, RotateCcw } from "lucide-react";
import Link from "next/link";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-8 text-center space-y-8">
      <div className="h-20 w-20 rounded-3xl bg-zinc-100 flex items-center justify-center">
        <ShieldAlert className="h-10 w-10 text-zinc-400" />
      </div>
      
      <div className="space-y-2">
        <h2 className="text-2xl font-black tracking-tighter">Dashboard Error</h2>
        <p className="text-muted-foreground text-sm max-w-sm mx-auto font-medium">
          An unexpected error occurred while managing your events. Our team has been notified.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Button 
          onClick={() => reset()} 
          size="lg"
          className="rounded-2xl font-black h-12 px-8"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Reload Dashboard
        </Button>
        <Button 
          variant="outline" 
          asChild
          size="lg"
          className="rounded-2xl font-black h-12 px-8 border-zinc-200"
        >
          <Link href="/admin">Return to Safety</Link>
        </Button>
      </div>
    </div>
  );
}
