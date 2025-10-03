// Selectores rápidos (helpers)
const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));

/* --- Tema (claro/oscuro)
   - Aplica data-theme="dark" en <html> para activar variables CSS del tema oscuro.
   - Guarda la preferencia en localStorage.
   - Actualiza el texto y el estado aria-pressed del botón.
*/
const themeToggle = $('#theme-toggle');
const root = document.documentElement;
const THEME_KEY = 'theme-preference';

// Obtener tema preferido (guardado o por sistema)
function getSavedOrSystemTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === 'dark' || saved === 'light') return saved;
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  return prefersDark ? 'dark' : 'light';
}

// Aplicar tema: 'dark' o 'light'
function applyTheme(theme) {
  if (theme === 'dark') {
    root.setAttribute('data-theme', 'dark');
    if (themeToggle) {
      themeToggle.textContent = '☀️';
      themeToggle.setAttribute('aria-pressed', 'true');
    }
  } else {
    root.removeAttribute('data-theme');
    if (themeToggle) {
      themeToggle.textContent = '🌙';
      themeToggle.setAttribute('aria-pressed', 'false');
    }
  }
  localStorage.setItem(THEME_KEY, theme);
}

// Inicializar tema al cargar (protección si el botón no existe)
const initialTheme = getSavedOrSystemTheme();
applyTheme(initialTheme);

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const current = root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next);
  });
}

/* --- Navegación móvil
   - Alterna visibilidad del nav en móviles.
   - Actualiza aria-expanded en el botón y utiliza estilos (display flex/none) como fallback.
   - Al cambiar tamaño de ventana, se restaura el estado por defecto para evitar menús pegados.
*/
const navToggle = $('#nav-toggle');
const nav = $('#main-nav');

function isNavVisible() {
  // Si el nav tiene inline style display, respetarlo; si no, usar computed style
  return nav && (nav.style.display && nav.style.display !== 'none') || (nav && getComputedStyle(nav).display !== 'none');
}

function setNavVisible(visible) {
  if (!nav || !navToggle) return;
  nav.style.display = visible ? 'flex' : 'none';
  navToggle.setAttribute('aria-expanded', visible ? 'true' : 'false');
}

if (navToggle && nav) {
  // Inicial: en pantallas grandes el nav debe mostrarse por CSS; en móviles se oculta automáticamente por CSS
  // No forzar un estado aquí para respetar CSS, sólo asegurarse de aria-expanded correcto
  navToggle.setAttribute('aria-expanded', isNavVisible() ? 'true' : 'false');

  navToggle.addEventListener('click', () => {
    const visible = isNavVisible();
    setNavVisible(!visible
