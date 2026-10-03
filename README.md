# bar-inventory-system

Aplicação web de gerenciamento de estoque e controle de vendas para bar.

## Funcionalidades

- **Gerenciamento de estoque**: cadastro de produtos (bebidas, alimentos, etc.), controle de quantidade,
  alertas de estoque baixo e histórico de movimentações (entradas/saídas).
- **Controle de vendas**: registro de vendas por produto com baixa automática de estoque, preço de venda
  configurável, cupom de venda e histórico de transações.
- **Dashboard e relatórios**: faturamento diário/mensal, produtos mais vendidos e movimentação de estoque.
- **Autenticação**: login com JWT e permissões por perfil (`admin`, `gerente`, `vendedor`).

## Stack

- **Backend**: Node.js, Express, Sequelize, PostgreSQL, JWT
- **Frontend**: React (Vite), React Router, Axios

## Estrutura do projeto

```
/backend   - API Node.js/Express + PostgreSQL
/frontend  - Aplicação React web
```

## Como rodar o backend

```bash
cd backend
cp .env.example .env   # ajuste as credenciais do PostgreSQL
npm install
npm run db:migrate     # cria as tabelas no banco
npm run db:seed        # cria um usuário admin e produtos de exemplo
npm run dev             # inicia a API em http://localhost:3001
```

Usuário criado pelo seed: `admin@bar.com` / senha `admin123`.

Para rodar os testes automatizados (usam SQLite em memória, não é necessário PostgreSQL):

```bash
cd backend
npm test
```

## Como rodar o frontend

```bash
cd frontend
cp .env.example .env   # ajuste a URL da API, se necessário
npm install
npm run dev             # inicia em http://localhost:5173
```

## Perfis de usuário

- **admin** e **gerente**: podem cadastrar/editar produtos e ajustar estoque.
- **vendedor**: pode registrar vendas e consultar dashboard/relatórios.

