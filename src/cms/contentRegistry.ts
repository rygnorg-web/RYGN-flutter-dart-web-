import rygnLogo from '../assets/rygn-logo.jpg';
import { HERO_IMAGE_MAX_LENGTH, isValidHeroImageUrl } from '../firebase';

export type CmsPageId =
  | 'global'
  | 'home'
  | 'donate'
  | 'mission'
  | 'leadership'
  | 'youth_education'
  | 'humanitarian_relief'
  | 'navigation';

export type CmsContentType = 'text' | 'image' | 'logo' | 'banner';

export interface CmsPageDefinition {
  id: CmsPageId;
  name: string;
  description: string;
}

export interface CmsRegistryItem {
  id: string;
  pageId: CmsPageId;
  sectionId: string;
  sectionLabel: string;
  label: string;
  description: string;
  contentType: CmsContentType;
  multiline?: boolean;
  defaultValue: string;
  aspectHint?: string;
}

export const CMS_TEXT_MAX_LENGTH = 100000;
export const CMS_TEXT_MIN_LENGTH = 1;
export const SAFE_MEDIA_DATA_URL_TARGET = 680_000;

export const CMS_PAGES: CmsPageDefinition[] = [
  {
    id: 'global',
    name: 'Global Branding & Header',
    description: 'Central app logo, site title, header Donate button, default region, and footer copy.',
  },
  {
    id: 'home',
    name: 'Home Page',
    description: 'Hero banner, main headings, expandable About Us box, narrative copy, and policy report.',
  },
  {
    id: 'donate',
    name: 'Donate Page',
    description: 'Donation hero, story card, presets, payment instructions, programs, transparency, and FAQs.',
  },
  {
    id: 'mission',
    name: 'Mission & Vision Page',
    description: 'Mission & Vision page title, photograph, and statement.',
  },
  {
    id: 'leadership',
    name: 'Leadership Page',
    description: 'Leadership page title, photograph, and overview text.',
  },
  {
    id: 'youth_education',
    name: 'Youth Education Page',
    description: 'Youth Education page title, banner photograph, learning initiatives, and impact copy.',
  },
  {
    id: 'humanitarian_relief',
    name: 'Humanitarian Relief Page',
    description: 'Humanitarian Relief page title, banner photograph, welfare pillars, and community commitment.',
  },
  {
    id: 'navigation',
    name: 'Navigation Menu Drawer',
    description: '3-line menu drawer group headings, sub-navigation items, and bottom links.',
  },
];

export const CMS_REGISTRY: CmsRegistryItem[] = [
  // GLOBAL
  {
    id: 'global_app_logo',
    pageId: 'global',
    sectionId: 'brand_logo',
    sectionLabel: 'Application Logo',
    label: 'Official App Logo',
    description: 'Centred brand logo rendered in both the top website bar and the mobile app header.',
    contentType: 'logo',
    defaultValue: rygnLogo,
    aspectHint: 'Horizontal / Square Emblem (auto-contained)',
  },
  {
    id: 'global_site_brand_name',
    pageId: 'global',
    sectionId: 'header_shell',
    sectionLabel: 'Top App Bar',
    label: 'Site Brand Name',
    description: 'Main brand title shown beside the logo in the top header.',
    contentType: 'text',
    defaultValue: 'Rohingya Young Generation Network',
  },
  {
    id: 'global_site_subtitle',
    pageId: 'global',
    sectionId: 'header_shell',
    sectionLabel: 'Top App Bar',
    label: 'Site Header Subtitle',
    description: 'Subtitle displayed beneath the main brand name on larger screens.',
    contentType: 'text',
    defaultValue: 'Mobile Interactive Flutter Simulator (`RYGNHomePage`)',
  },
  {
    id: 'global_donate_btn_label',
    pageId: 'global',
    sectionId: 'mobile_header',
    sectionLabel: 'Mobile Header Controls',
    label: 'Header Donate Button Text',
    description: 'Pill button label in the mobile app header.',
    contentType: 'text',
    defaultValue: 'DONATE',
  },
  {
    id: 'global_default_country',
    pageId: 'global',
    sectionId: 'mobile_top_bar',
    sectionLabel: 'Mobile Top Utility Bar',
    label: 'Default Country / Region Label',
    description: 'Initial regional selector label before a visitor chooses another country.',
    contentType: 'text',
    defaultValue: 'Global (English)',
  },
  {
    id: 'global_footer_text',
    pageId: 'global',
    sectionId: 'footer',
    sectionLabel: 'Footer',
    label: 'Global Footer Text',
    description: 'Copyright / organization line rendered at the bottom of the application.',
    contentType: 'text',
    defaultValue: 'Rohingya Young Generation Network (RYGN) • Flutter Mobile App Simulator',
  },
  {
    id: 'footer_social_facebook_url',
    pageId: 'global',
    sectionId: 'footer_social',
    sectionLabel: 'Footer Social Media Links',
    label: 'Facebook URL',
    description: 'Paste official Facebook page link (https://facebook.com/...), or leave as "not_configured".',
    contentType: 'text',
    defaultValue: 'not_configured',
  },
  {
    id: 'footer_social_x_url',
    pageId: 'global',
    sectionId: 'footer_social',
    sectionLabel: 'Footer Social Media Links',
    label: 'X (Twitter) URL',
    description: 'Paste official X profile link (https://x.com/...), or leave as "not_configured".',
    contentType: 'text',
    defaultValue: 'not_configured',
  },
  {
    id: 'footer_social_youtube_url',
    pageId: 'global',
    sectionId: 'footer_social',
    sectionLabel: 'Footer Social Media Links',
    label: 'YouTube URL',
    description: 'Paste official YouTube channel link (https://youtube.com/...), or leave as "not_configured".',
    contentType: 'text',
    defaultValue: 'not_configured',
  },

  // HOME
  {
    id: 'home_hero_banner',
    pageId: 'home',
    sectionId: 'hero_banner',
    sectionLabel: 'Hero Banner',
    label: 'Home Hero Banner Photo',
    description: 'Full-width hero photograph at the top of the Home page.',
    contentType: 'banner',
    defaultValue: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac',
    aspectHint: 'Landscape 16:10 (240px height)',
  },
  {
    id: 'home_page_title',
    pageId: 'home',
    sectionId: 'hero_heading',
    sectionLabel: 'Main Heading',
    label: 'Home Page Title',
    description: 'Primary H1 title below the hero banner.',
    contentType: 'text',
    defaultValue: 'Our Organisation & Governance',
  },
  {
    id: 'home_about_box_title',
    pageId: 'home',
    sectionId: 'about_accordion',
    sectionLabel: 'About Us Expandable Box',
    label: 'About Us Box Heading',
    description: 'Title displayed on the bordered expandable About Us card.',
    contentType: 'text',
    defaultValue: 'About Us',
  },
  {
    id: 'home_about_box_content',
    pageId: 'home',
    sectionId: 'about_accordion',
    sectionLabel: 'About Us Expandable Box',
    label: 'About Us Expanded Text',
    description: 'Paragraph revealed when users tap the About Us box.',
    contentType: 'text',
    multiline: true,
    defaultValue:
      'Rohingya Young Generation Network (RYGN) is a youth-led community organization established to support Rohingya youth through education, human rights advocacy, emergency relief, and capacity building.',
  },
  {
    id: 'home_about_item_1_title',
    pageId: 'home',
    sectionId: 'about_accordion',
    sectionLabel: 'About Us Expandable Box',
    label: 'About Us Menu Item 1 Title',
    description: 'First link title shown inside the expanded About Us 3-line menu.',
    contentType: 'text',
    defaultValue: 'Our Goal & Mission',
  },
  {
    id: 'home_about_item_1_date',
    pageId: 'home',
    sectionId: 'about_accordion',
    sectionLabel: 'About Us Expandable Box',
    label: 'About Us Menu Item 1 Date',
    description: 'Date shown beside the first About Us menu item.',
    contentType: 'text',
    defaultValue: '4. March 2026',
  },
  {
    id: 'home_about_item_2_title',
    pageId: 'home',
    sectionId: 'about_accordion',
    sectionLabel: 'About Us Expandable Box',
    label: 'About Us Menu Item 2 Title',
    description: 'Second link title shown inside the expanded About Us 3-line menu.',
    contentType: 'text',
    defaultValue: 'Our Organisation & Governance',
  },
  {
    id: 'home_about_item_2_date',
    pageId: 'home',
    sectionId: 'about_accordion',
    sectionLabel: 'About Us Expandable Box',
    label: 'About Us Menu Item 2 Date',
    description: 'Date shown beside the second About Us menu item.',
    contentType: 'text',
    defaultValue: '28. September 2026',
  },
  {
    id: 'home_about_item_3_title',
    pageId: 'home',
    sectionId: 'about_accordion',
    sectionLabel: 'About Us Expandable Box',
    label: 'About Us Menu Item 3 Title',
    description: 'Third link title shown inside the expanded About Us 3-line menu.',
    contentType: 'text',
    defaultValue: 'Our People',
  },
  {
    id: 'home_about_item_3_date',
    pageId: 'home',
    sectionId: 'about_accordion',
    sectionLabel: 'About Us Expandable Box',
    label: 'About Us Menu Item 3 Date',
    description: 'Date shown beside the third About Us menu item.',
    contentType: 'text',
    defaultValue: '5. May 2026',
  },
  {
    id: 'home_main_paragraph',
    pageId: 'home',
    sectionId: 'main_content',
    sectionLabel: 'Narrative Body',
    label: 'Home Main Narrative Paragraph',
    description: 'Core organizational overview paragraph on the Home page.',
    contentType: 'text',
    multiline: true,
    defaultValue:
      'Over the last three decades, Rohingya Young Generation Network has contributed to empowering youth through education, leadership and humanitarian support across community networks worldwide.',
  },
  {
    id: 'home_policies_heading',
    pageId: 'home',
    sectionId: 'policies_reports',
    sectionLabel: 'Policies & Reports',
    label: 'Policies & Reports Section Heading',
    description: 'Section heading above the annual activity report download row.',
    contentType: 'text',
    defaultValue: 'Our Policies and Reports',
  },
  {
    id: 'home_report_title',
    pageId: 'home',
    sectionId: 'policies_reports',
    sectionLabel: 'Policies & Reports',
    label: 'Activity Report Stacked Title',
    description: 'Slash-delimited or multiline report title shown beside the PDF button.',
    contentType: 'text',
    multiline: true,
    defaultValue:
      'Rohingya /\nYoung /\nGeneration /\nNetwork /\nActivity /\nReport /\n2025 /\n(including /\nIncome & /\nExpenses)',
  },
  {
    id: 'home_report_meta',
    pageId: 'home',
    sectionId: 'policies_reports',
    sectionLabel: 'Policies & Reports',
    label: 'Report File Meta Label',
    description: 'File type and size note below the report title.',
    contentType: 'text',
    defaultValue: 'pdf - 1 MB',
  },
  {
    id: 'home_report_btn_label',
    pageId: 'home',
    sectionId: 'policies_reports',
    sectionLabel: 'Policies & Reports',
    label: 'Report Action Link Label',
    description: 'Clickable text label beneath the yellow download icon.',
    contentType: 'text',
    defaultValue: 'View PDF',
  },
  {
    id: 'home_report_pdf_url',
    pageId: 'home',
    sectionId: 'policies_reports',
    sectionLabel: 'Policies & Reports',
    label: 'Report PDF URL',
    description: 'HTTPS link opened when users tap Download or View PDF.',
    contentType: 'text',
    defaultValue: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
  },

  // DONATE
  {
    id: 'donate_page_title',
    pageId: 'donate',
    sectionId: 'page_header',
    sectionLabel: 'Hero Headline',
    label: 'Donate Hero Headline',
    description: 'Main headline displayed at the top of the Donate page.',
    contentType: 'text',
    defaultValue: 'Together, We Can Make a Difference',
  },
  {
    id: 'donate_hero_subtitle',
    pageId: 'donate',
    sectionId: 'hero_section',
    sectionLabel: 'Hero Supporting Text',
    label: 'Donate Hero Supporting Copy',
    description: 'Short message explaining how donations support RYGN mission and community programs.',
    contentType: 'text',
    multiline: true,
    defaultValue:
      'Every contribution helps Rohingya Young Generation Network sustain community-led education, youth leadership, and compassionate humanitarian support.',
  },
  {
    id: 'donate_hero_primary_cta',
    pageId: 'donate',
    sectionId: 'hero_section',
    sectionLabel: 'Hero Buttons',
    label: 'Primary Donate CTA Label',
    description: 'Label on the primary Donate button in the hero section.',
    contentType: 'text',
    defaultValue: 'Donate Now',
  },
  {
    id: 'donate_hero_secondary_cta',
    pageId: 'donate',
    sectionId: 'hero_section',
    sectionLabel: 'Hero Buttons',
    label: 'Secondary Transparency CTA Label',
    description: 'Label on the button that scrolls to the transparency section.',
    contentType: 'text',
    defaultValue: 'Learn Where Your Donation Goes',
  },
  {
    id: 'donate_story_image',
    pageId: 'donate',
    sectionId: 'story_media',
    sectionLabel: 'Story Photograph',
    label: 'Donate Campaign Photo',
    description: 'Featured campaign photograph on the Donate page.',
    contentType: 'image',
    defaultValue: 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb9',
    aspectHint: 'Landscape Card (240px height)',
  },
  {
    id: 'donate_story_text',
    pageId: 'donate',
    sectionId: 'story_body',
    sectionLabel: 'Featured Story Text',
    label: 'Donate Story Paragraph',
    description: 'Narrative story shown alongside the Donate campaign photograph.',
    contentType: 'text',
    multiline: true,
    defaultValue:
      "Deolinda is a small girl who received cataract surgery in Maputo central hospital. The intervention was part of the '1,2,3...I can see!' programme.",
  },
  {
    id: 'donate_currency_symbol',
    pageId: 'donate',
    sectionId: 'amount_selection',
    sectionLabel: 'Amount & Currency',
    label: 'Currency Symbol',
    description: 'Configurable currency prefix displayed with donation amounts (default ৳).',
    contentType: 'text',
    defaultValue: '৳',
  },
  {
    id: 'donate_preset_amounts',
    pageId: 'donate',
    sectionId: 'amount_selection',
    sectionLabel: 'Amount & Currency',
    label: 'Preset Donation Amounts',
    description: 'Comma-separated numeric preset options shown to donors.',
    contentType: 'text',
    defaultValue: '100, 500, 1000, 2000',
  },
  {
    id: 'donate_target_amount',
    pageId: 'donate',
    sectionId: 'donation_progress',
    sectionLabel: 'Campaign Goal',
    label: 'Donation Target Amount',
    description: 'Enter a numeric goal (e.g. 50000) or "Not set" when no target is active.',
    contentType: 'text',
    defaultValue: 'Not set',
  },
  {
    id: 'donate_progress_note',
    pageId: 'donate',
    sectionId: 'donation_progress',
    sectionLabel: 'Campaign Goal',
    label: 'Donation Progress Note',
    description: 'Honest note explaining verified donation tracking status.',
    contentType: 'text',
    multiline: true,
    defaultValue:
      'Live automated donation totals are not currently connected. Verified campaign figures will appear once a donation ledger is enabled.',
  },
  {
    id: 'donate_payment_heading',
    pageId: 'donate',
    sectionId: 'payment_methods',
    sectionLabel: 'Payment Channels',
    label: 'Payment Methods Heading',
    description: 'Heading for the payment options block.',
    contentType: 'text',
    defaultValue: 'Payment Methods',
  },
  {
    id: 'donate_payment_instructions',
    pageId: 'donate',
    sectionId: 'payment_methods',
    sectionLabel: 'Payment Channels',
    label: 'Payment Guidance Overview',
    description: 'Clear donor guidance about currently supported or manual payment options.',
    contentType: 'text',
    multiline: true,
    defaultValue:
      'Online payment gateways are not currently integrated in this application. When manual transfer instructions are configured by the organization administrator, verified steps appear below.',
  },
  {
    id: 'donate_bkash_info',
    pageId: 'donate',
    sectionId: 'payment_methods',
    sectionLabel: 'Payment Channels',
    label: 'bKash Manual Instructions',
    description: 'Enter verified bKash transfer details, or leave as "not_configured" if unavailable.',
    contentType: 'text',
    multiline: true,
    defaultValue: 'not_configured',
  },
  {
    id: 'donate_nagad_info',
    pageId: 'donate',
    sectionId: 'payment_methods',
    sectionLabel: 'Payment Channels',
    label: 'Nagad Manual Instructions',
    description: 'Enter verified Nagad transfer details, or leave as "not_configured" if unavailable.',
    contentType: 'text',
    multiline: true,
    defaultValue: 'not_configured',
  },
  {
    id: 'donate_bank_info',
    pageId: 'donate',
    sectionId: 'payment_methods',
    sectionLabel: 'Payment Channels',
    label: 'Bank Transfer Instructions',
    description: 'Enter verified bank transfer details, or leave as "not_configured" if unavailable.',
    contentType: 'text',
    multiline: true,
    defaultValue: 'not_configured',
  },
  {
    id: 'donate_card_info',
    pageId: 'donate',
    sectionId: 'payment_methods',
    sectionLabel: 'Payment Channels',
    label: 'Card Gateway Status / Instructions',
    description: 'Leave as "not_configured" unless an official card gateway is connected.',
    contentType: 'text',
    multiline: true,
    defaultValue: 'not_configured',
  },
  {
    id: 'donate_purpose_heading',
    pageId: 'donate',
    sectionId: 'donation_programs',
    sectionLabel: 'Programs & Purpose',
    label: 'Programs Section Heading',
    description: 'Heading for the donation purpose and focus areas section.',
    contentType: 'text',
    defaultValue: 'Areas Your Support Helps Strengthen',
  },
  {
    id: 'donate_purpose_intro',
    pageId: 'donate',
    sectionId: 'donation_programs',
    sectionLabel: 'Programs & Purpose',
    label: 'Programs Section Intro',
    description: 'Honest explanation of illustrative organizational focus areas.',
    contentType: 'text',
    multiline: true,
    defaultValue:
      'Illustrative priority areas aligned with RYGN community outreach. Specific project allocations follow published organizational oversight.',
  },
  {
    id: 'donate_purpose_1_title',
    pageId: 'donate',
    sectionId: 'donation_programs',
    sectionLabel: 'Programs & Purpose',
    label: 'Focus Area 1 Title',
    description: 'Title for the first donation purpose card.',
    contentType: 'text',
    defaultValue: 'Education and Learning Support',
  },
  {
    id: 'donate_purpose_1_desc',
    pageId: 'donate',
    sectionId: 'donation_programs',
    sectionLabel: 'Programs & Purpose',
    label: 'Focus Area 1 Description',
    description: 'Short description for education and learning support.',
    contentType: 'text',
    multiline: true,
    defaultValue:
      'Helping young learners access study materials, mentorship, and foundational literacy initiatives.',
  },
  {
    id: 'donate_purpose_2_title',
    pageId: 'donate',
    sectionId: 'donation_programs',
    sectionLabel: 'Programs & Purpose',
    label: 'Focus Area 2 Title',
    description: 'Title for the second donation purpose card.',
    contentType: 'text',
    defaultValue: 'Community Development',
  },
  {
    id: 'donate_purpose_2_desc',
    pageId: 'donate',
    sectionId: 'donation_programs',
    sectionLabel: 'Programs & Purpose',
    label: 'Focus Area 2 Description',
    description: 'Short description for community development.',
    contentType: 'text',
    multiline: true,
    defaultValue:
      'Strengthening local volunteer coordination, practical skills, and safe community spaces.',
  },
  {
    id: 'donate_purpose_3_title',
    pageId: 'donate',
    sectionId: 'donation_programs',
    sectionLabel: 'Programs & Purpose',
    label: 'Focus Area 3 Title',
    description: 'Title for the third donation purpose card.',
    contentType: 'text',
    defaultValue: 'Humanitarian Assistance',
  },
  {
    id: 'donate_purpose_3_desc',
    pageId: 'donate',
    sectionId: 'donation_programs',
    sectionLabel: 'Programs & Purpose',
    label: 'Focus Area 3 Description',
    description: 'Short description for humanitarian assistance.',
    contentType: 'text',
    multiline: true,
    defaultValue:
      'Supporting essential household supplies and dignity-focused welfare outreach for families.',
  },
  {
    id: 'donate_purpose_4_title',
    pageId: 'donate',
    sectionId: 'donation_programs',
    sectionLabel: 'Programs & Purpose',
    label: 'Focus Area 4 Title',
    description: 'Title for the fourth donation purpose card.',
    contentType: 'text',
    defaultValue: 'Youth Programs',
  },
  {
    id: 'donate_purpose_4_desc',
    pageId: 'donate',
    sectionId: 'donation_programs',
    sectionLabel: 'Programs & Purpose',
    label: 'Focus Area 4 Description',
    description: 'Short description for youth programs.',
    contentType: 'text',
    multiline: true,
    defaultValue:
      'Equipping young leaders with advocacy training, peer workshops, and collaborative networks.',
  },
  {
    id: 'donate_purpose_5_title',
    pageId: 'donate',
    sectionId: 'donation_programs',
    sectionLabel: 'Programs & Purpose',
    label: 'Focus Area 5 Title',
    description: 'Title for the fifth donation purpose card.',
    contentType: 'text',
    defaultValue: 'Emergency Support',
  },
  {
    id: 'donate_purpose_5_desc',
    pageId: 'donate',
    sectionId: 'donation_programs',
    sectionLabel: 'Programs & Purpose',
    label: 'Focus Area 5 Description',
    description: 'Short description for emergency support.',
    contentType: 'text',
    multiline: true,
    defaultValue:
      'Providing timely community coordination and rapid essential aid during urgent crises.',
  },
  {
    id: 'donate_transparency_heading',
    pageId: 'donate',
    sectionId: 'transparency_section',
    sectionLabel: 'Transparency & Accountability',
    label: 'Transparency Section Heading',
    description: 'Heading for the Where Your Donation Goes section.',
    contentType: 'text',
    defaultValue: 'Where Your Donation Goes',
  },
  {
    id: 'donate_transparency_body',
    pageId: 'donate',
    sectionId: 'transparency_section',
    sectionLabel: 'Transparency & Accountability',
    label: 'Transparency Explanation',
    description: 'Explanation of how contributions are stewarded and reported.',
    contentType: 'text',
    multiline: true,
    defaultValue:
      'Rohingya Young Generation Network is committed to transparent, accountable stewardship. Audited income, expenses, and program activity summaries are published in our annual organizational reports.',
  },
  {
    id: 'donate_financial_note',
    pageId: 'donate',
    sectionId: 'transparency_section',
    sectionLabel: 'Transparency & Accountability',
    label: 'Financial Accountability Note',
    description: 'Brief accountability note without unverified statistics.',
    contentType: 'text',
    multiline: true,
    defaultValue:
      'Verified financial statements and expense breakdowns are documented directly inside our published activity report.',
  },
  {
    id: 'donate_report_label',
    pageId: 'donate',
    sectionId: 'transparency_section',
    sectionLabel: 'Transparency & Accountability',
    label: 'Transparency Report Link Label',
    description: 'Label on the button/link opening the published report PDF.',
    contentType: 'text',
    defaultValue: 'View Published Activity & Financial Report (PDF)',
  },
  {
    id: 'donate_report_url',
    pageId: 'donate',
    sectionId: 'transparency_section',
    sectionLabel: 'Transparency & Accountability',
    label: 'Transparency Report PDF URL',
    description: 'HTTPS link to the published financial or activity report PDF.',
    contentType: 'text',
    defaultValue: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
  },
  {
    id: 'donate_privacy_note',
    pageId: 'donate',
    sectionId: 'donor_privacy',
    sectionLabel: 'Privacy & Contact',
    label: 'Donor Privacy Assurance',
    description: 'Statement explaining anonymous giving, optional recognition, and data protection.',
    contentType: 'text',
    multiline: true,
    defaultValue:
      'Your privacy is protected. Phone numbers, email addresses, and transaction IDs are never displayed publicly, and public recognition is strictly optional with your explicit consent.',
  },
  {
    id: 'donate_contact_info',
    pageId: 'donate',
    sectionId: 'donor_privacy',
    sectionLabel: 'Privacy & Contact',
    label: 'Donation Contact Details',
    description: 'Official contact channel for donation confirmations, receipts, and inquiries.',
    contentType: 'text',
    multiline: true,
    defaultValue: 'Official donation & receipt inquiries: rygnorg@gmail.com',
  },
  {
    id: 'donate_faq_heading',
    pageId: 'donate',
    sectionId: 'donate_faq',
    sectionLabel: 'Donation FAQs',
    label: 'FAQ Section Heading',
    description: 'Heading displayed above the donation FAQ accordion.',
    contentType: 'text',
    defaultValue: 'Frequently Asked Questions',
  },
  {
    id: 'donate_faq_q1',
    pageId: 'donate',
    sectionId: 'donate_faq',
    sectionLabel: 'Donation FAQs',
    label: 'FAQ 1 Question',
    description: 'First FAQ question.',
    contentType: 'text',
    defaultValue: 'What is my donation used for?',
  },
  {
    id: 'donate_faq_a1',
    pageId: 'donate',
    sectionId: 'donate_faq',
    sectionLabel: 'Donation FAQs',
    label: 'FAQ 1 Answer',
    description: 'Answer to FAQ 1.',
    contentType: 'text',
    multiline: true,
    defaultValue:
      'Contributions support Rohingya Young Generation Network programs including youth education, community development, humanitarian assistance, and emergency community support.',
  },
  {
    id: 'donate_faq_q2',
    pageId: 'donate',
    sectionId: 'donate_faq',
    sectionLabel: 'Donation FAQs',
    label: 'FAQ 2 Question',
    description: 'Second FAQ question.',
    contentType: 'text',
    defaultValue: 'How can I donate?',
  },
  {
    id: 'donate_faq_a2',
    pageId: 'donate',
    sectionId: 'donate_faq',
    sectionLabel: 'Donation FAQs',
    label: 'FAQ 2 Answer',
    description: 'Answer to FAQ 2.',
    contentType: 'text',
    multiline: true,
    defaultValue:
      'Choose a preset or custom amount above and review the payment methods marked as configured. When manual transfer instructions are provided by RYGN, follow the listed official steps.',
  },
  {
    id: 'donate_faq_q3',
    pageId: 'donate',
    sectionId: 'donate_faq',
    sectionLabel: 'Donation FAQs',
    label: 'FAQ 3 Question',
    description: 'Third FAQ question.',
    contentType: 'text',
    defaultValue: 'Is my payment secure?',
  },
  {
    id: 'donate_faq_a3',
    pageId: 'donate',
    sectionId: 'donate_faq',
    sectionLabel: 'Donation FAQs',
    label: 'FAQ 3 Answer',
    description: 'Answer to FAQ 3.',
    contentType: 'text',
    multiline: true,
    defaultValue:
      'This application never collects or stores card numbers, banking PINs, or payment credentials. Any active transfer uses official, verified channels only.',
  },
  {
    id: 'donate_faq_q4',
    pageId: 'donate',
    sectionId: 'donate_faq',
    sectionLabel: 'Donation FAQs',
    label: 'FAQ 4 Question',
    description: 'Fourth FAQ question.',
    contentType: 'text',
    defaultValue: 'Can I donate anonymously?',
  },
  {
    id: 'donate_faq_a4',
    pageId: 'donate',
    sectionId: 'donate_faq',
    sectionLabel: 'Donation FAQs',
    label: 'FAQ 4 Answer',
    description: 'Answer to FAQ 4.',
    contentType: 'text',
    multiline: true,
    defaultValue:
      'Yes. Anonymous donation is selected by default. Public name recognition is optional and only used with explicit donor consent.',
  },
  {
    id: 'donate_faq_q5',
    pageId: 'donate',
    sectionId: 'donate_faq',
    sectionLabel: 'Donation FAQs',
    label: 'FAQ 5 Question',
    description: 'Fifth FAQ question.',
    contentType: 'text',
    defaultValue: 'Will I receive a donation receipt?',
  },
  {
    id: 'donate_faq_a5',
    pageId: 'donate',
    sectionId: 'donate_faq',
    sectionLabel: 'Donation FAQs',
    label: 'FAQ 5 Answer',
    description: 'Answer to FAQ 5.',
    contentType: 'text',
    multiline: true,
    defaultValue:
      'Receipts are issued according to the payment channel used. After completing a manual transfer, please reach out through our official contact email for written confirmation.',
  },
  {
    id: 'donate_faq_q6',
    pageId: 'donate',
    sectionId: 'donate_faq',
    sectionLabel: 'Donation FAQs',
    label: 'FAQ 6 Question',
    description: 'Sixth FAQ question.',
    contentType: 'text',
    defaultValue: 'How can I contact the organization regarding my donation?',
  },
  {
    id: 'donate_faq_a6',
    pageId: 'donate',
    sectionId: 'donate_faq',
    sectionLabel: 'Donation FAQs',
    label: 'FAQ 6 Answer',
    description: 'Answer to FAQ 6.',
    contentType: 'text',
    multiline: true,
    defaultValue:
      'You can contact Rohingya Young Generation Network directly via the official organization contact details shown in the Transparency & Contact section above.',
  },

  // MISSION
  {
    id: 'mission_page_title',
    pageId: 'mission',
    sectionId: 'page_header',
    sectionLabel: 'Page Title',
    label: 'Mission & Vision Title',
    description: 'Main heading on the Mission & Vision page.',
    contentType: 'text',
    defaultValue: 'Mission & Vision',
  },
  {
    id: 'mission_story_image',
    pageId: 'mission',
    sectionId: 'story_media',
    sectionLabel: 'Featured Photograph',
    label: 'Mission & Vision Photo',
    description: 'Featured photograph on the Mission & Vision page.',
    contentType: 'image',
    defaultValue: 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb9',
    aspectHint: 'Landscape Card (260px height)',
  },
  {
    id: 'mission_story_text',
    pageId: 'mission',
    sectionId: 'story_body',
    sectionLabel: 'Statement Body',
    label: 'Mission & Vision Content',
    description: 'Full mission and vision statement text.',
    contentType: 'text',
    multiline: true,
    defaultValue:
      'Our mission is to empower Rohingya youth through leadership, human rights advocacy, and quality education while fostering a peaceful, inclusive future and community resilience across global networks.',
  },

  // LEADERSHIP
  {
    id: 'leadership_page_title',
    pageId: 'leadership',
    sectionId: 'page_header',
    sectionLabel: 'Page Title',
    label: 'Leadership Title',
    description: 'Main heading on the Leadership page.',
    contentType: 'text',
    defaultValue: 'Leadership',
  },
  {
    id: 'leadership_story_image',
    pageId: 'leadership',
    sectionId: 'story_media',
    sectionLabel: 'Featured Photograph',
    label: 'Leadership Photo',
    description: 'Featured photograph on the Leadership page.',
    contentType: 'image',
    defaultValue: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b',
    aspectHint: 'Landscape Card (260px height)',
  },
  {
    id: 'leadership_story_text',
    pageId: 'leadership',
    sectionId: 'story_body',
    sectionLabel: 'Leadership Narrative',
    label: 'Leadership Content',
    description: 'Overview of executive committee and leadership structure.',
    contentType: 'text',
    multiline: true,
    defaultValue:
      'RYGN is led by a dedicated executive committee, youth coordinators, and human rights advocates working collaboratively across refugee settlements and international diaspora communities.',
  },

  // YOUTH EDUCATION
  {
    id: 'youth_edu_page_title',
    pageId: 'youth_education',
    sectionId: 'page_header',
    sectionLabel: 'Hero Headline',
    label: 'Youth Education Title',
    description: 'Main headline displayed at the top of the Youth Education page.',
    contentType: 'text',
    defaultValue: 'Youth Education & Learning Support',
  },
  {
    id: 'youth_edu_hero_subtitle',
    pageId: 'youth_education',
    sectionId: 'hero_section',
    sectionLabel: 'Hero Supporting Text',
    label: 'Youth Education Supporting Copy',
    description: 'Short introductory message explaining youth education programs.',
    contentType: 'text',
    multiline: true,
    defaultValue:
      'Empowering Rohingya youth through accessible education, digital literacy, and community mentorship.',
  },
  {
    id: 'youth_edu_hero_image',
    pageId: 'youth_education',
    sectionId: 'story_media',
    sectionLabel: 'Banner Photograph',
    label: 'Youth Education Banner Photo',
    description: 'Featured banner photograph on the Youth Education page.',
    contentType: 'image',
    defaultValue: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac',
    aspectHint: 'Landscape Card (260px height)',
  },
  {
    id: 'youth_edu_intro_text',
    pageId: 'youth_education',
    sectionId: 'story_body',
    sectionLabel: 'Introduction Narrative',
    label: 'Youth Education Introduction',
    description: 'Main introductory narrative on the Youth Education page.',
    contentType: 'text',
    multiline: true,
    defaultValue:
      'Education is the cornerstone of community resilience and empowerment. Rohingya Young Generation Network runs dedicated youth education initiatives designed to foster learning, leadership, and personal growth across community settlements and diaspora networks.',
  },
  {
    id: 'youth_edu_feature_1_title',
    pageId: 'youth_education',
    sectionId: 'features',
    sectionLabel: 'Program Focus Areas',
    label: 'Feature 1 Title',
    description: 'Title for the first educational initiative card.',
    contentType: 'text',
    defaultValue: 'Digital Literacy & Skills',
  },
  {
    id: 'youth_edu_feature_1_desc',
    pageId: 'youth_education',
    sectionId: 'features',
    sectionLabel: 'Program Focus Areas',
    label: 'Feature 1 Description',
    description: 'Description for digital literacy & skills.',
    contentType: 'text',
    multiline: true,
    defaultValue:
      'Equipping young learners with practical computer skills, digital tools, and foundational technical training.',
  },
  {
    id: 'youth_edu_feature_2_title',
    pageId: 'youth_education',
    sectionId: 'features',
    sectionLabel: 'Program Focus Areas',
    label: 'Feature 2 Title',
    description: 'Title for the second educational initiative card.',
    contentType: 'text',
    defaultValue: 'Community Study Circles',
  },
  {
    id: 'youth_edu_feature_2_desc',
    pageId: 'youth_education',
    sectionId: 'features',
    sectionLabel: 'Program Focus Areas',
    label: 'Feature 2 Description',
    description: 'Description for community study circles.',
    contentType: 'text',
    multiline: true,
    defaultValue:
      'Organizing safe, collaborative tutoring sessions and study support for students of all ages.',
  },
  {
    id: 'youth_edu_feature_3_title',
    pageId: 'youth_education',
    sectionId: 'features',
    sectionLabel: 'Program Focus Areas',
    label: 'Feature 3 Title',
    description: 'Title for the third educational initiative card.',
    contentType: 'text',
    defaultValue: 'Leadership & Scholarships',
  },
  {
    id: 'youth_edu_feature_3_desc',
    pageId: 'youth_education',
    sectionId: 'features',
    sectionLabel: 'Program Focus Areas',
    label: 'Feature 3 Description',
    description: 'Description for leadership & scholarships.',
    contentType: 'text',
    multiline: true,
    defaultValue:
      'Guiding ambitious youth toward educational advancement, leadership workshops, and scholarship pathways.',
  },
  {
    id: 'youth_edu_impact_text',
    pageId: 'youth_education',
    sectionId: 'impact',
    sectionLabel: 'Impact Statement',
    label: 'Youth Education Impact Copy',
    description: 'Impact summary statement at the bottom of the Youth Education page.',
    contentType: 'text',
    multiline: true,
    defaultValue:
      'Through dedicated peer networks and community-led learning programs, RYGN has helped hundreds of young students expand their educational horizons and build confident futures.',
  },

  // HUMANITARIAN RELIEF
  {
    id: 'humanitarian_page_title',
    pageId: 'humanitarian_relief',
    sectionId: 'page_header',
    sectionLabel: 'Hero Headline',
    label: 'Humanitarian Relief Title',
    description: 'Main headline displayed at the top of the Humanitarian Relief page.',
    contentType: 'text',
    defaultValue: 'Humanitarian Assistance & Relief',
  },
  {
    id: 'humanitarian_hero_subtitle',
    pageId: 'humanitarian_relief',
    sectionId: 'hero_section',
    sectionLabel: 'Hero Supporting Text',
    label: 'Humanitarian Relief Supporting Copy',
    description: 'Short introductory message explaining humanitarian programs.',
    contentType: 'text',
    multiline: true,
    defaultValue:
      'Compassionate emergency response, welfare support, and dignity outreach for vulnerable families.',
  },
  {
    id: 'humanitarian_hero_image',
    pageId: 'humanitarian_relief',
    sectionId: 'story_media',
    sectionLabel: 'Banner Photograph',
    label: 'Humanitarian Relief Banner Photo',
    description: 'Featured banner photograph on the Humanitarian Relief page.',
    contentType: 'image',
    defaultValue: 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb9',
    aspectHint: 'Landscape Card (260px height)',
  },
  {
    id: 'humanitarian_intro_text',
    pageId: 'humanitarian_relief',
    sectionId: 'story_body',
    sectionLabel: 'Introduction Narrative',
    label: 'Humanitarian Relief Introduction',
    description: 'Main introductory narrative on the Humanitarian Relief page.',
    contentType: 'text',
    multiline: true,
    defaultValue:
      'In times of crisis and urgent need, Rohingya Young Generation Network stands ready to provide compassionate humanitarian assistance. Our relief programs focus on dignity, rapid community coordination, and essential welfare support for families and children.',
  },
  {
    id: 'humanitarian_feature_1_title',
    pageId: 'humanitarian_relief',
    sectionId: 'features',
    sectionLabel: 'Welfare Pillars',
    label: 'Feature 1 Title',
    description: 'Title for the first humanitarian initiative card.',
    contentType: 'text',
    defaultValue: 'Emergency Relief',
  },
  {
    id: 'humanitarian_feature_1_desc',
    pageId: 'humanitarian_relief',
    sectionId: 'features',
    sectionLabel: 'Welfare Pillars',
    label: 'Feature 1 Description',
    description: 'Description for emergency relief.',
    contentType: 'text',
    multiline: true,
    defaultValue:
      'Rapid distribution of essential food supplies, clean water resources, and hygiene kits during urgent community crises.',
  },
  {
    id: 'humanitarian_feature_2_title',
    pageId: 'humanitarian_relief',
    sectionId: 'features',
    sectionLabel: 'Welfare Pillars',
    label: 'Feature 2 Title',
    description: 'Title for the second humanitarian initiative card.',
    contentType: 'text',
    defaultValue: 'Dignity & Welfare Support',
  },
  {
    id: 'humanitarian_feature_2_desc',
    pageId: 'humanitarian_relief',
    sectionId: 'features',
    sectionLabel: 'Welfare Pillars',
    label: 'Feature 2 Description',
    description: 'Description for dignity & welfare support.',
    contentType: 'text',
    multiline: true,
    defaultValue:
      'Targeted assistance addressing the immediate welfare needs of vulnerable households and elderly community members.',
  },
  {
    id: 'humanitarian_feature_3_title',
    pageId: 'humanitarian_relief',
    sectionId: 'features',
    sectionLabel: 'Welfare Pillars',
    label: 'Feature 3 Title',
    description: 'Title for the third humanitarian initiative card.',
    contentType: 'text',
    defaultValue: 'Community Preparedness',
  },
  {
    id: 'humanitarian_feature_3_desc',
    pageId: 'humanitarian_relief',
    sectionId: 'features',
    sectionLabel: 'Welfare Pillars',
    label: 'Feature 3 Description',
    description: 'Description for community preparedness.',
    contentType: 'text',
    multiline: true,
    defaultValue:
      'Building local coordination networks and preparedness frameworks to respond effectively to sudden emergencies.',
  },
  {
    id: 'humanitarian_impact_text',
    pageId: 'humanitarian_relief',
    sectionId: 'impact',
    sectionLabel: 'Impact Statement',
    label: 'Humanitarian Relief Impact Copy',
    description: 'Impact summary statement at the bottom of the Humanitarian Relief page.',
    contentType: 'text',
    multiline: true,
    defaultValue:
      'Our humanitarian initiatives reflect our deep commitment to solidarity, mutual aid, and compassionate community care, ensuring no family stands alone during difficult times.',
  },

  // NAVIGATION
  {
    id: 'nav_group_about_label',
    pageId: 'navigation',
    sectionId: 'primary_groups',
    sectionLabel: 'Top-Level Menu Categories',
    label: 'Menu Group 1 Label',
    description: 'First expandable category in the 3-line navigation drawer.',
    contentType: 'text',
    defaultValue: 'About Us',
  },
  {
    id: 'nav_item_org_gov',
    pageId: 'navigation',
    sectionId: 'about_links',
    sectionLabel: 'About Us Sub-Links',
    label: 'Sub-Link: Organisation & Governance',
    description: 'First child link inside About Us.',
    contentType: 'text',
    defaultValue: 'Our Organisation & Governance',
  },
  {
    id: 'nav_item_mission',
    pageId: 'navigation',
    sectionId: 'about_links',
    sectionLabel: 'About Us Sub-Links',
    label: 'Sub-Link: Mission & Vision',
    description: 'Second child link inside About Us.',
    contentType: 'text',
    defaultValue: 'Mission & Vision',
  },
  {
    id: 'nav_item_leadership',
    pageId: 'navigation',
    sectionId: 'about_links',
    sectionLabel: 'About Us Sub-Links',
    label: 'Sub-Link: Leadership',
    description: 'Third child link inside About Us.',
    contentType: 'text',
    defaultValue: 'Leadership',
  },
  {
    id: 'nav_group_work_label',
    pageId: 'navigation',
    sectionId: 'primary_groups',
    sectionLabel: 'Top-Level Menu Categories',
    label: 'Menu Group 2 Label',
    description: 'Second expandable category in the navigation drawer.',
    contentType: 'text',
    defaultValue: 'Our work',
  },
  {
    id: 'nav_item_work_1',
    pageId: 'navigation',
    sectionId: 'work_links',
    sectionLabel: 'Our Work Sub-Links',
    label: 'Sub-Link: Our Approach',
    description: 'First child link inside Our Work.',
    contentType: 'text',
    defaultValue: 'Our Approach',
  },
  {
    id: 'nav_item_work_2',
    pageId: 'navigation',
    sectionId: 'work_links',
    sectionLabel: 'Our Work Sub-Links',
    label: 'Sub-Link: Youth Education',
    description: 'Second child link inside Our Work.',
    contentType: 'text',
    defaultValue: 'Youth Education',
  },
  {
    id: 'nav_item_work_3',
    pageId: 'navigation',
    sectionId: 'work_links',
    sectionLabel: 'Our Work Sub-Links',
    label: 'Sub-Link: Humanitarian Relief',
    description: 'Third child link inside Our Work.',
    contentType: 'text',
    defaultValue: 'Humanitarian Relief',
  },
  {
    id: 'nav_item_work_4',
    pageId: 'navigation',
    sectionId: 'work_links',
    sectionLabel: 'Our Work Sub-Links',
    label: 'Sub-Link: Focus Countries',
    description: 'Fourth child link inside Our Work.',
    contentType: 'text',
    defaultValue: 'Focus Countries',
  },
  {
    id: 'nav_group_news_label',
    pageId: 'navigation',
    sectionId: 'primary_groups',
    sectionLabel: 'Top-Level Menu Categories',
    label: 'Menu Group 3 Label',
    description: 'Third expandable category in the navigation drawer.',
    contentType: 'text',
    defaultValue: 'News',
  },
  {
    id: 'nav_item_news_1',
    pageId: 'navigation',
    sectionId: 'news_links',
    sectionLabel: 'News Sub-Links',
    label: 'Sub-Link: Latest News',
    description: 'First child link inside News.',
    contentType: 'text',
    defaultValue: 'Latest News',
  },
  {
    id: 'nav_item_news_2',
    pageId: 'navigation',
    sectionId: 'news_links',
    sectionLabel: 'News Sub-Links',
    label: 'Sub-Link: Media & Press',
    description: 'Second child link inside News.',
    contentType: 'text',
    defaultValue: 'Media & Press',
  },
  {
    id: 'nav_item_news_3',
    pageId: 'navigation',
    sectionId: 'news_links',
    sectionLabel: 'News Sub-Links',
    label: 'Sub-Link: Publications & Reports',
    description: 'Third child link inside News.',
    contentType: 'text',
    defaultValue: 'Publications & Reports',
  },
  {
    id: 'nav_group_partner_label',
    pageId: 'navigation',
    sectionId: 'primary_groups',
    sectionLabel: 'Top-Level Menu Categories',
    label: 'Menu Group 4 Label',
    description: 'Fourth expandable category in the navigation drawer.',
    contentType: 'text',
    defaultValue: 'Work with Us',
  },
  {
    id: 'nav_item_partner_1',
    pageId: 'navigation',
    sectionId: 'partner_links',
    sectionLabel: 'Work With Us Sub-Links',
    label: 'Sub-Link: Careers & Volunteering',
    description: 'First child link inside Work With Us.',
    contentType: 'text',
    defaultValue: 'Careers & Volunteering',
  },
  {
    id: 'nav_item_partner_2',
    pageId: 'navigation',
    sectionId: 'partner_links',
    sectionLabel: 'Work With Us Sub-Links',
    label: 'Sub-Link: Tenders & Partnerships',
    description: 'Second child link inside Work With Us.',
    contentType: 'text',
    defaultValue: 'Tenders & Partnerships',
  },
  {
    id: 'nav_item_partner_3',
    pageId: 'navigation',
    sectionId: 'partner_links',
    sectionLabel: 'Work With Us Sub-Links',
    label: 'Sub-Link: Donations & Support',
    description: 'Third child link inside Work With Us.',
    contentType: 'text',
    defaultValue: 'Donations & Support',
  },
  {
    id: 'nav_contact_address',
    pageId: 'navigation',
    sectionId: 'contact_footer',
    sectionLabel: 'Contact Address',
    label: 'Organization Contact Address',
    description: 'Physical address displayed in the navigation drawer footer.',
    contentType: 'text',
    multiline: true,
    defaultValue: 'Schönbrunner Straße 297-307/2/4\n1120 Vienna, Austria',
  },
  {
    id: 'nav_contact_phone',
    pageId: 'navigation',
    sectionId: 'contact_footer',
    sectionLabel: 'Contact Phone',
    label: 'Organization Phone Number',
    description: 'Phone number displayed in the navigation drawer footer.',
    contentType: 'text',
    defaultValue: 'Tel +43 1 810 13 00',
  },
  {
    id: 'nav_contact_email',
    pageId: 'navigation',
    sectionId: 'contact_footer',
    sectionLabel: 'Contact Email',
    label: 'Organization Contact Email',
    description: 'Email address displayed in the navigation drawer footer.',
    contentType: 'text',
    defaultValue: 'info@rohingyayouthnetwork.org',
  },
  {
    id: 'nav_link_transparency',
    pageId: 'navigation',
    sectionId: 'secondary_links',
    sectionLabel: 'Footer Links',
    label: 'Footer Link: Privacy Policy',
    description: 'Privacy Policy footer link.',
    contentType: 'text',
    defaultValue: 'Privacy Policy',
  },
  {
    id: 'nav_link_imprint',
    pageId: 'navigation',
    sectionId: 'secondary_links',
    sectionLabel: 'Footer Links',
    label: 'Footer Link: Transparency',
    description: 'Transparency footer link.',
    contentType: 'text',
    defaultValue: 'Transparency',
  },
  {
    id: 'nav_link_careers',
    pageId: 'navigation',
    sectionId: 'secondary_links',
    sectionLabel: 'Footer Links',
    label: 'Footer Link: Imprint',
    description: 'Imprint footer link.',
    contentType: 'text',
    defaultValue: 'Imprint',
  },
  {
    id: 'nav_link_membership',
    pageId: 'navigation',
    sectionId: 'secondary_links',
    sectionLabel: 'Footer Links',
    label: 'Menu Link: Membership',
    description: 'Membership text button displayed in the 3-line navigation menu.',
    contentType: 'text',
    defaultValue: 'Membership',
  },
  {
    id: 'membership_page_title',
    pageId: 'navigation',
    sectionId: 'membership_page',
    sectionLabel: 'Membership Page',
    label: 'Membership Page Title',
    description: 'Main heading displayed when opening Membership from the 3-line menu.',
    contentType: 'text',
    defaultValue: 'RYGN Membership',
  },
  {
    id: 'membership_page_subtitle',
    pageId: 'navigation',
    sectionId: 'membership_page',
    sectionLabel: 'Membership Page',
    label: 'Membership Page Subtitle',
    description: 'Short introductory line below the Membership heading.',
    contentType: 'text',
    multiline: true,
    defaultValue:
      'Become part of Rohingya Young Generation Network and collaborate with youth leaders, educators, and humanitarian volunteers.',
  },
  {
    id: 'membership_story_image',
    pageId: 'navigation',
    sectionId: 'membership_page',
    sectionLabel: 'Membership Page',
    label: 'Membership Page Photo',
    description: 'Featured community photograph displayed on the Membership page.',
    contentType: 'image',
    defaultValue: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac',
    aspectHint: 'Landscape Card (260px height)',
  },
  {
    id: 'membership_page_body',
    pageId: 'navigation',
    sectionId: 'membership_page',
    sectionLabel: 'Membership Page',
    label: 'Membership Overview & Guidelines',
    description: 'Detailed membership description and how community members can participate.',
    contentType: 'text',
    multiline: true,
    defaultValue:
      'Membership in Rohingya Young Generation Network (RYGN) brings together committed youth, community coordinators, and volunteers working toward education, human rights advocacy, and humanitarian solidarity.\n\nMembers contribute to youth learning circles, community preparedness, leadership workshops, and local outreach initiatives across refugee settlements and global diaspora communities.',
  },
];

export const CMS_REGISTRY_MAP: Record<string, CmsRegistryItem> = Object.fromEntries(
  CMS_REGISTRY.map(item => [item.id, item])
);

export function validateCmsValue(contentType: CmsContentType, value: string): string | null {
  if (typeof value !== 'string') {
    return 'Content value must be a string.';
  }
  if (contentType === 'text') {
    const trimmed = value.trim();
    if (trimmed.length < CMS_TEXT_MIN_LENGTH) {
      return 'Text content cannot be empty.';
    }
    if (value.length > CMS_TEXT_MAX_LENGTH) {
      return `Text exceeds maximum allowed length (${CMS_TEXT_MAX_LENGTH.toLocaleString()} characters).`;
    }
    return null;
  }

  if (!isValidHeroImageUrl(value)) {
    return 'Media must be an HTTPS URL or a valid JPEG/PNG/WebP image under 750 KB.';
  }
  if (value.length > HERO_IMAGE_MAX_LENGTH) {
    return 'Encoded image exceeds the 750 KB Firestore limit.';
  }
  return null;
}

const ALLOWED_IMAGE_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

export function readAndOptimizeMedia(
  file: File,
  preservePng = false,
  onProgress?: (percent: number, stage: string) => void
): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!ALLOWED_IMAGE_MIME_TYPES.has(file.type)) {
      reject(new Error('Unsupported file type. Please choose a JPEG, PNG, or WebP image.'));
      return;
    }

    onProgress?.(15, 'Reading selected image...');
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file from device.'));
    reader.onload = () => {
      const result = reader.result as string;
      const img = new Image();
      img.onerror = () => reject(new Error('The selected file is not a valid image.'));
      img.onload = () => {
        onProgress?.(45, 'Optimizing image dimensions and quality...');

        if (preservePng && (file.type === 'image/png' || file.type === 'image/webp')) {
          const pngDims = [640, 480, 360, 260];
          for (const maxDim of pngDims) {
            let { width, height } = img;
            if (width > height && width > maxDim) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else if (height > maxDim) {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
              reject(new Error('Image processor is unavailable in this browser.'));
              return;
            }
            ctx.drawImage(img, 0, 0, width, height);
            const pngEncoded = canvas.toDataURL('image/png');
            if (pngEncoded.length <= SAFE_MEDIA_DATA_URL_TARGET && isValidHeroImageUrl(pngEncoded)) {
              onProgress?.(85, 'Ready for preview');
              resolve(pngEncoded);
              return;
            }
          }
        }

        const attempts: Array<{ maxDim: number; quality: number }> = [
          { maxDim: 1080, quality: 0.84 },
          { maxDim: 900, quality: 0.78 },
          { maxDim: 760, quality: 0.72 },
          { maxDim: 640, quality: 0.65 },
          { maxDim: 520, quality: 0.58 },
          { maxDim: 420, quality: 0.5 },
        ];

        for (const attempt of attempts) {
          let { width, height } = img;
          if (width > height && width > attempt.maxDim) {
            height = Math.round((height * attempt.maxDim) / width);
            width = attempt.maxDim;
          } else if (height > attempt.maxDim) {
            width = Math.round((width * attempt.maxDim) / height);
            height = attempt.maxDim;
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Image processor is unavailable in this browser.'));
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          const encoded = canvas.toDataURL('image/jpeg', attempt.quality);
          if (encoded.length <= SAFE_MEDIA_DATA_URL_TARGET && isValidHeroImageUrl(encoded)) {
            onProgress?.(85, 'Ready for preview');
            resolve(encoded);
            return;
          }
        }

        reject(new Error('Image exceeds the 750 KB Firestore limit even after compression.'));
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
  });
}
