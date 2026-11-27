import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  where,
} from 'firebase/firestore';
import {
  BOOTSTRAPPED_ADMIN_EMAIL,
  db,
  handleFirestoreError,
  isFirestoreOfflineError,
  isValidHeroImageUrl,
  OperationType,
} from '../firebase';
import {
  CMS_REGISTRY,
  CMS_REGISTRY_MAP,
  CmsContentType,
  CmsPageId,
  validateCmsValue,
} from '../cms/contentRegistry';
import { useFirebase } from './FirebaseContext';

const PUBLISHED_CACHE_KEY = 'rygn_cms_published_cache_v1';

export interface CmsPublishedRecord {
  itemId: string;
  pageId: CmsPageId;
  sectionId: string;
  contentType: CmsContentType;
  value: string;
  isPublic: boolean;
  updatedBy: string;
  updatedByEmail: string;
  updatedAtMs: number;
}

export interface CmsDraftRecord {
  itemId: string;
  pageId: CmsPageId;
  sectionId: string;
  contentType: CmsContentType;
  draftValue: string;
  updatedBy: string;
  updatedByEmail: string;
  updatedAtMs: number;
}

export interface CmsHistoryRecord {
  historyId: string;
  itemId: string;
  pageId: CmsPageId;
  sectionId: string;
  contentType: CmsContentType;
  action: 'draft' | 'publish' | 'restore';
  previousValue: string;
  newValue: string;
  updatedBy: string;
  updatedByEmail: string;
  createdAtMs: number;
}

interface CmsContextValue {
  publishedMap: Record<string, string>;
  publishedMeta: Record<string, CmsPublishedRecord>;
  legacyMap: Record<string, string>;
  draftsMap: Record<string, CmsDraftRecord>;
  history: CmsHistoryRecord[];
  cmsLoading: boolean;
  adminDataLoading: boolean;
  cmsError: string | null;
  editMode: boolean;
  setEditMode: (enabled: boolean) => void;
  adminDashboardOpen: boolean;
  setAdminDashboardOpen: (open: boolean) => void;
  activeInlineItemId: string | null;
  openInlineEdit: (itemId: string) => void;
  closeInlineEdit: () => void;
  pendingInlineMedia: { itemId: string; file: File } | null;
  openInlineMediaFile: (itemId: string, file: File) => void;
  clearInlineMediaFile: () => void;
  getPublished: (itemId: string) => string;
  getDraftValue: (itemId: string) => string | undefined;
  getEffectiveValue: (itemId: string, useDraft?: boolean) => string;
  pendingDraftCount: (pageId?: CmsPageId) => number;
  clearCmsError: () => void;
  refreshAdminData: () => Promise<void>;
  saveDraft: (itemId: string, value: string) => Promise<void>;
  discardDraft: (itemId: string) => Promise<void>;
  publishItem: (itemId: string, overrideValue?: string) => Promise<void>;
  publishAllDrafts: (pageId?: CmsPageId) => Promise<number>;
  restoreValue: (itemId: string, value: string, mode: 'draft' | 'publish') => Promise<void>;
  resetItemToDefault: (itemId: string) => Promise<void>;
}

const CmsContext = createContext<CmsContextValue | undefined>(undefined);

function timestampToMs(ts: unknown): number {
  if (ts instanceof Timestamp) {
    return ts.toMillis();
  }
  if (ts && typeof ts === 'object' && 'toMillis' in ts && typeof (ts as Timestamp).toMillis === 'function') {
    return (ts as Timestamp).toMillis();
  }
  return Date.now();
}

function loadCachedPublished(): Record<string, string> {
  try {
    const raw = localStorage.getItem(PUBLISHED_CACHE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') {
      return parsed as Record<string, string>;
    }
  } catch {
    // Ignore invalid local cache
  }
  return {};
}

function saveCachedPublished(map: Record<string, string>) {
  try {
    localStorage.setItem(PUBLISHED_CACHE_KEY, JSON.stringify(map));
  } catch {
    // Ignore storage quota errors
  }
}

export const CmsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, authReady, isAdmin } = useFirebase();

  const [publishedMeta, setPublishedMeta] = useState<Record<string, CmsPublishedRecord>>({});
  const [publishedMap, setPublishedMap] = useState<Record<string, string>>(() => loadCachedPublished());
  const [legacyMap, setLegacyMap] = useState<Record<string, string>>({});
  const [draftsMap, setDraftsMap] = useState<Record<string, CmsDraftRecord>>({});
  const [history, setHistory] = useState<CmsHistoryRecord[]>([]);
  const [cmsLoading, setCmsLoading] = useState(true);
  const [adminDataLoading, setAdminDataLoading] = useState(false);
  const [cmsError, setCmsError] = useState<string | null>(null);
  const [editModeState, setEditModeState] = useState(false);
  const [adminDashboardOpenState, setAdminDashboardOpenState] = useState(false);
  const [activeInlineItemId, setActiveInlineItemId] = useState<string | null>(null);
  const [pendingInlineMedia, setPendingInlineMedia] = useState<{ itemId: string; file: File } | null>(null);
  const [fatalError, setFatalError] = useState<Error | null>(null);

  if (fatalError) {
    throw fatalError;
  }

  const isVerifiedAdmin = Boolean(authReady && isAdmin && user && user.emailVerified);

  useEffect(() => {
    if (!isVerifiedAdmin) {
      setEditModeState(false);
      setAdminDashboardOpenState(false);
      setActiveInlineItemId(null);
      setPendingInlineMedia(null);
    }
  }, [isVerifiedAdmin]);

  const editMode = isVerifiedAdmin && editModeState;
  const adminDashboardOpen = isVerifiedAdmin && adminDashboardOpenState;

  const setEditMode = useCallback(
    (enabled: boolean) => {
      if (!isVerifiedAdmin) {
        setEditModeState(false);
        return;
      }
      setEditModeState(enabled);
    },
    [isVerifiedAdmin]
  );

  const setAdminDashboardOpen = useCallback(
    (open: boolean) => {
      if (!isVerifiedAdmin) {
        setAdminDashboardOpenState(false);
        return;
      }
      setAdminDashboardOpenState(open);
    },
    [isVerifiedAdmin]
  );

  const openInlineEdit = useCallback(
    (itemId: string) => {
      if (!isVerifiedAdmin) return;
      setActiveInlineItemId(itemId);
    },
    [isVerifiedAdmin]
  );

  const closeInlineEdit = useCallback(() => {
    setActiveInlineItemId(null);
    setPendingInlineMedia(null);
  }, []);

  const openInlineMediaFile = useCallback(
    (itemId: string, file: File) => {
      if (!isVerifiedAdmin) return;
      setPendingInlineMedia({ itemId, file });
      setActiveInlineItemId(itemId);
    },
    [isVerifiedAdmin]
  );

  const clearInlineMediaFile = useCallback(() => {
    setPendingInlineMedia(null);
  }, []);

  // Subscribe to public published CMS items + legacy config fallbacks
  useEffect(() => {
    let active = true;

    const loadLegacyFallbacks = async () => {
      try {
        const [
          heroSnap,
          donateSnap,
          missionSnap,
          leadershipSnap,
          homeTextSnap,
          donateTextSnap,
          missionTextSnap,
          leadershipTextSnap,
        ] = await Promise.all([
          getDoc(doc(db, 'site_config', 'hero')),
          getDoc(doc(db, 'site_config', 'donate')),
          getDoc(doc(db, 'site_config', 'mission')),
          getDoc(doc(db, 'site_config', 'leadership')),
          getDoc(doc(db, 'page_texts', 'home')),
          getDoc(doc(db, 'page_texts', 'donate')),
          getDoc(doc(db, 'page_texts', 'mission')),
          getDoc(doc(db, 'page_texts', 'leadership')),
        ]);

        if (!active) return;

        const nextLegacy: Record<string, string> = {};
        if (heroSnap.exists()) {
          const url = heroSnap.data()?.imageUrl;
          if (typeof url === 'string' && isValidHeroImageUrl(url)) {
            nextLegacy.home_hero_banner = url;
          }
        }
        if (donateSnap.exists()) {
          const url = donateSnap.data()?.imageUrl;
          if (typeof url === 'string' && isValidHeroImageUrl(url)) {
            nextLegacy.donate_story_image = url;
          }
        }
        if (missionSnap.exists()) {
          const url = missionSnap.data()?.imageUrl;
          if (typeof url === 'string' && isValidHeroImageUrl(url)) {
            nextLegacy.mission_story_image = url;
          }
        }
        if (leadershipSnap.exists()) {
          const url = leadershipSnap.data()?.imageUrl;
          if (typeof url === 'string' && isValidHeroImageUrl(url)) {
            nextLegacy.leadership_story_image = url;
          }
        }
        if (homeTextSnap.exists()) {
          const data = homeTextSnap.data() as Record<string, unknown>;
          if (typeof data.title === 'string' && data.title.trim()) nextLegacy.home_page_title = data.title;
          if (typeof data.aboutTitle === 'string' && data.aboutTitle.trim()) nextLegacy.home_about_box_title = data.aboutTitle;
          if (typeof data.aboutContent === 'string' && data.aboutContent.trim()) nextLegacy.home_about_box_content = data.aboutContent;
          if (typeof data.mainParagraph === 'string' && data.mainParagraph.trim()) nextLegacy.home_main_paragraph = data.mainParagraph;
          if (typeof data.reportsHeading === 'string' && data.reportsHeading.trim()) nextLegacy.home_policies_heading = data.reportsHeading;
        }
        if (donateTextSnap.exists()) {
          const data = donateTextSnap.data() as Record<string, unknown>;
          if (typeof data.title === 'string' && data.title.trim()) nextLegacy.donate_page_title = data.title;
          if (typeof data.storyText === 'string' && data.storyText.trim()) nextLegacy.donate_story_text = data.storyText;
        }
        if (missionTextSnap.exists()) {
          const data = missionTextSnap.data() as Record<string, unknown>;
          if (typeof data.title === 'string' && data.title.trim()) nextLegacy.mission_page_title = data.title;
          if (typeof data.storyText === 'string' && data.storyText.trim()) nextLegacy.mission_story_text = data.storyText;
        }
        if (leadershipTextSnap.exists()) {
          const data = leadershipTextSnap.data() as Record<string, unknown>;
          if (typeof data.title === 'string' && data.title.trim()) nextLegacy.leadership_page_title = data.title;
          if (typeof data.storyText === 'string' && data.storyText.trim()) nextLegacy.leadership_story_text = data.storyText;
        }

        setLegacyMap(nextLegacy);
      } catch (error) {
        if (isFirestoreOfflineError(error)) {
          console.warn('Firestore legacy config unreachable while offline; using defaults/cache.');
          return;
        }
        try {
          handleFirestoreError(error, OperationType.GET, 'site_config/hero');
        } catch (structuredError) {
          if (active && structuredError instanceof Error) {
            setFatalError(structuredError);
          }
        }
      }
    };

    void loadLegacyFallbacks();

    const publishedQuery = query(collection(db, 'cms_published'), where('isPublic', '==', true));
    const unsubscribePublished = onSnapshot(
      publishedQuery,
      snapshot => {
        if (!active) return;
        const nextMeta: Record<string, CmsPublishedRecord> = {};
        const nextValues: Record<string, string> = {};

        snapshot.forEach(docSnap => {
          const data = docSnap.data();
          const itemId = typeof data.itemId === 'string' ? data.itemId : docSnap.id;
          const reg = CMS_REGISTRY_MAP[itemId];
          if (!reg) return;
          if (typeof data.value !== 'string') return;
          if (validateCmsValue(reg.contentType, data.value) !== null) return;

          nextValues[itemId] = data.value;
          nextMeta[itemId] = {
            itemId,
            pageId: data.pageId as CmsPageId,
            sectionId: String(data.sectionId || reg.sectionId),
            contentType: data.contentType as CmsContentType,
            value: data.value,
            isPublic: Boolean(data.isPublic),
            updatedBy: String(data.updatedBy || ''),
            updatedByEmail: String(data.updatedByEmail || ''),
            updatedAtMs: timestampToMs(data.updatedAt),
          };
        });

        setPublishedMeta(nextMeta);
        setPublishedMap(nextValues);
        saveCachedPublished(nextValues);
        setCmsLoading(false);
      },
      error => {
        if (!active) return;
        setCmsLoading(false);
        if (isFirestoreOfflineError(error)) {
          console.warn('Firestore live CMS listener offline; displaying cached/default content.');
          return;
        }
        try {
          handleFirestoreError(error, OperationType.LIST, 'cms_published');
        } catch (structuredError) {
          if (active && structuredError instanceof Error) {
            setFatalError(structuredError);
          }
        }
      }
    );

    return () => {
      active = false;
      unsubscribePublished();
    };
  }, []);

  const refreshAdminData = useCallback(async () => {
    if (!authReady || !isAdmin || !user || !user.emailVerified || !user.email) {
      setDraftsMap({});
      setHistory([]);
      return;
    }

    setAdminDataLoading(true);
    setCmsError(null);
    try {
      const draftResults = await Promise.all(
        CMS_REGISTRY.map(async item => {
          const snap = await getDoc(doc(db, 'cms_drafts', item.id));
          return { item, snap };
        })
      );

      const nextDrafts: Record<string, CmsDraftRecord> = {};
      for (const { item, snap } of draftResults) {
        if (!snap.exists()) continue;
        const data = snap.data();
        if (typeof data.draftValue !== 'string') continue;
        nextDrafts[item.id] = {
          itemId: item.id,
          pageId: item.pageId,
          sectionId: item.sectionId,
          contentType: item.contentType,
          draftValue: data.draftValue,
          updatedBy: String(data.updatedBy || ''),
          updatedByEmail: String(data.updatedByEmail || ''),
          updatedAtMs: timestampToMs(data.updatedAt),
        };
      }
      setDraftsMap(nextDrafts);

      const historyQuery =
        user.email === BOOTSTRAPPED_ADMIN_EMAIL
          ? collection(db, 'cms_history')
          : query(collection(db, 'cms_history'), where('updatedBy', '==', user.uid));
      const historySnap = await getDocs(historyQuery);
      const nextHistory: CmsHistoryRecord[] = [];
      historySnap.forEach(docSnap => {
        const data = docSnap.data();
        nextHistory.push({
          historyId: docSnap.id,
          itemId: String(data.itemId || ''),
          pageId: (data.pageId as CmsPageId) || 'home',
          sectionId: String(data.sectionId || ''),
          contentType: (data.contentType as CmsContentType) || 'text',
          action: (data.action as 'draft' | 'publish' | 'restore') || 'publish',
          previousValue: String(data.previousValue || ''),
          newValue: String(data.newValue || ''),
          updatedBy: String(data.updatedBy || ''),
          updatedByEmail: String(data.updatedByEmail || ''),
          createdAtMs: timestampToMs(data.createdAt),
        });
      });
      nextHistory.sort((a, b) => b.createdAtMs - a.createdAtMs);
      setHistory(nextHistory);
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unable to load admin drafts and history.';
      setCmsError(msg);
      try {
        handleFirestoreError(error, OperationType.GET, 'cms_drafts');
      } catch (structuredError) {
        console.warn('Admin CMS data fetch error:', structuredError);
      }
    } finally {
      setAdminDataLoading(false);
    }
  }, [authReady, isAdmin, user]);

  useEffect(() => {
    void refreshAdminData();
  }, [refreshAdminData]);

  const getPublished = useCallback(
    (itemId: string): string => {
      if (Object.prototype.hasOwnProperty.call(publishedMap, itemId)) {
        return publishedMap[itemId];
      }
      if (Object.prototype.hasOwnProperty.call(legacyMap, itemId)) {
        return legacyMap[itemId];
      }
      return CMS_REGISTRY_MAP[itemId]?.defaultValue ?? '';
    },
    [publishedMap, legacyMap]
  );

  const getDraftValue = useCallback(
    (itemId: string): string | undefined => {
      if (!authReady || !isAdmin) return undefined;
      return draftsMap[itemId]?.draftValue;
    },
    [authReady, isAdmin, draftsMap]
  );

  const getEffectiveValue = useCallback(
    (itemId: string, useDraft = false): string => {
      if (useDraft && authReady && isAdmin && draftsMap[itemId]) {
        return draftsMap[itemId].draftValue;
      }
      return getPublished(itemId);
    },
    [authReady, isAdmin, draftsMap, getPublished]
  );

  const pendingDraftCount = useCallback(
    (pageId?: CmsPageId): number => {
      if (!authReady || !isAdmin) return 0;
      return Object.values(draftsMap).filter(d => !pageId || d.pageId === pageId).length;
    },
    [authReady, isAdmin, draftsMap]
  );

  const requireVerifiedAdmin = useCallback(() => {
    if (!authReady || !isAdmin || !user || !user.emailVerified || !user.email) {
      throw new Error('Unauthorized: Verified administrator authentication is required.');
    }
    return {
      uid: user.uid,
      email: user.email,
    };
  }, [authReady, isAdmin, user]);

  const recordHistory = useCallback(
    async (
      itemId: string,
      action: 'draft' | 'publish' | 'restore',
      previousValue: string,
      newValue: string
    ) => {
      const admin = requireVerifiedAdmin();
      const item = CMS_REGISTRY_MAP[itemId];
      if (!item) return;

      const truncatedPrev = previousValue.slice(0, 750000);
      const docRef = await addDoc(collection(db, 'cms_history'), {
        itemId: item.id,
        pageId: item.pageId,
        sectionId: item.sectionId,
        contentType: item.contentType,
        action,
        previousValue: truncatedPrev,
        newValue,
        updatedBy: admin.uid,
        updatedByEmail: admin.email,
        createdAt: serverTimestamp(),
      });

      const entry: CmsHistoryRecord = {
        historyId: docRef.id,
        itemId: item.id,
        pageId: item.pageId,
        sectionId: item.sectionId,
        contentType: item.contentType,
        action,
        previousValue: truncatedPrev,
        newValue,
        updatedBy: admin.uid,
        updatedByEmail: admin.email,
        createdAtMs: Date.now(),
      };
      setHistory(prev => [entry, ...prev]);
    },
    [requireVerifiedAdmin]
  );

  const saveDraft = useCallback(
    async (itemId: string, rawValue: string) => {
      const admin = requireVerifiedAdmin();
      const item = CMS_REGISTRY_MAP[itemId];
      if (!item) throw new Error(`Unknown content item: ${itemId}`);

      const value = item.contentType === 'text' ? rawValue : rawValue.trim();
      const validationError = validateCmsValue(item.contentType, value);
      if (validationError) {
        throw new Error(validationError);
      }

      const previousValue = draftsMap[itemId]?.draftValue ?? getPublished(itemId);
      const draftPath = `cms_drafts/${itemId}`;
      try {
        await setDoc(doc(db, 'cms_drafts', itemId), {
          itemId: item.id,
          pageId: item.pageId,
          sectionId: item.sectionId,
          contentType: item.contentType,
          draftValue: value,
          updatedBy: admin.uid,
          updatedByEmail: admin.email,
          updatedAt: serverTimestamp(),
        });

        setDraftsMap(prev => ({
          ...prev,
          [itemId]: {
            itemId: item.id,
            pageId: item.pageId,
            sectionId: item.sectionId,
            contentType: item.contentType,
            draftValue: value,
            updatedBy: admin.uid,
            updatedByEmail: admin.email,
            updatedAtMs: Date.now(),
          },
        }));

        await recordHistory(itemId, 'draft', previousValue, value);
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, draftPath);
      }
    },
    [requireVerifiedAdmin, draftsMap, getPublished, recordHistory]
  );

  const discardDraft = useCallback(
    async (itemId: string) => {
      requireVerifiedAdmin();
      const draftPath = `cms_drafts/${itemId}`;
      try {
        await deleteDoc(doc(db, 'cms_drafts', itemId));
        setDraftsMap(prev => {
          const next = { ...prev };
          delete next[itemId];
          return next;
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, draftPath);
      }
    },
    [requireVerifiedAdmin]
  );

  const publishItem = useCallback(
    async (itemId: string, overrideValue?: string) => {
      const admin = requireVerifiedAdmin();
      const item = CMS_REGISTRY_MAP[itemId];
      if (!item) throw new Error(`Unknown content item: ${itemId}`);

      const candidate =
        overrideValue !== undefined
          ? overrideValue
          : draftsMap[itemId]?.draftValue ?? getPublished(itemId);
      const value = item.contentType === 'text' ? candidate : candidate.trim();

      const validationError = validateCmsValue(item.contentType, value);
      if (validationError) {
        throw new Error(validationError);
      }

      const previousPublished = getPublished(itemId);
      const pubPath = `cms_published/${itemId}`;

      try {
        await setDoc(doc(db, 'cms_published', itemId), {
          itemId: item.id,
          pageId: item.pageId,
          sectionId: item.sectionId,
          contentType: item.contentType,
          value,
          isPublic: true,
          updatedBy: admin.uid,
          updatedByEmail: admin.email,
          updatedAt: serverTimestamp(),
        });

        if (draftsMap[itemId]) {
          await deleteDoc(doc(db, 'cms_drafts', itemId));
          setDraftsMap(prev => {
            const next = { ...prev };
            delete next[itemId];
            return next;
          });
        }

        await recordHistory(itemId, 'publish', previousPublished, value);
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, pubPath);
      }
    },
    [requireVerifiedAdmin, draftsMap, getPublished, recordHistory]
  );

  const publishAllDrafts = useCallback(
    async (pageId?: CmsPageId): Promise<number> => {
      requireVerifiedAdmin();
      const targetDrafts = Object.values(draftsMap).filter(d => !pageId || d.pageId === pageId);
      let count = 0;
      for (const draft of targetDrafts) {
        await publishItem(draft.itemId, draft.draftValue);
        count += 1;
      }
      return count;
    },
    [requireVerifiedAdmin, draftsMap, publishItem]
  );

  const restoreValue = useCallback(
    async (itemId: string, rawValue: string, mode: 'draft' | 'publish') => {
      const admin = requireVerifiedAdmin();
      const item = CMS_REGISTRY_MAP[itemId];
      if (!item) throw new Error(`Unknown content item: ${itemId}`);

      const value = item.contentType === 'text' ? rawValue : rawValue.trim();
      const validationError = validateCmsValue(item.contentType, value);
      if (validationError) {
        throw new Error(validationError);
      }

      const previousValue = mode === 'publish' ? getPublished(itemId) : draftsMap[itemId]?.draftValue ?? getPublished(itemId);

      if (mode === 'draft') {
        await setDoc(doc(db, 'cms_drafts', itemId), {
          itemId: item.id,
          pageId: item.pageId,
          sectionId: item.sectionId,
          contentType: item.contentType,
          draftValue: value,
          updatedBy: admin.uid,
          updatedByEmail: admin.email,
          updatedAt: serverTimestamp(),
        });
        setDraftsMap(prev => ({
          ...prev,
          [itemId]: {
            itemId: item.id,
            pageId: item.pageId,
            sectionId: item.sectionId,
            contentType: item.contentType,
            draftValue: value,
            updatedBy: admin.uid,
            updatedByEmail: admin.email,
            updatedAtMs: Date.now(),
          },
        }));
      } else {
        await setDoc(doc(db, 'cms_published', itemId), {
          itemId: item.id,
          pageId: item.pageId,
          sectionId: item.sectionId,
          contentType: item.contentType,
          value,
          isPublic: true,
          updatedBy: admin.uid,
          updatedByEmail: admin.email,
          updatedAt: serverTimestamp(),
        });
        if (draftsMap[itemId]) {
          await deleteDoc(doc(db, 'cms_drafts', itemId));
          setDraftsMap(prev => {
            const next = { ...prev };
            delete next[itemId];
            return next;
          });
        }
      }

      await recordHistory(itemId, 'restore', previousValue, value);
    },
    [requireVerifiedAdmin, draftsMap, getPublished, recordHistory]
  );

  const resetItemToDefault = useCallback(
    async (itemId: string) => {
      requireVerifiedAdmin();
      try {
        await deleteDoc(doc(db, 'cms_published', itemId));
        if (draftsMap[itemId]) {
          await deleteDoc(doc(db, 'cms_drafts', itemId));
          setDraftsMap(prev => {
            const next = { ...prev };
            delete next[itemId];
            return next;
          });
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `cms_published/${itemId}`);
      }
    },
    [requireVerifiedAdmin, draftsMap]
  );

  const clearCmsError = useCallback(() => setCmsError(null), []);

  const value = useMemo<CmsContextValue>(
    () => ({
      publishedMap,
      publishedMeta,
      legacyMap,
      draftsMap,
      history,
      cmsLoading,
      adminDataLoading,
      cmsError,
      editMode,
      setEditMode,
      adminDashboardOpen,
      setAdminDashboardOpen,
      activeInlineItemId,
      openInlineEdit,
      closeInlineEdit,
      pendingInlineMedia,
      openInlineMediaFile,
      clearInlineMediaFile,
      getPublished,
      getDraftValue,
      getEffectiveValue,
      pendingDraftCount,
      clearCmsError,
      refreshAdminData,
      saveDraft,
      discardDraft,
      publishItem,
      publishAllDrafts,
      restoreValue,
      resetItemToDefault,
    }),
    [
      publishedMap,
      publishedMeta,
      legacyMap,
      draftsMap,
      history,
      cmsLoading,
      adminDataLoading,
      cmsError,
      editMode,
      setEditMode,
      adminDashboardOpen,
      setAdminDashboardOpen,
      activeInlineItemId,
      openInlineEdit,
      closeInlineEdit,
      pendingInlineMedia,
      openInlineMediaFile,
      clearInlineMediaFile,
      getPublished,
      getDraftValue,
      getEffectiveValue,
      pendingDraftCount,
      clearCmsError,
      refreshAdminData,
      saveDraft,
      discardDraft,
      publishItem,
      publishAllDrafts,
      restoreValue,
      resetItemToDefault,
    ]
  );

  return <CmsContext.Provider value={value}>{children}</CmsContext.Provider>;
};

export function useCms(): CmsContextValue {
  const ctx = useContext(CmsContext);
  if (!ctx) {
    throw new Error('useCms must be used within a CmsProvider');
  }
  return ctx;
}
