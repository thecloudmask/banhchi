"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import { useLanguage } from "@/providers/language-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { addContent, Content } from "@/services/content.service";
import { getEvents } from "@/services/event.service";
import { Event } from "@/types";
import { Loader2, ArrowLeft, Plus, Trash2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { uploadToCloudinary, uploadMultipleToCloudinary } from "@/lib/cloudinary";
import Image from "next/image";
import RichTextEditor from "@/components/rich-text-editor";

export default function CreateContentClient() {
  const { user } = useAuth();
  const router = useRouter();
  const { t } = useLanguage();
  
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  
  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<string>("article");
  const [customType, setCustomType] = useState("");
  const [eventId, setEventId] = useState<string>("none");
  const [body, setBody] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  // Dynamic Fields
  const [agendaItems, setAgendaItems] = useState<{ time: string; description: string }[]>([{ time: "", description: "" }]);
  const [committeeItems, setCommitteeItems] = useState<{ role: string; members: string }[]>([{ role: "", members: "" }]);

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const data = await getEvents();
        setEvents(data);
      } catch (error) {
        console.error("Failed to load events");
      }
    };
    if (user) loadEvents();
  }, [user]);

  const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setImages(prev => [...prev, ...newFiles]);
      
      const newPreviews = newFiles.map(file => URL.createObjectURL(file));
      setImagePreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSave = async () => {
    if (!title.trim()) {
        toast.error(t('title_required'));
        return;
    }

    if (type === 'custom' && !customType.trim()) {
        toast.error(t('enter_custom_category') || "Please enter custom category");
        return;
    }

    try {
      setLoading(true);
      
      const uploadedImageUrls = await uploadMultipleToCloudinary(images, "banhchi/contents");

      // Filter empty items
      const cleanAgenda = agendaItems.filter(item => item.time.trim() || item.description.trim());
      const cleanCommittee = committeeItems
        .filter(item => item.role.trim() || item.members.trim())
        .map(item => ({ 
          role: item.role.trim(), 
          members: item.members.split(',').map(m => m.trim()).filter(Boolean) 
        }));

      const newItem: Omit<Content, "id" | "createdAt" | "updatedAt"> = {
        title: title.trim(),
        description: description.trim(),
        body,
        type: type === 'custom' ? customType.trim() : type,
        ...(eventId !== "none" ? { eventId } : {}),
        ...(uploadedImageUrls.length > 0 ? { 
            thumbnail: uploadedImageUrls[0],
            images: uploadedImageUrls 
        } : {}),
        status: "published",
        author: {
            name: user?.displayName || "Admin",
            ...(user?.photoURL ? { photoURL: user.photoURL } : {})
        },
        ...(cleanAgenda.length > 0 ? { agenda: [{ items: cleanAgenda }] } : {}),
        ...(cleanCommittee.length > 0 ? { committee: cleanCommittee } : {})
      };

      await addContent(newItem);
      toast.success(t('content_created'));
      router.push("/admin/contents/");
    } catch (error) {
      console.error(error);
      toast.error(t('failed_create_content'));
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()} className="rounded-xl border-zinc-200">
           <ArrowLeft className="h-5 w-5 text-zinc-500" />
        </Button>
        <div>
           <h1 className="text-2xl font-black tracking-tight">{t('create_content')}</h1>
           <p className="text-sm font-medium text-zinc-400">{t('create_content_desc')}</p>
        </div>
      </div>

      <div className="grid gap-8">
        {/* Main Info */}
        <Card className="rounded-2xl border-zinc-200 shadow-sm">
            <CardHeader>
                <CardTitle className="text-lg font-black uppercase tracking-widest text-zinc-400">{t('general_info')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <Label className="font-bold">{t('content_title')}</Label>
                    <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t('enter_name_placeholder')} className="h-12 rounded-xl font-bold text-lg" />
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                        <Label className="font-bold flex items-center justify-between">
                            {t('content_type')} <span className="text-xs text-zinc-400 font-normal">({t('select_best_fit')})</span>
                        </Label>
                        <Select value={type} onValueChange={(v: any) => setType(v)}>
                            <SelectTrigger className="h-12 rounded-xl">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                                <SelectItem value="article">
                                    <div className="flex flex-col items-start gap-1 py-1">
                                        <span className="font-bold">{t('article_blog')}</span>
                                        <span className="text-xs text-zinc-400">{t('article_blog_desc')}</span>
                                    </div>
                                </SelectItem>
                                <SelectItem value="agenda">
                                    <div className="flex flex-col items-start gap-1 py-1">
                                        <span className="font-bold">{t('agenda_poster')}</span>
                                        <span className="text-xs text-zinc-400">{t('agenda_poster_desc')}</span>
                                    </div>
                                </SelectItem>
                                <SelectItem value="announcement">
                                    <div className="flex flex-col items-start gap-1 py-1">
                                        <span className="font-bold">{t('announcement')}</span>
                                        <span className="text-xs text-zinc-400">{t('announcement_desc')}</span>
                                    </div>
                                </SelectItem>
                                {/* <SelectItem value="poster">
                                    <div className="flex flex-col items-start gap-1 py-1">
                                        <span className="font-bold">{t('poster')}</span>
                                        <span className="text-xs text-zinc-400">{t('poster_desc')}</span>
                                    </div>
                                </SelectItem> */}
                                <SelectItem value="custom">
                                    <div className="flex flex-col items-start gap-1 py-1">
                                        <span className="font-bold">{t('custom')}</span>
                                        <span className="text-xs text-zinc-400">{t('enter_custom_category')}</span>
                                    </div>
                                </SelectItem>
                            </SelectContent>
                        </Select>

                        {type === 'custom' && (
                            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                <Input 
                                    placeholder={t('enter_custom_category')} 
                                    className="h-12 border-primary/20 border-2 rounded-xl font-bold px-4"
                                    value={customType}
                                    onChange={(e) => setCustomType(e.target.value)}
                                />
                            </div>
                        )}
                    </div>

                    <div className="space-y-3">
                        <Label className="font-bold flex items-center justify-between">
                            {t('link_to_event')} <span className="text-xs text-zinc-400 font-normal">({t('optional')})</span>
                        </Label>
                        <Select value={eventId} onValueChange={setEventId}>
                            <SelectTrigger className="h-12 rounded-xl">
                                <SelectValue placeholder={t('search_placeholder')} />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                                <SelectItem value="none">{t('no_linking')}</SelectItem>
                                {events.map(e => (
                                    <SelectItem key={e.id} value={e.id}>{e.title}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label className="font-bold">{t('short_description')}</Label>
                    <p className="text-xs text-zinc-400">{t('short_description_desc')}</p>
                    <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder={t('short_description')} className="rounded-xl resize-none h-24" />
                </div>

                <div className="space-y-4">
                    <Label className="font-bold">{t('content_images') || 'Images'}</Label>
                    <p className="text-xs text-zinc-400">{t('thumbnail_desc')}</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {imagePreviews.map((preview, index) => (
                            <div key={index} className="relative aspect-video bg-zinc-100 rounded-xl overflow-hidden border border-zinc-200 group">
                                <Image src={preview} alt={`Preview ${index}`} fill className="object-cover" />
                                <button 
                                    onClick={() => removeImage(index)} 
                                    className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 hover:bg-red-500 transition-all"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        ))}
                        
                        <label className="relative aspect-video bg-zinc-50 rounded-xl overflow-hidden border-2 border-dashed border-zinc-200 flex flex-col items-center justify-center cursor-pointer hover:bg-zinc-100 transition-colors">
                            <Upload className="h-6 w-6 text-zinc-300 mb-2" />
                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{t('add_image') || 'Add Image'}</span>
                            <input 
                                type="file" 
                                multiple 
                                onChange={handleImagesChange} 
                                accept="image/*" 
                                className="hidden" 
                            />
                        </label>
                    </div>
                </div>
            </CardContent>
        </Card>

        {/* Dynamic Agenda */}
        {type === 'agenda' && (
        <Card className="rounded-2xl border-zinc-200 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="text-lg font-black uppercase tracking-widest text-zinc-400">{t('agenda_schedule')}</CardTitle>
                    <CardDescription>{t('agenda_desc')}</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => setAgendaItems([...agendaItems, { time: "", description: "" }])} className="rounded-lg">
                    <Plus className="h-4 w-4 mr-2" /> {t('add_item')}
                </Button>
            </CardHeader>
            <CardContent className="space-y-4">
                {agendaItems.map((item, index) => (
                    <div key={index} className="flex gap-4 items-start">
                        <Input 
                           placeholder={t('time_placeholder')}
                           value={item.time} 
                           onChange={(e) => {
                               const newItems = [...agendaItems];
                               newItems[index].time = e.target.value;
                               setAgendaItems(newItems);
                           }} 
                           className="w-40 rounded-xl"
                        />
                        <Input 
                           placeholder={t('activity_desc')}
                           value={item.description} 
                           onChange={(e) => {
                               const newItems = [...agendaItems];
                               newItems[index].description = e.target.value;
                               setAgendaItems(newItems);
                           }} 
                           className="flex-1 rounded-xl"
                        />
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => {
                                const newItems = agendaItems.filter((_, i) => i !== index);
                                setAgendaItems(newItems);
                            }}
                            className="text-zinc-400 hover:text-destructive"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                ))}
            </CardContent>
        </Card>
        )}

        {/* Dynamic Committee */}
        {type === 'agenda' && (
        <Card className="rounded-2xl border-zinc-200 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                     <CardTitle className="text-lg font-black uppercase tracking-widest text-zinc-400">{t('committee_organizers')}</CardTitle>
                     <CardDescription>{t('committee_desc')}</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => setCommitteeItems([...committeeItems, { role: "", members: "" }])} className="rounded-lg">
                    <Plus className="h-4 w-4 mr-2" /> {t('add_group')}
                </Button>
            </CardHeader>
            <CardContent className="space-y-4">
                {committeeItems.map((item, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start p-4 bg-zinc-50 rounded-xl relative">
                         <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => {
                                const newItems = committeeItems.filter((_, i) => i !== index);
                                setCommitteeItems(newItems);
                            }}
                            className="absolute top-2 right-2 h-6 w-6 text-zinc-400 hover:text-destructive"
                        >
                            <Trash2 className="h-3 w-3" />
                        </Button>
                        <div className="space-y-2">
                             <Label className="text-xs uppercase font-bold text-zinc-400">{t('role_label')}</Label>
                             <Input 
                                placeholder={t('role_placeholder')}
                                value={item.role} 
                                onChange={(e) => {
                                    const newItems = [...committeeItems];
                                    newItems[index].role = e.target.value;
                                    setCommitteeItems(newItems);
                                }} 
                                className="rounded-xl bg-white"
                             />
                        </div>
                        <div className="space-y-2">
                             <Label className="text-xs uppercase font-bold text-zinc-400">{t('members_label')}</Label>
                             <Textarea 
                                placeholder={t('members_placeholder')}
                                value={item.members} 
                                onChange={(e) => {
                                    const newItems = [...committeeItems];
                                    newItems[index].members = e.target.value;
                                    setCommitteeItems(newItems);
                                }} 
                                className="rounded-xl bg-white resize-none"
                             />
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
        )}

        {/* Main Body */}
        <Card className="rounded-2xl border-zinc-200 shadow-sm">
            <CardHeader>
                <CardTitle className="text-lg font-black uppercase tracking-widest text-zinc-400">{t('full_content_body')}</CardTitle>
                <CardDescription>{t('full_content_desc')}</CardDescription>
            </CardHeader>
            <CardContent>
                 <RichTextEditor 
                    value={body} 
                    onChange={setBody} 
                    placeholder={t('full_content_desc')} 
                     className="min-h-100" 
                 />
            </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
             <Button variant="ghost" type="button" onClick={() => router.back()} className="h-12 px-8 rounded-xl font-bold text-zinc-500">
                {t('cancel')}
             </Button>
             <Button onClick={handleSave} disabled={loading} className="h-12 px-8 rounded-xl font-bold text-lg min-w-50">
                {loading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
                {loading ? t('saving_content') : t('publish_content')}
             </Button>
        </div>
      </div>
    </div>
  );
}
