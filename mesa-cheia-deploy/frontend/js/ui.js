// Helpers de interface reutilizados por todas as paginas.

// Formata numero como Real brasileiro (R$ 1.234,56)
const BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
export const money = (n) => BRL.format(Number(n) || 0);

// Evita injecao de HTML ao montar conteudo dinamico vindo da API
export function escapeHtml(str = '') {
  return String(str)
    .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;').replaceAll("'", '&#39;');
}

// Classe da "tag de faccao" a partir da categoria (remove acentos)
export function catClass(category = '') {
  const k = category.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  return `tag--${k}`;
}

// Le um parametro da query string da URL atual
export const getParam = (name) => new URLSearchParams(location.search).get(name) || '';

// Monta o link "bonito" da PDP: /p/<slug>/<id>
export const productUrl = (p) => `/p/${p.slug}/${p.id}`;

// HTML de um card de produto (usado na home e na listagem)
export function productCard(p) {
  const off = p.oldPrice && p.oldPrice > p.price
    ? Math.round((1 - p.price / p.oldPrice) * 100) : 0;
  return `
    <article class="card">
      <a class="card-media" href="${productUrl(p)}" aria-label="${escapeHtml(p.name)}">
        <img src="${escapeHtml(p.image || '/img/placeholder.svg')}" alt="Capa do jogo ${escapeHtml(p.name)}" loading="lazy" width="500" height="500" onerror="this.onerror=null;this.src='/img/${escapeHtml(p.slug||'catan')}.svg'">
        <span class="tag ${catClass(p.category)}">${escapeHtml(p.category)}</span>
        ${off ? `<span class="badge-off">-${off}%</span>` : ''}
      </a>
      <div class="card-body">
        <h3 class="card-title"><a href="${productUrl(p)}">${escapeHtml(p.name)}</a></h3>
        <p class="card-meta">${escapeHtml(p.players || '')} jogadores · ${escapeHtml(p.playtime || '')}</p>
        <div class="card-price">
          <span class="price">${money(p.price)}</span>
          ${off ? `<span class="price-old">${money(p.oldPrice)}</span>` : ''}
        </div>
      </div>
    </article>`;
}

// ---- Toast (feedback de acoes) ------------------------------------------
function toastWrap() {
  let el = document.querySelector('.toast-wrap');
  if (!el) { el = document.createElement('div'); el.className = 'toast-wrap'; el.setAttribute('aria-live', 'polite'); document.body.appendChild(el); }
  return el;
}
export function toast(message, type = 'ok') {
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.textContent = message;
  toastWrap().appendChild(t);
  setTimeout(() => t.remove(), 3000);
}
