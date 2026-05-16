# PedeJá Mobile — Estado Actual do Projecto
> Atualizado em 2026-05-11

## 1. Resumo

O repositório `pedeja-mobile` é uma aplicação móvel Expo Router para o ecossistema PedeJá, focada nesta documentação apenas no frontend.

As menções ao backend neste documento servem como **referência para os hooks, chamadas de API e estados da interface**. Não pretendem desenhar o backend, apenas indicar o formato dos dados que o frontend espera consumir.

O produto está pensado em **duas camadas de experiência**:
- **Cliente**: navegação, ecrãs e fluxos para pedir comida, acompanhar pedidos, gerir carrinho e endereço.
- **Entregador**: navegação, ecrãs e fluxos diferentes para aceitar entregas, ver ganhos e acompanhar rotas.

Estas camadas devem ter **telas distintas** e **fluxos distintos**. O código actual implementa essa separação completa com navegação condicional baseada no perfil.

## 2. Stack Real

Dependências e escolhas que existem no repositório hoje:
- Expo `~54.0.33`
- React Native `0.81.5`
- Expo Router `~6.0.23`
- React `19.1.0`
- TypeScript `~5.9.2`
- Axios `^1.16.0`
- Redux Toolkit `^2.11.2`
- React Redux `^9.2.0`
- RTK Query via `@reduxjs/toolkit`
- `@expo/vector-icons`
- `@sentry/react-native`
- `expo-notifications` — notificações push locais
- `react-native-maps` — mapas nativos (iOS/Android)
- `expo-location` — geolocalização e permissões

Configuração real relevante:
- `app.json` usa `scheme: "pedejmobile"`
- Permissões de localização configuradas para iOS e Android
- Canal de notificações configurado para Android
- `tsconfig.json` tem aliases `@/*` e `src/*`

## 3. Navegação Actual

### Root

[app/_layout.tsx](app/_layout.tsx) define:
- Roteamento dinâmico baseado em autenticação (cliente/entregador)
- Inicialização de notificações push
- ThemeProvider com suporte a dark/light mode
- Listener de notificações recebidas

### Auth

O grupo `app/(auth)/` contém:
- [app/(auth)/login.tsx](app/(auth)/login.tsx) — Login com seleção de perfil
- [app/(auth)/register.tsx](app/(auth)/register.tsx) — Registro
- [app/(auth)/onboarding.tsx](app/(auth)/onboarding.tsx) — Onboarding 3 slides
- [app/(auth)/profile-select.tsx](app/(auth)/profile-select.tsx) — Seleção cliente/entregador
- [app/(auth)/order-success.tsx](app/(auth)/order-success.tsx) — Confirmação de pedido

### Tabs (Cliente)

`app/(tabs)/` define 3 tabs:
- Home
- Restaurantes
- Rastreamento

### Entregador

`app/(delivery)/` contém:
- Dashboard de entregas
- Detalhe de entrega
- Histórico com filtros
- Ganhos
- Perfil do entregador
- Chat

### Screens Standalone

- `app/carrinho.tsx` — Carrinho global
- `app/checkout.tsx` — Checkout com cupons
- `app/restaurante.tsx` — Detalhe do restaurante com reviews
- `app/endereco.tsx` — Gestão de endereços
- `app/perfil.tsx` — Perfil do cliente
- `app/pedidos.tsx` — Histórico de pedidos
- `app/search.tsx` — Pesquisa
- `app/payment-methods.tsx` — Métodos de pagamento
- `app/notifications.tsx` — Centro de notificações
- `app/chat.tsx` — Chat cliente-entregador
- `app/avaliacao.tsx` — Avaliação de pedido
- `app/promocoes.tsx` — Promoções e cupons

## 4. Fases Implementadas

### Fase 1 — Auth Foundation ✅
- [x] Onboarding com 3 slides
- [x] Seleção de perfil (Cliente/Entregador)
- [x] Login com role toggle e quick-fill demo
- [x] Registro
- [x] SplashScreen animado
- [x] ConfirmDialog reutilizável
- [x] Root layout com auth state hydration
- [x] Safe storage wrapper (AsyncStorage fallback)

### Fase 2 — Client Flows ✅
- [x] Order success screen com animações
- [x] Redux ordersSlice com mock data
- [x] Checkout integrado com orders
- [x] Order history (pedidos.tsx) com status badges
- [x] Favorites com AsyncStorage
- [x] Address management screen

### Fase 3 — Delivery Flows ✅
- [x] Delivery dashboard
- [x] Delivery detail com timeline
- [x] Delivery profile (perfil)
- [x] History com filtros (Today/Week/Month/All)
- [x] Earnings dashboard com charts
- [x] Logout para entregador

### Fase 4 — Theme System ✅
- [x] Theme reestruturado (lightColors/darkColors/getThemeColors)
- [x] useTheme hook com setTheme, useCallback, default light
- [x] Todas as páginas atualizadas para useTheme + useMemo styles
- [x] Header aceita onBackPress
- [x] Input aceita typed icons
- [x] Todos os índices de cor adicionados ao tema

### Fase 5 — Tracking & Orders ✅
- [x] Histórico de pedidos na tela de rastreamento
- [x] Seleção de múltiplos pedidos ativos (chips)
- [x] Mock data com 3 pedidos ativos simultâneos
- [x] Timeline dinâmica baseada no status real

### Fase 6 — Bug Fixes ✅
- [x] Fix: Redirecionamento automático após login
- [x] Fix: Erros TypeScript em carrinho/checkout
- [x] Fix: Styles faltando em payment-methods

### Fase 7 — Notificações Push ✅
- [x] Serviço de notificações (expo-notifications)
- [x] Redux notificationsSlice com mock data
- [x] NotificationBell no Header com badge
- [x] Tela de notificações
- [x] Integração no fluxo de pedidos (confirmado, entregador a caminho, entregue)
- [x] Fallback web para notificações

### Fase 8 — Geolocalização Real ✅
- [x] Permissões no app.json (iOS/Android)
- [x] Serviço de localização (expo-location)
- [x] Mapa real com react-native-maps
- [x] Localização em tempo real do usuário
- [x] Botão "Minha Localização"
- [x] Tracking ao vivo do entregador
- [x] Fallback web para mapa
- [x] Toggle de compartilhamento de localização no perfil do entregador

### Fase 9 — Chat ✅
- [x] Redux chatSlice com mensagens por pedido
- [x] Tela de chat para cliente
- [x] Tela de chat para entregador
- [x] Mensagens rápidas (quick replies)
- [x] Simulação de respostas
- [x] Integração em rastreamento e delivery detail
- [x] Badges de mensagens não lidas

### Fase 10 — Avaliações ✅
- [x] Redux ratingsSlice com mock reviews
- [x] Tela de avaliação de pedido (5 estrelas + comentário + tags)
- [x] Botão "Avaliar" nos pedidos entregues
- [x] Média de avaliações na tela do restaurante
- [x] Lista de reviews no restaurante
- [x] Cálculo de média dinâmica

### Fase 11 — Promoções ✅
- [x] Redux promotionsSlice com cupons e promoções
- [x] Cupons: PEDEJA20, ENTREGA0, PRIMEIRA50
- [x] Promoções: Combo Família, Quarta de Pizza, Entrega Grátis
- [x] Input de cupom no checkout com validação real
- [x] Cálculo de desconto (% e valor fixo)
- [x] Banner de promoções na Home
- [x] Tela de promoções ativas
- [x] Fallback web para notificações

## 5. Design System

O design system está em [src/theme/index.ts](src/theme/index.ts):
- `lightColors` e `darkColors`
- `getThemeColors(isDark)`
- `spacing`, `borderRadius`, `shadows`
- `formatPrice()`
- Paleta laranja/amarelo da marca

## 6. Componentes UI

[src/components/ui/](src/components/ui/):
- `Button.tsx` — primary/secondary/ghost, loading, disabled
- `RestaurantCard.tsx` — card de restaurante
- `ProductCard.tsx` — produtos normais e destacados
- `Header.tsx` — localização, carrinho, avatar, back, notificações
- `CategoryCard.tsx` / `CategoryIcon.tsx`
- `SplashScreen.tsx` — splash animado
- `ConfirmDialog.tsx` — modal de confirmação
- `NotificationBell.tsx` — sino com badge
- `ChatBadge.tsx` — chat com badge
- `TrackingMap.tsx` — mapa real (native) + fallback web
- `TrackingMap.web.tsx` — mapa simulado para web
- `Input.tsx` — input com ícone tipado
- `SearchBar.tsx` — barra de pesquisa

## 7. Store (Redux)

[src/store/index.ts](src/store/index.ts):
- `auth` — sessão demo
- `cart` — carrinho global
- `orders` — pedidos com mock data
- `notifications` — notificações
- `chat` — mensagens
- `ratings` — avaliações
- `promotions` — cupons e promoções
- `apiSlice` — RTK Query

## 8. Serviços

- `src/services/api.ts` — Axios com interceptors
- `src/services/sentry.ts` — Sentry com DSN placeholder
- `src/services/demoAuth.ts` — Auth demo com roles
- `src/services/favorites.ts` — Favoritos com AsyncStorage
- `src/services/notifications.ts` / `.web.ts` — Notificações push
- `src/services/location.ts` — Geolocalização e coordenadas

## 9. Hooks

- `src/hooks/useTheme.tsx` — tema com dark mode, persistência
- `src/hooks/useApi.ts` — hooks RTK Query

## 10. Telas do Entregador

- Dashboard com earnings preview
- Delivery detail com timeline
- Chat com cliente
- Perfil com toggle de localização
- Histórico com filtros
- Ganhos com períodos

## 11. Telas do Cliente

- Home com promoções, categorias, restaurantes
- Restaurantes com filtros
- Restaurante com menu, reviews, avaliações
- Carrinho global
- Checkout com cupons
- Rastreamento com mapa real
- Chat com entregador
- Pedidos com avaliação
- Perfil
- Endereços
- Notificações

## 12. Estrutura de Ficheiros Real

```text
pedeja-mobile/
├── app/
│   ├── _layout.tsx            ✅ root layout com auth, tema, notificações
│   ├── +html.tsx              ✅ existe
│   ├── +not-found.tsx         ✅ existe
│   ├── (auth)/
│   │   ├── _layout.tsx        ✅ existe
│   │   ├── login.tsx          ✅ existe
│   │   ├── register.tsx       ✅ existe
│   │   ├── onboarding.tsx     ✅ existe
│   │   ├── profile-select.tsx ✅ existe
│   │   └── order-success.tsx  ✅ existe
│   ├── (delivery)/
│   │   ├── _layout.tsx        ✅ existe
│   │   ├── index.tsx          ✅ dashboard
│   │   ├── delivery-detail.tsx✅ existe
│   │   ├── perfil.tsx         ✅ existe
│   │   ├── historico.tsx      ✅ existe
│   │   ├── ganhos.tsx         ✅ existe
│   │   └── chat.tsx           ✅ existe
│   ├── (tabs)/
│   │   ├── _layout.tsx        ✅ existe
│   │   ├── index.tsx          ✅ home com promoções
│   │   ├── restaurantes.tsx   ✅ existe
│   │   └── rastreamento.tsx   ✅ mapa real + chat
│   ├── carrinho.tsx           ✅ existe
│   ├── checkout.tsx           ✅ com cupons
│   ├── restaurante.tsx        ✅ com reviews
│   ├── endereco.tsx           ✅ existe
│   ├── perfil.tsx             ✅ existe
│   ├── pedidos.tsx            ✅ com avaliação
│   ├── search.tsx             ✅ existe
│   ├── payment-methods.tsx    ✅ existe
│   ├── notifications.tsx      ✅ existe
│   ├── chat.tsx               ✅ existe
│   ├── avaliacao.tsx          ✅ existe
│   └── promocoes.tsx          ✅ existe
├── src/
│   ├── components/ui/
│   │   ├── Button.tsx         ✅ existe
│   │   ├── RestaurantCard.tsx ✅ existe
│   │   ├── ProductCard.tsx    ✅ existe
│   │   ├── Header.tsx         ✅ existe
│   │   ├── CategoryCard.tsx   ✅ existe
│   │   ├── CategoryIcon.tsx   ✅ existe
│   │   ├── SplashScreen.tsx   ✅ existe
│   │   ├── ConfirmDialog.tsx  ✅ existe
│   │   ├── NotificationBell.tsx ✅ existe
│   │   ├── ChatBadge.tsx      ✅ existe
│   │   ├── TrackingMap.tsx    ✅ existe
│   │   ├── TrackingMap.web.tsx ✅ existe
│   │   ├── Input.tsx          ✅ existe
│   │   └── SearchBar.tsx      ✅ existe
│   ├── services/
│   │   ├── api.ts             ✅ existe
│   │   ├── sentry.ts          ✅ existe
│   │   ├── demoAuth.ts        ✅ existe
│   │   ├── favorites.ts       ✅ existe
│   │   ├── notifications.ts   ✅ existe
│   │   ├── notifications.web.ts ✅ existe
│   │   └── location.ts        ✅ existe
│   ├── store/
│   │   ├── index.ts           ✅ existe
│   │   ├── authSlice.ts       ✅ existe
│   │   ├── cartSlice.ts       ✅ existe
│   │   ├── ordersSlice.ts     ✅ existe
│   │   ├── notificationsSlice.ts ✅ existe
│   │   ├── chatSlice.ts       ✅ existe
│   │   ├── ratingsSlice.ts    ✅ existe
│   │   └── promotionsSlice.ts ✅ existe
│   ├── theme/
│   │   └── index.ts           ✅ existe
│   ├── hooks/
│   │   ├── useTheme.tsx       ✅ existe
│   │   └── useApi.ts          ✅ existe
│   └── types/
│       └── index.ts           ✅ existe
├── app.json                   ✅ existe
├── package.json               ✅ existe
└── tsconfig.json              ✅ existe
```

## 13. O Que Ainda Falta (Backlog Futuro)

### Infra e Qualidade
- [ ] Testes unitários e de integração
- [ ] Push notifications reais (OneSignal ou Firebase)
- [ ] Checkout integrado à API com TanStack Query (invalidação carrinho/pedidos, tratamento 4xx/5xx, timeout, idempotência no fluxo de criação de pedido)
- [ ] Refresh tokens JWT
- [ ] Offline support / caching
- [ ] Virtualizar listas grandes e auditar seletores Redux para cortar re-renders em home/cardápio/histórico
- [ ] Resiliência 10×: paginação server-driven, cache de imagens, limites no chat/mapas, observabilidade (métricas além do Sentry)
- [ ] Deep linking
- [ ] Analytics (Firebase/Amplitude)

### UX / Interface
- [ ] Ajustar modais/web: teclado + safe area + hitSlop em linhas de seleção e no fluxo de cupom

### Funcionalidades Futuras
- [ ] Sistema de cashback
- [ ] Programa de fidelidade
- [ ] Split de conta
- [ ] Agendamento de pedidos
- [ ] Assinaturas (ex: marmita semanal)
- [ ] Multi-restaurante no mesmo pedido
- [ ] Recomendações com ML
- [ ] Real-time updates via WebSocket
- [ ] Mapa com rota otimizada (Directions API)
- [ ] Reconhecimento de voz para pedidos

## 14. Notas Técnicas

### Web vs Native
O app suporta execução na web através do Expo Web, com fallbacks para:
- `TrackingMap.web.tsx` — mapa simulado (não usa react-native-maps)
- `notifications.web.ts` — stubs no-op (não usa expo-notifications)
- `expo-location` retorna coordenadas mock na web

### Tema
- Tema claro por padrão
- Persistência via AsyncStorage
- Todas as telas usam `useTheme()` + `useMemo(() => StyleSheet.create(...), [colors])`

### TypeScript
- `npx tsc --noEmit` passa sem erros
- Tipos strict habilitados
- Alias `@/*` e `src/*` configurados
