import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CaretLeft, CaretRight, Sparkle } from '@phosphor-icons/react';
import { api, productPath } from '../lib/api.js';
import { useFetch } from '../hooks/useFetch.js';
import { Reveal } from '../components/ui/Reveal.jsx';
import { Skeleton } from '../components/ui/misc.jsx';
import PageHead from '../components/layout/PageHead.jsx';
import Button from '../components/ui/Button.jsx';
import FanBlade from '../components/ui/FanBlade.jsx';

function CategoryCard({ category, index }) {
  const scrollerRef = useRef(null);
  const { data, loading } = useFetch(
    () => api.products({ category: category.slug, limit: 8 }),
    [category.slug],
  );

  const scroll = (direction) => {
    if (scrollerRef.current) {
      scrollerRef.current.scrollBy({ left: direction * 280, behavior: 'smooth' });
    }
  };

  const products = data?.items || [];

  return (
    <Reveal delay={index * 0.05}>
      <article className="cat-showcase" aria-labelledby={`cat-head-${category.slug}`}>
        {/* Card Header */}
        <div className="cat-showcase__head">
          <div className="cat-showcase__info">
            <div className="cat-showcase__top-row">
              <span className="cat-showcase__no">{String(index + 1).padStart(2, '0')}</span>
              <span className="cat-showcase__badge">{category.productCount} Models Available</span>
            </div>
            <h2 id={`cat-head-${category.slug}`} className="cat-showcase__title">
              <Link to={`/fans/${category.slug}`} data-cursor="hover">
                {category.name}
              </Link>
            </h2>
            {category.subCategories?.length > 0 && (
              <div className="cat-showcase__sub-pills">
                {category.subCategories.slice(0, 5).map((s) => (
                  <span key={s.slug} className="cat-showcase__sub-pill">
                    {s.name}
                  </span>
                ))}
                {category.subCategories.length > 5 && (
                  <span className="cat-showcase__sub-pill">
                    +{category.subCategories.length - 5} more
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="cat-showcase__controls">
            <div className="cat-showcase__arrows" aria-hidden="true">
              <button
                type="button"
                onClick={() => scroll(-1)}
                className="cat-showcase__arrow-btn"
                aria-label={`Scroll ${category.name} left`}
                data-cursor="hover"
              >
                <CaretLeft size={18} weight="bold" />
              </button>
              <button
                type="button"
                onClick={() => scroll(1)}
                className="cat-showcase__arrow-btn"
                aria-label={`Scroll ${category.name} right`}
                data-cursor="hover"
              >
                <CaretRight size={18} weight="bold" />
              </button>
            </div>
            <Button
              to={`/fans/${category.slug}`}
              variant="outline"
              icon={<ArrowRight size={16} weight="light" />}
            >
              Explore All {category.name}
            </Button>
          </div>
        </div>

        {/* Product Scroller */}
        <div ref={scrollerRef} className="cat-showcase__scroller" role="region" aria-label={`${category.name} products`}>
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="cat-scroller-item" style={{ minHeight: 280 }}>
                <Skeleton style={{ height: 170, width: '100%' }} />
                <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <Skeleton style={{ height: 12, width: '40%' }} />
                  <Skeleton style={{ height: 20, width: '80%' }} />
                  <Skeleton style={{ height: 14, width: '60%' }} />
                </div>
              </div>
            ))
          ) : (
            <>
              {products.map((p) => {
                const img = p.images?.[0]?.path;
                const sweep = p.specs?.sweepMm?.[0];
                return (
                  <Link
                    key={p.slug}
                    to={productPath(p)}
                    className="cat-scroller-item"
                    data-cursor="hover"
                  >
                    <div className="cat-scroller-item__img-wrap">
                      <span className="cat-scroller-item__brand">{p.brand}</span>
                      {img ? (
                        <img src={img} alt={p.name} loading="lazy" className="cat-scroller-item__img" />
                      ) : (
                        <FanBlade size={60} speed={8} />
                      )}
                    </div>
                    <div className="cat-scroller-item__body">
                      <span className="cat-scroller-item__series">{p.series} Series</span>
                      <h3 className="cat-scroller-item__name">{p.name}</h3>
                      <span className="cat-scroller-item__specs">
                        {sweep ? `${sweep} mm Sweep` : (p.warranty ? `${p.warranty} Warranty` : 'Official Warranty')}
                      </span>
                    </div>
                  </Link>
                );
              })}

              <Link
                to={`/fans/${category.slug}`}
                className="cat-scroller-more"
                data-cursor="hover"
              >
                <div className="cat-scroller-more__icon">
                  <ArrowRight size={22} weight="light" />
                </div>
                <span>View all {category.productCount} {category.name}</span>
              </Link>
            </>
          )}
        </div>
      </article>
    </Reveal>
  );
}

export default function Fans() {
  const { data: cats, loading } = useFetch(api.categories, []);

  return (
    <>
      <PageHead
        eyebrow="Product Directory"
        title="All Fan Categories"
        lead="Browse our complete collection of genuine Havells and Orient Electric fans. Explore featured models in each category below or view the full category catalogue."
        crumbs={[{ label: 'Home', to: '/' }, { label: 'Fans' }]}
      />
      <section className="section section--ivory">
        <div className="container">
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <Skeleton style={{ height: 360, width: '100%' }} />
              <Skeleton style={{ height: 360, width: '100%' }} />
            </div>
          ) : (
            <div className="category-showcase-stack">
              {cats?.map((c, i) => (
                <CategoryCard key={c.slug} category={c} index={i} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
