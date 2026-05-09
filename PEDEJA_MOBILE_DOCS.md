# PedeJá Mobile — Estado Actual do Projecto
> Atualizado em 2026-05-08

## 1. Resumo

O repositório `pedeja-mobile` é uma aplicação móvel Expo Router para o ecossistema PedeJá, focada nesta documentação apenas no frontend.

As menções ao backend neste documento servem como **referência para os hooks, chamadas de API e estados da interface**. Não pretendem desenhar o backend, apenas indicar o formato dos dados que o frontend espera consumir.

O produto está pensado em **duas camadas de experiência**:
- **Cliente**: navegação, ecrãs e fluxos para pedir comida, acompanhar pedidos, gerir carrinho e endereço.
- **Entregador**: navegação, ecrãs e fluxos diferentes para aceitar entregas, ver ganhos e acompanhar rotas.

Estas camadas devem ter **telas distintas** e **fluxos distintos**. O código actual ainda não implementa essa separação completa, mas o modelo do produto já é esse.

O estado actual do código é este:
- A navegação principal usa `app/(tabs)` com 3 tabs: `index`, `restaurantes` e `rastreamento`.
- Existem ecrãs standalone para `perfil`, `carrinho`, `restaurante` e `endereco`.
- O grupo `app/(auth)` tem apenas `login.tsx` e `_layout.tsx`.
- O grupo `app/(delivery)` já existe para o dashboard do entregador.
- O projecto já tem design system, componentes UI, camada de API, Redux e RTK Query ligados.
- Há login demo local com seleção de perfil `client` ou `delivery`.
- Os ecrãs principais do cliente e do entregador já estão ligados por navegação.

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

Nota:
- o histórico do projecto pode ainda conter referências a TanStack Query, mas a direcção documentada para os hooks do frontend é RTK Query.

Configuração real relevante:
- `app.json` usa `scheme: "pedejmobile"`
- `tsconfig.json` tem aliases `@/*` e `src/*`
- `app/_layout.tsx` carrega `SpaceMono` e `FontAwesome`

## 3. Navegação Actual

### Root

[app/_layout.tsx](/home/niltoncosta/Documentos/Projetos/Milvendas/Pede%20Já/pedeja-mobile/app/_layout.tsx) define:
- `initialRouteName: "(tabs)"`
- `Stack.Screen` para:
  - `(tabs)`
  - `restaurante`
  - `carrinho`
  - `perfil`
  - `endereco`
  - `delivery`
  - `(auth)`

O layout raiz também:
- usa `SafeAreaProvider`
- usa `ThemeProvider` do React Navigation
- controla `SplashScreen.preventAutoHideAsync()`
- esconde o splash quando as fontes terminam de carregar

### Auth

O grupo [app/(auth)/_layout.tsx](/home/niltoncosta/Documentos/Projetos/Milvendas/Pede%20Já/pedeja-mobile/app/(auth)/_layout.tsx) só declara o ecrã `login`.

Existe apenas:
- [app/(auth)/login.tsx](/home/niltoncosta/Documentos/Projetos/Milvendas/Pede%20Já/pedeja-mobile/app/(auth)/login.tsx)

### Tabs

[app/(tabs)/_layout.tsx](/home/niltoncosta/Documentos/Projetos/Milvendas/Pede%20Já/pedeja-mobile/app/(tabs)/_layout.tsx) define 3 tabs:
- Home
- Restaurantes
- Acompanhar

Ecrãs reais dentro deste grupo:
- [app/(tabs)/index.tsx](/home/niltoncosta/Documentos/Projetos/Milvendas/Pede%20Já/pedeja-mobile/app/(tabs)/index.tsx)
- [app/(tabs)/restaurantes.tsx](/home/niltoncosta/Documentos/Projetos/Milvendas/Pede%20Já/pedeja-mobile/app/(tabs)/restaurantes.tsx)
- [app/(tabs)/rastreamento.tsx](/home/niltoncosta/Documentos/Projetos/Milvendas/Pede%20Já/pedeja-mobile/app/(tabs)/rastreamento.tsx)

### Screens Standalone

Existem também:
- [app/perfil.tsx](/home/niltoncosta/Documentos/Projetos/Milvendas/Pede%20Já/pedeja-mobile/app/perfil.tsx)
- [app/carrinho.tsx](/home/niltoncosta/Documentos/Projetos/Milvendas/Pede%20Já/pedeja-mobile/app/carrinho.tsx)
- [app/restaurante.tsx](/home/niltoncosta/Documentos/Projetos/Milvendas/Pede%20Já/pedeja-mobile/app/restaurante.tsx)
- [app/endereco.tsx](/home/niltoncosta/Documentos/Projetos/Milvendas/Pede%20Já/pedeja-mobile/app/endereco.tsx)

E ficheiros auxiliares:
- [app/+html.tsx](/home/niltoncosta/Documentos/Projetos/Milvendas/Pede%20Já/pedeja-mobile/app/+html.tsx)
- [app/+not-found.tsx](/home/niltoncosta/Documentos/Projetos/Milvendas/Pede%20Já/pedeja-mobile/app/+not-found.tsx)
- [app/modal.tsx](/home/niltoncosta/Documentos/Projetos/Milvendas/Pede%20Já/pedeja-mobile/app/modal.tsx)

## 4. O Que Já Existe No Código

### 4.1 Design System

O design system actual está concentrado em [src/theme/index.ts](/home/niltoncosta/Documentos/Projetos/Milvendas/Pede%20Já/pedeja-mobile/src/theme/index.ts).

Ele fornece:
- `colors`
- `typography`
- `spacing`
- `borderRadius`
- `shadows`
- `formatPrice()`

Observações:
- A paleta usa laranja/amarelo da marca.
- A tipografia está definida como tokens, mas não há um sistema global de fonte Inter ligado no app.

### 4.2 Componentes UI

Os componentes UI existentes estão em [src/components/ui/](/home/niltoncosta/Documentos/Projetos/Milvendas/Pede%20Já/pedeja-mobile/src/components/ui).

Componentes reais:
- [Button.tsx](/home/niltoncosta/Documentos/Projetos/Milvendas/Pede%20Já/pedeja-mobile/src/components/ui/Button.tsx)
- [RestaurantCard.tsx](/home/niltoncosta/Documentos/Projetos/Milvendas/Pede%20Já/pedeja-mobile/src/components/ui/RestaurantCard.tsx)
- [ProductCard.tsx](/home/niltoncosta/Documentos/Projetos/Milvendas/Pede%20Já/pedeja-mobile/src/components/ui/ProductCard.tsx)
- [Header.tsx](/home/niltoncosta/Documentos/Projetos/Milvendas/Pede%20Já/pedeja-mobile/src/components/ui/Header.tsx)
- [CategoryCard.tsx](/home/niltoncosta/Documentos/Projetos/Milvendas/Pede%20Já/pedeja-mobile/src/components/ui/CategoryCard.tsx)
- [CategoryIcon.tsx](/home/niltoncosta/Documentos/Projetos/Milvendas/Pede%20Já/pedeja-mobile/src/components/ui/CategoryIcon.tsx)
- [index.ts](/home/niltoncosta/Documentos/Projetos/Milvendas/Pede%20Já/pedeja-mobile/src/components/ui/index.ts)

O que estes componentes fazem hoje:
- `Button`: variantes `primary`, `secondary` e `ghost`, com `loading`, `disabled` e tamanhos.
- `RestaurantCard`: card de restaurante com imagem, rating, entrega e favorito.
- `ProductCard`: versão normal e versão destacada para produtos.
- `Header`: localização, carrinho e avatar, com suporte a voltar.
- `CategoryCard` e `CategoryIcon`: cartões e ícones de categoria.

### 4.3 Serviços

O ficheiro [src/services/api.ts](/home/niltoncosta/Documentos/Projetos/Milvendas/Pede%20Já/pedeja-mobile/src/services/api.ts) contém:
- instância Axios com `timeout: 30000`
- interceptor de request que injeta `Bearer token` a partir do `AsyncStorage`
- interceptor de response que limpa `authToken` e `user` em `401`
- `authApi`
- `restaurantApi`
- `orderApi`
- `userApi`
- `deliveryApi`

O ficheiro [src/services/sentry.ts](/home/niltoncosta/Documentos/Projetos/Milvendas/Pede%20Já/pedeja-mobile/src/services/sentry.ts) existe e inicializa Sentry com um DSN placeholder.

### 4.4 Hooks

A abordagem prevista para o frontend é usar **RTK Query** dentro do ecossistema Redux Toolkit.

Estrutura esperada:
- `src/services/apiSlice.ts` ou equivalente, com `createApi`
- `baseQuery` com Axios ou `fetchBaseQuery`
- endpoints por domínio:
  - `auth`
  - `restaurants`
  - `orders`
  - `users`
  - `delivery`
- hooks gerados automaticamente pelo RTK Query, por exemplo:
  - `useLoginMutation`
  - `useGetRestaurantsQuery`
  - `useGetRestaurantByIdQuery`
  - `useGetRestaurantProductsQuery`
  - `useGetOrdersQuery`
  - `useCreateOrderMutation`
  - `useGetAddressesQuery`
  - `useAddAddressMutation`
  - `useUpdateProfileMutation`

Nesta fase, a base de RTK Query já está ligada ao store e os hooks estão exportados em [src/hooks/useApi.ts](/home/niltoncosta/Documentos/Projetos/Milvendas/Pede%20Já/pedeja-mobile/src/hooks/useApi.ts).
As telas do app ainda usam mocks locais em várias áreas, porque o backend não existe.

### 4.5 Store E Tipos

O store actual está em [src/store/index.ts](/home/niltoncosta/Documentos/Projetos/Milvendas/Pede%20Já/pedeja-mobile/src/store/index.ts).

Estado real:
- o `configureStore()` existe
- existe slice `auth` para a sessão demo
- existe slice `cart` com estado global do carrinho
- `apiSlice` está registado no store
- ainda não há slice real de `location`

Os tipos base estão em [src/types/index.ts](/home/niltoncosta/Documentos/Projetos/Milvendas/Pede%20Já/pedeja-mobile/src/types/index.ts):
- `User`
- `Address`
- `Restaurant`
- `Category`
- `Product`
- `CartItem`
- `Order`
- `AuthResponse`
- `ApiError`

## 5. Estrutura de Ficheiros Real

```text
pedeja-mobile/
├── app/
│   ├── _layout.tsx            ✅ existe
│   ├── +html.tsx              ✅ existe
│   ├── +not-found.tsx         ✅ existe
│   ├── modal.tsx              ✅ existe
│   ├── (auth)/
│   │   ├── _layout.tsx        ✅ existe
│   │   └── login.tsx          ✅ existe
│   ├── (delivery)/
│   │   ├── _layout.tsx        ✅ existe
│   │   ├── delivery.tsx       ✅ existe
│   │   └── index.tsx          ✅ existe
│   ├── (tabs)/
│   │   ├── _layout.tsx        ✅ existe
│   │   ├── index.tsx          ✅ existe
│   │   ├── restaurantes.tsx   ✅ existe
│   │   └── rastreamento.tsx   ✅ existe
│   ├── carrinho.tsx           ✅ existe
│   ├── endereco.tsx           ✅ existe
│   ├── perfil.tsx             ✅ existe
│   └── restaurante.tsx        ✅ existe
├── src/
│   ├── components/ui/
│   │   ├── Button.tsx         ✅ existe
│   │   ├── CategoryCard.tsx   ✅ existe
│   │   ├── CategoryIcon.tsx   ✅ existe
│   │   ├── Header.tsx         ✅ existe
│   │   ├── ProductCard.tsx    ✅ existe
│   │   ├── RestaurantCard.tsx ✅ existe
│   │   └── index.ts           ✅ existe
│   ├── hooks/
│   │   └── useApi.ts          ✅ existe
│   ├── services/
│   │   ├── api.ts             ✅ existe
│   │   └── sentry.ts          ✅ existe
│   ├── store/
│   │   ├── cartSlice.ts       ✅ existe
│   │   ├── authSlice.ts       ✅ existe
│   │   └── index.ts           ✅ existe
│   ├── theme/
│   │   └── index.ts           ✅ existe
│   └── types/
│       └── index.ts           ✅ existe
├── app.json                   ✅ existe
├── package.json               ✅ existe
└── tsconfig.json              ✅ existe
```

## 6. O Que Ainda Falta

Isto é backlog real, não implementação actual.

### Auth / Conta
- [x] login demo local com seleção de `client` ou `delivery`
- [x] redirecionamento por papel após autenticação
- [x] logout demo com limpeza de sessão local
- [x] `register.tsx`
- [ ] `profile-select.tsx`
- [ ] autenticação JWT ligada ao fluxo de UI
- [ ] logout real com limpeza de estado

### Cliente
- [x] Home / descoberta de restaurantes
- [x] pesquisa de restaurantes e pratos
- [x] perfil
- [x] gestão de endereços
- [x] carrinho base
- [x] detalhe do restaurante base
- [x] checkout base
- [x] tracking base na navegação principal
- [x] favoritos persistidos na Home e em Restaurantes
- [x] ecrã de pedidos/histórico dedicado
- [x] carrinho com estado global
- [x] ecrã de pesquisa dedicado
- [x] método de pagamento
- [x] checkout completo

### Restaurante / Carrinho
- [x] telas base de restaurante e carrinho existem
- [x] navegação entre Home, restaurantes, restaurante, carrinho e endereço
- [x] checkout base com confirmação
- [ ] dados reais vindos do backend
- [ ] detalhe do restaurante com menu dinâmico
- [x] carrinho com estado global
- [x] cálculo de totais e taxas
- [x] confirmação de pedido

### Tracking
- [x] tela de tracking existe na navegação principal
- [ ] tracking com dados reais do pedido
- [ ] polling ou realtime ligado ao backend
- [ ] mapa real de entrega com geolocalização
- [ ] serviço de mapas/localização para acompanhar a posição do entregador
- [ ] stack sugerida: `expo-location` para obter localização e permissões, `react-native-maps` para renderizar o mapa e marcadores, e backend para enviar a posição do entregador em tempo real ou quase em tempo real

### Entregador
- [x] grupo `app/(delivery)`
- [x] dashboard do entregador
- [x] lista de entregas disponíveis
- [x] ganhos do entregador

### Separação Por Perfil
- [x] o cliente não vê as telas do entregador
- [x] o entregador não vê as telas do cliente
- [x] a navegação inicial encaminha cada utilizador para o seu fluxo após autenticação/seleção de perfil
- [x] os componentes e estados podem ser partilhados, mas as rotas são distintas por papel

### Rotas Esperadas Por Perfil

#### Cliente
- [x] Home / descoberta de restaurantes
- [x] pesquisa de restaurantes e pratos
- [x] detalhe do restaurante
- [x] carrinho
- [ ] checkout
- [ ] acompanhamento de pedido com mapa e geolocalização
- [x] perfil
- [x] gestão de endereços
- [x] tracking do pedido com estado base e navegação

#### Entregador
- [x] dashboard de entregas
- [x] lista de entregas disponíveis
- [ ] detalhe de entrega
- [ ] mapa/rota
- [ ] ganhos
- [ ] histórico de entregas
- [ ] perfil do entregador
- [ ] mapa de rota com geolocalização, posição actual e navegação até ao destino

### Onde A Stack Entra

- **Cliente**: `expo-location` pode ser usado para obter permissões e localização actual do utilizador quando isso for necessário para checkout, endereço ou tracking. `react-native-maps` deve apresentar o mapa de acompanhamento do pedido com o marcador do entregador.
- **Entregador**: `expo-location` deve fornecer a posição actual do entregador. `react-native-maps` deve exibir a rota, o destino e os marcadores relevantes durante a entrega.
- Esta documentação assume que os dados necessários ao mapa já chegam às telas via API ou mocks, sem detalhar o backend.

### Infra e Qualidade
- [x] `Redux` com slice de auth/demo e store ligado
- [x] integração do `Provider` do Redux
- [x] integração de RTK Query
- [x] integração do `Sentry` no root
- [ ] testes
- [ ] push notifications
- [ ] integração de serviço de geolocalização/mapas para tracking de pedidos
- [ ] alternativa de mapa: Google Maps ou Mapbox, caso a equipa prefira um provedor externo em vez de apenas o mapa nativo

## 7. Nota Sobre O Documento Antigo

As versões anteriores deste ficheiro descreviam uma arquitectura-alvo mais avançada:
- `app/(client)` e `app/(delivery)`
- `register.tsx` e `profile-select.tsx`
- `Input.tsx`, `SearchBar.tsx` e `Badge.tsx`
- slices Redux completos
- integração de React Query no root
- separação explícita de rotas por perfil de utilizador

Isso não corresponde ao código actual. Este documento foi ajustado para reflectir o repositório real, não o plano desejado.
