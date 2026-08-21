(() => {
  const applyFixes = () => {
    document.querySelectorAll('.department-nav').forEach((el) => {
      el.style.position = 'static';
      el.style.top = 'auto';
      el.style.zIndex = 'auto';
    });

    document.querySelectorAll('.lemet-logo-img').forEach((img) => {
      if (img.getAttribute('src') !== '/logos/tcrm.svg') {
        img.setAttribute('src', '/logos/tcrm.svg');
      }
    });

    document.querySelectorAll('.text-logo').forEach((el) => {
      el.style.backgroundImage = "url('/logos/ocecars.svg')";
      el.style.backgroundRepeat = 'no-repeat';
      el.style.backgroundPosition = 'center';
      el.style.backgroundSize = 'contain';
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyFixes, { once: true });
  } else {
    applyFixes();
  }

  new MutationObserver(applyFixes).observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
})();
