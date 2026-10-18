import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Check,
  Scales,
  ShieldCheck,
  Lightning,
  Wind,
  Gauge,
  ChatCircleDots,
  FilePdf,
  ShareNetwork,
  Truck,
  CheckCircle,
} from '@phosphor-icons/react';
import { api, productPath } from '../lib/api.js';
import { useFetch } from '../hooks/useFetch.js';
import { Breadcrumbs } from '../components/layout/PageHead.jsx';
import Button from '../components/ui/Button.jsx';
import { Skeleton } from '../components/ui/misc.jsx';
import ProductCard from '../components/catalogue/ProductCard.jsx';
import FanBlade from '../components/ui/FanBlade.jsx';
import { useCompare, useEnquiry } from '../app/stores.jsx';
import { whatsappLink, site } from '../config/site.js';

export default function ProductDetail() {
  const { product: slug } = useParams();
  const { data, loading, error } = useFetch(() => api.product(slug), [slug]);
  const [activeImg, setActiveImg] = useState(0);
  const [copied, setCopied] = useState(false);

  const enquiry = useEnquiry();
  const compare = useCompare();

  const p = data?.product;
  const imgs = p?.images || [];
  const inBasket = enquiry.has(p?.slug);
  const inCompare = compare.has(p?.slug);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${p?.brand} ${p?.name} — Manchanda Electricals`,
        text: `Check out ${p?.brand} ${p?.name} at Manchanda Electricals Chandni Chowk`,
        url: window.location.href,
      }).catch(() => { });
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const waEnquiryUrl = p
    ? whatsappLink(
      `Hello Manchanda Electricals, I am interested in inquiring about ${p.brand} ${p.name} (${p.slug}). Could you share wholesale availability?`
    )
    : null;

  if (error) {
    return (
      <section className="section section--ivory">
        <div className="container empty">
          <FanBlade size={80} speed={8} />
          <h1 className="h2">Fan model not found</h1>
          <p className="lead">The requested model could not be found in our catalogue.</p>
          <Button to="/fans" variant="primary">
            Return to Catalogue
          </Button>
        </div>
      </section>
    );
  }

  // Format specs nicely for high-end presentation
  const specsList = [];
  if (p?.specs) {
    const s = p.specs;
    if (s.sweepMm?.length) {
      specsList.push({ icon: Gauge, label: 'Sweep Size', value: s.sweepMm.map((v) => `${v} mm`).join(', ') });
    }
    if (s.airDelivery?.length) {
      specsList.push({ icon: Wind, label: 'Air Delivery', value: s.airDelivery.join(', ') });
    } else if (s.airDeliveryCmm?.length) {
      specsList.push({ icon: Wind, label: 'Air Delivery', value: s.airDeliveryCmm.map((v) => `${v} CMM`).join(', ') });
    }
    if (s.speedRpm?.length) {
      specsList.push({ icon: Lightning, label: 'Rated Speed', value: s.speedRpm.map((v) => `${v} RPM`).join(', ') });
    } else if (s.rpm?.length) {
      specsList.push({ icon: Lightning, label: 'Rated Speed', value: s.rpm.map((v) => `${v} RPM`).join(', ') });
    }
    if (s.powerW?.length) {
      specsList.push({ icon: Lightning, label: 'Power Consumption', value: s.powerW.map((v) => `${v} W`).join(', ') });
    }
    if (s.starRating && s.starRating !== 'NA') {
      specsList.push({ icon: CheckCircle, label: 'BEE Star Rating', value: `${s.starRating} Star Rating` });
    }
    if (s.ledW?.length) {
      specsList.push({ icon: Lightning, label: 'LED Underlight', value: s.ledW.map((v) => `${v} W`).join(', ') });
    }
  }

  return (
    <>
      <section className="section section--ivory pdp-hero">
        <div className="container">
          {p ? (
            <Breadcrumbs
              tone="light"
              crumbs={[
                { label: 'Home', to: '/' },
                { label: 'Fans', to: '/fans' },
                { label: p.categoryName, to: `/fans/${p.category}` },
                { label: p.series, to: `/fans/${p.category}/${p.seriesSlug}` },
                { label: p.name },
              ]}
            />
          ) : (
            <div style={{ height: 24 }} />
          )}

          <div className="pdp-layout">
            {/* Gallery Column */}
            <div className="pdp-gallery">
              <div className="pdp-gallery__stage">
                <FanBlade size={220} className="pdp-gallery__fan-ghost" speed={20} />
                {loading || !p ? (
                  <Skeleton style={{ width: '100%', height: '100%' }} />
                ) : (
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={imgs[activeImg]?.path || 'fallback'}
                      layoutId={`img-${p.slug}`}
                      src={imgs[activeImg]?.path}
                      alt={`${p.brand} ${p.name}`}
                      className="pdp-gallery__main-img"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    />
                  </AnimatePresence>
                )}
                {imgs[activeImg]?.caption && (
                  <span className="pdp-gallery__caption">{imgs[activeImg].caption}</span>
                )}
              </div>

              {/* Thumbnails */}
              {imgs.length > 1 && (
                <div className="pdp-thumbs" role="tablist" aria-label="Product image gallery">
                  {imgs.map((im, i) => (
                    <button
                      key={im.path}
                      type="button"
                      role="tab"
                      aria-selected={i === activeImg}
                      className={`pdp-thumb ${i === activeImg ? 'is-active' : ''}`}
                      onClick={() => setActiveImg(i)}
                      data-cursor="hover"
                    >
                      <img src={im.path} alt="" loading="lazy" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Info Column */}
            <div className="pdp-info">
              {loading || !p ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                  <Skeleton style={{ height: 20, width: '35%' }} />
                  <Skeleton style={{ height: 48, width: '80%' }} />
                  <Skeleton style={{ height: 90, width: '100%' }} />
                  <Skeleton style={{ height: 60, width: '50%' }} />
                </div>
              ) : (
                <>
                  <div className="pdp-info__meta">
                    <span className="eyebrow">
                      {p.brand} · {p.categoryName}
                    </span>
                    <button
                      type="button"
                      className="pdp-share-btn"
                      onClick={handleShare}
                      title="Share product link"
                      data-cursor="hover"
                    >
                      <ShareNetwork size={18} weight="light" />
                      <span>{copied ? 'Link Copied!' : 'Share'}</span>
                    </button>
                  </div>

                  <h1 className="display pdp-info__name">{p.name}</h1>

                  {p.tagline && <p className="pdp-info__tagline">{p.tagline}</p>}

                  <p className="lead pdp-info__description">{p.description}</p>

                  {/* Warranty & Guarantee Card */}
                  <div className="pdp-badge-box">
                    <ShieldCheck size={36} weight="light" className="pdp-badge-box__icon" />
                    <div>
                      <small className="pdp-badge-box__label">Manufacturer Warranty</small>
                      <strong className="pdp-badge-box__val">
                        {p.warranty ? `${p.warranty} Official Brand Warranty` : 'Enquire for Warranty Coverage'}
                      </strong>
                      {p.warrantyNote && <span className="pdp-badge-box__note">{p.warrantyNote}</span>}
                    </div>
                  </div>

                  {/* Actions: Add to Enquiry & Compare */}
                  <div className="pdp-actions">
                    <Button
                      variant={inBasket ? 'light' : 'primary'}
                      onClick={() => enquiry.add(p)}
                      icon={inBasket ? <Check size={18} weight="bold" /> : <Plus size={18} weight="light" />}
                      className="pdp-actions__main"
                    >
                      {inBasket ? 'Added to Enquiry Basket' : 'Add to Enquiry Basket'}
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() => compare.toggle(p)}
                      icon={<Scales size={18} weight="light" />}
                    >
                      {inCompare ? 'In Comparison' : 'Compare Model'}
                    </Button>

                    {waEnquiryUrl && (
                      <a
                        href={waEnquiryUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn--outline-whatsapp"
                        data-cursor="hover"
                      >
                        <ChatCircleDots size={20} weight="light" />
                        <span>Quick WhatsApp Inquiry</span>
                      </a>
                    )}
                  </div>

                  {/* Highlights / Features list */}
                  {p.features?.length > 0 && (
                    <div className="pdp-features">
                      <h3 className="pdp-section-title">Key Specifications & Features</h3>
                      <ul className="pdp-features__list">
                        {p.features.map((feat, idx) => (
                          <li key={idx}>
                            <CheckCircle size={16} weight="bold" className="pdp-feature-icon" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Direct Delivery Note */}
                  <div className="pdp-trust-note">
                    <Truck size={22} weight="light" />
                    <span>
                      Direct Delhi NCR home delivery & Chandni Chowk wholesale rates available for bulk orders.
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Technical Specifications Matrix */}
          {specsList.length > 0 && (
            <div className="pdp-specs-block">
              <h2 className="h3 pdp-specs-block__title">Technical Specifications</h2>
              <div className="pdp-specs-grid">
                {specsList.map(({ icon: Icon, label, value }) => (
                  <div key={label} className="pdp-spec-card">
                    <Icon size={24} weight="light" className="pdp-spec-card__icon" />
                    <span className="pdp-spec-card__label">{label}</span>
                    <strong className="pdp-spec-card__value">{value}</strong>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Cross-linking: More in this series */}
      {data?.moreInSeries?.length > 0 && (
        <section className="section section--cream pdp-series-section">
          <div className="container">
            <div className="section-head section-head--split">
              <div>
                <span className="eyebrow">Series Collection</span>
                <h2 className="h2">
                  More in the {p?.series} Series
                </h2>
              </div>
              <Button to={`/fans/${p?.category}/${p?.seriesSlug}`} variant="outline">
                View all in {p?.series}
              </Button>
            </div>
            <div className="grid grid--products">
              {data.moreInSeries.slice(0, 4).map((item, idx) => (
                <ProductCard key={item.slug} product={item} index={idx} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Cross-linking: Related fans in the category */}
      {data?.related?.length > 0 && (
        <section className={`section ${data?.moreInSeries?.length > 0 ? 'section--ivory' : 'section--cream'} pdp-related`}>
          <div className="container">
            <div className="section-head">
              <span className="eyebrow">Explore Alternatives</span>
              <h2 className="h2">Related {p?.categoryName}</h2>
            </div>
            <div className="grid grid--products">
              {data.related.slice(0, 4).map((item, idx) => (
                <ProductCard key={item.slug} product={item} index={idx} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
