import React from 'react';
import { rand, r2 } from '@/components/loader/SunsetSeaBackdrop';
import './navy-backdrop.css';

type NavyBackdropProps = {
  /** Use fixed positioning (covers the viewport instead of the section). */
  fixed?: boolean;
};

// Sun glints: a loose glittering column down the middle (light from the sunset
// above) plus a scatter across the water; smaller and tighter toward the top
const GLINTS = Array.from({ length: 60 }, (_, i) => {
  const depth = Math.pow(rand(i + 500), 1.15);
  const inColumn = rand(i + 550) < 0.62;
  const spread = inColumn ? 6 + depth * 16 : 46;
  return {
    left: r2(50 + (rand(i + 600) - 0.5) * 2 * spread),
    top: r2(1 + depth * 97),
    width: r2(8 + depth * 40 + rand(i + 700) * 14),
    dur: r2(2.4 + rand(i + 800) * 3.6),
    delay: r2(-rand(i + 900) * 6),
  };
});

/** Ocean background for the sections — the same sea as the envelope screen
 *  (components/loader/SunsetSeaBackdrop) in a deeper navy: lighter blue at the
 *  top deepening to navy, fine distant water giving way to bigger swells, a
 *  path of light and glints down the middle. Scrolls with the section; the
 *  waves are seamless tiles (public/ocean, from scripts/generate-ocean-tiles.py)
 *  so the look holds in short and very tall sections. Paints its own base. */
export function NavyBackdrop({ fixed = false }: NavyBackdropProps) {
  return (
    <div className={`navy-backdrop${fixed ? ' navy-backdrop--fixed' : ''}`} aria-hidden="true">
      <div className="navy-backdrop__waves navy-backdrop__waves--far" />
      <div className="navy-backdrop__waves navy-backdrop__waves--back" />
      <div className="navy-backdrop__waves navy-backdrop__waves--front" />
      <div className="navy-backdrop__column" />
      <div className="navy-backdrop__glints">
        {GLINTS.map((g, i) => (
          <span
            key={i}
            className="navy-backdrop__glint"
            style={
              {
                left: `${g.left}%`,
                top: `${g.top}%`,
                width: `${g.width}px`,
                '--dur': `${g.dur}s`,
                '--delay': `${g.delay}s`,
              } as React.CSSProperties
            }
          />
        ))}
      </div>
      <div className="navy-backdrop__vignette" />
    </div>
  );
}
