'use client';

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import Image from 'next/image';
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
import { PlainAtmosphere } from '@/components/loader/PlainAtmosphere';
import './envelope-invite.css';

interface HeroProps {
  onOpen: () => void;
  onTransitionStart?: () => void;
  visible: boolean;
  enterFromLoading?: boolean;
}

const MS_PER_DAY = 1000 * 60 * 60 * 24;

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

const photoInteractEase: Transition = { duration: 0.38, ease: [0.22, 1, 0.36, 1] };
const focusLiftEase: Transition = { duration: 1.15, ease: [0.22, 1, 0.36, 1] };
const revealEntryEase: Transition = { duration: 0.9, ease: [0.22, 1, 0.36, 1] };
const buttonEntryEase: Transition = { duration: 0.95, ease: [0.16, 1, 0.3, 1] };

type PhotoSide = 'left' | 'center' | 'right' | 'right-inner';

type EnvelopePhase =
  | 'idle'
  | 'seal-press'
  | 'seal-break'
  | 'flap-open'
  | 'rising'
  | 'photos'
  | 'revealed'
  | 'cta';

function getFocusLiftPhase(phase: EnvelopePhase): 'idle' | 'opening' | 'photos' | 'revealed' | 'cta' {
  if (phase === 'idle') return 'idle';
  if (
    phase === 'seal-press' ||
    phase === 'seal-break' ||
    phase === 'flap-open' ||
    phase === 'rising'
  ) {
    return 'opening';
  }
  if (phase === 'photos') return 'photos';
  if (phase === 'revealed') return 'revealed';
  return 'cta';
}

const photoEmergenceEase: Transition = { duration: 2.35, ease: [0.22, 1, 0.18, 1] };
const letterEmergenceEase: Transition = { duration: 3.05, ease: [0.5, 0.02, 0.14, 1] };
const flapEase: Transition = { duration: 1.1, ease: [0.65, 0, 0.35, 1] };
const inviteExitEase: Transition = { duration: 1.65, ease: [0.22, 1, 0.36, 1], delay: 0.75 };
const inviteEnterEase: Transition = { duration: 1.2, ease: [0.22, 1, 0.36, 1] };
const letterExitEase: Transition = { duration: 1.55, ease: [0.16, 1, 0.3, 1] };
const inviteRevealLeadMs = 460;
const INVITE_EXIT_MS = 2500;

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
  const reduceMotion = useReducedMotion();
  const openedRef = useRef(false);
  const enterBtnRef = useRef<HTMLButtonElement>(null);
  const [mounted, setMounted] = useState(false);
  const [phase, setPhase] = useState<EnvelopePhase>('idle');
  const [liveMessage, setLiveMessage] = useState('');
  const [liftedPhoto, setLiftedPhoto] = useState<PhotoSide | null>(null);
  const [isExiting, setIsExiting] = useState(false);
  const [isMobileViewport, setIsMobileViewport] = useState(false);

  const groomName = siteConfig.couple.groomNickname;
  const brideName = siteConfig.couple.brideNickname;
  const coupleNames = `${groomName} & ${brideName}`;

  const letterDateNumeric = useMemo(() => {
    const parsed = parseWeddingDate(siteConfig.ceremony.date ?? siteConfig.wedding.date);
    const wedding = new Date(`${parsed.month} ${parsed.day}, ${parsed.year}`);
    if (Number.isNaN(wedding.getTime())) {
      const monthDate = new Date(`${parsed.month} 1, ${parsed.year}`);
      const month = Number.isNaN(monthDate.getTime())
        ? '00'
        : String(monthDate.getMonth() + 1).padStart(2, '0');
      const day = String(parsed.day).padStart(2, '0');
      const year = String(parsed.year).slice(-2);
      return `${month} | ${day} | ${year}`;
    }
    const month = String(wedding.getMonth() + 1).padStart(2, '0');
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

  const envelopePolaroids = useMemo(() => {
    const photos = (content.photos ?? []).map((src) => encodeURI(src));
    const pick = (index: number) => photos[index % photos.length];
    if (!photos.length) return { mobile: [] as const, desktop: [] as const };
    return {
      mobile: [
        { src: pick(0), side: 'left' as const },
        { src: pick(1), side: 'right' as const },
      ] as const,
      desktop: [
        { src: pick(0), side: 'left' as const },
        { src: pick(1), side: 'center' as const },
        { src: pick(2), side: 'right' as const },
        { src: pick(3), side: 'right-inner' as const },
      ] as const,
    };
  }, [content.photos]);

  const countdownText = useMemo(() => {
    const weddingDate = new Date(siteConfig.wedding.date);
    if (Number.isNaN(weddingDate.getTime())) return '';
    const now = new Date();
    const days = Math.round((startOfDay(weddingDate) - startOfDay(now)) / MS_PER_DAY);
    if (days < 0) return content.countdownPastText;
    if (days === 0) return content.countdownTodayText;
    if (days === 1) return content.countdownOneDayText;
    return content.countdownText.replace('{days}', days.toLocaleString());
  }, [content, siteConfig.wedding.date]);

  const flapIsOpen =
    phase === 'flap-open' ||
    phase === 'rising' ||
    phase === 'photos' ||
    phase === 'revealed' ||
    phase === 'cta';

  const contentsVisible =
    phase === 'rising' ||
    phase === 'photos' ||
    phase === 'revealed' ||
    phase === 'cta';

  const sealGone =
    phase === 'seal-break' ||
    phase === 'flap-open' ||
    phase === 'rising' ||
    phase === 'photos' ||
    phase === 'revealed' ||
    phase === 'cta';

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
      setLiftedPhoto(null);
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

  useEffect(() => {
    if (
      phase === 'idle' ||
      phase === 'seal-press' ||
      phase === 'seal-break' ||
      phase === 'flap-open' ||
      phase === 'rising'
    ) {
      setLiftedPhoto(null);
    }
  }, [phase]);

  const toggleLiftedPhoto = useCallback((side: PhotoSide) => {
    setLiftedPhoto((current) => (current === side ? null : side));
  }, []);

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

    setLiveMessage('Breaking seal.');
    setPhase('seal-break');
    await wait(320);

    setLiveMessage('Opening envelope.');
    setPhase('flap-open');
    await wait(1100);

    setLiveMessage('Invitation rising.');
    setPhase('rising');
    await wait(isPlain ? 2400 : 3200);

    if (!isPlain) {
      setLiveMessage('Photos revealing.');
      setPhase('photos');
      await wait(3600);
    }

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

  const sealVariants: Variants = {
    idle: { scale: 1, opacity: 1, rotate: 0, y: 0 },
    press: { scale: 0.94, opacity: 1, rotate: 0, y: 2 },
    break: { scale: 0.2, opacity: 0, rotate: 12, y: -4 },
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
      exitPortal: {
        y: '-118%',
        scale: 3.35,
        opacity: 1,
        rotate: 0,
        zIndex: 48,
      },
    }),
    [isMobileViewport],
  );

  const photoLeftVariants: Variants = {
    hidden: { y: '58%', x: '12%', rotate: -4, scale: 0.72, opacity: 0, zIndex: 12 },
    emerge: { y: '0%', x: '0%', rotate: -7, scale: 1, opacity: 1, zIndex: 16 },
    hover: { y: '-6%', x: '0%', rotate: -8, scale: 1.05, opacity: 1, zIndex: 26 },
    press: { y: '-3%', x: '0%', rotate: -7.5, scale: 1.02, opacity: 1, zIndex: 24 },
    lifted: { y: '-12%', x: '0%', rotate: -8, scale: 1.08, opacity: 1, zIndex: 30 },
    exit: { y: '-18%', x: '-108%', rotate: -24, scale: 0.68, opacity: 0, zIndex: 10 },
  };

  const photoCenterVariants: Variants = {
    hidden: { y: '62%', x: '0%', rotate: 0, scale: 0.7, opacity: 0, zIndex: 11 },
    emerge: { y: '0%', x: '0%', rotate: 2, scale: 1, opacity: 1, zIndex: 15 },
    hover: { y: '-6%', x: '0%', rotate: 2.5, scale: 1.05, opacity: 1, zIndex: 27 },
    press: { y: '-3%', x: '0%', rotate: 2.2, scale: 1.02, opacity: 1, zIndex: 25 },
    lifted: { y: '-12%', x: '0%', rotate: 3, scale: 1.08, opacity: 1, zIndex: 31 },
    exit: { y: '-108%', x: '0%', rotate: 10, scale: 0.72, opacity: 0, zIndex: 10 },
  };

  const photoRightVariants: Variants = {
    hidden: { y: '58%', x: '-12%', rotate: 4, scale: 0.72, opacity: 0, zIndex: 12 },
    emerge: { y: '0%', x: '0%', rotate: 7, scale: 1, opacity: 1, zIndex: 16 },
    hover: { y: '-6%', x: '0%', rotate: 8, scale: 1.05, opacity: 1, zIndex: 26 },
    press: { y: '-3%', x: '0%', rotate: 7.5, scale: 1.02, opacity: 1, zIndex: 24 },
    lifted: { y: '-12%', x: '0%', rotate: 8, scale: 1.08, opacity: 1, zIndex: 30 },
    exit: { y: '-18%', x: '108%', rotate: 24, scale: 0.68, opacity: 0, zIndex: 10 },
  };

  const photoRightInnerVariants: Variants = {
    hidden: { y: '62%', x: '-10%', rotate: 1, scale: 0.7, opacity: 0, zIndex: 11 },
    emerge: { y: '0%', x: '0%', rotate: -2, scale: 1, opacity: 1, zIndex: 15 },
    hover: { y: '-6%', x: '0%', rotate: -2.5, scale: 1.05, opacity: 1, zIndex: 27 },
    press: { y: '-3%', x: '0%', rotate: -2.2, scale: 1.02, opacity: 1, zIndex: 25 },
    lifted: { y: '-12%', x: '0%', rotate: -3, scale: 1.08, opacity: 1, zIndex: 31 },
    exit: { y: '-18%', x: '108%', rotate: 16, scale: 0.72, opacity: 0, zIndex: 10 },
  };

  const mobileEnvelopePhotoLeftVariants: Variants = {
    hidden: { y: '58%', x: '6%', rotate: -1, scale: 0.72, opacity: 0, zIndex: 12 },
    emerge: { y: '0%', x: '-8%', rotate: -4, scale: 1, opacity: 1, zIndex: 16 },
    hover: { y: '-6%', x: '-8%', rotate: -4.5, scale: 1.05, opacity: 1, zIndex: 26 },
    press: { y: '-3%', x: '-8%', rotate: -4.2, scale: 1.02, opacity: 1, zIndex: 24 },
    lifted: { y: '-12%', x: '-8%', rotate: -4.5, scale: 1.08, opacity: 1, zIndex: 30 },
    exit: { y: '-18%', x: '-108%', rotate: -24, scale: 0.68, opacity: 0, zIndex: 10 },
  };

  const mobileEnvelopePhotoRightVariants: Variants = {
    hidden: { y: '58%', x: '-6%', rotate: 1, scale: 0.72, opacity: 0, zIndex: 12 },
    emerge: { y: '0%', x: '8%', rotate: 4, scale: 1, opacity: 1, zIndex: 16 },
    hover: { y: '-6%', x: '8%', rotate: 4.5, scale: 1.05, opacity: 1, zIndex: 26 },
    press: { y: '-3%', x: '8%', rotate: 4.2, scale: 1.02, opacity: 1, zIndex: 24 },
    lifted: { y: '-12%', x: '8%', rotate: 4.5, scale: 1.08, opacity: 1, zIndex: 30 },
    exit: { y: '-18%', x: '108%', rotate: 24, scale: 0.68, opacity: 0, zIndex: 10 },
  };

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
    photos: { y: 0, scale: 1, opacity: 1 },
    revealed: { y: 0, scale: 1, opacity: 1 },
    cta: { y: 0, scale: 1, opacity: 1 },
    exit: {
      y: -18,
      scale: 0.94,
      opacity: 0,
      transition: { duration: 1.15, delay: 0.52, ease: [0.4, 0, 0.2, 1] },
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

  const photoState =
    phase === 'idle' ||
    phase === 'seal-press' ||
    phase === 'seal-break' ||
    phase === 'flap-open' ||
    phase === 'rising'
      ? 'hidden'
      : 'emerge';

  const photosInteractive = photoState === 'emerge';

  const sealState =
    phase === 'idle' ? 'idle' : phase === 'seal-press' ? 'press' : 'break';

  return (
    <motion.div
      className={`env-invite-screen${isPlain ? ' env-invite-screen--plain' : ''} ${visible ? '' : 'is-hidden'}`}
      data-phase={isExiting ? 'exiting' : phase}
      aria-hidden={!visible}
      initial={false}
      animate={
        isExiting
          ? { opacity: 0, y: 0, scale: 1 }
          : visible
            ? { opacity: 1, y: 0, scale: 1 }
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
          <PlainAtmosphere fixed baseColor={plainTheme.background} />
          <div className="env-invite-plain-corners" aria-hidden="true">
            {(
              [
                { src: cornerDecos.topLeft, className: 'left-0 top-0' },
                { src: cornerDecos.topRight, className: 'right-0 top-0' },
                { src: cornerDecos.bottomLeft, className: 'left-0 bottom-0' },
                { src: cornerDecos.bottomRight, className: 'right-0 bottom-0' },
              ] as const
            ).map(({ src, className }) => (
              <div key={src} className={`pointer-events-none absolute ${className}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" className="env-invite-plain-corner-img" />
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

      {isExiting && !reduceMotion && (
        <>
          <motion.div
            className="env-invite-exit-ring"
            aria-hidden="true"
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 3.45, opacity: [0, 0.62, 0] }}
            transition={{ duration: 1.65, ease: [0.22, 1, 0.36, 1], times: [0, 0.34, 1], delay: 0.06 }}
          />
          <motion.div
            className="env-invite-exit-bloom"
            aria-hidden="true"
            initial={{ opacity: 0, scale: 0.28 }}
            animate={{ opacity: [0, 0.96, 0.72, 0], scale: [0.28, 1.08, 1.52, 1.78] }}
            transition={{
              duration: 1.72,
              ease: [0.22, 1, 0.36, 1],
              times: [0, 0.26, 0.58, 1],
              delay: 0.1,
            }}
          />
          <motion.div
            className="env-invite-exit-shimmer"
            aria-hidden="true"
            initial={{ x: '-130%', opacity: 0 }}
            animate={{ x: '130%', opacity: [0, 0.85, 0] }}
            transition={{ duration: 1.25, ease: 'easeInOut', delay: 0.22 }}
          />
          <motion.div
            className="env-invite-exit-curtain env-invite-exit-curtain--left"
            aria-hidden="true"
            initial={{ x: '-105%' }}
            animate={{ x: 0 }}
            transition={{ duration: 0.95, delay: 1.15, ease: [0.65, 0, 0.35, 1] }}
          />
          <motion.div
            className="env-invite-exit-curtain env-invite-exit-curtain--right"
            aria-hidden="true"
            initial={{ x: '105%' }}
            animate={{ x: 0 }}
            transition={{ duration: 0.95, delay: 1.15, ease: [0.65, 0, 0.35, 1] }}
          />
        </>
      )}

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
                  ? { duration: 1.15, delay: 0.52, ease: [0.4, 0, 0.2, 1] }
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
                ? { duration: 1.1, delay: 0.68, ease: [0.4, 0, 0.2, 1] }
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
            />

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
                        ? { ...letterExitEase, delay: 0.14 }
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
                      <span className="env-invite-letter-label">{content.headline}</span>
                      <span className="env-invite-letter-date">{letterDateNumeric}</span>
                      <span className="env-invite-letter-invited">{content.eyebrow}</span>
                      <div
                        className="env-invite-letter-names couple-name-lockup"
                        role="img"
                        aria-label={coupleNames}
                        style={{
                          maskImage: `url("${content.coupleNameImage}")`,
                          WebkitMaskImage: `url("${content.coupleNameImage}")`,
                        }}
                      />
                    </div>
                  </motion.div>

                  {!isPlain && (
                  <div className="env-invite-photos-emerge">
                    {isMobileViewport
                      ? envelopePolaroids.mobile.map((photo, index) => (
                          <PolaroidPhoto
                            key={`mobile-${photo.side}-${photo.src}`}
                            side={photo.side}
                            src={photo.src}
                            alt={photo.side === 'left' ? `${groomName} portrait` : `${brideName} portrait`}
                            variants={
                              photo.side === 'left'
                                ? mobileEnvelopePhotoLeftVariants
                                : mobileEnvelopePhotoRightVariants
                            }
                            photoState={photoState}
                            liftedPhoto={liftedPhoto}
                            onToggle={toggleLiftedPhoto}
                            interactive={photosInteractive}
                            emergenceDelay={index === 0 ? 0.55 : 1.0}
                            reduceMotion={reduceMotion}
                            isExiting={isExiting}
                            envelopePair
                          />
                        ))
                      : envelopePolaroids.desktop.map((photo, index) => {
                          const delays = [0.55, 1.0, 1.45, 1.7] as const;
                          const variantsBySide: Record<PhotoSide, Variants> = {
                            left: photoLeftVariants,
                            center: photoCenterVariants,
                            right: photoRightVariants,
                            'right-inner': photoRightInnerVariants,
                          };
                          return (
                            <PolaroidPhoto
                              key={`desktop-${photo.side}-${photo.src}`}
                              side={photo.side}
                              src={photo.src}
                              alt={coupleNames}
                              variants={variantsBySide[photo.side]}
                              photoState={photoState}
                              liftedPhoto={liftedPhoto}
                              onToggle={toggleLiftedPhoto}
                              interactive={photosInteractive}
                              emergenceDelay={delays[index] ?? 1.7}
                              reduceMotion={reduceMotion}
                              isExiting={isExiting}
                            />
                          );
                        })}
                  </div>
                  )}
                </div>
              </div>
            </div>

            {/* 3. Closed front skin — solid cover, hides when open */}
            <div className="env-invite-front-closed" aria-hidden="true">
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
            </div>

            <div className="env-invite-hinge" aria-hidden="true" />
            </div>

            {/* Front pocket — above body so paper stays tucked inside */}
            <div className="env-invite-pocket" aria-hidden="true">
              <div className="env-invite-pocket-front" />
              <div className="env-invite-pocket-left" />
              <div className="env-invite-pocket-right" />
            </div>

            {/* Wax seal — centered on flap junction */}
            <div
              className="env-invite-seal-wrap"
              style={{
                display: sealGone && phase !== 'seal-break' ? 'none' : undefined,
              }}
            >
              <motion.button
                type="button"
                className="env-invite-seal-btn"
                variants={sealVariants}
                initial="idle"
                animate={sealState}
                transition={
                  sealState === 'break'
                    ? { duration: 0.28, ease: 'easeIn' }
                    : { duration: 0.16, ease: 'easeOut' }
                }
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

            {phase === 'seal-break' && !reduceMotion && (
              <>
                <motion.span
                  className="env-invite-seal-shard"
                  initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                  animate={{ x: -28, y: -30, opacity: 0, scale: 0.35 }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                  aria-hidden="true"
                />
                <motion.span
                  className="env-invite-seal-shard"
                  initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                  animate={{ x: 30, y: 18, opacity: 0, scale: 0.3 }}
                  transition={{ duration: 0.38, ease: 'easeOut' }}
                  aria-hidden="true"
                />
                <motion.span
                  className="env-invite-seal-shard"
                  initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                  animate={{ x: 14, y: -24, opacity: 0, scale: 0.4 }}
                  transition={{ duration: 0.32, ease: 'easeOut' }}
                  aria-hidden="true"
                />
              </>
            )}
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

interface PolaroidPhotoProps {
  side: PhotoSide;
  src: string;
  alt: string;
  variants: Variants;
  photoState: 'hidden' | 'emerge';
  liftedPhoto: PhotoSide | null;
  onToggle: (side: PhotoSide) => void;
  interactive: boolean;
  emergenceDelay: number;
  reduceMotion: boolean | null;
  isExiting?: boolean;
  envelopePair?: boolean;
}

const PHOTO_EXIT_DELAY: Record<PhotoSide, number> = {
  left: 0.06,
  center: 0.1,
  right: 0.04,
  'right-inner': 0.14,
};

function PolaroidPhoto({
  side,
  src,
  alt,
  variants,
  photoState,
  liftedPhoto,
  onToggle,
  interactive,
  emergenceDelay,
  reduceMotion,
  isExiting = false,
  envelopePair = false,
}: PolaroidPhotoProps) {
  const canInteract = interactive && !reduceMotion && !isExiting;

  const animateState = isExiting
    ? 'exit'
    : photoState === 'hidden'
      ? 'hidden'
      : liftedPhoto === side
        ? 'lifted'
        : 'emerge';

  return (
    <motion.button
      type="button"
      className={`env-invite-polaroid env-invite-polaroid--${side}${liftedPhoto === side ? ' is-lifted' : ''}${envelopePair ? ' env-invite-polaroid--envelope-pair' : ''}`}
      variants={variants}
      initial="hidden"
      animate={animateState}
      whileHover={canInteract && liftedPhoto !== side ? 'hover' : undefined}
      whileTap={canInteract ? 'press' : undefined}
      transition={
        reduceMotion
          ? { duration: 0.01 }
          : isExiting
            ? { duration: 0.92, ease: [0.4, 0, 0.2, 1], delay: PHOTO_EXIT_DELAY[side] }
            : photoState === 'hidden'
              ? { duration: 0.01 }
              : animateState === 'emerge' && liftedPhoto === null
                ? { ...photoEmergenceEase, delay: emergenceDelay }
                : photoInteractEase
      }
      onClick={(e) => {
        e.stopPropagation();
        if (interactive) onToggle(side);
      }}
      disabled={!interactive}
      aria-label={`View photo ${side}`}
      aria-pressed={liftedPhoto === side}
    >
      <div className="env-invite-polaroid-photo">
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover env-invite-polaroid-img"
          sizes={envelopePair ? '(max-width: 767px) 42vw, 140px' : '(min-width: 768px) 310px, 140px'}
          priority
        />
      </div>
    </motion.button>
  );
}