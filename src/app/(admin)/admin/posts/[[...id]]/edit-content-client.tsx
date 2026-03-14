"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getContentById, updateContent, Content } from "@/services/content.service";
import { getEvents } from "@/services/event.service";
import { Event } from "@/types";
import { Loader2, ArrowLeft, Plus, Trash2, Upload, X, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { uploadMultipleToCloudinary } from "@/lib/cloudinary";
import Image from "next/image";
import RichTextEditor from "@/components/rich-text-editor";

export default function EditContentClient() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  
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
  const [newImages, setNewImages] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [contentData, eventsData] = await Promise.all([
          getContentById(id as string),
          getEvents()
        ]);
        
        setEvents(eventsData);
        
        if (contentData) {
          setTitle(contentData.title || "");
          setDescription(contentData.description || "");
          setBody(contentData.body || "");
          setEventId(contentData.eventId || "none");
          setCurrentImageUrls(contentData.images || []);
          
          const knownTypes = ['news', 'announcement', 'article'];
          if (knownTypes.includes(contentData.type)) {
            setType(contentData.type);
          } else {
            // Check if it was one of the legacy types, move to article
            if (['wedding', 'buddhist', 'agenda'].includes(contentData.type)) {
                setType('article');
            } else {
                setType('custom');
                setCustomType(contentData.type);
            }
          }
        }
      } catch (error) {
        console.error("Failed to load content for edit");
        toast.error("មិនអាចទាញយកទិន្នន័យបានទេ");
      } finally {
        setLoading(false);
      }
    };
    if (user && id) fetchData();
  }, [user, id]);

  const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setNewImages(prev => [...prev, ...files]);
      const previews = files.map(file => URL.createObjectURL(file));
      setNewImagePreviews(prev => [...prev, ...previews]);
    }
  };

  const removeCurrentImage = (index: number) => {
    setCurrentImageUrls(prev => prev.filter((_, i) => i !== index));
  };

  const removeNewImage = (index: number) => {
    setNewImages(prev => prev.filter((_, i) => i !== index));
    setNewImagePreviews(prev => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSave = async () => {
    if (!title.trim()) {
        toast.error("សូមបញ្ចូលចំណងជើង");
        return;
    }
    
    try {
      setSaving(true);
      
      const uploadedImageUrls = await uploadMultipleToCloudinary(newImages, "banhchi/contents");
      const finalImages = [...currentImageUrls, ...uploadedImageUrls];

      const updatedItem: Partial<Content> = {
        title: title.trim(),
        description: description.trim(),
        body,
        type: type === 'custom' ? customType.trim() : type,
        eventId: eventId === 'none' ? undefined : eventId,
        thumbnail: finalImages[0] || "",
        images: finalImages,
        author: {
            name: user?.displayName || "Admin",
            ...(user?.photoURL ? { photoURL: user.photoURL } : {})
        }
      };

      await updateContent(id as string, updatedItem);
      toast.success("បានធ្វើបច្ចុប្បន្នភាពដោយជោគជ័យ");
      router.push("/admin/posts/");
    } catch (error) {
      console.error(error);
      toast.error("បរាជ័យក្នុងការធ្វើបច្ចុប្បន្នភាព");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background gap-6">
       <Loader2 className="h-14 w-14 animate-spin text-primary" />
       <p className="text-muted-foreground font-black text-xs uppercase tracking-[0.4em] animate-pulse">កំពុងទាញយកទិន្នន័យ...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground -m-4 sm:-m-8 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto space-y-12 pb-20">
        <div className="flex items-center gap-6">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => router.back()} 
            className="h-14 w-14 rounded-md border-border bg-card hover:bg-accent transition-all active:scale-90"
          >
             <ArrowLeft className="h-6 w-6 text-muted-foreground" />
          </Button>
          <div>
             <h1 className="text-4xl font-black tracking-tight text-foreground mb-2">កែសម្រួលអត្ថបទ</h1>
             <p className="text-muted-foreground font-bold uppercase tracking-[0.2em] text-[10px]">កែប្រែព័ត៌មាន និងខ្លឹមសារដែលបានផ្សព្វផ្សាយ</p>
          </div>
        </div>

        <div className="grid gap-12">
          {/* Main Info */}
          <Card className="rounded-md border-border bg-card shadow-md overflow-hidden">
              <CardHeader className="p-8 border-b border-border bg-muted/30">
                  <CardTitle className="text-muted-foreground font-black text-xs uppercase tracking-[0.3em]">ព័ត៌មានទូទៅ</CardTitle>
              </CardHeader>
              <CardContent className="p-8 pt-10 space-y-10">
                  <div className="space-y-4">
                      <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest pl-2">ចំណងជើងអត្ថបទ</Label>
                      <Input 
                        value={title} 
                        onChange={(e) => setTitle(e.target.value)} 
                        placeholder="បញ្ចូលចំណងជើងរឿងរ៉ាវ ឬសេចក្តីជូនដំណឹង..." 
                        className="h-16 rounded-md bg-muted/50 border-border font-black text-foreground text-2xl px-8 focus:ring-primary/20 transition-all" 
                      />
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-10">
                      <div className="space-y-4">
                          <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest pl-2 flex items-center justify-between">
                              ប្រភេទមាតិកា
                          </Label>
                          <Select value={type} onValueChange={(v: any) => setType(v)}>
                              <SelectTrigger className="h-14 rounded-md bg-muted/50 border-border font-black text-foreground px-6">
                                  <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="rounded-md border-border bg-card text-foreground">
                                  <SelectItem value="article" className="rounded-md focus:bg-accent">
                                      <div className="flex flex-col items-start gap-1 py-1">
                                          <span className="font-black text-xs">អត្ថបទ និងរឿងរ៉ាវ (Article)</span>
                                          <span className="text-[10px] text-muted-foreground">រឿងរ៉ាវស្នេហា ឬប្រវត្តិបុណ្យផ្សេងៗ</span>
                                      </div>
                                  </SelectItem>
                                  <SelectItem value="announcement" className="rounded-md focus:bg-accent">
                                      <div className="flex flex-col items-start gap-1 py-1">
                                          <span className="font-black text-xs">សេចក្តីជូនដំណឹង (Announcement)</span>
                                          <span className="text-[10px] text-muted-foreground">ព័ត៌មានសំខាន់ៗដែលត្រូវការឱ្យភ្ញៀវដឹង</span>
                                      </div>
                                  </SelectItem>
                                  <SelectItem value="news" className="rounded-md focus:bg-accent">
                                      <div className="flex flex-col items-start gap-1 py-1">
                                          <span className="font-black text-xs">ព័ត៌មានថ្មីៗ (News)</span>
                                          <span className="text-[10px] text-muted-foreground">ព័ត៌មានទូទៅក្នុងសហគមន៍</span>
                                      </div>
                                  </SelectItem>
                                  <SelectItem value="custom" className="rounded-md focus:bg-accent">
                                      <div className="flex flex-col items-start gap-1 py-1">
                                          <span className="font-black text-xs">ផ្សេងៗ</span>
                                          <span className="text-[10px] text-muted-foreground">បញ្ចូលប្រភេទមាតិកាដោយខ្លួនឯង</span>
                                      </div>
                                  </SelectItem>
                              </SelectContent>
                          </Select>

                          {type === 'custom' && (
                              <div className="mt-4">
                                  <Input 
                                      placeholder="បញ្ចូលប្រភេទមាតិកាដោយខ្លួនឯង" 
                                      className="h-14 bg-muted/50 border-primary/30 border-2 rounded-md font-black px-6 text-foreground"
                                      value={customType}
                                      onChange={(e) => setCustomType(e.target.value)}
                                  />
                              </div>
                          )}
                      </div>

                      <div className="space-y-4">
                          <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest pl-2 flex items-center justify-between">
                              ភ្ជាប់ជាមួយកម្មវិធី <span className="text-[8px] opacity-40 font-bold">(មិនបង្ខំ)</span>
                          </Label>
                          <Select value={eventId} onValueChange={setEventId}>
                              <SelectTrigger className="h-14 rounded-md bg-muted/50 border-border font-black text-foreground px-6">
                                  <SelectValue placeholder="ស្វែងរកកម្មវិធី..." />
                              </SelectTrigger>
                              <SelectContent className="rounded-md border-border bg-card text-foreground">
                                  <SelectItem value="none" className="rounded-md focus:bg-accent">{"មិនភ្ជាប់ជាមួយកម្មវិធី"}</SelectItem>
                                  {events.map(e => (
                                      <SelectItem key={e.id} value={e.id} className="rounded-md focus:bg-accent">{e.title}</SelectItem>
                                  ))}
                              </SelectContent>
                          </Select>
                      </div>
                  </div>

                   <div className="space-y-4">
                      <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest pl-2">ការពិពណ៌នាសង្ខេប (Summary)</Label>
                      <Textarea 
                        value={description} 
                        onChange={(e) => setDescription(e.target.value)} 
                        placeholder="សរសេរការពិពណ៌នាសង្ខេបដែលបង្ហាញនៅលើ Feed..." 
                        className="rounded-md bg-muted/50 border-border resize-none h-24 p-6 font-medium text-foreground focus:ring-primary/20 transition-all text-lg leading-relaxed" 
                      />
                  </div>
  
                  <div className="space-y-6">
                      <div className="flex items-center justify-between pl-2">
                        <div className="space-y-1">
                            <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">វិចិត្រសាលរូបភាព (Gallery)</Label>
                            <p className="text-[9px] text-muted-foreground/30 font-bold uppercase tracking-widest">រូបភាពដំបូងនឹងត្រូវប្រើជា រូបតំណាង (Thumbnail)</p>
                        </div>
                        {eventId !== "none" && (
                            <Button 
                                variant="outline" 
                                size="sm" 
                                type="button"
                                onClick={() => {
                                    const selectedEvent = events.find(e => e.id === eventId);
                                    if (selectedEvent) {
                                        const eventImages = [selectedEvent.bannerUrl, ...(selectedEvent.galleryUrls || [])].filter(Boolean);
                                        setCurrentImageUrls(prev => {
                                            const combined = [...prev, ...eventImages];
                                            return Array.from(new Set(combined));
                                        });
                                        toast.success("បានភ្ជាប់រូបភាពពីកម្មវិធីដោយជោគជ័យ");
                                    }
                                }}
                                className="h-9 px-4 rounded-md border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 font-black text-[10px] uppercase tracking-widest transition-all"
                            >
                                <ImageIcon className="h-3.5 w-3.5 mr-2" />
                                {"ប្រើប្រាស់រូបភាពពីកម្មវិធី"}
                            </Button>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                          {/* Synced Images */}
                          {currentImageUrls.map((url, index) => (
                              <div key={`current-${index}`} className="relative aspect-square bg-muted rounded-md overflow-hidden border border-border group shadow-md">
                                  <Image src={url} alt={`Current ${index}`} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                      <button 
                                          type="button"
                                          onClick={() => removeCurrentImage(index)} 
                                          className="bg-primary text-primary-foreground rounded-md p-3 hover:bg-primary/90 active:scale-90 transition-all shadow-md"
                                      >
                                          <Trash2 className="h-5 w-5" />
                                      </button>
                                  </div>
                                  <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-[8px] text-white px-2 py-0.5 rounded-full uppercase font-black border border-white/10">Active</div>
                                  {index === 0 && <div className="absolute bottom-3 left-3 bg-primary text-[7px] text-primary-foreground px-2 py-0.5 rounded-full uppercase font-black shadow-md">Thumbnail</div>}
                              </div>
                          ))}

                          {newImagePreviews.map((preview, index) => (
                              <div key={`new-${index}`} className="relative aspect-square bg-muted rounded-md overflow-hidden border-2 border-dashed border-primary/30 group shadow-md">
                                  <Image src={preview} alt={`New Preview ${index}`} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                      <button 
                                          type="button"
                                          onClick={() => removeNewImage(index)} 
                                          className="bg-primary text-primary-foreground rounded-md p-3 hover:bg-primary/90 active:scale-90 transition-all shadow-md"
                                      >
                                          <Trash2 className="h-5 w-5" />
                                      </button>
                                  </div>
                                  <div className="absolute top-3 left-3 bg-primary text-[8px] text-primary-foreground px-2 py-0.5 rounded-full uppercase font-black shadow-md">New</div>
                              </div>
                          ))}
                          
                          <label className="relative aspect-square bg-muted/30 rounded-md overflow-hidden border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:bg-accent hover:border-primary/50 transition-all group active:scale-95">
                               <div className="bg-muted rounded-md p-4 mb-3 group-hover:bg-primary/10 transition-colors">
                                <Plus className="h-6 w-6 text-muted-foreground/30 group-hover:text-primary" />
                            </div>
                              <span className="text-[10px] font-black text-muted-foreground/50 uppercase tracking-[0.2em]">{"បន្ថែមរូបភាព"}</span>
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

          {/* Body Content */}
          <Card className="rounded-md border-border bg-card shadow-md overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
              <CardHeader className="p-8 border-b border-border bg-muted/30">
                  <CardTitle className="text-muted-foreground font-black text-xs uppercase tracking-[0.3em]">ខ្លឹមសារអត្ថបទលម្អិត</CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                  <RichTextEditor 
                    value={body} 
                    onChange={setBody} 
                    placeholder="កែសម្រួលខ្លឹមសាររឿងរ៉ាវលម្អិតនៅទីនេះ..." 
                    className="min-h-120 bg-muted/20 rounded-md text-foreground" 
                  />
              </CardContent>
          </Card>

          <div className="flex justify-end gap-6 pt-10 pb-20">
               <Button 
                 variant="ghost" 
                 type="button" 
                 onClick={() => router.back()} 
                 className="h-16 px-12 rounded-md font-black text-muted-foreground hover:text-foreground hover:bg-accent transition-all text-sm uppercase tracking-widest"
               >
                  {"បោះបង់"}
               </Button>
                <Button 
                  onClick={handleSave} 
                  disabled={saving} 
                  className="h-16 px-12 rounded-md font-black text-xl min-w-75 bg-primary hover:bg-primary/90 text-primary-foreground shadow-md shadow-primary/30 active:scale-95 transition-all"
                >
                   {saving ? <Loader2 className="h-7 w-7 animate-spin mr-3 text-white" /> : null}
                   {saving ? "កំពុងរក្សាទុក..." : "ធ្វើបច្ចុប្បន្នភាព"}
                 </Button>
            </div>
        </div>
      </div>
    </div>
  );
}
