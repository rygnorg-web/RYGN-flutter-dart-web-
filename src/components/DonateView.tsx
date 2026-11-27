import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  ArrowDown,
  BookOpen,
  Building2,
  CheckCircle2,
  ChevronDown,
  Compass,
  CreditCard,
  ExternalLink,
  FileText,
  Globe,
  HeartHandshake,
  Info,
  Lock,
  Mail,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Users,
} from 'lucide-react';
import { useCms } from '../contexts/CmsContext';
import { useFirebase } from '../contexts/FirebaseContext';
import { EditableMedia, EditableText } from './InlineEditable';

interface DonateViewProps {
  selectedCountry?: string;
}

interface SupportedCurrencyOption {
  code: string;
  symbol: string;
  spaced?: boolean;
  label: string;
  countryKeywords: string[];
}

const SUPPORTED_CURRENCIES: SupportedCurrencyOption[] = [
  {
    code: 'BDT',
    symbol: '৳',
    label: 'BDT (৳) — Bangladesh / Rohingya',
    countryKeywords: ['bangladesh', 'rohingya'],
  },
  {
    code: 'MMK',
    symbol: 'K',
    spaced: true,
    label: 'MMK (K) — Myanmar / Burma',
    countryKeywords: ['myanmar', 'burma'],
  },
  {
    code: 'MYR',
    symbol: 'RM',
    spaced: true,
    label: 'MYR (RM) — Malaysia',
    countryKeywords: ['malaysia'],
  },
  {
    code: 'IDR',
    symbol: 'Rp',
    spaced: true,
    label: 'IDR (Rp) — Indonesia',
    countryKeywords: ['indonesia'],
  },
  {
    code: 'THB',
    symbol: '฿',
    label: 'THB (฿) — Thailand',
    countryKeywords: ['thailand'],
  },
  {
    code: 'INR',
    symbol: '₹',
    label: 'INR (₹) — India',
    countryKeywords: ['india'],
  },
  {
    code: 'PKR',
    symbol: '₨',
    label: 'PKR (₨) — Pakistan',
    countryKeywords: ['pakistan'],
  },
  {
    code: 'SAR',
    symbol: 'SAR',
    spaced: true,
    label: 'SAR — Saudi Arabia',
    countryKeywords: ['saudi'],
  },
  {
    code: 'AED',
    symbol: 'AED',
    spaced: true,
    label: 'AED — United Arab Emirates',
    countryKeywords: ['emirates', 'uae'],
  },
  {
    code: 'TRY',
    symbol: '₺',
    label: 'TRY (₺) — Turkey',
    countryKeywords: ['turkey'],
  },
  {
    code: 'USD',
    symbol: '$',
    label: 'USD ($) — United States / Global',
    countryKeywords: ['united states'],
  },
  {
    code: 'CAD',
    symbol: 'CA$',
    label: 'CAD (CA$) — Canada',
    countryKeywords: ['canada'],
  },
  {
    code: 'GBP',
    symbol: '£',
    label: 'GBP (£) — United Kingdom',
    countryKeywords: ['united kingdom'],
  },
  {
    code: 'AUD',
    symbol: 'A$',
    label: 'AUD (A$) — Australia',
    countryKeywords: ['australia'],
  },
  {
    code: 'JPY',
    symbol: '¥',
    label: 'JPY (¥) — Japan',
    countryKeywords: ['japan'],
  },
  {
    code: 'EUR',
    symbol: '€',
    label: 'EUR (€) — Germany / Ireland',
    countryKeywords: ['germany', 'ireland'],
  },
  {
    code: 'CHF',
    symbol: 'CHF',
    spaced: true,
    label: 'CHF — Switzerland',
    countryKeywords: ['switzerland'],
  },
  {
    code: 'NZD',
    symbol: 'NZ$',
    label: 'NZD (NZ$) — New Zealand',
    countryKeywords: ['new zealand'],
  },
];

function resolveCurrencyForCountry(countryName: string | undefined, fallbackCmsSymbol: string): string {
  const lower = (countryName || '').toLowerCase();
  if (lower) {
    const matched = SUPPORTED_CURRENCIES.find(c =>
      c.countryKeywords.some(keyword => lower.includes(keyword))
    );
    if (matched) return matched.code;
  }
  const bySymbol = SUPPORTED_CURRENCIES.find(c => c.symbol === fallbackCmsSymbol.trim());
  if (bySymbol) return bySymbol.code;
  return 'CUSTOM';
}

type PaymentMethodKey = 'bkash' | 'nagad' | 'bank' | 'card';

interface PaymentMethodDefinition {
  key: PaymentMethodKey;
  label: string;
  itemId: string;
  channelType: 'manual' | 'gateway';
  icon: React.ComponentType<{ className?: string }>;
}

const PAYMENT_METHODS: PaymentMethodDefinition[] = [
  {
    key: 'bkash',
    label: 'bKash',
    itemId: 'donate_bkash_info',
    channelType: 'manual',
    icon: Smartphone,
  },
  {
    key: 'nagad',
    label: 'Nagad',
    itemId: 'donate_nagad_info',
    channelType: 'manual',
    icon: Smartphone,
  },
  {
    key: 'bank',
    label: 'Bank Transfer',
    itemId: 'donate_bank_info',
    channelType: 'manual',
    icon: Building2,
  },
  {
    key: 'card',
    label: 'Card Payment',
    itemId: 'donate_card_info',
    channelType: 'gateway',
    icon: CreditCard,
  },
];

const PURPOSE_ITEMS = [
  {
    titleId: 'donate_purpose_1_title',
    descId: 'donate_purpose_1_desc',
    icon: BookOpen,
  },
  {
    titleId: 'donate_purpose_2_title',
    descId: 'donate_purpose_2_desc',
    icon: Users,
  },
  {
    titleId: 'donate_purpose_3_title',
    descId: 'donate_purpose_3_desc',
    icon: HeartHandshake,
  },
  {
    titleId: 'donate_purpose_4_title',
    descId: 'donate_purpose_4_desc',
    icon: Compass,
  },
  {
    titleId: 'donate_purpose_5_title',
    descId: 'donate_purpose_5_desc',
    icon: ShieldAlert,
  },
] as const;

const FAQ_ITEMS = [
  { qId: 'donate_faq_q1', aId: 'donate_faq_a1' },
  { qId: 'donate_faq_q2', aId: 'donate_faq_a2' },
  { qId: 'donate_faq_q3', aId: 'donate_faq_a3' },
  { qId: 'donate_faq_q4', aId: 'donate_faq_a4' },
  { qId: 'donate_faq_q5', aId: 'donate_faq_a5' },
  { qId: 'donate_faq_q6', aId: 'donate_faq_a6' },
] as const;

const DEFAULT_PRESETS = [100, 500, 1000, 2000];
const MAX_DONATION_AMOUNT = 100_000_000;

function isMethodConfigured(raw: string): boolean {
  const normalized = raw.trim().toLowerCase();
  return normalized.length > 0 && normalized !== 'not_configured';
}

export const DonateView: React.FC<DonateViewProps> = ({
  selectedCountry,
}) => {
  const { user, authReady, isAdmin } = useFirebase();
  const { editMode, getEffectiveValue } = useCms();

  const canEdit = Boolean(authReady && isAdmin && user?.emailVerified && editMode);
  const useDraftPreview = canEdit;

  const amountSectionRef = useRef<HTMLElement | null>(null);
  const transparencySectionRef = useRef<HTMLElement | null>(null);
  const customInputRef = useRef<HTMLInputElement | null>(null);

  // CMS-driven configuration values
  const donateTitle = getEffectiveValue('donate_page_title', useDraftPreview);
  const cmsCurrencySymbol = (getEffectiveValue('donate_currency_symbol', useDraftPreview) || '৳').trim() || '৳';
  const rawPresets = getEffectiveValue('donate_preset_amounts', useDraftPreview);
  const rawTarget = getEffectiveValue('donate_target_amount', useDraftPreview);
  const rawReportUrl = getEffectiveValue('donate_report_url', useDraftPreview).trim();
  const safeReportUrl = /^https:\/\/[^\s]+$/i.test(rawReportUrl) ? rawReportUrl : '#';

  const [manualCurrencyCode, setManualCurrencyCode] = useState<string | null>(null);

  useEffect(() => {
    setManualCurrencyCode(null);
  }, [selectedCountry]);

  const activeCurrencyCode = useMemo(
    () => manualCurrencyCode ?? resolveCurrencyForCountry(selectedCountry, cmsCurrencySymbol),
    [manualCurrencyCode, selectedCountry, cmsCurrencySymbol]
  );

  const activeCurrencyOption = useMemo(
    () => SUPPORTED_CURRENCIES.find(c => c.code === activeCurrencyCode) || null,
    [activeCurrencyCode]
  );

  const currencySymbol = activeCurrencyOption?.symbol || cmsCurrencySymbol;
  const currencyPrefix = activeCurrencyOption?.spaced ? `${currencySymbol} ` : currencySymbol;
  const currencyDisplayLabel = activeCurrencyOption
    ? `${activeCurrencyOption.code} (${activeCurrencyOption.symbol})`
    : cmsCurrencySymbol;

  const presetAmounts = useMemo(() => {
    const parsed = rawPresets
      .split(',')
      .map(part => Number(part.trim()))
      .filter(num => Number.isFinite(num) && num > 0 && num <= MAX_DONATION_AMOUNT);
    const unique = Array.from(new Set(parsed));
    return unique.length > 0 ? unique : DEFAULT_PRESETS;
  }, [rawPresets]);

  const parsedTargetAmount = useMemo(() => {
    const cleaned = rawTarget.replace(/,/g, '').trim();
    if (!cleaned || cleaned.toLowerCase() === 'not set') return null;
    const n = Number(cleaned);
    return Number.isFinite(n) && n > 0 ? n : null;
  }, [rawTarget]);

  // Verified transaction ledger does not exist yet — never fabricate raised amounts
  const verifiedRaisedAmount = 0;

  // Interactive amount & donor privacy state
  const [selectedPreset, setSelectedPreset] = useState<number | 'custom'>(1000);
  const [customAmountInput, setCustomAmountInput] = useState<string>('');
  const [donorPrivacyMode, setDonorPrivacyMode] = useState<'anonymous' | 'public'>('anonymous');
  const [donorDisplayName, setDonorDisplayName] = useState<string>('');
  const [recognitionConsent, setRecognitionConsent] = useState<boolean>(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethodKey | null>(null);
  const [showInstructionsSummary, setShowInstructionsSummary] = useState<boolean>(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Strict amount validation
  const amountValidation = useMemo(() => {
    if (selectedPreset !== 'custom') {
      const effectivePreset = presetAmounts.includes(selectedPreset) ? selectedPreset : presetAmounts[0];
      return { valid: true as const, amount: effectivePreset, error: null };
    }
    const trimmed = customAmountInput.trim();
    if (!trimmed) {
      return { valid: false as const, amount: null, error: 'Enter a custom donation amount greater than 0.' };
    }
    if (!/^\d+(\.\d{1,2})?$/.test(trimmed)) {
      return {
        valid: false as const,
        amount: null,
        error: 'Please enter numbers only (up to 2 decimal places).',
      };
    }
    const num = Number(trimmed);
    if (!Number.isFinite(num) || num <= 0) {
      return { valid: false as const, amount: null, error: 'Donation amount must be greater than 0.' };
    }
    if (num > MAX_DONATION_AMOUNT) {
      return {
        valid: false as const,
        amount: null,
        error: `Please enter an amount up to ${currencyPrefix}${MAX_DONATION_AMOUNT.toLocaleString()}.`,
      };
    }
    return { valid: true as const, amount: num, error: null };
  }, [selectedPreset, customAmountInput, presetAmounts, currencyPrefix]);

  const privacyValidationError = useMemo(() => {
    if (donorPrivacyMode === 'anonymous') return null;
    if (!donorDisplayName.trim()) {
      return 'Enter your preferred display name for public recognition, or select Anonymous.';
    }
    if (!recognitionConsent) {
      return 'Confirm consent to display your chosen recognition name.';
    }
    return null;
  }, [donorPrivacyMode, donorDisplayName, recognitionConsent]);

  const paymentMethodsState = useMemo(
    () =>
      PAYMENT_METHODS.map(method => {
        const value = getEffectiveValue(method.itemId, useDraftPreview);
        const configured = isMethodConfigured(value);
        // Card gateway is strictly never simulated as live checkout without a real backend gateway
        const selectable = configured && method.channelType === 'manual';
        return { ...method, value, configured, selectable };
      }),
    [getEffectiveValue, useDraftPreview]
  );

  const activePaymentMethod = useMemo(
    () => paymentMethodsState.find(m => m.key === selectedPaymentMethod && m.selectable) || null,
    [paymentMethodsState, selectedPaymentMethod]
  );

  const hasAnySelectableMethod = paymentMethodsState.some(m => m.selectable);

  const scrollToSection = (ref: React.RefObject<HTMLElement | null>) => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const formatAmount = (amount: number) =>
    `${currencyPrefix}${amount.toLocaleString(undefined, {
      minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
      maximumFractionDigits: 2,
    })}`;

  const progressPercentage =
    parsedTargetAmount && parsedTargetAmount > 0
      ? Math.min(100, Math.round((verifiedRaisedAmount / parsedTargetAmount) * 100))
      : 0;

  return (
    <div className="@container w-full bg-white text-slate-900">
      {/* 1. HERO SECTION */}
      <section className="px-5 pt-6 pb-6 @[500px]:px-7 @[500px]:pt-7 border-b border-slate-200 bg-[#FAFAF8]">
        <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#0D5B36] mb-2">
          Rohingya Young Generation Network · Support
        </p>

        <EditableText
          itemId="donate_page_title"
          as="h1"
          className="text-[28px] @[500px]:text-[34px] font-black text-slate-950 leading-[1.12] tracking-tight [text-wrap:balance]"
        />

        <EditableText
          itemId="donate_hero_subtitle"
          as="p"
          className="mt-3 text-sm @[500px]:text-[15px] text-[#3A3A3A] leading-[1.6] font-normal whitespace-pre-wrap"
        />

        {/* Primary & Secondary CTAs */}
        <div className="mt-5 flex flex-col @[460px]:flex-row gap-2.5">
          <button
            type="button"
            onClick={() => scrollToSection(amountSectionRef)}
            className="min-h-[44px] px-5 py-3 rounded-xl bg-[#FFD600] hover:bg-amber-400 active:bg-amber-500 text-slate-950 text-sm font-extrabold tracking-tight transition flex items-center justify-center gap-2 shadow-sm cursor-pointer"
          >
            <EditableText itemId="donate_hero_primary_cta" directTapEdits={false} />
            <ArrowDown className="w-4 h-4 shrink-0" />
          </button>

          <button
            type="button"
            onClick={() => scrollToSection(transparencySectionRef)}
            className="min-h-[44px] px-4 py-3 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-900 text-xs @[460px]:text-sm font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <EditableText itemId="donate_hero_secondary_cta" directTapEdits={false} />
          </button>
        </div>

        {/* Authentic Story Feature Card */}
        <div className="mt-6 rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-xs">
          <div className="relative h-[220px] @[500px]:h-[250px] bg-slate-100 overflow-hidden">
            <EditableMedia
              itemId="donate_story_image"
              alt={donateTitle}
              wrapperClassName="w-full h-full"
              imgClassName="w-full h-full object-cover"
              fallbackNode={
                <div className="w-full h-full bg-gradient-to-br from-slate-100 via-stone-100 to-amber-50 flex flex-col items-center justify-center px-6 text-center">
                  <HeartHandshake className="w-10 h-10 text-[#0D5B36] mb-2" />
                  <p className="text-sm font-bold text-slate-900">Community Humanitarian Support</p>
                  <p className="text-xs text-slate-600 mt-1 max-w-xs">
                    Rohingya Young Generation Network outreach and youth empowerment
                  </p>
                </div>
              }
            />
          </div>

          <div className="p-4 @[500px]:p-5 border-t border-slate-100">
            <EditableText
              itemId="donate_story_text"
              as="p"
              className="text-[#3A3A3A] text-sm @[500px]:text-[15px] leading-[1.65] font-normal whitespace-pre-wrap"
            />
          </div>
        </div>
      </section>

      {/* 2. DONATION AMOUNT SELECTION & DONOR RECOGNITION */}
      <section
        id="donate-amount-section"
        ref={amountSectionRef}
        className="px-5 py-6 @[500px]:px-7 border-b border-slate-200 space-y-5 bg-white"
      >
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h2 className="text-lg @[500px]:text-xl font-black text-slate-950 tracking-tight">
              Choose a Donation Amount
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Select a preset amount or enter a custom contribution in {currencyDisplayLabel}.
            </p>
          </div>
          {canEdit && (
            <div className="flex flex-wrap items-center gap-2 text-[11px]">
              <span className="text-slate-500 font-semibold">Default Currency:</span>
              <EditableText
                itemId="donate_currency_symbol"
                className="font-bold text-slate-900 bg-slate-100 rounded"
              />
              <span className="text-slate-500 font-semibold">Presets:</span>
              <EditableText
                itemId="donate_preset_amounts"
                className="font-semibold text-slate-800 bg-slate-100 rounded"
              />
            </div>
          )}
        </div>

        {/* Supported Country Currency Selector */}
        <div className="space-y-1.5">
          <label
            htmlFor="donate-currency-select"
            className="flex items-center gap-1.5 text-xs font-bold text-slate-800"
          >
            <Globe className="w-3.5 h-3.5 text-[#0D5B36] shrink-0" />
            <span>Select Currency</span>
          </label>
          <select
            id="donate-currency-select"
            value={activeCurrencyCode}
            onChange={e => {
              setManualCurrencyCode(e.target.value);
              setShowInstructionsSummary(false);
            }}
            className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-300 focus:border-slate-950 bg-white text-xs @[460px]:text-sm font-bold text-slate-950 outline-none transition cursor-pointer"
          >
            {activeCurrencyCode === 'CUSTOM' && (
              <option value="CUSTOM">{cmsCurrencySymbol} — Custom Default</option>
            )}
            {SUPPORTED_CURRENCIES.map(currency => (
              <option key={currency.code} value={currency.code}>
                {currency.label}
              </option>
            ))}
          </select>
        </div>

        {/* Preset Amount Buttons + Custom Trigger */}
        <div className="grid grid-cols-2 @[460px]:grid-cols-3 gap-2.5" role="group" aria-label="Preset donation amounts">
          {presetAmounts.map(amount => {
            const isSelected = selectedPreset === amount;
            return (
              <button
                key={amount}
                type="button"
                onClick={() => {
                  setSelectedPreset(amount);
                  setShowInstructionsSummary(false);
                }}
                aria-pressed={isSelected}
                className={`min-h-[46px] px-3 py-2.5 rounded-xl border text-sm font-extrabold tabular-nums transition cursor-pointer ${
                  isSelected
                    ? 'bg-slate-950 border-slate-950 text-[#FFD600] shadow-xs'
                    : 'bg-white border-slate-300 text-slate-900 hover:border-slate-500 hover:bg-slate-50'
                }`}
              >
                {formatAmount(amount)}
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => {
              setSelectedPreset('custom');
              setShowInstructionsSummary(false);
              window.setTimeout(() => customInputRef.current?.focus(), 40);
            }}
            aria-pressed={selectedPreset === 'custom'}
            className={`min-h-[46px] px-3 py-2.5 rounded-xl border text-sm font-extrabold transition cursor-pointer col-span-2 @[460px]:col-span-2 ${
              selectedPreset === 'custom'
                ? 'bg-slate-950 border-slate-950 text-[#FFD600] shadow-xs'
                : 'bg-white border-slate-300 text-slate-900 hover:border-slate-500 hover:bg-slate-50'
            }`}
          >
            Custom Amount
          </button>
        </div>

        {/* Custom Amount Input */}
        {selectedPreset === 'custom' && (
          <div className="space-y-1.5">
            <label htmlFor="donate-custom-amount" className="block text-xs font-bold text-slate-800">
              Enter Custom Amount ({currencyDisplayLabel})
            </label>
            <div
              className={`flex items-center min-h-[46px] rounded-xl border transition ${
                amountValidation.valid
                  ? 'border-slate-300 focus-within:border-slate-950 bg-white'
                  : 'border-rose-500 focus-within:border-rose-600 bg-rose-50/30'
              }`}
            >
              <span className="pl-3.5 pr-2 text-sm font-extrabold text-slate-700 select-none shrink-0">
                {currencySymbol}
              </span>
              <input
                ref={customInputRef}
                id="donate-custom-amount"
                type="text"
                inputMode="decimal"
                value={customAmountInput}
                onChange={e => {
                  setCustomAmountInput(e.target.value);
                  setShowInstructionsSummary(false);
                }}
                placeholder="e.g. 1500"
                aria-invalid={!amountValidation.valid}
                className="flex-1 min-w-0 pr-4 py-2.5 text-base font-bold tabular-nums text-slate-950 bg-transparent outline-none"
              />
            </div>
            {!amountValidation.valid && amountValidation.error && (
              <p role="alert" className="text-xs font-semibold text-rose-700 flex items-center gap-1.5 pt-0.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{amountValidation.error}</span>
              </p>
            )}
          </div>
        )}

        {/* Selected Amount Summary Strip */}
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 flex items-center justify-between gap-3">
          <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Selected Amount</span>
          <span className="text-lg font-black text-slate-950 tabular-nums">
            {amountValidation.valid && amountValidation.amount !== null
              ? formatAmount(amountValidation.amount)
              : '—'}
          </span>
        </div>

        {/* Donor Privacy & Recognition */}
        <div className="rounded-xl border border-slate-200 p-4 space-y-3 bg-white">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#0D5B36] shrink-0" />
            <h3 className="text-sm font-extrabold text-slate-950">Donor Privacy & Recognition</h3>
          </div>

          <div className="grid grid-cols-1 @[460px]:grid-cols-2 gap-2" role="radiogroup" aria-label="Donor recognition preference">
            <button
              type="button"
              role="radio"
              aria-checked={donorPrivacyMode === 'anonymous'}
              onClick={() => {
                setDonorPrivacyMode('anonymous');
                setShowInstructionsSummary(false);
              }}
              className={`min-h-[44px] px-3.5 py-2.5 rounded-xl border text-left transition cursor-pointer ${
                donorPrivacyMode === 'anonymous'
                  ? 'border-slate-950 bg-slate-950 text-white'
                  : 'border-slate-300 bg-white text-slate-800 hover:bg-slate-50'
              }`}
            >
              <p className="text-xs font-extrabold">Donate Anonymously</p>
              <p className={`text-[11px] mt-0.5 ${donorPrivacyMode === 'anonymous' ? 'text-slate-300' : 'text-slate-500'}`}>
                Default · No public name shown
              </p>
            </button>

            <button
              type="button"
              role="radio"
              aria-checked={donorPrivacyMode === 'public'}
              onClick={() => {
                setDonorPrivacyMode('public');
                setShowInstructionsSummary(false);
              }}
              className={`min-h-[44px] px-3.5 py-2.5 rounded-xl border text-left transition cursor-pointer ${
                donorPrivacyMode === 'public'
                  ? 'border-slate-950 bg-slate-950 text-white'
                  : 'border-slate-300 bg-white text-slate-800 hover:bg-slate-50'
              }`}
            >
              <p className="text-xs font-extrabold">Public Recognition</p>
              <p className={`text-[11px] mt-0.5 ${donorPrivacyMode === 'public' ? 'text-slate-300' : 'text-slate-500'}`}>
                Optional · Requires explicit consent
              </p>
            </button>
          </div>

          {donorPrivacyMode === 'public' && (
            <div className="space-y-2.5 pt-1 border-t border-slate-100">
              <div>
                <label htmlFor="donor-display-name" className="block text-xs font-bold text-slate-800 mb-1">
                  Display Name for Recognition
                </label>
                <input
                  id="donor-display-name"
                  type="text"
                  maxLength={60}
                  value={donorDisplayName}
                  onChange={e => {
                    setDonorDisplayName(e.target.value);
                    setShowInstructionsSummary(false);
                  }}
                  placeholder="First name or initials (e.g. A. Rahman)"
                  className="w-full min-h-[42px] px-3 py-2 rounded-lg border border-slate-300 focus:border-slate-950 text-xs text-slate-950 outline-none"
                />
              </div>

              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={recognitionConsent}
                  onChange={e => {
                    setRecognitionConsent(e.target.checked);
                    setShowInstructionsSummary(false);
                  }}
                  className="mt-0.5 h-4 w-4 rounded border-slate-400 accent-slate-950"
                />
                <span className="text-xs text-slate-700 leading-relaxed">
                  I consent to listing this display name for public donor recognition. Contact details and transaction
                  IDs will remain private.
                </span>
              </label>

              {privacyValidationError && (
                <p role="alert" className="text-xs font-semibold text-rose-700 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{privacyValidationError}</span>
                </p>
              )}
            </div>
          )}

          <EditableText
            itemId="donate_privacy_note"
            as="p"
            className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap"
          />
        </div>
      </section>

      {/* 3. PAYMENT METHODS (STRICT HONESTY — NO FABRICATED GATEWAYS) */}
      <section className="px-5 py-6 @[500px]:px-7 border-b border-slate-200 space-y-4 bg-[#FAFAF8]">
        <div>
          <EditableText
            itemId="donate_payment_heading"
            as="h2"
            className="text-lg @[500px]:text-xl font-black text-slate-950 tracking-tight"
          />
          <EditableText
            itemId="donate_payment_instructions"
            as="p"
            className="mt-1.5 text-xs @[500px]:text-sm text-slate-600 leading-relaxed whitespace-pre-wrap"
          />
        </div>

        <div className="grid grid-cols-1 @[500px]:grid-cols-2 gap-2.5">
          {paymentMethodsState.map(method => {
            const Icon = method.icon;
            const isSelected = activePaymentMethod?.key === method.key;
            const isGatewayOnly = method.channelType === 'gateway';

            return (
              <div
                key={method.key}
                className={`rounded-xl border p-3.5 transition ${
                  isSelected
                    ? 'border-slate-950 bg-white ring-1 ring-slate-950'
                    : method.selectable
                      ? 'border-slate-300 bg-white hover:border-slate-500'
                      : 'border-slate-200 bg-slate-100/80'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <Icon className={`w-4 h-4 shrink-0 ${method.selectable ? 'text-slate-900' : 'text-slate-400'}`} />
                    <span className={`text-sm font-extrabold truncate ${method.selectable ? 'text-slate-950' : 'text-slate-500'}`}>
                      {method.label}
                    </span>
                  </div>

                  {method.selectable ? (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPaymentMethod(isSelected ? null : method.key);
                        setShowInstructionsSummary(false);
                      }}
                      className={`min-h-[34px] px-3 py-1 rounded-lg text-xs font-extrabold transition cursor-pointer ${
                        isSelected
                          ? 'bg-slate-950 text-[#FFD600]'
                          : 'bg-[#FFD600] hover:bg-amber-400 text-slate-950'
                      }`}
                    >
                      {isSelected ? 'Selected' : 'Select Manual'}
                    </button>
                  ) : (
                    <span className="text-[11px] font-bold text-slate-500 shrink-0">
                      {isGatewayOnly ? 'Not integrated' : 'Not configured'}
                    </span>
                  )}
                </div>

                {/* Display configured manual details cleanly; in Edit Mode expose all 4 items for Admin */}
                {method.configured && !isGatewayOnly && (
                  <div className="mt-2.5 pt-2.5 border-t border-slate-100 text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                    <EditableText itemId={method.itemId} as="div" />
                  </div>
                )}

                {method.configured && isGatewayOnly && (
                  <div className="mt-2.5 pt-2.5 border-t border-slate-200 text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">
                    <EditableText itemId={method.itemId} as="div" />
                  </div>
                )}

                {!method.configured && canEdit && (
                  <div className="mt-2.5 pt-2.5 border-t border-slate-200 text-[11px] text-slate-600">
                    <span className="font-bold text-[#0D5B36] block mb-1">
                      Admin Edit (leave "not_configured" to keep disabled):
                    </span>
                    <EditableText itemId={method.itemId} as="div" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Action & Manual Instruction Review */}
        {hasAnySelectableMethod ? (
          <div className="space-y-3 pt-1">
            <button
              type="button"
              disabled={!amountValidation.valid || Boolean(privacyValidationError) || !activePaymentMethod}
              onClick={() => setShowInstructionsSummary(true)}
              className="w-full min-h-[46px] px-5 py-3 rounded-xl bg-[#FFD600] hover:bg-amber-400 disabled:bg-slate-200 disabled:text-slate-500 disabled:cursor-not-allowed text-slate-950 text-sm font-extrabold transition cursor-pointer"
            >
              {activePaymentMethod && amountValidation.valid && amountValidation.amount !== null
                ? `Review ${activePaymentMethod.label} Transfer Instructions (${formatAmount(amountValidation.amount)})`
                : 'Select an active manual method above'}
            </button>

            {showInstructionsSummary && activePaymentMethod && amountValidation.valid && amountValidation.amount !== null && !privacyValidationError && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 space-y-2.5">
                <div className="flex items-center gap-2 text-emerald-900">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <h3 className="text-sm font-extrabold">
                    Manual Transfer Summary — {activePaymentMethod.label}
                  </h3>
                </div>
                <div className="text-xs text-slate-800 space-y-1">
                  <p>
                    <span className="font-bold">Amount to send:</span>{' '}
                    <span className="tabular-nums font-extrabold">{formatAmount(amountValidation.amount)}</span>
                  </p>
                  <p>
                    <span className="font-bold">Recognition:</span>{' '}
                    {donorPrivacyMode === 'anonymous'
                      ? 'Anonymous (no public name listed)'
                      : `Public recognition consented (${donorDisplayName.trim()})`}
                  </p>
                </div>
                <div className="rounded-lg bg-white border border-emerald-200 p-3 text-xs text-slate-800 whitespace-pre-wrap leading-relaxed">
                  {activePaymentMethod.value}
                </div>
                <p className="text-[11px] text-slate-600">
                  Note: Complete the transfer directly in your banking or mobile wallet app, then confirm via our official
                  organization contact email below if you would like a receipt.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-xl border border-slate-200 bg-white p-3.5 flex items-start gap-2.5 text-xs text-slate-700 leading-relaxed">
            <Lock className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-slate-900">Online checkout is not active yet</p>
              <p className="mt-0.5 text-slate-600">
                No automated payment gateway is connected, and no manual transfer account has been published yet. Please
                contact the organization directly via the official details below before sending funds.
              </p>
            </div>
          </div>
        )}
      </section>

      {/* 4. DONATION PROGRESS (HONEST EMPTY / ZERO-VERIFIED-LEDGER STATE) */}
      <section className="px-5 py-6 @[500px]:px-7 border-b border-slate-200 space-y-3 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-base @[500px]:text-lg font-black text-slate-950 tracking-tight">
            Campaign Progress
          </h2>
          {canEdit && (
            <div className="flex items-center gap-1.5 text-[11px]">
              <span className="text-slate-500 font-semibold">Target:</span>
              <EditableText
                itemId="donate_target_amount"
                className="font-bold text-slate-900 bg-slate-100 rounded"
              />
            </div>
          )}
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
          {parsedTargetAmount !== null ? (
            <>
              <div className="grid grid-cols-3 gap-2 text-center @[460px]:text-left">
                <div>
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Verified Raised</p>
                  <p className="text-base font-black text-slate-950 tabular-nums mt-0.5">
                    {formatAmount(verifiedRaisedAmount)}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Target</p>
                  <p className="text-base font-black text-slate-950 tabular-nums mt-0.5">
                    {formatAmount(parsedTargetAmount)}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Remaining</p>
                  <p className="text-base font-black text-slate-950 tabular-nums mt-0.5">
                    {formatAmount(Math.max(0, parsedTargetAmount - verifiedRaisedAmount))}
                  </p>
                </div>
              </div>

              <div className="space-y-1">
                <div
                  role="progressbar"
                  aria-valuenow={progressPercentage}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label="Campaign fundraising progress"
                  className="w-full h-2.5 rounded-full bg-slate-200 overflow-hidden"
                >
                  <div
                    className="h-full bg-[#0D5B36] transition-all duration-300"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
                <p className="text-[11px] font-bold text-slate-600 tabular-nums">{progressPercentage}% funded</p>
              </div>
            </>
          ) : (
            <div className="flex items-start gap-2.5 text-xs text-slate-700">
              <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
              <p className="font-bold text-slate-900">
                No active campaign fundraising target is configured yet.
              </p>
            </div>
          )}

          <EditableText
            itemId="donate_progress_note"
            as="p"
            className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap"
          />
        </div>
      </section>

      {/* 5. DONATION PURPOSE / PROGRAMS */}
      <section className="px-5 py-6 @[500px]:px-7 border-b border-slate-200 space-y-4 bg-[#FAFAF8]">
        <div>
          <EditableText
            itemId="donate_purpose_heading"
            as="h2"
            className="text-lg @[500px]:text-xl font-black text-slate-950 tracking-tight"
          />
          <EditableText
            itemId="donate_purpose_intro"
            as="p"
            className="mt-1 text-xs @[500px]:text-sm text-slate-600 leading-relaxed whitespace-pre-wrap"
          />
        </div>

        <div className="grid grid-cols-1 @[500px]:grid-cols-2 gap-3">
          {PURPOSE_ITEMS.map(item => {
            const Icon = item.icon;
            return (
              <div
                key={item.titleId}
                className="rounded-xl border border-slate-200 bg-white p-4 flex items-start gap-3"
              >
                <div className="w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-[#0D5B36]" />
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <EditableText
                    itemId={item.titleId}
                    as="div"
                    className="text-sm font-extrabold text-slate-950 leading-snug"
                  />
                  <EditableText
                    itemId={item.descId}
                    as="p"
                    className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 6. TRANSPARENCY & OFFICIAL CONTACT SECTION */}
      <section
        id="donate-transparency"
        ref={transparencySectionRef}
        className="px-5 py-6 @[500px]:px-7 border-b border-slate-200 space-y-4 bg-white"
      >
        <div className="space-y-2">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#0D5B36]">
            Accountability & Governance
          </p>
          <EditableText
            itemId="donate_transparency_heading"
            as="h2"
            className="text-lg @[500px]:text-xl font-black text-slate-950 tracking-tight"
          />
          <EditableText
            itemId="donate_transparency_body"
            as="p"
            className="text-xs @[500px]:text-sm text-[#3A3A3A] leading-relaxed whitespace-pre-wrap"
          />
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
          <div className="flex items-start gap-2.5">
            <FileText className="w-4 h-4 text-[#0D5B36] shrink-0 mt-0.5" />
            <EditableText
              itemId="donate_financial_note"
              as="p"
              className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            {safeReportUrl !== '#' ? (
              <a
                href={safeReportUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-[42px] px-4 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-white text-xs font-extrabold inline-flex items-center gap-2 transition"
              >
                <EditableText itemId="donate_report_label" directTapEdits={false} darkSurface />
                <ExternalLink className="w-3.5 h-3.5 shrink-0" />
              </a>
            ) : (
              <span className="text-xs text-slate-500 font-semibold">
                Published report link is not currently set.
              </span>
            )}

            {canEdit && (
              <EditableText
                itemId="donate_report_url"
                as="span"
                className="text-[11px] font-bold text-[#0D5B36]"
              >
                <span>Edit Report PDF URL</span>
              </EditableText>
            )}
          </div>
        </div>

        {/* Official Organizational Contact */}
        <div className="rounded-xl border border-slate-200 bg-[#FAFAF8] p-4 flex items-start gap-2.5">
          <Mail className="w-4 h-4 text-slate-700 shrink-0 mt-0.5" />
          <div className="min-w-0 flex-1 space-y-0.5">
            <p className="text-xs font-extrabold text-slate-900">Receipts & Organizational Inquiries</p>
            <EditableText
              itemId="donate_contact_info"
              as="p"
              className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap"
            />
          </div>
        </div>
      </section>

      {/* 7. FAQ SECTION */}
      <section className="px-5 py-6 @[500px]:px-7 bg-[#FAFAF8] space-y-4">
        <EditableText
          itemId="donate_faq_heading"
          as="h2"
          className="text-lg @[500px]:text-xl font-black text-slate-950 tracking-tight"
        />

        <div className="space-y-2">
          {FAQ_ITEMS.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div
                key={faq.qId}
                className="rounded-xl border border-slate-200 bg-white overflow-hidden"
              >
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  className="w-full min-h-[48px] px-4 py-3 flex items-center justify-between gap-3 text-left hover:bg-slate-50 transition cursor-pointer"
                >
                  <EditableText
                    itemId={faq.qId}
                    as="span"
                    directTapEdits={false}
                    className="text-xs @[500px]:text-sm font-extrabold text-slate-950 leading-snug flex-1"
                  />
                  <ChevronDown
                    className={`w-4 h-4 text-slate-600 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-4 pb-4 pt-1 border-t border-slate-100">
                    <EditableText
                      itemId={faq.aId}
                      as="p"
                      className="text-xs @[500px]:text-sm text-[#3A3A3A] leading-relaxed whitespace-pre-wrap"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
