import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ListChecks, Scales, List, X } from '@phosphor-icons/react';
import Logo from './Logo.jsx';
import FanBlade from '../ui/FanBlade.jsx';
import { useCompare, useEnquiry } from '../../app/stores.jsx';
import { useLenis } from '../../app/SmoothScroll.jsx';

const links = [
  { to: '/', label: 'Home', end: true },
  { to: '/fans', label: 'Fans' },
  { to: '/about', label: 'Our Story' },
  { to: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const enquiry = useEnquiry();
  const compare = useCompare();
  const lenis = useLenis();

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (open) lenis?.stop();
    else lenis?.start();
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open, lenis]);

  return (
    <header className={`navbar ${scrolled ? 'is-scrolled' : ''}`}>
      <div className="navbar__inner container">
        <Logo tone="cream" height={42} />

        <nav className="navbar__links" aria-label="Primary">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className="navbar__link" data-cursor="hover">
              <span>{l.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="navbar__actions">
          <Link to="/compare" className="icon-btn" aria-label={`Compare fans (${compare.items.length})`} data-cursor="hover">
            <Scales size={22} weight="light" />
            {compare.items.length > 0 && <span className="badge">{compare.items.length}</span>}
          </Link>
          <Link to="/enquiry" className="enquiry-pill" aria-label={`Enquiry basket (${enquiry.count} items)`} data-cursor="hover">
            <ListChecks size={20} weight="light" />
            <span className="enquiry-pill__label">Enquiry</span>
            <span className="enquiry-pill__count">{enquiry.count}</span>
          </Link>
          <button className="icon-btn navbar__burger" onClick={() => setOpen((o) => !o)} aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open}>
            {open ? <X size={26} weight="light" /> : <List size={26} weight="light" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            className="mobile-menu dark grain"
            initial={{ clipPath: 'circle(0% at 92% 4%)' }}
            animate={{ clipPath: 'circle(150% at 92% 4%)' }}
            exit={{ clipPath: 'circle(0% at 92% 4%)' }}
            transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
          >
            <FanBlade size={420} className="mobile-menu__fan" speed={22} />
            <nav className="mobile-menu__nav" aria-label="Mobile">
              {links.map((l, i) => (
                <motion.div key={l.to} initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.25 + i * 0.07, duration: 0.6 }}>
                  <NavLink to={l.to} end={l.end} className="mobile-menu__link">
                    {l.label}
                  </NavLink>
                </motion.div>
              ))}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} className="mobile-menu__foot">
                <Link to="/enquiry" className="eyebrow">Enquiry basket · {enquiry.count}</Link>
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
