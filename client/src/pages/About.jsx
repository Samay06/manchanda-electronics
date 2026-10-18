import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Storefront,
  ShieldCheck,
  Truck,
  Medal,
  UsersThree,
  MapPin,
  Clock,
  ArrowRight,
} from '@phosphor-icons/react';
import PageHead from '../components/layout/PageHead.jsx';
import Button from '../components/ui/Button.jsx';
import FanBlade from '../components/ui/FanBlade.jsx';
import { CountUp } from '../components/ui/misc.jsx';
import { site, yearsInBusiness } from '../config/site.js';

export default function About() {
  const milestones = [
    {
      year: '1983',
      title: 'Founded in Bhagirath Palace',
      text: 'Manchanda Electricals opened its doors in Delhi’s premier electrical trading hub, focused on delivering genuine electrical goods at uncompromised value.',
    },
    {
      year: '1990s',
      title: 'Wholesale & Institutional Growth',
      text: 'Established lasting relationships with leading builders, contractors and retail shops across North India, supplying authentic equipment for landmark residential projects.',
    },
    {
      year: '2010s',
      title: 'Authorised Dual-Brand Showroom',
      text: 'Deepened partnerships with Havells India and Orient Electric, bringing their entire consumer and industrial cooling catalog directly under one roof.',
    },
    {
      year: 'Today',
      title: '43+ Years of Daily Service',
      text: 'Now serving second-generation families and modern enterprises with direct doorstep delivery, wholesale pricing transparency, and personalized bulk advisory.',
    },
  ];

  return (
    <>
      <PageHead
        eyebrow="Our Heritage"
        title="Over Four Decades in Chandni Chowk"
        lead="Since 1983, Manchanda Electricals has supplied Delhi NCR with genuine Havells and Orient cooling appliances, backed by official warranties and honest wholesale rates."
        crumbs={[{ label: 'Home', to: '/' }, { label: 'Our Story' }]}
      />

      {/* Philosophy Section */}
      <section className="section section--ivory about-story">
        <div className="container about-story__grid">
          <div className="about-story__text">
            <span className="eyebrow">The Manchanda Legacy</span>
            <h2 className="display" style={{ fontSize: 'clamp(2.2rem, 4vw, 3.8rem)' }}>
              Built on genuine brands and market wholesale rates
            </h2>
            <p className="lead">
              Nestled inside the historic Bhagirath Palace electrical market, our business was founded on a simple
              conviction: that homeowners and project contractors deserve genuine manufacturer products with zero
              compromise on warranty or safety.
            </p>
            <p style={{ color: 'var(--text-muted)', lineHeight: '1.8' }}>
              Unlike modern retail department stores that inflate showroom margins, Manchanda Electricals operates
              straight out of the capital’s wholesale center. That means every ceiling fan, BLDC smart appliance, and
              industrial circulator we supply comes with authentic manufacturer backed warranties and direct-from-market
              pricing.
            </p>
            <div style={{ marginTop: '1rem' }}>
              <Button to="/fans" variant="primary" icon={<ArrowRight size={18} weight="light" />}>
                Explore Our Fan Catalogue
              </Button>
            </div>
          </div>

          <div className="about-story__visual">
            <div className="about-badge-card dark grain">
              <FanBlade size={180} speed={12} className="about-badge-card__fan" />
              <div className="about-badge-card__content">
                <span className="about-badge-card__number">
                  <CountUp to={yearsInBusiness} />
                </span>
                <span className="about-badge-card__tag">Years of Unbroken Service</span>
                <p style={{ fontSize: '0.85rem', color: 'var(--sand-300)' }}>
                  Serving Delhi NCR homeowners, electrical contractors, and institutional buyers since {site.since}.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Brand Values Grid */}
      <section className="section section--cream">
        <div className="container">
          <div className="section-head section-head--split">
            <div>
              <span className="eyebrow">Trade Standards</span>
              <h2 className="h2">Principles behind every order</h2>
            </div>
            <p className="lead">
              Whether you are purchasing two BLDC ceiling fans for your residence or sixty industrial circulators for a commercial facility, our service standards remain identical.
            </p>
          </div>

          <div className="grid grid--products" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
            <div className="about-pillar">
              <Storefront size={36} weight="light" className="about-pillar__icon" />
              <h3>Direct Wholesale Rates</h3>
              <p>Direct Chandni Chowk trade pricing without intermediate showroom commissions.</p>
            </div>
            <div className="about-pillar">
              <ShieldCheck size={36} weight="light" className="about-pillar__icon" />
              <h3>100% Genuine Brands</h3>
              <p>Authorized Havells and Orient Electric supplies backed by official manufacturer warranty cards.</p>
            </div>
            <div className="about-pillar">
              <Truck size={36} weight="light" className="about-pillar__icon" />
              <h3>Doorstep Delivery</h3>
              <p>Secure transit and prompt dispatch directly from Bhagirath Palace to your home or project site.</p>
            </div>
            <div className="about-pillar">
              <Medal size={36} weight="light" className="about-pillar__icon" />
              <h3>Technical Consultation</h3>
              <p>Experienced guidance on room airflow, motor wattage, BLDC savings, and blade sweep selection.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline of Milestones */}
      <section className="section section--ivory">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Our History</span>
            <h2 className="h2">Milestones Across Four Decades</h2>
          </div>

          <div className="about-timeline">
            {milestones.map((m, idx) => (
              <div key={m.year} className="about-timeline-item">
                <div className="about-timeline-item__year">{m.year}</div>
                <div className="about-timeline-item__content">
                  <h3>{m.title}</h3>
                  <p>{m.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Store Location Prompt */}
      <section className="cta dark grain">
        <div className="container cta__inner">
          <span className="eyebrow">Visit Bhagirath Palace</span>
          <h2 className="display cta__title">Visit our wholesale counter</h2>
          <p className="lead" style={{ maxWidth: '48ch' }}>
            {site.address}
          </p>
          <div className="cta__buttons">
            <Button to="/contact" variant="light">
              Store Timings &amp; Directions
            </Button>
            <Button to="/enquiry" variant="outline-light">
              Submit Bulk Enquiry
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
