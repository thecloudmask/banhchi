import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Event } from "@/types";
import { updateEvent } from "@/services/event.service";
import { Share2, RefreshCw, Copy, Check, Lock, Loader2 } from "lucide-react";
import { useLanguage } from "@/providers/language-provider";
import { toast } from "sonner";

export function TrackingReportDialog({
  event,
  onRefresh,
}: {
  event: Event;
  onRefresh: () => void;
}) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Local state for edits
  const [pin, setPin] = useState(event.trackingPin || "");

  const handleGenerateLink = async () => {
    try {
      setLoading(true);
      const newToken =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : Math.random().toString(36).substring(2, 15);
      await updateEvent(event.id, {
        trackingToken: newToken,
        trackingPin: pin || "",
      });
      toast.success(t("toast_updated"));
      onRefresh();
    } catch {
      toast.error(t("error") || "Error generating link");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePin = async () => {
    try {
      setLoading(true);
      await updateEvent(event.id, {
        trackingPin: pin || "",
      });
      toast.success(t("toast_updated"));
      onRefresh();
    } catch {
      toast.error(t("error") || "Error updating PIN");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!event.trackingToken) return;
    const url = `${window.location.origin}/tracking/${event.trackingToken}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success(t("link_copied"));
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-9 w-full cursor-pointer rounded-md border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary font-bold gap-2 text-xs uppercase px-4 transition-all"
        >
          <Share2 className="h-4 w-4" />
          {t("share_tracking_report")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md rounded-2xl border-none shadow-md p-6 sm:p-8 bg-zinc-50 dark:bg-zinc-950">
        <DialogHeader className="mb-6">
          <DialogTitle className="text-xl font-black text-foreground flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Share2 className="w-5 h-5 text-primary" />
            </div>
            {t("share_tracking_report")}
          </DialogTitle>
          <DialogDescription className="text-sm font-medium text-muted-foreground mt-4 leading-relaxed">
            {t("tracking_description")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {!event.trackingToken ? (
            <div className="flex flex-col items-center justify-center py-6 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 border-dashed">
              <Button
                onClick={() => handleGenerateLink()}
                disabled={loading}
                className="rounded-xl px-8 font-bold"
              >
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {t("generate_tracking_link")}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-muted-foreground ml-1">
                  {t("tracking_link")}
                </label>
                <div className="flex gap-2 items-center">
                  <Input
                    readOnly
                    value={`${window.location.origin}/tracking/${event.trackingToken}`}
                    className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-xl font-mono text-xs opacity-70"
                  />
                  <Button
                    onClick={handleCopy}
                    variant="secondary"
                    className="rounded-xl h-10 w-10 p-0 shrink-0 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <Copy className="w-4 h-4 text-zinc-500" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
                <label className="text-xs font-bold uppercase text-muted-foreground ml-1 flex items-center gap-2">
                  <Lock className="w-3 h-3" />
                  {t("tracking_pin")} (Optional)
                </label>
                <div className="flex gap-2">
                  <Input
                    placeholder="****"
                    maxLength={4}
                    value={pin}
                    onChange={(e) =>
                      setPin(e.target.value.replace(/[^0-9]/g, ""))
                    }
                    className="flex-1 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-xl tracking-[0.2em] font-mono text-center"
                  />
                  <Button
                    onClick={handleUpdatePin}
                    disabled={loading || pin === event.trackingPin}
                    className="rounded-xl font-bold px-6"
                  >
                    {loading && (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    )}
                    {t("save")}
                  </Button>
                </div>
              </div>

              <div className="pt-6">
                <Button
                  onClick={() => handleGenerateLink()}
                  disabled={loading}
                  variant="ghost"
                  className="w-full text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl font-bold"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  {t("reset_tracking_link")}
                </Button>
                <p className="text-[10px] text-center text-muted-foreground mt-2 px-4 leading-relaxed font-medium">
                  ការបង្កើតតំណភ្ជាប់ថ្មី នឹងធ្វើឱ្យតំណភ្ជាប់ចាស់លែងដំណើរការ
                  (សម្រាប់ការការពារទិន្នន័យបែកធ្លាយ)។
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
