import { getFeatured } from './api.js';
import { productCard, escapeHtml, productUrl } from './ui.js';

const grid = document.getElementById('featuredGrid');
const stack = document.getElementById('heroStack');

// esqueleto enquanto carrega (melhora a percepcao de velocidade)
grid.innerHTML = Array.from({ length: 4 }).map(() => `
  <article class="card is-skeleton">
    <div class="card-media skeleton"></div>
    <div class="card-body">
      <div class="skeleton" style="height:18px;width:70%"></div>
      <div class="skeleton" style="height:14px;width:45%"></div>
      <div class="skeleton" style="height:22px;width:55%;margin-top:.5rem"></div>
    </div>
  </article>`).join('');

try {
  const { items } = await getFeatured();

  grid.innerHTML = items.map(productCard).join('');

  // monta as "caixas empilhadas" do hero com os 3 primeiros destaques
  stack.innerHTML = items.slice(0, 3).map((p) => `
    <a class="box" href="${productUrl(p)}">
      <img src="${escapeHtml(p.image)}" alt="" width="200" height="200" loading="lazy">
    </a>`).join('');
} catch (err) {
  grid.innerHTML = `<div class="state" style="grid-column:1/-1">
    <h2>Não foi possível carregar os destaques</h2>
    <p>Verifique se a API está rodando em <code>npm start</code> e recarregue a página.</p>
  </div>`;
  console.error('Falha ao carregar destaques:', err.message);
}
