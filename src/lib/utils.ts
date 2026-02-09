import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Manual Khmer translation helper for browsers with limited Intl support
const khmerDays = ['អាទិត្យ', 'ច័ន្ទ', 'អង្គារ', 'ពុធ', 'ព្រហស្បតិ៍', 'សុក្រ', 'សៅរ៍'];
const khmerMonths = ['មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា', 'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ'];
const toKhmerDigits = (num: number | string) => String(num).replace(/\d/g, d => '០១២៣៤៥៦៧៨៩'[parseInt(d)]);

export function formatDate(date: { seconds?: number } | Date | number | string, locale = 'en-US', includeTime = false): string {
  if (!date) return "";
  let d: Date;
  
  if (typeof date === 'object' && date !== null && 'seconds' in date && typeof (date as { seconds: unknown }).seconds === 'number') {
    d = new Date((date as { seconds: number }).seconds * 1000);
  } else {
    d = new Date(date as string | number | Date);
  }

  if (isNaN(d.getTime())) return "";

  if (locale === 'kh') {
    const day = khmerDays[d.getDay()];
    const dateNum = toKhmerDigits(d.getDate());
    const month = khmerMonths[d.getMonth()];
    const year = toKhmerDigits(d.getFullYear());
    
    let result = `ថ្ងៃ${day} ទី${dateNum} ខែ${month} ឆ្នាំ${year}`;
    
    if (includeTime) {
      const hours = d.getHours();
      const minutes = d.getMinutes();
      const ampm = hours >= 12 ? 'ល្ងាច' : 'ព្រឹក';
      const khHours = toKhmerDigits(hours % 12 || 12);
      const khMinutes = toKhmerDigits(minutes < 10 ? `0${minutes}` : minutes);
      result += ` ម៉ោង ${khHours}:${khMinutes} ${ampm}`;
    }
    
    return result;
  }

  return d.toLocaleDateString('en-US', {
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric'
  });
}
