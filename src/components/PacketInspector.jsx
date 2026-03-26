import { motion, AnimatePresence } from 'framer-motion';
import { LAYERS } from '../simulation/simulationEngine';

export default function PacketInspector({ packetLayers = [], title = 'Packet Structure' }) {
  return (
    <div className="glass-card p-4 space-y-3">
      <h3 className="text-xs font-bold uppercase tracking-widest text-neon-cyan text-glow-cyan">
        📦 {title}
      </h3>
      <div className="space-y-1">
        <AnimatePresence mode="popLayout">
          {packetLayers.map((pl, idx) => {
            const layerDef = LAYERS.find(l => l.id === pl.layer);
            return (
              <motion.div
                key={pl.layer}
                initial={{ opacity: 0, x: -20, height: 0 }}
                animate={{ opacity: 1, x: 0, height: 'auto' }}
                exit={{ opacity: 0, x: 20, height: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                className="rounded-lg border px-3 py-2 overflow-hidden"
                style={{
                  background: layerDef?.bg || 'rgba(30,41,59,0.5)',
                  borderColor: layerDef?.color || '#1e293b',
                }}
              >
                <div className="flex items-center justify-between">
                  <span
                    className="text-[11px] font-bold uppercase tracking-wider"
                    style={{ color: layerDef?.color }}
                  >
                    {pl.label}
                  </span>
                  <span className="text-[9px] text-text-muted">{layerDef?.shortName}</span>
                </div>
                <div className="text-[10px] text-text-secondary mt-1 font-mono break-all">
                  {pl.content}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {packetLayers.length === 0 && (
          <div className="text-center py-6 text-text-muted text-xs">
            No packet data yet. Start a simulation.
          </div>
        )}
      </div>
    </div>
  );
}
