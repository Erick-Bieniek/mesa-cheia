import { login, search, adminCreateProduct, adminDeleteProduct } from './api.js';
import { money, escapeHtml, toast } from './ui.js';

const AUTH_KEY = 'mesa-cheia:admin-auth';
const gate = document.getElementById('gate');
const panel = document.getElementById('panel');

// Basic Auth precisa das credenciais a cada requisicao protegida. Por isso,
// apos validar o login, guardamos o header "Basic base64(email:senha)" na
// sessionStorage (apagada ao fechar a aba). E uma simplificacao consciente de
// um projeto academico — em producao usariamos um fluxo de token + HTTPS.
const getAuth = () => sessionStorage.getItem(AUTH_KEY);

function showPanel(email) {
  gate.hidden = true;
  panel.hidden = false;
  document.getElementById('who').textContent = email || '';
  loadProducts();
}

// ---- Login ---------------------------------------------------------------
document.getElementById('loginBtn').addEventListener('click', async () => {
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  if (!email || !password) return toast('Informe e-mail e senha', 'err');

  try {
    const { user } = await login(email, password); // valida credenciais
    if (!user.isAdmin) return toast('Este usuário não é administrador', 'err');

    const basic = 'Basic ' + btoa(`${email}:${password}`);
    sessionStorage.setItem(AUTH_KEY, basic);
    sessionStorage.setItem(AUTH_KEY + ':email', email);
    toast(`Bem-vindo, ${user.name}`, 'ok');
    showPanel(email);
  } catch (err) {
    toast(err.message || 'Falha no login', 'err');
  }
});

document.getElementById('logoutBtn').addEventListener('click', () => {
  sessionStorage.removeItem(AUTH_KEY);
  sessionStorage.removeItem(AUTH_KEY + ':email');
  panel.hidden = true; gate.hidden = false;
});

// ---- Listagem ------------------------------------------------------------
async function loadProducts() {
  const tbody = document.getElementById('prodTable');
  try {
    const { items } = await search({ limit: 100 });
    tbody.innerHTML = items.map((p) => `
      <tr>
        <td>${p.id}</td>
        <td>${escapeHtml(p.name)}</td>
        <td>${money(p.price)}</td>
        <td><button class="btn-danger btn" data-del="${p.id}" data-name="${escapeHtml(p.name)}">Deletar</button></td>
      </tr>`).join('');

    tbody.querySelectorAll('[data-del]').forEach((btn) => {
      btn.addEventListener('click', () => deleteProduct(btn.dataset.del, btn.dataset.name));
    });
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="4">Erro: ${escapeHtml(err.message)}</td></tr>`;
  }
}

// ---- Criar ---------------------------------------------------------------
document.getElementById('createBtn').addEventListener('click', async () => {
  const val = (id) => document.getElementById(id).value.trim();
  const num = (id) => { const v = document.getElementById(id).value; return v === '' ? null : Number(v); };

  const product = {
    name: val('f-name'),
    category: val('f-cat'),
    price: num('f-price'),
    oldPrice: num('f-old'),
    description: val('f-desc'),
    image: val('f-image') || '/img/favicon.svg',
    stock: num('f-stock') ?? 0,
    players: val('f-players'),
    playtime: val('f-playtime'),
    weight: num('f-weight'),
    designer: val('f-designer'),
    mechanic: val('f-mechanic'),
  };

  if (!product.name || product.price === null) return toast('Nome e preço são obrigatórios', 'err');

  try {
    const created = await adminCreateProduct(product, getAuth());
    toast(`"${created.name}" cadastrado (ID ${created.id})`, 'ok');
    document.querySelectorAll('#panel input, #panel textarea').forEach((el) => {
      if (el.type !== 'email' && el.type !== 'password') el.value = '';
    });
    loadProducts();
  } catch (err) {
    if (err.status === 401) toast('Sessão expirada — entre novamente', 'err');
    else toast(err.message || 'Erro ao cadastrar', 'err');
  }
});

// ---- Deletar -------------------------------------------------------------
async function deleteProduct(id, name) {
  if (!confirm(`Deletar "${name}" (ID ${id})? Esta ação não pode ser desfeita.`)) return;
  try {
    await adminDeleteProduct(id, getAuth());
    toast(`Produto ${id} deletado`, 'ok');
    loadProducts();
  } catch (err) {
    toast(err.message || 'Erro ao deletar', 'err');
  }
}

// ---- Auto-login se ja houver sessao -------------------------------------
if (getAuth()) showPanel(sessionStorage.getItem(AUTH_KEY + ':email'));
