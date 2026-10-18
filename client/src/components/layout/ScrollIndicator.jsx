import { useEffect } from 'react';
import { motion, useScroll, useSpring, useTransform } from 'framer-motion';
import FanBlade from '../ui/FanBlade.jsx';
import { useReducedMotion } from '../../hooks/useMedia.js';

/** Fixed fan-blade that rotates with scroll and shows reading progress as a ring. */
export default function ScrollIndicator() {
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const smooth = useSpring(scrollYProgress, { stiffness: 120, damping: 24, mass: 0.4 });
  const rotate = useTransform(smooth, [0, 1], [0, 1440]);
  const dash = useTransform(smooth, [0, 1], [0, 1]);

  useEffect(() => {}, []);
  return (
    <div className="scroll-indicator" aria-hidden="true">
      <svg viewBox="0 0 64 64" className="scroll-indicator__ring">
        <circle cx="32" cy="32" r="29" className="scroll-indicator__track" />
        <motion.circle cx="32" cy="32" r="29" className="scroll-indicator__bar" style={{ pathLength: dash }} />
      </svg>
      <motion.div style={{ rotate: reduced ? 0 : rotate }} className="scroll-indicator__fan">
        <FanBlade size={26} spin={false} />
      </motion.div>
    </div>
  );
}
