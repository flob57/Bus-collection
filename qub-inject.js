(() => {
  const QUB = {
    card: 'data-qub-card',
    html: '<div class="brand-logo text-logo qub-brand-logo"><strong>QUB</strong><span>QUIMPER</span></div><div><h2>QUB</h2><span>Quimper</span><p>Le parc des autobus, autocars et véhicules spécialisés du réseau QUB.</p></div><span class="arrow">→</span>'
  };

  function add() {
    const section = document.querySelector('#department-29');
    if (!section) return false;
    const grid = section.querySelector('.network-grid');
    if (!grid) return false;
    if (grid.querySelector(`[${QUB.card}]`)) return true;

    const card = document.createElement('button');
    card.type = 'button';
    card.setAttribute(QUB.card, '1');
    card.className = 'network-card qub-network-card';
    card.style.setProperty('--accent', '#d7df00');
    card.style.setProperty('--deep', '#252525');
    card.style.setProperty('--hero-image', 'none');
    card.innerHTML = QUB.html;
    card.addEventListener('click', () => { window.location.href = '/qub.html'; });

    const bibus = [...grid.children].find(el => el.querySelector('h2')?.textContent.trim() === 'Bibus');
    if (bibus) bibus.insertAdjacentElement('afterend', card); else grid.prepend(card);

    const count = section.querySelector('.department-heading span');
    if (count) count.textContent = '2 réseaux';
    return true;
  }

  let tries = 0;
  function start() {
    if (add()) return;
    if (++tries < 120) setTimeout(start, 250);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
