// script.js — reemplazar todo el archivo con este contenido

// Selectores rápidos
const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));

// Elementos principales
const root = document.documentElement;
const themeToggle = $('#theme-toggle');
const navToggle = $('#nav-toggle');
const nav = $('#main-nav');
const modal = $('#modal');
const modalBody = $('#modal-body');
const modalClose = $('#modal-close');
const yearEl = $('#year');

// Constantes
const THEME_KEY = 'theme-preference';

// -----------------------------
// Tema (claro / oscuro)
// -----------------------------
function getSavedOrSystemTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === 'dark' || saved === 'light') return saved;
  return (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light';
}
function applyTheme(theme) {
  if (theme === 'dark') {
    root.setAttribute('data-theme', 'dark');
    if (themeToggle) { themeToggle.textContent = '☀️'; themeToggle.setAttribute('aria-pressed', 'true'); }
  } else {
    root.removeAttribute('data-theme');
    if (themeToggle) { themeToggle.textContent = '🌙'; themeToggle.setAttribute('aria-pressed', 'false'); }
  }
  try { localStorage.setItem(THEME_KEY, theme); } catch(e) {}
}
const initialTheme = getSavedOrSystemTheme();
applyTheme(initialTheme);
if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const current = root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    applyTheme(current === 'dark' ? 'light' : 'dark');
  });
}

// -----------------------------
// Navegación móvil
// -----------------------------
function isNavVisible() {
  if (!nav) return false;
  if (nav.style.display) return nav.style.display !== 'none';
  return getComputedStyle(nav).display !== 'none';
}
function setNavVisible(visible) {
  if (!nav || !navToggle) return;
  nav.style.display = visible ? 'flex' : 'none';
  navToggle.setAttribute('aria-expanded', visible ? 'true' : 'false');
}
if (navToggle && nav) {
  navToggle.setAttribute('aria-expanded', isNavVisible() ? 'true' : 'false');
  navToggle.addEventListener('click', () => setNavVisible(!isNavVisible()));
  window.addEventListener('resize', () => {
    if (window.innerWidth > 800) {
      nav.style.display = '';
      navToggle.setAttribute('aria-expanded', 'false');
    }
  });
}

// -----------------------------
// Filtros de proyectos
// -----------------------------
function setupProjectFilters() {
  const filterContainer = document.querySelector('.project-filters');
  if (!filterContainer) return;
  const filterButtons = Array.from(filterContainer.querySelectorAll('button'));
  const projectCards = Array.from(document.querySelectorAll('.project-card'));

  function applyFilter(filter) {
    projectCards.forEach(card => {
      const tech = (card.dataset.tech || '').toLowerCase();
      const matches = (filter === 'all') || tech.split(/\s+/).includes(filter) || tech.includes(filter);
      card.style.display = matches ? '' : 'none';
    });
  }

  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const f = (btn.dataset.filter || 'all').toLowerCase();
      applyFilter(f);
    });
  });

  // Inicializar estado: si no hay active, activar el primero
  if (!filterButtons.some(b => b.classList.contains('active')) && filterButtons[0]) filterButtons[0].classList.add('active');
  const activeFilter = document.querySelector('.project-filters .active')?.dataset.filter || 'all';
  applyFilter(activeFilter);
}
setupProjectFilters();

// -----------------------------
// Modal de detalles (delegación + robustez)
// -----------------------------
let lastFocusedTrigger = null;

function openModal(htmlContent, trigger) {
  if (!modal || !modalBody) return;
  modalBody.innerHTML = htmlContent;
  modal.setAttribute('aria-hidden', 'false');
  lastFocusedTrigger = trigger || null;
  if (modalClose) modalClose.focus();
  document.documentElement.style.overflow = 'hidden';
}
function closeModal() {
  if (!modal) return;
  modal.setAttribute('aria-hidden', 'true');
  if (lastFocusedTrigger && typeof lastFocusedTrigger.focus === 'function') lastFocusedTrigger.focus();
  lastFocusedTrigger = null;
  document.documentElement.style.overflow = '';
}

// Delegation: un solo listener para capturar clicks en botones .show-detail
document.addEventListener('click', (e) => {
  const btn = e.target.closest && e.target.closest('.show-detail');
  if (!btn) return;
  const card = btn.closest && btn.closest('.project-card');
  if (!card) return;

  const title = card.querySelector('h3')?.textContent?.trim() || 'Sin título';
  // Elegir la primera <p> que no tenga clase project-meta
  const descNode = Array.from(card.querySelectorAll('p')).find(p => !p.classList.contains('project-meta'));
  const desc = descNode ? descNode.textContent.trim() : '';
  const meta = card.querySelector('.project-meta')?.textContent?.trim() || '';
  const repoLink = card.querySelector('a[href*="github.com"]')?.href || '';

  const repoHtml = repoLink ? `<p><a href="${repoLink}" target="_blank" rel="noopener noreferrer">Ver repo</a></p>` : '';
  const content = `
    <div class="modal-inner">
      <h3 id="modal-title">${escapeHtml(title)}</h3>
      ${desc ? `<p>${escapeHtml(desc)}</p>` : ''}
      ${meta ? `<p class="project-meta">${escapeHtml(meta)}</p>` : ''}
      ${repoHtml}
    </div>
  `;
  openModal(content, btn);
});

// Cerrar con el botón de cerrar
if (modalClose) modalClose.addEventListener('click', closeModal);

// Cerrar al clicar en el overlay (fuera del contenido)
if (modal) modal.addEventListener('click', (e) => {
  if (e.target === modal) closeModal();
});

// Cerrar con Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modal && modal.getAttribute('aria-hidden') === 'false') closeModal();
});

// Pequeña utilidad para evitar inyección accidental (escapar texto)
function escapeHtml(str) {
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

// -----------------------------
// Footer: año automático
// -----------------------------
if (yearEl) yearEl.textContent = new Date().getFullYear();

// -----------------------------
// Depuración ligera (solo si no funciona)
// -----------------------------
// Si el modal no aparece, comprobar en consola cuántos triggers existen
// console.log('show-detail count:', document.querySelectorAll('.show-detail').length);
