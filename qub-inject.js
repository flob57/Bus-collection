(() => {
  function add() {
    const section = document.querySelector('#department-29');
    const grid = section?.querySelector('.network-grid');
    if (!grid || document.querySelector('[data-qub-card]')) return false;
    const card = document.createElement('button');
    card.type = 'button';
    card.dataset.qubCard = '1';
    card.className = 'network-card';
    card.style.cssText = '--accent:#ee8b1e;--deep:#7d3b00;--hero-image:none';
    card.innerHTML = '<div class="brand-logo text-logo"><strong>QUB</strong><span>QUIMPER</span></div><div><h2>QUB</h2><span>Quimper</span><p>Le parc des autobus, autocars et véhicules spécialisés du réseau QUB.</p></div><span class="arrow">→</span>';
    card.addEventListener('click', () => { window.location.href = '/qub.html'; });
    const bibus = [...grid.children].find(el => el.querySelector('h2')?.textContent.trim() === 'Bibus');
    if (bibus?.nextSibling) grid.insertBefore(card, bibus.nextSibling); else grid.appendChild(card);
    return true;
  }
  let tries = 0;
  const start = () => { if (add()) return; if (++tries < 40) setTimeout(start, 250); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once:true }); else start();
})();
