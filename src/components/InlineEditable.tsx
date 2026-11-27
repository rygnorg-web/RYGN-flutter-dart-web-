import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  Camera,
  CheckCircle2,
  Loader2,
  Pencil,
  RotateCcw,
  Save,
  Send,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import {
  CMS_PAGES,
  CMS_REGISTRY_MAP,
  CMS_TEXT_MAX_LENGTH,
  validateCmsValue,
} from '../cms/contentRegistry';
import { useCms } from '../contexts/CmsContext';
import { useFirebase } from '../contexts/FirebaseContext';
import { useToast } from '../contexts/ToastContext';
import { uploadImageToCloudinary } from '../services/cloudinary';

interface EditableTextProps {
  itemId: string;
  children?: React.ReactNode;
  className?: string;
  as?: 'span' | 'div' | 'p' | 'h1' | 'h2';
  directTapEdits?: boolean;
  badgeInset?: boolean;
  darkSurface?: boolean;
}

export const EditableText: React.FC<EditableTextProps> = ({
  itemId,
  children,
  className = '',
  as = 'span',
  directTapEdits = true,
  badgeInset = false,
  darkSurface = false,
}) => {
  const { user, authReady, isAdmin } = useFirebase();
  const { editMode, getEffectiveValue, getDraftValue, openInlineEdit } = useCms();

  const canEdit = Boolean(authReady && isAdmin && user?.emailVerified && editMode);
  const value = getEffectiveValue(itemId, canEdit);
  const hasDraft = canEdit && getDraftValue(itemId) !== undefined;
  const reg = CMS_REGISTRY_MAP[itemId];
  const Tag = as;
  const isBlockTag = as === 'div' || as === 'p' || as === 'h1' || as === 'h2';

  if (!canEdit) {
    return <Tag className={className}>{children ?? value}</Tag>;
  }

  const handleOpen = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    e.preventDefault();
    openInlineEdit(itemId);
  };

  return (
    <Tag
      onClick={directTapEdits ? handleOpen : undefined}
      className={`${className} relative ${isBlockTag ? 'block' : 'inline-block'} border border-dashed ${
        hasDraft
          ? 'border-amber-400 bg-amber-400/10'
          : darkSurface
            ? 'border-emerald-400/80 hover:bg-emerald-500/10'
            : 'border-[#0D5B36]/80 hover:bg-emerald-50/40'
      } rounded-md ${isBlockTag ? 'p-1.5 pr-7' : 'px-1.5 py-0.5 pr-6'} transition ${
        directTapEdits ? 'cursor-pointer' : ''
      }`}
    >
      {children ?? value}
      <span
        role="button"
        tabIndex={0}
        onClick={handleOpen}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') handleOpen(e);
        }}
        title={`Edit ${reg?.label || itemId}`}
        aria-label={`Edit ${reg?.label || itemId}`}
        className={`absolute ${
          badgeInset ? 'top-1 right-1' : '-top-2.5 -right-2'
        } z-20 w-5 h-5 rounded-full ${
          hasDraft ? 'bg-amber-500 text-slate-950' : 'bg-[#0D5B36] hover:bg-[#094227] text-white'
        } border border-white shadow-md flex items-center justify-center cursor-pointer transition hover:scale-110`}
      >
        <Pencil className="w-2.5 h-2.5" />
      </span>
    </Tag>
  );
};

interface EditableMediaProps {
  itemId: string;
  alt: string;
  imgClassName?: string;
  wrapperClassName?: string;
  directTapEdits?: boolean;
  compactBadge?: boolean;
  fallbackNode?: React.ReactNode;
}

export const EditableMedia: React.FC<EditableMediaProps> = ({
  itemId,
  alt,
  imgClassName = '',
  wrapperClassName = '',
  directTapEdits = true,
  compactBadge = false,
  fallbackNode,
}) => {
  const { user, authReady, isAdmin } = useFirebase();
  const { editMode, getEffectiveValue, getDraftValue, openInlineMediaFile, openInlineEdit } = useCms();

  const canEdit = Boolean(authReady && isAdmin && user?.emailVerified && editMode);
  const src = getEffectiveValue(itemId, canEdit);
  const hasDraft = canEdit && getDraftValue(itemId) !== undefined;
  const reg = CMS_REGISTRY_MAP[itemId];
  const [imgFailed, setImgFailed] = useState(false);

  useEffect(() => {
    setImgFailed(false);
  }, [src]);

  const renderedMedia =
    imgFailed && fallbackNode ? (
      <>{fallbackNode}</>
    ) : (
      <img
        src={src}
        alt={alt}
        referrerPolicy="no-referrer"
        onError={() => setImgFailed(true)}
        className={imgClassName}
      />
    );

  if (!canEdit) {
    return wrapperClassName ? <div className={wrapperClassName}>{renderedMedia}</div> : <>{renderedMedia}</>;
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (file) {
      openInlineMediaFile(itemId, file);
    }
  };

  return (
    <div
      className={`relative ${wrapperClassName} border-2 border-dashed ${
        hasDraft ? 'border-amber-400' : 'border-[#0D5B36]/85'
      } rounded-xl`}
    >
      {renderedMedia}

      {/* Direct tap overlay to open gallery when directTapEdits is enabled */}
      {directTapEdits && (
        <label
          onClick={e => e.stopPropagation()}
          title={`Tap to replace ${reg?.label || itemId} from gallery`}
          aria-label={`Select ${reg?.label || itemId} from device gallery`}
          className="absolute inset-0 z-10 cursor-pointer flex items-end justify-start p-2 bg-slate-950/0 hover:bg-slate-950/25 transition group"
        >
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="sr-only"
          />
          {!compactBadge && (
            <span className="opacity-0 group-hover:opacity-100 px-2.5 py-1 rounded-lg bg-[#0D5B36]/95 text-white text-[11px] font-bold shadow flex items-center gap-1.5 transition">
              <Upload className="w-3.5 h-3.5" />
              <span>Tap to update photo</span>
            </span>
          )}
        </label>
      )}

      {/* Always-visible circular camera badge in Edit Mode */}
      <label
        onClick={e => e.stopPropagation()}
        title={`Change ${reg?.label || itemId} from gallery or camera`}
        aria-label={`Change ${reg?.label || itemId} from gallery or camera`}
        className={`absolute ${
          compactBadge ? '-top-2 -right-2 w-6 h-6' : 'top-2 right-2 w-8 h-8'
        } z-20 rounded-full ${
          hasDraft ? 'bg-amber-500 text-slate-950' : 'bg-[#0D5B36] hover:bg-[#094227] text-white'
        } border-2 border-white shadow-lg flex items-center justify-center cursor-pointer transition hover:scale-110`}
      >
        <Camera className={compactBadge ? 'w-3 h-3' : 'w-4 h-4'} />
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="sr-only"
        />
      </label>

      {!compactBadge && (
        <button
          type="button"
          onClick={e => {
            e.stopPropagation();
            openInlineEdit(itemId);
          }}
          title="Open URL or preview options"
          className="absolute bottom-2 right-2 z-20 px-2 py-1 rounded-md bg-slate-950/80 hover:bg-slate-950 text-white text-[10px] font-bold shadow"
        >
          URL / Draft
        </button>
      )}
    </div>
  );
};

export const InlineEditModalHost: React.FC = () => {
  const { user, authReady, isAdmin } = useFirebase();
  const { showToast } = useToast();
  const {
    activeInlineItemId,
    closeInlineEdit,
    pendingInlineMedia,
    clearInlineMediaFile,
    getPublished,
    getDraftValue,
    saveDraft,
    discardDraft,
    publishItem,
    resetItemToDefault,
  } = useCms();

  const [textValue, setTextValue] = useState('');
  const [mediaPreviewUrl, setMediaPreviewUrl] = useState('');
  const [mediaProgress, setMediaProgress] = useState<{ percent: number; stage: string } | null>(null);
  const [lastFile, setLastFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const isVerifiedAdmin = Boolean(authReady && isAdmin && user?.emailVerified);
  const activeItem = activeInlineItemId ? CMS_REGISTRY_MAP[activeInlineItemId] : undefined;

  // Initialize editor state when opening an item
  useEffect(() => {
    if (!isVerifiedAdmin || !activeItem) return;
    setErrorMsg(null);
    setSuccessMsg(null);
    setMediaProgress(null);
    setLastFile(null);

    const existingValue = getDraftValue(activeItem.id) ?? getPublished(activeItem.id);
    if (activeItem.contentType === 'text') {
      setTextValue(existingValue);
    } else {
      setMediaPreviewUrl(existingValue);
    }
  }, [isVerifiedAdmin, activeItem?.id]);

  // Upload newly selected gallery / camera image directly to Cloudinary and save secure_url to Firestore
  useEffect(() => {
    if (!isVerifiedAdmin || !activeItem || !pendingInlineMedia) return;
    if (pendingInlineMedia.itemId !== activeItem.id) return;

    const file = pendingInlineMedia.file;
    setLastFile(file);
    const abortController = new AbortController();
    let cancelled = false;

    const uploadAndSave = async () => {
      setBusy(true);
      setErrorMsg(null);
      setSuccessMsg(null);
      setMediaProgress({ percent: 5, stage: 'Preparing upload to Cloudinary...' });
      try {
        const result = await uploadImageToCloudinary(file, {
          signal: abortController.signal,
          onProgress: (percent, stage) => {
            if (!cancelled) {
              setMediaProgress({ percent, stage });
            }
          },
        });
        if (cancelled) return;

        setMediaPreviewUrl(result.secure_url);
        setMediaProgress({ percent: 97, stage: 'Saving image URL to database...' });

        await publishItem(activeItem.id, result.secure_url);
        if (cancelled) return;

        setMediaProgress({ percent: 100, stage: 'Uploaded to Cloudinary & saved to database' });
        setSuccessMsg('Image uploaded & saved to database!');
        clearInlineMediaFile();
        showToast({
          type: 'success',
          title: 'Image Uploaded & Saved',
          message: `${activeItem.label} updated with Cloudinary URL.`,
        });
      } catch (error) {
        if (!cancelled) {
          const msg = error instanceof Error ? error.message : 'Unable to upload image to Cloudinary.';
          setMediaProgress(null);
          setErrorMsg(msg);
          clearInlineMediaFile();
          showToast({
            type: 'error',
            title: 'Image Upload Failed',
            message: msg,
          });
        }
      } finally {
        if (!cancelled) {
          setBusy(false);
        }
      }
    };

    void uploadAndSave();
    return () => {
      cancelled = true;
      abortController.abort();
    };
  }, [isVerifiedAdmin, activeItem?.id, pendingInlineMedia]);

  if (!isVerifiedAdmin || !activeItem) {
    return null;
  }

  const pageName = CMS_PAGES.find(p => p.id === activeItem.pageId)?.name || activeItem.pageId;
  const publishedValue = getPublished(activeItem.id);
  const hasSavedDraft = getDraftValue(activeItem.id) !== undefined;
  const isMedia = activeItem.contentType !== 'text';
  const currentWorkingValue = isMedia ? mediaPreviewUrl : textValue;

  const handleGalleryOrCameraUpload = async (file: File) => {
    setLastFile(file);
    setBusy(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    setMediaProgress({ percent: 5, stage: 'Preparing upload to Cloudinary...' });
    try {
      const result = await uploadImageToCloudinary(file, {
        onProgress: (percent, stage) => setMediaProgress({ percent, stage }),
      });
      setMediaPreviewUrl(result.secure_url);
      setMediaProgress({ percent: 97, stage: 'Saving image URL to database...' });

      await publishItem(activeItem.id, result.secure_url);
      setMediaProgress({ percent: 100, stage: 'Uploaded to Cloudinary & saved to database' });
      setSuccessMsg('Image uploaded & saved to database!');
      showToast({
        type: 'success',
        title: 'Image Uploaded & Saved',
        message: `${activeItem.label} updated with Cloudinary URL.`,
      });
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unable to upload selected image.';
      setMediaProgress(null);
      setErrorMsg(msg);
      showToast({
        type: 'error',
        title: 'Image Upload Failed',
        message: msg,
      });
    } finally {
      setBusy(false);
    }
  };

  const validateCurrent = (): string | null => {
    const err = validateCmsValue(activeItem.contentType, currentWorkingValue);
    if (err) return err;
    if (
      (activeItem.id === 'home_report_pdf_url' || activeItem.id === 'donate_report_url') &&
      !/^https:\/\/[^\s]+$/i.test(currentWorkingValue.trim())
    ) {
      return 'Report PDF URL must start with https://';
    }
    return null;
  };

  const handleSaveDraft = async () => {
    const err = validateCurrent();
    if (err) {
      setErrorMsg(err);
      return;
    }
    setBusy(true);
    setErrorMsg(null);
    try {
      await saveDraft(activeItem.id, currentWorkingValue);
      setSuccessMsg('Saved as draft.');
      window.setTimeout(() => closeInlineEdit(), 450);
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : 'Failed to save draft.');
    } finally {
      setBusy(false);
    }
  };

  const handlePublish = async () => {
    const err = validateCurrent();
    if (err) {
      setErrorMsg(err);
      return;
    }
    setBusy(true);
    setErrorMsg(null);
    try {
      await publishItem(activeItem.id, currentWorkingValue);
      setSuccessMsg('Published live!');
      window.setTimeout(() => closeInlineEdit(), 450);
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : 'Failed to publish changes.');
    } finally {
      setBusy(false);
    }
  };

  const handleDiscardDraft = async () => {
    setBusy(true);
    setErrorMsg(null);
    try {
      await discardDraft(activeItem.id);
      closeInlineEdit();
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : 'Failed to discard draft.');
    } finally {
      setBusy(false);
    }
  };

  const handleResetDefault = async () => {
    setBusy(true);
    setErrorMsg(null);
    try {
      await resetItemToDefault(activeItem.id);
      closeInlineEdit();
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : 'Failed to reset to default.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-5 sm:p-6 text-slate-100 space-y-4 max-h-[92vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-0.5 rounded-full bg-[#0D5B36] text-white text-[10px] font-bold">
                {pageName}
              </span>
              <code className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                {activeItem.id}
              </code>
              {hasSavedDraft && (
                <span className="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[10px] font-bold">
                  Has Saved Draft
                </span>
              )}
            </div>
            <h3 className="font-black text-base text-white">{activeItem.label}</h3>
            <p className="text-xs text-slate-400">{activeItem.description}</p>
          </div>
          <button
            type="button"
            onClick={closeInlineEdit}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            aria-label="Close editor"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-4 overflow-y-auto pr-1 flex-1">
          {isMedia ? (
            <div className="space-y-3">
              <div
                className={`relative rounded-xl overflow-hidden border border-slate-700 ${
                  activeItem.contentType === 'logo'
                    ? 'h-36 bg-[#EAEAEA] flex items-center justify-center p-4'
                    : 'h-56 bg-slate-950'
                }`}
              >
                {mediaPreviewUrl && (
                  <img
                    src={mediaPreviewUrl}
                    alt={`${activeItem.label} preview`}
                    referrerPolicy="no-referrer"
                    className={
                      activeItem.contentType === 'logo'
                        ? 'max-h-full w-auto object-contain'
                        : 'w-full h-full object-cover'
                    }
                  />
                )}
                {busy && mediaProgress && (
                  <div className="absolute inset-0 bg-slate-950/75 flex flex-col items-center justify-center gap-2 p-4 text-center">
                    <Loader2 className="w-7 h-7 animate-spin text-[#FFD600]" />
                    <p className="text-xs font-bold text-white">{mediaProgress.stage}</p>
                  </div>
                )}
              </div>

              {mediaProgress && (
                <div className="space-y-1">
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#FFD600] transition-all duration-200"
                      style={{ width: `${mediaProgress.percent}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>{mediaProgress.stage}</span>
                    <span className="tabular-nums font-bold text-slate-300">{mediaProgress.percent}%</span>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                <label className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white cursor-pointer flex items-center justify-center gap-1.5 transition">
                  <Upload className="w-4 h-4 text-[#FFD600]" />
                  <span>Gallery</span>
                  <input
                    type="file"
                    accept="image/*"
                    disabled={busy}
                    onChange={e => {
                      const file = e.target.files?.[0];
                      e.target.value = '';
                      if (file) void handleGalleryOrCameraUpload(file);
                    }}
                    className="sr-only"
                  />
                </label>

                <label className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white cursor-pointer flex items-center justify-center gap-1.5 transition">
                  <Camera className="w-4 h-4 text-[#FFD600]" />
                  <span>Camera</span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    disabled={busy}
                    onChange={e => {
                      const file = e.target.files?.[0];
                      e.target.value = '';
                      if (file) void handleGalleryOrCameraUpload(file);
                    }}
                    className="sr-only"
                  />
                </label>

                <input
                  type="url"
                  value={mediaPreviewUrl.startsWith('data:') ? '' : mediaPreviewUrl}
                  onChange={e => setMediaPreviewUrl(e.target.value)}
                  placeholder="Or paste https:// image URL..."
                  className="flex-1 min-w-[180px] bg-slate-950 border border-slate-700 focus:border-[#FFD600] rounded-xl px-3 py-2 text-xs text-white outline-none"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 space-y-1 text-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                  Currently Published Live
                </span>
                <p className="text-slate-300 whitespace-pre-wrap break-words max-h-24 overflow-y-auto">
                  {publishedValue}
                </p>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="font-bold text-slate-200">Updated Text (Unlimited / Multilingual)</span>
                  <span>
                    {textValue.length.toLocaleString()} / {CMS_TEXT_MAX_LENGTH.toLocaleString()}
                  </span>
                </div>
                {activeItem.multiline ? (
                  <textarea
                    dir="auto"
                    rows={5}
                    value={textValue}
                    onChange={e => setTextValue(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-[#FFD600] rounded-xl px-3.5 py-2.5 text-sm text-white outline-none resize-y"
                  />
                ) : (
                  <input
                    dir="auto"
                    type="text"
                    value={textValue}
                    onChange={e => setTextValue(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-[#FFD600] rounded-xl px-3.5 py-2.5 text-sm text-white outline-none"
                  />
                )}
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="rounded-xl p-3 bg-rose-950/70 border border-rose-500/40 text-xs text-rose-200 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{errorMsg}</span>
              </div>
              {lastFile && isMedia && (
                <button
                  type="button"
                  onClick={() => void handleGalleryOrCameraUpload(lastFile)}
                  className="px-2.5 py-1 rounded bg-rose-500 text-white font-bold shrink-0"
                >
                  Retry
                </button>
              )}
            </div>
          )}

          {successMsg && (
            <div className="rounded-xl p-3 bg-emerald-950/70 border border-emerald-500/40 text-xs text-emerald-200 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-2 border-t border-slate-800 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={closeInlineEdit}
              className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => void handleSaveDraft()}
              className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-amber-300 flex items-center gap-1.5 transition"
            >
              {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              <span>Save Draft</span>
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => void handlePublish()}
              className="flex-1 py-2.5 px-4 rounded-xl bg-[#FFD600] hover:bg-amber-400 disabled:opacity-50 text-slate-950 text-xs font-extrabold flex items-center justify-center gap-1.5 transition"
            >
              {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              <span>Publish Live</span>
            </button>
          </div>

          <div className="flex items-center justify-between text-[11px] pt-1">
            {hasSavedDraft ? (
              <button
                type="button"
                disabled={busy}
                onClick={() => void handleDiscardDraft()}
                className="text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" />
                <span>Discard Draft</span>
              </button>
            ) : (
              <span />
            )}
            <button
              type="button"
              disabled={busy}
              onClick={() => void handleResetDefault()}
              className="text-slate-400 hover:text-white font-semibold flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset to Default</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
