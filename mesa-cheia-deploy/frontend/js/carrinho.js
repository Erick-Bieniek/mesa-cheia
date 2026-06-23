import { getItems, getSummary, setQty, removeItem, clear, updateBadge } from './cart.js';
import { money, escapeHtml, toast } from './ui.js';

const root = document.getElementById('cartRoot');
const FREE_FROM = 200;
let coupon = ''; // cupom aplicado no momento

async function render() {
  if (getItems().length === 0) return renderEmpty();

  root.innerHTML = '<div class="state"><h2>Atualizando…</h2></div>';

  let data;
  try {
    data = await getSummary(coupon);
  } catch (err) {
    // cupom invalido: a API responde 400 — avisamos e recalculamos sem cupom
    if (err.status === 400 && coupon) {
      toast('Cupom inválido', 'err');
      coupon = '';
      return render();
    }
    root.innerHTML = `<div class="state"><h2>Erro ao carregar a sacola</h2><p>${escapeHtml(err.message)}</p></div>`;
    return;
  }

  const faltam = FREE_FROM - data.subtotal;
  const freightHint = data.freight === 0
    ? `<div class="sum-line free"><span>Frete</span><span>Grátis</span></div>`
    : `<div class="sum-line"><span>Frete</span><span>${money(data.freight)}</span></div>`;

  root.innerHTML = `
    <div class="cart-layout">
      <div>
        <div class="cart-items">
          ${data.items.map(itemRow).join('')}
        </div>
        <p style="margin-top:1rem">
          <a href="/busca" class="btn-ghost">← Continuar comprando</a>
          <button id="clearCart" class="btn-ghost" style="margin-left:1rem;color:var(--accent)">Esvaziar sacola</button>
        </p>
      </div>

      <aside class="summary">
        <h2>Resumo</h2>

        <div class="coupon-row">
          <input id="coupon" type="text" placeholder="Cupom (ex.: URI10)" value="${escapeHtml(coupon)}" aria-label="Código do cupom">
          <button class="btn" id="applyCoupon">Aplicar</button>
        </div>

        ${faltam > 0
          ? `<p class="freight-hint">Faltam <strong>${money(faltam)}</strong> para o frete grátis.</p>`
          : `<p class="freight-hint">🎉 Você ganhou frete grátis!</p>`}

        <div class="sum-line"><span>Subtotal (${data.items.reduce((s, i) => s + i.qty, 0)} itens)</span><span>${money(data.subtotal)}</span></div>
        ${freightHint}
        ${data.discount > 0 ? `<div class="sum-line discount"><span>Desconto (${escapeHtml(data.coupon)})</span><span>− ${money(data.discount)}</span></div>` : ''}
        <div class="sum-total"><span>Total</span><span>${money(data.total)}</span></div>

        <button class="btn btn-primary btn-block btn-lg" id="checkout" style="margin-top:1.2rem">Finalizar compra</button>
      </aside>
    </div>`;

  wireEvents();
}

function itemRow(it) {
  return `
    <div class="cart-row" data-id="${it.productId}">
      <img src="${escapeHtml(it.image || '')}" alt="${escapeHtml(it.name)}" width="88" height="88">
      <div>
        <div class="ci-name">${escapeHtml(it.name)}</div>
        <div class="ci-meta">${money(it.price)} cada</div>
        <div class="stepper" style="margin-top:.5rem" role="group" aria-label="Quantidade de ${escapeHtml(it.name)}">
          <button type="button" data-act="dec" aria-label="Diminuir">−</button>
          <input type="number" min="1" value="${it.qty}" data-act="set" aria-label="Quantidade">
          <button type="button" data-act="inc" aria-label="Aumentar">+</button>
        </div>
      </div>
      <div class="ci-right">
        <span class="ci-line-total">${money(it.lineTotal)}</span>
        <button class="remove-btn" data-act="remove">Remover</button>
      </div>
    </div>`;
}

function wireEvents() {
  // acoes dentro de cada linha (delegacao de evento)
  root.querySelectorAll('.cart-row').forEach((row) => {
    const id = Number(row.dataset.id);
    row.addEventListener('click', (e) => {
      const act = e.target.dataset.act;
      if (act === 'inc') changeQty(id, +1);
      else if (act === 'dec') changeQty(id, -1);
      else if (act === 'remove') { removeItem(id); updateBadge(); render(); }
    });
    const input = row.querySelector('input[data-act="set"]');
    input.addEventListener('change', () => {
      const q = Math.max(1, Number(input.value) || 1);
      setQty(id, q); updateBadge(); render();
    });
  });

  root.querySelector('#applyCoupon').onclick = () => {
    coupon = root.querySelector('#coupon').value.trim().toUpperCase();
    render();
  };
  root.querySelector('#clearCart').onclick = () => { clear(); updateBadge(); render(); };
  root.querySelector('#checkout').onclick = () => {
    toast('Pedido simulado com sucesso! 🎲', 'ok');
    clear(); updateBadge();
    setTimeout(render, 400);
  };
}

function changeQty(id, delta) {
  const items = getItems();
  const it = items.find((i) => i.productId === id);
  if (!it) return;
  setQty(id, it.qty + delta);
  updateBadge();
  render();
}

function renderEmpty() {
  root.innerHTML = `<div class="state">
    <h2>Sua sacola está vazia</h2>
    <p>Que tal começar por um clássico?</p>
    <p style="margin-top:1rem"><a class="btn btn-primary" href="/busca">Explorar jogos</a></p>
  </div>`;
}

render();
