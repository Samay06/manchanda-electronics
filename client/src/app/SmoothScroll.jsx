import { createContext, useContext, useEffect, useRef } from 'react';
import Lenis from 'lenis';
import { useReducedMotion } from '../hooks/useMedia.js';

const LenisContext = createContext(null);
export const useLenis = () => useContext(LenisContext);

export function SmoothScroll({ children }) {
  const lenisRef = useRef(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return undefined;
    const lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 0.95, smoothWheel: true });
    lenisRef.current = lenis;
    let raf;
    const loop = (t) => {
      lenis.raf(t);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [reduced]);

  const api = {
    scrollTo: (target, opts) =>
      lenisRef.current ? lenisRef.current.scrollTo(target, opts) : window.scrollTo({ top: typeof target === 'number' ? target : 0 }),
    stop: () => lenisRef.current?.stop(),
    start: () => lenisRef.current?.start(),
  };
  return <LenisContext.Provider value={api}>{children}</LenisContext.Provider>;
}
