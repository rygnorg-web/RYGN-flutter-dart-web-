import React from 'react';
import { ArrowRight, Mail, MapPin, Pencil, Phone } from 'lucide-react';
import { useCms } from '../contexts/CmsContext';
import { useFirebase } from '../contexts/FirebaseContext';
import { useToast } from '../contexts/ToastContext';
import { EditableMedia, EditableText } from './InlineEditable';

export type FooterViewTarget =
  | 'home'
  | 'donate'
  | 'youth_education'
  | 'humanitarian_relief'
  | 'mission'
  | 'leadership';

interface OrganizationFooterProps {
  onNavigate?: (view: FooterViewTarget) => void;
}

function normalizeSafeSocialUrl(raw: string): string | null {
  const trimmed = (raw || '').trim();
  if (!trimmed || trimmed.toLowerCase() === 'not_configured') {
    return null;
  }
  const candidate = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : /^[a-z0-9.-]+\.[a-z]{2,}(\/.*)?$/i.test(trimmed)
      ? `https://${trimmed}`
      : null;

  if (!candidate) return null;
  try {
    const parsed = new URL(candidate);
    if (parsed.protocol === 'https:' || parsed.protocol === 'http:') {
      return parsed.toString();
    }
    return null;
  } catch {
    return null;
  }
}

export const OrganizationFooter: React.FC<OrganizationFooterProps> = ({ onNavigate }) => {
  const currentYear = new Date().getFullYear();
  const { user, authReady, isAdmin } = useFirebase();
  const { editMode, getEffectiveValue, getDraftValue, openInlineEdit } = useCms();
  const { showToast } = useToast();

  const canEdit = Boolean(authReady && isAdmin && user?.emailVerified && editMode);

  const handleNav = (view: FooterViewTarget) => {
    onNavigate?.(view);
  };

  const socialItems = [
    {
      id: 'facebook',
      itemId: 'footer_social_facebook_url',
      label: 'Facebook',
      icon: (
        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden="true">
          <path d="M13.5 22v-8h2.7l.4-3h-3.1V9.1c0-.9.3-1.5 1.6-1.5H16.7V5c-.3 0-1.3-.1-2.4-.1-2.4 0-4 1.4-4 4.1V11H7.6v3h2.7v8h3.2Z" />
        </svg>
      ),
    },
    {
      id: 'x',
      itemId: 'footer_social_x_url',
      label: 'X',
      icon: (
        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden="true">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z" />
        </svg>
      ),
    },
    {
      id: 'youtube',
      itemId: 'footer_social_youtube_url',
      label: 'YouTube',
      icon: (
        <svg viewBox="0 0 24 24" className="w-4.5 h-4.5 fill-current" aria-hidden="true">
          <path d="M21.58 7.19a2.75 2.75 0 0 0-1.94-1.95C17.93 4.75 12 4.75 12 4.75s-5.93 0-7.64.49A2.75 2.75 0 0 0 2.42 7.2 28.8 28.8 0 0 0 2 12a28.8 28.8 0 0 0 .42 4.81 2.75 2.75 0 0 0 1.94 1.95c1.71.49 7.64.49 7.64.49s5.93 0 7.64-.49a2.75 2.75 0 0 0 1.94-1.95A28.8 28.8 0 0 0 22 12a28.8 28.8 0 0 0-.42-4.81ZM10 15.14V8.86L15.45 12 10 15.14Z" />
        </svg>
      ),
    },
  ] as const;

  return (
    <footer
      aria-label="RYGN Organization Footer"
      className="@container relative overflow-hidden w-full bg-[#03163D] text-slate-100 border-t-4 border-[#FFD600] mt-auto text-left font-sans"
    >
      {/* Exact Provided Humanitarian Footer Background */}
      <div className="pointer-events-none select-none absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
        {/* Matching Deep Navy & Royal Blue Base Gradient */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, #05255E 0%, #06317D 38%, #042054 70%, #03163D 100%)',
          }}
        />

        {/* Desktop / Tablet: Full-Bleed Cover of Provided Artwork */}
        <img
          src="/assets/aistudio/file_0000000029c88211b524898c196aea0f_a34e2b7a.png"
          alt=""
          className="hidden @[520px]:block absolute inset-0 w-full h-full object-cover object-center"
        />

        {/* Mobile (<520px): Full-Width Uncropped Artwork Showing Flag Bearers, World Map, Rohingya Camp & Waves */}
        <img
          src="/assets/aistudio/file_0000000029c88211b524898c196aea0f_a34e2b7a.png"
          alt=""
          className="@[520px]:hidden absolute inset-x-0 bottom-0 w-full h-auto object-contain"
          style={{
            WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 18%, black 100%)',
            maskImage: 'linear-gradient(to bottom, transparent 0%, black 18%, black 100%)',
          }}
        />

        {/* Subtle Dark-Navy Readability Scrim for Crisp Text Contrast */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(4, 24, 66, 0.28) 0%, rgba(4, 24, 66, 0.34) 55%, rgba(3, 18, 48, 0.42) 100%)',
          }}
        />
      </div>

      {/* Main Footer Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-5 pt-8 pb-7 @[520px]:px-7 @[520px]:pt-10 @[520px]:pb-8 space-y-8">
        {/* Top Section: Brand Identity + Primary Action */}
        <div className="flex flex-col @[560px]:flex-row @[560px]:items-start @[560px]:justify-between gap-6 pb-7 border-b border-sky-300/15">
          <div className="space-y-3 max-w-md">
            <div className="flex items-center gap-3">
              <div className="h-11 px-1.5 rounded-xl bg-[#EAEAEA] overflow-hidden flex items-center justify-center shrink-0 shadow-sm">
                <EditableMedia
                  itemId="global_app_logo"
                  alt="Rohingya Young Generation Network Logo"
                  wrapperClassName="h-full flex items-center justify-center"
                  imgClassName="h-9 w-auto object-contain"
                  directTapEdits={false}
                />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#FFD600]">
                  RYGN · Global Network
                </p>
                <h3 className="text-sm @[520px]:text-base font-black text-white leading-tight">
                  Rohingya Young Generation Network
                </h3>
              </div>
            </div>

            <p className="text-xs text-slate-200 leading-relaxed">
              A youth-led community organization dedicated to education, human rights advocacy, youth leadership, and compassionate humanitarian support.
            </p>
          </div>

          <div className="flex flex-col items-start @[560px]:items-end gap-3 shrink-0">
            <p className="text-xs @[520px]:text-sm font-black text-white tracking-tight">
              Follow Rohingya Young Generation Network
            </p>

            <div className="flex items-center gap-3 flex-wrap">
              {socialItems.map(social => {
                const rawUrl = getEffectiveValue(social.itemId, canEdit);
                const resolvedUrl = normalizeSafeSocialUrl(rawUrl);
                const hasDraft = canEdit && getDraftValue(social.itemId) !== undefined;

                if (canEdit) {
                  return (
                    <button
                      key={social.id}
                      type="button"
                      onClick={() => openInlineEdit(social.itemId)}
                      title={`Paste ${social.label} URL (${resolvedUrl ? 'Configured' : 'Not set'})`}
                      aria-label={`Edit ${social.label} URL`}
                      className={`relative w-10 h-10 rounded-full bg-[#FFD600] hover:bg-amber-400 text-slate-950 shadow-md flex items-center justify-center transition duration-200 hover:scale-110 cursor-pointer ring-2 ${
                        hasDraft
                          ? 'ring-amber-300'
                          : resolvedUrl
                            ? 'ring-emerald-400'
                            : 'ring-white/60'
                      }`}
                    >
                      {social.icon}
                      <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-[#0D5B36] text-white border border-white flex items-center justify-center shadow">
                        <Pencil className="w-2.5 h-2.5" />
                      </span>
                    </button>
                  );
                }

                if (resolvedUrl) {
                  return (
                    <a
                      key={social.id}
                      href={resolvedUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Follow RYGN on ${social.label}`}
                      className="w-10 h-10 rounded-full bg-[#FFD600] hover:bg-amber-400 text-slate-950 shadow-md flex items-center justify-center transition duration-200 hover:scale-110"
                    >
                      {social.icon}
                    </a>
                  );
                }

                return (
                  <button
                    key={social.id}
                    type="button"
                    onClick={() =>
                      showToast({
                        type: 'info',
                        title: `Official ${social.label} link is not configured yet.`,
                      })
                    }
                    aria-label={`${social.label} (link not configured yet)`}
                    className="w-10 h-10 rounded-full bg-[#FFD600]/85 hover:bg-[#FFD600] text-slate-950 shadow-md flex items-center justify-center transition duration-200 hover:scale-105 cursor-pointer"
                  >
                    {social.icon}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Navigation Grid (4 Required Sections) */}
        <div className="grid grid-cols-2 @[560px]:grid-cols-4 gap-6 pb-7 border-b border-sky-300/15">
          {/* About Us */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-black uppercase tracking-[0.14em] text-[#FFD600]">
              About Us
            </h4>
            <ul className="space-y-2 text-xs font-semibold text-slate-200">
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('home')}
                  className="group inline-flex items-center gap-1 hover:text-white transition text-left cursor-pointer"
                >
                  <ArrowRight className="w-3 h-3 text-[#FFD600] opacity-70 group-hover:translate-x-0.5 group-hover:opacity-100 transition shrink-0" />
                  <span>About Us</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('mission')}
                  className="group inline-flex items-center gap-1 hover:text-white transition text-left cursor-pointer"
                >
                  <ArrowRight className="w-3 h-3 text-[#FFD600] opacity-70 group-hover:translate-x-0.5 group-hover:opacity-100 transition shrink-0" />
                  <span>Mission &amp; Vision</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('leadership')}
                  className="group inline-flex items-center gap-1 hover:text-white transition text-left cursor-pointer"
                >
                  <ArrowRight className="w-3 h-3 text-[#FFD600] opacity-70 group-hover:translate-x-0.5 group-hover:opacity-100 transition shrink-0" />
                  <span>Leadership</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Our Work */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-black uppercase tracking-[0.14em] text-[#FFD600]">
              Our Work
            </h4>
            <ul className="space-y-2 text-xs font-semibold text-slate-200">
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('youth_education')}
                  className="group inline-flex items-center gap-1 hover:text-white transition text-left cursor-pointer"
                >
                  <ArrowRight className="w-3 h-3 text-[#FFD600] opacity-70 group-hover:translate-x-0.5 group-hover:opacity-100 transition shrink-0" />
                  <span>Youth Education</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('humanitarian_relief')}
                  className="group inline-flex items-center gap-1 hover:text-white transition text-left cursor-pointer"
                >
                  <ArrowRight className="w-3 h-3 text-[#FFD600] opacity-70 group-hover:translate-x-0.5 group-hover:opacity-100 transition shrink-0" />
                  <span>Humanitarian Relief</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('home')}
                  className="group inline-flex items-center gap-1 hover:text-white transition text-left cursor-pointer"
                >
                  <ArrowRight className="w-3 h-3 text-[#FFD600] opacity-70 group-hover:translate-x-0.5 group-hover:opacity-100 transition shrink-0" />
                  <span>Our Work</span>
                </button>
              </li>
            </ul>
          </div>

          {/* News */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-black uppercase tracking-[0.14em] text-[#FFD600]">
              News
            </h4>
            <ul className="space-y-2 text-xs font-semibold text-slate-200">
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('home')}
                  className="group inline-flex items-center gap-1 hover:text-white transition text-left cursor-pointer"
                >
                  <ArrowRight className="w-3 h-3 text-[#FFD600] opacity-70 group-hover:translate-x-0.5 group-hover:opacity-100 transition shrink-0" />
                  <span>News &amp; Updates</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('home')}
                  className="group inline-flex items-center gap-1 hover:text-white transition text-left cursor-pointer"
                >
                  <ArrowRight className="w-3 h-3 text-[#FFD600] opacity-70 group-hover:translate-x-0.5 group-hover:opacity-100 transition shrink-0" />
                  <span>Policies &amp; Reports</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Work With Us */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-black uppercase tracking-[0.14em] text-[#FFD600]">
              Work With Us
            </h4>
            <ul className="space-y-2 text-xs font-semibold text-slate-200">
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('home')}
                  className="group inline-flex items-center gap-1 hover:text-white transition text-left cursor-pointer"
                >
                  <ArrowRight className="w-3 h-3 text-[#FFD600] opacity-70 group-hover:translate-x-0.5 group-hover:opacity-100 transition shrink-0" />
                  <span>Work With Us</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('donate')}
                  className="group inline-flex items-center gap-1 hover:text-white transition text-left cursor-pointer"
                >
                  <ArrowRight className="w-3 h-3 text-[#FFD600] opacity-70 group-hover:translate-x-0.5 group-hover:opacity-100 transition shrink-0" />
                  <span>Donate Now</span>
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Contact Information Section (Uses existing editable CMS fields only) */}
        <div className="grid grid-cols-1 @[520px]:grid-cols-3 gap-4 text-xs text-slate-100">
          <div className="rounded-xl bg-[#041A47]/45 backdrop-blur-xs border border-sky-300/20 p-3.5 space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-white">
              <MapPin className="w-3.5 h-3.5 text-[#FFD600] shrink-0" />
              <span>Office Address</span>
            </div>
            <EditableText
              itemId="nav_contact_address"
              as="div"
              className="whitespace-pre-line leading-relaxed text-slate-100 font-medium text-[11px]"
              darkSurface
            />
          </div>

          <div className="rounded-xl bg-[#041A47]/45 backdrop-blur-xs border border-sky-300/20 p-3.5 space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-white">
              <Phone className="w-3.5 h-3.5 text-[#FFD600] shrink-0" />
              <span>Telephone</span>
            </div>
            <EditableText
              itemId="nav_contact_phone"
              as="div"
              className="font-medium text-slate-100 text-[11px]"
              darkSurface
            />
          </div>

          <div className="rounded-xl bg-[#041A47]/45 backdrop-blur-xs border border-sky-300/20 p-3.5 space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-white">
              <Mail className="w-3.5 h-3.5 text-[#FFD600] shrink-0" />
              <span>Official Contact</span>
            </div>
            <EditableText
              itemId="nav_contact_email"
              as="div"
              className="font-bold text-white underline break-all text-[11px]"
              darkSurface
            />
          </div>
        </div>
      </div>

      {/* Bottom Copyright Strip */}
      <div className="relative z-10 bg-[#03163D]/55 backdrop-blur-xs border-t border-sky-300/20">
        <div className="max-w-6xl mx-auto px-5 py-4 @[520px]:px-7 flex flex-col @[560px]:flex-row items-center justify-between gap-3 text-[11px] text-slate-200">
          <p className="text-center @[560px]:text-left font-medium">
            © {currentYear} Rohingya Young Generation Network (RYGN). All rights reserved.
          </p>

          <div className="flex items-center gap-4 flex-wrap justify-center font-semibold">
            <button
              type="button"
              onClick={() => handleNav('home')}
              className="hover:text-[#FFD600] transition cursor-pointer"
            >
              <EditableText itemId="nav_link_transparency" directTapEdits={false} darkSurface />
            </button>
            <span className="text-sky-400/40" aria-hidden="true">•</span>
            <button
              type="button"
              onClick={() => handleNav('home')}
              className="hover:text-[#FFD600] transition cursor-pointer"
            >
              <EditableText itemId="nav_link_imprint" directTapEdits={false} darkSurface />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
