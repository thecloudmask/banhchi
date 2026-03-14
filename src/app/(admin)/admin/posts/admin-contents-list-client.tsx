"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { getAllContents, deleteContent, Content } from "@/services/content.service";
import { Calendar, Loader2, Pencil, Trash2, Search, Plus, FileText, Image as ImageIcon, LayoutTemplate } from "lucide-react";
import { formatDateTime, cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/providers/auth-provider";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import Image from "next/image";
import { compressImage } from "@/lib/cloudinary";

export default function AdminContentsListClient() {
  const router = useRouter();
  const { user } = useAuth();
  const [contents, setContents] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  // No internationalization needed

  const fetchContents = async () => {
    try {
      setLoading(true);
      const data = await getAllContents();
      setContents(data);
    } catch (error: any) {
      console.error(error);
      toast.error("បរាជ័យក្នុងការទាញយកទិន្នន័យ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchContents();
  }, [user]);

  const handleDeleteContent = async (id: string, title: string) => {
    try {
      await deleteContent(id);
      toast.success(`បានលុបមាតិកា៖ ${title}`);
      fetchContents();
    } catch (error) {
      toast.error("បរាជ័យក្នុងការលុបមាតិកា");
    }
  };

  const filteredContents = contents.filter(c => 
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!user) return null;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header & Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
           <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">{"មាតិកា"}</h1>
            <p className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-widest">{"គ្រប់គ្រងអត្ថបទ និងខ្លឹមសារដែលបានផ្សព្វផ្សាយ"}</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative w-full sm:w-60">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
            <Input 
              placeholder="ស្វែងរក..." 
              className="h-10 pl-9 rounded-md border-border bg-accent/30 text-foreground placeholder:text-muted-foreground/30 font-medium text-sm w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button 
            onClick={() => router.push("/admin/posts/create/")}
            className="h-10 rounded-md cursor-pointer px-6 font-bold text-xs uppercase tracking-wide bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/10 transition-all active:scale-95"
          >
            <Plus className="mr-2 h-4 w-4" />
            {"បង្កើតមាតិកាថ្មី"}
          </Button>
        </div>
      </div>

      {!loading ? (
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-3 pb-20">
          {contents.length === 0 ? (
            <div className="col-span-full py-32 text-center bg-card/40 border border-border border-dashed rounded-md animate-in fade-in zoom-in duration-700">
                <div className="h-16 w-16 bg-muted rounded-md flex items-center justify-center mx-auto mb-4">
                   <FileText className="h-7 w-7 text-muted-foreground/20" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-1">{"មិនមានមាតិកា"}</h3>
                <p className="text-muted-foreground text-sm">{"បង្កើតមាតិកាដំបូងរបស់អ្នក"}</p>
            </div>
          ) : (
            filteredContents.map((content) => (
              <div key={content.id} className="group border border-border bg-card/40 hover:bg-card rounded-md overflow-hidden flex flex-col transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 animate-in fade-in slide-in-from-bottom-2">
                <div 
                  onClick={() => router.push(`/admin/posts/${content.id}/`)} 
                  className="block relative aspect-16/10 overflow-hidden bg-muted cursor-pointer"
                >
                  {content.thumbnail || (content.images && content.images.length > 0) ? (
                    <Image 
                      src={compressImage(content.thumbnail || content.images![0], 'thumbnail')} 
                      alt={content.title} 
                      fill
                      className="object-cover object-top group-hover:scale-110 transition-all duration-1000 ease-out opacity-80 group-hover:opacity-100"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-muted/30">
                      <ImageIcon className="h-12 w-12 text-muted-foreground/20" />
                    </div>
                  )}
                  
                  {/* Category Badges */}
                  <div className="absolute top-3 left-3 flex flex-wrap gap-2 z-20">
                    <span className={cn(
                      "px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest shadow-lg backdrop-blur-md border",
                      content.type === 'wedding' ? "bg-rose-500/20 text-rose-600 border-rose-500/30 dark:bg-rose-600/30 dark:text-rose-200" : 
                      content.type === 'buddhist' ? "bg-orange-500/20 text-orange-600 border-orange-500/30 dark:bg-orange-600/30 dark:text-orange-200" : 
                      content.type === 'news' ? "bg-amber-500/20 text-amber-600 border-amber-500/30 dark:bg-amber-500/30 dark:text-amber-200" : 
                      content.type === 'update' ? "bg-blue-500/20 text-blue-600 border-blue-500/30 dark:bg-blue-600/30 dark:text-blue-200" : 
                      content.type === 'poster' ? "bg-pink-500/20 text-pink-600 border-pink-500/30 dark:bg-pink-600/30 dark:text-pink-200" : 
                      "bg-zinc-500/20 text-zinc-600 border-zinc-500/30 dark:bg-zinc-500/30 dark:text-zinc-200"
                    )}>
                      {content.type === 'news' ? "ព័ត៌មាន" : 
                       content.type === 'update' ? "បច្ចុប្បន្នភាព" : 
                       content.type === 'article' ? "អត្ថបទ" : 
                       content.type === 'wedding' ? "រចនាបថមង្គលការ" :
                       content.type === 'buddhist' ? "រចនាបថកម្មវិធីបុណ្យ" :
                       "ផ្សេងៗ"}
                    </span>
                  </div>
                </div>
                
                <div className="p-5 flex-1 flex flex-col">
                  <div 
                    onClick={() => router.push(`/admin/posts/${content.id}/`)} 
                    className="block hover:text-primary transition-all mb-3 cursor-pointer"
                  >
                    <h3 className="text-base font-bold tracking-tight leading-tight line-clamp-2 text-foreground group-hover:text-primary transition-colors">
                       {content.title}
                    </h3>
                  </div>
                  
                  <p className="text-muted-foreground/70 text-[11px] line-clamp-2 mb-5 font-medium leading-relaxed">
                      {content.description || "មិនមានការពិពណ៌នាបង្ហាញទេ"}
                  </p>

                  <div className="mt-auto flex items-center justify-between pt-4 border-t border-border">
                    <div className="flex flex-col">
                        <span className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-[0.2em] mb-0.5">ចេញផ្សាយ</span>
                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                            {formatDateTime(content.createdAt, false)}
                        </div>
                    </div>
                    
                    <div className="flex gap-1.5">
                      <Button 
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/admin/posts/${content.id}/`);
                        }}
                        className="h-8 w-8 rounded-md cursor-pointer flex items-center justify-center border border-border text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all"
                        title="កែប្រែ"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md border border-border cursor-pointer text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition-all">
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="rounded-md border-border bg-card text-foreground p-8 shadow-2xl animate-in zoom-in duration-300">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-xl font-bold tracking-tight">តើអ្នកប្រាកដទេ?</AlertDialogTitle>
                            <AlertDialogDescription className="text-muted-foreground text-sm pt-2">
                              សកម្មភាពនេះមិនអាចត្រឡប់ក្រោយបានទេ។ វានឹងលុបមាតិកានេះជាអចិន្ត្រៃយ៍ពីប្រព័ន្ធ។
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter className="mt-8 gap-3">
                            <AlertDialogCancel className="h-10 px-6 rounded-md font-bold text-xs bg-muted/30 border-border hover:bg-accent text-muted-foreground transition-all">បោះបង់</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteContent(content.id, content.title)} className="h-10 px-8 rounded-md bg-destructive hover:bg-destructive/90 text-white font-bold text-xs shadow-lg shadow-destructive/20 transition-all active:scale-95">លុបចេញ</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary opacity-40" />
        </div>
      )}
    </div>

  );
}
