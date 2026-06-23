# Mesa Cheia 🎲

> E-commerce de board games — TDE de Programação Web  
> URI Erechim · Turma 2026/1 · Prof. Douglas Tagliari

---

## Sobre o projeto

**Mesa Cheia** é uma loja virtual de jogos de tabuleiro com fluxo completo de e-commerce: Home → Busca → Detalhe → Carrinho → Área Admin. A identidade visual segue a estética de "caixa de board game": blocos de cor chapada, bordas grossas e sombras duras deslocadas. Nenhuma lib de UI foi usada — tudo é HTML5 + CSS3 + JavaScript ES6+ puros.

O catálogo inicial traz 12 jogos reais em 4 categorias (Estratégia, Família, Party, Cooperativo), com atributos ricos de board game (nº de jogadores, duração, complexidade, designer, mecânica) que alimentam o sistema de busca e filtros.

---

## Tecnologias

| Camada | Tecnologia | Justificativa |
|---|---|---|
| Runtime | Node.js 18+ | Base de estudo da disciplina |
| Framework | Express 4 | Minimalista, explícito, amplamente adotado |
| Banco de dados | SQLite via `better-sqlite3` | Arquivo local, zero instalação extra para o avaliador |
| Autenticação | `bcryptjs` + `jsonwebtoken` | Senhas hasheadas; JWT para rotas bônus de usuário |
| Documentação | `swagger-ui-express` + `yamljs` | OpenAPI 3 servido em `/docs` |
| Frontend | HTML5 + CSS3 + JS ES6+ (módulos nativos) | Sem frameworks, demonstra domínio da base |

---

## Como rodar

### Pré-requisitos

- Node.js ≥ 18 (com `npm`)
- Compilador C++ para o `better-sqlite3`: no Windows instale as [Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/); no Linux/Mac o `build-essential` / Xcode resolve

### 1. Clone e instale

```bash
git clone <url-do-repositorio>
cd mesa-cheia/backend
cp .env.example .env
npm install
```

### 2. Suba o servidor

```bash
npm start
```

O terminal vai exibir:

```
Mesa Cheia API rodando em http://localhost:3000
Swagger (documentação) em http://localhost:3000/docs
Health check em        http://localhost:3000/health
Banco populado com dados iniciais (produtos + usuários).
```

### 3. Acesse

| Página | URL |
|---|---|
| Home | http://localhost:3000 |
| Busca / Listagem | http://localhost:3000/busca |
| Detalhe de produto | http://localhost:3000/p/catan/1 |
| Carrinho | http://localhost:3000/carrinho |
| Admin | http://localhost:3000/admin |
| Swagger / Docs | http://localhost:3000/docs |

### Credenciais do seed

| Papel | E-mail | Senha |
|---|---|---|
| Admin | `admin@mesacheia.com` | `admin123` |
| Cliente | `cliente@mesacheia.com` | `cliente123` |

---

## Rotas da API

### Saúde

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| GET | `/health` | — | Status do serviço |

### Produtos

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| GET | `/featured` | — | 4 produtos em destaque (home) |
| GET | `/product/:id` | — | Detalhe de um produto |
| POST | `/products` | Basic Auth (admin) | Cadastrar produto |
| DELETE | `/product/:id` | Basic Auth (admin) | Deletar produto |

### Busca

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| GET | `/search?query=&cat=&page=&limit=` | — | Busca paginada com filtros |
| GET | `/categories` | — | Lista categorias distintas |

### Carrinho

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| POST | `/cart` | — | Calcula resumo: subtotal, frete, desconto, total |
| GET | `/cart` | Bearer JWT | Carrinho persistido do usuário *(bônus)* |
| PUT | `/cart/items` | Bearer JWT | Adicionar/atualizar item *(bônus)* |
| PUT | `/cart/items/:productId` | Bearer JWT | Alterar quantidade *(bônus)* |
| DELETE | `/cart/items/:productId` | Bearer JWT | Remover item *(bônus)* |

### Autenticação *(bônus)*

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| POST | `/register` | — | Cadastrar cliente (senha criptografada) |
| POST | `/login` | — | Login — retorna token JWT |

---

## Exemplos de requisição (Postman / Swagger)

### GET /health
```
GET http://localhost:3000/health
```

### POST /products (Basic Auth)
```
POST http://localhost:3000/products
Authorization: Basic YWRtaW5AbWVzYWNoZWlhLmNvbTphZG1pbjEyMw==
Content-Type: application/json

{
  "name": "Everdell",
  "category": "Estrategia",
  "price": 399.90,
  "oldPrice": 449.90,
  "description": "Construa uma cidade de criaturas da floresta.",
  "image": "/img/favicon.svg",
  "stock": 7,
  "players": "1-4",
  "playtime": "40-80 min",
  "age": "13+",
  "weight": 2.8,
  "designer": "James A. Wilson",
  "mechanic": "Worker placement"
}
```
> O token Base64 acima = `admin@mesacheia.com:admin123`

### DELETE /product/:id (Basic Auth)
```
DELETE http://localhost:3000/product/13
Authorization: Basic YWRtaW5AbWVzYWNoZWlhLmNvbTphZG1pbjEyMw==
```

### GET /search
```
GET http://localhost:3000/search?query=catan&page=1&limit=6
GET http://localhost:3000/search?cat=Cooperativo&page=1&limit=12
```

### POST /cart
```
POST http://localhost:3000/cart
Content-Type: application/json

{
  "items": [
    { "productId": 1, "qty": 2 },
    { "productId": 5, "qty": 1 }
  ],
  "cupomCode": "URI10"
}
```

### POST /login
```
POST http://localhost:3000/login
Content-Type: application/json

{ "email": "cliente@mesacheia.com", "password": "cliente123" }
```

---

## Regras de negócio do carrinho

```
freight  = subtotal >= 200 ? 0 : 25
discount = cupomCode === "URI10" ? subtotal * 0.10 : 0
total    = subtotal - discount + freight
```

O preço de cada item é sempre buscado no banco pelo `productId` — o front nunca envia o preço, eliminando a possibilidade de adulteração pelo cliente.

---

## Arquitetura

```
backend/
├── server.js              ← ponto de entrada
└── src/
    ├── app.js             ← Express: middlewares, Swagger, static frontend
    ├── config/
    │   └── db.js          ← SQLite: conexão, tabelas, seed (12 jogos + 2 usuários)
    ├── middlewares/       ← auth (Basic + JWT), 404, errorHandler, validateSearch
    ├── models/            ← SQL puro — só acesso ao banco
    ├── services/          ← regras de negócio (frete, cupom, validações)
    ├── controllers/       ← req → service → res (status HTTP)
    └── routes/            ← mapeamento URL → controller

frontend/
├── index.html             ← Home (/)
├── busca.html             ← Busca e listagem (/busca)
├── produto.html           ← Detalhe do produto (/p/:slug/:id)
├── carrinho.html          ← Carrinho (/carrinho)
├── admin.html             ← Painel admin (/admin)
├── css/styles.css         ← Design system completo (sem framework)
└── js/
    ├── api.js             ← Fetch API centralizado
    ├── cart.js            ← LocalStorage + resumo via API
    ├── ui.js              ← helpers de renderização compartilhados
    ├── home.js            ← lógica da home
    ├── busca.js           ← busca, filtros, paginação, ordenação
    ├── produto.js         ← PDP + adicionar ao carrinho
    ├── carrinho.js        ← carrinho, cupom, frete, totais
    └── admin.js           ← painel admin (login + CRUD)
```

---

## Itens bônus implementados (+0,2 pts)

Os itens abaixo estão descritos e justificados conforme exigido pelo enunciado.

**1. POST /login e POST /register**  
Autenticação completa com `bcryptjs` (senhas nunca em texto puro no banco) e `jsonwebtoken` (token com expiração de 2h). Justificativa: em qualquer e-commerce real o usuário precisa de conta; a disciplina abrange autenticação HTTP e essa implementação demonstra domínio de hashing e JWT, dois padrões industriais.

**2. GET /cart, PUT /cart/items, PUT /cart/items/:productId, DELETE /cart/items/:productId**  
Carrinho persistido no banco por usuário autenticado (JWT), com UPSERT para não duplicar linhas e deleção individual. Justificativa: o enunciado pede "LocalStorage mesclado com o banco" como requisito base; as rotas bônus estendem isso para persistência real por conta, permitindo que o usuário acesse o carrinho de outro dispositivo.

**3. Página /admin com flag isAdmin**  
O painel reusa as APIs de produto (`POST /products`, `DELETE /product/:id`) com Basic Auth, e verifica a flag `isAdmin=1` tanto no middleware do backend quanto no frontend (se a API retornar 401, o painel não abre). Justificativa: demonstra integração completa front-back com controle de acesso real.

**4. Código organizado em camadas com middlewares**  
Routes → Controllers → Services → Models. Middlewares independentes para autenticação (Basic e JWT), tratamento de erro centralizado (AppError + errorHandler) e validação de parâmetros (validateSearch). Justificativa: facilita manutenção e é o padrão da indústria para APIs Express.

**5. Documentação Swagger/OpenAPI completa**  
Todas as rotas documentadas em `openapi.yaml` (esquemas, exemplos de request/response, esquemas de segurança Basic e Bearer), servidas em `/docs`. Justificativa: requisito do enunciado + bônus, e é o padrão de documentação de APIs REST.

---

## Status codes implementados

| Código | Situação |
|---|---|
| 200 | Sucesso geral |
| 201 | Produto ou usuário criado |
| 400 | Parâmetro inválido, cupom inválido, dado faltando |
| 401 | Sem autenticação, credencial errada, token expirado |
| 404 | Produto ou rota não encontrada |
| 409 | E-mail já cadastrado |
| 500 | Erro interno não previsto |
