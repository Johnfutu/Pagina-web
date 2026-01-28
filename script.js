// Helpers
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

// Year
$("#year").textContent = new Date().getFullYear();

// Mobile nav
const navToggle = $("#navToggle");
const navList = $("#navList");

navToggle.addEventListener("click", () => {
  const open = navList.classList.toggle("is-open");
  navToggle.setAttribute("aria-expanded", String(open));
});

// Close nav when clicking a link (mobile)
$$("#navList a").forEach(a => {
  a.addEventListener("click", () => {
    navList.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
  });
});

// Gallery filters
const chips = $$(".chip");
const tiles = $$(".tile");

chips.forEach(chip => {
  chip.addEventListener("click", () => {
    chips.forEach(c => c.classList.remove("is-active"));
    chip.classList.add("is-active");

    const filter = chip.dataset.filter;
    tiles.forEach(t => {
      const show = filter === "all" || t.dataset.type === filter;
      t.style.display = show ? "" : "none";
    });
  });
});


// Fake form submit (frontend-only)
function wireForm(formId, noteId){
  const form = $(formId);
  const note = $(noteId);

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    // Simple validation example
    const fd = new FormData(form);
    const name = String(fd.get("name") || "").trim();
    const phone = String(fd.get("phone") || "").trim();
    const email = String(fd.get("email") || "").trim();

    if (!name || !phone || !email){
      note.textContent = "Por favor, completa nombre, teléfono y correo.";
      return;
    }

    // Here you would POST to your backend later
    note.textContent = "¡Listo! Hemos recibido tu solicitud. Te contactaremos en menos de 24h.";
    form.reset();
  });
}

async function wireForm(formId, noteId, source) {
  const form = document.querySelector(formId);
  const note = document.querySelector(noteId);
  if (!form || !note) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    note.textContent = "Enviando...";

    const fd = new FormData(form);

    // Honeypot (campo oculto opcional si lo agregas)
    // fd.append("website", "");

    
    const payload = {
      source,
      name: (fd.get("name") || "").toString().trim(),
      phone: (fd.get("phone") || "").toString().trim(),
      email: (fd.get("email") || "").toString().trim(),
      service: (fd.get("service") || "").toString().trim(),
      subject: (fd.get("subject") || "").toString().trim(),
      message: (fd.get("message") || "").toString().trim(),
    };

    try {
  const res = await fetch("/api/lead_create.php", {   // nota el "/" al inicio
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const text = await res.text();              // leer SIEMPRE el body
  let data = null;
  try { data = JSON.parse(text); } catch {}

  if (!res.ok) {
    throw new Error(data?.message || text || `HTTP ${res.status}`);
  }

  note.textContent = data?.message || "¡Enviado!";
  form.reset();
} catch (err) {
  note.textContent = err.message;             // AQUÍ verás el motivo real
}
  });
}

wireForm("#leadForm", "#formNote", "hero");
wireForm("#contactForm", "#contactNote", "contact");

// FAQ behavior: allow one open at a time (like accordion)
const details = $$(".acc");
details.forEach(d => {
  d.addEventListener("toggle", () => {
    if (d.open){
      details.forEach(other => {
        if (other !== d) other.open = false;
      });
    }
  });
});

// ---------- Before/After sliders ----------
function initBeforeAfter() {
  const widgets = document.querySelectorAll("[data-ba]");
  widgets.forEach((w) => {
    const range = w.querySelector("[data-range]");
    const beforeWrap = w.querySelector("[data-beforewrap]");
    const handle = w.querySelector("[data-handle]");

    if (!range || !beforeWrap || !handle) return;

    const apply = (val) => {
      const v = Math.max(0, Math.min(100, Number(val)));
      beforeWrap.style.width = `${v}%`;
      handle.style.left = `${v}%`;
    };

    // init
    apply(range.value);

    range.addEventListener("input", (e) => apply(e.target.value));
    window.addEventListener("resize", () => apply(range.value));
  });
}

initBeforeAfter();

// ---------- Reuse chips filter on portfolio too ----------
(function initProjectFilters(){
  const chips = document.querySelectorAll(".chip");
  const baCards = document.querySelectorAll(".ba-card");
  if (!chips.length) return;

  chips.forEach(chip => {
    chip.addEventListener("click", () => {
      chips.forEach(c => c.classList.remove("is-active"));
      chip.classList.add("is-active");

      const filter = chip.dataset.filter;
      if (!baCards.length) return;

      baCards.forEach(card => {
        const show = filter === "all" || card.dataset.type === filter;
        card.style.display = show ? "" : "none";
      });
    });
  });
})();

(() => {
  const STORAGE_KEY = "cookie_consent_v1";

  const banner = document.getElementById("cookie-banner");
  const panel  = document.getElementById("cookie-panel");
  const manage = document.getElementById("cookie-manage");

  const btnAccept = document.getElementById("cookie-accept");
  const btnReject = document.getElementById("cookie-reject");
  const btnConfig = document.getElementById("cookie-config");
  const btnSave   = document.getElementById("cookie-save");

  const chkAnalytics = document.getElementById("consent-analytics");
  const chkMarketing = document.getElementById("consent-marketing");

  function nowISO(){ return new Date().toISOString(); }

  function loadConsent() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "null"); }
    catch { return null; }
  }

  function saveConsent(consent) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      ...consent,
      timestamp: nowISO(),
      version: 1
    }));
  }

  // Public helper: call this to check status before loading third-party scripts
  window.getCookieConsent = function() {
    const c = loadConsent();
    return c ? { analytics: !!c.analytics, marketing: !!c.marketing } : { analytics:false, marketing:false };
  };

  // OPTIONAL: expose a function to revoke
  window.resetCookieConsent = function() {
    localStorage.removeItem(STORAGE_KEY);
    // Recommended: also delete non-necessary cookies already set (best-effort)
    // Note: deleting 3rd-party cookies may not be possible from JS if different domain.
    location.reload();
  };

  
function showBanner() {
  const banner = document.querySelector("#cookieBanner"); // o el selector que uses
  if (!banner) return;
  banner.hidden = false; // o true
}
  const el = document.querySelector('#tuElemento');
if (el) el.hidden = true;

  function hideBanner() {
    banner.hidden = true;
    manage.hidden = false;
  }

  function setPanel(open) {
    panel.hidden = !open;
    btnConfig.setAttribute("aria-expanded", open ? "true" : "false");
  }

  // ---- Blocking loader pattern ----
  // Place scripts that set cookies as <script type="text/plain" data-cookiecategory="analytics"> ... </script>
  // and they will run only after consent.
  function runDeferredScripts() {
    const consent = window.getCookieConsent();
    const nodes = document.querySelectorAll('script[type="text/plain"][data-cookiecategory]');
    nodes.forEach(node => {
      const cat = node.getAttribute("data-cookiecategory");
      const allowed =
        (cat === "analytics" && consent.analytics) ||
        (cat === "marketing" && consent.marketing);

      if (!allowed) return;

      const s = document.createElement("script");
      // if it's an external script:
      if (node.dataset.src) {
        s.src = node.dataset.src;
        s.async = true;
      } else {
        s.text = node.textContent;
      }
      // copy attributes if needed:
      document.head.appendChild(s);
      node.parentNode.removeChild(node);
    });
  }

  function applyConsentAndLoad(consent) {
    saveConsent(consent);
    hideBanner();
    runDeferredScripts();
  }

  // Init
  const existing = loadConsent();
  if (!existing) {
    showBanner();
  } else {
    manage.hidden = false;
    runDeferredScripts();
  }

  // UI events
  manage?.addEventListener("click", () => {
    showBanner();
    setPanel(true);
    const c = window.getCookieConsent();
    chkAnalytics.checked = c.analytics;
    chkMarketing.checked = c.marketing;
  });

  btnAccept?.addEventListener("click", () => applyConsentAndLoad({ analytics:true, marketing:true }));
  btnReject?.addEventListener("click", () => applyConsentAndLoad({ analytics:false, marketing:false }));

  btnConfig?.addEventListener("click", () => setPanel(panel.hidden)); // toggle

  btnSave?.addEventListener("click", () => applyConsentAndLoad({
    analytics: chkAnalytics.checked,
    marketing: chkMarketing.checked
  }));
})();

// Lightbox simple para ampliar imágenes
(() => {
  const lb = document.getElementById("lightbox");
  if (!lb) return;

  const img = lb.querySelector(".lightbox__img");
  const closeBtn = lb.querySelector(".lightbox__close");

  function open(src, alt) {
    img.src = src;
    img.alt = alt || "";
    lb.classList.add("is-open");
    lb.setAttribute("aria-hidden", "false");
  }

  function close() {
    lb.classList.remove("is-open");
    lb.setAttribute("aria-hidden", "true");
    img.src = "";
    img.alt = "";
  }

  // Click en imagen (solo las que tengan .zoomable)
  document.addEventListener("click", (e) => {
    const target = e.target.closest(".before-after img");
    if (!target) return;
    open(target.src, target.alt);
  });

  // Cerrar
  closeBtn.addEventListener("click", close);
  lb.addEventListener("click", (e) => { if (e.target === lb) close(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
})();
