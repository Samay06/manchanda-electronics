import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, House, Bed, Armchair, Buildings } from '@phosphor-icons/react';
import Button from '../../components/ui/Button.jsx';
import FanBlade from '../../components/ui/FanBlade.jsx';
import { Reveal, SplitHeading } from '../../components/ui/Reveal.jsx';

// Sweep vs room-size guidance from the Havells fan selection guide.
const ROOMS = [
  { sweep: 600, icon: House, label: 'Cabin, balcony, washroom', size: '1.2 m × 2 m', min: 600, max: 700, blurb: 'Compact spaces — utility rooms, verandas, small cabins.' },
  { sweep: 900, icon: Bed, label: 'Guest bedroom, study', size: '3 m × 3 m', min: 900, max: 1000, blurb: 'Smaller bedrooms and study rooms.' },
  { sweep: 1200, icon: Armchair, label: 'Master bedroom, living room', size: '3.6 m × 4 m', min: 1200, max: 1300, blurb: 'The everyday standard for most Indian homes.' },
  { sweep: 1400, icon: Buildings, label: 'Large hall, workspace', size: '4.2 m × 4.8 m', min: 1400, max: 1500, blurb: 'Big halls, showrooms, offices and open workspaces.' },
];

export default function RoomGuide() {
  const [active, setActive] = useState(2);
  const room = ROOMS[active];
  const scale = 0.55 + (active / (ROOMS.length - 1)) * 0.6;
  const link = `/fans/ceiling-fans?sweepMin=${room.min}&sweepMax=${room.max}`;

  return (
    <section className="section section--cream" id="room-guide" aria-labelledby="room-guide-title">
      <div className="container room">
        <div className="room__copy">
          <Reveal><span className="eyebrow">Sweep Selection Guide</span></Reveal>
          <SplitHeading as="h2" className="h2" text="Choosing the right fan sweep by room size" />
          <Reveal delay={2}>
            <p className="lead">Air delivery and cooling efficiency depend directly on room dimensions. Select your room type below to find the recommended blade sweep (mm) and view compatible models.</p>
          </Reveal>

          <div className="room__options" role="tablist" aria-label="Room type">
            {ROOMS.map((r, i) => {
              const Icon = r.icon;
              return (
                <button
                  key={r.sweep}
                  role="tab"
                  aria-selected={i === active}
                  className={`room__opt ${i === active ? 'is-active' : ''}`}
                  onClick={() => setActive(i)}
                  data-cursor="hover"
                >
                  <Icon size={26} weight="light" />
                  <span className="room__opt-label">{r.label}</span>
                  <span className="room__opt-size">{r.size}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="room__visual" aria-live="polite">
          <div className="room__stage">
            <div className="room__rings" aria-hidden="true">
              <i /><i /><i />
            </div>
            <motion.div animate={{ scale }} transition={{ type: 'spring', stiffness: 120, damping: 16 }} className="room__fan-wrap">
              <FanBlade size={360} speed={5} blades={3} className="room__fan" />
            </motion.div>
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={room.sweep}
              className="room__result"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35 }}
            >
              <span className="room__sweep">{room.sweep}<small>mm</small></span>
              <p>{room.blurb}</p>
              <Button to={link} icon={<ArrowRight size={18} weight="light" />}>
                View {room.sweep} mm ceiling fans
              </Button>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
