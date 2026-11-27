import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  Clock,
  Download,
  Eye,
  History,
  LayoutDashboard,
  LogOut,
  Menu,
  Pencil,
  RefreshCw,
  RotateCcw,
  Send,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import {
  CMS_PAGES,
  CMS_REGISTRY,
  CMS_REGISTRY_MAP,
  CmsPageId,
  validateCmsValue,
} from '../cms/contentRegistry';
import { CmsHistoryRecord, useCms } from '../contexts/CmsContext';
import { useFirebase } from '../contexts/FirebaseContext';

interface AdminControlCenterProps {
  onClose: () => void;
  onOpenEditMode?: (pageId: CmsPageId) => void;
}

type AdminTab = 'dashboard' | 'preview' | 'history';

interface BannerMessage {
  type: 'success' | 'error';
  text: string;
}

export const AdminControlCenter: React.FC<AdminControlCenterProps> = ({
  onClose,
  onOpenEditMode,
}) => {
  const { user, authReady, isAdmin } = useFirebase();

  // Strict security gate BEFORE mounting or rendering any admin interface
  if (!authReady || !isAdmin || !user || !user.emailVerified) {
    return null;
  }

  return <AdminControlCenterPanel onClose={onClose} onOpenEditMode={onOpenEditMode} />;
};

const AdminControlCenterPanel: React.FC<AdminControlCenterProps> = ({
  onClose,
  onOpenEditMode,
}) => {
  const { user, signOutUser, authLoading } = useFirebase();
  const {
    publishedMap,
    history,
    adminDataLoading,
    cmsError,
    getPublished,
    getDraftValue,
    pendingDraftCount,
    clearCmsError,
    refreshAdminData,
    publishAllDrafts,
    restoreValue,
    setEditMode,
  } = useCms();

  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [busyItems, setBusyItems] = useState<Record<string, boolean>>({});
  const [confirmPublishAllPage, setConfirmPublishAllPage] = useState<CmsPageId | 'all' | null>(null);
  const [globalBanner, setGlobalBanner] = useState<BannerMessage | null>(null);
  const [publishingAll, setPublishingAll] = useState(false);

  // Preview state
  const [previewPage, setPreviewPage] = useState<
    'home' | 'donate' | 'mission' | 'leadership' | 'navigation'
  >('home');
  const [previewIncludeDrafts, setPreviewIncludeDrafts] = useState(true);
  const [previewAboutExpanded, setPreviewAboutExpanded] = useState(false);

  // History filters
  const [historyPageFilter, setHistoryPageFilter] = useState<'all' | CmsPageId>('all');
  const [historyActionFilter, setHistoryActionFilter] = useState<
    'all' | 'draft' | 'publish' | 'restore'
  >('all');

  const totalPendingDrafts = pendingDraftCount();
  const totalPublishedOverrides = Object.keys(publishedMap).length;

  const filteredHistory = useMemo(() => {
    return history.filter(entry => {
      if (historyPageFilter !== 'all' && entry.pageId !== historyPageFilter) return false;
      if (historyActionFilter !== 'all' && entry.action !== historyActionFilter) return false;
      return true;
    });
  }, [history, historyPageFilter, historyActionFilter]);

  const setItemBusy = (itemId: string, busy: boolean) => {
    setBusyItems(prev => ({ ...prev, [itemId]: busy }));
  };

  const handlePublishAll = async (target: CmsPageId | 'all') => {
    setPublishingAll(true);
    setGlobalBanner(null);
    try {
      const count = await publishAllDrafts(target === 'all' ? undefined : target);
      setConfirmPublishAllPage(null);
      setGlobalBanner({
        type: 'success',
        text:
          count > 0
            ? `Published ${count} draft change(s) to the live public app.`
            : 'No pending drafts to publish.',
      });
    } catch (error) {
      setGlobalBanner({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to publish drafts.',
      });
    } finally {
      setPublishingAll(false);
    }
  };

  const handleRestoreHistory = async (
    entry: CmsHistoryRecord,
    valueToRestore: string,
    mode: 'draft' | 'publish'
  ) => {
    const reg = CMS_REGISTRY_MAP[entry.itemId];
    if (!reg) return;
    const err = validateCmsValue(reg.contentType, valueToRestore);
    if (err) {
      setGlobalBanner({ type: 'error', text: `Cannot restore: ${err}` });
      return;
    }

    setItemBusy(entry.historyId, true);
    setGlobalBanner(null);
    try {
      await restoreValue(entry.itemId, valueToRestore, mode);
      setGlobalBanner({
        type: 'success',
        text:
          mode === 'publish'
            ? `Restored & published "${reg.label}" from history.`
            : `Restored "${reg.label}" to draft for review.`,
      });
    } catch (error) {
      setGlobalBanner({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to restore previous content.',
      });
    } finally {
      setItemBusy(entry.historyId, false);
    }
  };

  const getPreviewVal = (itemId: string): string => {
    if (previewIncludeDrafts) {
      const draft = getDraftValue(itemId);
      if (draft !== undefined) return draft;
    }
    return getPublished(itemId);
  };

  const handleEnterEditModeForPage = (pageId: CmsPageId) => {
    if (onOpenEditMode) {
      onOpenEditMode(pageId);
      return;
    }
    setEditMode(true);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 text-slate-100 flex flex-col overflow-hidden">
      {/* Top Sticky Admin Bar */}
      <header className="bg-slate-900 border-b border-slate-800 px-4 py-3 shrink-0">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Exit to App</span>
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#FFD600] shrink-0" />
                <h1 className="font-black text-sm sm:text-base text-white truncate">
                  RYGN Admin Control Center
                </h1>
              </div>
              <p className="text-[11px] text-slate-400 truncate">
                Verified Admin: <span className="text-slate-200 font-medium">{user?.email}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleEnterEditModeForPage('home')}
              className="px-3 py-2 rounded-xl bg-[#0D5B36] hover:bg-[#0a472a] text-white text-xs font-extrabold flex items-center gap-1.5 shadow transition"
            >
              <Pencil className="w-3.5 h-3.5" />
              <span>Open Edit Mode</span>
            </button>
            {totalPendingDrafts > 0 && (
              <button
                type="button"
                onClick={() => setConfirmPublishAllPage('all')}
                className="px-3 py-2 rounded-xl bg-[#FFD600] hover:bg-amber-400 text-slate-950 text-xs font-extrabold flex items-center gap-1.5 shadow transition"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Publish Drafts ({totalPendingDrafts})</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => void refreshAdminData()}
              disabled={adminDataLoading}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              title="Refresh drafts & history"
            >
              <RefreshCw
                className={`w-4 h-4 ${adminDataLoading ? 'animate-spin text-[#FFD600]' : ''}`}
              />
            </button>
            <button
              type="button"
              onClick={() => {
                void signOutUser().then(() => onClose());
              }}
              disabled={authLoading}
              className="px-3 py-2 rounded-xl bg-rose-950/70 hover:bg-rose-900 border border-rose-500/30 text-rose-200 text-xs font-bold flex items-center gap-1.5 transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="max-w-7xl mx-auto mt-3 flex items-center gap-1.5 overflow-x-auto pb-1">
          {[
            { id: 'dashboard' as const, label: 'Dashboard', icon: LayoutDashboard, badge: totalPendingDrafts },
            { id: 'preview' as const, label: 'Content Preview', icon: Eye },
            { id: 'history' as const, label: 'Change History', icon: History, badge: history.length },
          ].map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition ${
                  active
                    ? 'bg-[#FFD600] text-slate-950 shadow'
                    : 'bg-slate-950/60 text-slate-300 hover:bg-slate-800 border border-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {typeof tab.badge === 'number' && tab.badge > 0 && (
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                      active ? 'bg-slate-950 text-[#FFD600]' : 'bg-slate-800 text-amber-300'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {(globalBanner || cmsError) && (
            <div
              className={`rounded-xl p-3.5 text-xs flex items-center justify-between gap-3 border ${
                globalBanner?.type === 'success' && !cmsError
                  ? 'bg-emerald-950/70 border-emerald-500/40 text-emerald-200'
                  : 'bg-rose-950/70 border-rose-500/40 text-rose-200'
              }`}
            >
              <div className="flex items-center gap-2">
                {globalBanner?.type === 'success' && !cmsError ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                )}
                <span>{cmsError || globalBanner?.text}</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setGlobalBanner(null);
                  clearCmsError();
                }}
                className="text-slate-300 hover:text-white font-bold shrink-0"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* TAB 1: DASHBOARD HOME */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Summary Metrics */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                  <p className="text-[11px] font-semibold text-slate-400">Managed Pages</p>
                  <p className="text-2xl font-black text-white mt-1">{CMS_PAGES.length}</p>
                  <p className="text-[11px] text-slate-500 mt-1">All app routes &amp; header/footer</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                  <p className="text-[11px] font-semibold text-slate-400">Editable Fields</p>
                  <p className="text-2xl font-black text-[#FFD600] mt-1">{CMS_REGISTRY.length}</p>
                  <p className="text-[11px] text-slate-500 mt-1">Text, photos, banners &amp; logo</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                  <p className="text-[11px] font-semibold text-slate-400">Pending Drafts</p>
                  <p className="text-2xl font-black text-amber-400 mt-1">{totalPendingDrafts}</p>
                  <p className="text-[11px] text-slate-500 mt-1">Saved via Edit Mode</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                  <p className="text-[11px] font-semibold text-slate-400">Published Overrides</p>
                  <p className="text-2xl font-black text-emerald-400 mt-1">{totalPublishedOverrides}</p>
                  <p className="text-[11px] text-slate-500 mt-1">Live in Firestore CMS</p>
                </div>
              </div>

              {/* All Pages Selector */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h2 className="text-base font-black text-white">App Pages &amp; Inline Edit Mode</h2>
                    <p className="text-xs text-slate-400">
                      Jump directly into any page with Edit Mode enabled to edit titles, descriptions, photos, banners, and logos inline.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('preview')}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 flex items-center gap-1.5"
                  >
                    <Eye className="w-4 h-4 text-[#FFD600]" />
                    <span>Open Live Preview</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {CMS_PAGES.map(page => {
                    const itemsForPage = CMS_REGISTRY.filter(i => i.pageId === page.id);
                    const draftsForPage = pendingDraftCount(page.id);
                    const mediaCount = itemsForPage.filter(i => i.contentType !== 'text').length;
                    const textCount = itemsForPage.filter(i => i.contentType === 'text').length;

                    return (
                      <div
                        key={page.id}
                        className="bg-slate-950/70 border border-slate-800 hover:border-[#FFD600]/60 rounded-2xl p-4 flex flex-col justify-between gap-4 transition"
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between gap-2">
                            <h3 className="font-extrabold text-sm text-white">{page.name}</h3>
                            {draftsForPage > 0 && (
                              <span className="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[10px] font-bold">
                                {draftsForPage} draft{draftsForPage > 1 ? 's' : ''}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 leading-relaxed">{page.description}</p>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                          <span className="text-[11px] text-slate-400">
                            {textCount} text • {mediaCount} media
                          </span>
                          <button
                            type="button"
                            onClick={() => handleEnterEditModeForPage(page.id)}
                            className="px-3 py-1.5 rounded-lg bg-[#0D5B36] hover:bg-[#094227] text-white text-xs font-extrabold flex items-center gap-1.5 transition"
                          >
                            <Pencil className="w-3 h-3" />
                            <span>Edit Mode</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: LIVE CONTENT PREVIEW */}
          {activeTab === 'preview' && (
            <div className="space-y-4">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-1.5">
                  {(['home', 'donate', 'mission', 'leadership', 'navigation'] as const).map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPreviewPage(p)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition ${
                        previewPage === p
                          ? 'bg-[#FFD600] text-slate-950'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {p === 'navigation' ? 'Menu Drawer' : p}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={previewIncludeDrafts}
                      onChange={e => setPreviewIncludeDrafts(e.target.checked)}
                      className="accent-[#FFD600] w-4 h-4"
                    />
                    <span>Include Pending Drafts</span>
                  </label>

                  {totalPendingDrafts > 0 && (
                    <button
                      type="button"
                      onClick={() => setConfirmPublishAllPage('all')}
                      className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-extrabold flex items-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Publish All ({totalPendingDrafts})</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="flex justify-center">
                <div className="w-[360px] max-w-full rounded-[32px] border-4 border-slate-700 bg-white text-slate-900 shadow-2xl overflow-hidden">
                  {/* Top Bar */}
                  <div className="bg-[#1A1A1A] px-4 py-2 flex items-center justify-between text-white text-[11px]">
                    <span className="flex items-center gap-1">
                      <span>{getPreviewVal('global_default_country')}</span>
                      <ChevronDown className="w-3.5 h-3.5" />
                    </span>
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-3 h-3 text-[#FFD600]" />
                      <span className="font-bold">
                        {previewIncludeDrafts ? 'Draft Preview' : 'Published View'}
                      </span>
                    </div>
                  </div>

                  {/* App Header with centrally managed Logo */}
                  <div className="px-4 py-3 bg-white flex items-center justify-between border-b border-slate-100">
                    <img
                      src={getPreviewVal('global_app_logo')}
                      alt="App Logo Preview"
                      className="h-11 w-auto object-contain rounded"
                    />
                    <span className="px-4 py-1.5 rounded-full bg-[#0F0F0F] text-white font-black text-[11px] tracking-wider flex items-center gap-1.5">
                      <span>{getPreviewVal('global_donate_btn_label')}</span>
                      <span className="text-[#FFD600]">♥</span>
                    </span>
                    <Menu className="w-6 h-6 text-slate-950" />
                  </div>

                  {/* Preview Body */}
                  <div className="max-h-[540px] overflow-y-auto bg-white">
                    {previewPage === 'navigation' && (
                      <div className="px-7 py-8 space-y-5">
                        {[
                          getPreviewVal('nav_group_about_label'),
                          getPreviewVal('nav_group_work_label'),
                          getPreviewVal('nav_group_news_label'),
                          getPreviewVal('nav_group_partner_label'),
                        ].map(label => (
                          <div
                            key={label}
                            className="flex items-center justify-between text-[22px] font-black text-slate-950"
                          >
                            <span>{label}</span>
                            <ChevronDown className="w-5 h-5" />
                          </div>
                        ))}
                        <hr className="border-slate-300 my-5" />
                        <div className="space-y-4">
                          <div className="text-[18px] font-bold text-slate-950">
                            {getPreviewVal('nav_cta_donate')}
                          </div>
                          <div className="text-base text-slate-900">
                            {getPreviewVal('nav_link_transparency')}
                          </div>
                          <div className="text-base text-slate-900">
                            {getPreviewVal('nav_link_imprint')}
                          </div>
                          <div className="text-base text-slate-900">
                            {getPreviewVal('nav_link_careers')}
                          </div>
                        </div>
                      </div>
                    )}

                    {previewPage === 'home' && (
                      <div className="p-4 space-y-5">
                        <div className="rounded-lg overflow-hidden h-[220px] bg-slate-200 shadow">
                          <img
                            src={getPreviewVal('home_hero_banner')}
                            alt="Home Banner Preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <h2 className="text-[30px] font-black text-slate-950 leading-[1.1]">
                          {getPreviewVal('home_page_title')}
                        </h2>
                        <div className="border-[1.5px] border-slate-950 rounded bg-white">
                          <button
                            type="button"
                            onClick={() => setPreviewAboutExpanded(prev => !prev)}
                            className="w-full p-4 flex items-center justify-between font-bold text-base text-slate-950"
                          >
                            <span>{getPreviewVal('home_about_box_title')}</span>
                            <Menu className="w-5 h-5" />
                          </button>
                          {previewAboutExpanded && (
                            <div className="p-4 border-t border-slate-200 bg-slate-50 text-xs text-[#4A4A4A] whitespace-pre-wrap">
                              {getPreviewVal('home_about_box_content')}
                            </div>
                          )}
                        </div>
                        <p className="text-[#4A4A4A] text-sm leading-[1.6] whitespace-pre-wrap">
                          {getPreviewVal('home_main_paragraph')}
                        </p>
                        <div className="space-y-3 pt-2">
                          <h3 className="text-2xl font-black text-slate-950">
                            {getPreviewVal('home_policies_heading')}
                          </h3>
                          <hr className="border-slate-300" />
                          <div className="flex items-start justify-between gap-4 pt-2">
                            <div className="font-black text-sm text-slate-950 leading-[1.25] whitespace-pre-line">
                              {getPreviewVal('home_report_title')}
                              <div className="text-[11px] text-slate-500 font-bold mt-2">
                                {getPreviewVal('home_report_meta')}
                              </div>
                            </div>
                            <div className="flex flex-col items-center gap-1 shrink-0">
                              <div className="w-12 h-12 rounded-full bg-[#FFD600] flex items-center justify-center text-slate-950 shadow">
                                <Download className="w-5 h-5" />
                              </div>
                              <span className="text-xs font-black text-slate-950 underline">
                                {getPreviewVal('home_report_btn_label')}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {(previewPage === 'donate' ||
                      previewPage === 'mission' ||
                      previewPage === 'leadership') && (
                      <div className="p-6 space-y-5">
                        <h2 className="text-[32px] font-black text-slate-950 leading-[1.1]">
                          {getPreviewVal(`${previewPage}_page_title`)}
                        </h2>
                        <div className="rounded-xl overflow-hidden h-[240px] bg-slate-200 shadow">
                          <img
                            src={getPreviewVal(`${previewPage}_story_image`)}
                            alt={`${previewPage} preview`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <p className="text-[#3A3A3A] text-base leading-[1.65] whitespace-pre-wrap">
                          {getPreviewVal(`${previewPage}_story_text`)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CHANGE HISTORY & RESTORE */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={historyPageFilter}
                    onChange={e => setHistoryPageFilter(e.target.value as 'all' | CmsPageId)}
                    className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none"
                  >
                    <option value="all">All Pages</option>
                    {CMS_PAGES.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>

                  <select
                    value={historyActionFilter}
                    onChange={e =>
                      setHistoryActionFilter(
                        e.target.value as 'all' | 'draft' | 'publish' | 'restore'
                      )
                    }
                    className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none"
                  >
                    <option value="all">All Actions</option>
                    <option value="publish">Published</option>
                    <option value="draft">Draft Saved</option>
                    <option value="restore">Restored</option>
                  </select>
                </div>

                <span className="text-xs text-slate-400">
                  Showing {filteredHistory.length} audit record
                  {filteredHistory.length === 1 ? '' : 's'}
                </span>
              </div>

              {filteredHistory.length === 0 ? (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-xs text-slate-400">
                  No change history entries recorded yet for the selected filters.
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredHistory.map(entry => {
                    const reg = CMS_REGISTRY_MAP[entry.itemId];
                    const isMedia = entry.contentType !== 'text';
                    const canRestoreNew =
                      validateCmsValue(entry.contentType, entry.newValue) === null;
                    const canRestorePrev =
                      entry.previousValue.length > 0 &&
                      validateCmsValue(entry.contentType, entry.previousValue) === null;
                    const isBusy = Boolean(busyItems[entry.historyId]);

                    return (
                      <div
                        key={entry.historyId}
                        className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                                entry.action === 'publish'
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                  : entry.action === 'restore'
                                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                                    : 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                              }`}
                            >
                              {entry.action}
                            </span>
                            <span className="text-sm font-bold text-white">
                              {reg?.label || entry.itemId}
                            </span>
                            <code className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                              {entry.itemId}
                            </code>
                          </div>

                          <div className="flex items-center gap-2 text-[11px] text-slate-400">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{new Date(entry.createdAtMs).toLocaleString()}</span>
                            <span>• {entry.updatedByEmail}</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 space-y-1.5">
                            <span className="text-[10px] font-bold uppercase text-slate-500">
                              Previous Value
                            </span>
                            {isMedia ? (
                              entry.previousValue ? (
                                <img
                                  src={entry.previousValue}
                                  alt="Previous media"
                                  className="h-24 w-auto rounded object-contain bg-slate-900"
                                />
                              ) : (
                                <p className="text-slate-500 italic">None</p>
                              )
                            ) : (
                              <p className="text-slate-400 whitespace-pre-wrap break-words max-h-24 overflow-y-auto">
                                {entry.previousValue}
                              </p>
                            )}
                          </div>

                          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 space-y-1.5">
                            <span className="text-[10px] font-bold uppercase text-emerald-400">
                              New Value
                            </span>
                            {isMedia ? (
                              <img
                                src={entry.newValue}
                                alt="Updated media"
                                className="h-24 w-auto rounded object-contain bg-slate-900"
                              />
                            ) : (
                              <p className="text-slate-200 whitespace-pre-wrap break-words max-h-24 overflow-y-auto">
                                {entry.newValue}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          {canRestoreNew && (
                            <>
                              <button
                                type="button"
                                disabled={isBusy}
                                onClick={() =>
                                  void handleRestoreHistory(entry, entry.newValue, 'draft')
                                }
                                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 flex items-center gap-1.5"
                              >
                                <RotateCcw className="w-3.5 h-3.5 text-amber-300" />
                                <span>Restore Version to Draft</span>
                              </button>
                              <button
                                type="button"
                                disabled={isBusy}
                                onClick={() =>
                                  void handleRestoreHistory(entry, entry.newValue, 'publish')
                                }
                                className="px-3 py-1.5 rounded-lg bg-[#FFD600] hover:bg-amber-400 text-slate-950 text-xs font-extrabold flex items-center gap-1.5"
                              >
                                <Send className="w-3.5 h-3.5" />
                                <span>Publish This Version</span>
                              </button>
                            </>
                          )}
                          {canRestorePrev && (
                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() =>
                                void handleRestoreHistory(entry, entry.previousValue, 'draft')
                              }
                              className="px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-slate-300 flex items-center gap-1.5"
                            >
                              <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
                              <span>Revert Previous to Draft</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Bulk Publish Confirmation Modal */}
      {confirmPublishAllPage && (
        <div className="fixed inset-0 bg-slate-950/80 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <h3 className="font-black text-base text-white">Confirm Live Publication</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Publish{' '}
              <span className="font-bold text-[#FFD600]">
                {confirmPublishAllPage === 'all'
                  ? totalPendingDrafts
                  : pendingDraftCount(confirmPublishAllPage)}
              </span>{' '}
              pending draft(s) immediately to the public application? All visitors will see the
              updated content.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmPublishAllPage(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={publishingAll}
                onClick={() => void handlePublishAll(confirmPublishAllPage)}
                className="flex-1 py-2.5 rounded-xl bg-[#FFD600] hover:bg-amber-400 text-slate-950 text-xs font-extrabold"
              >
                {publishingAll ? 'Publishing...' : 'Publish Live'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
