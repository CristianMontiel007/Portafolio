// DOM helpers
const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));

/* --- Theme toggle --- */
const themeToggle = $('#theme-toggle');
const root = document.documentElement;
const savedTheme = localStorage.getItem('theme');
if (savedTheme) root.setAttribute('data-theme', savedTheme);

themeToggle.addEventListener('click', () => {
  const current = root.getAttribute('data-theme');
  const next = current === 'dark' ? '' : 'dark';
  root.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
  themeToggle.textContent = next === 'dark' ? '☀️' : '🌙';
});

/* --- Mobile nav toggle --- */
const navToggle = $('#nav-toggle');
const nav = $('#main-nav');

navToggle.addEventListener('click', () => {
  // Toggle visibility (simple)
  const isHidden = getComputedStyle(nav).display === 'none';
  nav.style.display = isHidden ? 'flex' : 'none';
});

/* --- Project filters --- */
const filterButtons = $$('.project-filters button');
const projectCards = $$('.project-card');

function applyFilter(filter) {
  projectCards.forEach(card => {
    const tech = card.dataset.tech || '';
    if (filter === 'all' || tech.includes(filter)) {
      card.style.display = '';
    } else {
      card.style.display = 'none';
    }
  });
}

// Activate filter button UI
filterButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    filterButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    applyFilter(btn.dataset.filter);
  });
});

// default: show all
applyFilter('all');

/* --- Modal details for project --- */
const modal = $('#modal');
const modalBody = $('#modal-body');
const modalClose = $('#modal-close');

$$('.show-detail').forEach((btn, i) => {
  btn.addEventListener('click', (e) => {
    const card = e.target.closest('.project-card');
    const title = card.querySelector('h3').textContent;
    const desc = card.querySelector('p')?.textContent || '';
    const meta = card.querySelector('.project-meta')?.textContent || '';
    modalBody.innerHTML = `<h3>${title}</h3><p>${desc}</p><p class="project-meta">${meta}</p><p><a href="https://github.com/cristianmontiel007" target="_blank" rel="noopener">Ver repo</a></p>`;
    modal.setAttribute('aria-hidden', 'false');
  });
});

modalClose.addEventListener('click', () => modal.setAttribute('aria-hidden', 'true'));
modal.addEventListener('click', (e) => {
  if (e.target === modal) modal.setAttribute('aria-hidden', 'true');
});

/* --- Footer year auto --- */
document.getElementById('year').textContent = new Date().getFullYear();
