import { motion, AnimatePresence } from 'framer-motion';
import { LAYERS } from '../simulation/simulationEngine';

export default function PacketInspector({ packetLayers = [], title = 'Packet Structure' }) {
  return (
    <div className="glass-card p-4 space-y-3 h-full">
      <h3 className="text-[11px] font-bold uppercase tracking-widest text-neon-cyan text-glow-cyan flex items-center gap-2">
        <span>📦</span> {title}
      </h3>

      {/* Nested packet visualization */}
      <div className="relative">
        <AnimatePresence mode="popLayout">
          {[...packetLayers].reverse().map((pl, idx) => {
            const layerDef = LAYERS.find(l => l.id === pl.layer);
            const nestLevel = packetLayers.length - 1 - idx;
            return (
              <motion.div
                key={pl.layer}
                initial={{ opacity: 0, x: -20, height: 0 }}
                animate={{ opacity: 1, x: 0, height: 'auto' }}
                exit={{ opacity: 0, x: 20, height: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                className="rounded-lg overflow-hidden mb-1"
                style={{
                  background: `linear-gradient(90deg, ${layerDef?.color}18, ${layerDef?.color}05)`,
                  borderLeft: `3px solid ${layerDef?.color}`,
                  paddingLeft: `${12 + nestLevel * 4}px`,
                }}
              >
                <div className="flex items-center justify-between py-2 pr-3">
                  <div className="flex items-center gap-2">
                    <span
                      className="text-[10px] font-bold uppercase tracking-wider"
                      style={{ color: layerDef?.color }}
                    >
                      {pl.label}
                    </span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded"
                      style={{ background: `${layerDef?.color}15`, color: layerDef?.color + 'aa' }}>
                      {layerDef?.shortName}
                    </span>
                  </div>
                </div>
                <div className="text-[10px] text-text-muted font-mono pb-2 pr-3 break-all leading-relaxed">
                  {pl.content}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {packetLayers.length === 0 && (
          <div className="text-center py-8 text-text-muted text-[11px]">
            <span className="text-2xl block mb-2 opacity-30">📦</span>
            No packet data yet — start a simulation
          </div>
        )}
      </div>
    </div>
  );
}
