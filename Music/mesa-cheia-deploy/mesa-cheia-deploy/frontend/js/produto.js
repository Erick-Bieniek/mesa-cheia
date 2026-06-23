import { getProduct } from './api.js';
import { money, escapeHtml, catClass } from './ui.js';
import { addItem, updateBadge } from './cart.js';
import { toast } from './ui.js';

const root = document.getElementById('pdpRoot');

// O id vem do final da URL "bonita" /p/<slug>/<id> (ou do ?id= como fallback)
function getId() {
  const parts = location.pathname.split('/').filter(Boolean); // ['p','slug','id']
  const fromPath = parts[2];
  return Number(fromPath || new URLSearchParams(location.search).get('id'));
}

function attrRow(label, value) {
  return value ? `<li><b>${label}</b><span>${escapeHtml(String(value))}</span></li>` : '';
}

async function render() {
  const id = getId();
  if (!id) { return notFound('Produto não informado.'); }

  try {
    const p = await getProduct(id);
    const off = p.oldPrice && p.oldPrice > p.price ? Math.round((1 - p.price / p.oldPrice) * 100) : 0;
    document.title = `${p.name} — Mesa Cheia`;

    root.innerHTML = `
      <nav class="breadcrumb" aria-label="Você está em">
        <a href="/">Início</a> / <a href="/busca?cat=${encodeURIComponent(p.category)}">${escapeHtml(p.category)}</a> / <span>${escapeHtml(p.name)}</span>
      </nav>
      <div class="pdp">
        <div class="pdp-media">
          <img src="${escapeHtml(p.image)}" alt="Capa do jogo ${escapeHtml(p.name)}" width="600" height="600">
        </div>
        <div class="pdp-info">
          <span class="tag ${catClass(p.category)}">${escapeHtml(p.category)}</span>
          <h1>${escapeHtml(p.name)}</h1>
          <div class="pdp-price">
            <span class="price">${money(p.price)}</span>
            ${off ? `<span class="price-old">${money(p.oldPrice)}</span><span class="badge-off">-${off}%</span>` : ''}
          </div>
          <p class="pdp-desc">${escapeHtml(p.description || '')}</p>

          <ul class="attrs">
            ${attrRow('Jogadores', p.players)}
            ${attrRow('Duração', p.playtime)}
            ${attrRow('Idade', p.age)}
            ${attrRow('Complexidade', p.weight ? `${p.weight} / 5` : '')}
            ${attrRow('Designer', p.designer)}
            ${attrRow('Mecânica', p.mechanic)}
            ${attrRow('Estoque', p.stock > 0 ? `${p.stock} unidades` : 'Esgotado')}
          </ul>

          <div class="buy-row">
            <div class="stepper" role="group" aria-label="Quantidade">
              <button type="button" id="minus" aria-label="Diminuir">−</button>
              <input id="qty" type="number" min="1" value="1" inputmode="numeric" aria-label="Quantidade">
              <button type="button" id="plus" aria-label="Aumentar">+</button>
            </div>
            <button class="btn btn-primary btn-lg" id="addBtn" ${p.stock <= 0 ? 'disabled' : ''}>
              ${p.stock <= 0 ? 'Esgotado' : 'Adicionar à sacola'}
            </button>
          </div>
        </div>
      </div>`;

    // stepper
    const qty = root.querySelector('#qty');
    root.querySelector('#minus').onclick = () => { qty.value = Math.max(1, Number(qty.value) - 1); };
    root.querySelector('#plus').onclick = () => { qty.value = Number(qty.value) + 1; };
    qty.onchange = () => { if (Number(qty.value) < 1 || isNaN(Number(qty.value))) qty.value = 1; };

    // adicionar a sacola
    root.querySelector('#addBtn').onclick = () => {
      addItem(p.id, Number(qty.value));
      updateBadge();
      toast(`${p.name} adicionado à sacola`, 'ok');
    };
  } catch (err) {
    if (err.status === 404) notFound('Esse jogo não está no catálogo.');
    else notFound(err.message);
  }
}

function notFound(msg) {
  document.title = 'Produto não encontrado — Mesa Cheia';
  root.innerHTML = `<div class="state">
    <h2>Produto não encontrado</h2>
    <p>${escapeHtml(msg)}</p>
    <p style="margin-top:1rem"><a class="btn btn-primary" href="/busca">Ver o catálogo</a></p>
  </div>`;
}

render();
