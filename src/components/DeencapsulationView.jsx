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
    <div className="panel-decap p-4 space-y-3 h-full flex flex-col overflow-y-auto">
      {/* Title */}
      <div className="flex items-center gap-3 pb-2 border-b border-neon-green/10">
        <div className="w-9 h-9 rounded-xl bg-neon-green/10 border border-neon-green/30 flex items-center justify-center text-lg"
          style={{ boxShadow: '0 0 15px rgba(0,255,136,0.15)' }}>
          📥
        </div>
        <div>
          <h3 className="text-sm font-bold text-neon-green text-glow-green tracking-wide">
            RECEIVER — DE-ENCAPSULATION
          </h3>
          <p className="text-[10px] text-text-muted">Unwrapping data layer by layer ⬆</p>
        </div>
      </div>

      {/* Layer Steps (reversed order) */}
      <div className="space-y-1">
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
                <div className="flex items-center gap-2.5 mb-1.5">
                  <div
                    className="step-badge"
                    style={{
                      borderColor: isActive ? layer.color : isPast ? layer.color + '88' : '#334155',
                      background: isActive ? layer.color + '22' : 'transparent',
                      color: isActive ? layer.color : isPast ? layer.color + 'aa' : '#475569',
                    }}
                  >
                    {isPast ? '✓' : stepIdx + 1}
                  </div>
                  <span className="text-xs font-bold" style={{ color: isActive ? layer.color : isPast ? layer.color + 'cc' : '#475569' }}>
                    {LAYER_ICONS[layerIdx]} {layer.shortName}
                  </span>
                  {isActive && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ml-auto"
                      style={{ background: '#00ff8822', color: '#00ff88', border: '1px solid #00ff8844' }}
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
                      className="space-y-2 pt-1"
                    >
                      <div className="rounded-lg p-2.5" style={{ background: 'rgba(0,0,0,0.3)' }}>
                        <div className="text-[9px] font-bold uppercase tracking-widest mb-1" style={{ color: '#00ff88' }}>
                          ⚙️ What is happening
                        </div>
                        <p className="text-[11px] text-text-secondary leading-relaxed">
                          {detail.whatHappens}
                        </p>
                      </div>

                      <div className="rounded-lg p-2.5" style={{ background: 'rgba(0,0,0,0.3)' }}>
                        <div className="text-[9px] font-bold uppercase tracking-widest mb-1" style={{ color: '#ff3355' }}>
                          ➖ What is removed
                        </div>
                        <div className="header-tag" style={{ borderColor: '#ff335555', background: '#ff335515', color: '#ff6688' }}>
                          − {detail.whatRemoved}
                        </div>
                      </div>

                      <div className="rounded-lg p-2.5" style={{ background: 'rgba(0,0,0,0.3)' }}>
                        <div className="text-[9px] font-bold uppercase tracking-widest mb-1" style={{ color: '#f59e0b' }}>
                          🔄 What changes
                        </div>
                        <p className="text-[11px] text-text-muted leading-relaxed italic">
                          {detail.whatChanges}
                        </p>
                      </div>

                      <div className="text-center mt-1">
                        <span className="text-[10px] font-mono font-bold px-3 py-1 rounded-lg inline-block"
                          style={{ background: '#00ff8815', color: '#00ff88', border: '1px dashed #00ff8844' }}>
                          {detail.visual}
                        </span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {isPast && (
                  <div className="text-[10px] text-text-muted pl-8">
                    ✓ {layer.decapRemoved}
                  </div>
                )}
              </motion.div>

              {stepIdx < DECAP_ORDER.length - 1 && (
                <div className="arrow-up" style={{
                  '--arrow-color': isPast || isActive ? '#00ff88' : '#1e293b',
                  opacity: isFuture ? 0.2 : 0.6,
                }} />
              )}
            </div>
          );
        })}
      </div>

      {/* Remaining packet */}
      <div className="mt-auto pt-3 border-t border-neon-green/10">
        <div className="text-[9px] font-bold uppercase tracking-widest text-neon-green/60 mb-2">
          📦 Remaining Packet
        </div>
        <div className="space-y-0">
          <AnimatePresence>
            {[...packetLayers].reverse().map((pl) => {
              const ld = LAYERS.find(l => l.id === pl.layer);
              return (
                <motion.div
                  key={pl.layer}
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0, height: 0, scaleY: 0 }}
                  className="font-mono text-[10px] px-3 py-1.5 border-l-2 first:rounded-t-lg last:rounded-b-lg"
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
            <div className="text-center py-3 text-neon-green text-[11px] font-bold">
              ✅ Pure data remains!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
