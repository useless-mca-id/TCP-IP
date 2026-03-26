// TCP/IP Layer definitions and descriptions
export const LAYERS = [
  {
    id: 'application',
    name: 'Application Layer',
    shortName: 'Application',
    color: '#a855f7',
    bg: 'rgba(168,85,247,0.15)',
    cssClass: 'layer-application',
    encapTitle: 'Creating Application Data',
    encapDesc: 'User data is prepared for transmission. The application protocol (HTTP, FTP, etc.) formats the data.',
    encapAdded: 'Application Data Payload',
    decapTitle: 'Data Delivered to Application',
    decapDesc: 'The original data is reconstructed and delivered to the receiving application.',
    decapRemoved: 'Final data extracted',
  },
  {
    id: 'transport',
    name: 'Transport Layer',
    shortName: 'Transport',
    color: '#3b82f6',
    bg: 'rgba(59,130,246,0.15)',
    cssClass: 'layer-transport',
    encapTitle: 'Segmenting Data',
    encapDesc: 'Data is split into segments. Port numbers are added for process-to-process identification.',
    encapAdded: 'TCP/UDP Header (Src Port, Dst Port, Seq#, Checksum)',
    decapTitle: 'Port Processing',
    decapDesc: 'Transport header is removed. Port numbers identify the destination process.',
    decapRemoved: 'TCP/UDP Header stripped',
  },
  {
    id: 'network',
    name: 'Network Layer',
    shortName: 'Network',
    color: '#22c55e',
    bg: 'rgba(34,197,94,0.15)',
    cssClass: 'layer-network',
    encapTitle: 'Adding Logical Addressing',
    encapDesc: 'IP addresses are added for end-to-end routing across networks.',
    encapAdded: 'IP Header (Src IP, Dst IP, TTL, Protocol)',
    decapTitle: 'IP Verification',
    decapDesc: 'IP header is removed after verifying this device is the intended destination.',
    decapRemoved: 'IP Header stripped',
  },
  {
    id: 'datalink',
    name: 'Data Link Layer',
    shortName: 'Data Link',
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.15)',
    cssClass: 'layer-datalink',
    encapTitle: 'Framing Data',
    encapDesc: 'MAC addresses added for hop-to-hop delivery on the local network. Data is framed with error detection.',
    encapAdded: 'MAC Header (Src MAC, Dst MAC) + FCS Trailer',
    decapTitle: 'MAC Address Check',
    decapDesc: 'Frame is inspected. MAC address is compared to determine if this device is the intended recipient.',
    decapRemoved: 'MAC Header & FCS removed',
  },
  {
    id: 'physical',
    name: 'Physical Layer',
    shortName: 'Physical',
    color: '#ef4444',
    bg: 'rgba(239,68,68,0.15)',
    cssClass: 'layer-physical',
    encapTitle: 'Converting to Signals',
    encapDesc: 'Digital frame is converted into electrical signals, light pulses, or radio waves for transmission over the physical medium.',
    encapAdded: 'Signal encoding (bits → physical signals)',
    decapTitle: 'Signal Reception',
    decapDesc: 'Physical signals are received and converted back into a digital bit stream.',
    decapRemoved: 'Signals → Digital bits',
  },
];

// Simulation phases
export const PHASES = {
  IDLE: 'IDLE',
  ENCAPSULATING: 'ENCAPSULATING',
  TRANSMITTING: 'TRANSMITTING',
  FILTERING: 'FILTERING',
  DEENCAPSULATING: 'DEENCAPSULATING',
  COMPLETE: 'COMPLETE',
};

// Generate a random MAC address
export function randomMAC() {
  const hex = () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0').toUpperCase();
  return `${hex()}:${hex()}:${hex()}:${hex()}:${hex()}:${hex()}`;
}

// Generate a random local IP
export function randomIP() {
  return `192.168.1.${Math.floor(Math.random() * 254) + 1}`;
}

// Default devices for the simulator
export function createDefaultDevices() {
  return [
    { id: 'dev1', name: 'PC-Alpha', ip: '192.168.1.10', mac: 'AA:BB:CC:DD:EE:01', type: 'pc' },
    { id: 'dev2', name: 'Server-01', ip: '192.168.1.20', mac: 'AA:BB:CC:DD:EE:02', type: 'server' },
    { id: 'dev3', name: 'PC-Beta', ip: '192.168.1.30', mac: 'AA:BB:CC:DD:EE:03', type: 'pc' },
    { id: 'dev4', name: 'Laptop-01', ip: '192.168.1.40', mac: 'AA:BB:CC:DD:EE:04', type: 'laptop' },
  ];
}

// Build packet at each layer (encapsulation)
export function buildPacketAtLayer(layerIndex, { data, protocol, sender, receiver }) {
  const layers = [];

  // Application layer - always present
  layers.push({
    layer: 'application',
    label: 'DATA',
    content: data || 'Hello, World!',
    color: LAYERS[0].color,
  });

  if (layerIndex >= 1) {
    const srcPort = Math.floor(Math.random() * 16384) + 49152;
    const dstPort = protocol === 'UDP' ? 53 : 80;
    layers.push({
      layer: 'transport',
      label: `${protocol || 'TCP'} HDR`,
      content: `SrcPort:${srcPort} DstPort:${dstPort}${protocol === 'TCP' ? ' Seq:1001 ACK:1' : ''}`,
      color: LAYERS[1].color,
    });
  }

  if (layerIndex >= 2) {
    layers.push({
      layer: 'network',
      label: 'IP HDR',
      content: `SrcIP:${sender?.ip || '?'} DstIP:${receiver?.ip || '?'} TTL:64`,
      color: LAYERS[2].color,
    });
  }

  if (layerIndex >= 3) {
    layers.push({
      layer: 'datalink',
      label: 'MAC HDR',
      content: `SrcMAC:${sender?.mac || '?'} DstMAC:${receiver?.mac || '?'}`,
      color: LAYERS[3].color,
    });
  }

  if (layerIndex >= 4) {
    layers.push({
      layer: 'physical',
      label: 'SIGNALS',
      content: '01101001 01001000 01100101 ...',
      color: LAYERS[4].color,
    });
  }

  return layers;
}

// Strip packet at each layer (de-encapsulation) — returns remaining layers
export function stripPacketAtLayer(layerIndex, fullPacket) {
  // layerIndex 0 = physical received, 1 = datalink stripped, etc.
  return fullPacket.slice(0, fullPacket.length - layerIndex);
}
