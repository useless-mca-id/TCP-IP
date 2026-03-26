import { motion, AnimatePresence } from 'framer-motion';
import { LAYERS } from '../simulation/simulationEngine';

const LAYER_ICONS = ['🌐', '🔌', '📍', '🔗', '⚡'];
const DECAP_DETAILS = [
  {
    whatHappens: 'Physical signals (electrical/optical/radio) are received by the network interface and converted back into a digital bit stream.',
    whatRemoved: 'Signal encoding is decoded — raw physical signals become structured digital frames.',
    whatChanges: 'The receiver\'s NIC synchronizes with the incoming signal and reconstructs binary data.',
    visual: '⚡ Signals → Digital Bits',
  },
  {
    whatHappens: 'The Data Link layer inspects the Ethernet frame. It checks the destination MAC address against its own.',
    whatRemoved: 'MAC Header (Src MAC, Dst MAC) and FCS Trailer are stripped from the frame.',
    whatChanges: 'If MAC matches → frame accepted and passed up. The error-checking FCS verifies data integrity.',
    visual: 'Remove: [MAC HDR] + [FCS]',
  },
  {
    whatHappens: 'The Network layer examines the IP header. It verifies the destination IP matches this device.',
    whatRemoved: 'IP Header (Src IP, Dst IP, TTL, Protocol) is stripped from the packet.',
    whatChanges: 'The IP match confirms this packet was meant for this host. The Protocol field tells which transport protocol to use.',
    visual: 'Remove: [IP HDR]',
  },
  {
    whatHappens: 'The Transport layer processes port numbers. The destination port identifies which application should receive the data.',
    whatRemoved: 'TCP/UDP Header (Ports, Seq#, Checksum) is stripped from the segment.',
    whatChanges: 'For TCP: sequence numbers ensure ordered delivery. For UDP: simple port-based demuxing. Checksum verifies segment integrity.',
    visual: 'Remove: [TCP/UDP HDR]',
  },
  {
    whatHappens: 'The original data payload is delivered to the destination application. The message has been fully reconstructed!',
    whatRemoved: 'Nothing — pure application data remains. The journey is complete.',
    whatChanges: 'The receiving application (e.g., web server) processes the data exactly as the sender intended.',
    visual: '✅ "Hello, World!" Delivered!',
  },
];

// De-encap goes Physical(4) → Data Link(3) → Network(2) → Transport(1) → Application(0)
const DECAP_ORDER = [4, 3, 2, 1, 0];

export default function DeencapsulationView({ activeLayer, packetLayers = [] }) {
  const activeDecapIndex = DECAP_ORDER.indexOf(activeLayer);

  return (
    <div className="panel-decap p-6 h-full flex flex-col overflow-y-auto" style={{ gap: '16px' }}>
      {/* Title */}
      <div className="flex items-center gap-4 pb-4" style={{ borderBottom: '1px solid rgba(0,232,123,0.1)' }}>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
          style={{ background: 'rgba(0,232,123,0.08)', border: '1px solid rgba(0,232,123,0.2)', boxShadow: '0 0 15px rgba(0,232,123,0.1)' }}>
          📥
        </div>
        <div>
          <h3 className="text-[14px] font-bold text-neon-green text-glow-green tracking-wide">
            RECEIVER — DE-ENCAPSULATION
          </h3>
          <p className="text-[11px] text-text-muted mt-1">Unwrapping data layer by layer ⬆</p>
        </div>
      </div>

      {/* Layer Steps (reversed order) */}
      <div className="flex flex-col gap-1.5">
        {DECAP_ORDER.map((layerIdx, stepIdx) => {
          const layer = LAYERS[layerIdx];
          const detail = DECAP_DETAILS[stepIdx];
          const isActive = layerIdx === activeLayer;
          const isPast = activeDecapIndex > stepIdx;
          const isFuture = activeDecapIndex < stepIdx || activeDecapIndex === -1;

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
                <div className="flex items-center gap-3 mb-2">
                  <div
                    className="step-badge"
                    style={{
                      borderColor: isActive ? layer.color : isPast ? layer.color + '88' : '#334155',
                      background: isActive ? layer.color + '22' : 'transparent',
                      color: isActive ? layer.color : isPast ? layer.color + 'aa' : '#5c6b8a',
                    }}
                  >
                    {isPast ? '✓' : stepIdx + 1}
                  </div>
                  <span className="text-xs font-bold" style={{ color: isActive ? layer.color : isPast ? layer.color + 'cc' : '#5c6b8a' }}>
                    {LAYER_ICONS[layerIdx]} {layer.shortName}
                  </span>
                  {isActive && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ml-auto"
                      style={{ background: 'rgba(0,232,123,0.13)', color: '#00e87b', border: '1px solid rgba(0,232,123,0.25)' }}
                    >
                      Unwrapping
                    </motion.span>
                  )}
                </div>

                {/* Expanded detail */}
                <AnimatePresence>
                  {isActive && detail && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="flex flex-col gap-2.5 pt-1"
                    >
                      <div className="rounded-lg p-3" style={{ background: 'rgba(0,0,0,0.3)' }}>
                        <div className="text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: '#00e87b' }}>
                          ⚙️ What is happening
                        </div>
                        <p className="text-xs text-text-secondary leading-relaxed">
                          {detail.whatHappens}
                        </p>
                      </div>

                      <div className="rounded-lg p-3" style={{ background: 'rgba(0,0,0,0.3)' }}>
                        <div className="text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: '#f43f5e' }}>
                          ➖ What is removed
                        </div>
                        <div className="header-tag" style={{ borderColor: 'rgba(244,63,94,0.35)', background: 'rgba(244,63,94,0.1)', color: '#fb7185' }}>
                          − {detail.whatRemoved}
                        </div>
                      </div>

                      <div className="rounded-lg p-3" style={{ background: 'rgba(0,0,0,0.3)' }}>
                        <div className="text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: '#f59e0b' }}>
                          🔄 What changes
                        </div>
                        <p className="text-xs text-text-muted leading-relaxed italic">
                          {detail.whatChanges}
                        </p>
                      </div>

                      <div className="text-center mt-1">
                        <span className="text-[11px] font-mono font-bold px-4 py-1.5 rounded-lg inline-block"
                          style={{ background: 'rgba(0,232,123,0.1)', color: '#00e87b', border: '1px dashed rgba(0,232,123,0.25)' }}>
                          {detail.visual}
                        </span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {isPast && (
                  <div className="text-[11px] text-text-muted pl-9">
                    ✓ {layer.decapRemoved}
                  </div>
                )}
              </motion.div>

              {stepIdx < DECAP_ORDER.length - 1 && (
                <div className="arrow-up" style={{
                  '--arrow-color': isPast || isActive ? '#00e87b' : '#1a2340',
                  opacity: isFuture ? 0.2 : 0.6,
                }} />
              )}
            </div>
          );
        })}
      </div>

      {/* Remaining packet */}
      <div className="mt-auto pt-3" style={{ borderTop: '1px solid rgba(0,232,123,0.08)' }}>
        <div className="text-[10px] font-bold uppercase tracking-widest mb-2.5" style={{ color: 'rgba(0,232,123,0.5)' }}>
          📦 Remaining Packet
        </div>
        <div>
          <AnimatePresence>
            {[...packetLayers].reverse().map((pl) => {
              const ld = LAYERS.find(l => l.id === pl.layer);
              return (
                <motion.div
                  key={pl.layer}
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0, height: 0, scaleY: 0 }}
                  className="font-mono text-[11px] px-3.5 py-2 border-l-2 first:rounded-t-lg last:rounded-b-lg"
                  style={{
                    background: `linear-gradient(90deg, ${ld?.color}12, transparent)`,
                    borderLeftColor: ld?.color,
                    color: ld?.color,
                    transformOrigin: 'top',
                  }}
                  transition={{ duration: 0.5 }}
                >
                  <span className="font-bold">{pl.label}</span>
                  <span className="text-text-muted ml-2">{pl.content.slice(0, 35)}{pl.content.length > 35 ? '…' : ''}</span>
                </motion.div>
              );
            })}
          </AnimatePresence>
          {packetLayers.length === 0 && (
            <div className="text-center py-4 text-neon-green text-xs font-bold">
              ✅ Pure data remains!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
