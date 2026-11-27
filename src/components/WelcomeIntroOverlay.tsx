import React, { useEffect, useRef, useState } from 'react';
import rygnLogo from '../assets/rygn-logo.jpg';
import { useCms } from '../contexts/CmsContext';

const SESSION_INTRO_KEY = 'rygn_welcome_intro_seen_v1';
const SUPPLIED_CAMP_IMAGE = '/assets/aistudio/file_000000002fac821092e2d54d68b91ee6_d4a2890a.png';

// Exactly 7 seconds full-screen intro visibility before seamless reveal begins
const INTRO_HOLD_DURATION_MS = 7000;
const REVEAL_TRANSITION_MS = 1100;
const REDUCED_MOTION_TRANSITION_MS = 500;

function hasSeenIntroInSession(): boolean {
  try {
    return window.sessionStorage.getItem(SESSION_INTRO_KEY) === '1';
  } catch {
    return false;
  }
}

function markIntroSeenInSession(): void {
  try {
    window.sessionStorage.setItem(SESSION_INTRO_KEY, '1');
  } catch {
    // Ignore restricted sessionStorage contexts
  }
}

function prefersReducedMotion(): boolean {
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch {
    return false;
  }
}

type IntroStage = 'atmosphere' | 'camp' | 'brand' | 'reveal';

export const WelcomeIntroOverlay: React.FC = () => {
  const { getEffectiveValue } = useCms();
  const [reducedMotion] = useState<boolean>(() => prefersReducedMotion());
  const [dismissed, setDismissed] = useState<boolean>(() => hasSeenIntroInSession());
  const [stage, setStage] = useState<IntroStage>(() =>
    prefersReducedMotion() ? 'brand' : 'atmosphere'
  );
  const [campImgFailed, setCampImgFailed] = useState(false);
  const timersRef = useRef<number[]>([]);

  const logoSrc = getEffectiveValue('global_app_logo', false) || rygnLogo;

  const clearAllTimers = () => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
  };

  useEffect(() => {
    if (dismissed) return;

    markIntroSeenInSession();

    if (reducedMotion) {
      const revealTimer = window.setTimeout(() => setStage('reveal'), INTRO_HOLD_DURATION_MS);
      const doneTimer = window.setTimeout(
        () => setDismissed(true),
        INTRO_HOLD_DURATION_MS + REDUCED_MOTION_TRANSITION_MS
      );
      timersRef.current = [revealTimer, doneTimer];
      return clearAllTimers;
    }

    const campTimer = window.setTimeout(() => setStage('camp'), 320);
    const brandTimer = window.setTimeout(() => setStage('brand'), 900);
    const revealTimer = window.setTimeout(() => setStage('reveal'), INTRO_HOLD_DURATION_MS);
    const doneTimer = window.setTimeout(
      () => setDismissed(true),
      INTRO_HOLD_DURATION_MS + REVEAL_TRANSITION_MS
    );

    timersRef.current = [campTimer, brandTimer, revealTimer, doneTimer];
    return clearAllTimers;
  }, [dismissed, reducedMotion]);

  if (dismissed) {
    return null;
  }

  const handleSkip = () => {
    clearAllTimers();
    markIntroSeenInSession();
    setStage('reveal');
    const skipDoneTimer = window.setTimeout(
      () => setDismissed(true),
      reducedMotion ? 250 : 750
    );
    timersRef.current = [skipDoneTimer];
  };

  const isCampVisible = stage === 'camp' || stage === 'brand' || stage === 'reveal';
  const isBrandVisible = stage === 'brand';
  const isRevealing = stage === 'reveal';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Welcome to Rohingya Young Generation Network"
      className={`fixed inset-0 z-50 overflow-hidden text-white select-none ${
        isRevealing ? 'pointer-events-none' : ''
      }`}
    >
      {/* Base Dark Sky Backdrop — dissolves cleanly during reveal so homepage emerges beneath */}
      <div
        aria-hidden="true"
        className={`absolute inset-0 bg-[#0A1628] transition-opacity ease-[cubic-bezier(0.22,1,0.36,1)] ${
          reducedMotion ? 'duration-500' : 'duration-[1050ms]'
        } ${isRevealing ? 'opacity-0' : 'opacity-100'}`}
      />

      {/* Stage 1 & 2: Supplied Rohingya Camp Landscape Backdrop with gentle forward dissolve */}
      <div
        aria-hidden="true"
        className={`absolute inset-0 transition-all ease-[cubic-bezier(0.22,1,0.36,1)] ${
          reducedMotion
            ? 'duration-500'
            : 'duration-[1050ms] will-change-[transform,opacity]'
        } ${
          isRevealing
            ? reducedMotion
              ? 'opacity-0'
              : 'opacity-0 scale-[1.04]'
            : 'opacity-100 scale-100'
        }`}
      >
        {!campImgFailed ? (
          <img
            src={SUPPLIED_CAMP_IMAGE}
            alt="Rohingya community hillside landscape under cloudy sunrise sky"
            referrerPolicy="no-referrer"
            decoding="async"
            fetchPriority="high"
            onError={() => setCampImgFailed(true)}
            className={`w-full h-full object-cover object-[58%_center] sm:object-center transition-opacity duration-1000 ease-out ${
              reducedMotion ? 'opacity-100' : 'rygn-camp-kenburns'
            } ${isCampVisible ? 'opacity-100' : 'opacity-25'}`}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-b from-[#1A2E4B] via-[#2C4866] to-[#0E1E36]" />
        )}
      </div>

      {/* Stage 1 & Reveal: Softly Drifting Layered Cloud Mist & Parting Horizon Dissolve */}
      {!reducedMotion && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          <div
            className={`rygn-cloud-layer-1 absolute -top-16 -left-1/4 w-[150%] h-[55%] rounded-full blur-3xl transition-all duration-[1000ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
              isRevealing ? '-translate-x-12 opacity-0' : 'translate-x-0'
            }`}
            style={{
              background:
                'radial-gradient(ellipse at 35% 40%, rgba(226, 232, 240, 0.42) 0%, rgba(148, 163, 184, 0.16) 48%, transparent 76%)',
            }}
          />
          <div
            className={`rygn-cloud-layer-2 absolute top-[12%] -right-1/4 w-[145%] h-[50%] rounded-full blur-3xl transition-all duration-[1000ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
              isRevealing ? 'translate-x-12 opacity-0' : 'translate-x-0'
            }`}
            style={{
              background:
                'radial-gradient(ellipse at 65% 45%, rgba(254, 240, 199, 0.28) 0%, rgba(203, 213, 225, 0.14) 50%, transparent 78%)',
            }}
          />

          {/* Soft curtain-like parting mist veil during reveal transition */}
          <div
            className={`absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-slate-950/30 via-slate-900/10 to-transparent transition-all duration-[1000ms] ease-[cubic-bezier(0.22,1,0.36,1)] will-change-[transform,opacity] ${
              isRevealing ? '-translate-x-full opacity-0' : 'translate-x-0 opacity-80'
            }`}
          />
          <div
            className={`absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l from-slate-950/30 via-slate-900/10 to-transparent transition-all duration-[1000ms] ease-[cubic-bezier(0.22,1,0.36,1)] will-change-[transform,opacity] ${
              isRevealing ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-80'
            }`}
          />
        </div>
      )}

      {/* Measured Contrast Scrim — smoothly clears away to unveil homepage */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 bg-gradient-to-b from-slate-950/65 via-slate-950/45 to-slate-950/80 transition-opacity ease-[cubic-bezier(0.22,1,0.36,1)] ${
          reducedMotion ? 'duration-500' : 'duration-[950ms]'
        } ${isRevealing ? 'opacity-0' : 'opacity-100'}`}
      />

      {/* Quiet Skip / Enter Control */}
      <div
        className={`relative z-20 flex justify-end px-4 pt-4 sm:px-8 sm:pt-6 transition-opacity duration-500 ${
          isRevealing ? 'opacity-0' : 'opacity-100'
        }`}
      >
        <button
          type="button"
          onClick={handleSkip}
          className="min-h-[44px] px-4 py-2 rounded-lg bg-slate-950/45 hover:bg-slate-950/70 border border-white/25 text-xs sm:text-sm font-semibold text-white/95 backdrop-blur-xs transition cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFD600]"
        >
          Enter Website
        </button>
      </div>

      {/* Stage 3 & Reveal: Centered RYGN Identity & Tagline */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 sm:px-10 h-[calc(100%-88px)] max-w-3xl mx-auto">
        <div
          className={`flex flex-col items-center space-y-4 sm:space-y-5 transition-all ease-[cubic-bezier(0.22,1,0.36,1)] ${
            reducedMotion ? 'duration-500' : 'duration-700'
          } ${
            isRevealing
              ? reducedMotion
                ? 'opacity-0'
                : 'opacity-0 -translate-y-4 scale-[0.985]'
              : isBrandVisible
                ? 'opacity-100 translate-y-0 scale-100'
                : reducedMotion
                  ? 'opacity-100 translate-y-0 scale-100'
                  : 'opacity-0 translate-y-4 scale-100'
          }`}
        >
          {/* Official RYGN Emblem */}
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#EAEAEA] p-2 shadow-2xl ring-1 ring-white/40 flex items-center justify-center overflow-hidden">
            <img
              src={logoSrc}
              alt="Rohingya Young Generation Network Logo"
              referrerPolicy="no-referrer"
              className="w-full h-full object-contain"
            />
          </div>

          <p className="text-xs sm:text-sm font-extrabold uppercase tracking-[0.28em] text-[#FFD600] drop-shadow-xs">
            RYGN
          </p>

          <h1 className="text-2xl sm:text-4xl md:text-[42px] font-black text-white leading-[1.14] tracking-tight [text-wrap:balance] drop-shadow-md">
            Rohingya Young Generation Network
          </h1>

          <div className="w-14 h-[2px] bg-[#FFD600]/90" aria-hidden="true" />

          <p className="text-base sm:text-xl font-medium text-slate-100 tracking-wide [text-wrap:balance] drop-shadow-sm">
            Together for a Better Tomorrow.
          </p>
        </div>
      </div>

      {/* Subtle Bottom Hairline Progress Indicator (Completes cleanly at 4.0s, then fades away) */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-x-0 bottom-0 h-[3px] bg-white/15 transition-opacity duration-500 ${
          isRevealing ? 'opacity-0' : 'opacity-100'
        }`}
      >
        <div
          className={`h-full w-full bg-[#FFD600]/90 ${
            reducedMotion ? 'opacity-70' : 'rygn-intro-progress-bar'
          }`}
        />
      </div>
    </div>
  );
};
