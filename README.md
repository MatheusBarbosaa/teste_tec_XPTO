# XPTO Financial Management

Aplicação inicial em Next.js, TypeScript e App Router para servir como base do sistema XPTO Financial Management.

## Tecnologias

- Next.js
- TypeScript
- Tailwind CSS
- Prisma ORM
- MySQL
- Docker

## Estrutura inicial

A aplicação já inclui uma estrutura organizada com pastas para:

- src/app
- src/components
- src/lib
- src/services
- src/repositories
- src/types
- src/utils

## Como executar

1. Instale as dependências:
   ```bash
   npm install
   ```

2. Copie o arquivo de ambiente:
   ```bash
   cp .env.example .env
   ```

3. Inicie o banco com Docker:
   ```bash
   docker compose up -d
   ```

4. Gere o cliente Prisma:
   ```bash
   npx prisma generate
   ```

5. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

A aplicação ficará disponível em http://localhost:3000.

## Próximos passos

- Definir o modelo de dados completo.
- Criar os primeiros CRUDs para clientes e contas.
- Implementar rotas e serviços com Prisma.
