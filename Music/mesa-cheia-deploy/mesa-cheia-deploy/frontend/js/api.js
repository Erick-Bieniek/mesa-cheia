import { API_BASE } from './config.js';

/**
 * Wrapper unico em volta do fetch. Centraliza:
 *  - cabecalho JSON
 *  - tratamento de erro (le a mensagem padronizada { error: { message } } da API)
 * Assim os controllers do front nao repetem try/catch de baixo nivel.
 */
async function http(path, { method = 'GET', body, headers = {} } = {}) {
  const res = await fetch(API_BASE + path, {
    method,
    headers: { 'Content-Type': 'application/json', ...headers },
    body: body ? JSON.stringify(body) : undefined,
  });

  // 204 / corpo vazio
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    const msg = data?.error?.message || `Erro ${res.status}`;
    const err = new Error(msg);
    err.status = res.status;
    throw err;
  }
  return data;
}

// ---- Produtos / busca ----------------------------------------------------
export const getFeatured   = () => http('/featured');
export const getProduct    = (id) => http(`/product/${id}`);
export const getCategories = () => http('/categories');

export function search({ query = '', cat = '', page = 1, limit = 12 } = {}) {
  const qs = new URLSearchParams();
  if (query) qs.set('query', query);
  if (cat)   qs.set('cat', cat);
  qs.set('page', page);
  qs.set('limit', limit);
  return http(`/search?${qs.toString()}`);
}

// ---- Carrinho (calculo do resumo) ---------------------------------------
export const postCart = (items, cupomCode = '') =>
  http('/cart', { method: 'POST', body: { items, cupomCode } });

// ---- Autenticacao --------------------------------------------------------
export const login    = (email, password) => http('/login', { method: 'POST', body: { email, password } });
export const register = (name, email, password) => http('/register', { method: 'POST', body: { name, email, password } });

// ---- Admin (Basic Auth) --------------------------------------------------
// auth = "Basic base64(email:senha)" guardado apos o login do admin.
export const adminCreateProduct = (product, auth) =>
  http('/products', { method: 'POST', body: product, headers: { Authorization: auth } });

export const adminDeleteProduct = (id, auth) =>
  http(`/product/${id}`, { method: 'DELETE', headers: { Authorization: auth } });
