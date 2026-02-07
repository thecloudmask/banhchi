"use client";

import { useLanguage } from "@/providers/language-provider";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <Button 
      variant="ghost" 
      size="sm" 
      onClick={() => setLanguage(language === "en" ? "kh" : "en")}
      className="font-medium gap-2"
    >
      <Globe className="h-4 w-4" />
      {language === "en" ? "English" : "ខ្មែរ"}
    </Button>
  );
}
