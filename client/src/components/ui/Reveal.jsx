import { motion } from 'framer-motion';
import { clipReveal, fadeUp, stagger } from '../../lib/motion.js';

/** Fades/slides children in once when scrolled into view. */
export function Reveal({ children, as = 'div', delay = 0, className = '', ...rest }) {
  const Tag = motion[as] || motion.div;
  return (
    <Tag
      className={className}
      variants={fadeUp}
      custom={delay}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '0px 0px -12% 0px' }}
      {...rest}
    >
      {children}
    </Tag>
  );
}

/** Staggers direct <Item> children. */
export function Stagger({ children, className = '', gap = 0.09, delay = 0, as = 'div', ...rest }) {
  const Tag = motion[as] || motion.div;
  return (
    <Tag
      className={className}
      variants={stagger(gap, delay)}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '0px 0px -10% 0px' }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
export function Item({ children, className = '', as = 'div', ...rest }) {
  const Tag = motion[as] || motion.div;
  return (
    <Tag className={className} variants={fadeUp} {...rest}>
      {children}
    </Tag>
  );
}

/** Clip-path image reveal; lazy loaded. */
export function RevealImage({ src, alt, className = '', imgClassName = '', priority = false, ...rest }) {
  return (
    <motion.div
      className={`reveal-img ${className}`}
      variants={clipReveal}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '0px 0px -8% 0px' }}
      {...rest}
    >
      <img src={src} alt={alt} loading={priority ? 'eager' : 'lazy'} decoding="async" className={imgClassName} />
    </motion.div>
  );
}

/** Headline that rises word-by-word from a mask. */
export function SplitHeading({ text, as = 'h2', className = '', delay = 0 }) {
  const Tag = motion[as] || motion.h2;
  const words = text.split(' ');
  return (
    <Tag
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '0px 0px -10% 0px' }}
      variants={stagger(0.06, delay)}
      aria-label={text.replace(/[*_]/g, '')}
    >
      {words.map((w, i) => {
        const em = /^\*.+\*$/.test(w);
        const word = em ? w.slice(1, -1) : w;
        return (
          <span
            key={i}
            className="split-word"
            aria-hidden="true"
            style={{ marginRight: i < words.length - 1 ? '0.28em' : 0 }}
          >
            <motion.span
              className="split-word__inner"
              variants={{ hidden: { y: '110%' }, show: { y: 0, transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] } } }}
            >
              {em ? <em>{word}</em> : word}
            </motion.span>
          </span>
        );
      })}
    </Tag>
  );
}
