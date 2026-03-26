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
    <div className="glass-card px-7 py-5 flex flex-col gap-5">
      <h3 className="panel-heading text-neon-cyan text-glow-cyan">
        <span>🎮</span> Controls
      </h3>

      {/* Message Input */}
      <div className="flex flex-col gap-1.5">
        <label className="section-label">Message</label>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Hello, World!"
          className="w-full"
          disabled={phase !== 'IDLE'}
        />
      </div>

      {/* Sender / Receiver Selectors */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="section-label">Sender</label>
          <select
            value={senderId}
            onChange={(e) => setSenderId(e.target.value)}
            disabled={phase !== 'IDLE'}
            className="w-full"
            style={{ color: senderId ? '#00d4e6' : undefined }}
          >
            <option value="">Select...</option>
            {devices.map(d => (
              <option key={d.id} value={d.id} disabled={d.id === receiverId}>{d.name}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="section-label">Receiver</label>
          <select
            value={receiverId}
            onChange={(e) => setReceiverId(e.target.value)}
            disabled={phase !== 'IDLE'}
            className="w-full"
            style={{ color: receiverId ? '#00e87b' : undefined }}
          >
            <option value="">Select...</option>
            {devices.map(d => (
              <option key={d.id} value={d.id} disabled={d.id === senderId}>{d.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Protocol Toggle */}
      <div className="flex flex-col gap-2">
        <label className="section-label">Protocol</label>
        <div className="flex gap-2">
          {['TCP', 'UDP'].map(p => (
            <button
              key={p}
              onClick={() => setProtocol(p)}
              disabled={phase !== 'IDLE'}
              className={`flex-1 py-2.5 rounded-lg text-[13px] font-bold transition-all ${
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

      <div className="divider" />

      {/* Playback Controls */}
      <div className="flex items-center gap-3">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onPlay}
          disabled={isPlaying || !senderId || !receiverId || (phase !== 'IDLE' && phase !== 'COMPLETE')}
          className="neon-btn green flex-1 py-3"
        >
          ▶ Play
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onPause}
          disabled={!isPlaying}
          className="neon-btn flex-1 py-3"
        >
          ⏸ Pause
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onStep}
          disabled={isPlaying || phase === 'IDLE' || phase === 'COMPLETE'}
          className="neon-btn magenta flex-1 py-3"
        >
          ⏭ Step
        </motion.button>
      </div>

      {/* Reset */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={onReset}
        className="neon-btn red w-full py-3"
      >
        ↺ Reset
      </motion.button>

      <div className="divider" />

      {/* Speed Slider */}
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <label className="section-label">Speed</label>
          <span className="text-[13px] text-neon-cyan font-mono font-semibold">{speed.toFixed(1)}×</span>
        </div>
        <input
          type="range"
          min="0.5"
          max="3"
          step="0.5"
          value={speed}
          onChange={(e) => setSpeed(parseFloat(e.target.value))}
          className="w-full"
        />
      </div>

      {/* Packet Loss Toggle */}
      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={packetLoss}
          onChange={(e) => setPacketLoss(e.target.checked)}
          disabled={phase !== 'IDLE'}
        />
        <span className="text-[13px] text-text-secondary">Packet Loss Simulation</span>
      </label>

      <div className="divider" />

      {/* Phase indicator */}
      <div className="flex items-center gap-2.5">
        <div
          className="w-2.5 h-2.5 rounded-full animate-pulse"
          style={{
            background:
              phase === 'IDLE' ? '#5c6b8a' :
              phase === 'COMPLETE' ? '#00e87b' :
              '#00d4e6',
          }}
        />
        <span className="text-[11px] uppercase tracking-widest text-text-muted font-mono font-medium">
          {phase}
        </span>
      </div>
    </div>
  );
}
