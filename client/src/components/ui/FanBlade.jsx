import { useId } from 'react';

/**
 * Brand fan-blade mark. Spins continuously (CSS), faster on hover of any
 * ancestor with `.fan-hover`, or when `spin` is false it stays still.
 * Use `progress` (0-1) to drive rotation manually (scroll indicator).
 */
export default function FanBlade({ size = 48, blades = 4, spin = true, speed = 6, className = '', style, title }) {
  const id = useId();
  const angles = Array.from({ length: blades }, (_, i) => (360 / blades) * i);
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={`fan-blade ${spin ? 'is-spinning' : ''} ${className}`}
      style={{ '--fan-speed': `${speed}s`, ...style }}
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      aria-labelledby={title ? id : undefined}
    >
      {title && <title id={id}>{title}</title>}
      <g className="fan-blade__rotor">
        {angles.map((a) => (
          <path
            key={a}
            d="M50 47 C 60 36, 66 20, 57 5 C 45 9, 36 24, 43 45 Z"
            fill="currentColor"
            transform={`rotate(${a} 50 50)`}
          />
        ))}
        <circle cx="50" cy="50" r="6.5" fill="currentColor" />
        <circle cx="50" cy="50" r="2.6" fill="var(--fan-hub, var(--burgundy-900))" />
      </g>
    </svg>
  );
}
