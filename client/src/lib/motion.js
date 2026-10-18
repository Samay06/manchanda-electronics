export const ease = [0.22, 1, 0.36, 1];

export const fadeUp = {
  hidden: { opacity: 0, y: 36 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.8, ease, delay: i * 0.08 } }),
};

export const stagger = (gap = 0.08, delay = 0) => ({
  hidden: {},
  show: { transition: { staggerChildren: gap, delayChildren: delay } },
});

export const clipReveal = {
  hidden: { clipPath: 'inset(0 0 100% 0)', scale: 1.08 },
  show: { clipPath: 'inset(0 0 0% 0)', scale: 1, transition: { duration: 1.1, ease } },
};

export const pageVariants = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.55, ease } },
  exit: { opacity: 0, transition: { duration: 0.25 } },
};
