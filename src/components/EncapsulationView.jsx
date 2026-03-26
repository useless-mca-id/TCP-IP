import { motion, AnimatePresence } from 'framer-motion';
import { LAYERS } from '../simulation/simulationEngine';
import LayerStack from './LayerStack';

export default function EncapsulationView({ activeLayer, packetLayers = [] }) {
  const currentLayerDef = activeLayer >= 0 && activeLayer < LAYERS.length ? LAYERS[activeLayer] : null;

  return (
    <div className="glass-card p-4 space-y-4 h-full flex flex-col">
      <h3 className="text-xs font-bold uppercase tracking-widest text-neon-cyan text-glow-cyan flex items-center gap-2">
        <span className="text-base">📤</span> Sender — Encapsulation
      </h3>

      {/* Layer Stack */}
      <LayerStack activeLayer={activeLayer} direction="down" mode="encap" />

      {/* Layer Explanation */}
      <AnimatePresence mode="wait">
        {currentLayerDef && (
          <motion.div
            key={currentLayerDef.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="rounded-xl border p-3 space-y-2"
            style={{
              background: currentLayerDef.bg,
              borderColor: `${currentLayerDef.color}66`,
            }}
          >
            <div className="flex items-center gap-2">
              <div
                className="w-2 h-2 rounded-full animate-pulse"
                style={{ background: currentLayerDef.color }}
              />
              <span className="text-xs font-bold" style={{ color: currentLayerDef.color }}>
                {currentLayerDef.encapTitle}
              </span>
            </div>
            <p className="text-[11px] text-text-secondary leading-relaxed">
              {currentLayerDef.encapDesc}
            </p>
            <div
              className="text-[10px] font-mono px-2 py-1 rounded-md"
              style={{ background: `${currentLayerDef.color}11`, color: currentLayerDef.color }}
            >
              + {currentLayerDef.encapAdded}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Packet preview */}
      <div className="flex-1 flex flex-col justify-end">
        <div className="space-y-1">
          <AnimatePresence>
            {packetLayers.map((pl, idx) => {
              const ld = LAYERS.find(l => l.id === pl.layer);
              return (
                <motion.div
                  key={pl.layer}
                  initial={{ opacity: 0, scaleY: 0, height: 0 }}
                  animate={{ opacity: 1, scaleY: 1, height: 'auto' }}
                  className="rounded border px-2 py-1 text-[10px] font-mono"
                  style={{
                    background: ld?.bg,
                    borderColor: `${ld?.color}44`,
                    color: ld?.color,
                    transformOrigin: 'top',
                  }}
                  transition={{ duration: 0.4, delay: idx * 0.08 }}
                >
                  {pl.label}: {pl.content.slice(0, 40)}{pl.content.length > 40 ? '...' : ''}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
