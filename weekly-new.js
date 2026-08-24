(() => {
  const ACCENTS = { bibus:'#d7df00', lemet:'#f5b51b', yelo:'#ffd500', ocecars:'#008c95', tfl:'#e21b2d', qub:'#ee8b1e' };
  const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  const formatDate = value => { if (!value) return ''; const d = new Date(value); if (Number.isNaN(d.getTime())) return value; return new Intl.DateTimeFormat('fr-FR', { day:'2-digit', month:'2-digit', year:'numeric' }).format(d); };
  function render(vehicles) {
    if (document.querySelector('.weekly-new')) return;
    const root = document.querySelector('.networks'); if (!root) return;
    const section = document.createElement('section'); section.className = 'weekly-new';
    const cards = vehicles.map(v => `<a class="weekly-new-card" href="${escapeHtml(v.notionUrl || '#')}" target="_blank" rel="noreferrer" style="--new-accent:${ACCENTS[v.network] || '#d7df00'}"><div class="weekly-new-photo">${v.image ? `<img src="${escapeHtml(v.image)}" alt="">` : '<span>🚌</span>'}</div><div><div class="weekly-new-network">${escapeHtml(v.networkName)}</div><h3>#${escapeHtml(v.park)} · ${escapeHtml(v.brand)} ${escapeHtml(v.model)}</h3><div class="weekly-new-meta">${escapeHtml(v.registration)} · arrivé le ${escapeHtml(formatDate(v.arrivalDate))}</div></div></a>`).join('');
    section.innerHTML = `<div class="weekly-new-head"><div><div class="weekly-new-kicker">Cette semaine</div><h2 class="weekly-new-title">🆕 Nouveaux véhicules</h2><p class="weekly-new-subtitle">Véhicules entrés sur les parcs au cours des 7 derniers jours.</p></div></div><div class="weekly-new-grid">${cards || '<div class="weekly-new-empty">Aucun nouveau véhicule cette semaine.</div>'}</div>`;
    root.prepend(section);
  }
  async function load() { try { const response = await fetch(`/api/new-vehicles?t=${Date.now()}`, { cache:'no-store' }); if (!response.ok) return; const data = await response.json(); render(Array.isArray(data.vehicles) ? data.vehicles : []); } catch {} }
  const observer = new MutationObserver(() => { if (document.querySelector('.networks') && !document.querySelector('.weekly-new')) load(); }); observer.observe(document.documentElement, { childList:true, subtree:true });
  load();
})();
