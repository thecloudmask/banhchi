"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { getAllContents, deleteContent, Content } from "@/services/content.service";
import { Calendar, Loader2, Pencil, Trash2, Search, Plus, FileText, Image as ImageIcon, LayoutTemplate } from "lucide-react";
import { formatDate, cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/providers/language-provider";
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
  const { t } = useLanguage();

  const fetchContents = async () => {
    try {
      setLoading(true);
      const data = await getAllContents();
      setContents(data);
    } catch (error: any) {
      console.error(error);
      toast.error(t('error'));
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
      toast.success(`${t('toast_updated')}: ${title}`);
      fetchContents();
    } catch (error) {
      toast.error(t('error'));
    }
  };

  const filteredContents = contents.filter(c => 
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!user) return null;

  return (
    <div className="space-y-12">
      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="flex items-start gap-4">
             <Button variant="outline" size="icon" onClick={() => window.history.back()} className="rounded-xl border-zinc-200 h-11 w-11">
                <LayoutTemplate className="h-5 w-5 text-zinc-400" />
             </Button>
            <div className="space-y-1">
               <h1 className="text-3xl font-black tracking-tighter">{t('contents')}</h1>
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{t('manage_articles')}</p>
            </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-300" />
            <Input 
              placeholder={t('search_placeholder')} 
              className="h-11 pl-11 rounded-xl border-zinc-200 bg-white shadow-sm font-bold text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button 
            onClick={() => router.push("/admin/posts/create/")}
            className="h-11 rounded-xl cursor-pointer px-6 font-bold shadow-lg shadow-primary/20"
          >
            <Plus className="mr-2 h-4 w-4" />
            {t('create_content')}
          </Button>
        </div>
      </div>

      {!loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {contents.length === 0 ? (
            <div className="col-span-full py-32 text-center">
               <div className="h-20 w-20 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FileText className="h-8 w-8 text-zinc-300" />
               </div>
               <h3 className="text-xl font-black mb-2">{t('no_contents')}</h3>
               <p className="text-zinc-400 font-medium">{t('create_first_content')}</p>
            </div>
          ) : (
            filteredContents.map((content) => (
              <Card key={content.id} className="group border border-zinc-100 bg-white shadow-sm rounded-2xl overflow-hidden flex flex-col hover:shadow-md transition-all p-0">
                <div 
                  onClick={() => router.push(`/admin/posts/${content.id}/`)} 
                  className="block relative aspect-4/3 overflow-hidden bg-zinc-50 border-b border-zinc-50 cursor-pointer"
                >
                  {content.thumbnail || (content.images && content.images.length > 0) ? (
                    <Image 
                      src={compressImage(content.thumbnail || content.images![0], 'thumbnail')} 
                      alt={content.title} 
                      fill
                      className="object-cover object-top group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-zinc-50">
                      <ImageIcon className="h-10 w-10 text-zinc-200" />
                    </div>
                  )}
                  <div className="absolute top-4 left-4 flex gap-2">
                    <span className={cn(
                      "px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest shadow-sm",
                      content.type === 'agenda' ? "bg-purple-500 text-white" : 
                      content.type === 'announcement' ? "bg-amber-500 text-white" : 
                      content.type === 'poster' ? "bg-pink-600 text-white" : "bg-blue-500 text-white"
                    )}>
                      {content.type === 'article' ? t('article_blog') : 
                       content.type === 'agenda' ? t('agenda_poster') : 
                       content.type === 'announcement' ? t('announcement') : 
                       t('poster')}
                    </span>
                    {content.eventId && (
                        <span className="px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest shadow-sm bg-zinc-900 text-white">{t('linked')}</span>
                    )}
                  </div>
                </div>
                
                <div className="p-6 flex-1 flex flex-col">
                  <div 
                    onClick={() => router.push(`/admin/posts/${content.id}/`)} 
                    className="block group-hover:text-primary transition-colors mb-3 cursor-pointer"
                  >
                    <h3 className="text-lg font-black tracking-tight leading-tight line-clamp-2">
                       {content.title}
                    </h3>
                  </div>
                  
                  <p className="text-zinc-500 text-sm line-clamp-2 mb-6 font-medium">
                      {content.description || t('no_description')}
                  </p>

                  <div className="mt-auto flex items-center justify-between pt-4 border-t border-zinc-50">
                    <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                        {formatDate(content.createdAt)}
                    </div>
                    
                    <div className="flex gap-1">
                      <Button 
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push(`/admin/posts/${content.id}/`)}
                        className="h-8 w-8 rounded-lg cursor-pointer flex items-center justify-center text-zinc-300 hover:text-primary hover:bg-zinc-50 transition-colors"
                        title={t('edit')}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-zinc-300 hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="rounded-2xl border border-border p-8 shadow-md">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-xl font-black">{t('delete_confirm')}</AlertDialogTitle>
                            <AlertDialogDescription className="text-zinc-500 font-medium">
                              {t('delete_confirm_desc')}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter className="mt-6">
                            <AlertDialogCancel className="h-11 rounded-lg font-bold">{t('cancel')}</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteContent(content.id, content.title)} className="h-11 rounded-lg bg-destructive text-white font-black">{t('delete')}</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      ) : (
        <div className="flex justify-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
        </div>
      )}
    </div>
  );
}
