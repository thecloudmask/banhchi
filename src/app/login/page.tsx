"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import { useLanguage } from "@/providers/language-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Chrome, Phone } from "lucide-react";
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
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      setLoading(true);
      await signIn(email, password);
      document.cookie = "auth_session=true; path=/; max-age=86400; SameSite=Strict";
      toast.success("Login successful!");
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
      toast.success("Login successful!");
      router.replace("/admin");
    } catch (error: any) {
      console.error(error);
      toast.error("Google login failed");
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-secondary/30 p-4 selection:bg-primary/10">
      <Card className="w-full max-w-md border border-border bg-card rounded-3xl shadow-sm overflow-hidden">
        <CardHeader className="space-y-6 p-12 pb-8 text-center bg-primary text-primary-foreground">
          <div className="flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-background text-primary font-black text-3xl shadow-sm">
              B
            </div>
          </div>
          <div>
            <CardTitle className="text-4xl font-black tracking-tight leading-tight italic">Admin Portal</CardTitle>
            <CardDescription className="text-primary-foreground/60 text-base font-medium mt-2">
              Management access for Banhchi
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="p-12 space-y-10">
          {/* Quick Login for Elders */}
          <div className="space-y-4">
             <Button 
               type="button" 
               variant="outline" 
               className="w-full h-14 rounded-xl text-base font-bold gap-3 border-border hover:bg-secondary group"
               onClick={handleGoogleLogin}
               disabled={googleLoading || loading}
             >
               {googleLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : (
                 <>
                   <div className="h-10 w-10 flex items-center justify-center bg-secondary rounded-xl group-hover:bg-white transition-colors">
                      <Chrome className="h-6 w-6 text-red-500" />
                   </div>
                   Continue with Google
                 </>
               )}
             </Button>

             <div className="relative py-4">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
                <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest"><span className="bg-card px-4 text-muted-foreground/40">Or Email Access</span></div>
             </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">Email Address</Label>
                <Input
                  type="email"
                  placeholder="admin@banhchi.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading || googleLoading}
                  required
                  className="h-14 rounded-2xl border-border bg-secondary/20 focus:bg-background transition-all px-6 font-bold"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">Secret Password</Label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading || googleLoading}
                  required
                  className="h-14 rounded-2xl border-border bg-secondary/20 focus:bg-background transition-all px-6 font-bold"
                />
              </div>
            </div>
            
            <Button type="submit" className="w-full h-14 rounded-xl text-lg font-black shadow-sm" disabled={loading || googleLoading}>
              {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : "Sign In to Dashboard"}
            </Button>
          </form>

          <p className="text-center text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-40">
             Elder Friendly Edition
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
