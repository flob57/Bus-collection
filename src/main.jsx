import React from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const networks = [
  { id: 'bibus', name: 'Bibus', city: 'Brest', accent: '#d7df00', emoji: '🚌' },
  { id: 'lemet', name: 'TCRM / Le Met', city: 'Metz', accent: '#f5a400', emoji: '🟣' },
  { id: 'yelo', name: 'Yélo', city: 'La Rochelle', accent: '#ffd500', emoji: '🚌' },
  { id: 'tfl', name: 'TfL London', city: 'London', accent: '#e21b2d', emoji: '🇬🇧' },
];

function App() {
  return (
    <main className="app">
      <header className="hero">
        <div className="eyebrow">BUS COLLECTION</div>
        <h1>Le patrimoine<br /><em>roulant.</em></h1>
        <p>Explore ta collection d’autobus, autocars et tramways, réseau par réseau.</p>
      </header>
      <section className="networks">
        <div className="section-title">Choisir un réseau</div>
        <div className="network-grid">
          {networks.map((network) => (
            <button className="network-card" key={network.id} style={{ '--accent': network.accent }}>
              <div className="network-badge">{network.emoji}</div>
              <div>
                <h2>{network.name}</h2>
                <span>{network.city}</span>
              </div>
              <span className="arrow">→</span>
            </button>
          ))}
        </div>
      </section>
      <footer>Collection privée · données issues de tes bases Notion</footer>
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);
