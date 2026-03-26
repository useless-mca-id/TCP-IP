import { useState } from 'react';
import { createPortal } from 'react-dom';
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
    <div className="glass-card px-7 py-5 flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h3 className="panel-heading text-neon-magenta text-glow-magenta" style={{ marginBottom: 0, paddingBottom: 0, borderBottom: 'none' }}>
          <span>🌐</span> Devices ({devices.length})
        </h3>
        <button
          onClick={openAdd}
          disabled={disabled}
          className="neon-btn magenta text-[12px] px-4 py-2"
        >
          + Add
        </button>
      </div>

      {/* Device list */}
      <div className="flex flex-col gap-2 max-h-[220px] overflow-y-auto pr-1">
        {devices.map(dev => (
          <div
            key={dev.id}
            className="flex items-center justify-between rounded-xl px-4 py-3 border border-border-dim hover:border-neon-magenta/30 transition-colors group"
            style={{ background: 'rgba(6,8,15,0.5)' }}
          >
            <div className="flex items-center gap-3">
              <span className="text-lg">
                {dev.type === 'pc' ? '🖥️' : dev.type === 'server' ? '🗄️' : dev.type === 'laptop' ? '💻' : '📡'}
              </span>
              <div>
                <div className="text-xs font-semibold text-text-primary">{dev.name}</div>
                <div className="text-[10px] text-text-muted font-mono mt-0.5">{dev.ip} | {dev.mac.slice(0, 11)}…</div>
              </div>
            </div>
            <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => openEdit(dev)}
                disabled={disabled}
                className="text-sm text-text-muted hover:text-neon-cyan px-1.5 py-0.5 rounded transition-colors"
              >
                ✏️
              </button>
              <button
                onClick={() => remove(dev.id)}
                disabled={disabled || devices.length <= 2}
                className="text-sm text-text-muted hover:text-neon-red px-1.5 py-0.5 rounded transition-colors disabled:opacity-30"
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal — portaled to body to escape aside overflow */}
      {createPortal(
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
              className="glass-card px-8 py-7 w-[400px] glow-magenta"
            >
              <h4 className="text-sm font-bold text-neon-magenta mb-5">
                {editId ? 'Edit Device' : 'Add New Device'}
              </h4>

              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="section-label">Name</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="section-label">IP Address</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={form.ip}
                      onChange={(e) => setForm({ ...form, ip: e.target.value })}
                      className="flex-1 font-mono"
                    />
                    <button onClick={() => setForm({ ...form, ip: randomIP() })} className="neon-btn text-[11px] px-3">🔄</button>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="section-label">MAC Address</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={form.mac}
                      onChange={(e) => setForm({ ...form, mac: e.target.value })}
                      className="flex-1 font-mono"
                    />
                    <button onClick={() => setForm({ ...form, mac: randomMAC() })} className="neon-btn text-[11px] px-3">🔄</button>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="section-label">Type</label>
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
                        className={`flex-1 py-2.5 rounded-lg text-[12px] font-medium transition-all ${
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

              <div className="flex gap-2 mt-6">
                <button onClick={save} className="neon-btn green flex-1 py-3">
                  {editId ? 'Save Changes' : 'Add Device'}
                </button>
                <button onClick={() => setIsOpen(false)} className="neon-btn red flex-1 py-3">
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
