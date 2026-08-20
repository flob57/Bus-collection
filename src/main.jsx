import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const networks = [
  { id: 'bibus', name: 'Bibus', city: 'Brest', departmentCode: 29, departmentName: 'Finistère', accent: '#d7df00', deep: '#203b5e', logoUrl: 'https://files2.bibus.fr/s3fs-public/images/logo-bibus%20refait.png', heroImage: 'https://www.transbus.org/construc/mercedes-ecitaro-bibus.jpg', description: 'Autobus, autocars et tramways du réseau brestois.', tagline: 'Le patrimoine roulant de Brest métropole.', intro: 'Explorez l’inventaire complet des autobus, autocars et tramways Bibus, des dernières mises en service aux véhicules qui ont marqué le réseau.' },
  { id: 'lemet', name: 'TCRM / Le Met', city: 'Metz', departmentCode: 57, departmentName: 'Moselle', accent: '#f5b51b', deep: '#4b2168', logoUrl: 'https://commons.wikimedia.org/wiki/Special:Redirect/file/TCRM.jpg', heroImage: 'https://www.bus-bild.de/1200/frankreich--stadtbus-metz--151132.jpg', description: 'Le parc historique et actuel du réseau messin.', tagline: 'Le patrimoine roulant de Metz Métropole.', intro: 'Explorez les autobus et autocars TCRM puis Le Met’, des véhicules les plus récents aux témoins de l’histoire du réseau.' },
  { id: 'yelo', name: 'Yélo', city: 'La Rochelle', departmentCode: 17, departmentName: 'Charente-Maritime', accent: '#ffd500', deep: '#25282a', logoUrl: 'https://boutique-yelo.fr/_nuxt/logo_reseau.B4_Kg976.png', heroImage: 'https://www.transbus.org/actualite/actu-2023-bus-yelo-gare.jpg', description: 'Le patrimoine roulant de La Rochelle.', tagline: 'Le patrimoine roulant de La Rochelle.', intro: 'Découvrez la collection complète des autobus et autocars Yélo, des nouvelles générations aux véhicules historiques du réseau rochelais.' },
  { id: 'ocecars', name: 'Océcars Transdev', city: 'La Rochelle', departmentCode: 17, departmentName: 'Charente-Maritime', accent: '#008c95', deep: '#12344d', logoUrl: '', heroImage: '', description: 'Le parc d’autocars d’Océcars – Transdev.', tagline: 'Le patrimoine roulant d’Océcars.', intro: 'Explorez le parc d’autocars d’Océcars – Transdev à La Rochelle, des véhicules actuellement exploités aux véhicules historiques recensés dans Notion.' },
  { id: 'tfl', name: 'TfL London', city: 'London', departmentCode: null, departmentName: 'Royaume-Uni · Londres', accent: '#e21b2d', deep: '#b50917', logoUrl: '', heroImage: '', description: 'Bus londoniens et patrimoine du réseau TfL.', tagline: 'The rolling stock of London.', intro: 'Explore the complete inventory of TfL buses and coaches, from the latest vehicles in service to iconic models that shaped London transport.' },
];

const demoVehicles = [
  { id: 'bibus-demo', network: 'bibus', park: '—', registration: '—', brand: 'Mercedes-Benz', model: 'Citaro', type: 'Bus standard', date: '2026-01-01', status: 'En service', image: '' },
  { id: 'lemet-demo', network: 'lemet', park: '—', registration: '—', brand: 'Mercedes-Benz', model: 'Citaro G C2 Hybrid', type: 'Bus articulé', date: '2026-04-01', status: 'En service', image: '' },
  { id: 'yelo-demo', network: 'yelo', park: '—', registration: '—', brand: '—', model: '—', type: 'Bus', date: '2026-01-01', status: 'En service', image: '' },
];

function NetworkLogo({ network }) {
  if (network.logoUrl) return <img className={`brand-logo-img ${network.id}-logo-img`} src={network.logoUrl} alt={network.name} />;
  if (network.id === 'ocecars') return <div className="brand-logo text-logo"><strong>Océcars</strong><span>TRANSDEV</span></div>;
  return <div className="brand-logo tfl-logo"><span className="tfl-roundel"><i /></span><strong>TfL</strong></div>;
}

function Home({ onSelect }) {
  const groups = Object.values(networks.reduce((acc, network) => {
    const key = network.departmentCode == null ? 'other' : String(network.departmentCode).padStart(2, '0');
    if (!acc[key]) acc[key] = { key, code: network.departmentCode, name: network.departmentName, networks: [] };
    acc[key].networks.push(network);
    return acc;
  }, {})).sort((a, b) => {
    if (a.code == null) return 1;
    if (b.code == null) return -1;
    return a.code - b.code;
  });
  groups.forEach(group => group.networks.sort((a, b) => a.name.localeCompare(b.name, 'fr', { sensitivity: 'base' })));

  const jumpTo = value => {
    if (!value) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    document.getElementById(`department-${value}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return <>
    <header className="home-hero"><div className="eyebrow">BUS COLLECTION</div><h1>Le patrimoine<br /><em>roulant.</em></h1><p>Ta collection personnelle d’autobus, autocars et tramways, réseau par réseau.</p></header>
    <section className="networks">
      <div className="department-nav">
        <label htmlFor="department-jump"><span>ACCÈS RAPIDE</span> Choisir un département</label>
        <select id="department-jump" defaultValue="" onChange={e => jumpTo(e.target.value)}>
          <option value="">Tous les réseaux</option>
          {groups.map(group => <option key={group.key} value={group.key}>{group.code != null ? `${String(group.code).padStart(2, '0')} — ` : ''}{group.name}</option>)}
        </select>
      </div>
      <div className="section-title">Réseaux par département</div>
      {groups.map(group => <section className="department-section" id={`department-${group.key}`} key={group.key}>
        <div className="department-heading"><strong>{group.code != null ? String(group.code).padStart(2, '0') : '•'}</strong><div><h2>{group.name}</h2><span>{group.networks.length} réseau{group.networks.length > 1 ? 'x' : ''}</span></div></div>
        <div className="network-grid">{group.networks.map(network => <button className="network-card" key={network.id} onClick={() => onSelect(network.id)} style={{ '--accent': network.accent, '--deep': network.deep, '--hero-image': network.heroImage ? `url(${network.heroImage})` : 'none' }}><NetworkLogo network={network}/><div><h2>{network.name}</h2><span>{network.city}</span><p>{network.description}</p></div><span className="arrow">→</span></button>)}</div>
      </section>)}
    </section>
  </>;
}

function VehicleCard({ vehicle, accent, onOpen }) {
  const retired = /réform|retir|hors/i.test(vehicle.status || '');
  return <button className={`vehicle-card ${retired ? 'retired' : ''}`} style={{ '--accent': accent }} onClick={() => onOpen(vehicle)} aria-label={`Voir la fiche du véhicule ${vehicle.park}`}><div className="vehicle-photo">{vehicle.image ? <img src={vehicle.image} alt={`${vehicle.brand} ${vehicle.model} ${vehicle.park}`} /> : <div className="no-photo"><span>📷</span><small>Photo à ajouter</small></div>}{retired && <b className="retired-badge">RÉFORMÉ</b>}</div><div className="vehicle-body"><div className="vehicle-title"><strong>#{vehicle.park}</strong><span>{vehicle.type}</span></div><h3>{vehicle.brand} {vehicle.model}</h3><div className="vehicle-meta"><div><small>IMMATRICULATION</small><b>{vehicle.registration || '—'}</b></div><div><small>ARRIVÉE SUR LE RÉSEAU</small><b>{vehicle.arrivalDate || vehicle.circulationDate || vehicle.date || '—'}</b></div></div><div className="vehicle-more">Voir la fiche →</div></div></button>;
}

function VehicleDetails({ vehicle, network, onClose }) {
  if (!vehicle) return null;
  const fields = [['Numéro de parc', vehicle.park],['Immatriculation', vehicle.registration],['Constructeur', vehicle.brand],['Modèle', vehicle.model],['Type', vehicle.type],['Arrivée sur le réseau', vehicle.arrivalDate],['Mise en circulation', vehicle.circulationDate || vehicle.date],['Statut', vehicle.status]].filter(([, value]) => value && value !== '—');
  return <div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}><div className="vehicle-modal" role="dialog" aria-modal="true" style={{ '--accent': network.accent }}><button className="modal-close" onClick={onClose} aria-label="Fermer">×</button><div className="modal-photo">{vehicle.image ? <img src={vehicle.image} alt={`${vehicle.brand} ${vehicle.model}`} /> : <div className="no-photo"><span>📷</span><small>Photo à ajouter</small></div>}</div><div className="modal-content"><div className="eyebrow">{network.name}</div><div className="modal-title"><strong>#{vehicle.park}</strong><span>{vehicle.type}</span></div><h2>{vehicle.brand} {vehicle.model}</h2><div className="detail-list">{fields.map(([label, value]) => <div key={label}><small>{label}</small><b>{value}{label === 'Arrivée sur le réseau' && vehicle.arrivalDateEstimated ? ' · estimée' : ''}</b></div>)}</div><div className="detail-links">{vehicle.notionUrl && <a href={vehicle.notionUrl} target="_blank" rel="noreferrer">↗ Ouvrir dans Notion</a>}{vehicle.tcInfosUrl && <a href={vehicle.tcInfosUrl} target="_blank" rel="noreferrer">↗ Voir la fiche TC Infos</a>}{vehicle.fotobusUrl && <a href={vehicle.fotobusUrl} target="_blank" rel="noreferrer">↗ Voir la fiche Fotobus</a>}</div></div></div></div>;
}

function AddVehicleModal({ network, initialRegistration, onClose, onAdded }) {
  const [form, setForm] = useState({ registration: initialRegistration || '', park: '', brand: '', model: '', type: '', circulationDate: '', arrivalDate: '', arrivalEstimated: false, arrivalPrecision: 'day', operator: network.id === 'ocecars' ? 'Océcars - Transdev' : '', depot: '', assignment: '', serial: '', length: '', seats: '', doors: '', energy: '', engine: '', gearbox: '', euro: '', airConditioning: '', livery: '', tcInfosUrl: '', fotobusUrl: '', details: '', history: '', status: 'En service' });
  const [saving, setSaving] = useState(false); const [error, setError] = useState('');
  const set = (key, value) => setForm(f => ({ ...f, [key]: value }));
  const submit = async e => { e.preventDefault(); setSaving(true); setError(''); try {
    const payload = { ...form };
    if (payload.arrivalPrecision === 'month' && /^\d{4}-\d{2}$/.test(payload.arrivalDate)) payload.arrivalDate = `${payload.arrivalDate}-01`;
    if (payload.arrivalPrecision === 'year' && /^\d{4}$/.test(payload.arrivalDate)) payload.arrivalDate = `${payload.arrivalDate}-01-01`;
    payload.arrivalEstimated = payload.arrivalPrecision !== 'day' || payload.arrivalEstimated;
    const response = await fetch(`/api/vehicles?network=${network.id}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const raw = await response.text(); let data = {}; try { data = JSON.parse(raw); } catch { data = { details: raw }; }
    if (!response.ok) throw new Error([data.error, data.details, data.notionStatus ? `HTTP ${data.notionStatus}` : '', data.notionCode].filter(Boolean).join(' — ') || 'Impossible d’ajouter le véhicule.');
    if (!data.vehicle) throw new Error('Notion a répondu sans renvoyer la page créée.');
    onAdded(data.vehicle); onClose();
  } catch (err) { setError(err.message || 'Impossible d’ajouter le véhicule.'); } finally { setSaving(false); } };
  return <div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget && !saving) onClose(); }}><div className="add-modal" style={{ '--accent': network.accent }}><button className="modal-close" onClick={onClose} disabled={saving}>×</button><div className="eyebrow">NOUVEAU VÉHICULE · {network.name}</div><h2>Ajouter à la collection</h2><p className="form-intro">Renseigne uniquement les informations que tu connais. Les champs manquants pourront être complétés plus tard dans Notion.</p><form onSubmit={submit}>
    <div className="form-section"><h3>Identification</h3><div className="form-grid"><label>Immatriculation *<input value={form.registration} onChange={e => set('registration', e.target.value)} placeholder="339 WM 17" required /></label><label>Numéro de parc<input value={form.park} onChange={e => set('park', e.target.value)} /></label><label>Constructeur<input value={form.brand} onChange={e => set('brand', e.target.value)} placeholder="LAG" /></label><label>Modèle<input value={form.model} onChange={e => set('model', e.target.value)} placeholder="EOS 90" /></label><label>Type<input value={form.type} onChange={e => set('type', e.target.value)} placeholder="Autocar" /></label><label>Exploitant<input value={form.operator} onChange={e => set('operator', e.target.value)} /></label></div></div>
    <div className="form-section"><h3>Dates — utilisées pour le classement</h3><div className="date-mode"><span>Précision de la date d’arrivée</span><div className="date-mode-buttons"><button type="button" className={form.arrivalPrecision === 'day' ? 'selected' : ''} onClick={() => set('arrivalPrecision','day')}>Date précise</button><button type="button" className={form.arrivalPrecision === 'month' ? 'selected' : ''} onClick={() => set('arrivalPrecision','month')}>Mois approximatif</button><button type="button" className={form.arrivalPrecision === 'year' ? 'selected' : ''} onClick={() => set('arrivalPrecision','year')}>Année approximative</button></div></div><div className="form-grid"><label>Mise en circulation<input type="date" value={form.circulationDate} onChange={e => set('circulationDate', e.target.value)} /></label><label>{form.arrivalPrecision === 'day' ? 'Arrivée sur le réseau / parc' : form.arrivalPrecision === 'month' ? 'Mois d’arrivée approximatif' : 'Année d’arrivée approximative'}{form.arrivalPrecision === 'day' ? <input type="date" value={form.arrivalDate} onChange={e => set('arrivalDate', e.target.value)} /> : form.arrivalPrecision === 'month' ? <input type="month" value={form.arrivalDate} onChange={e => set('arrivalDate', e.target.value)} /> : <input type="number" inputMode="numeric" min="1900" max="2100" placeholder="2021" value={form.arrivalDate} onChange={e => set('arrivalDate', e.target.value)} />}</label></div><label className="checkbox-label"><input type="checkbox" checked={form.arrivalEstimated} onChange={e => set('arrivalEstimated', e.target.checked)} /> Date d’arrivée approximative / estimée</label><p className="form-help">Tu peux maintenant saisir soit une date précise, soit seulement un mois, soit seulement une année. Une date approximative est enregistrée comme estimée dans Notion et reste correctement classée.</p></div>
    <div className="form-section"><h3>Informations complémentaires</h3><div className="form-grid"><label>Dépôt<input value={form.depot} onChange={e => set('depot', e.target.value)} /></label><label>Dernière affectation<input value={form.assignment} onChange={e => set('assignment', e.target.value)} /></label><label>Numéro de série<input value={form.serial} onChange={e => set('serial', e.target.value)} /></label><label>Énergie<input value={form.energy} onChange={e => set('energy', e.target.value)} /></label><label>Places<input value={form.seats} onChange={e => set('seats', e.target.value)} /></label><label>Longueur<input value={form.length} onChange={e => set('length', e.target.value)} /></label><label>Moteur<input value={form.engine} onChange={e => set('engine', e.target.value)} /></label><label>Boîte de vitesse<input value={form.gearbox} onChange={e => set('gearbox', e.target.value)} /></label><label>Norme Euro<input value={form.euro} onChange={e => set('euro', e.target.value)} /></label><label>Portes<input value={form.doors} onChange={e => set('doors', e.target.value)} /></label><label>Climatisation<input value={form.airConditioning} onChange={e => set('airConditioning', e.target.value)} /></label><label>Livrée<input value={form.livery} onChange={e => set('livery', e.target.value)} /></label></div></div>
    <div className="form-section"><h3>Sources</h3><div className="form-grid"><label>TC Infos<input type="url" value={form.tcInfosUrl} onChange={e => set('tcInfosUrl', e.target.value)} placeholder="https://tc-infos.fr/..." /></label><label>Fotobus<input type="url" value={form.fotobusUrl} onChange={e => set('fotobusUrl', e.target.value)} placeholder="https://fotobus.me/..." /></label></div><label>Détails / notes<textarea value={form.details} onChange={e => set('details', e.target.value)} rows="3" /></label></div>
    {error && <div className="sync-error">⚠️ {error}</div>}<div className="form-actions"><button type="button" onClick={onClose} disabled={saving}>Annuler</button><button className="primary" type="submit" disabled={saving || !form.registration.trim()}>{saving ? 'Ajout dans Notion…' : '＋ Ajouter à Notion'}</button></div>
  </form></div></div>;
}

function Collection({ networkId, onBack }) {
  const network = networks.find(n => n.id === networkId);
  const [query, setQuery] = useState(''); const [showRetired, setShowRetired] = useState(true); const [type, setType] = useState('Tous');
  const [vehicles, setVehicles] = useState(demoVehicles.filter(v => v.network === networkId)); const [selectedVehicle, setSelectedVehicle] = useState(null); const [loading, setLoading] = useState(true); const [syncing, setSyncing] = useState(false); const [synced, setSynced] = useState(false); const [error, setError] = useState(''); const [showAdd, setShowAdd] = useState(false);
  const loadVehicles = async () => { setSyncing(true); setError(''); try { let cursor = ''; let allVehicles = []; let safety = 0; do { const params = new URLSearchParams({ network: networkId, t: String(Date.now()) }); if (cursor) params.set('cursor', cursor); const response = await fetch(`/api/vehicles?${params.toString()}`, { cache: 'no-store' }); const data = await response.json(); if (!response.ok) { const diagnostic = [data.details, data.notionStatus ? `HTTP ${data.notionStatus}` : '', data.notionCode].filter(Boolean).join(' · '); throw new Error([data.error || 'Erreur de synchronisation', diagnostic].filter(Boolean).join(' — ')); } if (!Array.isArray(data.vehicles)) throw new Error('Réponse Notion invalide'); allVehicles.push(...data.vehicles); cursor = data.has_more && data.next_cursor ? data.next_cursor : ''; safety += 1; if (safety > 20) throw new Error('Synchronisation interrompue : trop de pages Notion.'); } while (cursor); setVehicles(allVehicles); setSynced(true); } catch (e) { setSynced(false); setError(e.message || 'Impossible de synchroniser Notion'); } finally { setLoading(false); setSyncing(false); } };
  useEffect(() => { loadVehicles(); }, [networkId]);
  const types = ['Tous', ...new Set(vehicles.map(v => v.type).filter(Boolean))];
  const filtered = useMemo(() => vehicles.filter(v => { const haystack = `${v.park} ${v.registration} ${v.brand} ${v.model} ${v.type}`.toLowerCase(); const retired = /réform|retir|hors/i.test(v.status || ''); return haystack.includes(query.toLowerCase()) && (type === 'Tous' || v.type === type) && (showRetired || !retired); }).sort((a, b) => { const da = a.arrivalDate || a.circulationDate || a.date || ''; const db = b.arrivalDate || b.circulationDate || b.date || ''; if (!da && !db) return 0; if (!da) return 1; if (!db) return -1; return db.localeCompare(da); }), [vehicles, query, type, showRetired]);
  const retiredCount = vehicles.filter(v => /réform|retir|hors/i.test(v.status || '')).length; const activeCount = vehicles.length - retiredCount; const noResults = !loading && query.trim() && filtered.length === 0;
  return <div className={`network-page ${network.id}`} style={{ '--accent': network.accent, '--deep': network.deep, '--hero-image': network.heroImage ? `url(${network.heroImage})` : 'none' }}><header className="collection-head"><div className="topbar"><button className="back" onClick={onBack}>←</button><NetworkLogo network={network}/><button className="sync-top" onClick={loadVehicles} disabled={syncing}>↻ <span>{syncing ? 'Synchronisation…' : 'Synchroniser'}</span></button></div><div className="collection-brand"><div className="hero-overlay"><div className="eyebrow">{network.id === 'tfl' ? 'THE LONDON FLEET ALBUM' : `L’ALBUM DU PARC ${network.city.toUpperCase()}`}</div><h1>{network.tagline}</h1><p>{network.intro}</p></div></div><div className="stats"><div><strong>{vehicles.length}</strong><span>véhicules</span></div><div><strong>{retiredCount}</strong><span>réformés</span></div><div><strong>{activeCount}</strong><span>{network.id === 'tfl' ? 'bus & coaches' : network.id === 'ocecars' ? 'autocars' : 'bus & cars'}</span></div></div></header><section className="toolbar"><div className="search"><span>⌕</span><input value={query} onChange={e => setQuery(e.target.value)} placeholder={network.id === 'tfl' ? 'Registration, fleet no., make, model…' : 'Immatriculation, parc, marque, modèle…'}/></div><div className="filters"><select value={type} onChange={e => setType(e.target.value)}>{types.map(t => <option key={t}>{t}</option>)}</select><button className={showRetired ? 'toggle active' : 'toggle'} onClick={() => setShowRetired(!showRetired)}>{network.id === 'tfl' ? 'All statuses' : 'Réformés'}</button></div></section><div className="sync-line"><span>{loading ? 'Chargement…' : synced ? '● Synchronisé avec Notion' : '○ Connexion Notion indisponible'}</span><button onClick={loadVehicles} disabled={syncing}>{syncing ? 'Synchronisation…' : '↻ Synchroniser'}</button></div>{error && <div className="sync-error">{error}</div>}<div className="collection-note"><span>{filtered.length}</span> véhicule{filtered.length > 1 ? 's' : ''} · classement : arrivée réseau → mise en circulation</div>{noResults ? <div className="empty"><h3>Ce véhicule n’est pas dans la collection</h3><p>Aucun résultat pour « {query} ».</p><button className="primary add-result" onClick={() => setShowAdd(true)}>＋ Ajouter ce véhicule à {network.name}</button></div> : <section className="vehicle-grid">{filtered.map(vehicle => <VehicleCard key={vehicle.id} vehicle={vehicle} accent={network.accent} onOpen={setSelectedVehicle}/>)}</section>}{!loading && !query.trim() && filtered.length === 0 && <div className="empty">Aucun véhicule dans cette collection.</div>}<VehicleDetails vehicle={selectedVehicle} network={network} onClose={() => setSelectedVehicle(null)}/>{showAdd && <AddVehicleModal network={network} initialRegistration={query} onClose={() => setShowAdd(false)} onAdded={() => { setShowAdd(false); loadVehicles(); }}/>}</div>;
}

function App() { const [networkId, setNetworkId] = useState(null); return <main className="app">{networkId ? <Collection networkId={networkId} onBack={() => setNetworkId(null)}/> : <Home onSelect={setNetworkId}/>}<footer>Collection privée · source de données : Notion</footer></main>; }
createRoot(document.getElementById('root')).render(<App/>);
