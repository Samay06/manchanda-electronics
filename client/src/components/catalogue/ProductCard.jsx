import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Check, Scales } from '@phosphor-icons/react';
import FanBlade from '../ui/FanBlade.jsx';
import { productPath } from '../../lib/api.js';
import { useCompare, useEnquiry } from '../../app/stores.jsx';

export default function ProductCard({ product, index = 0 }) {
  const enquiry = useEnquiry();
  const compare = useCompare();
  const inBasket = enquiry.has(product.slug);
  const inCompare = compare.has(product.slug);
  const img = product.images?.[0];

  return (
    <motion.article
      className="pcard fan-hover"
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -8% 0px' }}
      transition={{ duration: 0.7, delay: (index % 4) * 0.07, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link to={productPath(product)} className="pcard__media" data-cursor="hover" aria-label={`View ${product.brand} ${product.name}`}>
        <FanBlade size={150} className="pcard__ghost" speed={14} />
        {img ? (
          <motion.img
            layoutId={`img-${product.slug}`}
            src={img.path}
            alt={`${product.brand} ${product.name}`}
            loading="lazy"
            decoding="async"
            className="pcard__img"
          />
        ) : (
          <div className="pcard__noimg">No image</div>
        )}
        <span className="pcard__brand">{product.brand}</span>
      </Link>

      <div className="pcard__body">
        <p className="pcard__series">{product.series} · {product.subCategory}</p>
        <h3 className="pcard__name">
          <Link to={productPath(product)}>{product.name}</Link>
        </h3>
        <p className="pcard__warranty">{product.warranty ? `${product.warranty} warranty` : 'Warranty: enquire'}</p>

        <div className="pcard__actions">
          <button
            type="button"
            className={`pcard__btn ${inBasket ? 'is-on' : ''}`}
            onClick={() => enquiry.add(product)}
            aria-label={inBasket ? `${product.name} added to enquiry` : `Add ${product.name} to enquiry`}
            data-cursor="hover"
          >
            {inBasket ? <Check size={16} weight="bold" /> : <Plus size={16} weight="light" />}
            <span>{inBasket ? 'Added' : 'Add to enquiry'}</span>
          </button>
          <button
            type="button"
            className={`pcard__icon ${inCompare ? 'is-on' : ''}`}
            onClick={() => compare.toggle(product)}
            aria-pressed={inCompare}
            aria-label={inCompare ? `Remove ${product.name} from compare` : `Compare ${product.name}`}
            data-cursor="hover"
          >
            <Scales size={18} weight="light" />
          </button>
        </div>
      </div>
    </motion.article>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="pcard pcard--skeleton" aria-hidden="true">
      <div className="pcard__media skeleton" />
      <div className="pcard__body">
        <div className="skeleton" style={{ height: 12, width: '50%' }} />
        <div className="skeleton" style={{ height: 24, width: '80%', marginTop: 12 }} />
        <div className="skeleton" style={{ height: 36, width: '100%', marginTop: 20 }} />
      </div>
    </div>
  );
}
