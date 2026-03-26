import { motion, AnimatePresence } from 'framer-motion';
import { LAYERS } from '../simulation/simulationEngine';

const LAYER_ICONS = ['🌐', '🔌', '📍', '🔗', '⚡'];
const ENCAP_DETAILS = [
  {
    whatHappens: 'User data ("Hello, World!") is created by the application (e.g., a web browser making an HTTP request).',
    whatAdded: 'Application Payload — The raw message formatted according to the application protocol.',
    whyAdded: 'The application layer defines HOW the data should be structured so the receiving application can understand it.',
    visual: 'DATA',
  },
  {
    whatHappens: 'The data is broken into segments. Source & destination port numbers are attached for process identification.',
    whatAdded: 'TCP/UDP Header — Contains Source Port, Destination Port, Sequence Number, Acknowledgment, Checksum.',
    whyAdded: 'Port numbers ensure the data reaches the correct process/application on the destination machine.',
    visual: 'TCP HDR + DATA',
  },
  {
    whatHappens: 'Logical addressing is applied. Source & destination IP addresses are added for routing across networks.',
    whatAdded: 'IP Header — Contains Source IP, Destination IP, TTL (Time to Live), Protocol field.',
    whyAdded: 'IP addresses enable routers to forward the packet across multiple networks to reach the destination.',
    visual: 'IP HDR + TCP HDR + DATA',
  },
  {
    whatHappens: 'The packet is framed. Physical (MAC) addresses are added for local network hop-by-hop delivery.',
    whatAdded: 'Ethernet Frame — MAC Header (Src MAC, Dst MAC) + FCS Trailer for error checking.',
    whyAdded: 'MAC addresses identify devices on the SAME local network. They change at each hop, unlike IP.',
    visual: 'MAC + IP + TCP + DATA + FCS',
  },
  {
    whatHappens: 'The frame is converted into raw signals — electrical pulses, light, or radio waves — for physical transmission.',
    whatAdded: 'Signal Encoding — Binary data becomes physical signals on the wire/air.',
    whyAdded: 'The physical medium only understands signals, not digital data. Encoding makes transmission possible.',
    visual: '⚡ 01101001 01001000...',
  },
];

export default function EncapsulationView({ activeLayer, packetLayers = [] }) {
  const currentLayerDef = activeLayer >= 0 && activeLayer < LAYERS.length ? LAYERS[activeLayer] : null;
  const detail = activeLayer >= 0 ? ENCAP_DETAILS[activeLayer] : null;

  return (
    <div className="panel-encap p-6 h-full flex flex-col overflow-y-auto" style={{ gap: '16px' }}>
      {/* Title */}
      <div className="flex items-center gap-4 pb-4" style={{ borderBottom: '1px solid rgba(0,212,230,0.1)' }}>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
          style={{ background: 'rgba(0,212,230,0.08)', border: '1px solid rgba(0,212,230,0.2)', boxShadow: '0 0 15px rgba(0,212,230,0.1)' }}>
          📤
        </div>
        <div>
          <h3 className="text-[14px] font-bold text-neon-cyan text-glow-cyan tracking-wide">
            SENDER — ENCAPSULATION
          </h3>
          <p className="text-[11px] text-text-muted mt-1">Wrapping data layer by layer ⬇</p>
        </div>
      </div>

      {/* Layer Steps */}
      <div className="flex flex-col gap-1.5">
        {LAYERS.map((layer, idx) => {
          const isActive = idx === activeLayer;
          const isPast = idx < activeLayer;
          const isFuture = idx > activeLayer;

          return (
            <div key={layer.id}>
              <motion.div
                className="layer-wrapper relative"
                style={{
                  '--layer-color': layer.color,
                  background: isActive
                    ? `linear-gradient(135deg, ${layer.bg}, rgba(6,8,15,0.6))`
                    : isPast
                    ? `${layer.bg}`
                    : 'rgba(6,8,15,0.4)',
                  border: `1px solid ${isActive ? layer.color + '66' : isPast ? layer.color + '33' : '#1a234044'}`,
                  opacity: isFuture ? 0.4 : 1,
                  boxShadow: isActive ? `0 0 20px ${layer.color}15, inset 0 0 20px ${layer.color}08` : 'none',
                }}
                animate={isActive ? { scale: [1, 1.01, 1] } : {}}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                {/* Step header */}
                <div className="flex items-center gap-3 mb-2">
                  <div
                    className="step-badge"
                    style={{
                      borderColor: isActive ? layer.color : isPast ? layer.color + '88' : '#334155',
                      background: isActive ? layer.color + '22' : 'transparent',
                      color: isActive ? layer.color : isPast ? layer.color + 'aa' : '#5c6b8a',
                    }}
                  >
                    {isPast ? '✓' : idx + 1}
                  </div>
                  <span className="flex-1">
                    <span className="text-xs font-bold" style={{ color: isActive ? layer.color : isPast ? layer.color + 'cc' : '#5c6b8a' }}>
                      {LAYER_ICONS[idx]} {layer.shortName}
                    </span>
                  </span>
                  {isActive && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider"
                      style={{ background: layer.color + '22', color: layer.color, border: `1px solid ${layer.color}44` }}
                    >
                      Processing
                    </motion.span>
                  )}
                </div>

                {/* Expanded detail when active */}
                <AnimatePresence>
                  {isActive && detail && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="flex flex-col gap-2.5 pt-1"
                    >
                      {/* What is happening */}
                      <div className="rounded-lg p-3" style={{ background: 'rgba(0,0,0,0.3)' }}>
                        <div className="text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: layer.color }}>
                          ⚙️ What is happening
                        </div>
                        <p className="text-xs text-text-secondary leading-relaxed">
                          {detail.whatHappens}
                        </p>
                      </div>

                      {/* What is added */}
                      <div className="rounded-lg p-3" style={{ background: 'rgba(0,0,0,0.3)' }}>
                        <div className="text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: layer.color }}>
                          ➕ What is added
                        </div>
                        <div className="header-tag" style={{ borderColor: layer.color + '55', background: layer.color + '15', color: layer.color }}>
                          + {detail.whatAdded}
                        </div>
                      </div>

                      {/* Why it is added */}
                      <div className="rounded-lg p-3" style={{ background: 'rgba(0,0,0,0.3)' }}>
                        <div className="text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: layer.color }}>
                          ❓ Why it is added
                        </div>
                        <p className="text-xs text-text-muted leading-relaxed italic">
                          {detail.whyAdded}
                        </p>
                      </div>

                      {/* Visual representation */}
                      <div className="text-center mt-1">
                        <span className="text-[11px] font-mono font-bold px-4 py-1.5 rounded-lg inline-block"
                          style={{ background: layer.color + '15', color: layer.color, border: `1px dashed ${layer.color}44` }}>
                          {detail.visual}
                        </span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Past layer summary */}
                {isPast && (
                  <div className="text-[11px] text-text-muted pl-9">
                    ✓ {layer.encapAdded}
                  </div>
                )}
              </motion.div>

              {/* Arrow between layers */}
              {idx < LAYERS.length - 1 && (
                <div className="arrow-down" style={{
                  '--arrow-color': isPast || isActive ? layer.color : '#1a2340',
                  opacity: isFuture ? 0.2 : 0.6,
                }} />
              )}
            </div>
          );
        })}
      </div>

      {/* Live Packet Build visualization */}
      <div className="mt-auto pt-3" style={{ borderTop: '1px solid rgba(0,212,230,0.08)' }}>
        <div className="text-[10px] font-bold uppercase tracking-widest mb-2.5" style={{ color: 'rgba(0,212,230,0.5)' }}>
          📦 Packet Being Built
        </div>
        <div>
          <AnimatePresence>
            {[...packetLayers].reverse().map((pl, idx) => {
              const ld = LAYERS.find(l => l.id === pl.layer);
              return (
                <motion.div
                  key={pl.layer}
                  initial={{ opacity: 0, scaleY: 0, height: 0 }}
                  animate={{ opacity: 1, scaleY: 1, height: 'auto' }}
                  className="font-mono text-[11px] px-3.5 py-2 border-l-2 first:rounded-t-lg last:rounded-b-lg"
                  style={{
                    background: `linear-gradient(90deg, ${ld?.color}12, transparent)`,
                    borderLeftColor: ld?.color,
                    color: ld?.color,
                  }}
                  transition={{ duration: 0.4 }}
                >
                  <span className="font-bold">{pl.label}</span>
                  <span className="text-text-muted ml-2">{pl.content.slice(0, 35)}{pl.content.length > 35 ? '…' : ''}</span>
                </motion.div>
              );
            })}
          </AnimatePresence>
          {packetLayers.length === 0 && (
            <div className="text-center py-4 text-text-muted text-[11px]">Waiting to start...</div>
          )}
        </div>
      </div>
    </div>
  );
}
