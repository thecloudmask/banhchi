"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, RotateCcw } from "lucide-react";
import Link from "next/link";

export default function PublicError({
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
      <div className="h-20 w-20 rounded-3xl bg-destructive/5 flex items-center justify-center">
        <AlertCircle className="h-10 w-10 text-destructive" />
      </div>
      
      <div className="space-y-2">
        <h2 className="text-2xl font-black tracking-tighter">Something went wrong</h2>
        <p className="text-muted-foreground text-sm max-w-xs mx-auto">
          We couldn't load the event information. Please try refreshing the page.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Button 
          onClick={() => reset()} 
          size="lg"
          className="rounded-2xl font-black h-12 px-8"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
        <Button 
          variant="outline" 
          asChild
          size="lg"
          className="rounded-2xl font-black h-12 px-8 border-zinc-200"
        >
          <Link href="/">Back to Home</Link>
        </Button>
      </div>
    </div>
  );
}
