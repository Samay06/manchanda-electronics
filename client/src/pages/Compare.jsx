import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Scales,
  Trash,
  Plus,
  Check,
  ShieldCheck,
  Wind,
  Gauge,
  Lightning,
  X,
  ArrowRight,
} from '@phosphor-icons/react';
import PageHead from '../components/layout/PageHead.jsx';
import Button from '../components/ui/Button.jsx';
import FanBlade from '../components/ui/FanBlade.jsx';
import { useCompare, useEnquiry } from '../app/stores.jsx';
import { useFetch } from '../hooks/useFetch.js';
import { api, productPath } from '../lib/api.js';

export default function Compare() {
  const { items: compareList, remove, clear } = useCompare();
  const enquiry = useEnquiry();

  // Fetch full details of all compared models for specs
  const { data: fullProducts, loading } = useFetch(async () => {
    if (!compareList.length) return [];
    const results = await Promise.all(
      compareList.map((item) => api.product(item.slug).then((r) => r.product).catch(() => null))
    );
    return results.filter(Boolean);
  }, [compareList]);

  if (compareList.length === 0) {
    return (
      <>
        <PageHead
          eyebrow="Model Comparison"
          title="Compare Fan Models"
          lead="Examine design, air delivery, sweep dimensions, and warranty side by side."
          crumbs={[{ label: 'Home', to: '/' }, { label: 'Compare' }]}
        />
        <section className="section section--ivory">
          <div className="container empty">
            <FanBlade size={90} speed={10} />
            <h2 className="h3">No fans added to comparison</h2>
            <p className="lead" style={{ maxWidth: '44ch' }}>
              Browse the catalogue and click the scale icon on any fan card to compare up to 3 models side by side.
            </p>
            <Button to="/fans" variant="primary" icon={<ArrowRight size={18} weight="light" />}>
              Explore the Collection
            </Button>
          </div>
        </section>
      </>
    );
  }

  const specRows = [
    {
      title: 'Brand',
      render: (p) => <strong>{p.brand}</strong>,
    },
    {
      title: 'Category & Series',
      render: (p) => (
        <span>
          {p.categoryName} <br />
          <small style={{ color: 'var(--text-muted)' }}>{p.series} Series</small>
        </span>
      ),
    },
    {
      title: 'Warranty',
      render: (p) => (
        <span className="compare-warranty">
          <ShieldCheck size={20} weight="light" />
          <span>{p.warranty ? `${p.warranty} Warranty` : 'Enquire for details'}</span>
        </span>
      ),
    },
    {
      title: 'Sweep Sizes',
      render: (p) =>
        p.specs?.sweepMm?.length ? (
          <span className="compare-spec-val">{p.specs.sweepMm.map((v) => `${v} mm`).join(', ')}</span>
        ) : (
          '—'
        ),
    },
    {
      title: 'Air Delivery',
      render: (p) => {
        if (p.specs?.airDelivery?.length) return p.specs.airDelivery.join(', ');
        if (p.specs?.airDeliveryCmm?.length) return p.specs.airDeliveryCmm.map((v) => `${v} CMM`).join(', ');
        return '—';
      },
    },
    {
      title: 'Speed (RPM)',
      render: (p) => {
        if (p.specs?.speedRpm?.length) return p.specs.speedRpm.map((v) => `${v} RPM`).join(', ');
        if (p.specs?.rpm?.length) return p.specs.rpm.map((v) => `${v} RPM`).join(', ');
        return '—';
      },
    },
    {
      title: 'Power Input',
      render: (p) => (p.specs?.powerW?.length ? p.specs.powerW.map((v) => `${v} W`).join(', ') : '—'),
    },
    {
      title: 'Star Rating',
      render: (p) => (p.specs?.starRating && p.specs.starRating !== 'NA' ? `${p.specs.starRating} Star` : '—'),
    },
    {
      title: 'Tagline & Highlights',
      render: (p) => (
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          {p.tagline ? <em>“{p.tagline}” — </em> : ''}
          {p.description?.slice(0, 110)}...
        </p>
      ),
    },
  ];

  return (
    <>
      <PageHead
        eyebrow="Side-by-Side Analysis"
        title="Compare Fan Models"
        lead="Evaluate features, motor technologies, air volume, and official manufacturer warranty across your selected models."
        crumbs={[{ label: 'Home', to: '/' }, { label: 'Compare' }]}
      />

      <section className="section section--ivory">
        <div className="container">
          <div className="compare-header-bar">
            <span className="eyebrow">
              Comparing {compareList.length} of 3 models
            </span>
            <button
              type="button"
              onClick={clear}
              className="compare-clear-btn"
              data-cursor="hover"
            >
              <Trash size={16} /> Clear comparison list
            </button>
          </div>

          <div className="compare-table-wrapper">
            <table className="compare-table">
              <thead>
                <tr>
                  <th className="compare-table__th-label">Specification</th>
                  {compareList.map((item) => {
                    const fullP = fullProducts?.find((x) => x.slug === item.slug);
                    const inBasket = enquiry.has(item.slug);
                    return (
                      <th key={item.slug} className="compare-table__th-product">
                        <div className="compare-card">
                          <button
                            type="button"
                            className="compare-card__remove"
                            onClick={() => remove(item.slug)}
                            aria-label={`Remove ${item.name}`}
                            data-cursor="hover"
                          >
                            <X size={16} />
                          </button>

                          <Link to={productPath(item)} className="compare-card__media">
                            {item.image ? (
                              <img src={item.image} alt={item.name} loading="lazy" />
                            ) : (
                              <FanBlade size={60} />
                            )}
                          </Link>

                          <small className="compare-card__brand">{item.brand}</small>
                          <h3 className="compare-card__name">
                            <Link to={productPath(item)}>{item.name}</Link>
                          </h3>

                          <button
                            type="button"
                            className={`compare-card__add-btn ${inBasket ? 'is-added' : ''}`}
                            onClick={() => fullP && enquiry.add(fullP)}
                            data-cursor="hover"
                          >
                            {inBasket ? (
                              <>
                                <Check size={16} weight="bold" /> In Enquiry
                              </>
                            ) : (
                              <>
                                <Plus size={16} weight="light" /> Add to Enquiry
                              </>
                            )}
                          </button>
                        </div>
                      </th>
                    );
                  })}
                  {/* Empty Slot if less than 3 */}
                  {Array.from({ length: 3 - compareList.length }).map((_, i) => (
                    <th key={`empty-${i}`} className="compare-table__th-slot">
                      <Link to="/fans" className="compare-slot-link" data-cursor="hover">
                        <Plus size={28} weight="light" />
                        <span>Add another model</span>
                      </Link>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {specRows.map((row) => (
                  <tr key={row.title}>
                    <td className="compare-table__td-label">{row.title}</td>
                    {compareList.map((item) => {
                      const fullP = fullProducts?.find((x) => x.slug === item.slug);
                      return (
                        <td key={item.slug} className="compare-table__td-val">
                          {loading || !fullP ? '...' : row.render(fullP)}
                        </td>
                      );
                    })}
                    {Array.from({ length: 3 - compareList.length }).map((_, i) => (
                      <td key={`empty-td-${i}`} className="compare-table__td-empty">
                        —
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </>
  );
}
