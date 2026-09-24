# Situação Actual — Frontend PedeJá Mobile

> Documento de contexto para o backend. Actualizado em 2026-09-24 — sessão de hardening + remoção de mocks.

## 1. Resumo

O frontend (Expo Router + React Native) implementa **3 tipos de utilizador com navegação e fluxos completamente separados, agora com isolamento visual e de rotas**:

| Role (frontend) | Role (API) | Descrição | Rota |
|---|---|---|---|
| `client` | `cliente` | Utilizador que pede comida | `/(tabs)` — Home, Restaurantes, Rastreamento |
| `delivery` | `entregador` | Entregador que aceita e realiza entregas | `/(delivery)` — header `ENTREGADOR` amarelo, Dashboard, Detalhe, Histórico, Ganhos |
| `restaurant` | `restaurante` | Dono de restaurante que gere menu e pedidos | `/(restaurant)` — header preto `RESTAURANTE GESTÃO`, Dashboard, Pedidos, Cardápio, Perfil |

A autenticação é **server-authoritative**: `POST /auth/login` devolve `{user, token, refreshToken}` e o mobile deriva `DemoRole` via `roleFromUser(user.role)` (`cliente→client` etc.) — o selector do login é apenas UX/demo quick-fill, não decide acesso. Rotas protegidas com `Stack.Protected` + `router.replace` por role em `app/_layout.tsx:146`.

Sessão guardada em `expo-secure-store` (Keychain/Keystore) com `SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY`, nunca em `AsyncStorage` plain. `onSessionChange` limpa Redux + React Query + Socket.IO em logout/troca de conta.

---

## 2. Fluxo do Restaurante

### 2.1 Autenticação
O utilizador escolhe "Restaurante" no `profile-select` → regista com `role: "restaurante"` (`app/(auth)/register.tsx`) ou faz login com credenciais do seed.

**Credenciais demo (seed `prisma/seed.ts:114`):**
- Email: `restaurante@pedeja.com` / Senha: `123456` → `Sabor da Praça` (aprovado)
- Email: `demo-rest@pedeja.ao` / `segredo123` → `Brasa do Kilamba`

### 2.2 Navegação
Quando `role === "restaurant"`, `app/_layout.tsx` redireciona para `/(restaurant)/` com 4 tabs e header preto:

- **Dashboard** (`index.tsx`) — `GET /restaurant/stats` + `GET /restaurant/orders?limit=5` reais do Postgres (sem `.catch(()=>mock)`), toggle `PATCH /restaurant/toggle-open` real
- **Pedidos** (`pedidos.tsx`) — filtros por `status`, `PATCH /restaurant/orders/:id/status` com transições `pending→confirmed→preparing→ready`
- **Cardápio** (`cardapio.tsx`) — CRUD real via `/restaurant/products` + `Switch isAvailable` via `PATCH`
- **Perfil** (`perfil.tsx`) — carrega `GET /restaurants/me` real, edita `PATCH /restaurant/profile`, `PATCH /restaurant/opening-hours` (só activos), `PATCH /restaurant/toggle-open`

---

## 3. Endpoints que o Backend Precisa Implementar (já implementados e validados contra Postgres)

> Todos já existem em `src/restaurants/restaurant-manage.controller.ts:31` com `@Roles(restaurante)` e dados reais do Prisma. O mobile já não usa fallback mock.

### 3.1 Gestão de Pedidos do Restaurante

Base path: `/restaurant`

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/restaurant/orders` | Listar pedidos do restaurante autenticado |
| `GET` | `/restaurant/orders/:id` | Detalhe de um pedido |
| `PATCH` | `/restaurant/orders/:id/status` | Atualizar status do pedido |

**Query params para `GET /restaurant/orders`:**
- `status` (opcional): `pending`, `confirmed`, `preparing`, `ready`, `delivering`, `delivered`, `cancelled`
- `cursor` / `limit` (paginação cursor `?cursor=&limit=` → `{data, next_cursor}`)

**Body para `PATCH /restaurant/orders/:id/status`:**
```json
{ "status": "confirmed" }
```

**Fluxo válido no backend** (`restaurant-manage.service.ts:7`):
```
pending → confirmed → preparing → ready → (entregador assume) → delivering → delivered
```

**Resposta real validada (`curl -H "Authorization: Bearer $TOKEN" /restaurant/orders`):**
```json
{
  "data": [],
  "next_cursor": null
}
```
Quando há pedidos: `{id, clientName, clientPhone, items:[{id, name, quantity, price, notes}], status, total, deliveryFee, deliveryAddress, notes, createdAt, updatedAt}`

### 3.2 Gestão de Cardápio (Produtos)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/restaurant/products` | Listar produtos do restaurante autenticado |
| `POST` | `/restaurant/products` | Criar novo produto |
| `PATCH` | `/restaurant/products/:id` | Atualizar produto |
| `DELETE` | `/restaurant/products/:id` | Excluir produto |

Validado: `POST {"name":"Teste Produto Real","price":1999,...} → 201 {id, restaurantId, price:1999}` e `GET` lista 4 itens reais.

### 3.3 Categorias

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/restaurant/categories` | Listar categorias do restaurante |
| `POST` | `/restaurant/categories` | Criar categoria |
| `DELETE` | `/restaurant/categories/:id` | Excluir categoria |

Resposta real: `{data:[{id:"Bebidas", name:"Bebidas", productCount:1}, ...]}`

### 3.4 Estatísticas do Restaurante

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/restaurant/stats` | Estatísticas do restaurante autenticado |

Validado: `GET /restaurant/stats → {todayOrders:0, todayRevenue:0, weekOrders:0, ... averageRating:0}` (zero quando vazio, antes vinha mock `12/45000`)

### 3.5 Perfil do Restaurante

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `PATCH` | `/restaurant/profile` | Atualizar perfil do restaurante |
| `PATCH` | `/restaurant/opening-hours` | Atualizar horários de funcionamento |
| `PATCH` | `/restaurant/toggle-open` | Abrir/fechar restaurante |

Validado: `PATCH /restaurant/profile {"name":"Sabor da Praça Teste"} → {restaurant:{...}}`, `PATCH /restaurant/toggle-open {"isOpen":true} → {isOpen:true}`, `PATCH /restaurant/opening-hours {"hours":[{diaSemana:1, abre:"08:00", fecha:"22:00"}]} → {success:true}`

---

## 4. Tipo `Role` no Backend

O campo `role` no model `User` deve aceitar:
```
"cliente" | "entregador" | "restaurante" | "admin"
```

Frontend em `src/types/index.ts`:
```ts
export type Role = 'cliente' | 'entregador' | 'restaurante' | 'admin';
```
Derivação segura em `src/services/demoAuth.ts:16` `roleFromUser`.

---

## 5. Headers de Autenticação

Todas as chamadas enviam:
```
Authorization: Bearer <token>
Content-Type: application/json
```

Token obtido em `POST /auth/login` → `refreshToken` usado em `POST /auth/refresh {refreshToken}` (corrigido de `Authorization: Bearer` header). Interceptor com `sessionUserId` e single-flight `refreshPromise` (`src/services/api.ts:34`).

---

## 6. Paginação

Cursor: `?cursor=<id>&limit=<n>` → `{ data: [...], next_cursor: "..." | null }`

Backend corrige `take` com `Number(limit) + 1` (`src/restaurants/restaurants.service.ts:84`) para evitar `take: "201"` string (erro `Expected Int, provided String`).

Frontend `providesTags` defensivo com `Array.isArray(result?.data)` (`src/services/apiSlice.ts:175`).

---

## 7. Formato de Preços

Todos os preços em **Kz (Kwanza)**, inteiros via `Number(Decimal)` no serviço (`restaurant-manage.service.ts:60`).

---

## 8. Status dos Pedidos

### Restaurante
```
pending → confirmed → preparing → ready → delivering → delivered
```
Só `confirmed|preparing|ready` são aceites em `RestaurantOrderStatusDto` (`dto/restaurants.dto.ts:277`).

### Entregador
```
pending → accepted → picked_up → in_transit → delivered
```

### Cliente
```
pending → confirmed → preparing → delivering → delivered
```

Transições validadas e com `timeline` (`restaurant-manage.service.ts:121`).

---

## 9. Estrutura de Ficheiros Criados/Modificados (2026-09-24)

```
app/(restaurant)/
├── _layout.tsx        ← header preto RESTAURANTE + 4 tabs
├── index.tsx          ← dashboard sem mock, toggle via API
├── pedidos.tsx        ← filtros + PATCH status real
├── cardapio.tsx       ← CRUD real (sem mock)
└── perfil.tsx         ← load GET /restaurants/me real, horários filtrados

app/(delivery)/
├── _layout.tsx        ← header amarelo ENTREGADOR + Stack
├── delivery-detail.tsx← dados reais via deliveryApi.getDelivery + toggle status via PATCH
└── (outros já com ligação real)

app/(tabs)/
├── _layout.tsx        ← tabBar com cor cliente
├── rastreamento.tsx   ← sem MOCK_COORDINATES, só OrderRoute.origem/destino + lastKnown real, mapa placeholder quando sem rota
├── index.tsx          ← lista via restaurantApi.list real

app/(auth)/
├── login.tsx          ← quick-fill demo por role, aviso que perfil vem da conta, POST /auth/login
├── register.tsx       ← selector cliente/entregador/restaurante, fluxo OTP request/verify/dev-code
└── profile-select.tsx ← encaminha cliente→register, outros→login

app/
├── _layout.tsx        ← SecureStore, Stack.Protected + redirect por role, VOIP/notifications só após auth
├── checkout.tsx       ← sem FALLBACK_ADDRESSES, exige GET /users/me/addresses real, Idempotency-Key via expo-crypto.randomUUID()
├── endereco.tsx       ← modal POST /users/me/addresses real com lat/lng + "Usar minha localização" (expo-location), sem aria-hidden focus bug
├── payment-flow.tsx   ← sem simulatePaymentProcessing para local-*, polling só com payment.id real, PIN/phone validados
├── call.tsx           ← cronómetro só após connected (backend/SDK deve confirmar)
└── chat.tsx           ← limite 500 chars

src/services/
├── api.ts             ← BASE_URL validado (HTTPS em prod), publicAuth, refresh via {refreshToken}
├── apiSlice.ts        ← baseQuery via axios http.request, providesTags defensivo Array.isArray
├── config.ts          ← validateApiUrl + EXPO_PUBLIC_API_URL
├── demoAuth.ts        ← SecureStore, roleFromUser, validateSession
├── realtime.ts        ← Socket.IO com onSessionChange, validCoordinates, volatile emit
└── voip.ts            ← mute tipado, call audio

src/store/
├── index.ts           ← clearSession reseta estado + onSessionChange limpa Query/Socket
└── restaurantOrdersSlice.ts

src/hooks/
└── useDriverLocationPublisher.ts ← TaskManager BACKGROUND_TASK + requestBackgroundPermissionsAsync + validCoordinates

docs/
├── ARQUITETURA_MULTI_TENANT.md ← modelo tenant=empresa, RLS, PostgreSQL + PostGIS
└── LAYOUT_SISTEMA.md          ← tokens, navegação por perfil, componentes

Backend corrigido nesta sessão:
├── src/restaurants/restaurants.service.ts ← Number(limit) para evitar take string
└── .env.example ← CORS_ORIGINS += 192.168.0.109:8081 (Expo Go LAN)
```

---

## 10. Notas Importantes

1. **Sem mock em produção** — todos os `catch(()=>mock)` removidos. Dashboard, pedidos, cardápio, perfil, checkout/endereco, rastreamento agora mostram `empty/error` reais do Postgres. Para testar, usar contas seed e criar dados via API (ex. `POST /restaurant/products` validado).

2. **Idempotência** — `Idempotency-Key` estável via `expo-crypto.randomUUID()` por tentativa (`checkout.tsx:443` e `payment-flow.tsx:249` com `paymentIdempotencyKeyRef`), não `Date.now()-Math.random()` por retry.

3. **Timeout** — `orderApi.create` 45s, outros 30s (`src/services/api.ts:7`).

4. **Logout** — `POST /auth/logout` + `clearDemoSession()` + `clearCart()` + `clearSession()` + `disconnectRealtime()` em todos os perfis.

5. **Product** — backend devolve `restaurantId, hidden, createdAt, updatedAt` como Number/string corretos.

---

## 11. Correções da sessão 2026-09-24

- **Segurança:** SecureStore, `roleFromUser`, `Stack.Protected`, `sessionUserId` no Axios, `refresh` com body `{refreshToken}`, `validateApiUrl` HTTPS, Sentry `sendDefaultPii:false`.
- **Pedidos/Pagamentos:** server-authoritative, carrinho preservado em erro, sem `local-*` como sucesso, `confirmar pedido` só com `remoteId`, pagamento sem simulação.
- **Entregas:** `delivery-detail` com `deliveryApi.getDelivery/updateStatus` real, `rastreamento` sem `MOCK_COORDINATES`, distância/ETA só com `driverLocation` real, `useDriverLocationPublisher` com background task.
- **Restaurante:** CRUD real, stats sem mock, perfil com `GET /restaurants/me`, horários filtrados.
- **Endereços:** modal `POST /users/me/addresses` com `expo-location`, `GET` lida com array paginado ou não (`apiSlice` defensivo), fix `aria-hidden` warning via `Modal` + `autoFocus`.
- **Backend:** fix `take: "201"` string → `Number(limit)`, CORS LAN, seed validado (`restaurante@pedeja.com` 123456).
- **Qualidade:** `tsc --noEmit` 0 erros, `jest` 48/48, `docs/` adicionados, `app.json` com `expo-location` + `secure-store`.
