(() => {
  const KEY = "mh_cookie_consent_v1";   // Montillas Holding (puedes renombrar)

  const $ = (id) => document.getElementById(id);

  function readConsent() {
    try { return JSON.parse(localStorage.getItem(KEY) || "null"); }
    catch { return null; }
  }

  function writeConsent(consent) {
    const payload = {
      version: 1,
      timestamp: new Date().toISOString(),
      necessary: true,
      analytics: !!consent.analytics,
      marketing: !!consent.marketing
    };
    localStorage.setItem(KEY, JSON.stringify(payload));
    return payload;
  }

  // Ejecuta scripts diferidos SOLO si la categoría está permitida
  function runDeferredScripts() {
    const c = readConsent();
    const consent = c || { analytics:false, marketing:false };

    // Scripts inline o externos marcados como text/plain
    document
      .querySelectorAll('script[type="text/plain"][data-cookiecategory]')
      .forEach((node) => {
        const cat = node.getAttribute("data-cookiecategory");
        const allowed =
          (cat === "analytics" && consent.analytics) ||
          (cat === "marketing" && consent.marketing);

        if (!allowed) return;

        const s = document.createElement("script");
        if (node.dataset.src) {
          s.src = node.dataset.src;
          s.async = true;
        } else {
          s.text = node.textContent;
        }

        // Copia atributos extra si los hubieras puesto
        if (node.dataset.defer) s.defer = true;

        document.head.appendChild(s);
        node.remove();
      });
  }

  function showBanner(openPanel = false) {
    const overlay = $("cookieOverlay");
    const panel = $("cookiePanel");
    const manage = $("cookieManage");

    if (!overlay || !panel || !manage) return;

    overlay.hidden = false;
    manage.hidden = false;
    panel.hidden = !openPanel;

    // sincroniza checks si ya existía consentimiento
    const c = readConsent();
    $("ckAnalytics").checked = !!c?.analytics;
    $("ckMarketing").checked = !!c?.marketing;

    // Accesibilidad básica: foco en el título
    $("cookieTitle")?.focus?.();
  }

  function hideBanner() {
    const overlay = $("cookieOverlay");
    const manage = $("cookieManage");
    if (overlay) overlay.hidden = true;
    if (manage) manage.hidden = false;
  }

  function acceptAll() {
    writeConsent({ analytics:true, marketing:true });
    hideBanner();
    runDeferredScripts();
  }

  function rejectAll() {
    writeConsent({ analytics:false, marketing:false });
    hideBanner();
    // No ejecutamos scripts de terceros
  }

  function saveChoices() {
    writeConsent({
      analytics: $("ckAnalytics").checked,
      marketing: $("ckMarketing").checked
    });
    hideBanner();
    runDeferredScripts();
  }

  function togglePanel() {
    const panel = $("cookiePanel");
    const btn = $("btnConfig");
    if (!panel) return;
    const willOpen = panel.hidden;
    panel.hidden = !willOpen;
    if (btn) btn.setAttribute("aria-expanded", willOpen ? "true" : "false");
  }

  // Init
  document.addEventListener("DOMContentLoaded", () => {
    // Enlace/botón para reabrir preferencias
    const manage = $("cookieManage");
    manage?.addEventListener("click", () => showBanner(true));

    $("btnAccept")?.addEventListener("click", acceptAll);
    $("btnReject")?.addEventListener("click", rejectAll);
    $("btnConfig")?.addEventListener("click", togglePanel);
    $("btnSave")?.addEventListener("click", saveChoices);

    // Si no hay consentimiento, mostramos banner
    const c = readConsent();
    if (!c) {
      showBanner(false);
    } else {
      // Si ya hay consentimiento guardado, ejecuta scripts permitidos
      $("cookieManage").hidden = false;
      runDeferredScripts();
    }
  });

  // Exponer una función para “revocar” si quieres usarla en una página
window.resetCookieConsent = function() {
  localStorage.removeItem(KEY);
  // Redirige a la página principal
  window.location.href = "./index.html";
};
})();