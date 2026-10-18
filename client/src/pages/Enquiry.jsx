import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ListChecks,
  Trash,
  Plus,
  Minus,
  WhatsappLogo,
  PaperPlaneTilt,
  CheckCircle,
  ArrowRight,
  ShieldCheck,
  Truck,
  Storefront,
} from '@phosphor-icons/react';
import PageHead from '../components/layout/PageHead.jsx';
import Button from '../components/ui/Button.jsx';
import FanBlade from '../components/ui/FanBlade.jsx';
import { useEnquiry } from '../app/stores.jsx';
import { api, productPath } from '../lib/api.js';
import { site, whatsappLink } from '../config/site.js';

export default function Enquiry() {
  const enquiry = useEnquiry();
  const { items, updateQuantity, remove, clear, count } = enquiry;

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    city: 'Delhi',
    orderType: 'Residential / Home',
    notes: '',
    website: '', // honeypot
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const generateWhatsAppMessage = () => {
    let msg = `*New Wholesale Fan Enquiry — Manchanda Electricals*\n`;
    msg += `Name: ${formData.name || 'Customer'}\n`;
    msg += `Phone: ${formData.phone || 'Not provided'}\n`;
    msg += `City: ${formData.city}\n`;
    msg += `Requirement Type: ${formData.orderType}\n\n`;
    msg += `*Requested Models:*\n`;

    items.forEach((it, idx) => {
      msg += `${idx + 1}. ${it.brand} ${it.name} (${it.categoryName || 'Fan'})\n   Qty: ${it.quantity} units\n`;
    });

    if (formData.notes) {
      msg += `\n*Additional Notes:* ${formData.notes}\n`;
    }

    return whatsappLink(msg);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (items.length === 0) {
      setErrorMsg('Please add at least one fan model to your enquiry basket.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      await api.enquire({
        ...formData,
        source: 'basket',
        items: items.map((it) => ({
          productId: it.id || it._id,
          name: it.name,
          brand: it.brand,
          slug: it.slug,
          category: it.category,
          quantity: it.quantity,
        })),
      });
      setSubmitted(true);
      clear();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to submit enquiry. Please use WhatsApp or call us directly.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <>
        <PageHead
          eyebrow="Enquiry Confirmed"
          title="Enquiry Received"
          lead="Our sales counter at Bhagirath Palace, Chandni Chowk has received your requirement."
          crumbs={[{ label: 'Home', to: '/' }, { label: 'Enquiry' }]}
        />
        <section className="section section--ivory">
          <div className="container empty" style={{ maxWidth: 640 }}>
            <CheckCircle size={64} weight="light" style={{ color: 'var(--brass-500)', marginBottom: '1rem' }} />
            <h2 className="h2" style={{ marginBottom: '1rem' }}>
              Thank you, {formData.name}
            </h2>
            <p className="lead" style={{ marginBottom: '2rem' }}>
              We will review the availability and prepare our best Chandni Chowk wholesale pricing for your order. A representative will contact you at <strong>{formData.phone}</strong> shortly.
            </p>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              <Button to="/fans" variant="primary">
                Continue Browsing Fans
              </Button>
              <Button to="/" variant="outline">
                Back to Home
              </Button>
            </div>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <PageHead
        eyebrow="Direct Trade Desk"
        title="Wholesale Enquiry Basket"
        lead="Review your chosen fan models, specify the quantities required, and submit for direct Chandni Chowk trade pricing."
        crumbs={[{ label: 'Home', to: '/' }, { label: 'Enquiry Basket' }]}
      />

      <section className="section section--ivory">
        <div className="container">
          {items.length === 0 ? (
            <div className="empty">
              <FanBlade size={90} speed={10} />
              <h2 className="h3">Your enquiry basket is currently empty</h2>
              <p className="lead" style={{ maxWidth: '44ch' }}>
                Explore our catalogue of Havells and Orient fans and click "Add to Enquiry" on the models you need for your space or project.
              </p>
              <Button to="/fans" variant="primary" icon={<ArrowRight size={18} weight="light" />}>
                Browse Fan Catalogue
              </Button>
            </div>
          ) : (
            <div className="enquiry-layout">
              {/* Items List Column */}
              <div className="enquiry-items-col">
                <div className="enquiry-list-head">
                  <div>
                    <h2 className="h3">Selected Models ({count} units)</h2>
                    <span className="enquiry-list-sub">
                      {items.length} {items.length === 1 ? 'model' : 'models'} selected
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={clear}
                    className="enquiry-clear-btn"
                    data-cursor="hover"
                  >
                    <Trash size={16} weight="light" />
                    <span>Clear Basket</span>
                  </button>
                </div>

                <div className="enquiry-list">
                  {items.map((item) => (
                    <div key={item.slug} className="enquiry-card">
                      <div className="enquiry-card__img-wrap">
                        {item.images?.[0]?.path ? (
                          <img src={item.images[0].path} alt={item.name} className="enquiry-card__img" />
                        ) : (
                          <FanBlade size={50} speed={8} />
                        )}
                      </div>

                      <div className="enquiry-card__details">
                        <small className="enquiry-card__brand">{item.brand}</small>
                        <h3 className="enquiry-card__name">
                          <Link to={productPath(item)} data-cursor="hover">
                            {item.name}
                          </Link>
                        </h3>
                        <span className="enquiry-card__meta">
                          {item.categoryName} · {item.series} Series
                        </span>
                        {item.warranty && (
                          <span className="enquiry-card__warranty">
                            <ShieldCheck size={14} weight="light" /> {item.warranty} Warranty
                          </span>
                        )}
                      </div>

                      <div className="enquiry-card__actions">
                        <div className="enquiry-stepper" role="group" aria-label="Item quantity">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.slug, Math.max(1, (item.quantity || 1) - 1))}
                            className="enquiry-stepper__btn"
                            aria-label="Decrease quantity"
                            disabled={(item.quantity || 1) <= 1}
                            data-cursor="hover"
                          >
                            <Minus size={14} weight="bold" />
                          </button>
                          <span className="enquiry-stepper__val">{item.quantity || 1}</span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.slug, (item.quantity || 1) + 1)}
                            className="enquiry-stepper__btn"
                            aria-label="Increase quantity"
                            data-cursor="hover"
                          >
                            <Plus size={14} weight="bold" />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => remove(item.slug)}
                          className="enquiry-card__del"
                          aria-label={`Remove ${item.name} from basket`}
                          title="Remove from basket"
                          data-cursor="hover"
                        >
                          <Trash size={18} weight="light" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="enquiry-trust-banner">
                  <div className="enquiry-trust-item">
                    <Storefront size={24} weight="light" />
                    <div>
                      <strong>Direct Trade Billing</strong>
                      <p>Official GST invoice with manufacturer warranty cards.</p>
                    </div>
                  </div>
                  <div className="enquiry-trust-item">
                    <Truck size={24} weight="light" />
                    <div>
                      <strong>Delhi NCR Doorstep Delivery</strong>
                      <p>Carefully dispatched from Bhagirath Palace.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Column */}
              <div className="enquiry-form-col">
                <div className="enquiry-form-card">
                  <span className="eyebrow">Price Quotation</span>
                  <h3 className="h3" style={{ marginBottom: '1.2rem' }}>
                    Request Trade Quote
                  </h3>

                  {errorMsg && <div className="form-error-banner">{errorMsg}</div>}

                  <form onSubmit={handleSubmit} className="contact-form">
                    <input
                      type="text"
                      name="website"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      style={{ display: 'none' }}
                      tabIndex={-1}
                      autoComplete="off"
                    />

                    <div className="form-group">
                      <label htmlFor="eq-name">Full Name *</label>
                      <input
                        id="eq-name"
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Arun Sharma"
                        className="form-input"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="eq-phone">Contact Phone / WhatsApp *</label>
                      <input
                        id="eq-phone"
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+91 98100 12345"
                        className="form-input"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="eq-city">City / Delivery Location *</label>
                      <input
                        id="eq-city"
                        type="text"
                        required
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        placeholder="e.g. Delhi, Noida, Gurgaon, Ghaziabad"
                        className="form-input"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="eq-type">Enquiry Type</label>
                      <select
                        id="eq-type"
                        value={formData.orderType}
                        onChange={(e) => setFormData({ ...formData, orderType: e.target.value })}
                        className="form-input"
                      >
                        <option value="Residential / Home">Residential / Home Renovation</option>
                        <option value="Electrical Contractor">Electrical Contractor / Trade</option>
                        <option value="Interior Designer / Architect">Interior Designer / Architect</option>
                        <option value="Institutional / Factory">Commercial / Factory / Office</option>
                        <option value="Retail Purchase">Individual Retail Purchase</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label htmlFor="eq-notes">Notes or Delivery Instructions</label>
                      <textarea
                        id="eq-notes"
                        rows={3}
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        placeholder="Mention required timeline, blade colors, or any specific models needed..."
                        className="form-textarea"
                      />
                    </div>

                    <div className="enquiry-submit-stack">
                      <Button
                        type="submit"
                        variant="primary"
                        disabled={submitting}
                        icon={<PaperPlaneTilt size={18} weight="light" />}
                        className="btn--full"
                      >
                        {submitting ? 'Submitting Enquiry...' : 'Submit Official Enquiry'}
                      </Button>

                      <a
                        href={generateWhatsAppMessage()}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn--outline-whatsapp btn--full"
                        data-cursor="hover"
                      >
                        <WhatsappLogo size={20} weight="light" />
                        <span>Fast-Track on WhatsApp</span>
                      </a>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
