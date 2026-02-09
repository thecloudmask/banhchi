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
  "app_name": { en: "Banhchi", kh: "បញ្ជី" },
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
  "event": { en: "Event", kh: "កម្មវិធី" },
  "article": { en: "Article", kh: "អត្ថបទ" },
  "agenda": { en: "Agenda", kh: "កម្មវិធីបុណ្យ" },
  
  // Status Labels
  "active": { en: "Upcoming", kh: "ជិតមកដល់" },
  "completed": { en: "Completed", kh: "ចប់រួចរាល់" },
  "upcoming": { en: "Upcoming", kh: "ជិតមកដល់" },
  "status": { en: "Status", kh: "ស្ថានភាព" },

  // Event Details labels
  "location": { en: "Location", kh: "ទីតាំង" },
  "event_gallery": { en: "Event Gallery", kh: "រូបភាពសកម្មភាព" },
  "gallery": { en: "Gallery", kh: "រូបភាព" },
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
  "events": { en: "Featured Event", kh: "កម្មវិធីដែលគួរឱ្យចាប់អារម្មណ៍" },
  "all_events": { en: "All Events", kh: "កម្មវិធីទាំងអស់" },
  "browse_all_celebrations": { en: "Browse all celebrations", kh: "ស្វែងរកកម្មវិធីទាំងអស់" },
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
  "event_category": { en: "Event Category", kh: "ប្រភេទកម្មវិធី" },
  
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
  
  // Expense Management
  "expenses": { en: "Expenses", kh: "ចំណាយ" },
  "add_expense": { en: "Add Expense", kh: "បន្ថែមចំណាយ" },
  "edit_expense": { en: "Edit Expense", kh: "កែប្រែចំណាយ" },
  "expense_name": { en: "Item Name", kh: "ឈ្មោះទំនិញ/សេវាកម្ម" },
  "budget_plan": { en: "Planned Amount", kh: "គម្រោងចំណាយ" },
  "actual_expense": { en: "Actual Spending", kh: "ចំណាយជាក់ស្ដែង" },
  "invoice_number": { en: "Invoice No.", kh: "លេខវិក័យបត្រ" },
  "delete_expense_confirm": { en: "Are you sure you want to delete this expense?", kh: "តើអ្នកពិតជាចង់លុបចំណាយនេះមែនទេ?" },
  "expense_deleted": { en: "Expense deleted", kh: "បានលុបចំណាយ" },
  "failed_delete_expense": { en: "Failed to delete expense", kh: "បរាជ័យក្នុងការលុបចំណាយ" },
  "currency": { en: "Currency", kh: "រូបិយប័ណ្ណ" },
  "spending_usd": { en: "Actual Spending (USD)", kh: "ចំណាយជាក់ស្ដែង (ដុល្លារ)" },
  "spending_khr": { en: "Actual Spending (KHR)", kh: "ចំណាយជាក់ស្ដែង (រៀល)" },
  "planned": { en: "Total Planned", kh: "សរុបគម្រោង" },
  "items": { en: "items", kh: "មុខ" },
  "grand_total": { en: "Grand Total", kh: "សរុបទាំងអស់" },
  "net_worth_usd_label": { en: "Net Worth (Combined USD)", kh: "ទឹកប្រាក់សរុប (ដុល្លារ)" },
  "total_gift_riel": { en: "Total Gift (Riel)", kh: "ចំណងដៃសរុប (រៀល)" },
  "cash_subtotal": { en: "Cash Subtotal", kh: "សរុបសាច់ប្រាក់សុទ្ធ" },
  "bank_subtotal": { en: "Bank Subtotal", kh: "សរុបតាមធនាគារ" },
  "print_no": { en: "No.", kh: "ល.រ" },
  "total_budget_plan": { en: "Total Planned Budget", kh: "គម្រោងចំណាយសរុបទាំងអស់" },
  "generate_invoice": { en: "Generate Invoice Number", kh: "បង្កើតលេខវិក្កយបត្រ" },
  "payment": { en: "Payment", kh: "ការបង់ប្រាក់" },
  "all_methods": { en: "All Methods", kh: "គ្រប់វិធី" },
  "all_locations": { en: "All Locations", kh: "គ្រប់ទីតាំង" },
  "clear": { en: "Clear", kh: "សម្អាត" },
  "expense_list": { en: "Expense List", kh: "បញ្ជីចំណាយ" },

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
  "landing_title": { en: "Your Digital Event Companion", kh: "ដៃគូដ៏ល្អសម្រាប់គ្រប់គ្រងកម្មវិធីរបស់អ្នក" },
  "landing_subtitle": { en: "Create, organize, and manage all your special temple merit-making events and community ceremonies in one place. Keep track of every detail and contribution effortlessly.", kh: "បង្កើត រៀបចំ និងគ្រប់គ្រងកម្មវិធីបុណ្យផ្កា បុណ្យកុសល និងពិធីបុណ្យផ្សេងៗក្នុងវត្តអារាមនៅកន្លែងតែមួយ។ កត់ត្រារាល់ការចូលរួមយ៉ាងងាយស្រួល។" },
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

  "explore_complete_info": { en: "Explore complete event information and guest contributions", kh: "ស្វែងយល់ព័ត៌មានលម្អិតអំពីកម្មវិធី" },

  // About Section
  "about_title": { en: "Banhchi - Modernizing the Khmer Jongdai Tradition", kh: "បញ្ជី (Banhchi) - ទំនើបកម្មនៃប្រពៃណីចងដៃខ្មែរ" },
  "about_slogan": { en: "Record with confidence, preserve tradition with technology.", kh: "កត់ត្រាដោយទំនុកចិត្ត រក្សាប្រពៃណីដោយបច្ចេកវិទ្យា" },
  
  "mission_title": { en: "Our Mission", kh: "បេសកកម្មរបស់យើង" },
  "mission_desc": { en: "Banhchi was created with a single purpose: to transform the 'Jongdai Book' from paper into a smart, secure digital system. We understand that organizing each ceremony is very busy, so accurate and fast recording is essential.", kh: "\"បញ្ជី\" ត្រូវបានបង្កើតឡើងក្នុងគោលបំណងតែមួយគត់៖ ប្រែក្លាយ \"សៀវភៅកត់ចំណងដៃ\" ពីក្រដាស ឱ្យទៅជាប្រព័ន្ធឌីជីថលដ៏ឆ្លាតវៃ និងមានសុវត្ថិភាព។ យើងយល់ច្បាស់ថា ការរៀបចំកម្មវិធីបុណ្យនីមួយៗមានភាពមមាញឹកខ្លាំង ដូច្នេះការកត់ត្រាដែលត្រឹមត្រូវ និងរហ័ស គឺជាកត្តាចាំបាច់បំផុត។" },
  
  "why_banhchi_title": { en: "Why Banhchi?", kh: "ហេតុអ្វីជ្រើសរើស \"បញ្ជី\"?" },
  "why_banhchi_desc": { en: "Our system is not just a simple money table, but specially designed for the Cambodian context:", kh: "ប្រព័ន្ធរបស់យើងមិនមែនគ្រាន់តែជាតារាងកត់លុយធម្មតាទេ ប៉ុន្តែវាត្រូវបានរចនាឡើងយ៉ាងពិសេសសម្រាប់បរិបទស្រុកខ្មែរ៖" },
  
  "dual_currency_title": { en: "Dual Currency", kh: "ប្រព័ន្ធរូបិយប័ណ្ណពីរ" },
  "dual_currency_desc": { en: "We solve the headache of adding Dollars ($) and Riel (៛) together. The system will separate and total them for you instantly without errors.", kh: "យើងដោះស្រាយបញ្ហាឈឺក្បាលនៃការបូកលុយ ដុល្លារ ($) និង រៀល (៛) បញ្ចូលគ្នា។ ប្រព័ន្ធនឹងបំបែក និងបូកសរុបជូនលោកអ្នកភ្លាមៗដោយគ្មានកំហុស។" },
  
  "materials_supported_title": { en: "Materials Supported", kh: "មិនមែនទទួលតែលុយ" },
  "materials_supported_desc": { en: "For ceremonies, we know that material contributions (like rice, water, beer) still exist. Banhchi allows you to define and record those items easily.", kh: "សម្រាប់កម្មវិធីបុណ្យទាន យើងដឹងថាការចូលបុណ្យជាសម្ភារៈ (ដូចជា អង្ករ, ទឹកសុទ្ធ, ស្រាបៀរ) នៅតែមាន។ \"បញ្ជី\" អនុញ្ញាតឱ្យលោកអ្នកកំណត់ និងកត់ត្រាវត្ថុទាំងនោះបានយ៉ាងងាយស្រួល។" },
  
  "elder_friendly_title": { en: "Elder-Friendly", kh: "ងាយស្រួលសម្រាប់មនុស្សគ្រប់វ័យ" },
  "elder_friendly_desc": { en: "We design large buttons and simple functions that even elders or those less tech-savvy can use proficiently.", kh: "យើងរចនាប៊ូតុងធំៗ និងមុខងារសាមញ្ញ ដែលសូម្បីតែចាស់ទុំ ឬអ្នកមិនសូវចេះបច្ចេកវិទ្យា ក៏អាចប្រើប្រាស់បានយ៉ាងស្ទាត់ជំនាញ។" },
  
  "security_privacy_title": { en: "Security & Privacy", kh: "សុវត្ថិភាព និងឯកជនភាព" },
  "security_privacy_desc": { en: "Every contribution record is the 'secret' of the event owner.", kh: "រាល់ទិន្នន័យចំណងដៃ គឺជា \"អាថ៌កំបាំង\" របស់ម្ចាស់កម្មវិធី។" },
  "admin_privacy": { en: "Admin: Only the event owner can see figures and guest lists.", kh: "ផ្នែក Admin: មានតែម្ចាស់កម្មវិធីប៉ុណ្ណោះដែលអាចមើលឃើញតួលេខ និងបញ្ជីឈ្មោះ។" },
  "public_privacy": { en: "Public: Guests can only see event info, map, and QR Code for participation.", kh: "ផ្នែក Public: ភ្ញៀវអាចមើលឃើញតែព័ត៌មានកម្មវិធី ផែនទី និង QR Code សម្រាប់ចូលរួមប៉ុណ្ណោះ។" },
  
  "team_title": { en: "The Team", kh: "អំពីក្រុមការងារ" },
  "team_desc": { en: "Created by Khmer children who love technology and want to preserve the culture of reciprocity to remain in the digital age.", kh: "បង្កើតឡើងដោយកូនខ្មែរ ដែលស្រលាញ់បច្ចេកវិទ្យា និងចង់ថែរក្សាវប្បធម៌នៃការជួយគ្នាទៅវិញទៅមក (Reciprocity) ឱ្យនៅគង់វង្សតាមសម័យកាលឌីជីថល។" },

  "feature_auto_calc": { en: "Auto Calculation", kh: "គណនាលុយស្វ័យប្រវត្តិ" },
  "feature_materials": { en: "Material Recording", kh: "កត់ត្រាសម្ភារៈ" },
  "feature_location": { en: "Event Location", kh: "បង្ហាញទីតាំងកម្មវិធី" },
  "feature_security": { en: "Data Security", kh: "សុវត្ថិភាពទិន្នន័យ" },
  
  "testimonial_text": { en: "\"Very easy to use! Before I had to spend all night counting money and checking the book, now just one click to see the figures immediately.\"", kh: "\"ស្រួលប្រើណាស់! ពីមុនខ្ញុំត្រូវចំណាយពេលរាប់លុយនិងផ្ទៀងសៀវភៅពេញមួយយប់ ឥឡូវចុចតែមួយភ្លែតឃើញតួលេខម៉ង។\"" },
  "testimonial_author": { en: "User", kh: "អ្នកប្រើប្រាស់" },

  
  // Template & Dynamic Fields
  "wedding": { en: "Wedding", kh: "អាពាហ៍ពិពាហ៍" },
  "merit_making": { en: "Merit-making / Flower Ceremony", kh: "បុណ្យផ្កាប្រាក់សាមគ្គី" },
  "memorial": { en: "Memorial Service", kh: "បុណ្យទក្ខិណានុប្បទាន" },
  "inauguration": { en: "Temple Inauguration", kh: "បុណ្យឆ្លងប្រាង្គ/ឆ្លងកុដិ" },
  "funeral": { en: "Funeral", kh: "បុណ្យសព" },
  "custom": { en: "Other / Custom", kh: "កម្មវិធីផ្សេងៗ" },
  "enter_custom_category": { en: "Enter ceremony type", kh: "បញ្ចូលប្រភេទកម្មវិធីបុណ្យ" },
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

  // System Info
  "system_info": { en: "System Information", kh: "ព័ត៌មានប្រព័ន្ធ" },
  "app_details": { en: "App Details", kh: "ព័ត៌មានកម្មវិធី" },
  "app_name_label": { en: "App Name", kh: "ឈ្មោះកម្មវិធី" },
  "version_label": { en: "Version", kh: "ជំនាន់ (Version)" },
  "update_date_label": { en: "Last Updated", kh: "កាលបរិច្ឆេទអាប់ដេត" },
  "ownership": { en: "Ownership", kh: "កម្មសិទ្ធិបញ្ញា" },
  "developed_for": { en: "Developed For", kh: "ត្រូវបានអភិវឌ្ឍជូន" },
  "copyright_by": { en: "Copyright By", kh: "រក្សាសិទ្ធិដោយ" },
  "tech_support": { en: "Technical Support", kh: "ជំនួយបច្ចេកទេស" },
  "support_desc": { en: "If you encounter any issues, please contact the development team:", kh: "បើមានបញ្ហាក្នុងការប្រើប្រាស់ ឬប្រព័ន្ធគាំង សូមទាក់ទងមកក្រុមការងារអភិវឌ្ឍន៍៖" },
  "developed_by": { en: "Developed By", kh: "អភិវឌ្ឍដោយ" },
  "working_hours": { en: "Working Hours", kh: "ម៉ោងធ្វើការ" },
  "client_name_placeholder": { en: "Event Host / Company", kh: "ម្ចាស់កម្មវិធី" },
  "dev_team_name": { en: "Banhchi Tech Team", kh: "ក្រុមការងារបច្ចេកទេសបញ្ជី" },
  "payment_method": { en: "Payment Method", kh: "វិធីបង់ប្រាក់" },
  "elder_interface_tagline": { en: "Simple and Easy to Use", kh: "សាមញ្ញ ងាយស្រួលប្រើប្រាស់" },
  "total_contributions": { en: "Total Contributions", kh: "ការចូលរួមសរុប" },
  "digital_transfers": { en: "Digital Transfers", kh: "វេរតាមធនាគារ" },
  "recent_activity": { en: "Recent Activity", kh: "សកម្មភាពថ្មីៗ" },
  "admin_audit_logs": { en: "Admin Audit Logs", kh: "កំណត់ត្រាក្រុមការងារ" },
  "no_activity_yet": { en: "No activity yet", kh: "មិនទាន់មានសកម្មភាព" },
  "activity": { en: "Activity", kh: "សកម្មភាព" },
  "print_report": { en: "Print Report", kh: "បោះពុម្ពបញ្ជី" },
  "currency_breakdown": { en: "Currency Breakdown", kh: "បំណែងចែករូបិយប័ណ្ណ" },
  "total_guests": { en: "Total Guests", kh: "ភ្ញៀវសរុប" },
  "qr_transfers": { en: "QR Transfers", kh: "វេរតាម QR" },
  "total_contribution": { en: "Total Contribution", kh: "ការចូលរួមសរុប" },

  // Content Management
  "create_content": { en: "Create Content", kh: "បង្កើតមាតិកា" },
  "create_content_desc": { en: "Add new background story, program or announcement", kh: "បន្ថែមប្រវត្តិកម្មវិធី កម្មវិធីបុណ្យ ឬសេចក្តីជូនដំណឹង" },
  "edit_content": { en: "Edit Content", kh: "កែប្រែមាតិកា" },
  "edit_content_desc": { en: "Update content details", kh: "ធ្វើបច្ចុប្បន្នភាពព័ត៌មាន" },
  "general_info": { en: "General Information", kh: "ព័ត៌មានទូទៅ" },
  "content_title": { en: "Title", kh: "ចំណងជើង" },
  "content_type": { en: "Content Type", kh: "ប្រភេទមាតិកា" },
  "select_best_fit": { en: "Select best fit", kh: "ជ្រើសរើសប្រភេទដែលសមស្រប" },
  "article_blog": { en: "Ceremony Background", kh: "ប្រវត្តិកម្មវិធី / រឿងរ៉ាវ" },
  "article_blog_desc": { en: "History, significance, or background stories with images.", kh: "ព័ត៌មានពីប្រវត្តិបុណ្យ ឬអត្ថបទរឿងរ៉ាវផ្សេងៗ" },
  "agenda_poster": { en: "Detailed Program", kh: "កាលវិភាគ / កម្មវិធីបុណ្យ" },
  "agenda_poster_desc": { en: "Formal schedule and agenda of ceremonial activities.", kh: "បង្ហាញពីកាលវិភាគ និងកម្មវិធីបុណ្យលម្អិត" },
  "announcement": { en: "Notice / Update", kh: "សេចក្តីជូនដំណឹង" },
  "announcement_desc": { en: "Brief notices or important updates for guests.", kh: "សេចក្តីជូនដំណឹងខ្លីៗ ឬព័ត៌មានបន្ថែមសម្រាប់ភ្ញៀវ" },
  "poster": { en: "Invitation / Poster", kh: "លិខិតអញ្ជើញ / រូបភាពប័ណ្ណ" },
  "poster_desc": { en: "Digital invitation or ceremony poster image.", kh: "សម្រាប់ដាក់រូបភាពលិជិតអញ្ជើញ ឬប័ណ្ណប្រកាស" },
  "link_to_event": { en: "Link to Event", kh: "ភ្ជាប់ជាមួយកម្មវិធី" },
  "optional": { en: "Optional", kh: "ជម្រើសបន្ថែម" },
  "no_linking": { en: "No Linking (Standalone Content)", kh: "មិនមានការភ្ជាប់ (អត្ថបទឯករាជ្យ)" },
  "short_description": { en: "Short Description / Excerpt", kh: "ការពិពណ៌នាសង្ខេប" },
  "short_description_desc": { en: "A brief summary (1-2 sentences) shown on the card preview.", kh: "សេចក្តីសង្ខេបខ្លី (១-២ ឃ្លា) សម្រាប់បង្ហាញលើកាត" },
  "thumbnail_image": { en: "Thumbnail Image", kh: "រូបភាពតំណាង" },
  "thumbnail_desc": { en: "Main image displayed on news feed cards.", kh: "រូបភាពចម្បងដែលបង្ហាញលើកាតព័ត៌មាន" },
  "agenda_schedule": { en: "Agenda / Schedule", kh: "កម្មវិធីបុណ្យ / កាលវិភាគ" },
  "agenda_desc": { en: "Define the schedule for the poster view.", kh: "កំណត់កាលវិភាគសម្រាប់បង្ហាញលើ Poster" },
  "add_item": { en: "Add Item", kh: "បន្ថែមចំណុច" },
  "time_placeholder": { en: "Time (e.g., 07:00 AM)", kh: "ម៉ោង (ឧ. ០៧:០០ ព្រឹក)" },
  "activity_desc": { en: "Activity description", kh: "ការពិពណ៌នាសកម្មភាព" },
  "committee_organizers": { en: "Committee / Organizers", kh: "អ្នកផ្តើមបុណ្យ / គណៈកម្មការ" },
  "committee_desc": { en: "List key people or groups shown on the poster.", kh: "បញ្ជីឈ្មោះអ្នកផ្តើមបុណ្យដែលបង្ហាញលើ Poster" },
  "add_group": { en: "Add Group", kh: "បន្ថែមក្រុម" },
  "role_label": { en: "Role / Title", kh: "តួនាទី / ងារ" },
  "role_placeholder": { en: "e.g. គណៈកម្មការបុណ្យ", kh: "ឧ. គណៈកម្មការបុណ្យ" },
  "members_label": { en: "Members (Comma separated)", kh: "សមាជិក (បំបែកដោយសញ្ញាក្បៀស)" },
  "members_placeholder": { en: "e.g. លោក A, លោក B, លោក C", kh: "ឧ. លោក A, លោក B, លោក C" },
  "full_content_body": { en: "Full Content / Article Body", kh: "ខ្លឹមសារទាំងមូល / អត្ថបទ" },
  "full_content_desc": { en: "Write your full article here. You can insert images, format text, and add links.", kh: "សរសេរអត្ថបទពេញលេញនៅទីនេះ។ អ្នកអាចដាក់រូបភាព រៀបចំអក្សរ និងដាក់តំណភ្ជាប់។" },
  "publish_content": { en: "Publish Content", kh: "ចុះផ្សាយមាតិកា" },
  "saving_content": { en: "Saving...", kh: "កំពុងរក្សាទុក..." },
  "updating_content": { en: "Updating...", kh: "កំពុងធ្វើបច្ចុប្បន្នភាព..." },
  "update_content_btn": { en: "Update Content", kh: "កែប្រែមាតិកា" },
  "title_required": { en: "Title is required", kh: "សូមបញ្ចូលចំណងជើង" },
  "content_created": { en: "Content created successfully", kh: "បង្កើតមាតិកាទទួលបានជោគជ័យ" },
  "content_updated": { en: "Content updated successfully", kh: "កែប្រែមាតិកាទទួលបានជោគជ័យ" },
  "failed_create_content": { en: "Failed to create content", kh: "មិនអាចបង្កើតមាតិកាបានទេ" },
  "failed_update_content": { en: "Failed to update content", kh: "មិនអាចកែប្រែមាតិកាបានទេ" },
  "no_contents": { en: "No Contents found", kh: "មិនទាន់មានមាតិកា" },
  "create_first_content": { en: "Create your first article or announcement", kh: "សូមបង្កើតអត្ថបទ ឬសេចក្តីជូនដំណឹងដំបូងរបស់អ្នក" },
  "delete_confirm": { en: "Delete Content?", kh: "តើអ្នកចង់លុបមាតិកានេះមែនទេ?" },
  "delete_confirm_desc": { en: "Are you sure you want to permanently remove this content?", kh: "តើអ្នកពិតជាចង់លុបមាតិកានេះជាអចិន្ត្រៃយ៍មែនទេ?" },
  "no_description": { en: "No description provided", kh: "មិនមានការពិពណ៌នា" },
  "contents": { en: "Manage Contents", kh: "គ្រប់គ្រងមាតិកា" },
  "manage_articles": { en: "Articles & Announcements", kh: "អត្ថបទ និងសេចក្តីជូនដំណឹង" },
  "linked": { en: "Linked", kh: "បានភ្ជាប់" },
  "digital_companion": { en: "Digital Event Companion", kh: "ដៃគូឌីជីថលសម្រាប់កម្មវិធីរបស់អ្នក" },
  "written_by": { en: "Written By", kh: "សរសេរដោយ" },
  "share_article": { en: "Share this article", kh: "ចែករំលែកអត្ថបទនេះ" },
  "feed_title": { en: "News & Community", kh: "ព័ត៌មាន និងសេចក្តីជូនដំណឹង" },
  "feed_desc": { en: "Stay updated with the latest stories, announcements, and event highlights.", kh: "បន្តទទួលបានព័ត៌មានថ្មីៗ រឿងរ៉ាវប្លែកៗ និងសេចក្តីជូនដំណឹងពីកម្មវិធីនានា។" },
  "browse_categories": { en: "Browse by Category", kh: "រុករកតាមប្រភេទ" },
  "wedding_desc": { en: "Merit-making & traditional temple events", kh: "បុណ្យផ្កា បុណ្យកុសល និងកម្មវិធីវត្តអារាម" },
  "funeral_desc": { en: "Religious ceremony & commemorative honors", kh: "ការរៀបចំកម្មវិធីបុណ្យ និងកិច្ចពិធីសាសនា" },
  "updates_desc": { en: "Latest announcements & agendas", kh: "សេចក្តីជូនដំណឹង និងកម្មវិធីបុណ្យថ្មីៗ" },
  "live_updates": { en: "Live Updates", kh: "អត្ថបទថ្មីៗ" },
  "view_details": { en: "View Details", kh: "មើលព័ត៌មានលម្អិត" },
  "content_updates": { en: "Announcements & Stories", kh: "ព័ត៌មាន និងសេចក្តីជូនដំណឹង" },
  "upcoming_celebrations": { en: "Upcoming Events", kh: "កម្មវិធីដែលនឹងមកដល់" },

  // Added missing translations
  "manage_contents": { en: "Manage Contents", kh: "គ្រប់គ្រងមាតិកា" },
  "basic_event_details": { en: "Basic Event Details", kh: "ព័ត៌មានមូលដ្ឋាននៃកម្មវិធី" },
  "event_title_placeholder": { en: "e.g. Merit-making of Sangkat...", kh: "ឧ. កម្មវិធីបុណ្យផ្កាសាមគ្គី..." },
  "venue_name_placeholder": { en: "Venue Name", kh: "ឈ្មោះទីកន្លែង" },
  "map_pin_url": { en: "Map Pin URL", kh: "តំណភ្ជាប់ផែនទី" },
  "google_maps_link_placeholder": { en: "Google Maps Link", kh: "តំណភ្ជាប់ Google Maps" },
  "banner_image_optional": { en: "Banner Image (Optional)", kh: "រូបភាពបដា (ជម្រើស)" },
  "click_choosing_image": { en: "Click to choose image", kh: "ចុចដើម្បីជ្រើសរើសរូបភាព" },
  "exchange_rate_info": { en: "Rate: 1 USD = 4,000 KHR", kh: "អត្រាប្តូរប្រាក់៖ ១ ដុល្លារ = ៤,០០០ រៀល" },
  "enter_location": { en: "Enter location", kh: "បញ្ចូលទីតាំង" },
  "optional_tag": { en: "(Optional)", kh: "(ជម្រើស)" },
  "amount_usd_label": { en: "Amount ($ USD)", kh: "ទឹកប្រាក់ ($ ដុល្លារ)" },
  "amount_khr_label": { en: "Amount (៛ KHR)", kh: "ទឹកប្រាក់ (៛ រៀល)" },
  "select_payment_method": { en: "Select payment method", kh: "ជ្រើសរើសវិធីបង់ប្រាក់" },
  "other_bank": { en: "Other Bank", kh: "ធនាគារផ្សេងទៀត" },
  "update_banner": { en: "Update Banner", kh: "បច្ចុប្បន្នភាពបដា" },
  "settings_updated": { en: "Settings updated", kh: "បច្ចុប្បន្នភាពការកំណត់ត្រូវបានជោគជ័យ" },
  "failed_update_settings": { en: "Failed to update settings", kh: "បរាជ័យក្នុងការធ្វើបច្ចុប្បន្នភាពការកំណត់" },
  "pin_digit_error": { en: "PIN must be 4 digits", kh: "លេខកូដសម្ងាត់ត្រូវតែមាន ៤ ខ្ទង់" },
  "toast_deleted": { en: "Deleted", kh: "បានលុប" },
  "toast_failed_delete": { en: "Failed to delete", kh: "មិនអាចលុបបានទេ" },
  "filter_all": { en: "All", kh: "ទាំងអស់" },
  "filter_events": { en: "Events", kh: "កម្មវិធី" },
  "filter_articles": { en: "Articles", kh: "អត្ថបទ" },
  "filter_agendas": { en: "Agendas", kh: "កម្មវិធីបុណ្យ" },
  "filter_posters": { en: "Posters", kh: "លិខិតអញ្ជើញ" },
  "no_results": { en: "No results found", kh: "រកមិនឃើញទិន្នន័យ" },
  "try_different_search": { en: "Try a different search term", kh: "សូមព្យាយាមស្វែងរកពាក្យផ្សេងទៀត" },
  "clear_all_filters": { en: "Clear all filters", kh: "សម្អាតការកំណត់ទាំងអស់" },
  "view_website": { en: "View Website", kh: "មើលគេហទំព័រ" },
  "banhchi_system": { en: "Banhchi System", kh: "ប្រព័ន្ធបញ្ជី (Banhchi)" },
  "discover_more": { en: "Discover More", kh: "ស្វែងរកបន្ថែម" },
  
  // Support Page
  "call_directly": { en: "Call Directly", kh: "ហៅទូរស័ព្ទផ្ទាល់" },
  "urgent_issues_desc": { en: "Fastest for urgent issues", kh: "រហ័សបំផុតសម្រាប់ករណីបន្ទាន់" },
  "telegram_support": { en: "Telegram Support", kh: "ជំនួយតាមតេឡេក្រាម" },
  "message_anytime": { en: "Message us anytime", kh: "ផ្ញើសារមកយើងគ្រប់ពេល" },
  "working_days": { en: "Mon - Sat: 8AM - 8PM", kh: "ច័ន្ទ - សៅរ៍: ៨ព្រឹក - ៨យប់" },
  "closed_days": { en: "Closed on Sundays & Holidays", kh: "ឈប់សម្រាកថ្ងៃអាទិត្យ និងថ្ងៃបុណ្យជាតិ" },
  "scan_for_support": { en: "Scan for Support", kh: "ស្កេនដើម្បីសាកសួរព័ត៌មាន" },
  "scan_desc": { en: "Scan this code with your phone camera or Telegram to start a live chat", kh: "ស្កេនកូដនេះជាមួយកាមេរ៉ា ឬតេឡេក្រាម ដើម្បីចាប់ផ្តើមការសន្ទនា" },
  "safe_secure": { en: "Safe & Secure", kh: "សុវត្ថិភាព និងទំនុកចិត្ត" },
  "data_protected_desc": { en: "Your data is fully protected", kh: "ទិន្នន័យរបស់អ្នកត្រូវបានការពារយ៉ាងតឹងរឹង" },
  "fast_response": { en: "Fast Response", kh: "ឆ្លើយតបរហ័ស" },
  "available_peak_hours": { en: "Available during peak hours", kh: "ត្រៀមខ្លួនជានិច្ចក្នុងម៉ោងមមាញឹក" },
  "expert_help": { en: "Expert Help", kh: "ជំនួយពីអ្នកជំនាញ" },
  "faqs": { en: "FAQs", kh: "សំណួរដែលជួបញឹកញាប់" },
  "faq_q1": { en: "How do I create my first event?", kh: "តើខ្ញុំអាចបង្កើតកម្មវិធីដំបូងដោយរបៀបណា?" },
  "faq_a1": { en: "Log in as an admin and click the 'Create Event' button on the dashboard. Follow the instructions to add a title, date, and banner.", kh: "ចូលប្រើប្រាស់ក្នុងនាមជាអ្នកគ្រប់គ្រង (Admin) រួចចុចប៊ូតុង \"បង្កើតកម្មវិធី\" នៅលើ Dashboard។ បន្ទាប់មកបំពេញឈ្មោះ កាលបរិច្ឆេទ និងរូបភាពបដា។" },
  "faq_q2": { en: "Can I export my guest list?", kh: "តើខ្ញុំអាចទាញយកបញ្ជីឈ្មោះភ្ញៀវបានទេ?" },
  "faq_a2": { en: "Yes! Inside each event management page, click the 'Export' button to download a CSV file of all contributions and guests.", kh: "បាទ! នៅក្នុងទំព័រគ្រប់គ្រងកម្មវិធីនីមួយៗ សូមចុចប៊ូតុង \"Export\" ដើម្បីទាញយកឯកសារបញ្ជីឈ្មោះភ្ញៀវ និងការចូលរួមទាំងអស់។" },
  "faq_q3": { en: "Is my data private?", kh: "តើទិន្នន័យរបស់ខ្ញុំមានឯកជនភាពដែរឬទេ?" },
  "faq_a3": { en: "Absolutely. Only you (the admin) can see the full details of guest contributions. Public users only see general event info.", kh: "ពិតប្រាកដណាស់។ មានតែអ្នក (អ្នកគ្រប់គ្រង) ប៉ុណ្ណោះដែលអាចមើលឃើញព័ត៌មានលម្អិតនៃការចូលរួម។ អ្នកប្រើប្រាស់ទូទៅមើលឃើញត្រឹមតែព័ត៌មានកម្មវិធីប៉ុណ្ណោះ។" },
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
