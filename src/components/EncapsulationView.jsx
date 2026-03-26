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
    <div className="panel-encap p-4 space-y-3 h-full flex flex-col overflow-y-auto">
      {/* Title */}
      <div className="flex items-center gap-3 pb-2 border-b border-neon-cyan/10">
        <div className="w-9 h-9 rounded-xl bg-neon-cyan/10 border border-neon-cyan/30 flex items-center justify-center text-lg"
          style={{ boxShadow: '0 0 15px rgba(0,240,255,0.15)' }}>
          📤
        </div>
        <div>
          <h3 className="text-sm font-bold text-neon-cyan text-glow-cyan tracking-wide">
            SENDER — ENCAPSULATION
          </h3>
          <p className="text-[10px] text-text-muted">Wrapping data layer by layer ⬇</p>
        </div>
      </div>

      {/* Layer Steps */}
      <div className="space-y-1">
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
                    ? `linear-gradient(135deg, ${layer.bg}, rgba(5,8,16,0.6))`
                    : isPast
                    ? `${layer.bg}`
                    : 'rgba(5,8,16,0.4)',
                  border: `1px solid ${isActive ? layer.color + '66' : isPast ? layer.color + '33' : '#1e293b44'}`,
                  opacity: isFuture ? 0.4 : 1,
                  boxShadow: isActive ? `0 0 20px ${layer.color}15, inset 0 0 20px ${layer.color}08` : 'none',
                }}
                animate={isActive ? { scale: [1, 1.01, 1] } : {}}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                {/* Step header */}
                <div className="flex items-center gap-2.5 mb-1.5">
                  <div
                    className="step-badge"
                    style={{
                      borderColor: isActive ? layer.color : isPast ? layer.color + '88' : '#334155',
                      background: isActive ? layer.color + '22' : 'transparent',
                      color: isActive ? layer.color : isPast ? layer.color + 'aa' : '#475569',
                    }}
                  >
                    {isPast ? '✓' : idx + 1}
                  </div>
                  <span className="text-[10px] mr-auto" style={{ marginRight: 'auto' }}>
                    <span className="text-xs font-bold" style={{ color: isActive ? layer.color : isPast ? layer.color + 'cc' : '#475569' }}>
                      {LAYER_ICONS[idx]} {layer.shortName}
                    </span>
                  </span>
                  {isActive && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider"
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
                      className="space-y-2 pt-1"
                    >
                      {/* What is happening */}
                      <div className="rounded-lg p-2.5" style={{ background: 'rgba(0,0,0,0.3)' }}>
                        <div className="text-[9px] font-bold uppercase tracking-widest mb-1" style={{ color: layer.color }}>
                          ⚙️ What is happening
                        </div>
                        <p className="text-[11px] text-text-secondary leading-relaxed">
                          {detail.whatHappens}
                        </p>
                      </div>

                      {/* What is added */}
                      <div className="rounded-lg p-2.5" style={{ background: 'rgba(0,0,0,0.3)' }}>
                        <div className="text-[9px] font-bold uppercase tracking-widest mb-1" style={{ color: layer.color }}>
                          ➕ What is added
                        </div>
                        <div className="header-tag" style={{ borderColor: layer.color + '55', background: layer.color + '15', color: layer.color }}>
                          + {detail.whatAdded}
                        </div>
                      </div>

                      {/* Why it is added */}
                      <div className="rounded-lg p-2.5" style={{ background: 'rgba(0,0,0,0.3)' }}>
                        <div className="text-[9px] font-bold uppercase tracking-widest mb-1" style={{ color: layer.color }}>
                          ❓ Why it is added
                        </div>
                        <p className="text-[11px] text-text-muted leading-relaxed italic">
                          {detail.whyAdded}
                        </p>
                      </div>

                      {/* Visual representation */}
                      <div className="text-center mt-1">
                        <span className="text-[10px] font-mono font-bold px-3 py-1 rounded-lg inline-block"
                          style={{ background: layer.color + '15', color: layer.color, border: `1px dashed ${layer.color}44` }}>
                          {detail.visual}
                        </span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Past layer summary */}
                {isPast && (
                  <div className="text-[10px] text-text-muted pl-8">
                    ✓ {layer.encapAdded}
                  </div>
                )}
              </motion.div>

              {/* Arrow between layers */}
              {idx < LAYERS.length - 1 && (
                <div className="arrow-down" style={{
                  '--arrow-color': isPast || isActive ? layer.color : '#1e293b',
                  opacity: isFuture ? 0.2 : 0.6,
                }} />
              )}
            </div>
          );
        })}
      </div>

      {/* Live Packet Build visualization */}
      <div className="mt-auto pt-3 border-t border-neon-cyan/10">
        <div className="text-[9px] font-bold uppercase tracking-widest text-neon-cyan/60 mb-2">
          📦 Packet Being Built
        </div>
        <div className="space-y-0">
          <AnimatePresence>
            {[...packetLayers].reverse().map((pl, idx) => {
              const ld = LAYERS.find(l => l.id === pl.layer);
              return (
                <motion.div
                  key={pl.layer}
                  initial={{ opacity: 0, scaleY: 0, height: 0 }}
                  animate={{ opacity: 1, scaleY: 1, height: 'auto' }}
                  className="font-mono text-[10px] px-3 py-1.5 border-l-2 first:rounded-t-lg last:rounded-b-lg"
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
            <div className="text-center py-3 text-text-muted text-[10px]">Waiting to start...</div>
          )}
        </div>
      </div>
    </div>
  );
}
