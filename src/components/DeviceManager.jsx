import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { randomMAC, randomIP } from '../simulation/simulationEngine';

export default function DeviceManager({ devices, setDevices, disabled }) {
  const [isOpen, setIsOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: '', ip: '', mac: '', type: 'pc' });

  const openAdd = () => {
    setForm({ name: `Device-${devices.length + 1}`, ip: randomIP(), mac: randomMAC(), type: 'pc' });
    setEditId(null);
    setIsOpen(true);
  };

  const openEdit = (dev) => {
    setForm({ name: dev.name, ip: dev.ip, mac: dev.mac, type: dev.type });
    setEditId(dev.id);
    setIsOpen(true);
  };

  const save = () => {
    if (!form.name || !form.ip || !form.mac) return;
    if (editId) {
      setDevices(devices.map(d => d.id === editId ? { ...d, ...form } : d));
    } else {
      setDevices([...devices, { id: `dev${Date.now()}`, ...form }]);
    }
    setIsOpen(false);
  };

  const remove = (id) => {
    setDevices(devices.filter(d => d.id !== id));
  };

  return (
    <div className="glass-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-widest text-neon-magenta text-glow-magenta">
          🌐 Devices ({devices.length})
        </h3>
        <button
          onClick={openAdd}
          disabled={disabled}
          className="neon-btn magenta text-[10px] px-3 py-1"
        >
          + Add
        </button>
      </div>

      {/* Device list */}
      <div className="space-y-1.5 max-h-[200px] overflow-y-auto pr-1">
        {devices.map(dev => (
          <div
            key={dev.id}
            className="flex items-center justify-between bg-bg-primary/50 rounded-lg px-3 py-2 border border-border-dim hover:border-neon-magenta/30 transition-colors group"
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">
                {dev.type === 'pc' ? '🖥️' : dev.type === 'server' ? '🗄️' : dev.type === 'laptop' ? '💻' : '📡'}
              </span>
              <div>
                <div className="text-xs font-semibold text-text-primary">{dev.name}</div>
                <div className="text-[9px] text-text-muted">{dev.ip} | {dev.mac.slice(0, 11)}...</div>
              </div>
            </div>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => openEdit(dev)}
                disabled={disabled}
                className="text-[10px] text-text-muted hover:text-neon-cyan px-1"
              >
                ✏️
              </button>
              <button
                onClick={() => remove(dev.id)}
                disabled={disabled || devices.length <= 2}
                className="text-[10px] text-text-muted hover:text-neon-red px-1 disabled:opacity-30"
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card p-6 w-[360px] space-y-4 glow-magenta"
            >
              <h4 className="text-sm font-bold text-neon-magenta">
                {editId ? 'Edit Device' : 'Add New Device'}
              </h4>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-text-muted">Name</label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full bg-bg-primary border border-border-dim rounded-lg px-3 py-2 text-xs text-text-primary focus:border-neon-magenta focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-text-muted">IP Address</label>
                  <div className="flex gap-2">
                    <input
                      value={form.ip}
                      onChange={(e) => setForm({ ...form, ip: e.target.value })}
                      className="flex-1 bg-bg-primary border border-border-dim rounded-lg px-3 py-2 text-xs text-text-primary focus:border-neon-magenta focus:outline-none font-mono"
                    />
                    <button onClick={() => setForm({ ...form, ip: randomIP() })} className="neon-btn text-[10px] px-2">🔄</button>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-text-muted">MAC Address</label>
                  <div className="flex gap-2">
                    <input
                      value={form.mac}
                      onChange={(e) => setForm({ ...form, mac: e.target.value })}
                      className="flex-1 bg-bg-primary border border-border-dim rounded-lg px-3 py-2 text-xs text-text-primary focus:border-neon-magenta focus:outline-none font-mono"
                    />
                    <button onClick={() => setForm({ ...form, mac: randomMAC() })} className="neon-btn text-[10px] px-2">🔄</button>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-text-muted">Type</label>
                  <div className="flex gap-2">
                    {[
                      { v: 'pc', l: '🖥️ PC' },
                      { v: 'server', l: '🗄️ Server' },
                      { v: 'laptop', l: '💻 Laptop' },
                      { v: 'router', l: '📡 Router' },
                    ].map(t => (
                      <button
                        key={t.v}
                        onClick={() => setForm({ ...form, type: t.v })}
                        className={`flex-1 py-1.5 rounded-lg text-[11px] transition-all ${
                          form.type === t.v
                            ? 'bg-neon-magenta/20 border border-neon-magenta text-neon-magenta'
                            : 'bg-bg-primary border border-border-dim text-text-muted hover:border-text-muted'
                        }`}
                      >
                        {t.l}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button onClick={save} className="neon-btn green flex-1 text-xs py-2">
                  {editId ? 'Save Changes' : 'Add Device'}
                </button>
                <button onClick={() => setIsOpen(false)} className="neon-btn red flex-1 text-xs py-2">
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
