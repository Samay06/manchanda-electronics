import { Link } from 'react-router-dom';
import { MapPin, Phone, WhatsappLogo, EnvelopeSimple } from '@phosphor-icons/react';
import Logo from './Logo.jsx';
import { site, whatsappLink } from '../../config/site.js';

const cols = [
  {
    title: 'Fans',
    links: [
      ['Ceiling Fans', '/fans/ceiling-fans'],
      ['Table Fans', '/fans/table-fans'],
      ['Pedestal Fans', '/fans/pedestal-fans'],
      ['Wall Fans', '/fans/wall-fans'],
      ['Exhaust Fans', '/fans/exhaust-fans'],
    ],
  },
  {
    title: 'Explore',
    links: [
      ['Which fan for my room?', '/#room-guide'],
      ['Compare fans', '/compare'],
      ['Enquiry basket', '/enquiry'],
      ['Our story', '/about'],
      ['Contact', '/contact'],
    ],
  },
];

export default function Footer() {
  const wa = whatsappLink();
  return (
    <footer className="footer dark grain">
      <div className="container footer__grid">
        <div className="footer__brand">
          <Logo tone="cream" height={74} />
          <p className="footer__tag">Authorized Havells &amp; Orient Stockist</p>
          <p className="footer__blurb">
            Supplying Delhi NCR from Bhagirath Palace, Chandni Chowk since {site.since}. 100% authentic models with company warranty, GST invoices, and direct doorstep delivery.
          </p>
        </div>

        {cols.map((c) => (
          <nav key={c.title} className="footer__col" aria-label={c.title}>
            <h2 className="footer__h">{c.title}</h2>
            <ul>
              {c.links.map(([label, to]) => (
                <li key={to}>
                  <Link to={to} className="footer__link" data-cursor="hover">{label}</Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}

        <div className="footer__col">
          <h2 className="footer__h">Visit us</h2>
          <address className="footer__address">
            <MapPin size={20} weight="light" />
            <span>{site.address}</span>
          </address>
          {site.phone && (
            <a className="footer__contact" href={`tel:${site.phone}`}>
              <Phone size={20} weight="light" /> {site.phone}
            </a>
          )}
          {site.email && (
            <a className="footer__contact" href={`mailto:${site.email}`}>
              <EnvelopeSimple size={20} weight="light" /> {site.email}
            </a>
          )}
          {wa && (
            <a className="footer__contact" href={wa} target="_blank" rel="noreferrer">
              <WhatsappLogo size={20} weight="light" /> Chat on WhatsApp
            </a>
          )}
        </div>
      </div>
      <div className="container footer__base">
        <span>© {new Date().getFullYear()} Manchanda Electricals. All rights reserved.</span>
        <span>Electrical Goods · Home Appliances · Wholesale &amp; Retail</span>
      </div>
    </footer>
  );
}
