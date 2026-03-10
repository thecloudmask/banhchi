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
import { updateContent, getContentById, Content, deleteField } from "@/services/content.service";
import { getEvents } from "@/services/event.service";
import { Event } from "@/types";
import { Loader2, ArrowLeft, Plus, Trash2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { uploadToCloudinary, uploadMultipleToCloudinary } from "@/lib/cloudinary";
import Image from "next/image";
import { useParams } from "next/navigation";
import RichTextEditor from "@/components/rich-text-editor";
import { compressImage } from "@/lib/cloudinary";

export default function EditContentClient() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  
  // Robustly determine ID using both params and window location (fallback for static export)
  const [id, setId] = useState<string | null>(null);

  useEffect(() => {
    // 1. Try to get from params
    if (params?.id) {
       const extractedId = Array.isArray(params.id) ? params.id[0] : params.id;
       if (extractedId) {
         setId(extractedId);
         return;
       }
    }
    
      // 2. Fallback: extract from URL if params is empty (happens with static export rewrites)
      if (typeof window !== 'undefined') {
         const path = window.location.pathname;
         // Expected path: /admin/posts/[ID]
         const parts = path.split('/').filter(Boolean);
         const postsIndex = parts.indexOf('posts');
         if (postsIndex !== -1 && parts[postsIndex + 1]) {
            const extractedId = parts[postsIndex + 1];
            // simple validation to avoid picking up sub-routes incorrectly if any
            if (extractedId && extractedId !== 'index.html' && extractedId !== 'create') {
               setId(extractedId);
            }
         }
      }
  }, [params]);

  const { t } = useLanguage();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  
  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<string>("article");
  const [customType, setCustomType] = useState("");
  const [eventId, setEventId] = useState<string>("none");
  const [body, setBody] = useState("");
  const [currentImageUrls, setCurrentImageUrls] = useState<string[]>([]);
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);

  // Dynamic Fields
  const [agendaGroups, setAgendaGroups] = useState<{ date: string; items: { time: string; description: string }[] }[]>([{ date: "", items: [{ time: "", description: "" }] }]);
  const [committeeItems, setCommitteeItems] = useState<{ role: string; members: string }[]>([{ role: "", members: "" }]);

  // Wedding Specific State
  const [groom, setGroom] = useState({ name: "", father: "", mother: "" });
  const [bride, setBride] = useState({ name: "", father: "", mother: "" });
  const [location, setLocation] = useState({ name: "", address: "", mapUrl: "" });
  const [weddingSchedule, setWeddingSchedule] = useState<any[]>([{
      id: "day_1",
      dayLabel: "",
      groups: [{
          id: "group_1",
          groupTitle: "",
          activities: [{ time: "", title: "", description: "" }]
      }]
  }]);
  const [footerContent, setFooterContent] = useState("");

  // Theme Detection
  const selectedEvent = events.find(e => e.id === eventId);
  const category = selectedEvent?.category || (['wedding', 'funeral', 'merit_making'].includes(type) ? type : 'default');

  const getDynamicLabels = () => {
    switch (category) {
      case 'wedding':
        return {
          titlePlaceholder: t('wedding_title_placeholder'),
          agendaTitle: t('wedding_agenda_title'),
          agendaDesc: t('wedding_agenda_desc'),
          committeeTitle: t('wedding_committee_title'),
          dateLabel: t('ceremony_day_label') || "Day / Ceremony Name",
          datePlaceholder: t('wedding_date_placeholder') || "e.g. Day 1 - Morning (Engagement)",
          roleLabel: t('wedding_role_label'),
          rolePlaceholder: t('wedding_role_placeholder'),
          membersPlaceholder: t('wedding_members_placeholder'),
        };
      case 'funeral':
        return {
          titlePlaceholder: t('funeral_title_placeholder'),
          agendaTitle: t('funeral_agenda_title'),
          agendaDesc: t('funeral_agenda_desc'),
          committeeTitle: t('funeral_committee_title'),
          dateLabel: t('funeral_day_label') || "Date / Rite",
          datePlaceholder: t('funeral_date_placeholder') || "e.g. Day 1 - Chanting",
          roleLabel: t('funeral_role_label'),
          rolePlaceholder: t('funeral_role_placeholder'),
          membersPlaceholder: t('funeral_members_placeholder'),
        };
      case 'merit_making':
        return {
          titlePlaceholder: t('merit_title_placeholder'),
          agendaTitle: t('merit_agenda_title'),
          agendaDesc: t('merit_agenda_desc'),
          committeeTitle: t('merit_committee_title'),
          dateLabel: t('merit_day_label') || "Ceremony Day",
          datePlaceholder: t('merit_date_placeholder') || "e.g. 1st Day (Afternoon)",
          roleLabel: t('merit_role_label'),
          rolePlaceholder: t('merit_role_placeholder'),
          membersPlaceholder: t('merit_members_placeholder'),
        };
      default:
        return {
          titlePlaceholder: t('enter_name_placeholder'),
          agendaTitle: t('agenda_schedule'),
          agendaDesc: t('agenda_desc'),
          committeeTitle: t('committee_organizers'),
          dateLabel: t('date_header') || "Date / Header",
          datePlaceholder: t('date_placeholder') || "e.g. Day 1 - Morning",
          roleLabel: t('role_label'),
          rolePlaceholder: t('role_placeholder'),
          membersPlaceholder: t('members_placeholder'),
        };
    }
  };

  const labels = getDynamicLabels();
  const theme = {
    wedding: "border-rose-200 bg-rose-50 text-rose-600",
    funeral: "border-zinc-200 bg-zinc-50 text-zinc-600",
    merit_making: "border-orange-200 bg-orange-50 text-orange-600",
    inauguration: "border-indigo-200 bg-indigo-50 text-indigo-600",
    default: "border-zinc-100 bg-zinc-50 text-zinc-500",
  }[category] || "border-zinc-100 bg-zinc-50 text-zinc-500";

  useEffect(() => {
    const init = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const [eventsData, contentData] = await Promise.all([
          getEvents(),
          getContentById(id)
        ]);
        
        setEvents(eventsData);

          if (contentData) {
            setTitle(contentData.title);
            setDescription(contentData.description || "");
            
            // Handle custom type
            const isStandardType = ['article', 'agenda', 'announcement', 'poster', 'wedding', 'funeral'].includes(contentData.type);
            if (isStandardType) {
              setType(contentData.type);
              setCustomType("");
            } else {
              setType("custom");
              setCustomType(contentData.type);
            }
          setEventId(contentData.eventId || "none");
          setBody(contentData.body || "");
          
          // Improved multiple image handling
          if (contentData.images && contentData.images.length > 0) {
              setCurrentImageUrls(contentData.images);
          } else if (contentData.thumbnail) {
              setCurrentImageUrls([contentData.thumbnail]);
          }

          if (contentData.agenda && contentData.agenda.length > 0) {
             setAgendaGroups(contentData.agenda.map(g => ({
                date: g.date || "",
                items: g.items || []
             })));
          } else {
             setAgendaGroups([{ date: "", items: [{ time: "", description: "" }] }]);
          }

             if (contentData.committee) {
              setCommitteeItems(contentData.committee.map(c => ({
                 role: c.role,
                 members: c.members.join(", ")
              })));
           } else {
              setCommitteeItems([{ role: "", members: "" }]);
           }

           // Handle Wedding Data
           if (contentData.type === 'wedding' && contentData.contentData) {
              const wd = contentData.contentData;
              if (wd.groom) setGroom(wd.groom);
              if (wd.bride) setBride(wd.bride);
              if (wd.location) setLocation(wd.location);
              if (wd.schedule && wd.schedule.length > 0) {
                 setWeddingSchedule(wd.schedule);
              }
              if (wd.footerContent) {
                 setFooterContent(wd.footerContent);
              }
           }
          } else {
            toast.error(t('error'));
            router.push("/admin/posts");
        }
      } catch (error) {
        console.error("Failed to load data", error);
        toast.error(t('error'));
      } finally {
        setLoading(false);
      }
    };

    if (user && id) init();
  }, [user, id, router, t]);

  const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setNewImageFiles(prev => [...prev, ...files]);
      
      const previews = files.map(file => URL.createObjectURL(file));
      setNewImagePreviews(prev => [...prev, ...previews]);
    }
  };

  const removeCurrentImage = (index: number) => {
    setCurrentImageUrls(prev => prev.filter((_, i) => i !== index));
  };

  const removeNewImage = (index: number) => {
    setNewImageFiles(prev => prev.filter((_, i) => i !== index));
    setNewImagePreviews(prev => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSave = async () => {
    if (!title || !id) {
        toast.error(t('title_required'));
        return;
    }

    try {
      setSaving(true);
      
      const uploadedImageUrls = await uploadMultipleToCloudinary(newImageFiles, "banhchi/posts");

      const finalImages = [...currentImageUrls, ...uploadedImageUrls];

      // Filter empty items in groups
      const cleanAgenda = agendaGroups.map(group => ({
        date: group.date,
        items: group.items.filter(item => item.time || item.description)
      })).filter(group => group.items.length > 0 || group.date);

      const cleanCommittee = committeeItems
        .filter(item => item.role || item.members)
        .map(item => ({ role: item.role, members: item.members.split(',').map(m => m.trim()) }));

      const updateData: any = {
        title,
        description,
        body,
        type: type === 'custom' ? customType : type,
        eventId: eventId !== "none" ? eventId : deleteField(),
        thumbnail: finalImages[0] || "",
        images: finalImages,
        
        ...(type === 'wedding' ? {
            contentData: {
                groom,
                bride,
                location,
                schedule: weddingSchedule.map(day => ({
                    ...day,
                    groups: (day.groups || []).map((g: any) => ({
                        ...g,
                        activities: (g.activities || []).filter((a: any) => (a.time || "").trim() || (a.title || "").trim() || (a.description || "").trim())
                    })).filter((g: any) => g.activities.length > 0 || (g.groupTitle || "").trim())
                })).filter(day => (day.dayLabel || "").trim() || day.groups.length > 0),
                footerContent
            }
        } : {
            agenda: cleanAgenda.length > 0 ? cleanAgenda : [],
            committee: cleanCommittee.length > 0 ? cleanCommittee : []
        })
      };

      await updateContent(id, updateData);
      toast.success(t('content_updated'));
      router.push("/admin/posts");
    } catch (error) {
      console.error(error);
      toast.error(t('failed_update_content'));
    } finally {
      setSaving(false);
    }
  };

  if (!user || loading) return (
      <div className="flex justify-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
      </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()} className="rounded-xl border-zinc-200">
           <ArrowLeft className="h-5 w-5 text-zinc-500" />
        </Button>
        <div>
           <h1 className="text-2xl font-black tracking-tight">{t('edit_content')}</h1>
           <p className="text-sm font-medium text-zinc-400">{t('edit_content_desc')}</p>
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
                    <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={labels.titlePlaceholder} className="h-12 rounded-xl font-bold text-lg" />
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
                                <SelectItem value="wedding">
                                    <div className="flex flex-col items-start gap-1 py-1 text-rose-500">
                                        <span className="font-bold">{t('wedding_style')}</span>
                                        <span className="text-xs text-rose-400">{t('wedding_style_desc')}</span>
                                    </div>
                                </SelectItem>
                                <SelectItem value="funeral">
                                    <div className="flex flex-col items-start gap-1 py-1 text-zinc-500">
                                        <span className="font-bold">{t('funeral_style')}</span>
                                        <span className="text-xs text-zinc-400">{t('funeral_style_desc')}</span>
                                    </div>
                                </SelectItem>
                                <SelectItem value="announcement">
                                    <div className="flex flex-col items-start gap-1 py-1">
                                        <span className="font-bold">{t('announcement')}</span>
                                        <span className="text-xs text-zinc-400">{t('announcement_desc')}</span>
                                    </div>
                                </SelectItem>
                                <SelectItem value="poster">
                                    <div className="flex flex-col items-start gap-1 py-1">
                                        <span className="font-bold">{t('poster')}</span>
                                        <span className="text-xs text-zinc-400">{t('poster_desc')}</span>
                                    </div>
                                </SelectItem>
                                <SelectItem value="custom">
                                    <div className="flex flex-col items-start gap-1 py-1">
                                        <span className="font-bold">{t('custom')}</span>
                                        <span className="text-xs text-zinc-400">{t('enter_custom_category')}</span>
                                    </div>
                                </SelectItem>
                            </SelectContent>
                        </Select>

                        {type === 'custom' && (
                            <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
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
                        {/* Current Images */}
                        {currentImageUrls.map((url, index) => (
                            <div key={`current-${index}`} className="relative aspect-video bg-zinc-100 rounded-xl overflow-hidden border border-zinc-200 group">
                                <Image src={url} alt={`Current ${index}`} fill className="object-cover" />
                                <button 
                                    onClick={() => removeCurrentImage(index)} 
                                    className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 hover:bg-red-500 transition-all"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        ))}
                        
                        {/* New Image Previews */}
                        {newImagePreviews.map((preview, index) => (
                            <div key={`new-${index}`} className="relative aspect-video bg-zinc-100 rounded-xl overflow-hidden border border-primary/30 group">
                                <Image src={preview} alt={`New Preview ${index}`} fill className="object-cover" />
                                <button 
                                    onClick={() => removeNewImage(index)} 
                                    className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 hover:bg-red-500 transition-all"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                                <div className="absolute bottom-1 right-1 bg-primary text-[8px] text-white px-1 rounded uppercase font-bold">New</div>
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

        {/* --- WEDDING SPECIFIC FIELDS --- */}
        {type === 'wedding' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Groom & Bride Info */}
            <div className="grid md:grid-cols-2 gap-8">
               {/* Groom Card */}
               <Card className="rounded-2xl border-rose-100 shadow-sm border-2">
                  <CardHeader className="bg-rose-50/50 rounded-t-2xl">
                     <CardTitle className="text-rose-600 font-moul text-sm uppercase tracking-widest">{t('wedding_groom_info') || "Groom Info"}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-4">
                     <div className="space-y-2">
                        <Label className="text-xs font-bold text-zinc-500 uppercase">{t('groom_name') || "Groom Name"}</Label>
                        <Input value={groom.name} onChange={e => setGroom({...groom, name: e.target.value})} className="rounded-xl border-rose-100 focus:ring-rose-200" placeholder={t('groom_name_placeholder') || "John Doe"} />
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                           <Label className="text-xs font-bold text-zinc-500 uppercase">{t('father') || "Father"}</Label>
                           <Input value={groom.father} onChange={e => setGroom({...groom, father: e.target.value})} className="rounded-xl border-rose-100" />
                        </div>
                        <div className="space-y-2">
                           <Label className="text-xs font-bold text-zinc-500 uppercase">{t('mother') || "Mother"}</Label>
                           <Input value={groom.mother} onChange={e => setGroom({...groom, mother: e.target.value})} className="rounded-xl border-rose-100" />
                        </div>
                     </div>
                  </CardContent>
               </Card>

               {/* Bride Card */}
               <Card className="rounded-2xl border-rose-100 shadow-sm border-2">
                  <CardHeader className="bg-rose-50/50 rounded-t-2xl">
                     <CardTitle className="text-rose-600 font-moul text-sm uppercase tracking-widest">{t('wedding_bride_info') || "Bride Info"}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-4">
                     <div className="space-y-2">
                        <Label className="text-xs font-bold text-zinc-500 uppercase">{t('bride_name') || "Bride Name"}</Label>
                        <Input value={bride.name} onChange={e => setBride({...bride, name: e.target.value})} className="rounded-xl border-rose-100 focus:ring-rose-200" placeholder={t('bride_name_placeholder') || "Jane Doe"} />
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                           <Label className="text-xs font-bold text-zinc-500 uppercase">{t('father') || "Father"}</Label>
                           <Input value={bride.father} onChange={e => setBride({...bride, father: e.target.value})} className="rounded-xl border-rose-100" />
                        </div>
                        <div className="space-y-2">
                           <Label className="text-xs font-bold text-zinc-500 uppercase">{t('mother') || "Mother"}</Label>
                           <Input value={bride.mother} onChange={e => setBride({...bride, mother: e.target.value})} className="rounded-xl border-rose-100" />
                        </div>
                     </div>
                  </CardContent>
               </Card>
            </div>

            {/* Location Card */}
            <Card className="rounded-2xl border-rose-100 shadow-sm border-2">
               <CardHeader className="bg-rose-50/50 rounded-t-2xl">
                  <CardTitle className="text-rose-600 font-moul text-sm uppercase tracking-widest">{t('location') || "Ceremony Location"}</CardTitle>
               </CardHeader>
               <CardContent className="pt-6 space-y-4">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label className="text-xs font-bold text-zinc-500 uppercase">{t('location_name') || "Venue Name"}</Label>
                        <Input value={location.name} onChange={e => setLocation({...location, name: e.target.value})} className="rounded-xl border-rose-100" placeholder={t('venue_name_placeholder') || "e.g. Hyatt Regency Phnom Penh"} />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-xs font-bold text-zinc-500 uppercase">{t('map_url') || "Map Link (Google Maps)"}</Label>
                        <Input value={location.mapUrl} onChange={e => setLocation({...location, mapUrl: e.target.value})} className="rounded-xl border-rose-100" placeholder={t('map_url_placeholder') || "https://..."} />
                    </div>
                  </div>
                  <div className="space-y-2">
                     <Label className="text-xs font-bold text-zinc-500 uppercase">{t('address') || "Address"}</Label>
                     <Input value={location.address} onChange={e => setLocation({...location, address: e.target.value})} className="rounded-xl border-rose-100" />
                  </div>
               </CardContent>
            </Card>

            {/* 3-Level Schedule Form */}
            <Card className="rounded-2xl border-amber-200 shadow-sm border-2">
                <CardHeader className="bg-rose-50/50 rounded-t-2xl flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-rose-900 font-moul text-sm uppercase tracking-[0.2em]">{t('wedding_agenda_schedule')}</CardTitle>
                        <CardDescription>{t('wedding_agenda_desc')}</CardDescription>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setWeddingSchedule([...weddingSchedule, { id: `day_${Date.now()}`, dayLabel: "", groups: [{ id: `group_${Date.now()}`, groupTitle: "", activities: [{ time: "", title: "", description: "" }] }] }])} className="rounded-xl border-rose-200">
                        <Plus className="h-4 w-4 mr-2" /> {t('add_day') || "Add Day"}
                    </Button>
                </CardHeader>
                <CardContent className="pt-6 space-y-10">
                    {weddingSchedule.map((day, dayIndex) => (
                        <div key={day.id} className="p-6 rounded-3xl border-2 border-rose-50 bg-white relative group/day hover:border-rose-200 transition-colors">
                            <Button 
                                variant="ghost" size="icon" 
                                onClick={() => setWeddingSchedule(weddingSchedule.filter((_, i) => i !== dayIndex))}
                                className="absolute top-4 right-4 text-rose-300 hover:text-red-500"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>

                            <div className="space-y-6">
                                <div className="space-y-2 border-b-2 border-rose-50 pb-4">
                                     <Label className="text-xs font-black text-rose-400 uppercase tracking-widest">{t('ceremony_day_label') || "Ceremony Day"}</Label>
                                     <Input 
                                        placeholder={t('wedding_date_placeholder') || "Day 1 - Morning"}
                                        value={day.dayLabel} 
                                        onChange={e => {
                                            const newS = [...weddingSchedule];
                                            newS[dayIndex].dayLabel = e.target.value;
                                            setWeddingSchedule(newS);
                                        }}
                                        className="h-12 rounded-xl text-lg font-bold border-rose-100"
                                     />
                                </div>

                                {/* Activities — flat list directly under day */}
                                <div className="pt-4 space-y-3">
                                    {(day.groups[0]?.activities || []).map((act: any, actIndex: number) => (
                                        <div key={actIndex} className="flex gap-3 items-start p-3 bg-zinc-50 rounded-xl border border-zinc-100">
                                            <Input 
                                                placeholder={t('time_placeholder') || "\\u17e1:\\u17e0\\u17e0 \\u179a\\u179f\\u17c0\\u179b"} 
                                                className="w-32 border-0 bg-white shadow-sm rounded-lg font-black text-rose-500"
                                                value={act.time}
                                                onChange={e => {
                                                    const newS = [...weddingSchedule];
                                                    if (!newS[dayIndex].groups[0]) newS[dayIndex].groups[0] = { id: "group_1", groupTitle: "", activities: [] };
                                                    newS[dayIndex].groups[0].activities[actIndex].time = e.target.value;
                                                    setWeddingSchedule(newS);
                                                }}
                                            />
                                            <div className="flex-1 space-y-2">
                                                <Input 
                                                    placeholder={t('activity_title') || "Activity Title"}
                                                    className="h-8 border-0 bg-transparent shadow-none font-bold"
                                                    value={act.title}
                                                    onChange={e => {
                                                        const newS = [...weddingSchedule];
                                                        newS[dayIndex].groups[0].activities[actIndex].title = e.target.value;
                                                        setWeddingSchedule(newS);
                                                    }}
                                                />
                                                <Textarea 
                                                    placeholder={t('activity_desc')}
                                                    className="min-h-12 border-0 bg-transparent shadow-none text-sm resize-none"
                                                    value={act.description}
                                                    onChange={e => {
                                                        const newS = [...weddingSchedule];
                                                        newS[dayIndex].groups[0].activities[actIndex].description = e.target.value;
                                                        setWeddingSchedule(newS);
                                                    }}
                                                />
                                            </div>
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                onClick={() => {
                                                    const newS = [...weddingSchedule];
                                                    newS[dayIndex].groups[0].activities = newS[dayIndex].groups[0].activities.filter((_:any, i:any) => i !== actIndex);
                                                    setWeddingSchedule(newS);
                                                }}
                                                className="text-zinc-300 hover:text-red-400"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                    <Button variant="ghost" size="sm" onClick={() => {
                                        const newS = [...weddingSchedule];
                                        if (!newS[dayIndex].groups[0]) newS[dayIndex].groups[0] = { id: "group_1", groupTitle: "", activities: [] };
                                        newS[dayIndex].groups[0].activities.push({ time: "", title: "", description: "" });
                                        setWeddingSchedule(newS);
                                    }} className="text-zinc-400 hover:text-rose-500 text-[10px] font-bold uppercase tracking-widest pl-2">
                                        <Plus className="h-3 w-3 mr-2" /> {t('add_item')}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>

            {/* Closing / Footer Content Card */}
            <Card className="rounded-2xl border-zinc-200 shadow-sm">
                <CardHeader>
                    <CardTitle className="text-lg font-black uppercase tracking-widest text-zinc-400">{t('closing_content') || "Closing Content"}</CardTitle>
                    <CardDescription>{t('closing_content_desc') || "Add final messages or additional images for the bottom of the page"}</CardDescription>
                </CardHeader>
                <CardContent>
                    <RichTextEditor 
                        value={footerContent} 
                        onChange={setFooterContent} 
                        placeholder={t('closing_content_placeholder') || "Thank you for coming..."} 
                        className="min-h-80" 
                    />
                </CardContent>
            </Card>
          </div>
        )}

        {/* Dynamic Agenda */}
        {type === 'agenda' && (
        <Card className="rounded-2xl border-zinc-200 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                   <div className="flex items-center gap-3 mb-1">
                        <CardTitle className="text-lg font-black uppercase tracking-widest text-zinc-400">{labels.agendaTitle}</CardTitle>
                        {selectedEvent && (
                            <Badge variant="outline" className={cn("text-[10px] uppercase font-black px-3 py-1 rounded-lg", theme)}>
                                {category} Style
                            </Badge>
                        )}
                    </div>
                    <CardDescription>{labels.agendaDesc}</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => setAgendaGroups([...agendaGroups, { date: "", items: [{ time: "", description: "" }] }])} className="rounded-lg">
                    <Plus className="h-4 w-4 mr-2" /> {t('add_day') || "Add Day"}
                </Button>
            </CardHeader>
            <CardContent className="space-y-8">
                {agendaGroups.map((group, groupIndex) => (
                    <div key={groupIndex} className="bg-zinc-50 p-6 rounded-2xl border border-zinc-100 relative group/day">
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => {
                                const newGroups = agendaGroups.filter((_, i) => i !== groupIndex);
                                setAgendaGroups(newGroups);
                            }}
                            className="absolute top-2 right-2 text-zinc-400 hover:text-destructive opacity-0 group-hover/day:opacity-100 transition-opacity"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>

                        <div className="space-y-4">
                             <div className="space-y-2">
                                 <Label className="text-xs uppercase font-bold text-zinc-400">{labels.dateLabel}</Label>
                                 <Input 
                                    placeholder={labels.datePlaceholder}
                                    value={group.date} 
                                    onChange={(e) => {
                                        const newGroups = [...agendaGroups];
                                        newGroups[groupIndex].date = e.target.value;
                                        setAgendaGroups(newGroups);
                                    }} 
                                    className="rounded-xl font-bold bg-white"
                                 />
                             </div>

                             <div className="space-y-3 pl-4 border-l-2 border-zinc-200">
                                 {group.items.map((item, itemIndex) => (
                                     <div key={itemIndex} className="flex gap-4 items-start">
                                         <Input 
                                            placeholder={t('time_placeholder')}
                                            value={item.time} 
                                            onChange={(e) => {
                                                const newGroups = [...agendaGroups];
                                                newGroups[groupIndex].items[itemIndex].time = e.target.value;
                                                setAgendaGroups(newGroups);
                                            }} 
                                            className="w-32 sm:w-40 rounded-xl bg-white"
                                         />
                                         <Input 
                                            placeholder={t('activity_desc')}
                                            value={item.description} 
                                            onChange={(e) => {
                                                const newGroups = [...agendaGroups];
                                                newGroups[groupIndex].items[itemIndex].description = e.target.value;
                                                setAgendaGroups(newGroups);
                                            }} 
                                            className="flex-1 rounded-xl bg-white"
                                         />
                                         <Button 
                                             variant="ghost" 
                                             size="icon" 
                                             onClick={() => {
                                                 const newGroups = [...agendaGroups];
                                                 newGroups[groupIndex].items = newGroups[groupIndex].items.filter((_, i) => i !== itemIndex);
                                                 setAgendaGroups(newGroups);
                                             }}
                                             className="text-zinc-400 hover:text-destructive"
                                         >
                                             <Trash2 className="h-4 w-4" />
                                         </Button>
                                     </div>
                                 ))}
                                 <Button variant="ghost" size="sm" onClick={() => {
                                     const newGroups = [...agendaGroups];
                                     newGroups[groupIndex].items.push({ time: "", description: "" });
                                     setAgendaGroups(newGroups);
                                 }} className="rounded-lg text-zinc-500 hover:text-primary">
                                     <Plus className="h-3 w-3 mr-2" /> {t('add_item')}
                                 </Button>
                             </div>
                        </div>
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
                     <CardTitle className="text-lg font-black uppercase tracking-widest text-zinc-400">{labels.committeeTitle}</CardTitle>
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
                             <Label className="text-xs uppercase font-bold text-zinc-400">{labels.roleLabel}</Label>
                             <Input 
                                placeholder={labels.rolePlaceholder}
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
                                placeholder={labels.membersPlaceholder}
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
        {type !== 'wedding' && (
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
        )}

        <div className="flex justify-end gap-4">
             <Button variant="ghost" type="button" onClick={() => router.back()} className="h-12 px-8 rounded-xl font-bold text-zinc-500">
                {t('cancel')}
             </Button>
              <Button onClick={handleSave} disabled={saving} className="h-12 px-8 rounded-xl font-bold text-lg min-w-50">
                {saving ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
                {saving ? t('updating_content') : t('update_content_btn')}
              </Button>
        </div>
      </div>
    </div>
  );
}
