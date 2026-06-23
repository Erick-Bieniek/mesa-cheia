// Comportamentos comuns do layout (rodam em toda pagina):
//  - atualiza o contador do carrinho no header
//  - marca o link de navegacao ativo conforme a categoria atual
import { updateBadge } from './cart.js';

function markActiveNav() {
  const cat = new URLSearchParams(location.search).get('cat');
  if (!cat) return;
  document.querySelectorAll('.main-nav a').forEach((a) => {
    if (a.getAttribute('href')?.includes(`cat=${cat}`)) {
      a.setAttribute('aria-current', 'page');
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  updateBadge();
  markActiveNav();
});
