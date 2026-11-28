/* =========================================================
   EpiNexo · Sitio comercial (index.html)
   HU-47 (propuesta de valor), HU-05 (perfiles) y HU-48 (contacto).
   La demo con datos está en demo.html y requiere iniciar sesión.
   ========================================================= */
"use strict";

(function () {
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const icon = (name, cls = "icon") => `<svg class="${cls}" aria-hidden="true"><use href="#ic-${name}"></use></svg>`;
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  function setStatus(el, type, msg) {
    const ic = type === "ok" ? "circle-check" : "circle-alert";
    el.innerHTML = msg ? `<p class="status-${type}">${icon(ic)}<span>${esc(msg)}</span></p>` : "";
  }
  function setError(input, errEl, msg) {
    if (msg) { input.setAttribute("aria-invalid", "true"); errEl.textContent = msg; }
    else { input.removeAttribute("aria-invalid"); errEl.textContent = ""; }
    return !msg;
  }

  /* ---------------- Navegación móvil ---------------- */
  const navToggle = $(".nav-toggle"), navList = $("#menu-principal");
  if (navToggle && navList) {
    navToggle.addEventListener("click", () => {
      const open = navToggle.getAttribute("aria-expanded") === "true";
      navToggle.setAttribute("aria-expanded", String(!open));
      navList.classList.toggle("open", !open);
    });
    navList.addEventListener("click", (e) => {
      if (e.target.closest("a") && window.matchMedia("(max-width: 63.99rem)").matches) {
        navToggle.setAttribute("aria-expanded", "false"); navList.classList.remove("open");
      }
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && navList.classList.contains("open")) {
        navToggle.setAttribute("aria-expanded", "false"); navList.classList.remove("open"); navToggle.focus();
      }
    });
  }

  /* ---------------- HU-05 · Perfiles ---------------- */
  const PROFILES = {
    analista: { title: "Analista epidemiológico", items: [
      ["layout-dashboard", "Indicadores de casos, incidencia, defunciones y letalidad con su fuente y fecha."],
      ["map", "Mapa de riesgo por zona y alertas automáticas cuando los casos aumentan 30 % o más."],
      ["trending-up", "Tendencia semanal con estimación referencial para las próximas 4 semanas."],
      ["shield-check", "Estado de calidad de cada fuente para saber qué validar primero."]] },
    coordinador: { title: "Coordinador de la respuesta", items: [
      ["layout-dashboard", "Vista ejecutiva de la emergencia en una sola franja."],
      ["sparkles", "Ranking de zonas prioritarias con los factores que explican cada puntaje."],
      ["bed-double", "Camas disponibles por establecimiento y stock de insumos críticos."],
      ["navigation", "Asignación de brigadas e insumos con seguimiento de cada intervención y mensajes."]] },
    brigada: { title: "Brigada de campo", items: [
      ["map-pin", "Alertas con ubicación de la zona, casos y acción requerida, ordenadas por urgencia."],
      ["clipboard-list", "Registro de inspecciones con listas de selección, sin papel."],
      ["wifi-off", "Funciona sin señal, guarda los registros cifrados y sincroniza al recuperar la conexión."],
      ["triangle-alert", "Reporte estructurado de incidencias al coordinador."]] }
  };
  function renderProfile(key) {
    const p = PROFILES[key];
    $("#profile-panel").innerHTML = `
      <h3>${esc(p.title)}</h3>
      <ul class="feature-list">${p.items.map(([ic, t]) => `<li>${icon(ic)}<span>${esc(t)}</span></li>`).join("")}</ul>
      <a class="btn btn-secondary" href="demo.html?perfil=${key}" data-profile-link>${icon("log-in")}Probar este perfil en la demo</a>`;
  }
  $$('input[name="perfil"]').forEach((r) => r.addEventListener("change", () => renderProfile(r.value)));
  renderProfile("analista");

  /* ---------------- HU-48 · Formulario de contacto con aviso de datos ---------------- */
  $("#c-region").innerHTML = `<option value="">Selecciona tu región</option>` + PERU_REGIONS.map((r) => `<option>${r}</option>`).join("");
  const contactRules = {
    "c-name": (el) => (el.value.trim().length >= 3 ? "" : "Ingresa tu nombre completo"),
    "c-email": (el) => (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(el.value.trim()) ? "" : "Ingresa un correo válido"),
    "c-phone": (el) => (/^9\d{8}$/.test(el.value.replace(/\s/g, "")) ? "" : "Ingresa un celular de 9 dígitos que empiece con 9"),
    "c-region": (el) => (el.value ? "" : "Selecciona tu región"),
    "c-msg": (el) => (el.value.trim().length >= 10 ? "" : "Escribe un mensaje de al menos 10 caracteres"),
    "c-consent": (el) => (el.checked ? "" : "Para enviar, acepta el aviso de privacidad")
  };
  function validateContactField(id) {
    const el = document.getElementById(id);
    return setError(el, document.getElementById(`${id}-err`), contactRules[id](el));
  }
  Object.keys(contactRules).forEach((id) => {
    const el = document.getElementById(id);
    el.addEventListener(el.type === "checkbox" ? "change" : "blur", () => { if (el.type === "checkbox" || el.value) validateContactField(id); });
  });
  $("#contact-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const summary = $("#contact-summary"), st = $("#contact-status");
    const errors = Object.keys(contactRules).filter((id) => !validateContactField(id));
    if (errors.length) {
      setStatus(st, "", "");
      summary.hidden = false;
      summary.innerHTML = `<strong>Revisa ${errors.length === 1 ? "1 campo" : errors.length + " campos"} antes de enviar:</strong><ul>${errors.map((id) =>
        `<li><a href="#${id}">${esc(document.getElementById(`${id}-err`).textContent)}</a></li>`).join("")}</ul>`;
      summary.focus();
      return;
    }
    summary.hidden = true; summary.innerHTML = "";
    try {
      // Solo se conserva lo necesario para responder; nunca datos de pacientes.
      const sent = JSON.parse(localStorage.getItem("epinexo-solicitudes") || "[]");
      sent.push({ name: $("#c-name").value.trim(), region: $("#c-region").value, consent: true, at: new Date().toISOString() });
      localStorage.setItem("epinexo-solicitudes", JSON.stringify(sent));
    } catch (err) { /* sin almacenamiento */ }
    e.target.reset();
    setStatus(st, "ok", "Solicitud enviada. Te contactaremos en un máximo de 2 días hábiles.");
  });
  $("#contact-summary").addEventListener("click", (e) => {
    const a = e.target.closest("a"); if (!a) return;
    e.preventDefault(); document.querySelector(a.getAttribute("href")).focus();
  });
})();
