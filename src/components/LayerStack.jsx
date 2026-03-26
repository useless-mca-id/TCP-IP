import { motion } from 'framer-motion';
import { LAYERS } from '../simulation/simulationEngine';

export default function LayerStack({ activeLayer = -1, direction = 'down', mode = 'encap' }) {
  const layers = direction === 'up' ? [...LAYERS].reverse() : LAYERS;

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {layers.map((layer, idx) => {
        const originalIdx = direction === 'up' ? LAYERS.length - 1 - idx : idx;
        const isActive = originalIdx === activeLayer;
        const isPast = direction === 'down' ? originalIdx < activeLayer : originalIdx > activeLayer;

        return (
          <motion.div
            key={layer.id}
            className="relative rounded-lg border px-3 py-2 text-xs font-semibold transition-all duration-300"
            style={{
              background: isActive ? layer.bg : isPast ? `${layer.bg}` : 'rgba(15,23,42,0.5)',
              borderColor: isActive ? layer.color : isPast ? `${layer.color}44` : '#1e293b',
              color: isActive ? layer.color : isPast ? `${layer.color}99` : '#64748b',
              boxShadow: isActive ? `0 0 15px ${layer.color}33` : 'none',
            }}
            animate={isActive ? { scale: [1, 1.02, 1] } : {}}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <div className="flex items-center justify-between">
              <span>{layer.shortName}</span>
              {isActive && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-[10px] px-1.5 py-0.5 rounded-full"
                  style={{ background: `${layer.color}22`, color: layer.color }}
                >
                  {mode === 'encap' ? '⬇ WRAPPING' : '⬆ UNWRAPPING'}
                </motion.span>
              )}
              {isPast && (
                <span className="text-[10px]">
                  {mode === 'encap' ? '✔' : '✔'}
                </span>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
