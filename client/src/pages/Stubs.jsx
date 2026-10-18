import { Link } from 'react-router-dom';
import PageHead from '../components/layout/PageHead.jsx';
import Button from '../components/ui/Button.jsx';
import FanBlade from '../components/ui/FanBlade.jsx';
import { Chip } from '../components/ui/misc.jsx';
import { Reveal } from '../components/ui/Reveal.jsx';
import { site } from '../config/site.js';

const Placeholder = ({ eyebrow, title, lead, crumbs, note }) => (
  <>
    <PageHead eyebrow={eyebrow} title={title} lead={lead} crumbs={crumbs} />
    <section className="section section--ivory">
      <div className="container empty">
        <FanBlade size={90} speed={8} />
        <p className="lead">{note}</p>
        <Button to="/fans">Browse the fans</Button>
      </div>
    </section>
  </>
);

export const Compare = () => (
  <Placeholder eyebrow="Compare" title="Side by *side*" crumbs={[{ label: 'Home', to: '/' }, { label: 'Compare' }]} note="Pick 2–3 fans with the scales icon on any product. The comparison table is built in Phase 4." />
);
export const Enquiry = () => (
  <Placeholder eyebrow="Enquiry basket" title="Your *enquiry*" crumbs={[{ label: 'Home', to: '/' }, { label: 'Enquiry' }]} note="The enquiry basket and form are built in Phase 5." />
);
export const About = () => (
  <Placeholder eyebrow="Our story" title="Since *1983*" crumbs={[{ label: 'Home', to: '/' }, { label: 'Our story' }]} note="The full story page is built in Phase 4." />
);
export const Contact = () => (
  <Placeholder eyebrow="Contact" title="Visit *us*" crumbs={[{ label: 'Home', to: '/' }, { label: 'Contact' }]} note={site.address} />
);
export const NotFound = () => (
  <>
    <PageHead eyebrow="404" title="Lost in the *breeze*" lead="We could not find that page." />
    <section className="section section--ivory"><div className="container empty"><Button to="/">Back home</Button></div></section>
  </>
);

/** Internal design-system reference at /styleguide. */
export function StyleGuide() {
  const swatches = [
    ['burgundy-900', '#561C24'], ['burgundy-700', '#6D2932'], ['sand-300', '#C7B7A3'], ['cream-100', '#E8D8C4'],
    ['ivory-50', '#F6EFE6'], ['ink-950', '#2A0E12'], ['brass-500', '#B08D57'],
  ];
  return (
    <>
      <PageHead eyebrow="Design system" title="Style *guide*" crumbs={[{ label: 'Home', to: '/' }, { label: 'Style guide' }]} />
      <section className="section section--ivory">
        <div className="container styleguide">
          <Reveal><h2 className="h3">Palette</h2></Reveal>
          <div className="swatches">
            {swatches.map(([n, hex]) => (
              <div key={n} className="swatch"><i style={{ background: hex }} /><b>{n}</b><span>{hex}</span></div>
            ))}
          </div>
          <h2 className="h3">Type</h2>
          <p className="display">Powering <em>Everyday</em></p>
          <p className="h2">Cormorant Garamond display</p>
          <p className="eyebrow">Wide-tracked label · Montserrat</p>
          <p className="lead">Body copy is set in Montserrat for clarity — generous line height and calm contrast on ivory.</p>
          <h2 className="h3">Buttons</h2>
          <div className="row">
            <Button>Primary</Button><Button variant="outline">Outline</Button><Chip active>Chip</Chip><Chip>Chip</Chip>
          </div>
          <div className="row dark" style={{ padding: '2rem' }}><Button variant="light">Light</Button><Button variant="outline-light">Outline light</Button></div>
          <h2 className="h3">Fan blade</h2>
          <div className="row fan-hover" style={{ color: 'var(--burgundy-900)' }}><FanBlade size={80} /><FanBlade size={80} blades={3} speed={2} /><Link to="/">Hover to spin faster</Link></div>
        </div>
      </section>
    </>
  );
}
