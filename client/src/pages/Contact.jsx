import { useState } from 'react';
import {
  MapPin,
  Phone,
  EnvelopeSimple,
  WhatsappLogo,
  Clock,
  Storefront,
  PaperPlaneTilt,
  CheckCircle,
} from '@phosphor-icons/react';
import PageHead from '../components/layout/PageHead.jsx';
import Button from '../components/ui/Button.jsx';
import { site, whatsappLink } from '../config/site.js';
import { api } from '../lib/api.js';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    city: 'Delhi',
    message: '',
    preferredContactTime: 'Anytime',
    website: '', // honeypot
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const wa = whatsappLink(
    'Hello Manchanda Electricals, I am reaching out through your website contact page regarding fan inquiries.'
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');

    try {
      await api.enquire({
        ...formData,
        source: 'contact',
        items: [],
      });
      setSubmitted(true);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to submit enquiry. Please call or message us directly on WhatsApp.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <PageHead
        eyebrow="Wholesale & Retail Desk"
        title="Contact Our Chandni Chowk Showroom"
        lead="Located inside Bhagirath Palace, Asia's premier electrical market. We provide direct trade pricing, technical specifications, and doorstep delivery across Delhi NCR."
        crumbs={[{ label: 'Home', to: '/' }, { label: 'Contact' }]}
      />

      <section className="section section--ivory">
        <div className="container contact-grid">
          {/* Store Info & Logistics */}
          <div className="contact-info">
            <span className="eyebrow">Store Details</span>
            <h2 className="h2" style={{ marginBottom: '1.5rem' }}>
              Manchanda *Electricals*
            </h2>

            <div className="contact-block">
              <MapPin size={28} weight="light" className="contact-block__icon" />
              <div>
                <strong>Shop Address</strong>
                <p>{site.address}</p>
                <small style={{ color: 'var(--text-muted)' }}>Electric Market, Bhagirath Palace</small>
              </div>
            </div>

            <div className="contact-block">
              <Clock size={28} weight="light" className="contact-block__icon" />
              <div>
                <strong>Operating Hours</strong>
                <p>Monday – Saturday: 11:00 AM – 8:00 PM</p>
                <small style={{ color: 'var(--text-muted)' }}>Sunday: Closed (Market Holiday)</small>
              </div>
            </div>

            <div className="contact-block">
              <Phone size={28} weight="light" className="contact-block__icon" />
              <div>
                <strong>Direct Call & Orders</strong>
                <p>{site.phone || '+91 (011) Chandni Chowk Line'}</p>
                <small style={{ color: 'var(--text-muted)' }}>Dedicated support for residential & bulk orders</small>
              </div>
            </div>

            {wa && (
              <div className="contact-block">
                <WhatsappLogo size={28} weight="light" className="contact-block__icon" style={{ color: '#25D366' }} />
                <div>
                  <strong>Instant WhatsApp Chat</strong>
                  <p>
                    <a href={wa} target="_blank" rel="noreferrer" style={{ textDecoration: 'underline' }}>
                      Click to chat directly with store managers
                    </a>
                  </p>
                  <small style={{ color: 'var(--text-muted)' }}>Quickest response for quotes & catalog details</small>
                </div>
              </div>
            )}

            <div className="contact-card-highlight">
              <Storefront size={32} weight="light" />
              <div>
                <strong>Bulk & Institutional Delivery</strong>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Dispatching direct to Delhi NCR, Haryana, UP, and Rajasthan project sites.
                </p>
              </div>
            </div>
          </div>

          {/* Contact Inquiry Form */}
          <div className="contact-form-container">
            <div className="contact-form-card">
              <span className="eyebrow">Send a Message</span>
              <h3 className="h3" style={{ marginBottom: '1.2rem' }}>
                Send your requirement
              </h3>

              {submitted ? (
                <div className="contact-success" role="status">
                  <CheckCircle size={48} weight="light" style={{ color: 'var(--brass-500)' }} />
                  <h4>Message Received</h4>
                  <p>
                    Thank you, {formData.name}. Our representative from Bhagirath Palace will contact you at {formData.phone} shortly.
                  </p>
                  <Button
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({
                        name: '',
                        phone: '',
                        email: '',
                        city: 'Delhi',
                        message: '',
                        preferredContactTime: 'Anytime',
                        website: '',
                      });
                    }}
                    variant="outline"
                  >
                    Send another query
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="contact-form">
                  {errorMsg && <div className="form-error-banner">{errorMsg}</div>}

                  {/* Honeypot field */}
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
                    <label htmlFor="c-name">Your Full Name *</label>
                    <input
                      id="c-name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Rajesh Kumar"
                      className="form-input"
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="c-phone">Contact Phone / WhatsApp *</label>
                      <input
                        id="c-phone"
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+91 98765 43210"
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="c-email">Email Address (Optional)</label>
                      <input
                        id="c-email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="rajesh@example.com"
                        className="form-input"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="c-city">Your City / Location *</label>
                    <input
                      id="c-city"
                      type="text"
                      required
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="e.g. New Delhi, Noida, Gurgaon"
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="c-msg">Requirement / Message</label>
                    <textarea
                      id="c-msg"
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Tell us about the fan models or series you need, expected quantities, or room dimensions..."
                      className="form-textarea"
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    disabled={submitting}
                    icon={<PaperPlaneTilt size={18} weight="light" />}
                  >
                    {submitting ? 'Sending Request...' : 'Submit Message'}
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
