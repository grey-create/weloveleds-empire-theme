document.addEventListener('DOMContentLoaded', () => {
  if (window.innerWidth < 750) {
    // Listen for any new tab getting checked
    document.querySelectorAll('.pxu-tabs .tab-radio').forEach(radio => {
      radio.addEventListener('change', () => {
        const panelId = radio.id.replace('-toggle', '');   // our new naming
        const panel    = document.getElementById(panelId);
        if (!panel) return;
        // Wait a tick for Empire's slideDown animation (≈200 ms)
        setTimeout(() => {
          panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 220);
      });
    });
  }
});
