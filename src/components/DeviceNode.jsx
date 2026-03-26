import { motion } from 'framer-motion';

const DEVICE_ICONS = {
  pc: '🖥️',
  server: '🗄️',
  laptop: '💻',
  router: '📡',
};

const STATE_STYLES = {
  idle: { border: '2px solid #1e293b', shadow: 'none' },
  sending: { border: '2px solid #00f0ff', shadow: '0 0 25px rgba(0,240,255,0.5)' },
  receiving: { border: '2px solid #00ff88', shadow: '0 0 25px rgba(0,255,136,0.5)' },
  rejected: { border: '2px solid #ff3355', shadow: '0 0 25px rgba(255,51,85,0.5)' },
  accepted: { border: '2px solid #00ff88', shadow: '0 0 30px rgba(0,255,136,0.6)' },
  checking: { border: '2px solid #f59e0b', shadow: '0 0 20px rgba(245,158,11,0.4)' },
};

export default function DeviceNode({ device, state = 'idle', isSender, isReceiver, onClick, filterResult }) {
  const stateStyle = STATE_STYLES[state] || STATE_STYLES.idle;

  return (
    <motion.div
      onClick={() => onClick?.(device)}
      className="relative cursor-pointer select-none"
      animate={
        state === 'rejected'
          ? { x: [0, -6, 6, -6, 6, 0], transition: { duration: 0.5 } }
          : {}
      }
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Pulse ring for active states */}
      {(state === 'sending' || state === 'accepted') && (
        <motion.div
          className="absolute inset-0 rounded-2xl"
          style={{ border: stateStyle.border }}
          animate={{ scale: [1, 1.3], opacity: [0.6, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      )}

      <div
        className="glass-card flex flex-col items-center gap-2 p-4 min-w-[120px]"
        style={{
          border: stateStyle.border,
          boxShadow: stateStyle.shadow,
          transition: 'all 0.3s ease',
        }}
      >
        {/* Role badge */}
        {(isSender || isReceiver) && (
          <div
            className="absolute -top-3 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
            style={{
              background: isSender ? 'rgba(0,240,255,0.2)' : 'rgba(0,255,136,0.2)',
              color: isSender ? '#00f0ff' : '#00ff88',
              border: `1px solid ${isSender ? '#00f0ff' : '#00ff88'}`,
            }}
          >
            {isSender ? 'SENDER' : 'RECEIVER'}
          </div>
        )}

        {/* Device icon */}
        <span className="text-3xl">{DEVICE_ICONS[device.type] || '🖥️'}</span>

        {/* Device name */}
        <span className="text-sm font-semibold text-text-primary">{device.name}</span>

        {/* IP & MAC */}
        <div className="text-[10px] text-text-muted text-center space-y-0.5">
          <div>IP: {device.ip}</div>
          <div>MAC: {device.mac.slice(0, 11)}...</div>
        </div>

        {/* Filter result overlay */}
        {filterResult && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-[10px] font-bold"
            style={{
              background: filterResult === 'accepted' ? 'rgba(0,255,136,0.2)' : 'rgba(255,51,85,0.2)',
              color: filterResult === 'accepted' ? '#00ff88' : '#ff3355',
              border: `1px solid ${filterResult === 'accepted' ? '#00ff88' : '#ff3355'}`,
            }}
          >
            {filterResult === 'accepted' ? '✔ MAC Match' : '✘ Dropped'}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
