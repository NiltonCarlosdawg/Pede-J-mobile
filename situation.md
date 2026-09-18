# Situação Actual — Frontend PedeJá Mobile

> Documento de contexto para o backend. Actualizado em 2026-09-09.

## 1. Resumo

O frontend (Expo Router + React Native) implementa **3 tipos de utilizador** com navegação e fluxos completamente separados:

| Role (frontend) | Role (API) | Descrição |
|---|---|---|
| `client` | `cliente` | Utilizador que pede comida |
| `delivery` | `entregador` | Entregador que aceita e realiza entregas |
| `restaurant` | `restaurante` | Dono de restaurante que gere menu e pedidos |

A autenticação é feita com `DemoRole = "client" | "delivery" | "restaurant"`. O backend deve aceitar o campo `role` no registo/login e retornar o `user.role` correspondente.

---

## 2. Fluxo do Restaurante (NOVO — Implementado agora)

### 2.1 Autenticação

O utilizador seleciona "Restaurante" no login/profile-select. O frontend envia o login normalmente — o backend deve retornar o `user` com `role: "restaurante"`.

**Dados demo do restaurante:**
```json
{
  "id": "demo-restaurant",
  "name": "Sabor da Praça",
  "email": "restaurante@pedeja.com",
  "phone": "+244 923 789 012",
  "role": "restaurante",
  "avatar": "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=200"
}
```

**Credenciais demo:**
- Email: `restaurante@pedeja.com`
- Senha: `123456`

### 2.2 Navegação

Quando `role === "restaurant"`, o frontend navega para `/(restaurant)/` que tem 4 tabs:
- **Dashboard** (`index.tsx`)
- **Pedidos** (`pedidos.tsx`)
- **Cardápio** (`cardapio.tsx`)
- **Perfil** (`perfil.tsx`)

---

## 3. Endpoints que o Backend Precisa Implementar

### 3.1 Gestão de Pedidos do Restaurante

Base path: `/restaurant`

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/restaurant/orders` | Listar pedidos do restaurante autenticado |
| `GET` | `/restaurant/orders/:id` | Detalhe de um pedido |
| `PATCH` | `/restaurant/orders/:id/status` | Atualizar status do pedido |

**Query params para `GET /restaurant/orders`:**
- `status` (opcional): Filtrar por estado (`pending`, `confirmed`, `preparing`, `ready`, `delivering`, `delivered`, `cancelled`)
- `cursor` (opcional): Cursor para paginação
- `limit` (opcional): Limite de resultados (default: 20)

**Body para `PATCH /restaurant/orders/:id/status`:**
```json
{ "status": "confirmed" }
```

**Fluxo de status do pedido no restaurante:**
```
pending → confirmed → preparing → ready → (entregador assume) → delivering → delivered
```

O restaurante controla: `pending → confirmed → preparing → ready`. A partir de `ready`, o entregador assume.

**Resposta de `GET /restaurant/orders` (mock que o frontend espera):**
```json
{
  "data": [
    {
      "id": "ord-001",
      "clientName": "Alexandre João",
      "clientPhone": "+244 923 123 456",
      "items": [
        {
          "id": "1",
          "name": "Burger Clássico",
          "quantity": 2,
          "price": 2500,
          "notes": "Sem cebola"
        }
      ],
      "status": "pending",
      "total": 6200,
      "deliveryFee": 500,
      "deliveryAddress": "Rua da Mutamba, 45",
      "notes": "Portão azul",
      "createdAt": "2026-09-09T10:00:00.000Z",
      "updatedAt": "2026-09-09T10:00:00.000Z"
    }
  ],
  "next_cursor": null
}
```

### 3.2 Gestão de Cardápio (Produtos)

Base path: `/restaurant`

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/restaurant/products` | Listar produtos do restaurante autenticado |
| `POST` | `/restaurant/products` | Criar novo produto |
| `PATCH` | `/restaurant/products/:id` | Atualizar produto |
| `DELETE` | `/restaurant/products/:id` | Excluir produto |

**Body para `POST /restaurant/products`:**
```json
{
  "name": "Burger Clássico",
  "description": "Hambúrguer com queijo e bacon",
  "price": 2500,
  "image": "https://exemplo.com/burger.jpg",
  "category": "Hambúrguer",
  "isAvailable": true,
  "isFeatured": false
}
```

**Body para `PATCH /restaurant/products/:id`:**
Todos os campos são opcionais (só envia os que quer atualizar):
```json
{
  "name": "Burger Especial",
  "price": 3000,
  "isAvailable": false
}
```

**Resposta de `GET /restaurant/products`:**
```json
{
  "data": [
    {
      "id": "prod-001",
      "restaurantId": "demo-restaurant",
      "name": "Burger Clássico",
      "description": "Hambúrguer com queijo e bacon",
      "price": 2500,
      "image": "https://exemplo.com/burger.jpg",
      "category": "Hambúrguer",
      "isAvailable": true,
      "isFeatured": false,
      "createdAt": "2026-05-08T00:00:00.000Z",
      "updatedAt": "2026-05-08T00:00:00.000Z"
    }
  ],
  "next_cursor": null
}
```

**Resposta de `POST /restaurant/products`:**
Retorna o produto criado (objeto único, não array):
```json
{
  "id": "prod-002",
  "restaurantId": "demo-restaurant",
  "name": "Pizza Margherita",
  "description": "Pizza clássica",
  "price": 3500,
  "image": "https://exemplo.com/pizza.jpg",
  "category": "Pizza",
  "isAvailable": true,
  "isFeatured": true,
  "createdAt": "2026-09-09T00:00:00.000Z",
  "updatedAt": "2026-09-09T00:00:00.000Z"
}
```

### 3.3 Categorias

Base path: `/restaurant`

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/restaurant/categories` | Listar categorias do restaurante |
| `POST` | `/restaurant/categories` | Criar categoria |
| `DELETE` | `/restaurant/categories/:id` | Excluir categoria |

**Body para `POST /restaurant/categories`:**
```json
{ "name": "Hambúrguer" }
```

### 3.4 Estatísticas do Restaurante

Base path: `/restaurant`

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/restaurant/stats` | Estatísticas do restaurante autenticado |

**Query params:**
- `periodo` (opcional): `hoje`, `semana`, `mes`, `ano`

**Resposta:**
```json
{
  "todayOrders": 12,
  "todayRevenue": 45000,
  "weekOrders": 78,
  "weekRevenue": 312000,
  "monthOrders": 312,
  "monthRevenue": 1248000,
  "averageRating": 4.7,
  "totalRatings": 89
}
```

### 3.5 Perfil do Restaurante

Base path: `/restaurant`

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `PATCH` | `/restaurant/profile` | Atualizar perfil do restaurante |
| `PATCH` | `/restaurant/opening-hours` | Atualizar horários de funcionamento |
| `PATCH` | `/restaurant/toggle-open` | Abrir/fechar restaurante |

**Body para `PATCH /restaurant/profile`:**
```json
{
  "name": "Sabor da Praça",
  "description": "Comida angolana e internacional",
  "phone": "+244 923 789 012",
  "image": "https://exemplo.com/restaurante.jpg",
  "logo": "https://exemplo.com/logo.jpg",
  "deliveryFee": 500,
  "deliveryTime": "30-45 min"
}
```

**Body para `PATCH /restaurant/opening-hours`:**
```json
{
  "hours": [
    { "diaSemana": 1, "abre": "08:00", "fecha": "22:00" },
    { "diaSemana": 2, "abre": "08:00", "fecha": "22:00" },
    { "diaSemana": 3, "abre": "08:00", "fecha": "22:00" },
    { "diaSemana": 4, "abre": "08:00", "fecha": "22:00" },
    { "diaSemana": 5, "abre": "08:00", "fecha": "23:00" },
    { "diaSemana": 6, "abre": "09:00", "fecha": "23:00" },
    { "diaSemana": 0, "abre": "09:00", "fecha": "21:00" }
  ]
}
```

**Body para `PATCH /restaurant/toggle-open`:**
```json
{ "isOpen": true }
```

---

## 4. Tipo `Role` no Backend

O campo `role` no model `User` deve aceitar:
```
"cliente" | "entregador" | "restaurante" | "admin"
```

O frontend já define isso em `src/types/index.ts`:
```ts
export type Role = 'cliente' | 'entregador' | 'restaurante' | 'admin';
```

---

## 5. Headers de Autenticação

Todas as chamadas enviam:
```
Authorization: Bearer <token>
Content-Type: application/json
```

O token é obtido na resposta de `POST /auth/login`.

---

## 6. Paginação

Endpoints de listagem usam paginação com cursor:
- Query param: `?cursor=<string>&limit=<number>`
- Resposta: `{ data: [...], next_cursor: "..." | null }`

---

## 7. Formato de Preços

Todos os preços são em **Kz (Kwanza)**, valores inteiros.
- `price: 2500` = Kz 2.500
- `deliveryFee: 500` = Kz 500

---

## 8. Status dos Pedidos

### Modelo do restaurante (RESTAURANT)
```
pending → confirmed → preparing → ready → delivering → delivered
                                                         ↗
                                      cancelled ←───────┘
```

### Modelo do entregador (DELIVERY)
```
pending → accepted → picked_up → in_transit → delivered
```

### Modelo do cliente (CLIENT)
```
pending → confirmed → preparing → delivering → delivered
```

O backend deve suportar os 3 fluxos. O status muda conforme quem atualiza.

---

## 9. Estrutura de Ficheiros Criados/Modificados

```
app/(restaurant)/
├── _layout.tsx        ← Layout com 4 tabs
├── index.tsx          ← Dashboard (stats + pedidos recentes)
├── pedidos.tsx        ← Gestão de pedidos (filtros + ações)
├── cardapio.tsx       ← Gestão de menu (CRUD de produtos)
└── perfil.tsx         ← Perfil do restaurante

src/services/
├── api.ts             ← Adicionado restaurantManageApi (13 endpoints)
└── demoAuth.ts        ← Expandido DemoRole + dados demo restaurante

src/store/
├── index.ts           ← Adicionado restaurantOrdersReducer
└── restaurantOrdersSlice.ts  ← Novo slice Redux

src/types/index.ts     ← Role já incluía "restaurante" (não alterado)

app/_layout.tsx        ← Roteamento para (restaurant)
app/(auth)/login.tsx   ← Botão "Restaurante" no seletor
app/(auth)/profile-select.tsx  ← Card "Tenho um restaurante"
```

---

## 10. Notas Importantes

1. **O frontend usa mock data como fallback** — se a API retornar erro, o frontend mostra dados simulados. Para testar o fluxo real, a API deve estar a funcionar.

2. **Idempotência** — Endpoints de criação de pedido usam header `Idempotency-Key` para evitar duplicatas.

3. **Timeout** — Endpoints de criação de pedido usam timeout de 45s. Outros usam 30s.

4. **Logout** — O frontend chama `POST /auth/logout` e limpa a sessão local.

5. **O tipo `Product` no frontend** tem campos `restaurantId`, `hidden`, `createdAt`, `updatedAt` — o backend deve retornar esses campos.
