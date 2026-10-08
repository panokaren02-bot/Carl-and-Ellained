'use client';

import React, { useEffect, useRef } from 'react';
import './plain-bubbles.css';

// Flat overlapping-circle pattern (plain mode backgrounds).
// [x %, y %, diameter in vmax, tone] — tone: d = deep, m = mid, l = light (main circles);
// c, p, b = accent circles 1–3; r = rose, k = soft peach. Colors: app/globals.css → "BACKGROUND — CIRCLE PATTERN"
const BUBBLES: [number, number, number, 'd' | 'm' | 'l' | 'c' | 'p' | 'b' | 'r' | 'k'][] = [
  [1.5, 2.5, 11.6, 'm'], [5.4, 10, 4.7, 'l'], [13.4, 5.8, 4.7, 'c'], [37.5, 3.5, 31.7, 'm'],
  [0, 22, 4.7, 'm'], [8.9, 32, 8.2, 'k'], [22.4, 32.7, 25.4, 'd'], [2.4, 42, 4.7, 'd'],
  [4.8, 57, 8.2, 'r'], [15.3, 58, 4.7, 'c'], [32.9, 52.5, 21.2, 'l'], [1.5, 84, 18.5, 'r'],
  [18.3, 81, 11.6, 'b'], [29.9, 95, 11.6, 'k'], [37.4, 81, 4.5, 'p'], [43.5, 84, 11.8, 'd'],
  [56.2, 95, 21.2, 'r'], [50, 63, 6.1, 'c'], [53.3, 34, 9.1, 'd'], [65.1, 10, 11.6, 'k'],
  [68.4, 26.3, 4.5, 'b'], [65.1, 39.6, 6.2, 'l'], [63.9, 57, 9.1, 'd'], [67.6, 65.8, 13.4, 'r'],
  [77.4, 93, 31.7, 'l'], [78.4, 37.8, 13.4, 'l'], [85.9, 24.4, 22.3, 'k'], [93, 7, 22.3, 'c'],
  [85.3, 58.7, 6.2, 'k'], [92.3, 60.3, 12.2, 'm'], [98.5, 48, 10, 'r'], [98.5, 74.6, 11.7, 'd'],
]

type PlainBubblesProps = {
  /** Use fixed positioning (envelope hero covers the viewport). */
  fixed?: boolean;
};

/** Crisp translucent circles on a flat motif-aqua base; each pops in as it
 *  scrolls into view, then wanders and breathes. */
export function PlainBubbles({ fixed = false }: PlainBubblesProps) {
  const ref = useRef<HTMLDivElement>(null);

  // Reveal circles one by one as they enter the viewport (tall sections pop in
  // progressively while scrolling). Marked straight on the DOM node — no re-renders.
  useEffect(() => {
    const circles = Array.from(ref.current?.children ?? []) as HTMLElement[];
    if (typeof IntersectionObserver === 'undefined') {
      circles.forEach((el) => (el.dataset.in = ''));
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          (entry.target as HTMLElement).dataset.in = '';
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: '0px 0px -6% 0px' },
    );
    circles.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`plain-bubbles${fixed ? ' plain-bubbles--fixed' : ''}`}
      aria-hidden="true"
    >
      {BUBBLES.map(([x, y, size, tone], i) => (
        <span
          key={i}
          className={`plain-bubble plain-bubble--${tone}`}
          style={
            {
              '--x': `${x}%`,
              '--y': `${y}%`,
              '--size': `${size}vmax`,
              '--i': i,
              // circles entering together pop in a beat apart
              '--pop-delay': `${(i % 4) * 110}ms`,
              // varied drift so neighbours never move in lockstep
              '--dx': `${(i % 2 ? 1 : -1) * (1.8 + ((i * 7) % 5) * 0.55)}vmax`,
              '--dy': `${(i % 3 ? -1 : 1) * (1.6 + ((i * 5) % 4) * 0.6)}vmax`,
              '--dur': `${14 + ((i * 11) % 12)}s`,
              // gentle swell, each circle on its own rhythm
              '--breathe': `${5 + ((i * 3) % 5)}s`,
              '--swell': 1.05 + ((i * 13) % 5) * 0.015,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
