import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X, ArrowRight } from '@phosphor-icons/react';
import { useCompare, MAX_COMPARE } from '../../app/stores.jsx';

/** Bottom drawer listing 1-3 fans picked for comparison. */
export default function CompareDrawer() {
  const { items, remove, clear, full } = useCompare();
  return (
    <AnimatePresence>
      {items.length > 0 && (
        <motion.aside
          className="compare-drawer dark"
          initial={{ y: '110%' }}
          animate={{ y: 0 }}
          exit={{ y: '110%' }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          aria-label="Compare fans"
        >
          <div className="compare-drawer__head">
            <span className="eyebrow">Compare · {items.length}/{MAX_COMPARE}</span>
            <button type="button" className="compare-drawer__clear" onClick={clear} data-cursor="hover">
              Clear all
            </button>
          </div>
          <ul className="compare-drawer__list">
            {items.map((p) => (
              <motion.li key={p.slug} layout className="compare-drawer__item">
                {p.image && <img src={p.image} alt="" loading="lazy" />}
                <div className="compare-drawer__item-info">
                  <small>{p.brand}</small>
                  <strong>{p.name}</strong>
                </div>
                <button
                  type="button"
                  onClick={() => remove(p.slug)}
                  aria-label={`Remove ${p.name}`}
                  className="compare-drawer__remove"
                  data-cursor="hover"
                >
                  <X size={14} weight="bold" />
                </button>
              </motion.li>
            ))}
            {Array.from({ length: MAX_COMPARE - items.length }).map((_, i) => (
              <li key={`slot-${i}`} className="compare-drawer__slot" aria-hidden="true">
                + Add fan
              </li>
            ))}
          </ul>
          <div className="compare-drawer__cta">
            {items.length >= 2 ? (
              <Link to="/compare" className="btn btn--light compare-drawer__btn" data-cursor="hover">
                <span>Compare {items.length} Fans</span>
                <ArrowRight size={16} weight="light" />
              </Link>
            ) : (
              <span className="compare-drawer__hint">Select 1 more fan to compare</span>
            )}
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
