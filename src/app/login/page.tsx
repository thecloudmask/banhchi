"use client";

import { useState } from "react";
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
  const { signIn, signInWithGoogle } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();

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

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <div className="w-full bg-gray-100 shadow-lg p-4 rounded-lg max-w-sm space-y-8 text-center">
        <div>
          <div className="inline-flex h-16 w-16 bg-white border border-zinc-200 shadow-md rounded-2xl items-center justify-center overflow-hidden mb-4 p-2">
            <img src="/SIDETH-THEAPKA.png" alt="Logo" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-2xl font-black text-zinc-900 tracking-tight">Admin Access</h1>
        </div>

        <div className="space-y-6">
          <Button 
            onClick={handleGoogleLogin}
            disabled={googleLoading || loading}
            variant="outline"
            className="w-full h-11 border-zinc-300 rounded-lg font-bold text-zinc-900 hover:bg-zinc-50 transition-none shadow-none"
          >
            {googleLoading ? <Loader2 className="h-4 w-4 animate-spin text-zinc-600" /> : "Sign in with Google"}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-zinc-200" /></div>
            <div className="relative flex justify-center text-xs"><span className="bg-gray-100 px-3 text-zinc-600 font-bold uppercase tracking-wider">or sign in with email</span></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-black uppercase tracking-widest text-zinc-900 ml-0.5">Email</Label>
                <Input
                  type="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading || googleLoading}
                  required
                  className="h-11 rounded-lg border-zinc-300 shadow-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary text-zinc-900 font-medium placeholder:text-zinc-400"
                />
              </div>
              
              <div className="space-y-1.5">
                <Label className="text-xs font-black uppercase tracking-widest text-zinc-900 ml-0.5">Password</Label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading || googleLoading}
                  required
                  className="h-11 rounded-lg border-zinc-300 shadow-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary text-zinc-900 font-medium placeholder:text-zinc-400"
                />
              </div>
            </div>
            
            <Button type="submit" className="w-full h-11 rounded-lg font-black text-sm uppercase tracking-widest shadow-md shadow-primary/10" disabled={loading || googleLoading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin text-white" /> : "Authorize Access"}
            </Button>
          </form>
        </div>

        <div className="pt-6">
          <Link href="/" className="text-xs font-black uppercase tracking-widest text-zinc-600 hover:text-primary transition-colors">
            ← Registry
          </Link>
        </div>
      </div>
    </div>
  );
}
