# Roteiro de Apresentação — Mesa Cheia
### TDE de Programação Web · URI Erechim · Prof. Douglas Tagliari

> **Tempo total:** 15 minutos  
> **Estrutura:** 2 min introdução → 4 min demo ao vivo → 4 min APIs → 3 min DevTools + Lighthouse → 2 min perguntas preparadas  
> **Tom:** técnico mas descontraído. Você está explicando algo que construiu e entende — não decorando um roteiro.

---

## ANTES DE ENTRAR NA SALA

Lista de verificação (faça isso 10 minutos antes):

- [ ] `npm start` rodando no terminal — deixe o terminal minimizado, não feche
- [ ] Abra no navegador (Chrome): `http://localhost:3000`
- [ ] Abra numa aba separada: `http://localhost:3000/docs` (Swagger)
- [ ] DevTools aberto na aba Network (`F12` → Network → marque "Preserve log")
- [ ] Adicione 2 ou 3 itens ao carrinho antes de entrar (já fica populado)
- [ ] Deixe o Postman (ou o próprio Swagger) aberto com as requisições prontas
- [ ] Feche notificações, Spotify, Slack — qualquer coisa que apareça em tela

---

## PARTE 1 — Introdução e Arquitetura (≈ 2 minutos)

**Fale isso:**

> "Professor, o projeto que desenvolvi é a *Mesa Cheia*, um e-commerce de board games — jogos de tabuleiro. Escolhi esse nicho porque é um produto com muitos atributos técnicos interessantes pra filtrar e buscar: número de jogadores, duração, complexidade, designer. Isso tornou o sistema de busca mais rico do que simplesmente uma listagem por nome.
>
> A arquitetura segue o modelo cliente-servidor que a gente estudou. O backend é um servidor Node.js com Express, banco SQLite — que é um arquivo único, então o professor não precisa instalar nada além do `npm install`. O frontend é HTML5, CSS3 e JavaScript ES6 puro, sem Bootstrap, sem React, sem Tailwind — o CSS é inteiramente meu.
>
> A estrutura do código é organizada em camadas:"

**Mostre a pasta no VS Code (ou no terminal com `tree`):**

```
routes → controllers → services → models → banco
```

> "Cada camada tem uma responsabilidade única. A rota recebe a requisição e direciona. O controller chama o service e define o status HTTP de resposta. O service contém a regra de negócio — por exemplo, o cálculo de frete e desconto fica no `cartService.js`. O model é puro SQL — só ele fala com o banco. Isso é o padrão MVC adaptado para APIs REST."

---

## PARTE 2 — Demonstração ao vivo (≈ 4 minutos)

**Mostre o fluxo completo. Não clique rápido — fale enquanto navega.**

### Home (`http://localhost:3000`)

> "Essa é a home. Tem um hero banner com chamada para ação, a navegação por categoria no header, barra de busca e os quatro produtos em destaque — que vêm da rota `GET /featured` da API. Enquanto a requisição carrega, você pode ver o efeito esqueleto nos cards, que é uma boa prática de UX para evitar tela em branco."

### Busca (`/busca`)

> "Vou buscar por 'cooperativo'."

*— digita "cooperativo" na barra de busca —*

> "A URL mudou para `/busca?query=cooperativo` — os parâmetros de busca ficam na query string, o que permite compartilhar e favoritar resultados. O filtro de categoria no lado esquerdo funciona por radio button e chama a API sem recarregar a página. A paginação também é dinâmica — e o backend valida que `page` e `limit` são inteiros maiores que zero, retornando 400 se não forem."

### Detalhe do produto (`/p/pandemic/4`)

> "Clicando em um produto vou para a PDP — Product Detail Page. A URL tem o slug legível mais o ID numérico no final, que é o que a API usa de fato. Vejo todos os atributos: jogadores, duração, complexidade, designer, mecânica. E aqui está o botão de adicionar ao carrinho — que usa o stepper de quantidade."

*— ajusta a quantidade para 2, clica em "Adicionar à sacola" —*

> "O toast verde confirmou que foi adicionado. O número no ícone do carrinho atualizou para 2. Isso está no LocalStorage — abre o DevTools e mostra em Application → Local Storage."

### Carrinho (`/carrinho`)

> "No carrinho, os itens vêm do LocalStorage, mas o resumo — preço, subtotal, frete e total — é calculado pelo backend via `POST /cart`. O front nunca envia o preço; ele manda só o `productId` e a quantidade. O servidor busca o preço real no banco. Isso impede que alguém forje o preço pelo DevTools.
>
> O frete aqui está R$25 porque meu subtotal é abaixo de R$200. Se eu aumentar a quantidade..."

*— aumenta a quantidade de um item até o subtotal passar de R$200 —*

> "...o frete zerou automaticamente. A regra é `subtotal >= 200 ? 0 : 25`, exatamente como o enunciado pede.
>
> Vou aplicar o cupom URI10:"

*— digita URI10 no campo, clica em Aplicar —*

> "Dez por cento de desconto aplicado. O total foi recalculado na mesma chamada à API."

---

## PARTE 3 — Demonstração das APIs (≈ 4 minutos)

**Use o Swagger em `/docs` — é mais elegante que o Postman na hora de apresentar.**

### GET /health

*— abre `/docs`, expande GET /health, clica em "Try it out" → Execute —*

> "A rota `/health` responde 200 com o status `ok` e o uptime do processo. Ela é usada em ambientes de produção por orquestradores como o Kubernetes para saber se o serviço está de pé."

### GET /search com parâmetros inválidos

*— chama `/search?page=0` —*

> "Vou propositalmente passar `page=0`, que é inválido. O middleware `validateSearch` intercepta antes de chegar no controller e retorna 400 com mensagem clara. O status code está correto — 400 Bad Request, não 500."

### POST /products (Basic Auth)

*— expande POST /products, clica em "Authorize" no topo do Swagger, coloca `admin@mesacheia.com` / `admin123` —*

> "Para cadastrar ou deletar produto, a rota exige Basic Auth com um usuário que tenha a flag `isAdmin = 1` no banco. O Swagger já tem o campo de autorização. Vou cadastrar um produto novo:"

*— preenche o body de exemplo no Swagger e executa —*

> "Retornou 201 Created com o produto completo, incluindo o ID gerado pelo banco. Se eu tentar sem autenticação..."

*— clica em Authorize, remove as credenciais, tenta de novo —*

> "...401 Unauthorized. O middleware `basicAuth` rejeita antes de chegar no controller."

### POST /cart

*— executa com um array de itens + cupomCode: "URI10" —*

> "Essa é a rota que o front chama quando o usuário está no carrinho. O corpo tem `items` com `productId` e `qty`, e o cupom. A resposta traz cada item com nome, preço, imagem e subtotal de linha, mais os totais calculados."

### POST /login + Bearer JWT (bônus)

*— faz login com as credenciais de cliente —*

> "Aqui estão os endpoints bônus. O login retorna um token JWT. Com esse token posso acessar o carrinho persistido no banco, adicionar itens e remover — independente do LocalStorage. Isso significa que o usuário pode começar a montar o carrinho no celular e terminar no computador."

---

## PARTE 4 — DevTools + Lighthouse ao vivo (≈ 3 minutos)

### Network tab (mostre durante a navegação)

*— abre `http://localhost:3000`, F12 → aba Network —*

> "Professor, aqui no DevTools, aba Network, consigo ver todas as requisições que o front fez. Essa aqui é o `GET /featured` — status 200, resposta JSON com os 4 produtos. O tipo de conteúdo é `application/json`, que é o padrão REST.
>
> Note que nenhuma requisição expõe senha ou dado sensível nas URLs — tudo que é sensível vai no header `Authorization` ou no corpo `POST`. Isso está no enunciado como requisito de segurança."

*— navega para o carrinho, mostra a requisição POST /cart —*

> "Aqui está o `POST /cart`. No payload, só `productId` e `qty` — sem preço. Na resposta, o servidor calculou tudo. Se eu abrir o preview da resposta, está exatamente no formato que o enunciado especifica: `items`, `subtotal`, `freight`, `discount`, `total`."

### Console tab

> "No Console não tem nenhum erro vermelho — a API respondeu certo em todos os casos. Os únicos logs são os de debug do backend no terminal, que mostram método e rota de cada requisição."

### Lighthouse

*— F12 → aba Lighthouse → seleciona "Navigation", marca Performance, Accessibility, Best Practices, SEO → Generate report —*

> "Professor, vou rodar o Lighthouse agora."

*— aguarda o relatório aparecer —*

**Enquanto carrega, fale:**

> "O Lighthouse é a ferramenta do Google Chrome que avalia um site em quatro dimensões: Performance, Acessibilidade, Boas Práticas e SEO. Vamos ver o resultado."

**Quando aparecer, aponte cada número:**

- **Performance** — deve ser alto porque não tem dependência externa (sem Google Fonts, sem CDN de framework, sem Bootstrap). Todos os assets são locais.

  > "A performance é alta porque o site não depende de nenhuma CDN externa. Os arquivos JS são módulos nativos do browser — sem bundler, sem webpack, carregamento direto."

- **Accessibility** — deve ser alto porque o CSS tem `focus-visible`, todos os inputs têm `label`, imagens têm `alt`, e o HTML usa elementos semânticos (`header`, `main`, `nav`, `footer`, `article`).

  > "A acessibilidade está bem avaliada porque usei HTML semântico — `header`, `nav`, `main`, `article` — e todo elemento interativo tem label acessível. O CSS respeita `prefers-reduced-motion` para usuários com sensibilidade a animações."

- **Best Practices** — sem erros de console, sem mixed content, sem bibliotecas com vulnerabilidades conhecidas.

- **SEO** — o `index.html` tem `<title>`, `<meta name="description">`, `<meta property="og:*">` e `<link rel="icon">`.

  > "Para SEO, cada página tem title único, description e Open Graph. A página de admin tem `<meta name="robots" content="noindex">` — para não indexar área restrita."

---

## PARTE 5 — Perguntas difíceis e como responder

A seguir estão as perguntas que o Prof. Douglas tem mais chance de fazer, com a resposta que demonstra que você entende de verdade (não decorou).

---

**"Por que SQLite e não MySQL ou PostgreSQL?"**

> "SQLite foi uma escolha consciente de contexto. O projeto é avaliado localmente — o avaliador só roda `npm install` e `npm start`. Com MySQL ou Postgres ele precisaria instalar um servidor separado, criar banco, configurar credenciais. Com SQLite, o banco é um único arquivo que o próprio código cria. Em produção com múltiplos usuários simultâneos eu usaria Postgres, mas para um TDE rodando em uma máquina só, SQLite é a escolha mais prática. A lib `better-sqlite3` é síncrona e faz o código SQL ficar legível sem callbacks."

---

**"Por que você usou `better-sqlite3` em vez do `sqlite3` clássico?"**

> "O `sqlite3` é assíncrono — cada query vira uma callback ou Promise. O `better-sqlite3` é síncrono, o que em Node.js parece antinatural, mas para um servidor SQLite local com uma única thread de escrita é mais rápido e o código fica mais limpo: uma linha de `db.prepare().get()` em vez de um `await db.get()` dentro de try/catch. É uma troca consciente de complexidade por legibilidade."

---

**"O que acontece se dois usuários adicionarem o mesmo produto ao carrinho ao mesmo tempo?"**

> "No banco, a tabela `cart_items` tem uma constraint `UNIQUE(userId, productId)`. O insert usa `ON CONFLICT DO UPDATE SET qty = excluded.qty` — que é o UPSERT do SQLite. Então a segunda operação atualiza a quantidade em vez de criar uma linha duplicada. SQLite garante atomicidade por transação, então não há condição de corrida nesse cenário."

---

**"Como funciona a autenticação da rota de produto? É segura?"**

> "A rota `POST /products` usa HTTP Basic Auth — o cliente manda um header `Authorization: Basic base64(email:senha)`. No servidor, o middleware `basicAuth` decodifica o base64, busca o usuário no banco pelo email e compara a senha com o hash bcrypt usando `compareSync`. Se não bater, retorna 401 imediatamente. A flag `isAdmin` é verificada depois — se for 0, também retorna 401. Em produção eu usaria HTTPS para evitar que o base64 seja interceptado em texto puro, mas para fins de demonstração local o fluxo está completo."

---

**"Por que o preço não vem do front no POST /cart?"**

> "Porque qualquer dado que vem do cliente pode ser manipulado. Se o front enviasse o preço, qualquer um abre o DevTools, modifica o payload da requisição e manda `price: 0.01` para um produto de R$300. O `cartService` recebe só `productId` e `qty`, busca o preço real no banco usando `productModel.findManyByIds`, e calcula o total. O front não tem como adulterar o preço — a fonte de verdade é sempre o banco."

---

**"O que é o `asyncHandler` que você usou nos controllers?"**

> "É um wrapper de duas linhas que envolve qualquer função async e captura erros automaticamente com `.catch(next)`. Sem ele, qualquer `throw` dentro de um controller async precisaria de um `try/catch` explícito, e o `next(err)` dentro do catch — se esquecesse, o Express travaria silenciosamente. Com o wrapper, o controller fica limpo e todos os erros caem no mesmo middleware central de erro."

---

**"Como o frontend sabe a URL 'bonita' `/p/catan/1`?"**

> "O Express tem uma rota `GET /p/:slug/:id` que simplesmente serve o arquivo `produto.html`. O JavaScript da página lê o ID do `location.pathname` — divide por `/`, pega o terceiro segmento. O slug é decorativo para SEO e legibilidade; o que a API usa de fato é o ID numérico para `GET /product/:id`. O history API (`pushState`) e os links com href já formatado fazem o restante."

---

**"Qual a diferença entre os módulos JS que você usou?"**

> "Usei ES Modules nativos do browser — a tag `<script type='module'>` e `import/export` do ES2015+. Cada arquivo tem uma responsabilidade única: `api.js` centraliza todas as chamadas fetch; `cart.js` gerencia o LocalStorage; `ui.js` tem helpers de renderização compartilhados; cada página tem seu próprio arquivo de lógica. Isso é separação de responsabilidade no front-end sem precisar de bundler."

---

**"O que acontece se o cupom for inválido?"**

> "A API retorna 400 Bad Request com `{ error: { message: 'Cupom inválido: XPTO' } }`. No carrinho do front, o `carrinho.js` detecta o status 400 e verifica se há cupom aplicado — se sim, exibe um toast de erro, limpa o cupom e rechama a função de render sem cupom. O usuário vê a mensagem de erro e o carrinho volta ao cálculo correto."

---

**"Por que você não usou React/Vue?"**

> "O enunciado pediu domínio da base — HTML, CSS e JS puro. React abstrairia o DOM e o ciclo de requisição de uma forma que tornaria mais difícil demonstrar que eu entendo o que acontece por baixo. Com JS puro, cada `fetch`, cada `innerHTML`, cada evento está explícito e rastreável no DevTools. Se o professor pedir para eu explicar qualquer linha de código, eu consigo — o que seria mais difícil de fazer com um framework que gera código compilado."

---

## Frase de encerramento

> "Professor, o projeto cobre todos os requisitos do enunciado — o fluxo completo Home → Busca → Detalhe → Carrinho, as cinco rotas obrigatórias, as cinco rotas bônus com autenticação JWT, a página de admin protegida, e a documentação Swagger. Fico à disposição para qualquer pergunta sobre o código."

---

*Boa apresentação. 🎲*
