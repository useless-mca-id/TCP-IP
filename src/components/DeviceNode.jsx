import { motion } from 'framer-motion';

const DEVICE_ICONS = {
  pc: '🖥️',
  server: '🗄️',
  laptop: '💻',
  router: '📡',
};

const STATE_COLORS = {
  idle: { border: '#1a2340', shadow: 'none', bg: 'rgba(11,16,34,0.88)' },
  sending: { border: '#00d4e6', shadow: '0 0 25px rgba(0,212,230,0.3)', bg: 'rgba(0,212,230,0.05)' },
  receiving: { border: '#00e87b', shadow: '0 0 25px rgba(0,232,123,0.3)', bg: 'rgba(0,232,123,0.05)' },
  rejected: { border: '#f43f5e', shadow: '0 0 25px rgba(244,63,94,0.3)', bg: 'rgba(244,63,94,0.05)' },
  accepted: { border: '#00e87b', shadow: '0 0 30px rgba(0,232,123,0.35)', bg: 'rgba(0,232,123,0.07)' },
  checking: { border: '#f59e0b', shadow: '0 0 20px rgba(245,158,11,0.3)', bg: 'rgba(245,158,11,0.05)' },
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
        className="flex flex-col items-center gap-2 px-5 py-3.5 min-w-[115px] rounded-2xl"
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
            className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest whitespace-nowrap"
            style={{
              background: isSender ? 'rgba(0,212,230,0.12)' : 'rgba(0,232,123,0.12)',
              color: isSender ? '#00d4e6' : '#00e87b',
              border: `1px solid ${isSender ? 'rgba(0,212,230,0.25)' : 'rgba(0,232,123,0.25)'}`,
              boxShadow: `0 0 10px ${isSender ? 'rgba(0,212,230,0.15)' : 'rgba(0,232,123,0.15)'}`,
            }}
          >
            {isSender ? '📤 Sender' : '📥 Receiver'}
          </div>
        )}

        {/* Device icon */}
        <span className="text-2xl drop-shadow-lg">{DEVICE_ICONS[device.type] || '🖥️'}</span>

        {/* Device name */}
        <span className="text-xs font-semibold text-text-primary tracking-wide">{device.name}</span>

        {/* IP & MAC */}
        <div className="text-[10px] text-text-muted text-center font-mono leading-relaxed">
          <div>{device.ip}</div>
          <div className="opacity-60">{device.mac.slice(0, 11)}…</div>
        </div>

        {/* Filter result overlay */}
        {filterResult && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="absolute -bottom-3.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap"
            style={{
              background: filterResult === 'accepted' ? 'rgba(0,232,123,0.12)' : 'rgba(244,63,94,0.12)',
              color: filterResult === 'accepted' ? '#00e87b' : '#f43f5e',
              border: `1px solid ${filterResult === 'accepted' ? 'rgba(0,232,123,0.25)' : 'rgba(244,63,94,0.25)'}`,
              boxShadow: `0 0 10px ${filterResult === 'accepted' ? 'rgba(0,232,123,0.15)' : 'rgba(244,63,94,0.15)'}`,
            }}
          >
            {filterResult === 'accepted' ? '✔ MAC Match' : '✘ Dropped'}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
