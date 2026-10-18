import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

function usePersistentState(key, initial) {
  const [value, setValue] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* storage unavailable: keep in memory */
    }
  }, [key, value]);
  return [value, setValue];
}

const snapshot = (p) => ({
  slug: p.slug,
  name: p.name,
  brand: p.brand,
  category: p.category,
  seriesSlug: p.seriesSlug,
  image: p.images?.[0]?.path || null,
});

/* ---------------- Enquiry basket ---------------- */
const EnquiryContext = createContext(null);
export const useEnquiry = () => useContext(EnquiryContext);

export function EnquiryProvider({ children }) {
  const [items, setItems] = usePersistentState('me.enquiry', []);
  const [open, setOpen] = useState(false);

  const add = useCallback(
    (p, qty = 1) =>
      setItems((cur) => {
        const found = cur.find((i) => i.slug === p.slug);
        if (found) return cur.map((i) => (i.slug === p.slug ? { ...i, quantity: Math.min(i.quantity + qty, 10000) } : i));
        return [...cur, { ...snapshot(p), quantity: qty }];
      }),
    [setItems],
  );
  const setQty = useCallback(
    (slug, qty) => setItems((cur) => cur.map((i) => (i.slug === slug ? { ...i, quantity: Math.max(1, Math.min(10000, qty || 1)) } : i))),
    [setItems],
  );
  const remove = useCallback((slug) => setItems((cur) => cur.filter((i) => i.slug !== slug)), [setItems]);
  const clear = useCallback(() => setItems([]), [setItems]);

  const value = useMemo(
    () => ({ items, add, setQty, remove, clear, open, setOpen, count: items.length, has: (slug) => items.some((i) => i.slug === slug) }),
    [items, add, setQty, remove, clear, open],
  );
  return <EnquiryContext.Provider value={value}>{children}</EnquiryContext.Provider>;
}

/* ---------------- Compare (2-3 fans) ---------------- */
const CompareContext = createContext(null);
export const useCompare = () => useContext(CompareContext);
export const MAX_COMPARE = 3;

export function CompareProvider({ children }) {
  const [items, setItems] = usePersistentState('me.compare', []);
  const [full, setFull] = useState(false);

  const toggle = useCallback(
    (p) => {
      setItems((cur) => {
        if (cur.some((i) => i.slug === p.slug)) return cur.filter((i) => i.slug !== p.slug);
        if (cur.length >= MAX_COMPARE) {
          setFull(true);
          setTimeout(() => setFull(false), 2200);
          return cur;
        }
        return [...cur, snapshot(p)];
      });
    },
    [setItems],
  );
  const remove = useCallback((slug) => setItems((cur) => cur.filter((i) => i.slug !== slug)), [setItems]);
  const clear = useCallback(() => setItems([]), [setItems]);

  const value = useMemo(
    () => ({ items, toggle, remove, clear, full, has: (slug) => items.some((i) => i.slug === slug) }),
    [items, toggle, remove, clear, full],
  );
  return <CompareContext.Provider value={value}>{children}</CompareContext.Provider>;
}
