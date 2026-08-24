(() => {
  const add = () => {
    const grids = [...document.querySelectorAll('.network-grid')];
    if (!grids.length || document.querySelector('[data-qub-card]')) return;
    const grid = grids.find(g => g.closest('.department-section')?.id === 'department-29') || grids[0];
    if (!grid) return;
    const card = document.createElement('button');
    card.type = 'button';
    card.dataset.qubCard = '1';
    card.className = 'network-card';
    card.style.cssText = '--accent:#e66a00;--deep:#7d2f00;--hero-image:none';
    card.innerHTML = '<div class="brand-logo text-logo"><strong>QUB</strong><span>QUIMPER</span></div><div><h2>QUB</h2><span>Quimper</span><p>Le parc des autobus, autocars et véhicules spécialisés du réseau QUB.</p></div><span class="arrow">→</span>';
    card.addEventListener('click', () => { window.location.href = '/qub.html'; });
    grid.appendChild(card);
  };
  new MutationObserver(add).observe(document.documentElement, {childList:true,subtree:true});
  add();
})();
