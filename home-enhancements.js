(() => {
  const ACCENTS = { bibus:'#d7df00', lemet:'#f5b51b', yelo:'#ffd500', ocecars:'#008c95', tfl:'#e21b2d', qub:'#e66a00' };
  const esc = v => String(v ?? '').replace(/[&<>\"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#039;'}[c]));
  const date = v => { if (!v) return ''; const d = new Date(v); return Number.isNaN(d.getTime()) ? v : new Intl.DateTimeFormat('fr-FR',{day:'2-digit',month:'2-digit',year:'numeric'}).format(d); };

  function addQub() {
    if (document.querySelector('[data-home-qub]')) return true;
    const section = document.querySelector('#department-29');
    const grid = section?.querySelector('.network-grid');
    if (!grid) return false;
    const card = document.createElement('button');
    card.type = 'button'; card.dataset.homeQub = '1'; card.className = 'network-card';
    card.style.cssText = '--accent:#e66a00;--deep:#7d2f00;--hero-image:none';
    card.innerHTML = '<div class="brand-logo text-logo"><strong>QUB</strong><span>QUIMPER</span></div><div><h2>QUB</h2><span>Quimper</span><p>Le parc des autobus, autocars et véhicules spécialisés du réseau QUB.</p></div><span class="arrow">→</span>';
    card.addEventListener('click', () => { window.location.href = '/qub.html'; });
    grid.appendChild(card);
    const heading = section.querySelector('.department-heading span');
    if (heading) heading.textContent = '2 réseaux';
    return true;
  }

  function renderWeekly(vehicles) {
    const root = document.querySelector('.networks');
    if (!root) return false;
    document.querySelector('.weekly-new')?.remove();
    const section = document.createElement('section');
    section.className = 'weekly-new';
    const cards = vehicles.map(v => `<a class="weekly-new-card" href="${esc(v.notionUrl || '#')}" target="_blank" rel="noreferrer" style="--new-accent:${ACCENTS[v.network] || '#d7df00'}"><div class="weekly-new-photo">${v.image ? `<img src="${esc(v.image)}" alt="">` : '<span>🚌</span>'}</div><div><div class="weekly-new-network">${esc(v.networkName)}</div><h3>#${esc(v.park)} · ${esc(v.brand)} ${esc(v.model)}</h3><div class="weekly-new-meta">${esc(v.registration)} · arrivé le ${esc(date(v.arrivalDate))}</div></div></a>`).join('');
    section.innerHTML = `<div class="weekly-new-head"><div><div class="weekly-new-kicker">Cette semaine</div><h2 class="weekly-new-title">🆕 Nouveaux véhicules</h2><p class="weekly-new-subtitle">Véhicules entrés sur les parcs au cours des 7 derniers jours.</p></div></div><div class="weekly-new-grid">${cards || '<div class="weekly-new-empty">Aucun nouveau véhicule cette semaine.</div>'}</div>`;
    root.prepend(section);
    return true;
  }

  async function loadWeekly() {
    try {
      const r = await fetch(`/api/new-vehicles?ts=${Date.now()}`, { cache:'no-store' });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const data = await r.json();
      renderWeekly(Array.isArray(data.vehicles) ? data.vehicles : []);
    } catch (e) {
      renderWeekly([]);
      const empty = document.querySelector('.weekly-new-empty');
      if (empty) empty.textContent = 'Nouveautés indisponibles pour le moment.';
      console.warn('Bus Collection nouveautés:', e);
    }
  }

  function run() {
    addQub();
    if (document.querySelector('.networks')) loadWeekly();
  }

  let tries = 0;
  const timer = setInterval(() => { tries++; run(); if ((document.querySelector('[data-home-qub]') && document.querySelector('.weekly-new')) || tries >= 20) clearInterval(timer); }, 500);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run, { once:true }); else run();
  window.addEventListener('load', run, { once:true });
})();
