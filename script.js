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
// Project case studies (Modal content)
// -----------------------------
const projectDetails = {
  p1: {
    title: "Predictive Metamodel for Process Optimization",

    objective: "Develop a high-accuracy surrogate model to replace computationally expensive process simulations while also improving overall process efficiency by optimizing operating variables.",

    methodology: "Simulation workflows were automated using IronPython within an open-source process simulator. The process model was validated against operational data reported in a peer-reviewed scientific article describing multiple measurement points across a real power plant. Over 20,000 synthetic and simulated samples were generated under varying operating conditions. An exploratory data analysis and domain-informed feature engineering were performed prior to training. The optimal number of samples was determined using a maximum percentage error criterion, as the model was intended to support Bayesian optimization and therefore required very high precision. A Random Forest regressor was trained using 90% of the data with cross-validation, while 10% was reserved as a fully independent test set. Hyperparameters were optimized, including number of trees, maximum depth, minimum samples per split, minimum samples per leaf, and feature subsampling.",

    results: "The final model achieved R² = 0.996 and MAPE = 0.32% on the independent test set, confirming strong generalization performance and validating the suitability of Random Forest models for power plant surrogate modeling.",

    impact: "Reduced evaluation time from minutes per simulation to milliseconds per prediction, enabling scalable optimization workflows and demonstrating the practical applicability of machine learning models for real-world engineering systems.",

    tools: "Python, pandas, scikit-learn, matplotlib, IronPython, process simulation software"
  },

p2: {
    title: "Local RAG Intelligence Engine for Large-Scale Documentation",

    objective: "Build a high-precision Retrieval-Augmented Generation (RAG) system to enable secure and verifiable querying of extensive technical documentation (>2,500 pages) in a private, local environment.",

    methodology: "Developed an end-to-end pipeline using Python and LangChain, integrating pdfplumber for high-fidelity extraction of text and structured tables. A custom chunking strategy was implemented to maintain page-level source attribution, ensuring traceability of every response. Vector embeddings were generated and stored in a FAISS index for efficient similarity search. Local LLM inference was orchestrated via Ollama (Llama 3 / Phi-3), eliminating data privacy risks associated with cloud APIs. Performance was evaluated using a telemetry module built with pandas to track retrieval accuracy and system latency.",

    results: "Successfully enabled real-time querying across 2,500+ pages of unstructured data with 100% source-verifiability. The system correctly identifies specific pages for technical citations, while the performance logs identified key bottlenecks in local hardware inference, providing a baseline for future quantization and SLM optimization.",

    impact: "Created a functional, private prototype that transforms static technical manuals into an interactive knowledge base. Demonstrated the feasibility of deploying large language models on local hardware for secure industrial or research applications, significantly reducing the risk of data leaks and hallucinations.",

    tools: "Python, LangChain, FAISS, Ollama (Llama 3/Phi-3), pandas, Streamlit, pdfplumber"
},

  p3: {
    title: "Personal Portfolio Website",

    objective: "Create a responsive, accessible, and high-performance personal portfolio to showcase software development and data analysis projects.",

    methodology: "The website was built from scratch using semantic HTML5 for structure and accessibility. CSS3 with custom properties (variables) was used for styling, enabling a dual light/dark theme switcher. Modern CSS features like Grid and Flexbox were used for layout. All interactions, including the theme toggle, mobile navigation, project filtering, and the details modal, were implemented with vanilla JavaScript, focusing on performance and good practices like event delegation.",

    results: "A fully responsive single-page application that works seamlessly across devices. Implemented dynamic content loading for project details and client-side filtering. Achieved high accessibility standards and a clean, modern user interface.",

    impact: "This project serves as a live demonstration of front-end development skills, including HTML, CSS, and JavaScript proficiency. It acts as a central hub for professional branding and project showcasing.",

    tools: "HTML5, CSS3, Vanilla JavaScript"
  },

   p4: {
    title: "Bike Sharing Data Analysis (Google Data Analytics Capstone)",

    objective: "Understand behavioral differences between casual riders and annual members in order to identify opportunities to increase customer conversion and improve business strategy.",

    methodology: "Analyzed 5.78 million trip records collected from multiple CSV datasets. Performed data cleaning, transformation, and exploratory analysis using R and SQL. Conducted user segmentation based on usage patterns (trip duration, time of day, weekday vs weekend behavior). Built interactive dashboards in Tableau to communicate insights clearly to non-technical stakeholders.",

    results: "Identified that 37% of casual users exhibit behavior similar to annual members, indicating a high-potential segment for conversion.",

    impact: "Proposed a targeted weekend membership strategy aimed at increasing retention and long-term revenue by focusing marketing efforts on high-potential casual riders.",

    tools: "R, SQL, Tableau"
  }
};


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
const initialTheme = localStorage.getItem(THEME_KEY) || 'dark';
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

// Delegation: un solo listener para capturar clicks en botones 
document.addEventListener('click', (e) => {
  const btn = e.target.closest && e.target.closest('.show-detail');
  if (!btn) return;
  const card = btn.closest && btn.closest('.project-card');
  if (!card) return;

const id = btn.dataset.id;
const data = projectDetails[id];

if (!data) return;

const content = `
  <div class="modal-inner">
    <h2 id="modal-title">${escapeHtml(data.title)}</h2>

    <h4>🎯 Objective</h4>
    <p>${escapeHtml(data.objective)}</p>

    <h4>🧩 Methodology</h4>
    <p>${escapeHtml(data.methodology)}</p>

    <h4>📈 Results</h4>
    <p>${escapeHtml(data.results)}</p>

    <h4>🚀 Impact</h4>
    <p>${escapeHtml(data.impact)}</p>

    <h4>🛠 Tools</h4>
    <p>${escapeHtml(data.tools)}</p>
  </div>
`;


openModal(content, btn);

});

// Cerrar con el botón de cerrar
if (modalClose) modalClose.addEventListener('click', closeModal);

// Cerrar al clicar en el overlay 
if (modal) modal.addEventListener('click', (e) => {
  if (e.target === modal) closeModal();
});

// Cerrar con Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modal && modal.getAttribute('aria-hidden') === 'false') closeModal();
});

// Pequeña utilidad para evitar inyección accidental
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
