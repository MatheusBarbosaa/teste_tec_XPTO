# XPTO Financial Management

Sistema de gestão financeira para gerenciamento de clientes, contas bancárias, movimentações financeiras e relatórios, com regra de cobrança integrada.

## Tecnologias

- **Next.js 16** — App Router, Server Actions, Server Components
- **TypeScript**
- **Tailwind CSS** — tema escuro com acento ciano
- **Prisma ORM** — MySQL
- **Docker** — ambiente MySQL local

## Estrutura do Projeto

```
src/
  app/
    page.tsx                                  # Home — listagem de clientes
    layout.tsx                                # Root layout
    globals.css                               # Estilos globais Tailwind
    clientes/
      [clientId]/
        page.tsx                              # Detalhes do cliente + contas
        editar/page.tsx                       # Editar cliente (client component)
        relatorio/page.tsx                    # Relatório individual do cliente
        contas/
          nova/page.tsx                        # Criar conta (server action)
          [accountId]/
            page.tsx                           # Detalhes da conta + movimentações + saldo
            editar/page.tsx                    # Editar conta (server action)
            desativar/page.tsx                 # Desativar conta (server action)
      novo/page.tsx                            # Criar cliente (client component)
    relatorios/page.tsx                        # Relatório geral de todos os clientes
    bank-simulator/page.tsx                    # Simulador de integração bancária
    api/
      clientes/route.ts                        # POST/GET /api/clientes
      clientes/[clientId]/route.ts             # GET/PUT /api/clientes/[id]
      integrations/
        bank-transactions/route.ts             # POST /api/integrations/bank-transactions
  components/                                  # Componentes reutilizáveis
  lib/
    prisma.ts                                  # Singleton Prisma Client
  services/
    client-service.ts                          # Regras de negócio de cliente (validação CPF/CNPJ)
    account-service.ts                         # Regras de negócio de conta
    balance-service.ts                         # Cálculo de saldo (Decimal)
    billing-service.ts                         # Cálculo de cobrança XPTO
    bank-integration-service.ts                # Processamento de transações bancárias
  repositories/
    client-repository.ts                       # Acesso a dados de cliente
    account-repository.ts                      # Acesso a dados de conta
    transaction-repository.ts                  # Acesso a dados de transação
  types/
    index.ts
  utils/
    validation.ts                              # Schemas Zod
```

## Modelo de Dados

### Client (`clients`)
| Campo | Tipo | Descrição |
|---|---|---|
| `id` | Int (PK) | |
| `name` | String | Nome (PF) / Nome fantasia (PJ) |
| `type` | Enum (PF / PJ) | |
| `cpf` | String? (unique) | Pessoa Física |
| `cnpj` | String? (unique) | Pessoa Jurídica |
| `legalName` | String? | Razão social (PJ) |
| `email` | String? | |
| `phone` | String? | |
| `addressStreet`, `addressNumber`, `addressComplement`, `addressCity`, `addressState`, `addressZip` | String? | Endereço |
| `birthDate` | DateTime? | PF |
| `gender` | String? | PF (M/F) |
| `foundedDate` | DateTime? | PJ |
| `initialBalance` | Decimal(12,2) | |
| `active` | Boolean | |

### Account (`accounts`)
| Campo | Tipo | Descrição |
|---|---|---|
| `id` | Int (PK) | |
| `clientId` | Int (FK) | |
| `bankCode` | String | |
| `bankName` | String | |
| `branch` | String | Agência |
| `accountNumber` | String | |
| `accountType` | String | |
| `initialBalance` | Decimal(12,2) | |
| `active` | Boolean | |
| Unique: `[bankCode, accountNumber]` | |

### Transaction (`transactions`)
| Campo | Tipo | Descrição |
|---|---|---|
| `id` | Int (PK) | |
| `accountId` | Int (FK) | |
| `type` | Enum (CREDIT / DEBIT) | |
| `amount` | Decimal(12,2) | |
| `description` | String | |
| `transactionDate` | DateTime | |

## Funcionalidades

### Clientes
- Cadastro de Pessoa Física (CPF) e Pessoa Jurídica (CNPJ) com validação de dígitos
- Edição e desativação de clientes
- Listagem com detalhes

### Contas Bancárias
- CRUD completo por cliente
- Prevenção de duplicidade (banco + número da conta)
- Ativação/desativação

### Movimentações Financeiras
- Simulador de integração bancária para processar créditos e débitos
- Cálculo de saldo por conta com `Decimal` do Prisma

### Regra de Cobrança (XPTO)
Cálculo centralizado em `src/services/billing-service.ts`:

| Faixa de movimentações | Preço por movimentação | Exemplo |
|---|---|---|
| Até 10 | R$ 1,00 | 5 mov. → 5 × 1,00 = R$ 5,00 |
| De 11 a 20 | R$ 0,75 | 15 mov. → 15 × 0,75 = R$ 11,25 |
| Mais de 20 | R$ 0,50 | 30 mov. → 30 × 0,50 = R$ 15,00 |

### Relatórios

**Relatório Geral** (`/relatorios`)
- Tabela com todos os clientes ativos
- Contas, movimentações, créditos, débitos, saldo e valor devido à XPTO

**Relatório Individual** (`/clientes/[id]/relatorio`)
- Detalhes de um cliente específico
- Cards com métricas financeiras e cobrança

Ambos os relatórios possuem **filtro por período** (`dataInicio` e `dataFim`) com validação de datas.

## Rotas da Aplicação

| Rota | Tipo | Descrição |
|---|---|---|
| `/` | Server | Home — listagem de clientes |
| `/clientes/novo` | Client | Criar cliente |
| `/clientes/[id]` | Server | Detalhes do cliente |
| `/clientes/[id]/editar` | Client | Editar cliente |
| `/clientes/[id]/relatorio` | Server | Relatório individual |
| `/clientes/[id]/contas/nova` | Server Action | Criar conta |
| `/clientes/[id]/contas/[accountId]` | Server | Detalhes da conta |
| `/clientes/[id]/contas/[accountId]/editar` | Server Action | Editar conta |
| `/clientes/[id]/contas/[accountId]/desativar` | Server Action | Desativar conta |
| `/relatorios` | Server | Relatório geral |
| `/bank-simulator` | Client | Simulador bancário |

## Como Executar

1. Instale as dependências:
   ```bash
   npm install
   ```

2. Copie o arquivo de ambiente:
   ```bash
   cp .env.example .env
   ```
   Configure a variável `DATABASE_URL` com sua conexão MySQL.

3. Inicie o banco com Docker:
   ```bash
   docker compose up -d
   ```

4. Execute as migrações e gere o cliente Prisma:
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

5. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

A aplicação ficará disponível em http://localhost:3000.
