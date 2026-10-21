import type React from 'react';

interface TintedDecoProps {
  src: string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Botanical decoration image. The files in public/deco are pre-tinted with
 * --deco-filter (see app/globals.css), so this renders the <img> directly and
 * keeps callers' sizing classes on it.
 */
export function TintedDeco({ src, className = '', style }: TintedDecoProps) {
  if (!src) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt="" aria-hidden="true" className={className} style={style} />
  );
}
