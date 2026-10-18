import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import FanBlade from '../ui/FanBlade.jsx';

/** Splash loader: spinning fan + wordmark. Shown once per browser session. */
export default function Loader() {
  const [show, setShow] = useState(() => !sessionStorage.getItem('me.loaded'));
  useEffect(() => {
    if (!show) return undefined;
    const t = setTimeout(() => {
      sessionStorage.setItem('me.loaded', '1');
      setShow(false);
    }, 1900);
    return () => clearTimeout(t);
  }, [show]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="loader dark grain"
          exit={{ clipPath: 'inset(0 0 100% 0)' }}
          transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
          role="status"
          aria-label="Loading"
        >
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7 }}>
            <FanBlade size={110} speed={0.9} className="loader__fan" style={{ color: 'var(--cream-100)', '--fan-hub': 'var(--burgundy-900)' }} />
          </motion.div>
          <motion.img
            src="/brand/logo-lockup-cream.png"
            alt=""
            className="loader__logo"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.8 }}
          />
          <motion.p className="eyebrow loader__line" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
            Powering Everyday
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
