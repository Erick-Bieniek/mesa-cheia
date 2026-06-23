# Guia completo de instalação e configuração
## Mesa Cheia — TDE de Programação Web (URI Erechim)

---

# PARTE 1 — O que você precisa instalar antes de qualquer coisa

## Passo 1 — Instalar o Node.js

O projeto roda em cima do Node.js. Você precisa da versão 18 ou mais nova.

**Como verificar se já está instalado:**
Abra o terminal (Prompt de Comando ou PowerShell no Windows / Terminal no Mac/Linux) e digite:

```
node --version
npm --version
```

Se aparecer algo como `v22.x.x` e `10.x.x`, está instalado. Pode pular para o Passo 2.

Se aparecer "não reconhecido" ou qualquer erro:
- Acesse https://nodejs.org
- Baixe o botão **LTS** (o verde, versão estável)
- Instale normalmente (next, next, finish)
- Feche e reabra o terminal, depois rode os comandos acima de novo

---

## Passo 2 — Instalar as ferramentas de compilação (Windows)

O banco de dados SQLite precisa de um compilador C++ para montar as peças internas na primeira instalação. Isso é necessário apenas uma vez.

**No Windows, abra o PowerShell como Administrador e rode:**

```
npm install -g windows-build-tools
```

Se esse comando falhar, a alternativa manual é:
- Acesse https://visualstudio.microsoft.com/visual-cpp-build-tools/
- Baixe e instale o "Build Tools for Visual Studio"
- Durante a instalação, marque **"Desktop development with C++"**
- Reinicie o computador depois

**No Linux (Ubuntu/Debian):**

```
sudo apt install -y build-essential python3
```

**No Mac:**

```
xcode-select --install
```

---

## Passo 3 — Instalar o Git

O professor pediu entrega via GitHub Classroom, então precisa do Git.

**Como verificar:**

```
git --version
```

Se não estiver instalado:
- Windows: https://git-scm.com/download/win → baixe e instale
- Linux: `sudo apt install git`
- Mac: o Xcode já instala junto

---

# PARTE 2 — Organizar os arquivos do projeto

## Passo 4 — Criar a estrutura de pastas

Escolha um lugar no seu computador para colocar o projeto. Exemplo: `Documentos/tde-progweb`.

A estrutura final precisa ficar **exatamente assim**:

```
mesa-cheia/
│
├── README.md
├── ROTEIRO_APRESENTACAO.md
│
├── backend/                        ← servidor Node.js / API
│   ├── .env.example
│   ├── .gitignore
│   ├── openapi.yaml
│   ├── package.json
│   ├── server.js
│   └── src/
│       ├── app.js
│       ├── config/
│       │   ├── db.js
│       │   └── seed.js
│       ├── controllers/
│       │   ├── authController.js
│       │   ├── cartController.js
│       │   ├── healthController.js
│       │   ├── productController.js
│       │   └── searchController.js
│       ├── middlewares/
│       │   ├── auth.js
│       │   ├── errorHandler.js
│       │   ├── notFound.js
│       │   └── validateSearch.js
│       ├── models/
│       │   ├── cartModel.js
│       │   ├── productModel.js
│       │   └── userModel.js
│       ├── routes/
│       │   ├── authRoutes.js
│       │   ├── cartRoutes.js
│       │   ├── index.js
│       │   ├── productRoutes.js
│       │   └── searchRoutes.js
│       ├── services/
│       │   ├── authService.js
│       │   ├── cartService.js
│       │   └── productService.js
│       └── utils/
│           ├── AppError.js
│           └── asyncHandler.js
│
└── frontend/                       ← páginas HTML, CSS e JavaScript do site
    ├── admin.html
    ├── busca.html
    ├── carrinho.html
    ├── index.html
    ├── produto.html
    ├── css/
    │   └── styles.css
    ├── img/
    │   ├── 7wonders.svg
    │   ├── azul.svg
    │   ├── carcassonne.svg
    │   ├── catan.svg
    │   ├── codenames.svg
    │   ├── dixit.svg
    │   ├── favicon.svg
    │   ├── logo-meeple.svg
    │   ├── pandemic.svg
    │   ├── spiritisland.svg
    │   ├── splendor.svg
    │   ├── thecrew.svg
    │   ├── ticket.svg
    │   └── wingspan.svg
    └── js/
        ├── admin.js
        ├── api.js
        ├── busca.js
        ├── carrinho.js
        ├── cart.js
        ├── config.js
        ├── home.js
        ├── layout.js
        ├── produto.js
        └── ui.js
```

## Passo 5 — Baixar todos os arquivos do Claude

Todos os arquivos que o Claude gerou estão disponíveis para download acima nessa conversa. Você precisa baixar cada um e colocar na pasta correta.

Para cada arquivo, olhe o nome e o caminho e coloque na pasta correspondente. Por exemplo:
- `backend/server.js` → vai para dentro da pasta `backend/`
- `backend/src/config/db.js` → vai para dentro de `backend/src/config/`
- `frontend/css/styles.css` → vai para dentro de `frontend/css/`
- `frontend/img/catan.svg` → vai para dentro de `frontend/img/`

**Dica:** Se você tiver o VS Code instalado, abra a pasta `mesa-cheia` inteira nele. Fica muito mais fácil de ver se está tudo no lugar certo.

---

# PARTE 3 — Configurar e rodar o projeto

## Passo 6 — Copiar o arquivo de configuração

Abra o terminal **dentro da pasta `backend`** e rode:

```
cp .env.example .env
```

No Windows (Prompt de Comando):

```
copy .env.example .env
```

Isso cria o arquivo `.env` com as configurações padrão. O conteúdo dele é:

```
PORT=3000
JWT_SECRET=mesa-cheia-segredo-troque-em-producao
ADMIN_EMAIL=admin@mesacheia.com
ADMIN_PASSWORD=admin123
```

Você **não precisa mudar nada** para rodar localmente. Esse arquivo define a porta, a senha secreta do JWT e as credenciais do usuário administrador que vai ser criado automaticamente no banco.

---

## Passo 7 — Instalar as dependências

Com o terminal ainda dentro da pasta `backend`, rode:

```
npm install
```

Esse comando lê o `package.json` e baixa todas as bibliotecas necessárias (Express, SQLite, bcrypt, JWT, Swagger, etc) para dentro de uma pasta chamada `node_modules/`. Isso pode demorar 1 a 3 minutos na primeira vez.

Você vai ver várias linhas aparecendo no terminal. É normal. Quando parar e aparecer algo como `added 150 packages`, está pronto.

**Se aparecer erro de compilação do SQLite:**
O erro vai mencionar `better-sqlite3` e `gyp`. Volte ao Passo 2 e instale as ferramentas de compilação, depois rode `npm install` de novo.

---

## Passo 8 — Rodar o servidor

Ainda dentro da pasta `backend`, rode:

```
npm start
```

Se tudo estiver certo, o terminal vai mostrar:

```
Mesa Cheia API rodando em http://localhost:3000
Swagger (documentação) em http://localhost:3000/docs
Health check em        http://localhost:3000/health
Banco populado com dados iniciais (produtos + usuários).
```

**Pronto. O projeto está rodando.**

Não feche esse terminal enquanto estiver usando o site — ele é o servidor.

---

## Passo 9 — Abrir o site no navegador

Com o servidor rodando, abra o Google Chrome e acesse:

| O que abrir | Endereço |
|---|---|
| Home (página inicial) | http://localhost:3000 |
| Busca | http://localhost:3000/busca |
| Detalhe de produto | http://localhost:3000/p/catan/1 |
| Carrinho | http://localhost:3000/carrinho |
| Admin | http://localhost:3000/admin |
| Swagger (documentação da API) | http://localhost:3000/docs |
| Health check | http://localhost:3000/health |

---

## Passo 10 — Testar que está funcionando

Faça esse roteiro rápido para confirmar que tudo está ok:

1. Abra `http://localhost:3000` — deve aparecer a home com 4 jogos em destaque
2. Clique em qualquer jogo — deve ir para a página de detalhe
3. Clique em "Adicionar à sacola" — deve aparecer um toast verde e o número (1) no ícone do carrinho no header
4. Clique no ícone do carrinho — deve aparecer o item, o valor, o campo de cupom e o total calculado
5. Digite `URI10` no campo de cupom e clique em Aplicar — deve aparecer 10% de desconto
6. Abra `http://localhost:3000/docs` — deve aparecer a interface do Swagger com todas as rotas

Se tudo funcionou, está perfeito.

---

# PARTE 4 — Entregar no GitHub Classroom

## Passo 11 — Criar o repositório pelo link do professor

O professor disponibilizou o link: https://classroom.github.com/a/kMMwWf6D

- Acesse esse link com sua conta do GitHub
- Aceite a tarefa (Accept Assignment)
- O GitHub vai criar um repositório privado pra você com um nome no formato `tde-progweb-seu-usuario`
- Copie o endereço HTTPS do repositório (vai parecer com `https://github.com/URI-erechim-prog-web/tde-progweb-seu-usuario.git`)

---

## Passo 12 — Configurar o Git e enviar os arquivos

Abra o terminal **dentro da pasta `mesa-cheia`** (a pasta raiz, não dentro de `backend`).

**Configurar seu nome (só precisa fazer uma vez no computador):**

```
git config --global user.name "Seu Nome"
git config --global user.email "seu.email@example.com"
```

Use o mesmo e-mail da sua conta do GitHub.

**Iniciar o repositório e enviar:**

```
git init
git add .
git commit -m "feat: Mesa Cheia - e-commerce de board games - TDE Prog Web URI 2026/1"
git branch -M main
git remote add origin https://github.com/URI-erechim-prog-web/tde-progweb-SEU-USUARIO.git
git push -u origin main
```

Substitua a URL na penúltima linha pela URL real do seu repositório (a que você copiou no Passo 11).

**O Git vai pedir login do GitHub.** Se pedir usuário e senha e a senha não funcionar, é porque o GitHub não aceita mais senha direta — você precisa usar um Personal Access Token:
- Acesse https://github.com/settings/tokens
- Clique em "Generate new token (classic)"
- Marque o escopo `repo`
- Copie o token gerado e use ele no lugar da senha

---

## Passo 13 — Verificar se o upload foi correto

Acesse o endereço do seu repositório no GitHub pelo navegador. Você deve ver:

- A pasta `backend/` com todos os arquivos
- A pasta `frontend/` com todas as páginas e imagens
- O `README.md` aparecendo na página inicial do repositório (o GitHub renderiza automaticamente)

**Importante:** a pasta `node_modules/` e o arquivo `database.sqlite` NÃO devem aparecer no GitHub — o `.gitignore` já os exclui automaticamente. Isso está correto — o professor vai rodar `npm install` na máquina dele para gerar essas pastas.

---

# PARTE 5 — O que o professor vai fazer para rodar na máquina dele

Para sua referência (e para você poder explicar na apresentação):

1. Clonar o repositório: `git clone <url-do-repo>`
2. Entrar na pasta: `cd mesa-cheia/backend`
3. Copiar o env: `cp .env.example .env`
4. Instalar: `npm install`
5. Rodar: `npm start`
6. Acessar: `http://localhost:3000`

É só isso. O banco SQLite é criado e populado automaticamente na primeira execução — o professor não precisa instalar MySQL, criar banco, configurar credenciais. Essa foi uma decisão de projeto proposital.

---

# Resumo em uma linha por passo

| Passo | O que fazer |
|---|---|
| 1 | Instalar Node.js em nodejs.org (versão LTS) |
| 2 | Instalar Build Tools C++ (Windows) ou build-essential (Linux) |
| 3 | Instalar Git em git-scm.com |
| 4 | Criar a estrutura de pastas `mesa-cheia/backend/` e `mesa-cheia/frontend/` |
| 5 | Colocar cada arquivo baixado na pasta correta |
| 6 | Copiar `.env.example` para `.env` dentro de `backend/` |
| 7 | Rodar `npm install` dentro de `backend/` |
| 8 | Rodar `npm start` dentro de `backend/` |
| 9 | Abrir `http://localhost:3000` no Chrome |
| 10 | Testar o fluxo: home → produto → carrinho → cupom URI10 |
| 11 | Acessar o link do Classroom e criar o repositório |
| 12 | Rodar os comandos git para enviar os arquivos |
| 13 | Conferir no GitHub se tudo subiu corretamente |
