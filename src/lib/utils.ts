import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: { seconds?: number } | Date | number | string, locale = 'en-US'): string {
  if (!date) return "";
  let d: Date;
  
  if (typeof date === 'object' && date !== null && 'seconds' in date && typeof (date as { seconds: unknown }).seconds === 'number') {
    d = new Date((date as { seconds: number }).seconds * 1000);
  } else {
    d = new Date(date as string | number | Date);
  }

  if (isNaN(d.getTime())) return "";

  const finalLocale = locale === 'kh' ? 'km-KH' : 'en-US';

  return d.toLocaleDateString(finalLocale, {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
}
