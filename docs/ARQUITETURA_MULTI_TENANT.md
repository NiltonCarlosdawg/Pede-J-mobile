# Arquitectura Multi-tenant — PedeJá (PostgreSQL)

> Este documento define o contratos que o backend deve cumprir para que o mobile já corrigido funcione com isolamento real entre empresas. O mobile não pode garantir multi-tenancy sozinho; ele respeita o que o servidor autoriza.

## 1. Modelo recomendado para o teu caso

Vimos que pediste multi-tenant com PostgreSQL e três perfis. A proposta que já está refletida no mobile é:

```
Plataforma PedeJá
├── Utilizadores (identidade única por pessoa)
├── Empresas/Tenants
│   ├── Unidades/Restaurantes
│   ├── Cardápios e preços por tenant
│   └── Pedidos, finanças e operação isoladas
├── Vínculos utilizador ↔ empresa (memberships)
└── Participação em pedidos (cliente/entregador) com RLS por participação
```

- **Tenant = empresa.** Um restaurante isolado = 1 empresa com 1 unidade. Um grupo = 1 empresa com N unidades.
- **Cliente** compra em qualquer empresa publicada, mas vê apenas os seus pedidos.
- **Entregador** só vê entregas disponíveis ou atribuídas a si, independentemente do tenant.
- A mesma pessoa pode ter vínculos diferentes: cliente na plataforma e `restaurante` numa empresa. O login devolve `user.role` e os vínculos autorizados; o mobile navega apenas para áreas autorizadas.

Se o requisito for “operadores totalmente isolados” (cada tenant tem os seus próprios clientes e entregadores), muda-se o `tenant_id` para `users` também — decidir antes de migrar.

## 2. PostgreSQL — isolamento obrigatório

### Entidades que devem ter `tenant_id` (UUID)
`tenants`, `restaurants` (unidades), `products`, `categories`, `orders`, `order_items`, `payments`, `promotions`, `coupons`, etc.

### Tabelas de vínculo
```sql
memberships(id, user_id, tenant_id, role, status) -- role: owner | manager | staff
order_participants(order_id, user_id, role) -- cliente | entregador | restaurante
```

### Restrições e índices
- FKs com `tenant_id` incluso: `products(restaurant_id, tenant_id) -> restaurants(id, tenant_id)`
- Índices: `(tenant_id, status, created_at)`, `(tenant_id, restaurant_id)`, GIST para geolocalização com PostGIS.
- Unicidade de idempotência: `orders(idempotency_key, user_id)` e `payments(idempotency_key, order_id)`.

### Row-Level Security (segunda barreira além da API)
```sql
alter table orders enable row level security;
create policy tenant_isolation on orders
  using (tenant_id = current_setting('app.tenant_id')::uuid
     or exists (select 1 from order_participants p where p.order_id = orders.id and p.user_id = current_setting('app.user_id')::uuid));
```
A API define `app.user_id` e `app.tenant_id` a partir do JWT validado — nunca a partir de header enviado pelo mobile.

### O que o backend deve validar em cada request
- JWT assinado (algoritmo forte, expiração curta, `refreshToken` em httpOnly se for web).
- `tenant_id` pertence aos `memberships` activos do utilizador quando a rota é `/restaurant/*`.
- Transições de estado só pelos papéis permitidos e na ordem definida.
- Idempotência: reenvio com mesma `Idempotency-Key` devolve o mesmo resultado, não duplica cobrança.

## 3. Estados de negócio coerentes

O mobile agora espera que o servidor seja autoritativo em três ciclos separados:

| Ciclo | Estados validados no servidor |
|---|---|
| Pedido (cliente/restaurante) | `pending → confirmed → preparing → ready → delivering → delivered` + `cancelled` |
| Entrega (entregador) | `accepted → picked_up → in_transit → delivered` |
| Pagamento | `pending → processing → completed | failed | cancelled | refunded` |

Cada transição grava `timeline`/`audit` e publica evento via WebSocket para os participantes. O mobile não faz mais `local-*` como sucesso.

## 4. Localização, mapa e voz — contratos

- **Localização do entregador**: `POST /deliveries/:id/location` ou `location:update` via Socket.IO apenas quando `status` permite e o entregador está atribuído. Guardar `heading`, `accuracy` e `timestamp` com PostGIS. Rate-limit e validação de coordenadas.
- **Mapa**: `GET /orders/:id/route` devolve `origem`, `destino`, `route[]` (polyline real) e `lastKnown`. Cliente calcula ETA no servidor, não em linha recta.
- **Chat**: `GET/POST /orders/:id/messages` com paginação e `mark read`. Limite de 500 chars, moderação e `unread-count`.
- **Voz**: `/calls/config` + `/orders/:id/call/voip-token` devolvem token temporário do provedor (Twilio/Agora/LiveKit). CallKeep apenas mostra a chamada nativa; o áudio vem do SDK. O ecrã `app/call.tsx` só inicia o cronómetro após `connected` confirmado pelo SDK.

## 5. Segurança já aplicada no mobile

- Sessão em `expo-secure-store` (iOS Keychain / Android Keystore), não em `AsyncStorage` plaintext. Migração antiga é descartada e exige novo login.
- `role` derivado de `user.role` do servidor; o selector do login não decide o perfil.
- Rotas protegidas com `Stack.Protected` por `role`.
- `API_URL` via `EXPO_PUBLIC_API_URL` com validação HTTPS em produção; sem `localhost` em builds de loja.
- Axios com `sessionUserId` e `refresh` com single-flight e verificação de corrida; 401 com `refreshToken` ausente limpa a sessão.
- Checkout e pagamento com `Idempotency-Key` estável (`expo-crypto.randomUUID()`), carrinho preservado em erro, sem fallback “registar localmente” como sucesso.
- Pagamento sem simulação local; polling apenas com `payment.id` real.
- Tracking sem simular movimento para pedidos reais; `Rastreamento` mostra “Aguardando localização” com idade da última posição.
- `useDriverLocationPublisher` com permissão foreground + background, `expo-task-manager` e `validCoordinates`.
- `voip.ts` corrigido para tipagem de mute e `chat.tsx` com limite de 500 chars.
- Logout limpa `SecureStore`, `AsyncStorage`, Redux, React Query e Socket.IO em todos os perfis.

Falta no backend para fechar: RLS, testes de isolamento entre tenants, e integração do provedor de voz.

## 6. Próximos passos técnicos (backend)

1. Criar migrações com `tenant_id`, `memberships` e RLS + testes que provem que tenant A não lê B.
2. Implementar transições de estado com máquina de estados e auditoria.
3. Ligar Socket.IO a salas por `orderId` com autorização por participação.
4. Integrar provedor de voz e mapas (PostGIS + Directions).
5. Cobrar com idempotência e conciliação de pagamentos.
