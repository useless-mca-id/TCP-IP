import { motion, AnimatePresence } from 'framer-motion';
import { LAYERS } from '../simulation/simulationEngine';

export default function PacketInspector({ packetLayers = [], title = 'Packet Structure' }) {
  return (
    <div className="glass-card px-7 py-6 h-full flex flex-col">
      <h3 className="panel-heading-sm text-neon-cyan text-glow-cyan">
        <span>📦</span> {title}
      </h3>

      {/* Nested packet visualization */}
      <div className="relative flex-1">
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
                className="rounded-lg overflow-hidden mb-1.5"
                style={{
                  background: `linear-gradient(90deg, ${layerDef?.color}18, ${layerDef?.color}05)`,
                  borderLeft: `3px solid ${layerDef?.color}`,
                  paddingLeft: `${14 + nestLevel * 5}px`,
                }}
              >
                <div className="flex items-center justify-between py-2.5 pr-4">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="text-[11px] font-bold uppercase tracking-wider"
                      style={{ color: layerDef?.color }}
                    >
                      {pl.label}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded font-medium"
                      style={{ background: `${layerDef?.color}15`, color: layerDef?.color + 'aa' }}>
                      {layerDef?.shortName}
                    </span>
                  </div>
                </div>
                <div className="text-[11px] text-text-muted font-mono pb-2.5 pr-4 break-all leading-relaxed">
                  {pl.content}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {packetLayers.length === 0 && (
          <div className="text-center py-8 text-text-muted text-xs">
            <span className="text-2xl block mb-3 opacity-30">📦</span>
            No packet data yet — start a simulation
          </div>
        )}
      </div>
    </div>
  );
}
