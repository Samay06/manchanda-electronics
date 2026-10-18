import { useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MagnifyingGlass, Funnel, X, ArrowClockwise, CaretDown } from '@phosphor-icons/react';
import { api } from '../lib/api.js';
import { useFetch } from '../hooks/useFetch.js';
import PageHead from '../components/layout/PageHead.jsx';
import ProductCard, { ProductCardSkeleton } from '../components/catalogue/ProductCard.jsx';
import FanBlade from '../components/ui/FanBlade.jsx';
import Button from '../components/ui/Button.jsx';

const PAGE_SIZE = 24;

const SWEEP_PRESETS = [
  { label: 'All Sweeps', min: '', max: '' },
  { label: '600 mm (Small / Cabin)', min: 600, max: 700 },
  { label: '900 mm (Guest / Study)', min: 900, max: 1000 },
  { label: '1200 mm (Master / Living)', min: 1200, max: 1300 },
  { label: '1400 mm+ (Large Halls)', min: 1400, max: 1800 },
];

export default function Listing() {
  const { category, series } = useParams();
  const [params, setParams] = useSearchParams();

  const brand = params.get('brand') || '';
  const sub = params.get('sub') || '';
  const searchParam = params.get('search') || '';
  const sweepMin = params.get('sweepMin') || '';
  const sweepMax = params.get('sweepMax') || '';
  const page = Number(params.get('page') || 1);

  const [searchInput, setSearchInput] = useState(searchParam);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const { data: cats } = useFetch(api.categories, []);
  const currentCat = cats?.find((c) => c.slug === category);

  const { data, loading } = useFetch(
    () =>
      api.products({
        category,
        series,
        brand,
        subCategory: sub,
        search: searchParam,
        sweepMin,
        sweepMax,
        page,
        limit: PAGE_SIZE,
      }),
    [category, series, brand, sub, searchParam, sweepMin, sweepMax, page],
  );

  const seriesInfo = useMemo(() => {
    if (!currentCat || !series) return null;
    return currentCat.series.find((s) => s.slug === series);
  }, [currentCat, series]);

  const updateParam = (key, val) => {
    const next = new URLSearchParams(params);
    if (val !== undefined && val !== null && val !== '') {
      next.set(key, val);
    } else {
      next.delete(key);
    }
    next.delete('page');
    setParams(next, { replace: true });
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateParam('search', searchInput.trim());
  };

  const clearAllFilters = () => {
    setSearchInput('');
    setParams({}, { replace: true });
  };

  const hasActiveFilters = Boolean(brand || sub || searchParam || sweepMin || sweepMax);

  const pageTitle = seriesInfo
    ? `${seriesInfo.name} Series`
    : currentCat
      ? currentCat.name
      : 'All Fans';

  const crumbs = [
    { label: 'Home', to: '/' },
    { label: 'Fans', to: '/fans' },
    ...(currentCat
      ? seriesInfo
        ? [
          { label: currentCat.name, to: `/fans/${category}` },
          { label: seriesInfo.name },
        ]
        : [{ label: currentCat.name }]
      : [{ label: 'All Models' }]),
  ];

  return (
    <>
      <PageHead
        eyebrow={seriesInfo ? `${seriesInfo.brand} Series` : currentCat ? 'Catalogue Collection' : 'Full Catalogue'}
        title={pageTitle}
        lead={
          seriesInfo
            ? `Explore the complete ${seriesInfo.name} line-up by ${seriesInfo.brand}. Wholesale rates and bulk ordering available.`
            : currentCat
              ? `Browse ${currentCat.name.toLowerCase()} for residential, commercial and industrial projects.`
              : 'Discover Havells and Orient premium fans engineered for quiet performance, durability and elegance.'
        }
        crumbs={crumbs}
      />

      <section className="section section--ivory listing-view">
        <div className="container">
          {/* Top Bar: Search and Mobile Filter Toggle */}
          <div className="listing-toolbar">
            <form onSubmit={handleSearchSubmit} className="listing-search" role="search">
              <MagnifyingGlass size={20} weight="light" className="listing-search__icon" />
              <input
                type="search"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search by model, series or feature..."
                className="listing-search__input"
                aria-label="Search fans"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchInput('');
                    updateParam('search', '');
                  }}
                  className="listing-search__clear"
                  aria-label="Clear search"
                >
                  <X size={16} weight="bold" />
                </button>
              )}
            </form>

            <div className="listing-toolbar__actions">
              <span className="listing-total">
                {loading ? 'Searching...' : `${data?.total ?? 0} models available`}
              </span>
              <button
                type="button"
                className="btn btn--outline listing-toolbar__filter-btn"
                onClick={() => setMobileFiltersOpen((o) => !o)}
                aria-expanded={mobileFiltersOpen}
              >
                <Funnel size={18} weight="light" />
                <span>Filters {hasActiveFilters && '•'}</span>
              </button>
            </div>
          </div>

          <div className="listing-layout">
            {/* Sidebar / Multifaceted Filters */}
            <aside className={`listing-sidebar ${mobileFiltersOpen ? 'is-open' : ''}`}>
              <div className="listing-sidebar__head">
                <span className="eyebrow">Refine by</span>
                {hasActiveFilters && (
                  <button type="button" onClick={clearAllFilters} className="listing-clear-all" data-cursor="hover">
                    <ArrowClockwise size={14} /> Clear all
                  </button>
                )}
                <button
                  type="button"
                  className="listing-sidebar__close"
                  onClick={() => setMobileFiltersOpen(false)}
                  aria-label="Close filters"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Category Navigation */}
              <div className="filter-group">
                <h4 className="filter-group__title">Fan Category</h4>
                <div className="filter-group__chips">
                  <Link
                    to="/fans"
                    className={`filter-link ${!category ? 'is-active' : ''}`}
                    data-cursor="hover"
                  >
                    <span>All Fans</span>
                    <small>{cats?.reduce((sum, c) => sum + c.productCount, 0)}</small>
                  </Link>
                  {cats?.map((c) => (
                    <Link
                      key={c.slug}
                      to={`/fans/${c.slug}`}
                      className={`filter-link ${category === c.slug ? 'is-active' : ''}`}
                      data-cursor="hover"
                    >
                      <span>{c.name}</span>
                      <small>{c.productCount}</small>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Sub-category Filter */}
              {currentCat?.subCategories?.length > 1 && !series && (
                <div className="filter-group">
                  <h4 className="filter-group__title">Type / Technology</h4>
                  <div className="filter-group__chips">
                    <button
                      type="button"
                      className={`chip ${!sub ? 'is-active' : ''}`}
                      onClick={() => updateParam('sub', '')}
                    >
                      All Types
                    </button>
                    {currentCat.subCategories.map((s) => (
                      <button
                        key={s.slug}
                        type="button"
                        className={`chip ${sub === s.slug ? 'is-active' : ''}`}
                        onClick={() => updateParam('sub', s.slug)}
                      >
                        {s.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Brand Filter */}
              <div className="filter-group">
                <h4 className="filter-group__title">Manufacturer Brand</h4>
                <div className="filter-group__chips">
                  <button
                    type="button"
                    className={`chip ${!brand ? 'is-active' : ''}`}
                    onClick={() => updateParam('brand', '')}
                  >
                    All Brands
                  </button>
                  {['Havells', 'Orient'].map((b) => (
                    <button
                      key={b}
                      type="button"
                      className={`chip ${brand.toLowerCase() === b.toLowerCase() ? 'is-active' : ''}`}
                      onClick={() => updateParam('brand', b)}
                    >
                      {b === 'Orient' ? 'Orient Electric' : b}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sweep Size Filter (Room Size Buying Preset) */}
              <div className="filter-group">
                <h4 className="filter-group__title">Sweep Size (mm)</h4>
                <div className="filter-group__radios">
                  {SWEEP_PRESETS.map((preset) => {
                    const active = sweepMin === String(preset.min) && sweepMax === String(preset.max);
                    return (
                      <button
                        key={preset.label}
                        type="button"
                        className={`filter-radio ${active ? 'is-active' : ''}`}
                        onClick={() => {
                          const next = new URLSearchParams(params);
                          if (preset.min) next.set('sweepMin', preset.min);
                          else next.delete('sweepMin');
                          if (preset.max) next.set('sweepMax', preset.max);
                          else next.delete('sweepMax');
                          next.delete('page');
                          setParams(next, { replace: true });
                        }}
                      >
                        <span className="filter-radio__circle" />
                        <span>{preset.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Series Listing for Current Category */}
              {currentCat?.series?.length > 0 && !series && (
                <div className="filter-group">
                  <h4 className="filter-group__title">Popular Series</h4>
                  <div className="filter-group__chips filter-group__chips--scroll">
                    {currentCat.series
                      .filter((s) => !brand || s.brand.toLowerCase() === brand.toLowerCase())
                      .map((s) => (
                        <Link
                          key={s.slug}
                          to={`/fans/${category}/${s.slug}`}
                          className="chip chip--link"
                          data-cursor="hover"
                        >
                          {s.name} <small>{s.brand}</small>
                        </Link>
                      ))}
                  </div>
                </div>
              )}
            </aside>

            {/* Product Grid Area */}
            <main className="listing-content">
              {/* Active Filter Tags Bar */}
              {hasActiveFilters && (
                <div className="active-tags">
                  <span className="active-tags__label">Active filters:</span>
                  {brand && (
                    <span className="tag">
                      Brand: {brand}
                      <button onClick={() => updateParam('brand', '')}>✕</button>
                    </span>
                  )}
                  {sub && (
                    <span className="tag">
                      Type: {currentCat?.subCategories?.find((x) => x.slug === sub)?.name || sub}
                      <button onClick={() => updateParam('sub', '')}>✕</button>
                    </span>
                  )}
                  {(sweepMin || sweepMax) && (
                    <span className="tag">
                      Sweep: {sweepMin || '0'}–{sweepMax || 'max'} mm
                      <button
                        onClick={() => {
                          const next = new URLSearchParams(params);
                          next.delete('sweepMin');
                          next.delete('sweepMax');
                          setParams(next);
                        }}
                      >
                        ✕
                      </button>
                    </span>
                  )}
                  {searchParam && (
                    <span className="tag">
                      Search: “{searchParam}”
                      <button
                        onClick={() => {
                          setSearchInput('');
                          updateParam('search', '');
                        }}
                      >
                        ✕
                      </button>
                    </span>
                  )}
                  <button onClick={clearAllFilters} className="active-tags__clear">
                    Clear all
                  </button>
                </div>
              )}

              {/* Grid or Skeletons */}
              <div className="grid grid--products">
                {loading
                  ? Array.from({ length: 12 }).map((_, i) => <ProductCardSkeleton key={i} />)
                  : data?.items?.map((p, i) => <ProductCard key={p.slug} product={p} index={i} />)}
              </div>

              {/* Empty Results State */}
              {!loading && data?.items?.length === 0 && (
                <div className="empty empty--card">
                  <FanBlade size={80} speed={8} />
                  <h2 className="h3">No matching fans found</h2>
                  <p className="lead" style={{ fontSize: '1rem' }}>
                    We could not find any models matching your exact filters. Try broadening your sweep size or clearing search criteria.
                  </p>
                  <Button onClick={clearAllFilters} variant="primary">
                    Reset all filters
                  </Button>
                </div>
              )}

              {/* Pagination */}
              {data && data.pages > 1 && (
                <nav className="pager" aria-label="Pagination">
                  {Array.from({ length: data.pages }).map((_, i) => {
                    const pNo = i + 1;
                    return (
                      <button
                        key={pNo}
                        type="button"
                        className={`pager__n ${page === pNo ? 'is-active' : ''}`}
                        onClick={() => {
                          updateParam('page', pNo);
                          window.scrollTo({ top: 380, behavior: 'smooth' });
                        }}
                        aria-label={`Page ${pNo}`}
                        aria-current={page === pNo ? 'page' : undefined}
                      >
                        {pNo}
                      </button>
                    );
                  })}
                </nav>
              )}
            </main>
          </div>
        </div>
      </section>
    </>
  );
}
