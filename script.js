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

// Lightbox
const lightbox = $("#lightbox");
const lightboxImg = $("#lightboxImg");
const lightboxCap = $("#lightboxCap");
const lightboxClose = $("#lightboxClose");

tiles.forEach(tile => {
  tile.addEventListener("click", () => {
    const img = $("img", tile);
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt || "";
    lightboxCap.textContent = tile.querySelector("figcaption")?.textContent || "";
    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  });
});

function closeLightbox(){
  lightbox.classList.remove("is-open");
  lightbox.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}
lightboxClose.addEventListener("click", closeLightbox);
lightbox.addEventListener("click", (e) => {
  if (e.target === lightbox) closeLightbox();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && lightbox.classList.contains("is-open")) closeLightbox();
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
      const res = await fetch("api/lead_create.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok || !data) throw new Error(data?.message || "Error");

      note.textContent = data.message || "¡Enviado!";
      form.reset();
    } catch (err) {
      note.textContent = "No se pudo enviar. Inténtalo de nuevo o escríbenos por WhatsApp.";
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