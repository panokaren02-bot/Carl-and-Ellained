import React from 'react';
import './plain-atmosphere.css';

type PlainAtmosphereProps = {
  /** Use fixed positioning (envelope hero covers the viewport). */
  fixed?: boolean;
  baseColor?: string;
};

export function PlainAtmosphere({ fixed = false, baseColor }: PlainAtmosphereProps) {
  return (
    <div
      className={`invite-plain-atmosphere${fixed ? ' invite-plain-atmosphere--fixed' : ''}`}
      aria-hidden="true"
      style={
        baseColor
          ? ({ '--invite-plain-base': baseColor } as React.CSSProperties)
          : undefined
      }
    >
      <div className="invite-plain-atmosphere__base" />
      <div className="invite-plain-atmosphere__blobs">
        <span className="invite-plain-atmosphere__blob invite-plain-atmosphere__blob--1" />
        <span className="invite-plain-atmosphere__blob invite-plain-atmosphere__blob--2" />
        <span className="invite-plain-atmosphere__blob invite-plain-atmosphere__blob--3" />
        <span className="invite-plain-atmosphere__blob invite-plain-atmosphere__blob--4" />
        <span className="invite-plain-atmosphere__blob invite-plain-atmosphere__blob--5" />
      </div>
      <div className="invite-plain-atmosphere__frost" />
      <div className="invite-plain-atmosphere__grain" />
    </div>
  );
}
