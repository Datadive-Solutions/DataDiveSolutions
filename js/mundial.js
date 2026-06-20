/**
 * DataDive — Mundial 2026 (mundial.js)
 *
 * Maneja el formulario de descarga protegida del dataset:
 *   1. Valida en el navegador que todos los campos estén completos (UX).
 *   2. Envía los datos al Apps Script (Google Sheets) por POST.
 *   3. El servidor valida de nuevo y, SOLO si todo es correcto,
 *      devuelve el contenido del CSV.
 *   4. El CSV se descarga desde la respuesta — nunca está en esta página.
 *
 * ──────────────────────────────────────────────────────────────────
 * VARIABLES A SUSTITUIR:
 *   SCRIPT_URL   → URL del Web App de tu Apps Script (termina en /exec)
 *   SHARED_TOKEN → debe ser IDÉNTICO al SHARED_TOKEN del Code.gs
 * ──────────────────────────────────────────────────────────────────
 */

'use strict';

// ===== CONFIGURACIÓN =====
const SCRIPT_URL   = 'https://script.google.com/macros/s/AKfycbyCLYntmcSsW0ZHVqBSVEO_o1E49OLOXSh7wRlWlLH9Lg5Grlh4jgeezJ2JBWjf6yQ/exec';
const SHARED_TOKEN = '181198'; // = al de Code.gs

const REQUIRED_FIELDS = ['nombre', 'apellido', 'edad', 'genero', 'telefono', 'correo'];
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


/**
 * Inicializa el formulario de descarga.
 */
function initDownloadGate() {
  const form = document.getElementById('download-form');
  if (!form) return;

  const statusEl = document.getElementById('form-status');
  const submitBtn = form.querySelector('button[type="submit"]');

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    // 1. Recolectar datos
    const payload = {
      token:    SHARED_TOKEN,
      nombre:   form.nombre.value.trim(),
      apellido: form.apellido.value.trim(),
      edad:     form.edad.value.trim(),
      genero:   form.genero.value.trim(),
      telefono: form.telefono.value.trim(),
      correo:   form.correo.value.trim(),
      website:  form.website ? form.website.value.trim() : '' // honeypot
    };

    // 2. Validación en el navegador (gate de UX)
    const validationError = validatePayload(payload);
    if (validationError) {
      setStatus(statusEl, validationError, 'error');
      return;
    }

    // 3. Enviar al servidor
    setStatus(statusEl, 'Validando y preparando tu descarga…', 'loading');
    submitBtn.disabled = true;

    try {
      const response = await fetch(SCRIPT_URL, {
        method: 'POST',
        // text/plain evita el preflight CORS con Apps Script
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (result.ok && result.csv) {
        // 4. El servidor aprobó: descargar el CSV
        downloadCsv(result.csv, result.filename || 'dataset.csv');
        setStatus(statusEl, '¡Listo! Tu descarga comenzó. Gracias 🎉', 'success');
        form.reset();
      } else {
        setStatus(statusEl, result.error || 'No se pudo completar la solicitud.', 'error');
      }
    } catch (err) {
      setStatus(statusEl, 'Error de conexión. Intenta de nuevo.', 'error');
    } finally {
      submitBtn.disabled = false;
    }
  });
}


/**
 * Valida el payload en el cliente. Devuelve un mensaje de error
 * o null si todo está correcto.
 */
function validatePayload(payload) {
  for (const field of REQUIRED_FIELDS) {
    if (!payload[field] || payload[field] === '') {
      return 'Por favor completa todos los campos para descargar.';
    }
  }
  if (!EMAIL_REGEX.test(payload.correo)) {
    return 'Ingresa un correo electrónico válido.';
  }
  const edad = Number(payload.edad);
  if (!Number.isFinite(edad) || edad < 1 || edad > 120) {
    return 'Ingresa una edad válida.';
  }
  return null;
}


/**
 * Genera y dispara la descarga de un archivo CSV a partir de texto.
 */
function downloadCsv(csvText, filename) {
  // BOM para que Excel respete los acentos UTF-8
  const blob = new Blob(['\uFEFF' + csvText], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}


/**
 * Actualiza el mensaje de estado del formulario.
 */
function setStatus(el, message, type) {
  if (!el) return;
  el.textContent = message;
  el.className = 'form-status ' + (type || '');
}


/* ── INIT ─────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', initDownloadGate);