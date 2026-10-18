import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { useFinePointer, useReducedMotion } from '../../hooks/useMedia.js';

/**
 * Button with magnetic hover on desktop.
 * variant: 'primary' (burgundy) | 'light' (cream) | 'outline' | 'outline-light' | 'text'
 * Renders a router <Link> when `to` is set, an <a> when `href` is set, otherwise a <button>.
 */
export default function Button({
  children,
  variant = 'primary',
  to,
  href,
  icon,
  magnetic = true,
  className = '',
  ...rest
}) {
  const ref = useRef(null);
  const fine = useFinePointer();
  const reduced = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 18, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 220, damping: 18, mass: 0.4 });
  const enabled = magnetic && fine && !reduced;

  const onMove = (e) => {
    if (!enabled || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * 0.28);
    y.set((e.clientY - (r.top + r.height / 2)) * 0.34);
  };
  const onLeave = () => {
    x.set(0);
    y.set(0);
  };

  const cls = `btn btn--${variant} ${className}`;
  const inner = (
    <>
      <span className="btn__label">{children}</span>
      {icon && <span className="btn__icon">{icon}</span>}
    </>
  );
  const shared = { ref, className: cls, onMouseMove: onMove, onMouseLeave: onLeave, style: { x: sx, y: sy }, 'data-cursor': 'hover', ...rest };

  if (to) return <motion.span style={{ display: 'inline-block', x: sx, y: sy }}><Link to={to} ref={ref} className={cls} onMouseMove={onMove} onMouseLeave={onLeave} data-cursor="hover" {...rest}>{inner}</Link></motion.span>;
  if (href) return <motion.a href={href} {...shared}>{inner}</motion.a>;
  return <motion.button type="button" {...shared}>{inner}</motion.button>;
}
