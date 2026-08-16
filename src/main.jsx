import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const networks = [
  { id: 'bibus', name: 'Bibus', city: 'Brest', accent: '#d7df00', deep: '#063b82', logo: 'BIBUS', description: 'Autobus, autocars et tramways du réseau brestois.', tagline: 'Le patrimoine roulant de Brest métropole.', intro: 'Explorez l’inventaire complet des autobus, autocars et tramways Bibus, des dernières mises en service aux véhicules qui ont marqué le réseau.' },
  { id: 'lemet', name: 'TCRM / Le Met', city: 'Metz', accent: '#f5a400', deep: '#4a1768', logo: 'TCRM', description: 'Le parc historique et actuel du réseau messin.', tagline: 'Le patrimoine roulant de Metz Métropole.', intro: 'Explorez les autobus et autocars TCRM puis Le Met’, des véhicules les plus récents aux témoins de l’histoire du réseau.' },
  { id: 'yelo', name: 'Yélo', city: 'La Rochelle', accent: '#ffd500', deep: '#25282a', logo: 'yélo', description: 'Le patrimoine roulant de La Rochelle.', tagline: 'Le patrimoine roulant de La Rochelle.', intro: 'Découvrez la collection complète des autobus et autocars Yélo, des nouvelles générations aux véhicules historiques du réseau rochelais.' },
  { id: 'tfl', name: 'TfL London', city: 'London', accent: '#e21b2d', deep: '#b50917', logo: 'TfL', description: 'Bus londoniens et patrimoine du réseau TfL.', tagline: 'The rolling stock of London.', intro: 'Explore the complete inventory of TfL buses and coaches, from the latest vehicles in service to iconic models that shaped London transport.' },
];

const demoVehicles = [
  { id: 'bibus-demo', network: 'bibus', park: '—', registration: '—', brand: 'Mercedes-Benz', model: 'Citaro', type: 'Bus standard', date: '2026-01-01', status: 'En service', image: '' },
  { id: 'lemet-demo', network: 'lemet', park: '—', registration: '—', brand: 'Mercedes-Benz', model: 'Citaro G C2 Hybrid', type: 'Bus articulé', date: '2026-04-01', status: 'En service', image: '' },
  { id: 'yelo-demo', network: 'yelo', park: '—', registration: '—', brand: '—', model: '—', type: 'Bus', date: '2026-01-01', status: 'En service', image: '' },
];

function NetworkLogo({ network }) {
  if (network.id === 'tfl') return <div className="brand-logo tfl-logo"><span className="tfl-roundel"><i /></span><strong>TfL</strong></div>;
  if (network.id === 'yelo') return <div className="brand-logo yelo-logo">yélo</div>;
  if (network.id === 'lemet') return <div className="brand-logo tcrm-logo">TCRM<span>Le Met’</span></div>;
  return <div className="brand-logo bibus-logo"><span className="bibus-symbol">b</span><strong>bibus</strong></div>;
}

function Home({ onSelect }) {
  return <>
    <header className="home-hero"><div className="eyebrow">BUS COLLECTION</div><h1>Le patrimoine<br /><em>roulant.</em></h1><p>Ta collection personnelle d’autobus, autocars et tramways, réseau par réseau.</p></header>
    <section className="networks"><div className="section-title">Choisir un réseau</div><div className="network-grid">
      {networks.map(network => <button className="network-card" key={network.id} onClick={() => onSelect(network.id)} style={{ '--accent': network.accent, '--deep': network.deep }}><NetworkLogo network={network}/><div><h2>{network.name}</h2><span>{network.city}</span><p>{network.description}</p></div><span className="arrow">→</span></button>)}
    </div></section>
  </>;
}

function VehicleCard({ vehicle, accent, onOpen }) {
  const retired = /réform|retir|hors/i.test(vehicle.status || '');
  return <button className={`vehicle-card ${retired ? 'retired' : ''}`} style={{ '--accent': accent }} onClick={() => onOpen(vehicle)} aria-label={`Voir la fiche du véhicule ${vehicle.park}`}>
    <div className="vehicle-photo">{vehicle.image ? <img src={vehicle.image} alt={`${vehicle.brand} ${vehicle.model} ${vehicle.park}`} /> : <div className="no-photo"><span>📷</span><small>Photo à ajouter</small></div>}{retired && <b className="retired-badge">RÉFORMÉ</b>}</div>
    <div className="vehicle-body"><div className="vehicle-title"><strong>#{vehicle.park}</strong><span>{vehicle.type}</span></div><h3>{vehicle.brand} {vehicle.model}</h3><div className="vehicle-meta"><div><small>IMMATRICULATION</small><b>{vehicle.registration || '—'}</b></div><div><small>MISE EN CIRCULATION</small><b>{vehicle.date || '—'}</b></div></div><div className="vehicle-more">Voir la fiche →</div></div>
  </button>;
}

function VehicleDetails({ vehicle, network, onClose }) {
  if (!vehicle) return null;
  const fields = [['Numéro de parc', vehicle.park],['Immatriculation', vehicle.registration],['Constructeur', vehicle.brand],['Modèle', vehicle.model],['Type', vehicle.type],['Mise en circulation', vehicle.date],['Statut', vehicle.status]].filter(([, value]) => value && value !== '—');
  return <div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
    <div className="vehicle-modal" role="dialog" aria-modal="true" aria-label={`Fiche ${vehicle.park}`} style={{ '--accent': network.accent }}>
      <button className="modal-close" onClick={onClose} aria-label="Fermer">×</button>
      <div className="modal-photo">{vehicle.image ? <img src={vehicle.image} alt={`${vehicle.brand} ${vehicle.model}`} /> : <div className="no-photo"><span>📷</span><small>Photo à ajouter</small></div>}</div>
      <div className="modal-content"><div className="eyebrow">{network.name}</div><div className="modal-title"><strong>#{vehicle.park}</strong><span>{vehicle.type}</span></div><h2>{vehicle.brand} {vehicle.model}</h2><div className="detail-list">{fields.map(([label, value]) => <div key={label}><small>{label}</small><b>{value}</b></div>)}</div><div className="detail-links">{vehicle.notionUrl && <a href={vehicle.notionUrl} target="_blank" rel="noreferrer">↗ Ouvrir dans Notion</a>}{vehicle.tcInfosUrl && <a href={vehicle.tcInfosUrl} target="_blank" rel="noreferrer">↗ Voir la fiche TC Infos</a>}</div></div>
    </div>
  </div>;
}

function Collection({ networkId, onBack }) {
  const network = networks.find(n => n.id === networkId);
  const [query, setQuery] = useState('');
  const [showRetired, setShowRetired] = useState(true);
  const [type, setType] = useState('Tous');
  const [vehicles, setVehicles] = useState(demoVehicles.filter(v => v.network === networkId));
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [synced, setSynced] = useState(false);
  const [error, setError] = useState('');

  const loadVehicles = async () => {
    setSyncing(true); setError('');
    try {
      let cursor = ''; let allVehicles = []; let safety = 0;
      do {
        const params = new URLSearchParams({ network: networkId, t: String(Date.now()) });
        if (cursor) params.set('cursor', cursor);
        const response = await fetch(`/api/vehicles?${params.toString()}`, { cache: 'no-store' });
        const data = await response.json();
        if (!response.ok) { const diagnostic = [data.details, data.notionStatus ? `HTTP ${data.notionStatus}` : '', data.notionCode].filter(Boolean).join(' · '); throw new Error([data.error || 'Erreur de synchronisation', diagnostic].filter(Boolean).join(' — ')); }
        if (!Array.isArray(data.vehicles)) throw new Error('Réponse Notion invalide');
        allVehicles.push(...data.vehicles); cursor = data.has_more && data.next_cursor ? data.next_cursor : ''; safety += 1;
        if (safety > 20) throw new Error('Synchronisation interrompue : trop de pages Notion.');
      } while (cursor);
      setVehicles(allVehicles); setSynced(true);
    } catch (e) { setSynced(false); setError(e.message || 'Impossible de synchroniser Notion'); }
    finally { setLoading(false); setSyncing(false); }
  };
  useEffect(() => { loadVehicles(); }, [networkId]);

  const types = ['Tous', ...new Set(vehicles.map(v => v.type).filter(Boolean))];
  const filtered = useMemo(() => vehicles.filter(v => {
    const haystack = `${v.park} ${v.registration} ${v.brand} ${v.model} ${v.type}`.toLowerCase();
    const retired = /réform|retir|hors/i.test(v.status || '');
    return haystack.includes(query.toLowerCase()) && (type === 'Tous' || v.type === type) && (showRetired || !retired);
  }).sort((a, b) => (b.date || '').localeCompare(a.date || '')), [vehicles, query, type, showRetired]);

  const retiredCount = vehicles.filter(v => /réform|retir|hors/i.test(v.status || '')).length;
  const activeCount = vehicles.length - retiredCount;

  return <div className={`network-page ${network.id}`} style={{ '--accent': network.accent, '--deep': network.deep }}>
    <header className="collection-head"><div className="topbar"><button className="back" onClick={onBack}>←</button><NetworkLogo network={network}/><button className="sync-top" onClick={loadVehicles} disabled={syncing}>↻ <span>{syncing ? 'Synchronisation…' : 'Synchroniser'}</span></button></div>
      <div className="collection-brand"><div><div className="eyebrow">{network.id === 'tfl' ? 'THE LONDON FLEET ALBUM' : `L’ALBUM DU PARC ${network.city.toUpperCase()}`}</div><h1>{network.tagline}</h1><p>{network.intro}</p></div></div>
      <div className="stats"><div><strong>{vehicles.length}</strong><span>véhicules</span></div><div><strong>{retiredCount}</strong><span>réformés</span></div><div><strong>{activeCount}</strong><span>{network.id === 'tfl' ? 'bus & coaches' : 'bus & cars'}</span></div></div>
    </header>
    <section className="toolbar"><div className="search"><span>⌕</span><input value={query} onChange={e => setQuery(e.target.value)} placeholder={network.id === 'tfl' ? 'Registration, fleet no., make, model…' : 'Immatriculation, parc, marque, modèle…'}/></div><div className="filters"><select value={type} onChange={e => setType(e.target.value)}>{types.map(t => <option key={t}>{t}</option>)}</select><button className={showRetired ? 'toggle active' : 'toggle'} onClick={() => setShowRetired(!showRetired)}>{network.id === 'tfl' ? 'All statuses' : 'Réformés'}</button></div></section>
    <div className="sync-line"><span>{loading ? 'Chargement…' : synced ? '● Synchronisé avec Notion' : '○ Connexion Notion indisponible'}</span><button onClick={loadVehicles} disabled={syncing}>{syncing ? 'Synchronisation…' : '↻ Synchroniser'}</button></div>
    {error && <div className="sync-error">{error}</div>}
    <div className="collection-note"><span>{filtered.length}</span> véhicule{filtered.length > 1 ? 's' : ''} · classés du plus récent au plus ancien</div>
    <section className="vehicle-grid">{filtered.map(vehicle => <VehicleCard key={vehicle.id} vehicle={vehicle} accent={network.accent} onOpen={setSelectedVehicle}/>)}</section>
    {!loading && filtered.length === 0 && <div className="empty">Aucun véhicule ne correspond à ta recherche.</div>}
    <VehicleDetails vehicle={selectedVehicle} network={network} onClose={() => setSelectedVehicle(null)} />
  </div>;
}

function App() { const [networkId, setNetworkId] = useState(null); return <main className="app">{networkId ? <Collection networkId={networkId} onBack={() => setNetworkId(null)}/> : <Home onSelect={setNetworkId}/>}<footer>Collection privée · source de données : Notion</footer></main>; }
createRoot(document.getElementById('root')).render(<App/>);
