import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import NetworkCanvas from './components/NetworkCanvas';
import EncapsulationView from './components/EncapsulationView';
import DeencapsulationView from './components/DeencapsulationView';
import PacketInspector from './components/PacketInspector';
import ControlsPanel from './components/ControlsPanel';
import DeviceManager from './components/DeviceManager';
import { LAYERS, PHASES, createDefaultDevices, buildPacketAtLayer } from './simulation/simulationEngine';

const TOTAL_ENCAP_STEPS = 5;

export default function App() {
  const [devices, setDevices] = useState(createDefaultDevices);
  const [senderId, setSenderId] = useState('');
  const [receiverId, setReceiverId] = useState('');

  const [phase, setPhase] = useState(PHASES.IDLE);
  const [encapLayer, setEncapLayer] = useState(-1);
  const [decapLayer, setDecapLayer] = useState(-1);
  const [packetLayers, setPacketLayers] = useState([]);
  const [decapPacketLayers, setDecapPacketLayers] = useState([]);
  const [deviceStates, setDeviceStates] = useState({});
  const [filterResults, setFilterResults] = useState({});
  const [packetLost, setPacketLost] = useState(false);

  const [speed, setSpeed] = useState(1);
  const [protocol, setProtocol] = useState('TCP');
  const [packetLossEnabled, setPacketLossEnabled] = useState(false);
  const [message, setMessage] = useState('Hello, World!');
  const [isPlaying, setIsPlaying] = useState(false);
  const [showDecapPanel, setShowDecapPanel] = useState(false);

  const timerRef = useRef(null);
  const phaseRef = useRef(phase);
  const encapRef = useRef(encapLayer);
  const decapRef = useRef(decapLayer);
  phaseRef.current = phase;
  encapRef.current = encapLayer;
  decapRef.current = decapLayer;

  const sender = devices.find(d => d.id === senderId);
  const receiver = devices.find(d => d.id === receiverId);

  const delay = useCallback(() => 1500 / speed, [speed]);

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
        setPhase(PHASES.TRANSMITTING);
        setDeviceStates(prev => ({ ...prev, [senderId]: 'sending' }));

        if (packetLossEnabled && Math.random() < 0.25) {
          setPacketLost(true);
          setTimeout(() => {
            setPhase(PHASES.COMPLETE);
            setIsPlaying(false);
            setDeviceStates({});
          }, 2000 / speed);
          return false;
        }

        setTimeout(() => {
          if (phaseRef.current !== PHASES.TRANSMITTING) return;
          setPhase(PHASES.FILTERING);

          const results = {};
          const states = {};
          devices.forEach(d => {
            if (d.id === senderId) { states[d.id] = 'sending'; return; }
            if (d.id === receiverId) { results[d.id] = 'accepted'; states[d.id] = 'accepted'; }
            else { results[d.id] = 'rejected'; states[d.id] = 'rejected'; }
          });
          setFilterResults(results);
          setDeviceStates(states);

          setTimeout(() => {
            if (phaseRef.current !== PHASES.FILTERING) return;
            setPhase(PHASES.DEENCAPSULATING);
            setShowDecapPanel(true);
            const fullPkt = buildPacketAtLayer(4, { data: message, protocol, sender, receiver });
            setDecapPacketLayers(fullPkt);
            setDecapLayer(4);
            setDeviceStates(() => {
              const s = {};
              devices.forEach(d => {
                if (d.id === receiverId) s[d.id] = 'receiving';
                else s[d.id] = 'idle';
              });
              return s;
            });
            setFilterResults({});
          }, 2500 / speed);
        }, 2000 / speed);

        return false;
      }
    }

    if (p === PHASES.DEENCAPSULATING) {
      const nextLayer = dl - 1;
      if (nextLayer >= 0) {
        setDecapLayer(nextLayer);
        const fullPkt = buildPacketAtLayer(4, { data: message, protocol, sender, receiver });
        const remaining = fullPkt.slice(0, nextLayer + 1);
        setDecapPacketLayers(remaining);
      } else {
        setPhase(PHASES.COMPLETE);
        setIsPlaying(false);
        setDeviceStates(() => {
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

    return true;
  }, [devices, senderId, receiverId, sender, receiver, message, protocol, packetLossEnabled, speed]);

  useEffect(() => {
    if (isPlaying) {
      const tick = () => {
        const shouldContinue = doStep();
        if (shouldContinue) {
          timerRef.current = setTimeout(tick, delay());
        } else {
          if (phaseRef.current !== PHASES.COMPLETE && phaseRef.current !== PHASES.IDLE) {
            timerRef.current = setTimeout(tick, delay() + 500);
          }
        }
      };
      timerRef.current = setTimeout(tick, delay());
    }
    return () => clearTimeout(timerRef.current);
  }, [isPlaying, doStep, delay]);

  const handlePlay = () => {
    if (phase === PHASES.IDLE || phase === PHASES.COMPLETE) {
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
  const showEncap = phase === PHASES.ENCAPSULATING || phase === PHASES.IDLE;
  const showDecap = showDecapPanel || phase === PHASES.DEENCAPSULATING || phase === PHASES.COMPLETE;

  const showEncapPanel = phase === PHASES.IDLE || phase === PHASES.ENCAPSULATING || phase === PHASES.TRANSMITTING || phase === PHASES.FILTERING;

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* ═══ Header ═══ */}
      <header
        className="flex items-center justify-between px-7 py-3 shrink-0"
        style={{
          background: 'linear-gradient(135deg, rgba(6,8,15,0.97), rgba(11,16,34,0.97))',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(26,35,64,0.6)',
        }}
      >
        <div className="flex items-center gap-4">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
            style={{
              background: 'linear-gradient(135deg, rgba(0,212,230,0.12), rgba(0,212,230,0.04))',
              border: '1px solid rgba(0,212,230,0.18)',
              boxShadow: '0 0 15px rgba(0,212,230,0.08)',
            }}
          >
            🌐
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-widest text-neon-cyan text-glow-cyan uppercase">
              TCP/IP Network Simulator
            </h1>
            <p className="text-[11px] text-text-muted tracking-wide mt-0.5">
              Full Duplex Encapsulation & De-encapsulation Visualizer
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span
            className="text-[11px] font-mono px-3 py-1.5 rounded-lg font-semibold"
            style={{
              background: protocol === 'TCP' ? 'rgba(96,165,250,0.1)' : 'rgba(245,158,11,0.1)',
              border: `1px solid ${protocol === 'TCP' ? 'rgba(96,165,250,0.25)' : 'rgba(245,158,11,0.25)'}`,
              color: protocol === 'TCP' ? '#60a5fa' : '#f59e0b',
            }}
          >
            {protocol}
          </span>
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
            style={{
              background: phase === 'IDLE' ? 'rgba(26,35,64,0.3)' : phase === 'COMPLETE' ? 'rgba(0,232,123,0.06)' : 'rgba(0,212,230,0.06)',
              border: `1px solid ${phase === 'IDLE' ? 'rgba(26,35,64,0.6)' : phase === 'COMPLETE' ? 'rgba(0,232,123,0.2)' : 'rgba(0,212,230,0.2)'}`,
            }}
          >
            <div
              className="w-2 h-2 rounded-full animate-pulse"
              style={{
                background: phase === 'IDLE' ? '#5c6b8a' : phase === 'COMPLETE' ? '#00e87b' : '#00d4e6',
              }}
            />
            <span
              className="text-[11px] font-mono uppercase tracking-wider font-semibold"
              style={{
                color: phase === 'IDLE' ? '#5c6b8a' : phase === 'COMPLETE' ? '#00e87b' : '#00d4e6',
              }}
            >
              {phase}
            </span>
          </div>
        </div>
      </header>

      {/* ═══ Main Layout ═══ */}
      <div className="flex-1 flex overflow-hidden">
        {/* ── Left Panel: Encapsulation / De-encapsulation ── */}
        <aside
          className="w-[360px] shrink-0 p-4 overflow-y-auto"
          style={{ borderRight: '1px solid rgba(26,35,64,0.5)' }}
        >
          <AnimatePresence mode="wait">
            {!showDecap ? (
              <motion.div key="encap" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full">
                <EncapsulationView
                  activeLayer={phase === PHASES.ENCAPSULATING ? encapLayer : -1}
                  packetLayers={packetLayers}
                />
              </motion.div>
            ) : (
              <motion.div key="decap" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full">
                <DeencapsulationView
                  activeLayer={phase === PHASES.DEENCAPSULATING ? decapLayer : -1}
                  packetLayers={decapPacketLayers}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </aside>

        {/* ── Center: Canvas + Bottom Panels ── */}
        <main className="flex-1 flex flex-col p-4 gap-4 min-w-0">
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

          {/* Bottom row */}
          <div className="flex gap-4 shrink-0" style={{ minHeight: '200px' }}>
            {/* Packet Inspector */}
            <div className="flex-1">
              <PacketInspector
                packetLayers={
                  phase === PHASES.DEENCAPSULATING || phase === PHASES.COMPLETE
                    ? decapPacketLayers
                    : packetLayers
                }
                title={
                  phase === PHASES.DEENCAPSULATING
                    ? '📦 Unwrapping Packet'
                    : phase === PHASES.COMPLETE
                    ? '✅ Final Data'
                    : '📦 Building Packet'
                }
              />
            </div>

            {/* Decision Logic Panel */}
            <div className="flex-1 glass-card px-7 py-6">
              <h3
                className="panel-heading-sm"
                style={{ color: '#facc15', textShadow: '0 0 10px rgba(250,204,21,0.25)' }}
              >
                <span>🧠</span> Decision Logic
              </h3>
              <AnimatePresence mode="wait">
                {phase === PHASES.FILTERING ? (
                  <motion.div key="filtering" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-2">
                    {devices.filter(d => d.id !== senderId).map(d => {
                      const isTarget = d.id === receiverId;
                      return (
                        <motion.div
                          key={d.id}
                          initial={{ x: -15, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          className="flex items-center gap-3 text-xs p-3 rounded-xl"
                          style={{
                            background: isTarget ? 'rgba(0,232,123,0.05)' : 'rgba(244,63,94,0.05)',
                            border: `1px solid ${isTarget ? 'rgba(0,232,123,0.15)' : 'rgba(244,63,94,0.15)'}`,
                          }}
                        >
                          <span className="font-semibold text-text-primary w-20 truncate">{d.name}</span>
                          <div className="flex-1 text-center">
                            <span className="text-text-muted text-[11px]">DST MAC → </span>
                            <span className="font-mono font-semibold" style={{ color: isTarget ? '#00e87b' : '#f43f5e' }}>
                              {isTarget ? '✔ Match' : '✘ Mismatch'}
                            </span>
                          </div>
                          <span
                            className="font-bold text-[11px] px-2.5 py-1 rounded-md"
                            style={{
                              background: isTarget ? 'rgba(0,232,123,0.1)' : 'rgba(244,63,94,0.1)',
                              color: isTarget ? '#00e87b' : '#f43f5e',
                            }}
                          >
                            {isTarget ? 'ACCEPT ✔' : 'DROP ✘'}
                          </span>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                ) : phase === PHASES.DEENCAPSULATING && decapLayer >= 0 ? (
                  <motion.div key="decap" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-2">
                    {[
                      { label: 'MAC Address Match?', value: receiver?.mac?.slice(0, 11) + '…', ok: true },
                      { label: 'IP Address Match?', value: receiver?.ip, ok: true },
                      { label: 'Port Process Match?', value: `Port ${protocol === 'UDP' ? '53' : '80'}`, ok: true },
                    ].map((check, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'rgba(0,232,123,0.04)', border: '1px solid rgba(0,232,123,0.1)' }}>
                        <span className="text-xs text-text-secondary">{check.label}</span>
                        <span className="text-xs font-mono text-neon-green font-bold">✔ {check.value}</span>
                      </div>
                    ))}
                  </motion.div>
                ) : phase === PHASES.COMPLETE ? (
                  <motion.div key="complete" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-6">
                    <motion.div
                      className="text-4xl mb-3"
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >✅</motion.div>
                    <div className="text-sm text-neon-green font-bold tracking-wide" style={{ textShadow: '0 0 15px rgba(0,232,123,0.35)' }}>
                      DATA DELIVERED SUCCESSFULLY
                    </div>
                    <div className="text-xs text-text-muted mt-2">
                      "{message}" → {receiver?.name}
                    </div>
                  </motion.div>
                ) : (
                  <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-8 text-text-muted text-xs">
                    <span className="text-2xl block mb-3 opacity-30">🧠</span>
                    Decision logic appears during filtering & de-encapsulation
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </main>

        {/* ── Right Panel: Controls + Device Manager ── */}
        <aside
          className="w-[290px] shrink-0 p-4 overflow-y-auto flex flex-col gap-4"
          style={{ borderLeft: '1px solid rgba(26,35,64,0.5)' }}
        >
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
