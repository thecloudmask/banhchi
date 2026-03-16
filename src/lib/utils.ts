import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const khmerDays = ['អាទិត្យ', 'ច័ន្ទ', 'អង្គារ', 'ពុធ', 'ព្រហស្បតិ៍', 'សុក្រ', 'សៅរ៍'];
const khmerMonths = ['មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា', 'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ'];
export const toKhmerDigits = (num: number | string) => String(num).replace(/\d/g, d => '០១២៣៤៥៦៧៨៩'[parseInt(d)]);

/**
 * បង្ហាញថ្ងៃខែ និងម៉ោងជាភាសាខ្មែរចេញពី Date Object តែមួយ
 * សមស្របសម្រាប់ប្រើជាមួយ DateTime Picker
 */
export function formatDateTime(date: any, includeTime = true): string {
  if (!date) return "";
  
  const d = new Date(date?.seconds ? date.seconds * 1000 : date);
  if (isNaN(d.getTime())) return "";

  const day = khmerDays[d.getDay()];
  const dateNum = toKhmerDigits(d.getDate());
  const month = khmerMonths[d.getMonth()];
  const year = toKhmerDigits(d.getFullYear());
  
  let result = `ថ្ងៃ${day} ទី${dateNum} ខែ${month} ឆ្នាំ${year}`;
  
  if (includeTime) {
    const hours = d.getHours();
    const minutes = d.getMinutes();
    const ampm = hours >= 12 ? 'ល្ងាច' : 'ព្រឹក';
    
    // ប្តូរម៉ោង ២៤ មកម៉ោង ១២ បែបខ្មែរ
    const displayHours = hours % 12 || 12; 
    const khHours = toKhmerDigits(displayHours);
    const khMinutes = toKhmerDigits(minutes < 10 ? `0${minutes}` : minutes);
    
    result += ` ម៉ោង ${khHours}:${khMinutes} ${ampm}`;
  }
  
  return result;
}

// បងនៅតែអាចប្រើ Function នេះសម្រាប់បង្ហាញតែម៉ោងសុទ្ធបាន
export function formatTimeOnly(date: any): string {
  if (!date) return "";
  const d = new Date(date?.seconds ? date.seconds * 1000 : date);
  if (isNaN(d.getTime())) return "";

  const hours = d.getHours();
  const minutes = d.getMinutes();
  const ampm = hours >= 12 ? 'ល្ងាច' : 'ព្រឹក';
  const khHours = toKhmerDigits(hours % 12 || 12);
  const khMinutes = toKhmerDigits(minutes < 10 ? `0${minutes}` : minutes);
  
  return `ម៉ោង ${khHours}:${khMinutes} ${ampm}`;
}

export function stripHtml(html: string | undefined | null) {
  if (!html) return "";
  // Step 1: Decode basic entities so tags are recognizable
  let text = html
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&');
  
  // Step 2: Strip actual HTML tags
  text = text.replace(/<[^>]*>?/gm, '');
  
  // Step 3: Clean up remaining common entities
  return text.replace(/&nbsp;/g, ' ').trim();
}