import { search, getCategories } from './api.js';
import { productCard, getParam, escapeHtml } from './ui.js';

const grid = document.getElementById('resultsGrid');
const countEl = document.getElementById('resultCount');
const pagEl = document.getElementById('pagination');
const titleEl = document.getElementById('pageTitle');
const crumbEl = document.getElementById('crumb');
const catBox = document.getElementById('catFilters');
const sortSel = document.getElementById('sortSelect');

const LIMIT = 9;

// estado atual lido da URL (fonte unica de verdade = query string)
const state = {
  query: getParam('query'),
  cat: getParam('cat'),
  page: Math.max(1, Number(getParam('page')) || 1),
  sort: getParam('sort') || 'relevance',
};

// reflete o estado na URL sem recarregar a pagina (history API)
function syncUrl() {
  const qs = new URLSearchParams();
  if (state.query) qs.set('query', state.query);
  if (state.cat) qs.set('cat', state.cat);
  if (state.page > 1) qs.set('page', state.page);
  if (state.sort !== 'relevance') qs.set('sort', state.sort);
  history.replaceState(null, '', `/busca${qs.toString() ? '?' + qs : ''}`);
}

function sortItems(items) {
  const arr = [...items];
  if (state.sort === 'price-asc') arr.sort((a, b) => a.price - b.price);
  else if (state.sort === 'price-desc') arr.sort((a, b) => b.price - a.price);
  else if (state.sort === 'name') arr.sort((a, b) => a.name.localeCompare(b.name));
  return arr;
}

function renderPagination(page, totalPages) {
  if (totalPages <= 1) { pagEl.innerHTML = ''; return; }
  let html = `<button ${page === 1 ? 'disabled' : ''} data-page="${page - 1}" aria-label="Página anterior">‹</button>`;
  for (let p = 1; p <= totalPages; p++) {
    html += `<button data-page="${p}" aria-current="${p === page}">${p}</button>`;
  }
  html += `<button ${page === totalPages ? 'disabled' : ''} data-page="${page + 1}" aria-label="Próxima página">›</button>`;
  pagEl.innerHTML = html;
}

async function load() {
  syncUrl();
  titleEl.textContent = state.cat ? `Categoria: ${state.cat}` : (state.query ? `Busca: “${state.query}”` : 'Todos os jogos');
  crumbEl.textContent = state.cat || (state.query ? 'Resultado da busca' : 'Catálogo');
  countEl.textContent = 'Carregando…';
  grid.innerHTML = '';

  try {
    const res = await search({ query: state.query, cat: state.cat, page: state.page, limit: LIMIT });
    const items = sortItems(res.items);

    countEl.textContent = res.total === 0
      ? 'Nenhum jogo encontrado'
      : `${res.total} ${res.total === 1 ? 'jogo encontrado' : 'jogos encontrados'}`;

    grid.innerHTML = items.length
      ? items.map(productCard).join('')
      : `<div class="state" style="grid-column:1/-1"><h2>Nada por aqui</h2><p>Tente outra palavra ou limpe os filtros.</p></div>`;

    renderPagination(res.page, res.totalPages);
  } catch (err) {
    countEl.textContent = '';
    grid.innerHTML = `<div class="state" style="grid-column:1/-1"><h2>Erro ao buscar</h2><p>${escapeHtml(err.message)}</p></div>`;
  }
}

async function buildCategoryFilters() {
  try {
    const { categories } = await getCategories();
    const opts = ['', ...categories]; // "" = Todas
    catBox.innerHTML = opts.map((c) => `
      <label class="filter-option">
        <input type="radio" name="cat" value="${escapeHtml(c)}" ${c === state.cat ? 'checked' : ''}>
        ${c || 'Todas'}
      </label>`).join('');

    catBox.addEventListener('change', (e) => {
      if (e.target.name !== 'cat') return;
      state.cat = e.target.value;
      state.page = 1;
      load();
    });
  } catch { /* filtro e' opcional, ignora falha */ }
}

// ordenacao
sortSel.value = state.sort;
sortSel.addEventListener('change', () => { state.sort = sortSel.value; load(); });

// limpar filtros
document.getElementById('clearFilters').addEventListener('click', () => {
  state.query = ''; state.cat = ''; state.page = 1; state.sort = 'relevance';
  sortSel.value = 'relevance';
  document.querySelectorAll('input[name="cat"]').forEach((r) => { r.checked = r.value === ''; });
  load();
});

// paginacao (delegacao de evento)
pagEl.addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-page]');
  if (!btn || btn.disabled) return;
  state.page = Number(btn.dataset.page);
  window.scrollTo({ top: 0, behavior: 'smooth' });
  load();
});

buildCategoryFilters();
load();
