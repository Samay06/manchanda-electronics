import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, ArrowUpRight, ShieldCheck, Truck, Package, Tag, Fan } from '@phosphor-icons/react';
import Button from '../components/ui/Button.jsx';
import FanBlade from '../components/ui/FanBlade.jsx';
import { Marquee, CountUp } from '../components/ui/misc.jsx';
import { Reveal, RevealImage, SplitHeading, Stagger, Item } from '../components/ui/Reveal.jsx';
import ProductCard, { ProductCardSkeleton } from '../components/catalogue/ProductCard.jsx';
import RoomGuide from '../features/home/RoomGuide.jsx';
import { api } from '../lib/api.js';
import { site, yearsInBusiness } from '../config/site.js';
import { useFetch } from '../hooks/useFetch.js';
import { useReducedMotion } from '../hooks/useMedia.js';

const FEATURED = ['orient-aerosilent', 'havells-stealth-neo-bldc', 'orient-aero-o2', 'havells-enticer-art-hs-hues-edition'];

function Hero({ hero }) {
  const reduced = useReducedMotion();
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 700], [0, reduced ? 0 : 90]);
  const rot = useTransform(scrollY, [0, 1200], [0, reduced ? 0 : 160]);
  const img = hero?.images?.[0];

  return (
    <section className="hero dark grain" aria-labelledby="hero-title">
      <motion.div className="hero__bgfan" style={{ rotate: rot }} aria-hidden="true">
        <FanBlade size={900} spin={false} blades={3} />
      </motion.div>

      <div className="container hero__grid">
        <div className="hero__copy">
          <motion.span className="eyebrow" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 2, duration: 0.7 }}>
            Bhagirath Palace, Chandni Chowk · Est. {site.since}
          </motion.span>
          <h1 id="hero-title" className="display hero__title">
            <span className="split-word"><motion.span className="split-word__inner" initial={{ y: '110%' }} animate={{ y: 0 }} transition={{ delay: 2.05, duration: 1, ease: [0.22, 1, 0.36, 1] }}>Havells &amp; Orient Fans</motion.span></span>
            <br />
            <span className="split-word"><motion.span className="split-word__inner" initial={{ y: '110%' }} animate={{ y: 0 }} transition={{ delay: 2.2, duration: 1, ease: [0.22, 1, 0.36, 1] }}>at Wholesale Rates</motion.span></span>
          </h1>
          <motion.p className="lead hero__lead" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2.5, duration: 0.8 }}>
            Direct wholesale and retail pricing on 215+ genuine Havells and Orient ceiling, BLDC, wall, pedestal, and exhaust fans. Complete with official company warranty, GST invoices, and prompt delivery across Delhi NCR.
          </motion.p>
          <motion.div className="hero__cta" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2.7, duration: 0.8 }}>
            <Button to="/fans" variant="light" icon={<ArrowRight size={18} weight="light" />}>Browse All Fans</Button>
            <Button to="/enquiry" variant="outline-light">Request Trade Quote</Button>
          </motion.div>
        </div>

        <motion.div className="hero__visual" style={{ y }}>
          <div className="hero__plate" aria-hidden="true" />
          {img && (
            <motion.img
              src={img.path}
              alt={`${hero.brand} ${hero.name} ceiling fan`}
              className="hero__fan-img"
              initial={{ opacity: 0, scale: 0.9, rotate: -6 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ delay: 2.2, duration: 1.3, ease: [0.22, 1, 0.36, 1] }}
              fetchPriority="high"
            />
          )}
          {hero && (
            <motion.div className="hero__tag" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 3, duration: 0.7 }}>
              <small>{hero.brand}</small>
              <strong>{hero.name}</strong>
              <Link to={`/fans/${hero.category}/${hero.seriesSlug}/${hero.slug}`} data-cursor="hover" aria-label={`View ${hero.name}`}>
                View specs <ArrowUpRight size={14} weight="light" />
              </Link>
            </motion.div>
          )}
        </motion.div>
      </div>

      <div className="hero__scroll" aria-hidden="true"><span /> Scroll</div>
    </section>
  );
}

function Heritage({ counts }) {
  const stats = [
    { n: yearsInBusiness, suffix: '', label: 'Years in Chandni Chowk', note: `Serving Delhi NCR since ${site.since}` },
    { n: counts.products || 215, suffix: '+', label: 'Models in stock', note: 'Ceiling, BLDC, wall, pedestal & exhaust' },
    { n: 2, suffix: '', label: 'Authorized brands', note: 'Havells India & Orient Electric' },
    { n: 100, suffix: '%', label: 'Genuine with warranty', note: 'Original cartons & GST billing' },
  ];
  return (
    <section className="heritage section--cream" aria-label="Heritage">
      <div className="container">
        <Stagger className="heritage__grid">
          {stats.map((s) => (
            <Item key={s.label} className="heritage__stat">
              <span className="heritage__num"><CountUp to={s.n} suffix={s.suffix} /></span>
              <span className="heritage__label">{s.label}</span>
              <span className="heritage__note">{s.note}</span>
            </Item>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

function Promises() {
  const items = [
    { icon: Tag, title: 'Chandni Chowk wholesale rates', text: 'Direct market pricing without multi-tier middleman markups.' },
    { icon: ShieldCheck, title: 'Authorized brand warranty', text: '100% genuine Havells & Orient models with official manufacturer warranty.' },
    { icon: Package, title: 'Contractor & bulk pricing', text: 'Special slab rates for electrical contractors, interior designers, and institutions.' },
    { icon: Truck, title: 'Doorstep dispatch', text: 'Careful packing and reliable transport across Delhi, Noida, Gurgaon, and NCR.' },
  ];
  return (
    <section className="section section--ivory promises" aria-label="Why Manchanda Electricals">
      <div className="container">
        <Stagger className="promises__grid" gap={0.1}>
          {items.map(({ icon: Icon, title, text }) => (
            <Item key={title} className="promise">
              <Icon size={40} weight="light" />
              <h3>{title}</h3>
              <p>{text}</p>
            </Item>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

function Categories({ cats }) {
  return (
    <section className="section section--ivory" aria-labelledby="cats-title">
      <div className="container">
        <div className="section-head section-head--split">
          <div>
            <Reveal><span className="eyebrow">Catalogue directory</span></Reveal>
            <SplitHeading as="h2" className="h2" text="Explore fans by category" />
          </div>
          <Reveal delay={2}><p className="lead">From energy-efficient BLDC ceiling fans for bedrooms to heavy-duty industrial circulators, find the exact model, sweep size, and color for your space.</p></Reveal>
        </div>
        <ul className="cats" id="cats-title">
          {cats.map((c, i) => (
            <motion.li
              key={c.slug}
              className={`cat ${i === 0 ? 'cat--wide' : ''}`}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '0px 0px -8% 0px' }}
              transition={{ duration: 0.8, delay: (i % 3) * 0.08, ease: [0.22, 1, 0.36, 1] }}
            >
              <Link to={`/fans/${c.slug}`} className="cat__link fan-hover" data-cursor="hover">
                <span className="cat__no">{String(i + 1).padStart(2, '0')}</span>
                <FanBlade size={110} className="cat__ghost" speed={12} />
                {c.cover && <img src={c.cover} alt="" loading="lazy" decoding="async" className="cat__img" />}
                <div className="cat__text">
                  <h3>{c.name}</h3>
                  <span className="cat__meta">{c.productCount} models · {c.subCategories.length > 1 ? `${c.subCategories.length} types` : 'All brands'}</span>
                </div>
                <span className="cat__arrow"><ArrowUpRight size={22} weight="light" /></span>
              </Link>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Brands() {
  const names = ['HAVELLS', 'ORIENT ELECTRIC', 'HAVELLS', 'ORIENT ELECTRIC'];
  return (
    <section className="brands dark" aria-label="Brands we carry">
      <Marquee items={names.map((n, i) => <span key={i} className="brands__name">{n}</span>)} speed={40} />
    </section>
  );
}

function Featured({ items, loading }) {
  return (
    <section className="section section--ivory" aria-labelledby="featured-title">
      <div className="container">
        <div className="section-head section-head--split">
          <div>
            <Reveal><span className="eyebrow">Showroom selection</span></Reveal>
            <SplitHeading as="h2" className="h2" text="Popular BLDC & high-delivery fans" />
          </div>
          <Reveal delay={2}><div><Button to="/fans" variant="outline" icon={<ArrowRight size={18} weight="light" />}>View all 215+ models</Button></div></Reveal>
        </div>
        <div className="grid grid--products" id="featured-title">
          {loading ? Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />) : items.map((p, i) => <ProductCard key={p.slug} product={p} index={i} />)}
        </div>
      </div>
    </section>
  );
}

function EnquiryCta() {
  return (
    <section className="cta dark grain" aria-labelledby="cta-title">
      <FanBlade size={620} className="cta__fan" speed={26} blades={3} />
      <div className="container cta__inner">
        <Reveal><span className="eyebrow">Trade counter · Bhagirath Palace</span></Reveal>
        <SplitHeading as="h2" className="display cta__title" text="Need fans for a renovation or project?" />
        <Reveal delay={3}>
          <p className="lead">Submit your model list or contact our wholesale desk directly. We provide prompt wholesale quotes, GST invoices, and scheduled deliveries.</p>
        </Reveal>
        <Reveal delay={4}>
          <div className="cta__buttons">
            <Button to="/enquiry" variant="light" icon={<ArrowRight size={18} weight="light" />}>View enquiry basket</Button>
            <Button to="/contact" variant="outline-light">Store details &amp; directions</Button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export default function Home() {
  const { data: cats } = useFetch(api.categories, []);
  const [covers, setCovers] = useState({});
  const [featured, setFeatured] = useState({ items: [], loading: true });
  const [hero, setHero] = useState(null);
  const { data: brands } = useFetch(api.brands, []);

  useEffect(() => {
    let alive = true;
    Promise.all(FEATURED.map((s) => api.product(s).then((r) => r.product).catch(() => null))).then((rs) => {
      if (!alive) return;
      const ok = rs.filter(Boolean);
      setFeatured({ items: ok, loading: false });
      setHero(ok[0] || null);
    });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (!cats) return undefined;
    let alive = true;
    Promise.all(
      cats.map((c) => api.products({ category: c.slug, limit: 12 }).then((r) => {
        const best = r.items.find((p) => p.images?.[0]?.width >= 500) || r.items[0];
        return [c.slug, best?.images?.[0]?.path];
      }).catch(() => [c.slug, null])),
    ).then((pairs) => alive && setCovers(Object.fromEntries(pairs)));
    return () => {
      alive = false;
    };
  }, [cats]);

  const total = brands ? brands.reduce((s, b) => s + b.count, 0) : 0;
  const catList = (cats || []).map((c) => ({ ...c, cover: covers[c.slug] }));

  return (
    <>
      <Hero hero={hero} />
      <Heritage counts={{ products: total }} />
      <Categories cats={catList} />
      <Brands />
      <Promises />
      <RoomGuide />
      <Featured items={featured.items} loading={featured.loading} />
      <EnquiryCta />
    </>
  );
}
