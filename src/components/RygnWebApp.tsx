import React, { useEffect, useRef, useState } from 'react';
import {
  Search,
  Menu,
  Download,
  ChevronDown,
  Check,
  Lock,
  LayoutGrid,
  Pencil,
  LogOut,
  X,
  RotateCw,
} from 'lucide-react';
import {
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import {
  db,
  handleFirestoreError,
  isFirestoreOfflineError,
  OperationType,
} from '../firebase';
import { useFirebase } from '../contexts/FirebaseContext';
import { useCms } from '../contexts/CmsContext';
import { CmsPageId } from '../cms/contentRegistry';
import { AdminControlCenter } from './AdminControlCenter';
import { DonateView } from './DonateView';
import { HumanitarianReliefView } from './HumanitarianReliefView';
import { EditableMedia, EditableText } from './InlineEditable';
import { YouthEducationView } from './YouthEducationView';
import { FooterViewTarget, OrganizationFooter } from './OrganizationFooter';

export const RygnWebApp: React.FC = () => {
  const { user, authReady, isAdmin, authLoading, authError, signInWithGoogle, signOutUser, clearAuthError } =
    useFirebase();
  const {
    editMode,
    setEditMode,
    adminDashboardOpen,
    setAdminDashboardOpen,
    getEffectiveValue,
    pendingDraftCount,
  } = useCms();

  const [currentView, setCurrentView] = useState<
    'home' | 'donate' | 'mission' | 'leadership' | 'youth_education' | 'humanitarian_relief' | 'membership'
  >('home');

  const isVerifiedAdmin = Boolean(authReady && isAdmin && user && user.emailVerified);
  const useDraftPreview = isVerifiedAdmin && editMode;

  // RYGN Interactive States
  const defaultCountry = getEffectiveValue('global_default_country', useDraftPreview) || 'Global (English)';
  const [rygnAboutExpanded, setRygnAboutExpanded] = useState(false);
  const [rygnFontSizeScale, setRygnFontSizeScale] = useState(1.0);
  const [showAccessibilityPanel, setShowAccessibilityPanel] = useState(false);
  const [highContrastMode, setHighContrastMode] = useState(false);
  const [contrastLevel, setContrastLevel] = useState(1.28);
  const [nightMode, setNightMode] = useState(false);
  const [activeAccessibilitySlider, setActiveAccessibilitySlider] = useState<
    'increase' | 'decrease' | 'contrast' | null
  >(null);
  const [rygnCountry, setRygnCountry] = useState<string>(defaultCountry);
  const [countryCustomized, setCountryCustomized] = useState(false);
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [showNavMenu, setShowNavMenu] = useState(false);
  const [expandedNavItem, setExpandedNavItem] = useState<string | null>(null);
  const prefsExistRef = useRef(false);

  // Hidden Admin Entry States (zero visible triggers for public users)
  const [hiddenAuthModalOpen, setHiddenAuthModalOpen] = useState(false);
  const tapTimestampsRef = useRef<number[]>([]);
  const longPressTimerRef = useRef<number | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [currentView, showNavMenu]);

  const handleFooterNavigate = (view: FooterViewTarget) => {
    setShowNavMenu(false);
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    if (!countryCustomized && defaultCountry) {
      setRygnCountry(defaultCountry);
    }
  }, [countryCustomized, defaultCountry]);

  // Real-time Firestore subscriptions for authenticated user preferences
  useEffect(() => {
    if (!user || !user.emailVerified) return;

    const prefPath = `users/${user.uid}/preferences/simulator`;
    const unsubscribePrefs = onSnapshot(
      doc(db, 'users', user.uid, 'preferences', 'simulator'),
      snapshot => {
        prefsExistRef.current = snapshot.exists();
        if (snapshot.exists()) {
          const data = snapshot.data();
          if (typeof data?.country === 'string' && data.country.length >= 2 && data.country.length <= 80) {
            setRygnCountry(data.country);
            setCountryCustomized(true);
          }
          if (typeof data?.fontScale === 'number' && data.fontScale >= 0.8 && data.fontScale <= 1.5) {
            setRygnFontSizeScale(data.fontScale);
          }
        }
      },
      error => {
        if (isFirestoreOfflineError(error)) {
          console.warn('User preferences listener offline; retaining current settings.');
          return;
        }
        handleFirestoreError(error, OperationType.GET, prefPath);
      }
    );

    return () => {
      unsubscribePrefs();
    };
  }, [user]);

  // Turn on Edit Mode automatically upon verified admin login through hidden trigger;
  // immediately dismiss & sign out non-admin accounts attempting hidden entry.
  useEffect(() => {
    if (!authReady) return;

    if (hiddenAuthModalOpen && user) {
      if (isAdmin && user.emailVerified) {
        setHiddenAuthModalOpen(false);
        setEditMode(true);
      } else {
        setHiddenAuthModalOpen(false);
        setEditMode(false);
        setAdminDashboardOpen(false);
        void signOutUser();
      }
    }
  }, [authReady, user, isAdmin, hiddenAuthModalOpen, setEditMode, setAdminDashboardOpen, signOutUser]);

  // Private keyboard shortcut (Ctrl+Shift+A / Cmd+Shift+A)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        if (isVerifiedAdmin) {
          setEditMode(!editMode);
        } else {
          clearAuthError();
          setHiddenAuthModalOpen(true);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isVerifiedAdmin, editMode, setEditMode, clearAuthError]);

  const triggerHiddenAdminEntry = () => {
    if (isVerifiedAdmin) {
      setAdminDashboardOpen(true);
      return;
    }
    clearAuthError();
    setHiddenAuthModalOpen(true);
  };

  const handleLogoPointerDown = () => {
    if (longPressTimerRef.current !== null) {
      window.clearTimeout(longPressTimerRef.current);
    }
    longPressTimerRef.current = window.setTimeout(() => {
      longPressTimerRef.current = null;
      triggerHiddenAdminEntry();
    }, 1200);
  };

  const cancelLogoLongPress = () => {
    if (longPressTimerRef.current !== null) {
      window.clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const handleLogoClick = () => {
    cancelLogoLongPress();
    const now = Date.now();
    const recent = tapTimestampsRef.current.filter(ts => now - ts < 2000);
    recent.push(now);
    tapTimestampsRef.current = recent;

    if (recent.length >= 5) {
      tapTimestampsRef.current = [];
      triggerHiddenAdminEntry();
      return;
    }

    setCurrentView('home');
    setShowNavMenu(false);
  };

  const persistUserPreferences = async (nextCountry: string, nextFontScale: number) => {
    if (!user || !user.emailVerified) return;

    const sanitizedCountry = nextCountry.trim().slice(0, 80);
    if (sanitizedCountry.length < 2) return;
    const clampedScale = Math.min(1.5, Math.max(0.8, Number(nextFontScale)));

    const prefPath = `users/${user.uid}/preferences/simulator`;
    const prefRef = doc(db, 'users', user.uid, 'preferences', 'simulator');

    try {
      if (prefsExistRef.current) {
        await updateDoc(prefRef, {
          country: sanitizedCountry,
          fontScale: clampedScale,
          updatedAt: serverTimestamp(),
        });
      } else {
        await setDoc(prefRef, {
          ownerId: user.uid,
          country: sanitizedCountry,
          fontScale: clampedScale,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        prefsExistRef.current = true;
      }
    } catch (error) {
      handleFirestoreError(
        error,
        prefsExistRef.current ? OperationType.UPDATE : OperationType.CREATE,
        prefPath
      );
    }
  };

  // Effective CMS values (draft overrides shown live when Edit Mode is ON; strictly published for public)
  const missionTitle = getEffectiveValue('mission_page_title', useDraftPreview);
  const leadershipTitle = getEffectiveValue('leadership_page_title', useDraftPreview);
  const membershipTitle = getEffectiveValue('membership_page_title', useDraftPreview);

  const rawReportPdfUrl = getEffectiveValue('home_report_pdf_url', useDraftPreview).trim();
  const safeReportPdfUrl = /^https:\/\/[^\s]+$/i.test(rawReportPdfUrl)
    ? rawReportPdfUrl
    : 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';

  const navGroups = [
    {
      key: 'about',
      labelItemId: 'nav_group_about_label',
      subItems: [
        { itemId: 'nav_item_org_gov', view: 'home' as const },
        { itemId: 'nav_item_mission', view: 'home' as const },
        { itemId: 'nav_item_leadership', view: 'leadership' as const },
      ],
    },
    {
      key: 'work',
      labelItemId: 'nav_group_work_label',
      subItems: [
        { itemId: 'nav_item_work_1', view: 'home' as const },
        { itemId: 'nav_item_work_2', view: 'youth_education' as const },
        { itemId: 'nav_item_work_3', view: 'humanitarian_relief' as const },
        { itemId: 'nav_item_work_4', view: 'home' as const },
      ],
    },
    {
      key: 'news',
      labelItemId: 'nav_group_news_label',
      subItems: [
        { itemId: 'nav_item_news_1', view: 'home' as const },
        { itemId: 'nav_item_news_2', view: 'home' as const },
        { itemId: 'nav_item_news_3', view: 'home' as const },
      ],
    },
    {
      key: 'partner',
      labelItemId: 'nav_group_partner_label',
      subItems: [
        { itemId: 'nav_item_partner_1', view: 'home' as const },
        { itemId: 'nav_item_partner_2', view: 'home' as const },
        { itemId: 'nav_item_partner_3', view: 'donate' as const },
      ],
    },
  ];

  // Comprehensive Supported Countries List
  const supportedCountries = [
    defaultCountry,
    'Rohingya (Ruáingga)',
    'Myanmar / Burma',
    "Bangladesh (Cox's Bazar)",
    'Malaysia (Kuala Lumpur)',
    'Indonesia',
    'Thailand',
    'India',
    'Pakistan',
    'Saudi Arabia',
    'United Arab Emirates (UAE)',
    'Turkey',
    'United States',
    'Canada',
    'United Kingdom',
    'Australia',
    'Japan',
    'Germany',
    'Ireland',
    'Switzerland',
    'New Zealand',
  ].filter((val, idx, arr) => arr.indexOf(val) === idx);

  const draftsCount = pendingDraftCount();

  return (
    <div className="min-h-screen w-full flex flex-col bg-white text-slate-900 font-sans selection:bg-[#FFD600] selection:text-slate-950">
      {/* ACCESSIBILITY PANEL */}
      {showAccessibilityPanel && (
        <div
          role="region"
          aria-label="Accessibility Panel"
          className="w-full bg-[#F2F2F2] border-b border-slate-200 shrink-0"
        >
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 space-y-2.5">
            <h2 className="text-[17px] font-black text-slate-950 tracking-tight pb-0.5">
              Accessibility Panel
            </h2>

            {/* Increase Text */}
            <div className="space-y-1.5">
              <button
                type="button"
                onClick={() => {
                  const nextScale = Math.min(1.4, Number((rygnFontSizeScale + 0.1).toFixed(2)));
                  setRygnFontSizeScale(nextScale);
                  setActiveAccessibilitySlider('increase');
                  void persistUserPreferences(rygnCountry, nextScale);
                }}
                aria-pressed={rygnFontSizeScale > 1.0}
                aria-expanded={activeAccessibilitySlider === 'increase'}
                className={`w-full rounded-full bg-white hover:bg-slate-50 px-4 py-2.5 shadow-xs flex items-center justify-between text-left text-slate-950 transition cursor-pointer ${
                  rygnFontSizeScale > 1.0 || activeAccessibilitySlider === 'increase' ? 'ring-2 ring-[#FFD600]' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 text-center text-[13px] font-black tracking-tight shrink-0">A+</span>
                  <span className="text-[13px] font-bold">Increase Text</span>
                </div>
                {rygnFontSizeScale !== 1.0 && (
                  <span className="text-[11px] font-extrabold text-slate-600 tabular-nums">
                    {Math.round(rygnFontSizeScale * 100)}%
                  </span>
                )}
              </button>

              {activeAccessibilitySlider === 'increase' && (
                <div className="rounded-2xl bg-white px-4 py-2.5 shadow-xs border border-slate-200 flex items-center gap-2.5">
                  <span className="text-[11px] font-black text-slate-500">A-</span>
                  <input
                    type="range"
                    aria-label="Text Size Level"
                    min={0.8}
                    max={1.4}
                    step={0.05}
                    value={rygnFontSizeScale}
                    onChange={e => {
                      const nextScale = Number(parseFloat(e.target.value).toFixed(2));
                      setRygnFontSizeScale(nextScale);
                      void persistUserPreferences(rygnCountry, nextScale);
                    }}
                    className="flex-1 h-1.5 rounded-full bg-slate-200 accent-[#0F0F0F] cursor-pointer"
                  />
                  <span className="text-[12px] font-black text-slate-950">A+</span>
                  <span className="text-[11px] font-black text-slate-950 w-10 text-right tabular-nums">
                    {Math.round(rygnFontSizeScale * 100)}%
                  </span>
                </div>
              )}
            </div>

            {/* Decrease Text */}
            <div className="space-y-1.5">
              <button
                type="button"
                onClick={() => {
                  const nextScale = Math.max(0.8, Number((rygnFontSizeScale - 0.1).toFixed(2)));
                  setRygnFontSizeScale(nextScale);
                  setActiveAccessibilitySlider('decrease');
                  void persistUserPreferences(rygnCountry, nextScale);
                }}
                aria-pressed={rygnFontSizeScale < 1.0}
                aria-expanded={activeAccessibilitySlider === 'decrease'}
                className={`w-full rounded-full bg-white hover:bg-slate-50 px-4 py-2.5 shadow-xs flex items-center justify-between text-left text-slate-950 transition cursor-pointer ${
                  rygnFontSizeScale < 1.0 || activeAccessibilitySlider === 'decrease' ? 'ring-2 ring-[#FFD600]' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 text-center text-[13px] font-black tracking-tight shrink-0">A-</span>
                  <span className="text-[13px] font-bold">Decrease Text</span>
                </div>
                {rygnFontSizeScale !== 1.0 && (
                  <span className="text-[11px] font-extrabold text-slate-600 tabular-nums">
                    {Math.round(rygnFontSizeScale * 100)}%
                  </span>
                )}
              </button>

              {activeAccessibilitySlider === 'decrease' && (
                <div className="rounded-2xl bg-white px-4 py-2.5 shadow-xs border border-slate-200 flex items-center gap-2.5">
                  <span className="text-[11px] font-black text-slate-950">A-</span>
                  <input
                    type="range"
                    aria-label="Decrease Text Size Level"
                    min={0.8}
                    max={1.4}
                    step={0.05}
                    value={rygnFontSizeScale}
                    onChange={e => {
                      const nextScale = Number(parseFloat(e.target.value).toFixed(2));
                      setRygnFontSizeScale(nextScale);
                      void persistUserPreferences(rygnCountry, nextScale);
                    }}
                    className="flex-1 h-1.5 rounded-full bg-slate-200 accent-[#0F0F0F] cursor-pointer"
                  />
                  <span className="text-[12px] font-black text-slate-500">A+</span>
                  <span className="text-[11px] font-black text-slate-950 w-10 text-right tabular-nums">
                    {Math.round(rygnFontSizeScale * 100)}%
                  </span>
                </div>
              )}
            </div>

            {/* High Contrast */}
            <div className="space-y-1.5">
              <button
                type="button"
                onClick={() => {
                  if (!highContrastMode) {
                    setHighContrastMode(true);
                    if (contrastLevel <= 1.0) setContrastLevel(1.28);
                    setActiveAccessibilitySlider('contrast');
                  } else if (activeAccessibilitySlider !== 'contrast') {
                    setActiveAccessibilitySlider('contrast');
                  } else {
                    setHighContrastMode(false);
                    setActiveAccessibilitySlider(null);
                  }
                }}
                aria-pressed={highContrastMode}
                aria-expanded={activeAccessibilitySlider === 'contrast'}
                className={`w-full rounded-full bg-white hover:bg-slate-50 px-4 py-2.5 shadow-xs flex items-center justify-between text-left text-slate-950 transition cursor-pointer ${
                  highContrastMode ? 'ring-2 ring-[#FFD600]' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 flex items-center justify-center shrink-0">
                    <svg viewBox="0 0 24 24" className="w-4 h-4" aria-hidden="true">
                      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" />
                      <path d="M12 3a9 9 0 0 0 0 18Z" fill="currentColor" />
                    </svg>
                  </span>
                  <span className="text-[13px] font-bold">High Contrast</span>
                </div>
                {highContrastMode && (
                  <span className="text-[11px] font-extrabold text-slate-600 tabular-nums">
                    {Math.round(contrastLevel * 100)}%
                  </span>
                )}
              </button>

              {activeAccessibilitySlider === 'contrast' && (
                <div className="rounded-2xl bg-white px-4 py-2.5 shadow-xs border border-slate-200 flex items-center gap-2.5">
                  <span className="text-[11px] font-bold text-slate-500">Low</span>
                  <input
                    type="range"
                    aria-label="High Contrast Level"
                    min={1.0}
                    max={1.6}
                    step={0.04}
                    value={highContrastMode ? contrastLevel : 1.0}
                    onChange={e => {
                      const nextContrast = Number(parseFloat(e.target.value).toFixed(2));
                      setContrastLevel(nextContrast);
                      setHighContrastMode(nextContrast > 1.0);
                    }}
                    className="flex-1 h-1.5 rounded-full bg-slate-200 accent-[#0F0F0F] cursor-pointer"
                  />
                  <span className="text-[11px] font-black text-slate-950">High</span>
                  <span className="text-[11px] font-black text-slate-950 w-10 text-right tabular-nums">
                    {Math.round((highContrastMode ? contrastLevel : 1.0) * 100)}%
                  </span>
                </div>
              )}
            </div>

            {/* Night Mode */}
            <button
              type="button"
              onClick={() => setNightMode(prev => !prev)}
              aria-pressed={nightMode}
              className={`w-full rounded-full bg-white hover:bg-slate-50 px-4 py-2.5 shadow-xs flex items-center gap-3 text-left text-slate-950 transition cursor-pointer ${
                nightMode ? 'ring-2 ring-[#FFD600]' : ''
              }`}
            >
              <span className="w-6 flex items-center justify-center shrink-0">
                <svg viewBox="0 0 24 24" className="w-4 h-4" aria-hidden="true">
                  <polygon
                    points="12,1.8 14.5,4.8 18.4,4.2 18.8,8.1 22.1,10.3 20.1,13.7 21.6,17.4 18,18.9 16.8,22.6 13,21.5 9.6,23.2 7.5,19.9 3.6,19.4 4.1,15.5 1.4,12.7 3.9,9.6 3.1,5.7 7,5.2 9.4,2.1"
                    fill="currentColor"
                  />
                  <path
                    d="M13.5 7.2a4.8 4.8 0 1 0 3.7 7.8 3.9 3.9 0 1 1-3.7-7.8Z"
                    fill="#FFFFFF"
                  />
                </svg>
              </span>
              <span className="text-[13px] font-bold">Night Mode</span>
            </button>

            {/* Reset */}
            <button
              type="button"
              onClick={() => {
                setRygnFontSizeScale(1.0);
                setHighContrastMode(false);
                setContrastLevel(1.28);
                setNightMode(false);
                setActiveAccessibilitySlider(null);
                void persistUserPreferences(rygnCountry, 1.0);
              }}
              className="w-full rounded-full bg-white hover:bg-slate-50 px-4 py-2.5 shadow-xs flex items-center gap-3 text-left text-slate-950 transition cursor-pointer"
            >
              <span className="w-6 flex items-center justify-center shrink-0">
                <RotateCw className="w-4 h-4 stroke-[2.4]" />
              </span>
              <span className="text-[13px] font-bold">Reset</span>
            </button>
          </div>
        </div>
      )}

      {/* 1. TOP BAR (#1A1A1A) */}
      <div className="w-full bg-[#1A1A1A] border-b border-neutral-800 text-white shrink-0">
        <div className="max-w-6xl mx-auto pl-4 sm:pl-6 lg:px-8 pr-0 flex items-stretch justify-between">
          {/* Left: Country Selector */}
          <button
            type="button"
            onClick={() => setShowCountryModal(true)}
            className="flex items-center gap-1 py-2 text-[11px] sm:text-xs font-medium text-white hover:text-[#FFD600] transition cursor-pointer"
          >
            <EditableText
              itemId="global_default_country"
              directTapEdits={false}
              darkSurface
              badgeInset
            >
              <span>{rygnCountry}</span>
            </EditableText>
            <ChevronDown className="w-3.5 h-3.5" />
          </button>

          {/* Right: Search & A+ Button */}
          <div className="flex items-stretch">
            <button type="button" className="px-3 text-white hover:opacity-80 flex items-center cursor-pointer" aria-label="Search">
              <Search className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => setShowAccessibilityPanel(prev => !prev)}
              aria-expanded={showAccessibilityPanel}
              aria-label="Toggle Accessibility Panel"
              className={`px-3.5 py-2 text-xs font-black transition flex items-center justify-center cursor-pointer ${
                showAccessibilityPanel
                  ? 'bg-[#FFD600] text-slate-950'
                  : rygnFontSizeScale !== 1.0 || highContrastMode || nightMode
                    ? 'bg-[#2A2A2A] text-[#FFD600] ring-1 ring-inset ring-[#FFD600]'
                    : 'bg-[#2A2A2A] text-white hover:bg-neutral-700'
              }`}
              title="Accessibility Panel"
            >
              A+
            </button>
          </div>
        </div>
      </div>

      {/* Scoped Accessibility Theme Wrapper (Header + Pages/Menu + Footer) */}
      <div
        style={highContrastMode ? { filter: `contrast(${contrastLevel}) saturate(1.08)` } : undefined}
        className={`flex-1 flex flex-col w-full ${
          highContrastMode ? 'rygn-high-contrast' : ''
        } ${nightMode ? 'rygn-night-mode bg-[#0F172A]' : 'bg-white'}`}
      >
        {/* 2. HEADER (White) */}
        <header className="w-full bg-white border-b border-slate-100 sticky top-0 z-30 shrink-0">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
            {/* Left: Official RYGN Logo */}
            <button
              type="button"
              onClick={handleLogoClick}
              onPointerDown={handleLogoPointerDown}
              onPointerUp={cancelLogoLongPress}
              onPointerLeave={cancelLogoLongPress}
              onPointerCancel={cancelLogoLongPress}
              className="flex items-center shrink-0 hover:opacity-90 transition text-left cursor-pointer"
            >
              <EditableMedia
                itemId="global_app_logo"
                alt="Rohingya Young Generation Network Logo"
                imgClassName="h-11 sm:h-12 w-auto object-contain rounded brightness-105 contrast-105"
                directTapEdits={false}
                compactBadge
              />
            </button>

            {/* Center: DONATE Button */}
            <button
              type="button"
              onClick={() => {
                setCurrentView('donate');
                setShowNavMenu(false);
              }}
              className={`group px-4 sm:px-5 py-1.5 sm:py-2 rounded-full font-black text-[11px] sm:text-xs tracking-wider flex items-center gap-1.5 shadow transition cursor-pointer ${
                currentView === 'donate'
                  ? 'bg-[#FFD600] text-slate-950 shadow-amber-400/30'
                  : 'bg-[#0F0F0F] text-white hover:bg-slate-800'
              }`}
            >
              <EditableText
                itemId="global_donate_btn_label"
                directTapEdits={false}
                darkSurface={currentView !== 'donate'}
              />
              <span
                aria-hidden="true"
                className={`relative inline-flex items-center justify-center transition-transform duration-200 group-hover:scale-125 group-active:scale-90 ${
                  currentView === 'donate' ? 'text-slate-950' : 'text-[#FFD600]'
                }`}
              >
                <span className="animate-heart-react leading-none">♥</span>
              </span>
            </button>

            {/* Right: Hamburger Menu */}
            <button
              type="button"
              onClick={() => setShowNavMenu(prev => !prev)}
              aria-label={showNavMenu ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={showNavMenu}
              className="p-1.5 text-slate-950 hover:opacity-75 transition cursor-pointer"
            >
              {showNavMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </header>

        {/* ADMIN-ONLY EDIT MODE & DASHBOARD BAR (Strictly hidden from normal public visitors) */}
        {isVerifiedAdmin && (
          <div className="w-full bg-slate-50 border-b border-slate-200 shrink-0">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setEditMode(!editMode)}
                className={`flex-1 sm:flex-none py-2 px-4 rounded-lg text-[11px] font-extrabold flex items-center justify-center gap-1.5 transition shadow-xs cursor-pointer ${
                  editMode
                    ? 'bg-[#0D5B36] text-white'
                    : 'bg-white text-slate-800 border border-slate-300 hover:bg-slate-100'
                }`}
              >
                <Pencil className="w-3.5 h-3.5" />
                <span>{editMode ? 'Edit Mode: ON' : 'Edit Mode: OFF'}</span>
              </button>
              <button
                type="button"
                onClick={() => setAdminDashboardOpen(true)}
                className="flex-1 sm:flex-none py-2 px-4 rounded-lg bg-white hover:bg-slate-100 text-slate-900 border border-slate-300 text-[11px] font-extrabold flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Dashboard{draftsCount > 0 ? ` (${draftsCount})` : ''}</span>
              </button>
              <button
                type="button"
                onClick={() => void signOutUser()}
                disabled={authLoading}
                title="Sign out of Admin Mode"
                aria-label="Sign out of Admin Mode"
                className="ml-auto p-2 rounded-lg bg-white hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-slate-300 transition cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {showNavMenu ? (
          <nav
            aria-label="Main Navigation Menu"
            style={{ zoom: rygnFontSizeScale }}
            className="flex-1 w-full bg-white"
          >
            <div className="max-w-4xl mx-auto px-6 sm:px-8 py-8 sm:py-12">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                {navGroups.map(item => {
                  const isExpanded = expandedNavItem === item.key;
                  return (
                    <div key={item.key}>
                      <button
                        type="button"
                        onClick={() => setExpandedNavItem(isExpanded ? null : item.key)}
                        className="w-full flex items-center justify-between text-left text-[22px] font-black text-slate-950 tracking-tight hover:text-slate-700 transition cursor-pointer"
                      >
                        <EditableText itemId={item.labelItemId} directTapEdits={false} />
                        <ChevronDown
                          className={`w-5 h-5 text-slate-950 stroke-[2.25] transition-transform duration-200 ${
                            isExpanded ? 'rotate-180' : ''
                          }`}
                        />
                      </button>
                      {isExpanded && (
                        <div className="mt-2.5 pl-1 space-y-2 border-l-2 border-[#FFD600]">
                          {item.subItems.map(sub => (
                            <button
                              key={sub.itemId}
                              type="button"
                              onClick={() => {
                                setShowNavMenu(false);
                                setCurrentView(sub.view);
                              }}
                              className="block w-full text-left pl-3 py-1.5 text-base font-bold text-slate-950 hover:text-amber-600 transition cursor-pointer"
                            >
                              <EditableText itemId={sub.itemId} directTapEdits={false} />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
                <div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowNavMenu(false);
                      setCurrentView('membership');
                    }}
                    className="w-full flex items-center justify-between text-left text-[22px] font-black text-slate-950 tracking-tight hover:text-slate-700 transition cursor-pointer"
                  >
                    <EditableText itemId="nav_link_membership" directTapEdits={false} />
                  </button>
                </div>
              </div>

              <hr className="border-slate-300 my-8" />

              <div className="space-y-3 text-xs sm:text-sm text-slate-800">
                <EditableText itemId="nav_contact_phone" as="div" className="font-semibold text-slate-900" />
                <EditableText itemId="nav_contact_email" as="div" className="font-bold text-slate-950 underline" />
              </div>

              <hr className="border-slate-300 my-7" />

              <div className="flex flex-col sm:flex-row sm:flex-wrap gap-4 sm:gap-8">
                {(['nav_link_transparency', 'nav_link_imprint', 'nav_link_careers'] as const).map(itemId => (
                  <button
                    key={itemId}
                    type="button"
                    onClick={() => {
                      setShowNavMenu(false);
                      setCurrentView('home');
                    }}
                    className="block text-left text-[16px] font-normal text-slate-900 hover:text-slate-600 transition cursor-pointer"
                  >
                    <EditableText itemId={itemId} directTapEdits={false} />
                  </button>
                ))}
              </div>
            </div>
          </nav>
        ) : (
          <div style={{ zoom: rygnFontSizeScale }} className="flex-1 flex flex-col w-full bg-white">
            <main className="flex-1 w-full">
              {currentView === 'donate' ? (
                /* DONATE NOW VIEW */
                <div className="max-w-5xl mx-auto w-full">
                  <DonateView selectedCountry={rygnCountry} />
                </div>
              ) : currentView === 'mission' ? (
                /* MISSION & VISION VIEW */
                <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6 bg-white text-slate-900">
                  <EditableText
                    itemId="mission_page_title"
                    as="h1"
                    className="text-[32px] sm:text-[40px] font-black text-slate-950 leading-[1.1] tracking-tight"
                  />

                  {/* Mission Picture */}
                  <div className="relative rounded-xl overflow-hidden h-[260px] sm:h-[360px] shadow-md bg-slate-200">
                    <EditableMedia
                      itemId="mission_story_image"
                      alt={missionTitle}
                      wrapperClassName="w-full h-full"
                      imgClassName="w-full h-full object-cover"
                    />
                  </div>

                  {/* Mission Story Paragraph */}
                  <EditableText
                    itemId="mission_story_text"
                    as="p"
                    className="text-[#3A3A3A] text-base sm:text-[17px] leading-[1.7] font-normal whitespace-pre-wrap"
                  />
                </div>
              ) : currentView === 'youth_education' ? (
                /* YOUTH EDUCATION VIEW */
                <div className="max-w-5xl mx-auto w-full">
                  <YouthEducationView />
                </div>
              ) : currentView === 'humanitarian_relief' ? (
                /* HUMANITARIAN RELIEF VIEW */
                <div className="max-w-5xl mx-auto w-full">
                  <HumanitarianReliefView />
                </div>
              ) : currentView === 'leadership' ? (
                /* LEADERSHIP VIEW */
                <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6 bg-white text-slate-900">
                  <EditableText
                    itemId="leadership_page_title"
                    as="h1"
                    className="text-[32px] sm:text-[40px] font-black text-slate-950 leading-[1.1] tracking-tight"
                  />

                  {/* Leadership Picture */}
                  <div className="relative rounded-xl overflow-hidden h-[260px] sm:h-[360px] shadow-md bg-slate-200">
                    <EditableMedia
                      itemId="leadership_story_image"
                      alt={leadershipTitle}
                      wrapperClassName="w-full h-full"
                      imgClassName="w-full h-full object-cover"
                    />
                  </div>

                  {/* Leadership Story Paragraph */}
                  <EditableText
                    itemId="leadership_story_text"
                    as="p"
                    className="text-[#3A3A3A] text-base sm:text-[17px] leading-[1.7] font-normal whitespace-pre-wrap"
                  />
                </div>
              ) : currentView === 'membership' ? (
                /* MEMBERSHIP VIEW */
                <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6 bg-white text-slate-900">
                  <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#0D5B36]">
                    Rohingya Young Generation Network · Community
                  </p>

                  <EditableText
                    itemId="membership_page_title"
                    as="h1"
                    className="text-[32px] sm:text-[40px] font-black text-slate-950 leading-[1.1] tracking-tight"
                  />

                  <EditableText
                    itemId="membership_page_subtitle"
                    as="p"
                    className="text-base sm:text-[17px] font-semibold text-slate-800 leading-[1.6] whitespace-pre-wrap"
                  />

                  {/* Membership Picture */}
                  <div className="relative rounded-xl overflow-hidden h-[260px] sm:h-[360px] shadow-md bg-slate-200">
                    <EditableMedia
                      itemId="membership_story_image"
                      alt={membershipTitle}
                      wrapperClassName="w-full h-full"
                      imgClassName="w-full h-full object-cover"
                    />
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-[#FAFAF8] p-5 sm:p-7 space-y-4">
                    <EditableText
                      itemId="membership_page_body"
                      as="p"
                      className="text-[#3A3A3A] text-sm sm:text-base leading-[1.7] font-normal whitespace-pre-wrap"
                    />
                  </div>
                </div>
              ) : (
                /* MAIN HOME SCROLLING CONTENT */
                <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-5 sm:py-8 space-y-6 sm:space-y-8">
                  {/* 3. HERO IMAGE */}
                  <div className="relative rounded-xl overflow-hidden h-[240px] sm:h-[340px] md:h-[400px] shadow-md bg-slate-200">
                    <EditableMedia
                      itemId="home_hero_banner"
                      alt="Rohingya Young Generation Network Community"
                      wrapperClassName="w-full h-full"
                      imgClassName="w-full h-full object-cover"
                    />
                  </div>

                  {/* 4. TITLE SECTION */}
                  <EditableText
                    itemId="home_page_title"
                    as="h1"
                    className="text-[30px] sm:text-[38px] md:text-[42px] font-black text-slate-950 leading-[1.1] tracking-tight"
                  />

                  {/* 5. ABOUT US EXPANDABLE BOX */}
                  <div className="border border-slate-950 bg-white overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setRygnAboutExpanded(!rygnAboutExpanded)}
                      aria-expanded={rygnAboutExpanded || useDraftPreview}
                      className={`w-full px-4 sm:px-5 py-3.5 flex items-center justify-between text-left font-black text-[15px] sm:text-base text-slate-950 bg-white cursor-pointer ${
                        rygnAboutExpanded || useDraftPreview ? 'border-b border-slate-950' : ''
                      }`}
                    >
                      <EditableText itemId="home_about_box_title" directTapEdits={false} />
                      {rygnAboutExpanded || useDraftPreview ? (
                        <X className="w-5 h-5 text-slate-950 stroke-[2] shrink-0" />
                      ) : (
                        <Menu className="w-5 h-5 text-slate-950 stroke-[2] shrink-0" />
                      )}
                    </button>

                    {(rygnAboutExpanded || useDraftPreview) && (
                      <div className="px-4 sm:px-5 py-5 bg-white space-y-2.5">
                        {(
                          [
                            {
                              titleItemId: 'home_about_item_1_title',
                              dateItemId: 'home_about_item_1_date',
                              targetView: 'mission' as const,
                              isActive: false,
                            },
                            {
                              titleItemId: 'home_about_item_2_title',
                              dateItemId: 'home_about_item_2_date',
                              targetView: 'home' as const,
                              isActive: true,
                            },
                            {
                              titleItemId: 'home_about_item_3_title',
                              dateItemId: 'home_about_item_3_date',
                              targetView: 'leadership' as const,
                              isActive: false,
                            },
                          ] as const
                        ).map(item => (
                          <button
                            key={item.titleItemId}
                            type="button"
                            onClick={() => {
                              if (useDraftPreview) return;
                              setCurrentView(item.targetView);
                              setRygnAboutExpanded(false);
                            }}
                            className="w-full flex items-start gap-2.5 text-left group cursor-pointer"
                          >
                            <span className="w-3.5 pt-[5px] flex items-center justify-center shrink-0">
                              {item.isActive && (
                                <svg
                                  viewBox="0 0 10 12"
                                  className="w-2 h-2.5 text-slate-950 fill-current"
                                  aria-hidden="true"
                                >
                                  <polygon points="1,1 9,6 1,11" />
                                </svg>
                              )}
                            </span>
                            <span
                              className={`flex-1 min-w-0 text-[15px] leading-[1.55] tracking-tight ${
                                useDraftPreview ? 'flex flex-wrap items-center gap-x-2.5 gap-y-2.5 py-0.5' : ''
                              }`}
                            >
                              <EditableText
                                itemId={item.titleItemId}
                                className="font-black text-slate-950 group-hover:underline"
                              />
                              {!useDraftPreview && ' '}
                              <EditableText
                                itemId={item.dateItemId}
                                className="font-normal text-slate-900"
                              />
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* 6. CONTENT PARAGRAPH */}
                  <EditableText
                    itemId="home_main_paragraph"
                    as="p"
                    className="text-[#4A4A4A] text-sm sm:text-base leading-[1.7] whitespace-pre-wrap"
                  />

                  {/* 7. POLICIES AND REPORTS SECTION */}
                  <div className="space-y-3 pt-2">
                    <EditableText
                      itemId="home_policies_heading"
                      as="h2"
                      className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight"
                    />
                    <hr className="border-slate-300" />

                    {/* Report Item Row */}
                    <div className="flex items-start justify-between gap-4 pt-2">
                      <div className="font-black text-sm sm:text-base text-slate-950 leading-[1.3] space-y-1 flex-1 min-w-0">
                        <EditableText itemId="home_report_title" as="div" className="whitespace-pre-line" />
                        <EditableText
                          itemId="home_report_meta"
                          as="div"
                          className="text-[11px] sm:text-xs text-slate-500 font-bold mt-2"
                        />
                      </div>

                      <div className="flex flex-col items-center gap-1 shrink-0">
                        <a
                          href={safeReportPdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="Download Activity Report PDF"
                          className="w-13 h-13 rounded-full bg-[#FFD600] flex items-center justify-center text-slate-950 shadow-md hover:bg-amber-400 transition"
                        >
                          <Download className="w-6 h-6 stroke-[2.5]" />
                        </a>
                        <a
                          href={safeReportPdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-black text-slate-950 underline hover:text-amber-600 mt-1"
                        >
                          <EditableText itemId="home_report_btn_label" directTapEdits={false} />
                        </a>
                        {useDraftPreview && (
                          <EditableText
                            itemId="home_report_pdf_url"
                            as="span"
                            className="text-[10px] font-bold text-slate-700 mt-1"
                          >
                            <span>Edit PDF URL</span>
                          </EditableText>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </main>

            <OrganizationFooter onNavigate={handleFooterNavigate} />
          </div>
        )}
      </div>

      {/* Country Selection Sheet Modal */}
      {showCountryModal && (
        <div className="fixed inset-0 bg-slate-950/70 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-6 text-slate-100 space-y-4 max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-white">Select Country / Regional Portal</h3>
              <button onClick={() => setShowCountryModal(false)} className="text-xs text-slate-400 hover:text-white cursor-pointer">
                Close
              </button>
            </div>

            <div className="space-y-1 text-sm overflow-y-auto pr-1 flex-1">
              {supportedCountries.map(c => {
                const isSelected = c === rygnCountry;
                return (
                  <button
                    key={c}
                    onClick={() => {
                      setRygnCountry(c);
                      setCountryCustomized(true);
                      setShowCountryModal(false);
                      void persistUserPreferences(c, rygnFontSizeScale);
                    }}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl transition flex items-center justify-between cursor-pointer ${
                      isSelected ? 'bg-[#FFD600] text-slate-950 font-bold' : 'hover:bg-slate-800 text-slate-200'
                    }`}
                  >
                    <span>{c}</span>
                    {isSelected && <Check className="w-4 h-4 text-slate-950" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Hidden Private Verification Dialog (Never shown in public navigation/menus) */}
      {hiddenAuthModalOpen && !isAdmin && (
        <div className="fixed inset-0 bg-slate-950/80 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-6 text-slate-100 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#FFD600]" />
                <h3 className="font-bold text-base text-white">Administrator Verification</h3>
              </div>
              <button
                type="button"
                onClick={() => setHiddenAuthModalOpen(false)}
                className="text-xs text-slate-400 hover:text-white cursor-pointer"
              >
                Close
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-xs text-slate-400 leading-relaxed">
                Verify with an authorized administrator Google account to continue. Unauthorized accounts are
                automatically returned to the public application.
              </p>

              {authError && <p className="text-xs text-rose-400 font-medium">{authError}</p>}

              <button
                type="button"
                onClick={() => void signInWithGoogle()}
                disabled={authLoading}
                className="w-full py-2.5 rounded-xl bg-[#FFD600] hover:bg-amber-400 disabled:opacity-50 text-slate-950 text-xs font-extrabold transition cursor-pointer"
              >
                {authLoading ? 'Verifying...' : 'Verify with Google'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Strictly Gated Admin Control Center */}
      {adminDashboardOpen && isVerifiedAdmin && (
        <AdminControlCenter
          onClose={() => setAdminDashboardOpen(false)}
          onOpenEditMode={(pageId: CmsPageId) => {
            setEditMode(true);
            setAdminDashboardOpen(false);
            if (pageId === 'navigation') {
              setShowNavMenu(true);
            } else if (
              pageId === 'donate' ||
              pageId === 'mission' ||
              pageId === 'leadership' ||
              pageId === 'youth_education' ||
              pageId === 'humanitarian_relief'
            ) {
              setShowNavMenu(false);
              setCurrentView(pageId);
            } else {
              setShowNavMenu(false);
              setCurrentView('home');
            }
          }}
        />
      )}
    </div>
  );
};
