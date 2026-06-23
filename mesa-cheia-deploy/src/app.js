const express = require('express');
const cors = require('cors');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');

const routes = require('./routes');
const notFound = require('./middlewares/notFound');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

// ---------------------------------------------------------------------------
// MIDDLEWARES GLOBAIS
// ---------------------------------------------------------------------------
app.use(cors());            // libera o front (outra porta) a chamar a API
app.use(express.json());    // transforma o corpo JSON da requisicao em req.body

// Log minimo de debug, sem expor dados sensiveis (pedido no enunciado).
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// ---------------------------------------------------------------------------
// DOCUMENTACAO SWAGGER / OPENAPI
// O arquivo openapi.yaml descreve todas as rotas; aqui ele e servido em /docs.
// ---------------------------------------------------------------------------
const openapiSpec = YAML.load(path.join(__dirname, '..', 'openapi.yaml'));
app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapiSpec, {
  customSiteTitle: 'Mesa Cheia API — Docs',
}));

// ---------------------------------------------------------------------------
// ROTAS DA API  (English: /health, /product, /search, /cart, /login...)
// ---------------------------------------------------------------------------
app.use('/', routes);

// ---------------------------------------------------------------------------
// FRONTEND servido pelo MESMO servidor (uma URL so, sem dor de cabeca de CORS
// na apresentacao). As rotas de PAGINA usam portugues (/busca, /carrinho, /p,
// /admin) e por isso nao colidem com as rotas da API acima.
// ---------------------------------------------------------------------------
const FRONT = path.join(__dirname, '..', 'frontend');
app.use(express.static(FRONT)); // serve css/js/img e o index.html em "/"

app.get('/busca',        (_req, res) => res.sendFile(path.join(FRONT, 'busca.html')));
app.get('/p/:slug/:id',  (_req, res) => res.sendFile(path.join(FRONT, 'produto.html')));
app.get('/carrinho',     (_req, res) => res.sendFile(path.join(FRONT, 'carrinho.html')));
app.get('/admin',        (_req, res) => res.sendFile(path.join(FRONT, 'admin.html')));

// ---------------------------------------------------------------------------
// TRATAMENTO DE ERROS (precisa vir SEMPRE por ultimo)
// ---------------------------------------------------------------------------
app.use(notFound);      // 404 — rota inexistente
app.use(errorHandler);  // 500 — qualquer erro nao tratado cai aqui

module.exports = app;
