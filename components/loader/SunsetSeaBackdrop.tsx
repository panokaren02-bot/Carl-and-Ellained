import React from 'react';
import './sunset-sea-backdrop.css';

type SunsetSeaBackdropProps = {
  /** Use fixed positioning (envelope hero covers the viewport). */
  fixed?: boolean;
};

// Small deterministic pseudo-random so server and client render the same scene
export function rand(seed: number) {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

export type Streak = { x: number; y: number; rx: number; ry: number; dark: boolean };

// Wave streaks across the sea (viewBox 1000 × 340): rows bunch up near the
// horizon and grow taller toward the viewer, like water seen in perspective.
export function buildStreaks(seed: number, rows: number, perRow: number): Streak[] {
  const out: Streak[] = [];
  for (let r = 0; r < rows; r++) {
    const t = (r + 1) / rows;
    const y = 340 * Math.pow(t, 1.45);
    for (let i = 0; i < perRow; i++) {
      const s = seed + r * 31 + i * 7;
      out.push({
        x: rand(s) * 1100 - 50,
        y: y + (rand(s + 1) - 0.5) * 8 * t,
        rx: (50 + rand(s + 2) * 170) * (0.5 + t),
        ry: 1.5 + t * 7 + rand(s + 3) * 3,
        dark: rand(s + 4) > 0.42,
      });
    }
  }
  return out;
}

const STREAKS_BACK = buildStreaks(11, 16, 5);
const STREAKS_FRONT = buildStreaks(97, 12, 4);

// Sun glints on the water — gathered under the sun, spreading and growing toward the viewer
const GLINTS = Array.from({ length: 34 }, (_, i) => {
  const depth = Math.pow(rand(i + 500), 1.3); // 0 = horizon, 1 = foreground
  const spread = 10 + depth * 38;
  return {
    left: 50 + (rand(i + 600) - 0.5) * 2 * spread,
    top: 3 + depth * 82,
    width: 10 + depth * 46 + rand(i + 700) * 18,
    dur: 2.6 + rand(i + 800) * 3.4,
    delay: -rand(i + 900) * 6,
  };
});

/** Watercolor sunset over the sea: rose-and-peach clouds drifting across a
 *  glowing sky, mauve mountains on the horizon, and a navy sea that rolls
 *  slowly with sunlight glinting on the waves. */
export function SunsetSeaBackdrop({ fixed = false }: SunsetSeaBackdropProps) {
  // Distinct filter ids per instance — the loader and envelope can be mounted together
  const id = fixed ? 'ssb-f' : 'ssb';
  return (
    <div className={`sunset-sea${fixed ? ' sunset-sea--fixed' : ''}`} aria-hidden="true">
      <svg className="sunset-sea__defs" width="0" height="0" focusable="false">
        {/* Wet-edge bleed for clouds and mountains */}
        <filter id={`${id}-bleed`} x="-20%" y="-40%" width="140%" height="180%">
          <feTurbulence type="fractalNoise" baseFrequency="0.011 0.03" numOctaves="4" seed="4" />
          <feDisplacementMap in="SourceGraphic" scale="46" />
          <feGaussianBlur stdDeviation="3.5" />
        </filter>
        {/* Choppier bleed for the water strokes */}
        <filter id={`${id}-water`} x="-10%" y="-60%" width="120%" height="220%">
          <feTurbulence type="fractalNoise" baseFrequency="0.02 0.12" numOctaves="3" seed="9" />
          <feDisplacementMap in="SourceGraphic" scale="14" />
          <feGaussianBlur stdDeviation="1.1" />
        </filter>
      </svg>

      {/* ── Sky ── */}
      <div className="sunset-sea__sky">
        <svg className="sunset-sea__clouds sunset-sea__clouds--high" viewBox="0 0 1000 700" preserveAspectRatio="xMidYMid slice">
          <g filter={`url(#${id}-bleed)`}>
            <ellipse cx="180" cy="70" rx="360" ry="70" className="ss-rose" />
            <ellipse cx="760" cy="55" rx="330" ry="55" className="ss-rose" />
            <ellipse cx="470" cy="35" rx="300" ry="45" className="ss-coral" />
            <ellipse cx="540" cy="175" rx="420" ry="42" className="ss-rose" />
            <ellipse cx="300" cy="225" rx="340" ry="38" className="ss-coral" />
            <ellipse cx="130" cy="300" rx="300" ry="48" className="ss-rose" />
            <ellipse cx="860" cy="285" rx="270" ry="40" className="ss-rose" />
            <ellipse cx="520" cy="300" rx="260" ry="34" className="ss-light" />
          </g>
        </svg>
        <svg className="sunset-sea__clouds sunset-sea__clouds--low" viewBox="0 0 1000 700" preserveAspectRatio="xMidYMid slice">
          <g filter={`url(#${id}-bleed)`}>
            <ellipse cx="150" cy="420" rx="270" ry="44" className="ss-mauve" />
            <ellipse cx="90" cy="470" rx="200" ry="28" className="ss-mauve" />
            <ellipse cx="700" cy="390" rx="380" ry="32" className="ss-coral" />
            <ellipse cx="610" cy="475" rx="400" ry="20" className="ss-peach" />
            <ellipse cx="880" cy="530" rx="300" ry="18" className="ss-peach" />
            <ellipse cx="300" cy="560" rx="350" ry="15" className="ss-peach" />
            <ellipse cx="720" cy="610" rx="420" ry="13" className="ss-peach" />
            <ellipse cx="430" cy="520" rx="260" ry="18" className="ss-light" />
          </g>
        </svg>
        <div className="sunset-sea__sun" />
        <svg className="sunset-sea__mountains" viewBox="0 0 1000 120" preserveAspectRatio="xMidYMax slice">
          <g filter={`url(#${id}-bleed)`}>
            <path d="M-40,120 L-40,58 Q40,40 120,52 Q190,60 250,82 Q330,100 430,120 Z" className="ss-mount-far" />
            <path d="M-40,120 L-40,78 Q60,64 170,84 Q260,100 340,120 Z" className="ss-mount-near" />
            <path d="M560,120 Q680,100 760,86 Q820,74 870,44 Q900,30 930,46 Q980,72 1040,82 L1040,120 Z" className="ss-mount-far" />
            <path d="M660,120 Q760,104 860,94 Q950,88 1040,96 L1040,120 Z" className="ss-mount-near" />
          </g>
        </svg>
      </div>

      {/* ── Sea ── */}
      <div className="sunset-sea__sea">
        <svg className="sunset-sea__waves sunset-sea__waves--back" viewBox="0 0 1000 340" preserveAspectRatio="xMidYMid slice">
          <g filter={`url(#${id}-water)`}>
            {STREAKS_BACK.map((s, i) => (
              <ellipse key={i} cx={s.x} cy={s.y} rx={s.rx} ry={s.ry} className={s.dark ? 'ss-wave-dark' : 'ss-wave-light'} />
            ))}
          </g>
        </svg>
        <svg className="sunset-sea__waves sunset-sea__waves--front" viewBox="0 0 1000 340" preserveAspectRatio="xMidYMid slice">
          <g filter={`url(#${id}-water)`}>
            {STREAKS_FRONT.map((s, i) => (
              <ellipse key={i} cx={s.x} cy={s.y} rx={s.rx * 0.8} ry={s.ry} className={s.dark ? 'ss-wave-deep' : 'ss-wave-light'} />
            ))}
          </g>
        </svg>

        <div className="sunset-sea__glints">
          {GLINTS.map((g, i) => (
            <span
              key={i}
              className="sunset-sea__glint"
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

        {/* Foreground swell rolling in from the lower left, its crest catching the light */}
        <svg className="sunset-sea__swell" viewBox="0 0 1000 300" preserveAspectRatio="xMinYMax slice">
          <g filter={`url(#${id}-water)`}>
            <path d="M-20,120 Q140,150 300,210 Q420,255 560,300 L-20,300 Z" className="ss-swell" />
            <path d="M-20,120 Q140,150 300,210 Q420,255 560,300" className="ss-swell-crest" />
          </g>
        </svg>
      </div>

      <div className="sunset-sea__haze" />
      <div className="sunset-sea__paper" />
    </div>
  );
}
