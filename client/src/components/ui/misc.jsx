import { useEffect, useRef, useState } from 'react';
import { animate, useInView } from 'framer-motion';
import { useReducedMotion } from '../../hooks/useMedia.js';

export function Marquee({ items, speed = 38, className = '', separator }) {
  const row = (
    <ul className="marquee__row" aria-hidden="false">
      {items.map((it, i) => (
        <li key={i} className="marquee__item">
          {it}
          {separator ?? <span className="marquee__dot" aria-hidden="true" />}
        </li>
      ))}
    </ul>
  );
  return (
    <div className={`marquee ${className}`} style={{ '--marquee-speed': `${speed}s` }}>
      <div className="marquee__track">
        {row}
        <div aria-hidden="true">{row}</div>
      </div>
    </div>
  );
}

export function CountUp({ to, suffix = '', duration = 1.8 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '0px 0px -10% 0px' });
  const reduced = useReducedMotion();
  const [val, setVal] = useState(reduced ? to : 0);
  useEffect(() => {
    if (!inView || reduced) return undefined;
    const c = animate(0, to, { duration, ease: [0.22, 1, 0.36, 1], onUpdate: (v) => setVal(Math.round(v)) });
    return () => c.stop();
  }, [inView, reduced, to, duration]);
  return (
    <span ref={ref}>
      {val}
      {suffix}
    </span>
  );
}

export function Skeleton({ className = '', style }) {
  return <div className={`skeleton ${className}`} style={style} aria-hidden="true" />;
}

export function Chip({ children, active = false, className = '', ...rest }) {
  return (
    <button type="button" className={`chip ${active ? 'is-active' : ''} ${className}`} data-cursor="hover" {...rest}>
      {children}
    </button>
  );
}
