import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import NetworkCanvas from './components/NetworkCanvas';
import EncapsulationView from './components/EncapsulationView';
import DeencapsulationView from './components/DeencapsulationView';
import PacketInspector from './components/PacketInspector';
import ControlsPanel from './components/ControlsPanel';
import DeviceManager from './components/DeviceManager';
import { LAYERS, PHASES, createDefaultDevices, buildPacketAtLayer } from './simulation/simulationEngine';

/*
  ──────────────────────────────────────────────────
  Simulation state machine
  ──────────────────────────────────────────────────
  IDLE
   → ENCAPSULATING (layer 0..4)
   → TRANSMITTING  (sender → hub)
   → FILTERING     (hub → all devices, MAC check)
   → DEENCAPSULATING (layer 4..0 at receiver)
   → COMPLETE
  ──────────────────────────────────────────────────
*/

const TOTAL_ENCAP_STEPS = 5; // one per layer
const TOTAL_DECAP_STEPS = 5;

export default function App() {
  // ── Devices ──
  const [devices, setDevices] = useState(createDefaultDevices);
  const [senderId, setSenderId] = useState('');
  const [receiverId, setReceiverId] = useState('');

  // ── Simulation state ──
  const [phase, setPhase] = useState(PHASES.IDLE);
  const [encapLayer, setEncapLayer] = useState(-1);
  const [decapLayer, setDecapLayer] = useState(-1);
  const [packetLayers, setPacketLayers] = useState([]);
  const [decapPacketLayers, setDecapPacketLayers] = useState([]);
  const [deviceStates, setDeviceStates] = useState({});
  const [filterResults, setFilterResults] = useState({});
  const [packetLost, setPacketLost] = useState(false);

  // ── Controls ──
  const [speed, setSpeed] = useState(1);
  const [protocol, setProtocol] = useState('TCP');
  const [packetLossEnabled, setPacketLossEnabled] = useState(false);
  const [message, setMessage] = useState('Hello, World!');
  const [isPlaying, setIsPlaying] = useState(false);
  const [showDecapPanel, setShowDecapPanel] = useState(false);

  // ── Refs for autoplay timer ──
  const timerRef = useRef(null);
  const phaseRef = useRef(phase);
  const encapRef = useRef(encapLayer);
  const decapRef = useRef(decapLayer);
  phaseRef.current = phase;
  encapRef.current = encapLayer;
  decapRef.current = decapLayer;

  const sender = devices.find(d => d.id === senderId);
  const receiver = devices.find(d => d.id === receiverId);

  // ── Delay helper ──
  const delay = useCallback(() => 1200 / speed, [speed]);

  // ── Step logic ──
  const doStep = useCallback(() => {
    const p = phaseRef.current;
    const el = encapRef.current;
    const dl = decapRef.current;

    if (p === PHASES.IDLE || p === PHASES.COMPLETE) return false;

    if (p === PHASES.ENCAPSULATING) {
      const nextLayer = el + 1;
      if (nextLayer < TOTAL_ENCAP_STEPS) {
        setEncapLayer(nextLayer);
        const pkt = buildPacketAtLayer(nextLayer, { data: message, protocol, sender, receiver });
        setPacketLayers(pkt);
        setDeviceStates(prev => ({ ...prev, [senderId]: 'sending' }));
      } else {
        // Move to transmitting
        setPhase(PHASES.TRANSMITTING);
        setDeviceStates(prev => ({ ...prev, [senderId]: 'sending' }));

        // Check packet loss
        if (packetLossEnabled && Math.random() < 0.25) {
          setPacketLost(true);
          setTimeout(() => {
            setPhase(PHASES.COMPLETE);
            setIsPlaying(false);
            setDeviceStates({});
          }, 2000 / speed);
          return false;
        }

        // After transmitting animation, move to filtering
        setTimeout(() => {
          if (phaseRef.current !== PHASES.TRANSMITTING) return;
          setPhase(PHASES.FILTERING);

          // Set filter results for all non-sender devices
          const results = {};
          const states = {};
          devices.forEach(d => {
            if (d.id === senderId) {
              states[d.id] = 'sending';
              return;
            }
            if (d.id === receiverId) {
              results[d.id] = 'accepted';
              states[d.id] = 'accepted';
            } else {
              results[d.id] = 'rejected';
              states[d.id] = 'rejected';
            }
          });
          setFilterResults(results);
          setDeviceStates(states);

          // After filtering animation, move to de-encapsulation
          setTimeout(() => {
            if (phaseRef.current !== PHASES.FILTERING) return;
            setPhase(PHASES.DEENCAPSULATING);
            setShowDecapPanel(true);
            // Start with full packet for de-encap
            const fullPkt = buildPacketAtLayer(4, { data: message, protocol, sender, receiver });
            setDecapPacketLayers(fullPkt);
            setDecapLayer(4);
            setDeviceStates(prev => {
              const s = {};
              devices.forEach(d => {
                if (d.id === receiverId) s[d.id] = 'receiving';
                else if (d.id === senderId) s[d.id] = 'idle';
                else s[d.id] = 'idle';
              });
              return s;
            });
            setFilterResults({});
          }, 2500 / speed);
        }, 2000 / speed);

        return false; // Don't continue auto-stepping through transmit/filter
      }
    }

    if (p === PHASES.DEENCAPSULATING) {
      const nextLayer = dl - 1;
      if (nextLayer >= 0) {
        setDecapLayer(nextLayer);
        // Strip outermost layer
        const fullPkt = buildPacketAtLayer(4, { data: message, protocol, sender, receiver });
        const remaining = fullPkt.slice(0, nextLayer + 1);
        setDecapPacketLayers(remaining);
      } else {
        // Complete!
        setPhase(PHASES.COMPLETE);
        setIsPlaying(false);
        setDeviceStates(prev => {
          const s = {};
          devices.forEach(d => {
            if (d.id === receiverId) s[d.id] = 'accepted';
            else s[d.id] = 'idle';
          });
          return s;
        });
        setDecapLayer(-1);
        return false;
      }
    }

    return true; // continue stepping
  }, [devices, senderId, receiverId, sender, receiver, message, protocol, packetLossEnabled, speed]);

  // ── Autoplay ──
  useEffect(() => {
    if (isPlaying) {
      const tick = () => {
        const shouldContinue = doStep();
        if (shouldContinue) {
          timerRef.current = setTimeout(tick, delay());
        } else {
          // For transmit/filter phases doStep returns false but we're not done
          // The setTimeout chains inside doStep handle progression
          // Just schedule a check
          if (phaseRef.current !== PHASES.COMPLETE && phaseRef.current !== PHASES.IDLE) {
            timerRef.current = setTimeout(tick, delay() + 500);
          }
        }
      };
      timerRef.current = setTimeout(tick, delay());
    }
    return () => clearTimeout(timerRef.current);
  }, [isPlaying, doStep, delay]);

  // ── Handlers ──
  const handlePlay = () => {
    if (phase === PHASES.IDLE || phase === PHASES.COMPLETE) {
      // Reset and start
      setPhase(PHASES.ENCAPSULATING);
      setEncapLayer(-1);
      setDecapLayer(-1);
      setPacketLayers([]);
      setDecapPacketLayers([]);
      setDeviceStates({ [senderId]: 'sending' });
      setFilterResults({});
      setPacketLost(false);
      setShowDecapPanel(false);
    }
    setIsPlaying(true);
  };

  const handlePause = () => setIsPlaying(false);

  const handleStep = () => {
    if (phase === PHASES.IDLE) {
      handlePlay();
      setIsPlaying(false);
    }
    doStep();
  };

  const handleReset = () => {
    clearTimeout(timerRef.current);
    setIsPlaying(false);
    setPhase(PHASES.IDLE);
    setEncapLayer(-1);
    setDecapLayer(-1);
    setPacketLayers([]);
    setDecapPacketLayers([]);
    setDeviceStates({});
    setFilterResults({});
    setPacketLost(false);
    setShowDecapPanel(false);
  };

  const isSimRunning = phase !== PHASES.IDLE && phase !== PHASES.COMPLETE;

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* ═══ Header ═══ */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-border-dim bg-bg-primary/80 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🌐</span>
          <div>
            <h1 className="text-sm font-bold tracking-wider text-neon-cyan text-glow-cyan uppercase">
              TCP/IP Network Simulator
            </h1>
            <p className="text-[10px] text-text-muted">Full Duplex Encapsulation & De-encapsulation</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-mono px-3 py-1 rounded-full border border-border-dim text-text-muted">
            {protocol} Mode
          </span>
          <span className="text-[10px] font-mono px-3 py-1 rounded-full border text-text-muted"
            style={{
              borderColor: phase === 'IDLE' ? '#1e293b' : phase === 'COMPLETE' ? '#00ff88' : '#00f0ff',
              color: phase === 'IDLE' ? '#64748b' : phase === 'COMPLETE' ? '#00ff88' : '#00f0ff',
            }}>
            {phase}
          </span>
        </div>
      </header>

      {/* ═══ Main Layout ═══ */}
      <div className="flex-1 flex overflow-hidden">
        {/* ── Left Panel: Encapsulation ── */}
        <aside className="w-[280px] shrink-0 p-3 overflow-y-auto border-r border-border-dim">
          <EncapsulationView
            activeLayer={phase === PHASES.ENCAPSULATING ? encapLayer : -1}
            packetLayers={packetLayers}
          />
        </aside>

        {/* ── Center: Canvas + Bottom Controls ── */}
        <main className="flex-1 flex flex-col p-3 gap-3 min-w-0">
          {/* Network Canvas */}
          <NetworkCanvas
            devices={devices}
            senderId={senderId}
            receiverId={receiverId}
            phase={phase}
            deviceStates={deviceStates}
            filterResults={filterResults}
            packetLost={packetLost}
          />

          {/* Bottom row: Packet Inspector + Decision Logic */}
          <div className="flex gap-3 shrink-0">
            <div className="flex-1">
              <PacketInspector
                packetLayers={
                  phase === PHASES.DEENCAPSULATING || phase === PHASES.COMPLETE
                    ? decapPacketLayers
                    : packetLayers
                }
                title={
                  phase === PHASES.DEENCAPSULATING
                    ? 'Unwrapping Packet'
                    : phase === PHASES.COMPLETE
                    ? 'Final Data'
                    : 'Building Packet'
                }
              />
            </div>

            {/* Decision Logic Panel */}
            <div className="flex-1 glass-card p-4 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-widest text-neon-yellow" style={{ textShadow: '0 0 10px rgba(255,238,0,0.3)' }}>
                🧠 Decision Logic
              </h3>
              <AnimatePresence mode="wait">
                {phase === PHASES.FILTERING ? (
                  <motion.div
                    key="filtering"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-2"
                  >
                    {devices.filter(d => d.id !== senderId).map(d => {
                      const isTarget = d.id === receiverId;
                      return (
                        <motion.div
                          key={d.id}
                          initial={{ x: -10, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          className="flex items-center gap-2 text-[11px] p-2 rounded-lg border"
                          style={{
                            background: isTarget ? 'rgba(0,255,136,0.1)' : 'rgba(255,51,85,0.1)',
                            borderColor: isTarget ? '#00ff8844' : '#ff335544',
                          }}
                        >
                          <span className="font-mono text-text-secondary w-20 truncate">{d.name}</span>
                          <span className="text-text-muted">MAC:</span>
                          <span className={`font-mono ${isTarget ? 'text-neon-green' : 'text-neon-red'}`}>
                            {isTarget ? '✔ Match' : '✘ No Match'}
                          </span>
                          <span className="ml-auto font-bold" style={{ color: isTarget ? '#00ff88' : '#ff3355' }}>
                            {isTarget ? 'ACCEPT' : 'DROP'}
                          </span>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                ) : phase === PHASES.DEENCAPSULATING && decapLayer >= 0 ? (
                  <motion.div
                    key="decap"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-2"
                  >
                    <div className="text-[11px] text-text-secondary p-2 rounded-lg border border-border-dim">
                      <div className="flex justify-between">
                        <span>IP Match?</span>
                        <span className="text-neon-green">✔ {receiver?.ip}</span>
                      </div>
                    </div>
                    <div className="text-[11px] text-text-secondary p-2 rounded-lg border border-border-dim">
                      <div className="flex justify-between">
                        <span>MAC Match?</span>
                        <span className="text-neon-green">✔ {receiver?.mac?.slice(0, 11)}...</span>
                      </div>
                    </div>
                    <div className="text-[11px] text-text-secondary p-2 rounded-lg border border-border-dim">
                      <div className="flex justify-between">
                        <span>Port Match?</span>
                        <span className="text-neon-green">✔ Port {protocol === 'UDP' ? '53' : '80'}</span>
                      </div>
                    </div>
                  </motion.div>
                ) : phase === PHASES.COMPLETE ? (
                  <motion.div
                    key="complete"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-4"
                  >
                    <div className="text-3xl mb-2">✅</div>
                    <div className="text-xs text-neon-green font-bold">DATA DELIVERED</div>
                    <div className="text-[10px] text-text-muted mt-1">
                      "{message}" received by {receiver?.name}
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="idle"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-6 text-text-muted text-[11px]"
                  >
                    Decision checks will appear during filtering and de-encapsulation phases
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </main>

        {/* ── Right Panel: De-encapsulation + Controls ── */}
        <aside className="w-[280px] shrink-0 p-3 overflow-y-auto border-l border-border-dim space-y-3">
          {/* Controls */}
          <ControlsPanel
            phase={phase}
            speed={speed}
            setSpeed={setSpeed}
            protocol={protocol}
            setProtocol={setProtocol}
            packetLoss={packetLossEnabled}
            setPacketLoss={setPacketLossEnabled}
            onPlay={handlePlay}
            onPause={handlePause}
            onStep={handleStep}
            onReset={handleReset}
            isPlaying={isPlaying}
            senderId={senderId}
            receiverId={receiverId}
            devices={devices}
            setSenderId={setSenderId}
            setReceiverId={setReceiverId}
            message={message}
            setMessage={setMessage}
          />

          {/* De-encapsulation panel (shows when relevant) */}
          <AnimatePresence>
            {(showDecapPanel || phase === PHASES.DEENCAPSULATING || phase === PHASES.COMPLETE) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <DeencapsulationView
                  activeLayer={phase === PHASES.DEENCAPSULATING ? decapLayer : -1}
                  packetLayers={decapPacketLayers}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Device Manager */}
          <DeviceManager
            devices={devices}
            setDevices={setDevices}
            disabled={isSimRunning}
          />
        </aside>
      </div>
    </div>
  );
}
