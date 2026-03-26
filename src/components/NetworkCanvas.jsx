import { useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DeviceNode from './DeviceNode';

// Arrange devices in a circle/arc layout
function getDevicePositions(devices, width, height) {
  const cx = width / 2;
  const cy = height / 2;
  const rx = Math.min(width, height) * 0.35;
  const ry = rx * 0.55;
  return devices.map((dev, i) => {
    const angle = ((2 * Math.PI) / devices.length) * i - Math.PI / 2;
    return {
      ...dev,
      x: cx + rx * Math.cos(angle),
      y: cy + ry * Math.sin(angle),
    };
  });
}

export default function NetworkCanvas({
  devices,
  senderId,
  receiverId,
  phase,
  deviceStates,
  filterResults,
  signalProgress,
  packetLost,
}) {
  const containerRef = useRef(null);
  const w = 700;
  const h = 380;
  const positions = useMemo(() => getDevicePositions(devices, w, h), [devices, w, h]);
  const senderPos = positions.find(d => d.id === senderId);
  const receiverPos = positions.find(d => d.id === receiverId);

  return (
    <div ref={containerRef} className="glass-card relative overflow-hidden flex-1" style={{ width: '100%', minHeight: h }}>
      {/* Grid overlay */}
      <div className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: 'linear-gradient(rgba(0,212,230,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,230,0.04) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      {/* Connection lines as SVG */}
      <svg className="absolute inset-0" width="100%" height="100%" style={{ zIndex: 1 }}>
        {/* Hub lines from center */}
        {positions.map((pos) => (
          <line
            key={pos.id}
            x1={w / 2}
            y1={h / 2}
            x2={pos.x}
            y2={pos.y}
            stroke="rgba(0,212,230,0.06)"
            strokeWidth="1"
            strokeDasharray="4 4"
          />
        ))}

        {/* Active sender-to-center line */}
        {senderPos && (phase === 'TRANSMITTING' || phase === 'FILTERING') && (
          <motion.line
            x1={senderPos.x}
            y1={senderPos.y}
            x2={w / 2}
            y2={h / 2}
            stroke="#00d4e6"
            strokeWidth="2"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          />
        )}
      </svg>

      {/* Central hub / switch */}
      <motion.div
        className="absolute z-10 flex items-center justify-center"
        style={{ left: w / 2 - 26, top: h / 2 - 26, width: 52, height: 52 }}
        animate={
          phase === 'TRANSMITTING'
            ? { boxShadow: ['0 0 20px rgba(0,212,230,0.25)', '0 0 40px rgba(0,212,230,0.5)', '0 0 20px rgba(0,212,230,0.25)'] }
            : {}
        }
        transition={{ duration: 1, repeat: Infinity }}
      >
        <div className="w-13 h-13 rounded-full bg-bg-secondary flex items-center justify-center text-xl"
          style={{ border: '2px solid rgba(0,212,230,0.2)', width: 52, height: 52 }}>
          🔀
        </div>
      </motion.div>

      {/* Signal wave animation */}
      <AnimatePresence>
        {phase === 'TRANSMITTING' && senderPos && (
          <>
            {[0, 1, 2].map((wave) => (
              <motion.div
                key={`wave-${wave}`}
                className="absolute rounded-full pointer-events-none"
                style={{
                  left: w / 2 - 10,
                  top: h / 2 - 10,
                  width: 20,
                  height: 20,
                  zIndex: 5,
                  border: '1px solid rgba(0,212,230,0.3)',
                }}
                initial={{ scale: 0, opacity: 0.7 }}
                animate={{ scale: 12, opacity: 0 }}
                transition={{
                  duration: 2,
                  delay: wave * 0.6,
                  repeat: Infinity,
                  ease: 'easeOut',
                }}
              />
            ))}
          </>
        )}
      </AnimatePresence>

      {/* Traveling packet animation (sender → hub) */}
      <AnimatePresence>
        {phase === 'TRANSMITTING' && senderPos && (
          <motion.div
            className="absolute z-20 pointer-events-none"
            initial={{ x: senderPos.x - 12, y: senderPos.y - 12 }}
            animate={{ x: w / 2 - 12, y: h / 2 - 12 }}
            transition={{ duration: 1.5, ease: 'easeInOut' }}
          >
            <div className="w-6 h-6 rounded-md flex items-center justify-center text-[10px]"
              style={{ background: 'rgba(0,212,230,0.25)', border: '1px solid #00d4e6', boxShadow: '0 0 15px rgba(0,212,230,0.4)' }}>
              📦
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Packets going from hub to ALL devices during filtering */}
      <AnimatePresence>
        {phase === 'FILTERING' && positions.map((pos) => {
          if (pos.id === senderId) return null;
          const result = filterResults?.[pos.id];
          return (
            <motion.div
              key={`filter-${pos.id}`}
              className="absolute z-20 pointer-events-none"
              initial={{ x: w / 2 - 12, y: h / 2 - 12 }}
              animate={{ x: pos.x - 12, y: pos.y - 12 }}
              transition={{ duration: 1, ease: 'easeInOut' }}
            >
              <div className="w-6 h-6 rounded-md border flex items-center justify-center text-[10px]"
                style={{
                  background: result === 'accepted' ? 'rgba(0,232,123,0.25)' : result === 'rejected' ? 'rgba(244,63,94,0.25)' : 'rgba(0,212,230,0.25)',
                  borderColor: result === 'accepted' ? '#00e87b' : result === 'rejected' ? '#f43f5e' : '#00d4e6',
                  boxShadow: `0 0 12px ${result === 'accepted' ? 'rgba(0,232,123,0.35)' : result === 'rejected' ? 'rgba(244,63,94,0.35)' : 'rgba(0,212,230,0.35)'}`,
                }}>
                📦
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* Packet Lost indicator */}
      <AnimatePresence>
        {packetLost && (
          <motion.div
            className="absolute z-30 text-center"
            style={{ left: w / 2 - 65, top: h / 2 - 30 }}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="rounded-xl px-5 py-2.5 text-sm font-bold"
              style={{ background: 'rgba(244,63,94,0.15)', border: '1px solid #f43f5e', color: '#f43f5e', boxShadow: '0 0 30px rgba(244,63,94,0.3)' }}>
              ⚠️ PACKET LOST!
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Device Nodes */}
      {positions.map((pos) => (
        <div
          key={pos.id}
          className="absolute z-10"
          style={{ left: pos.x - 60, top: pos.y - 50 }}
        >
          <DeviceNode
            device={pos}
            state={deviceStates?.[pos.id] || 'idle'}
            isSender={pos.id === senderId}
            isReceiver={pos.id === receiverId}
            filterResult={filterResults?.[pos.id]}
          />
        </div>
      ))}

      {/* Phase label */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20">
        <div className="px-5 py-2 rounded-xl text-[11px] uppercase tracking-widest text-text-muted font-mono font-medium"
          style={{ background: 'rgba(6,8,15,0.85)', border: '1px solid rgba(26,35,64,0.6)' }}>
          {phase === 'TRANSMITTING' ? '📡 Signal Broadcasting...' :
           phase === 'FILTERING' ? '🔍 MAC Address Filtering...' :
           phase === 'IDLE' ? 'Ready — Select sender & receiver' :
           phase === 'ENCAPSULATING' ? '📤 Encapsulating at Sender...' :
           phase === 'DEENCAPSULATING' ? '📥 De-encapsulating at Receiver...' :
           phase === 'COMPLETE' ? '✅ Transmission Complete' : phase}
        </div>
      </div>
    </div>
  );
}
