import { Link } from 'react-router-dom';

/** Monochrome logo: cream on dark, burgundy on light. variant: 'lockup' | 'mark'. */
export default function Logo({ tone = 'cream', variant = 'lockup', height = 44, className = '' }) {
  const src = `/brand/logo-${variant === 'mark' ? 'mark' : 'lockup'}-${tone}.png`;
  return (
    <Link to="/" className={`logo ${className}`} aria-label="Manchanda Electricals — home" data-cursor="hover">
      <img src={src} alt="Manchanda Electricals" height={height} style={{ height }} />
    </Link>
  );
}
