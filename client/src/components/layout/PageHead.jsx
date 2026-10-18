import { Link } from 'react-router-dom';
import { CaretRight } from '@phosphor-icons/react';
import { SplitHeading, Reveal } from '../ui/Reveal.jsx';

export function Breadcrumbs({ crumbs, tone = 'dark' }) {
  return (
    <nav aria-label="Breadcrumb" className={`crumbs crumbs--${tone}`}>
      <ol>
        {crumbs.map((c, i) => (
          <li key={i}>
            {c.to ? <Link to={c.to} data-cursor="hover">{c.label}</Link> : <span aria-current="page">{c.label}</span>}
            {i < crumbs.length - 1 && <CaretRight size={12} weight="light" aria-hidden="true" />}
          </li>
        ))}
      </ol>
    </nav>
  );
}

/** Burgundy page header with breadcrumb, serif title (wrap a word in *asterisks* for italic brass). */
export default function PageHead({ eyebrow, title, lead, crumbs }) {
  return (
    <header className="pagehead dark grain">
      <div className="container">
        {crumbs && <Breadcrumbs crumbs={crumbs} />}
        {eyebrow && <Reveal><span className="eyebrow">{eyebrow}</span></Reveal>}
        <SplitHeading as="h1" className="display pagehead__title" text={title} />
        {lead && <Reveal delay={2}><p className="lead">{lead}</p></Reveal>}
      </div>
    </header>
  );
}
