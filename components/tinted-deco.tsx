import type React from 'react';

interface TintedDecoProps {
  src: string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Botanical decoration image. Tinting comes from the global --deco-filter rule
 * in app/globals.css (matches "-deco.png" / "/lovestorydeco/" sources), so this
 * renders the <img> directly and keeps callers' sizing classes on it.
 */
export function TintedDeco({ src, className = '', style }: TintedDecoProps) {
  if (!src) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt="" aria-hidden="true" className={className} style={style} />
  );
}
