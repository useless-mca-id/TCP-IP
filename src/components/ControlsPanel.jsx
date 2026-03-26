import { motion } from 'framer-motion';

export default function ControlsPanel({
  phase,
  speed,
  setSpeed,
  protocol,
  setProtocol,
  packetLoss,
  setPacketLoss,
  onPlay,
  onPause,
  onStep,
  onReset,
  isPlaying,
  senderId,
  receiverId,
  devices,
  setSenderId,
  setReceiverId,
  message,
  setMessage,
}) {
  return (
    <div className="glass-card p-4 space-y-4">
      <h3 className="text-xs font-bold uppercase tracking-widest text-neon-cyan text-glow-cyan">
        🎮 Controls
      </h3>

      {/* Message Input */}
      <div className="space-y-1">
        <label className="text-[10px] uppercase tracking-wider text-text-muted">Message</label>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Hello, World!"
          className="w-full bg-bg-primary border border-border-dim rounded-lg px-3 py-2 text-xs text-text-primary focus:border-neon-cyan focus:outline-none transition-colors"
          disabled={phase !== 'IDLE'}
        />
      </div>

      {/* Sender / Receiver Selectors */}
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <label className="text-[10px] uppercase tracking-wider text-text-muted">Sender</label>
          <select
            value={senderId}
            onChange={(e) => setSenderId(e.target.value)}
            disabled={phase !== 'IDLE'}
            className="w-full bg-bg-primary border border-border-dim rounded-lg px-2 py-1.5 text-xs text-neon-cyan focus:border-neon-cyan focus:outline-none"
          >
            <option value="">Select...</option>
            {devices.map(d => (
              <option key={d.id} value={d.id} disabled={d.id === receiverId}>{d.name}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] uppercase tracking-wider text-text-muted">Receiver</label>
          <select
            value={receiverId}
            onChange={(e) => setReceiverId(e.target.value)}
            disabled={phase !== 'IDLE'}
            className="w-full bg-bg-primary border border-border-dim rounded-lg px-2 py-1.5 text-xs text-neon-green focus:border-neon-green focus:outline-none"
          >
            <option value="">Select...</option>
            {devices.map(d => (
              <option key={d.id} value={d.id} disabled={d.id === senderId}>{d.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Protocol Toggle */}
      <div className="space-y-1">
        <label className="text-[10px] uppercase tracking-wider text-text-muted">Protocol</label>
        <div className="flex gap-2">
          {['TCP', 'UDP'].map(p => (
            <button
              key={p}
              onClick={() => setProtocol(p)}
              disabled={phase !== 'IDLE'}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                protocol === p
                  ? p === 'TCP'
                    ? 'bg-blue-500/20 border border-blue-500 text-blue-400'
                    : 'bg-orange-500/20 border border-orange-500 text-orange-400'
                  : 'bg-bg-primary border border-border-dim text-text-muted hover:border-text-muted'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Playback Controls */}
      <div className="flex items-center gap-2">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onPlay}
          disabled={isPlaying || !senderId || !receiverId || (phase !== 'IDLE' && phase !== 'COMPLETE')}
          className="neon-btn green flex-1 text-xs py-2"
        >
          ▶ Play
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onPause}
          disabled={!isPlaying}
          className="neon-btn flex-1 text-xs py-2"
        >
          ⏸ Pause
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onStep}
          disabled={isPlaying || phase === 'IDLE' || phase === 'COMPLETE'}
          className="neon-btn magenta flex-1 text-xs py-2"
        >
          ⏭ Step
        </motion.button>
      </div>

      {/* Reset */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={onReset}
        className="neon-btn red w-full text-xs py-2"
      >
        ↺ Reset
      </motion.button>

      {/* Speed Slider */}
      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <label className="text-[10px] uppercase tracking-wider text-text-muted">Speed</label>
          <span className="text-[10px] text-neon-cyan">{speed.toFixed(1)}×</span>
        </div>
        <input
          type="range"
          min="0.5"
          max="3"
          step="0.5"
          value={speed}
          onChange={(e) => setSpeed(parseFloat(e.target.value))}
          className="w-full accent-neon-cyan"
        />
      </div>

      {/* Packet Loss Toggle */}
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={packetLoss}
          onChange={(e) => setPacketLoss(e.target.checked)}
          disabled={phase !== 'IDLE'}
          className="accent-neon-red"
        />
        <span className="text-xs text-text-secondary">Packet Loss Simulation</span>
      </label>

      {/* Phase indicator */}
      <div className="flex items-center gap-2 pt-2 border-t border-border-dim">
        <div
          className="w-2 h-2 rounded-full animate-pulse"
          style={{
            background:
              phase === 'IDLE' ? '#64748b' :
              phase === 'COMPLETE' ? '#00ff88' :
              '#00f0ff',
          }}
        />
        <span className="text-[10px] uppercase tracking-widest text-text-muted font-mono">
          {phase}
        </span>
      </div>
    </div>
  );
}
