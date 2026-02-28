"use client";

import { useLanguage } from "@/providers/language-provider";
import { Button } from "@/components/ui/button";
import { Languages } from "lucide-react";

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <Button 
      variant="ghost" 
      size="sm" 
      onClick={() => setLanguage(language === "en" ? "kh" : "en")}
      className="font-bold gap-2 px-2 sm:px-4 h-9 sm:h-10 rounded-xl"
      title={language === "en" ? "Switch to Khmer" : "ប្តូរទៅភាសាអង់គ្លេស"}
    >
      <Languages className="h-4 w-4 opacity-70" />
      <span className="hidden sm:inline-block text-xs uppercase tracking-widest">
        {language === "en" ? "English" : "ខ្មែរ"}
      </span>
    </Button>
  );
}
