/* Bus Collection — small interaction fixes for the mobile add form */
(function () {
  function textOf(el) {
    return (el?.textContent || '').trim().toLowerCase();
  }

  document.addEventListener('change', function (event) {
    const input = event.target;
    if (!(input instanceof HTMLInputElement)) return;
    if (input.type !== 'checkbox' || !input.closest('.add-modal .checkbox-label')) return;

    const modal = input.closest('.add-modal');
    if (!modal) return;

    // The precision buttons are the real source of truth for the React form.
    // Make the existing checkbox a convenient shortcut instead of a dead toggle.
    const wanted = input.checked ? 'Mois approximatif' : 'Date précise';
    const button = Array.from(modal.querySelectorAll('.date-mode-buttons button'))
      .find((candidate) => textOf(candidate) === wanted.toLowerCase());

    if (button) {
      button.click();
      window.setTimeout(() => {
        const field = modal.querySelector('input[type="month"], input[type="date"], input[type="number"]');
        if (input.checked && field && field.offsetParent !== null) field.focus({ preventScroll: true });
      }, 50);
    }
  }, true);

  // When the server returns an error, bring it into view so a failed save
  // can never look like a button that simply did nothing.
  const revealError = () => {
    document.querySelectorAll('.add-modal .sync-error').forEach((error) => {
      if (error.textContent.trim()) {
        error.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  };

  new MutationObserver(revealError).observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true,
  });
})();
