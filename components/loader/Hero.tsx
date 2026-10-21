'use client';

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import Image from 'next/image';
import localFont from 'next/font/local';
import {
  motion,
  useReducedMotion,
  type Transition,
  type Variants,
} from 'motion/react';
import { useSiteConfig } from '@/hooks/use-site-config';
import { siteConfig as defaultSiteConfig } from '@/content/site';
import { parseWeddingDate } from '@/lib/wedding-date';
import { InviteParticles } from '@/components/loader/InviteParticles';
import { InvitePhotoBackdrop } from '@/components/loader/invite-photo-backdrop';
import { SunsetSeaBackdrop } from '@/components/loader/SunsetSeaBackdrop';
import { TintedDeco } from '@/components/tinted-deco';
import './envelope-invite.css';

const theSeasons = localFont({
  src: '../../Font/Fontspring-DEMO-theseasons-reg.otf',
  // Letters only: digits + punctuation fall through to Playfair ("Seasons Numerals", app/globals.css)
  declarations: [{ prop: "unicode-range", value: "U+0020, U+0041-005A, U+0061-007A, U+00C0-00D6, U+00D8-00F6, U+00F8-00FF, U+0152-0153" }],
  fallback: ["'Seasons Numerals'", "serif"],
  adjustFontFallback: false,
  display: 'swap',
});

const aboveTheBeyond = localFont({
  src: '../../Font/above-the-beyond-script.otf',
  display: 'swap',
});

interface HeroProps {
  onOpen: () => void;
  onTransitionStart?: () => void;
  visible: boolean;
  enterFromLoading?: boolean;
}

const MS_PER_DAY = 1000 * 60 * 60 * 24;

// Short joining words in the headline ("A Celebration of Love") are set in script — matches the loading screen
const SCRIPT_WORDS = new Set(['the', 'of', 'and', '&', 'a']);

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

const focusLiftEase: Transition = { duration: 1.15, ease: [0.22, 1, 0.36, 1] };
const revealEntryEase: Transition = { duration: 0.9, ease: [0.22, 1, 0.36, 1] };
const buttonEntryEase: Transition = { duration: 0.95, ease: [0.16, 1, 0.3, 1] };

type EnvelopePhase =
  | 'idle'
  | 'seal-press'
  | 'seal-break'
  | 'flap-open'
  | 'rising'
  | 'revealed'
  | 'cta';

function getFocusLiftPhase(phase: EnvelopePhase): 'idle' | 'opening' | 'revealed' | 'cta' {
  if (phase === 'idle') return 'idle';
  if (
    phase === 'seal-press' ||
    phase === 'seal-break' ||
    phase === 'flap-open' ||
    phase === 'rising'
  ) {
    return 'opening';
  }
  if (phase === 'revealed') return 'revealed';
  return 'cta';
}

const letterEmergenceEase: Transition = { duration: 3.05, ease: [0.5, 0.02, 0.14, 1] };
const flapEase: Transition = { duration: 1.1, ease: [0.65, 0, 0.35, 1] };
// The main hero sits on the same sunset sea underneath, so the screen just dissolves
// into it (no curtain) while the hero's own entry plays (components/sections/hero.tsx)
const inviteExitEase: Transition = { duration: 0.4, ease: 'linear', delay: 0.7 };
const inviteEnterEase: Transition = { duration: 1.2, ease: [0.22, 1, 0.36, 1] };
const letterExitEase: Transition = { duration: 0.75, ease: [0.4, 0, 0.2, 1] };
// The main hero is revealed underneath almost at once; the envelope screen unmounts
// as soon as it has faded so its SVG filters stop costing anything
const inviteRevealLeadMs = 120;
const INVITE_EXIT_MS = 1150;

export const Hero: React.FC<HeroProps> = ({
  onOpen,
  onTransitionStart,
  visible,
  enterFromLoading = false,
}) => {
  const siteConfig = useSiteConfig();
  const content = siteConfig.loadingScreen ?? defaultSiteConfig.loadingScreen;
  const isPlain = content.display === 'plain';
  const plainTheme = content.plainTheme ?? defaultSiteConfig.loadingScreen.plainTheme;
  const cornerDecos = content.cornerDecos ?? defaultSiteConfig.loadingScreen.cornerDecos;
  const plainInvite = content.plainInvite ?? defaultSiteConfig.loadingScreen.plainInvite;
  const reduceMotion = useReducedMotion();
  const openedRef = useRef(false);
  const enterBtnRef = useRef<HTMLButtonElement>(null);
  const [mounted, setMounted] = useState(false);
  const [phase, setPhase] = useState<EnvelopePhase>('idle');
  const [liveMessage, setLiveMessage] = useState('');
  const [isExiting, setIsExiting] = useState(false);
  const [isMobileViewport, setIsMobileViewport] = useState(false);

  const groomName = siteConfig.couple.groomNickname;
  const brideName = siteConfig.couple.brideNickname;
  const coupleNames = `${groomName} & ${brideName}`;

  const letterDateNumeric = useMemo(() => {
    const parsed = parseWeddingDate(siteConfig.ceremony.date ?? siteConfig.wedding.date);
    const wedding = new Date(`${parsed.month} ${parsed.day}, ${parsed.year}`);
    // Month as its short name ("Dec"), day and year as numbers
    if (Number.isNaN(wedding.getTime())) {
      const monthDate = new Date(`${parsed.month} 1, ${parsed.year}`);
      const month = Number.isNaN(monthDate.getTime())
        ? String(parsed.month).slice(0, 3)
        : monthDate.toLocaleString('en-US', { month: 'short' });
      const day = String(parsed.day).padStart(2, '0');
      const year = String(parsed.year).slice(-2);
      return `${month} | ${day} | ${year}`;
    }
    const month = wedding.toLocaleString('en-US', { month: 'short' });
    const day = String(wedding.getDate()).padStart(2, '0');
    const year = String(wedding.getFullYear()).slice(-2);
    return `${month} | ${day} | ${year}`;
  }, [siteConfig.ceremony.date, siteConfig.wedding.date]);

  const weddingDateGhost = useMemo(() => {
    const [month, day, year] = letterDateNumeric.split(' | ');
    return { month, day, year };
  }, [letterDateNumeric]);

  const backgroundPhotos = useMemo(
    () => (content.backgroundPhotos ?? []).map((src) => encodeURI(src)),
    [content.backgroundPhotos],
  );
  const showPhotoBackdrop = !isPlain && backgroundPhotos.length > 0;

  const countdownText = useMemo(() => {
    const weddingDate = new Date(siteConfig.wedding.date);
    // Only count days in the browser — the page is prerendered at build time
    if (!mounted || Number.isNaN(weddingDate.getTime())) return '';
    const now = new Date();
    const days = Math.round((startOfDay(weddingDate) - startOfDay(now)) / MS_PER_DAY);
    if (days < 0) return content.countdownPastText;
    if (days === 0) return content.countdownTodayText;
    if (days === 1) return content.countdownOneDayText;
    return content.countdownText.replace('{days}', days.toLocaleString());
  }, [content, mounted, siteConfig.wedding.date]);

  const flapIsOpen =
    phase === 'flap-open' ||
    phase === 'rising' ||
    phase === 'revealed' ||
    phase === 'cta';

  const contentsVisible =
    phase === 'rising' ||
    phase === 'revealed' ||
    phase === 'cta';

  const sealOpened = phase !== 'idle' && phase !== 'seal-press';

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 767px)');
    const updateViewport = () => setIsMobileViewport(mediaQuery.matches);
    updateViewport();
    mediaQuery.addEventListener('change', updateViewport);
    return () => mediaQuery.removeEventListener('change', updateViewport);
  }, []);

  useEffect(() => {
    if (!visible) {
      openedRef.current = false;
      setPhase('idle');
      setLiveMessage('');
      setIsExiting(false);
    }
  }, [visible]);

  useEffect(() => {
    if (!visible || isExiting) return;

    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';

    return () => {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    };
  }, [visible, isExiting]);

  useEffect(() => {
    if (phase === 'cta') {
      enterBtnRef.current?.focus({ preventScroll: true });
    }
  }, [phase]);

  const handleEnterInvitation = useCallback(async () => {
    if (isExiting || phase !== 'cta') return;

    setIsExiting(true);
    setLiveMessage('Opening your invitation.');

    if (reduceMotion) {
      onTransitionStart?.();
      onOpen();
      return;
    }

    await wait(inviteRevealLeadMs);
    onTransitionStart?.();
    await wait(INVITE_EXIT_MS - inviteRevealLeadMs);
    onOpen();
  }, [isExiting, onOpen, onTransitionStart, phase, reduceMotion]);

  const runOpenSequence = useCallback(async () => {
    if (reduceMotion) {
      setPhase('cta');
      setLiveMessage('Invitation opened.');
      return;
    }

    setLiveMessage('Pressing seal.');
    setPhase('seal-press');
    await wait(180);

    setLiveMessage('Releasing seal.');
    setPhase('seal-break');
    await wait(320);

    setLiveMessage('Opening envelope.');
    setPhase('flap-open');
    await wait(1100);

    setLiveMessage('Invitation rising.');
    setPhase('rising');
    await wait(isPlain ? 2400 : 3200);

    setPhase('revealed');
    await wait(650);

    setPhase('cta');
    setLiveMessage('Invitation ready.');
  }, [isPlain, reduceMotion]);

  const handleSealClick = useCallback(
    (e: React.MouseEvent | React.KeyboardEvent) => {
      e.stopPropagation();
      if (openedRef.current || phase !== 'idle') return;
      openedRef.current = true;
      void runOpenSequence();
    },
    [phase, runOpenSequence]
  );

  /* Match reference sample: single flap, rotateX(180deg) positive, origin top center */
  const flapVariants: Variants = {
    closed: { rotateX: 0 },
    open: { rotateX: 180 },
  };

  // The seal never moves: a slight centered press, then it stays where it was pressed
  const sealVariants: Variants = {
    idle: { scale: 1, opacity: 1 },
    press: { scale: 0.96, opacity: 1 },
    held: { scale: 1, opacity: 1 },
  };

  /*
    Letter starts deep in the pocket (positive y) and pulls up through the lip.
    Mobile rises higher during entry; desktop keeps its settled position.
  */
  const letterVariants: Variants = useMemo(
    () => ({
      hidden: { y: '100%', scale: 0.86, opacity: 1, rotate: -0.4 },
      rising: {
        y: isMobileViewport ? '-22%' : '14%',
        scale: 1,
        opacity: 1,
        rotate: 0,
      },
      out: {
        y: isMobileViewport ? '-22%' : '14%',
        scale: 1,
        opacity: 1,
        rotate: 0,
      },
      // Lifts and fades into the navy instead of zooming to fill the screen with paper
      exitPortal: {
        y: isMobileViewport ? '-40%' : '-6%',
        scale: 1.12,
        opacity: 0,
        rotate: 0,
        zIndex: 48,
      },
    }),
    [isMobileViewport],
  );

  const revealCopyContainerVariants: Variants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.16, delayChildren: 0.1 },
    },
    exit: {
      transition: { staggerChildren: 0.05, staggerDirection: -1 },
    },
  };

  const revealCopyItemVariants: Variants = {
    hidden: { opacity: 0, y: 22, filter: 'blur(4px)' },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: revealEntryEase,
    },
    exit: {
      opacity: 0,
      y: 28,
      filter: 'blur(6px)',
      transition: { duration: 0.35, ease: [0.4, 0, 1, 1] },
    },
  };

  const buttonRevealVariants: Variants = {
    hidden: { opacity: 0, y: 28, scale: 0.92, filter: 'blur(6px)' },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      filter: 'blur(0px)',
      transition: buttonEntryEase,
    },
    exit: {
      opacity: 0,
      y: 18,
      scale: 1.06,
      filter: 'blur(8px)',
      transition: { duration: 0.32, ease: [0.4, 0, 1, 1] },
    },
  };

  const focusLiftVariants: Variants = {
    idle: { y: 0, scale: 1, opacity: 1 },
    opening: { y: 0, scale: 1, opacity: 1 },
    revealed: { y: 0, scale: 1, opacity: 1 },
    cta: { y: 0, scale: 1, opacity: 1 },
    exit: {
      y: -18,
      scale: 0.94,
      opacity: 0,
      transition: { duration: 0.55, delay: 0.1, ease: [0.4, 0, 0.2, 1] },
    },
  };

  if (!mounted) return null;

  const letterState =
    phase === 'idle' ||
    phase === 'seal-press' ||
    phase === 'seal-break' ||
    phase === 'flap-open'
      ? 'hidden'
      : phase === 'rising'
        ? 'rising'
        : 'out';

  const sealState = phase === 'idle' ? 'idle' : phase === 'seal-press' ? 'press' : 'held';

  // Envelope fold geometry in % of the envelope box — mirrors the CSS custom properties
  // (--env-flap-h, and the open-state --pocket-v / --pocket-side) for each breakpoint
  const foldGeo: FoldGeo = isMobileViewport
    ? { flap: 58, pocketV: 54, pocketSide: 18, scale: 1 }
    : { flap: 50, pocketV: 86, pocketSide: 78, scale: 0.4 };

  return (
    <motion.div
      className={`env-invite-screen${isPlain ? ' env-invite-screen--plain' : ''}${isPlain && enterFromLoading && visible && !reduceMotion ? ' is-arriving' : ''} ${visible ? '' : 'is-hidden'}`}
      data-phase={isExiting ? 'exiting' : phase}
      aria-hidden={!visible}
      initial={false}
      animate={
        isExiting
          ? { opacity: 0, y: 0, scale: 1 }
          : visible
            ? { opacity: 1, y: 0, scale: 1 }
            : isPlain
              ? // plain: the background matches the loader's, so only fade — the envelope itself arrives (CSS .is-arriving)
                { opacity: 0, y: 0, scale: 1 }
              : { opacity: 0, y: 18, scale: 0.985 }
      }
      transition={
        isExiting
          ? inviteExitEase
          : visible && enterFromLoading && !reduceMotion
            ? inviteEnterEase
            : { duration: reduceMotion ? 0.2 : 0.01 }
      }
      style={{
        pointerEvents: !visible || isExiting ? 'none' : undefined,
        ...(isPlain && {
          '--env-plain-bg': plainTheme.background,
          '--env-plain-ink': plainTheme.text,
          '--env-plain-accent': plainTheme.accent,
        }),
      } as React.CSSProperties}
    >
      {showPhotoBackdrop && (
        <div className="invite-photo-backdrop-wrap invite-photo-backdrop-wrap--envelope" aria-hidden="true">
          <InvitePhotoBackdrop className="invite-photo-backdrop--envelope" photos={backgroundPhotos} />
        </div>
      )}

      {isPlain && (
        <>
          {/* Not while hidden under the loading screen — the loader paints the same sea */}
          {visible && <SunsetSeaBackdrop fixed />}
          <div className="env-invite-plain-corners" aria-hidden="true">
            {(
              [
                { src: cornerDecos.topLeft, pos: 'tl', className: 'left-0 top-0' },
                { src: cornerDecos.topRight, pos: 'tr', className: 'right-0 top-0' },
                { src: cornerDecos.bottomLeft, pos: 'bl', className: 'left-0 bottom-0' },
                { src: cornerDecos.bottomRight, pos: 'br', className: 'right-0 bottom-0' },
              ] as const
            ).filter(({ src }) => src).map(({ src, pos, className }) => (
              <div key={pos} className={`env-invite-plain-corner env-invite-plain-corner--${pos} pointer-events-none absolute ${className}`}>
                <TintedDeco src={src} className="env-invite-plain-corner-img" />
              </div>
            ))}
          </div>
        </>
      )}

      {!isPlain && <div className="env-invite-readability-scrim" aria-hidden="true" />}

      {!reduceMotion && (
        <div className="env-invite-particles pointer-events-none" aria-hidden="true">
          <InviteParticles count={28} />
        </div>
      )}

      <div className="env-invite-bg-glow pointer-events-none" aria-hidden="true" />

      <div className="env-invite-ghost-date pointer-events-none select-none" aria-hidden="true">
        <span className="env-invite-ghost-date-part">{weddingDateGhost.month}</span>
        <span className="env-invite-ghost-date-sep" aria-hidden="true" />
        <span className="env-invite-ghost-date-part">{weddingDateGhost.day}</span>
        <span className="env-invite-ghost-date-sep" aria-hidden="true" />
        <span className="env-invite-ghost-date-part">{weddingDateGhost.year}</span>
      </div>

      <p className="env-invite-live" aria-live="polite">
        {liveMessage}
      </p>

      <div className="env-invite-stage">
        <div className="env-invite-cluster">
          <motion.div
            className="env-invite-focus"
            variants={focusLiftVariants}
            initial="idle"
            animate={isExiting ? 'exit' : getFocusLiftPhase(phase)}
            transition={
              reduceMotion
                ? { duration: 0.01 }
                : isExiting
                  ? { duration: 0.55, delay: 0.1, ease: [0.4, 0, 0.2, 1] }
                  : focusLiftEase
            }
          >
          <motion.div
            className="env-invite-scene"
            initial={false}
            animate={
              isExiting
                ? { opacity: 0, scale: 0.98, y: 0 }
                : { opacity: 1, scale: 1, y: 0 }
            }
            transition={
              isExiting
                ? { duration: 0.5, delay: 0.15, ease: [0.4, 0, 0.2, 1] }
                : { duration: 0.01 }
            }
          >
          <div className="env-invite-ground-shadow" aria-hidden="true" />
          <div className="env-invite-ground-contact" aria-hidden="true" />

          <div className="env-invite-envelope">
            {/* Flap behind body when open — rendered first in paint order */}
            <div className="env-invite-flap-shadow" aria-hidden="true" />
            <motion.div
              className="env-invite-flap"
              variants={flapVariants}
              initial="closed"
              animate={flapIsOpen ? 'open' : 'closed'}
              transition={flapEase}
              style={{ transformOrigin: 'top center' }}
              aria-hidden="true"
            >
              {isPlain && (
                <>
                  {/* Light catching the folded paper edge of the flap */}
                  <svg className="env-invite-flap-edge" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <polyline points="0,0 50,100 100,0" />
                  </svg>
                  {/* Inside of the flap — shows once the flap has swung open */}
                  <span className="env-invite-flap-liner" />
                </>
              )}
            </motion.div>

            <div className="env-invite-envelope-body">
              {/* Back panel */}
              <div className="env-invite-back" aria-hidden="true" />

              {/* Interior shadow — only visible once contents rise */}
              <div className="env-invite-interior" aria-hidden="true" />

              {/* Contents — clipped inside pocket */}
              <div className="env-invite-contents-clip" aria-hidden={!contentsVisible}>
              <div className="env-invite-contents">
                <div className="env-invite-emerge-stack">
                  <motion.div
                    className="env-invite-letter"
                    variants={letterVariants}
                    initial="hidden"
                    animate={isExiting ? 'exitPortal' : letterState}
                    transition={
                      isExiting
                        ? letterExitEase
                        : letterState === 'rising'
                          ? {
                              ...letterEmergenceEase,
                              opacity: { duration: 0 },
                            }
                          : { duration: 0.01 }
                    }
                  >
                    <div className="env-invite-letter-frame" aria-hidden="true" />
                    <div className="env-invite-letter-inner">
                      {isPlain && plainInvite.ornament && (
                        <TintedDeco src={plainInvite.ornament} className="env-invite-letter-ornament" />
                      )}
                      <span className="env-invite-letter-label" aria-label={content.headline}>
                        {content.headline.split(/\s+/).filter(Boolean).map((word, i, words) => {
                          const script = SCRIPT_WORDS.has(word.toLowerCase());
                          // Longer titles break before a mid-title joining word ("A Celebration / of Love")
                          const breakBefore = words.length >= 4 && script && i > 0 && i < words.length - 1;
                          return (
                            <React.Fragment key={i}>
                              {breakBefore && <span className="env-invite-letter-label__break" aria-hidden="true" />}
                              <span
                                aria-hidden="true"
                                className={script ? 'env-invite-letter-label__script' : 'env-invite-letter-label__word'}
                              >
                                {word}
                              </span>
                            </React.Fragment>
                          );
                        })}
                      </span>
                      <span className="env-invite-letter-date">{letterDateNumeric}</span>
                      <span className="env-invite-letter-invited">{content.eyebrow}</span>
                      {content.eyebrowSub && (
                        <span className="env-invite-letter-sub">{content.eyebrowSub}</span>
                      )}
                      <h2 className="env-invite-letter-names env-invite-letter-names--text" aria-label={coupleNames}>
                        <span className={`${theSeasons.className} env-invite-names__nick`} aria-hidden="true">
                          {groomName}
                        </span>
                        <span className={`${aboveTheBeyond.className} env-invite-names__and`} aria-hidden="true">
                          and
                        </span>
                        <span className={`${theSeasons.className} env-invite-names__nick`} aria-hidden="true">
                          {brideName}
                        </span>
                      </h2>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>

            {/* 3. Closed front skin — solid cover, hides when open */}
            <div className="env-invite-front-closed" aria-hidden="true">
              {isPlain ? (
                <EnvelopeClosedFolds geo={foldGeo} />
              ) : (
                <>
                  <div className="env-invite-fold env-invite-fold--tl" />
                  <div className="env-invite-fold env-invite-fold--bl" />
                  <div className="env-invite-fold env-invite-fold--br" />
                  <div className="env-invite-fold env-invite-fold--b" />
                  <svg
                    className="env-invite-creases"
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                  >
                    <line x1="0" y1="0" x2="50" y2="50" />
                    <line x1="100" y1="0" x2="50" y2="50" />
                    <line x1="0" y1="100" x2="50" y2="50" />
                    <line x1="100" y1="100" x2="50" y2="50" />
                  </svg>
                </>
              )}
            </div>

            <div className="env-invite-hinge" aria-hidden="true" />
            </div>

            {/* Front pocket — above body so paper stays tucked inside */}
            <div className="env-invite-pocket" aria-hidden="true">
              <div className="env-invite-pocket-front" />
              <div className="env-invite-pocket-left" />
              <div className="env-invite-pocket-right" />
              {isPlain && <EnvelopePocketFolds geo={foldGeo} />}
            </div>

            {/* Wax seal — centered on the flap tip; once opened it stays put, on top of the open envelope */}
            <div className={`env-invite-seal-wrap${sealOpened ? ' is-opened' : ''}`}>
              <motion.button
                type="button"
                className="env-invite-seal-btn"
                variants={sealVariants}
                initial="idle"
                animate={sealState}
                transition={{ duration: 0.16, ease: 'easeOut' }}
                onClick={handleSealClick}
                disabled={phase !== 'idle'}
                aria-label="Break the wax seal to open the invitation"
              >
                <Image
                  src={content.sealImage ?? defaultSiteConfig.loadingScreen.sealImage}
                  alt=""
                  fill
                  priority
                  sizes="(min-width: 768px) 148px, 132px"
                  className="env-invite-seal-img object-contain"
                />
              </motion.button>
            </div>

          </div>
        </motion.div>

          <p className="env-invite-hint">{content.hintText}</p>

          </motion.div>
        </div>
      </div>

      <div className="env-invite-cta-bar" aria-live="off">
        <motion.div
          className="env-invite-reveal-copy"
          variants={revealCopyContainerVariants}
          initial="hidden"
          animate={
            isExiting
              ? 'exit'
              : phase === 'revealed' || phase === 'cta'
                ? 'visible'
                : 'hidden'
          }
        >
          {countdownText && (
            <motion.p
              className="env-invite-days-to-go"
              variants={revealCopyItemVariants}
            >
              {countdownText}
            </motion.p>
          )}
          <motion.h2 variants={revealCopyItemVariants}>{content.message}</motion.h2>
        </motion.div>

        <motion.button
          ref={enterBtnRef}
          type="button"
          className="env-invite-enter-btn"
          variants={buttonRevealVariants}
          initial="hidden"
          animate={
            isExiting
              ? 'exit'
              : phase === 'cta'
                ? 'visible'
                : 'hidden'
          }
          whileHover={
            phase === 'cta' && !isExiting && !reduceMotion
              ? { y: -2, scale: 1.02 }
              : undefined
          }
          whileTap={
            phase === 'cta' && !isExiting && !reduceMotion
              ? { y: 0, scale: 0.98 }
              : undefined
          }
          onClick={handleEnterInvitation}
          disabled={phase !== 'cta' || isExiting}
        >
          {content.enterButtonText}
        </motion.button>
      </div>
    </motion.div>
  );
};

function wait(ms: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

type FoldGeo = {
  /** Top flap tip (--env-flap-h) */
  flap: number;
  /** Open pocket: V point (--pocket-v) and where the side flaps meet the edges (--pocket-side) */
  pocketV: number;
  pocketSide: number;
  /** Shadow size multiplier — the desktop envelope fills the screen, so units are much larger */
  scale: number;
};

// Deep navy-black so folds read as shadows on the dark envelope paper
const FOLD_SHADE = '#050B18';

/** A paper fold: a crisp dark crease with light catching the edge just below it */
function FoldCrease({ d }: { d: string }) {
  return (
    <>
      <path className="env-invite-paper-folds__crease" d={d} />
      <path className="env-invite-paper-folds__edge" d={d} transform="translate(0,0.6)" />
    </>
  );
}

/** Shared SVG defs: edge shading for side flaps, a lit bottom flap and a soft blur */
function FoldDefs({ id, scale }: { id: string; scale: number }) {
  return (
    <defs>
      <linearGradient id={`${id}-side-l`} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor={FOLD_SHADE} stopOpacity="0.26" />
        <stop offset="1" stopColor={FOLD_SHADE} stopOpacity="0" />
      </linearGradient>
      <linearGradient id={`${id}-side-r`} x1="1" y1="0" x2="0" y2="0">
        <stop offset="0" stopColor={FOLD_SHADE} stopOpacity="0.3" />
        <stop offset="1" stopColor={FOLD_SHADE} stopOpacity="0" />
      </linearGradient>
      <linearGradient id={`${id}-bottom`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.07" />
        <stop offset="0.55" stopColor="#FFFFFF" stopOpacity="0.015" />
        <stop offset="1" stopColor={FOLD_SHADE} stopOpacity="0.16" />
      </linearGradient>
      <filter id={`${id}-soft`} x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation={1.1 * scale} />
      </filter>
    </defs>
  );
}

/**
 * Closed envelope back: side flaps, the bottom flap lapped over them, and the soft
 * shadows cast by the bottom flap and the closed top flap.
 */
function EnvelopeClosedFolds({ geo }: { geo: FoldGeo }) {
  const { flap: f, scale: k } = geo;
  const bottom = `M0,100 L43,${f + 1} Q50,${f - 5} 57,${f + 1} L100,100`;
  return (
    <svg className="env-invite-paper-folds" viewBox="0 0 100 100" preserveAspectRatio="none">
      <FoldDefs id="envc" scale={k} />
      <defs>
        <clipPath id="envc-above-bottom">
          <path d={`M0,0 H100 V100 L57,${f + 1} Q50,${f - 5} 43,${f + 1} L0,100 Z`} />
        </clipPath>
        <clipPath id="envc-below-flap">
          <path d={`M0,0 L50,${f} L100,0 V100 H0 Z`} />
        </clipPath>
      </defs>
      <path d={`M0,0 L50,${f + 2} L0,100 Z`} fill="url(#envc-side-l)" />
      <path d={`M100,0 L50,${f + 2} L100,100 Z`} fill="url(#envc-side-r)" />
      <g clipPath="url(#envc-above-bottom)">
        <path
          className="env-invite-paper-folds__shadow"
          d={bottom}
          strokeWidth={2.4 * k}
          filter="url(#envc-soft)"
          transform={`translate(0,${-0.8 * k})`}
        />
      </g>
      <path d={`${bottom} Z`} fill="url(#envc-bottom)" />
      <FoldCrease d={bottom} />
      <g clipPath="url(#envc-below-flap)">
        <path
          className="env-invite-paper-folds__shadow"
          d={`M0,0 L50,${f} L100,0`}
          strokeWidth={3 * k}
          filter="url(#envc-soft)"
          transform={`translate(0,${1.6 * k})`}
        />
      </g>
      <path className="env-invite-paper-folds__crease" d={`M0,0 L50,${f} L100,0`} />
    </svg>
  );
}

/**
 * Open envelope pocket — same paper shading as the closed back, plus the shadow the
 * pocket lip casts onto the letter tucked inside. Drawn above the pocket panels
 * (shapes match their clip-paths in envelope-invite.css).
 */
function EnvelopePocketFolds({ geo }: { geo: FoldGeo }) {
  const { pocketV: v, pocketSide: sd, scale: k } = geo;
  const sides = `M0,${sd} L50,${v} L100,${sd}`;
  const bottom = `M0,100 L50,${v} L100,100`;
  return (
    <svg className="env-invite-paper-folds env-invite-paper-folds--pocket" viewBox="0 0 100 100" preserveAspectRatio="none">
      <FoldDefs id="envp" scale={k} />
      <defs>
        <clipPath id="envp-above-pocket">
          <path d={`M0,0 H100 V${sd} L50,${v} L0,${sd} Z`} />
        </clipPath>
        <clipPath id="envp-above-bottom">
          <path d={`M0,0 H100 V100 L50,${v} L0,100 Z`} />
        </clipPath>
      </defs>
      {/* Shadow of the pocket lip on the letter */}
      <g clipPath="url(#envp-above-pocket)">
        <path
          className="env-invite-paper-folds__shadow env-invite-paper-folds__shadow--contents"
          d={sides}
          strokeWidth={3.2 * k}
          filter="url(#envp-soft)"
          transform={`translate(0,${-1.2 * k})`}
        />
      </g>
      <path d={`M0,${sd} L50,${v} L0,100 Z`} fill="url(#envp-side-l)" />
      <path d={`M100,${sd} L50,${v} L100,100 Z`} fill="url(#envp-side-r)" />
      <FoldCrease d={sides} />
      <g clipPath="url(#envp-above-bottom)">
        <path
          className="env-invite-paper-folds__shadow"
          d={bottom}
          strokeWidth={2.4 * k}
          filter="url(#envp-soft)"
          transform={`translate(0,${-0.8 * k})`}
        />
      </g>
      <path d={`${bottom} Z`} fill="url(#envp-bottom)" />
      <FoldCrease d={bottom} />
    </svg>
  );
}