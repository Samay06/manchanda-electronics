import { useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from '../components/layout/Navbar.jsx';
import Footer from '../components/layout/Footer.jsx';
import DiwaliRibbon from '../components/layout/DiwaliRibbon.jsx';
import CustomCursor from '../components/layout/CustomCursor.jsx';
import Loader from '../components/layout/Loader.jsx';
import ScrollIndicator from '../components/layout/ScrollIndicator.jsx';
import CompareDrawer from '../components/catalogue/CompareDrawer.jsx';
import { useLenis } from './SmoothScroll.jsx';
import { pageVariants } from '../lib/motion.js';
import Home from '../pages/Home.jsx';
import Fans from '../pages/Fans.jsx';
import Listing from '../pages/Listing.jsx';
import ProductDetail from '../pages/ProductDetail.jsx';
import Compare from '../pages/Compare.jsx';
import About from '../pages/About.jsx';
import Contact from '../pages/Contact.jsx';
import Enquiry from '../pages/Enquiry.jsx';
import { NotFound, StyleGuide } from '../pages/Stubs.jsx';

function ScrollManager() {
  const { pathname } = useLocation();
  const lenis = useLenis();
  useEffect(() => {
    if (window.location.hash) return;
    lenis?.scrollTo(0, { immediate: true });
    window.scrollTo(0, 0);
  }, [pathname, lenis]);
  return null;
}

export default function App() {
  const location = useLocation();
  return (
    <>
      <a href="#main" className="skip-link">Skip to content</a>
      <Loader />
      <CustomCursor />
      <ScrollManager />
      <div className="top-chrome">
        <DiwaliRibbon />
        <Navbar />
      </div>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.main
          id="main"
          key={location.pathname}
          className="page"
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          <Routes location={location}>
            <Route path="/" element={<Home />} />
            <Route path="/fans" element={<Fans />} />
            <Route path="/fans/:category" element={<Listing />} />
            <Route path="/fans/:category/:series" element={<Listing />} />
            <Route path="/fans/:category/:series/:product" element={<ProductDetail />} />
            <Route path="/compare" element={<Compare />} />
            <Route path="/enquiry" element={<Enquiry />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/styleguide" element={<StyleGuide />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Footer />
        </motion.main>
      </AnimatePresence>
      <CompareDrawer />
      <ScrollIndicator />
    </>
  );
}
