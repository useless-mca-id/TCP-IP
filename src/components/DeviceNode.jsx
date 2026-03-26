import { motion } from 'framer-motion';

const DEVICE_ICONS = {
  pc: '🖥️',
  server: '🗄️',
  laptop: '💻',
  router: '📡',
};

const STATE_COLORS = {
  idle: { border: '#1e293b', shadow: 'none', bg: 'rgba(12,17,32,0.85)' },
  sending: { border: '#00f0ff', shadow: '0 0 25px rgba(0,240,255,0.35)', bg: 'rgba(0,240,255,0.06)' },
  receiving: { border: '#00ff88', shadow: '0 0 25px rgba(0,255,136,0.35)', bg: 'rgba(0,255,136,0.06)' },
  rejected: { border: '#ff3355', shadow: '0 0 25px rgba(255,51,85,0.35)', bg: 'rgba(255,51,85,0.06)' },
  accepted: { border: '#00ff88', shadow: '0 0 30px rgba(0,255,136,0.4)', bg: 'rgba(0,255,136,0.08)' },
  checking: { border: '#f59e0b', shadow: '0 0 20px rgba(245,158,11,0.35)', bg: 'rgba(245,158,11,0.06)' },
};

export default function DeviceNode({ device, state = 'idle', isSender, isReceiver, onClick, filterResult }) {
  const colors = STATE_COLORS[state] || STATE_COLORS.idle;

  return (
    <motion.div
      onClick={() => onClick?.(device)}
      className="relative cursor-pointer select-none"
      animate={
        state === 'rejected'
          ? { x: [0, -8, 8, -8, 8, 0], transition: { duration: 0.5 } }
          : {}
      }
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Pulse ring for active states */}
      {(state === 'sending' || state === 'accepted') && (
        <motion.div
          className="absolute inset-0 rounded-2xl"
          style={{ border: `2px solid ${colors.border}` }}
          animate={{ scale: [1, 1.35], opacity: [0.5, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      )}

      <div
        className="flex flex-col items-center gap-1.5 px-4 py-3 min-w-[110px] rounded-2xl"
        style={{
          background: colors.bg,
          backdropFilter: 'blur(16px)',
          border: `1.5px solid ${colors.border}`,
          boxShadow: colors.shadow + ', 0 4px 20px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.03)',
          transition: 'all 0.3s ease',
        }}
      >
        {/* Role badge */}
        {(isSender || isReceiver) && (
          <div
            className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest"
            style={{
              background: isSender ? 'rgba(0,240,255,0.15)' : 'rgba(0,255,136,0.15)',
              color: isSender ? '#00f0ff' : '#00ff88',
              border: `1px solid ${isSender ? '#00f0ff44' : '#00ff8844'}`,
              boxShadow: `0 0 10px ${isSender ? 'rgba(0,240,255,0.2)' : 'rgba(0,255,136,0.2)'}`,
            }}
          >
            {isSender ? '📤 Sender' : '📥 Receiver'}
          </div>
        )}

        {/* Device icon */}
        <span className="text-2xl drop-shadow-lg">{DEVICE_ICONS[device.type] || '🖥️'}</span>

        {/* Device name */}
        <span className="text-[11px] font-bold text-text-primary tracking-wide">{device.name}</span>

        {/* IP & MAC */}
        <div className="text-[9px] text-text-muted text-center space-y-0 font-mono">
          <div>{device.ip}</div>
          <div className="opacity-60">{device.mac.slice(0, 11)}…</div>
        </div>

        {/* Filter result overlay */}
        {filterResult && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full text-[9px] font-bold whitespace-nowrap"
            style={{
              background: filterResult === 'accepted' ? 'rgba(0,255,136,0.15)' : 'rgba(255,51,85,0.15)',
              color: filterResult === 'accepted' ? '#00ff88' : '#ff3355',
              border: `1px solid ${filterResult === 'accepted' ? '#00ff8844' : '#ff335544'}`,
              boxShadow: `0 0 10px ${filterResult === 'accepted' ? 'rgba(0,255,136,0.2)' : 'rgba(255,51,85,0.2)'}`,
            }}
          >
            {filterResult === 'accepted' ? '✔ MAC Match' : '✘ Dropped'}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
