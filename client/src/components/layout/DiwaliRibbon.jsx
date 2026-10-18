import { Sparkle } from '@phosphor-icons/react';
import { Marquee } from '../ui/misc.jsx';
import { site } from '../../config/site.js';

/** Brass ribbon above the navbar. Toggle with site.diwaliOffer.enabled. */
export default function DiwaliRibbon() {
  if (!site.diwaliOffer.enabled) return null;
  const msg = (
    <span className="ribbon__msg">
      <Sparkle size={14} weight="fill" /> {site.diwaliOffer.text}
    </span>
  );
  return (
    <div className="ribbon" role="note">
      <Marquee items={[msg, msg, msg, msg]} speed={46} separator={<span className="ribbon__sep" aria-hidden="true">✦</span>} />
    </div>
  );
}
