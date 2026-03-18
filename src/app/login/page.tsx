"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/providers/auth-provider";
import { useLanguage } from "@/providers/language-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Chrome } from "lucide-react";
import { toast } from "sonner";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const { signIn, signInWithGoogle, user, loading: authLoading } = useAuth();
    const { t } = useLanguage();
    const router = useRouter();

    useEffect(() => {
        if (!authLoading && user) {
            router.replace("/admin");
        }
    }, [user, authLoading, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) return;

        try {
            setLoading(true);
            await signIn(email, password);
            document.cookie = "auth_session=true; path=/; max-age=86400; SameSite=Strict";
            router.replace("/admin");
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Invalid credentials");
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        try {
            setGoogleLoading(true);
            await signInWithGoogle();
            document.cookie = "auth_session=true; path=/; max-age=86400; SameSite=Strict";
            router.replace("/admin");
        } catch (error: any) {
            console.error(error);
            toast.error("Authentication failed");
        } finally {
            setGoogleLoading(false);
        }
    };

    // Prevent flash: If we are still checking auth, or if we have a user (redirecting)
    if (authLoading || user) {
        return null;
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4 font-kantumruy">
            <div className="w-full bg-card border border-border shadow-2xl p-8 rounded-[2rem] max-w-sm space-y-8 text-center animate-in fade-in zoom-in-95 duration-500">
                <div>
                    <div className="inline-flex h-20 w-20 bg-muted/50 border border-border shadow-xl rounded-2xl items-center justify-center overflow-hidden mb-6 p-3 group hover:scale-105 transition-transform">
                        <img src="/MORDOK-THEAPKA.png" alt="Logo" className="w-full h-full object-contain dark:brightness-200" />
                    </div>
                    <h1 className="text-2xl font-black text-foreground uppercase">{t("admin_access")}</h1>
                    <div className="h-1 w-12 bg-primary mx-auto mt-4 rounded-full" />
                </div>

                <div className="space-y-6">
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
                        <div className="relative flex justify-center text-[10px]"><span className="bg-card px-4 text-muted-foreground font-bold uppercase">{t("sign_in_email")}</span></div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5 text-left">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">{t("email")}</Label>
                                <Input
                                    type="email"
                                    placeholder="admin@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={loading || googleLoading}
                                    required
                                    className="h-12 rounded-xl border-border bg-muted/50 shadow-none focus-visible:ring-1 focus-visible:ring-[#f41f4d] focus-visible:border-[#f41f4d] text-foreground font-medium placeholder:text-muted-foreground/30"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">{t("password")}</Label>
                                <Input
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={loading || googleLoading}
                                    required
                                    className="h-12 rounded-xl border-border bg-muted/50 shadow-none focus-visible:ring-1 focus-visible:ring-[#f41f4d] focus-visible:border-[#f41f4d] text-foreground font-medium placeholder:text-muted-foreground/30"
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-12 rounded-xl font-black text-xs uppercase shadow-xl shadow-primary/20 bg-primary hover:bg-primary/90 text-primary-foreground transition-all active:scale-[0.98]"
                            disabled={loading || googleLoading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    {t('loading')}
                                </>
                            ) : t('authorize_access')}
                        </Button>
                    </form>
                </div>

                <div className="pt-4">
                    <Link href="/" className="text-[10px] font-black uppercase text-slate-600 hover:text-primary transition-colors flex items-center justify-center gap-2">
                        <span>←</span> {t('back_to_registry')}
                    </Link>
                </div>
            </div>
        </div>
    );
}
