"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type Language = "en" | "kh";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const translations: Record<string, Record<Language, string>> = {
  // Common
  "save": { en: "Save", kh: "រក្សាទុក" },
  "cancel": { en: "Cancel", kh: "បោះបង់" },
  "create": { en: "Create", kh: "បង្កើត" },
  "update": { en: "Update", kh: "កែប្រែ" },
  "loading": { en: "Loading...", kh: "កំពុងដំណើរការ..." },
  "search_placeholder": { en: "Search...", kh: "ស្វែងរក..." },
  "back": { en: "Back", kh: "ត្រលប់ក្រោយ" },
  "share": { en: "Share", kh: "ចែករំលែក" },
  "delete": { en: "Delete", kh: "លុប" },
  "delete_event": { en: "Delete Event", kh: "លុបកម្មវិធី" },
  "edit": { en: "Edit", kh: "កែប្រែ" },
  "success": { en: "Success", kh: "ជោគជ័យ" },
  "error": { en: "Error", kh: "កំហុស" },
  
  // Status Labels
  "active": { en: "Upcoming", kh: "ជិតមកដល់" },
  "completed": { en: "Completed", kh: "ចប់រួចរាល់" },
  "upcoming": { en: "Upcoming", kh: "ជិតមកដល់" },
  "status": { en: "Status", kh: "ស្ថានភាព" },

  // Event Details labels
  "location": { en: "Location", kh: "ទីតាំង" },
  "event_date": { en: "Date", kh: "កាលបរិច្ឆេទ" },
  "event_time": { en: "Event Time", kh: "ម៉ោងកម្មវិធី" },
  "start_time": { en: "Start Time", kh: "ម៉ោងចាប់ផ្តើម" },
  "event_information": { en: "Information", kh: "ព័ត៌មានកម្មវិធី" },
  "location_venue": { en: "Location / Venue", kh: "ទីតាំង / ទីកន្លែង" },
  "tba": { en: "TBA", kh: "នឹងជម្រាបជូន" },

  // Countdown Labels
  "days": { en: "Days", kh: "ថ្ងៃ" },
  "hours": { en: "Hours", kh: "ម៉ោង" },
  "minutes": { en: "Minutes", kh: "នាទី" },
  "seconds": { en: "Seconds", kh: "វិនាទី" },
  "countdown_title": { en: "Ceremony Begins In", kh: "កម្មវិធីនឹងចាប់ផ្តើមក្នុងរយៈពេល" },

  // Action Buttons
  "view_invitation": { en: "View Invitation Card", kh: "មើលលិខិតអញ្ជើញ" },
  "save_date": { en: "Save Date / Calendar", kh: "ដាក់ចូលប្រតិទិន" },
  "save_to_calendar": { en: "Save to Calendar", kh: "ដាក់ចូលប្រតិទិន" },
  "get_directions": { en: "Get Directions", kh: "មើលផែនទី" },
  "share_invitation": { en: "Share Invitation", kh: "ចែករំលែកលិខិតអញ្ជើញ" },
  "invitation": { en: "Invitation", kh: "លិខិតអញ្ជើញ" },
  "copy_link": { en: "Copy Link", kh: "ចម្លងតំណភ្ជាប់" },

  // Dashboard & Navigation
  "dashboard": { en: "Dashboard", kh: "ផ្ទាំងគ្រប់គ្រង" },
  "admin": { en: "Admin", kh: "អ្នកគ្រប់គ្រង" },
  "events": { en: "Events", kh: "កម្មវិធី" },
  "manage_events": { en: "Manage all your special events.", kh: "គ្រប់គ្រងកម្មវិធីរបស់អ្នក" },
  "no_events": { en: "No events yet", kh: "មិនទាន់មានកម្មវិធី" },
  "create_first_event": { en: "Get started by creating your first event to track contributions.", kh: "សូមបង្កើតកម្មវិធីដំបូងរបស់អ្នក" },
  "create_event_btn": { en: "Create Event", kh: "បង្កើតកម្មវិធី" },
  "create_event": { en: "Create Event", kh: "បង្កើតកម្មវិធី" },
  "public_link": { en: "Public Link", kh: "តំណភ្ជាប់សាធារណៈ" },
  "export": { en: "Export", kh: "ទាញយកទិន្នន័យ" },
  "logout": { en: "Logout", kh: "ចាកចេញ" },
  "sign_out": { en: "Sign Out", kh: "ចាកចេញ" },
  "verifying_access": { en: "Verifying Access", kh: "កំពុងផ្ទៀងផ្ទាត់" },
  "your_events": { en: "Your Events", kh: "កម្មវិធីរបស់អ្នក" },
  "manage_celebrations": { en: "Manage your celebrations", kh: "គ្រប់គ្រងកម្មវិធីអបអរសាទររបស់អ្នក" },
  "failed_logout": { en: "Failed to log out", kh: "មិនអាចចាកចេញបានទេ" },
  "manage": { en: "Manage", kh: "គ្រប់គ្រង" },

  // Export Options
  "select_export_type": { en: "Select Export Type", kh: "ជ្រើសរើសប្រភេទឯកសារ" },
  "full_report": { en: "Full Transaction List", kh: "បញ្ជីប្រតិបត្តិការសរុប" },
  "full_report_desc": { en: "Amounts, Methods, Notes", kh: "ទឹកប្រាក់ វិធីសាស្រ្ត និងចំណាំ" },
  "invitation_checklist": { en: "Guest Checklist", kh: "បញ្ជីផ្ទៀងផ្ទាត់ភ្ញៀវ" },
  "invitation_checklist_desc": { en: "Names & Notes only", kh: "តែឈ្មោះ និងចំណាំប៉ុណ្ណោះ" },
  "reports": { en: "Reports", kh: "របាយការណ៍" },

  // Admin Cards
  "total_balance_admin": { en: "Total Balance", kh: "សមតុល្យសរុប" },
  "cash_in_hand": { en: "Cash In-Hand", kh: "សាច់ប្រាក់នៅក្នុងដៃ" },
  "qr_bank": { en: "QR / Bank", kh: "ធនាគារ / QR" },
  "physical_box_desc": { en: "Count this in your physical box", kh: "រាប់សាច់ប្រាក់នៅក្នុងប្រអប់របស់អ្នក" },
  "bank_apps_desc": { en: "Verify this in your bank apps", kh: "ផ្ទៀងផ្ទាត់ក្នុងកម្មវិធីធនាគាររបស់អ្នក" },

  // Table Headers / Labels
  "no": { en: "No.", kh: "ល.រ" },
  "method": { en: "Method", kh: "វិធីសាស្រ្ត" },
  "time": { en: "Time", kh: "ម៉ោង" },
  "recorded_at": { en: "Recorded At", kh: "បានកត់ត្រានៅម៉ោង" },
  "contributions": { en: "Contributions", kh: "ការចូលរួម" },
  "name": { en: "Name", kh: "ឈ្មោះ" },
  "amount": { en: "Amount", kh: "ទឹកប្រាក់" },
  "type": { en: "Type", kh: "ប្រភេទ" },
  "cash": { en: "Cash", kh: "សាច់ប្រាក់" },
  "bank": { en: "Bank", kh: "ធនាគារ" },
  "usd": { en: "USD", kh: "ដុល្លារ" },
  "riel": { en: "Riel", kh: "រៀល" },

  // Create/Edit Event Dialog
  "create_new_event": { en: "Create New Event", kh: "បង្កើតកម្មវិធីថ្មី" },
  "edit_event": { en: "Edit Event", kh: "កែប្រែកម្មវិធី" },
  "update_event_info": { en: "Update Event Information", kh: "ធ្វើបច្ចុប្បន្នភាពព័ត៌មានកម្មវិធី" },
  "event_title": { en: "Event Title", kh: "ឈ្មោះកម្មវិធី" },
  "banner_image": { en: "Banner Image", kh: "រូបភាពបដា" },
  "upload_banner": { en: "Click to upload banner", kh: "ចុចដើម្បីបញ្ចូលរូបភាព" },
  "current_banner": { en: "Current Banner", kh: "បដាបច្ចុប្បន្ន" },
  "change_banner": { en: "Change Banner", kh: "ប្តូរបដា" },
  "save_changes": { en: "Save Changes", kh: "រក្សាទុកការផ្លាស់ប្តូរ" },
  
  // Guest Management
  "total_usd": { en: "Total USD", kh: "សរុប (ដុល្លារ)" },
  "total_riel": { en: "Total Riel", kh: "សរុប (រៀល)" },
  "guest_list": { en: "Guest List", kh: "បញ្ជីភ្ញៀវ" },
  "guest_name": { en: "Guest Name", kh: "ឈ្មោះភ្ញៀវ" },
  "amount_usd": { en: "Amount USD ($)", kh: "ទឹកប្រាក់ (ដុល្លារ)" },
  "amount_khr": { en: "Amount Riel (៛)", kh: "ទឹកប្រាក់ (រៀល)" },
  "note": { en: "Note", kh: "កំណត់សម្គាល់" },
  "add_guest": { en: "Add Guest", kh: "បន្ថែមភ្ញៀវ" },
  "no_contributions": { en: "No contributions found.", kh: "មិនទាន់មានការចូលរួម" },
  "save_and_add": { en: "Save & Add Another", kh: "រក្សាទុក & បន្ថែមថ្មី" },
  "edit_contribution": { en: "Edit Contribution", kh: "កែប្រែការចូលរួម" },
  "new_contribution": { en: "New Contribution", kh: "បញ្ចូលការចូលរួមថ្មី" },
  "record_new_gift": { en: "Record New Gift", kh: "កត់ត្រាចំណងដៃថ្មី" },
  "edit_data": { en: "Edit Data", kh: "កែប្រែទិន្នន័យ" },
  "payment_cash": { en: "Cash", kh: "សាច់ប្រាក់" },
  "payment_bank": { en: "Bank / QR", kh: "ធនាគារ / QR" },
  "enter_name_placeholder": { en: "Enter name here...", kh: "វាយឈ្មោះនៅទីនេះ..." },
  "guests": { en: "Guests", kh: "ភ្ញៀវកិត្តិយស" },
  "thank_you": { en: "Thank You", kh: "អរគុណ" },
  "save_entry": { en: "Save Entry", kh: "រក្សាទុក" },
  "no_records_found": { en: "No records found", kh: "រកមិនឃើញទិន្នន័យ" },
  "delete_guest_confirm": { en: "Are you sure you want to delete this guest?", kh: "តើអ្នកពិតជាចង់លុបភ្ញៀវនេះមែនទេ?" },
  "guest_deleted": { en: "Guest deleted", kh: "បានលុបភ្ញៀវ" },
  "failed_delete_guest": { en: "Failed to delete guest", kh: "បរាជ័យក្នុងការលុបភ្ញៀវ" },
  "delete_event_confirm_title": { en: "Delete Event?", kh: "តើអ្នកចង់លុបកម្មវិធីមែនទេ?" },
  "delete_event_confirm_desc": { en: "Permanently remove {{title}} and all guest data?", kh: "លុបកម្មវិធី {{title}} និងទិន្នន័យភ្ញៀវទាំងអស់ជាអចិន្ត្រៃយ៍?" },

  // Public Settings
  "public_settings": { en: "Public Settings", kh: "ការកំណត់សាធារណៈ" },
  "public_controls": { en: "Online Controls", kh: "ការគ្រប់គ្រងតាមប្រព័ន្ធ" },
  "privacy_pin": { en: "Privacy PIN (4-Digits)", kh: "លេខកូដសម្ងាត់ (៤ខ្ទង់)" },
  "locked": { en: "Locked", kh: "បានចាក់សោ" },
  "privacy_pin_desc": { en: "If set, guests must enter this code to enter the website.", kh: "ប្រសិនបើកំណត់ ភ្ញៀវត្រូវបញ្ចូលលេខកូដនេះដើម្បីចូលមើលគេហទំព័រ។" },
  "show_guest_names": { en: "Show Guest Names", kh: "បង្ហាញឈ្មោះភ្ញៀវ" },
  "public_wall_visibility": { en: "Public Wall visibility", kh: "ការបង្ហាញនៅលើជញ្ជាំងសាធារណៈ" },
  "digital_gift_qr": { en: "Digital Gift QR (KHQR)", kh: "រូបភាព QR (KHQR) ចងដៃ" },
  "upload": { en: "Upload", kh: "ផ្ទេររូបភាព" },
  "publish_changes": { en: "Publish Changes", kh: "រក្សាទុកការផ្លាស់ប្តូរ" },
  "safety_active": { en: "Safety Active", kh: "សុវត្ថិភាពសកម្ម" },
  "public_access": { en: "Public access", kh: "ការចូលមើលជាសាធារណៈ" },
  "pin_protection_active": { en: "PIN protection is ACTIVE", kh: "ជម្រើសការពារដោយលេខកូដសម្ងាត់សកម្ម" },
  "guests_scan_qr_desc": { en: "Guests scan this QR to view countdown and wall.", kh: "ភ្ញៀវស្កេន QR នេះដើម្បីមើលការរាប់ថយក្រោយ និងបញ្ជីឈ្មោះ។" },

  // Public Event Page
  "content_protected": { en: "Content Protected", kh: "ខ្លឹមសារត្រូវបានការពារ" },
  "enter_pin_desc": { en: "Please enter the 4-digit PIN to continue", kh: "សូមបញ្ចូលលេខកូដសម្ងាត់ ៤ ខ្ទង់ដើម្បីបន្ត" },
  "enter_event": { en: "Enter Event", kh: "ចូលមើលកម្មវិធី" },
  "private_event_access": { en: "Private Event Access", kh: "ការចូលប្រើប្រាស់កម្មវិធីឯកជន" },
  "ceremony_details": { en: "Ceremony Details", kh: "ព័ត៌មានលម្អិតនៃពិធី" },
  "countdown": { en: "Countdown", kh: "រាប់ថយក្រោយ" },
  "no_guest_public": { en: "No contributions yet. Be the first!", kh: "មិនទាន់មានការចូលរួមនៅឡើយទេ។ ក្លាយជាអ្នកដំបូង!" },
  "link_copied": { en: "Link copied!", kh: "បានចម្លងតំណភ្ជាប់!" },
  "scan_to_congratulate": { en: "Scan to Congratulate", kh: "ស្កេនដើម្បីចូលរួមអបអរសាទរ" },
  "digital_gift_khqr": { en: "Digital Gift (KHQR)", kh: "ចងដៃតាមរយៈ (KHQR)" },
  "digital_gift_desc": { en: "For those who cannot attend in person, you can scan to send your best wishes.", kh: "សម្រាប់លោកអ្នកដែលមិនបានមកចូលរួមផ្ទាល់ លោកអ្នកអាចស្កេនដើម្បីផ្ញើសារអបអរសាទរ។" },
  "thank_you_guests": { en: "Thank You Honored Guests", kh: "សូមអរគុណភ្ញៀវកិត្តិយស" },
  "join_guests_celebrating": { en: "Join our guests in celebrating this special occasion.", kh: "ចូលរួមជាមួយភ្ញៀវកិត្តិយសក្នុងការអបអរសាទរកម្មវិធីដ៏ពិសេសនេះ។" },

  // Toasts & Validations
  "validation_enter_name": { en: "Please enter guest name", kh: "សូមបញ្ចូលឈ្មោះភ្ញៀវ" },
  "fill_all_fields": { en: "Please fill all required fields", kh: "សូមបំពេញព័ត៌មានដែលចាំបាច់" },
  "toast_updated": { en: "Updated", kh: "បានកែប្រែ" },
  "toast_recorded": { en: "Recorded", kh: "បានកត់ត្រា" },
  "toast_failed_save": { en: "Failed to save", kh: "បរាជ័យក្នុងការរក្សាទុក" },
  "copied_thank_you": { en: "Thank you message copied to clipboard!", kh: "សារថ្លែងអំណរគុណត្រូវបានចម្លងទុក!" },
  "incorrect_pin": { en: "Incorrect PIN. Please try again.", kh: "លេខកូដសម្ងាត់មិនត្រឹមត្រូវ។ សូមព្យាយាមម្តងទៀត។" },

  // Landing Page
  "landing_title": { en: "The Modern Way to Track Event Contributions", kh: "វិធីទំនើបក្នុងការកត់ត្រាចំណងដៃ" },
  "landing_subtitle": { en: "Say goodbye to messy paper lists. Banhchi helps you manage guest lists, track monetary gifts in real-time.", kh: "លាហើយបញ្ជីក្រដាស។ Banhchi ជួយអ្នកក្នុងការគ្រប់គ្រងបញ្ជីភ្ញៀវ កត់ត្រាចំណងដៃ និងសរុបថវិកាបានភ្លាមៗ។" },
  "get_started": { en: "Get Started", kh: "ចាប់ផ្តើមប្រើប្រាស់" },
  "learn_more": { en: "Learn more", kh: "ស្វែងយល់បន្ថែម" },
  "new_feature": { en: "New: Multi-currency support for Riel & USD", kh: "ថ្មី៖ អាចកត់ត្រាជារូបិយប័ណ្ណ រៀល និង ដុល្លារ" },

  // Page specific
  "event_not_found": { en: "Event Not Found", kh: "រកមិនឃើញកម្មវិធី" },
  "event_not_found_desc": { en: "The event you are looking for does not exist or has been removed.", kh: "កម្មវិធីដែលអ្នកកំពុងស្វែងរកមិនមាន ឬត្រូវបានលុបចោល" },
  "back_to_home": { en: "Back to Home", kh: "ត្រលប់ទៅទំព័រដើម" },
  "all_rights_reserved": { en: "All rights reserved", kh: "រក្សាសិទ្ធិគ្រប់យ៉ាង" },
  "footer_tagline": { en: "Making event management simple and beautiful", kh: "ធ្វើឱ្យការគ្រប់គ្រងកម្មវិធីងាយស្រួល និងស្រស់ស្អាត" },
  "no_events_desc": { en: "Check back soon for upcoming events and celebrations", kh: "សូមរង់ចាំកម្មវិធីថ្មីៗនាពេលឆាប់ៗខាងមុខនេះ" },
  "view_event_details": { en: "View Event Details", kh: "មើលព័ត៌មានកម្មវិធី" },
  "featured_event": { en: "Featured Event", kh: "កម្មវិធីដែលគួរឱ្យចាប់អារម្មណ៍" },
  "all_events": { en: "All Events", kh: "កម្មវិធីទាំងអស់" },
  "explore_complete_info": { en: "Explore complete event information and guest contributions", kh: "ស្វែងយល់ព័ត៌មានលម្អិតអំពីកម្មវិធី" },
  "browse_all_celebrations": { en: "Browse all celebrations", kh: "ស្វែងរកកម្មវិធីដែលនឹងមកដល់" },
  
  // Template & Dynamic Fields
  "wedding": { en: "Wedding", kh: "អាពាហ៍ពិពាហ៍" },
  "funeral": { en: "Funeral / Ceremony", kh: "បុណ្យទាន" },
  "custom": { en: "Custom Template", kh: "អ្នកកំណត់ខ្លួនឯង" },
  "template": { en: "Template", kh: "គំរូកម្មវិធី" },
  "contribution_fields": { en: "Contribution Fields", kh: "ប្រភេទចំណងដៃ" },
  "field_label": { en: "Field Label", kh: "ឈ្មោះប្រភេទ" },
  "field_type": { en: "Field Type", kh: "ប្រភេទ" },
  "field_unit": { en: "Unit (e.g. kg)", kh: "ឯកតា (ឧ. គីឡូ)" },
  "add_field": { en: "Add Field", kh: "បន្ថែមប្រភេទ" },
  "remove_field": { en: "Remove", kh: "លុបចេញ" },
  "money_usd": { en: "Money ($ USD)", kh: "ប្រាក់ ($ USD)" },
  "money_khr": { en: "Money (៛ KHR)", kh: "ប្រាក់ (៛ KHR)" },
  "number_item": { en: "Number / Item", kh: "ចំនួន / របស់របរ" },
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");

  useEffect(() => {
    const saved = localStorage.getItem("language") as Language;
    if (saved) {
      setLanguage(saved);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("language", lang);
    // Update HTML lang attribute for font switching logic in globals.css
    document.documentElement.lang = lang;
  };

  const t = (key: string): string => {
    return translations[key]?.[language] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
