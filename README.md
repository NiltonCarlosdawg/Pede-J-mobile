# PedeJá — App Mobile

Aplicação **mobile-first** do [PedeJá](https://github.com/MilvendasAO/backend-pedeja): pedidos de comida e entregas em Angola, com três perfis (cliente, entregador e restaurante) e chamadas de voz cliente ↔ entregador.

App **Expo (SDK 57) + React Native 0.86 + expo-router**, escrita em TypeScript. Comunica com a API PedeJá por REST (`/v1`), WebSocket (Socket.IO) e WebRTC (LiveKit).

---

## Stack

| Camada | Tecnologia |
| --- | --- |
| Framework | Expo SDK 57 · React Native 0.86 · React 19.2 |
| Navegação | `expo-router` (file-based, `typedRoutes`, grupos de rotas) |
| Estado | Redux Toolkit + RTK Query (camada de fetching) |
| UI | React Native Paper (MD3) + tema próprio em `src/theme` · Lottie |
| Rede | `axios` (REST) · `socket.io-client` (realtime) |
| Voz | `@livekit/react-native` · `react-native-callkeep` (CallKit/ConnectionService) · PushKit |
| Mapas | `react-native-maps` + `expo-location` (incl. tarefa de background) |
| Notificações | `expo-notifications` (push Expo) + `expo-device`/APNs via VoIP push |
| Armazenamento seguro | `expo-secure-store` (Keychain / Keystore) |
| Observabilidade | `@sentry/react-native` (`sendDefaultPii: false`) |
| Testes | Jest (`jest-expo`) + `@testing-library/react-native` |
| Qualidade | ESLint (`eslint-config-expo`) + Prettier |

---

## Requisitos

- Node.js 22 (o CI usa Node 22; `npm ci` exige lockfile gerado com npm 10)
- npm 10+
- Para build nativo: Xcode 16+ (iOS) ou Android Studio + JDK 17 (Android)
- Conta Expo/EAS para builds na cloud

---

## Setup

```bash
npm install
cp .env.example .env      # definir EXPO_PUBLIC_API_URL
npm start                 # Expo Go / dev server
```

Depois:

```bash
npm run ios               # build nativo iOS (expo run:ios)
npm run android           # build nativo Android (expo run:android)
npm run web               # web (react-native-web)
```

O backend tem de estar a correr — ver o [README do backend](../backend-pedeja/README.md).

---

## Variáveis de ambiente

Todas as variáveis são **públicas** (`EXPO_PUBLIC_*`) e ficam embutidas no bundle. **Nunca** colocar aqui segredos de pagamentos ou LiveKit — o app só recebe tokens de curta duração do servidor.

| Variável | Descrição |
| --- | --- |
| `EXPO_PUBLIC_API_URL` | Base da API, com `/v1` (ex.: `http://192.168.1.10:3000/v1`) |
| `EXPO_PUBLIC_SENTRY_DSN` | DSN do Sentry (vazio desliga o reporting) |

Regras aplicadas em `src/services/config.ts` (`validateApiUrl`):

- **Produção exige HTTPS.** `http://` só é aceite em `__DEV__`; sem `EXPO_PUBLIC_API_URL` em produção a app falha ao arrancar (em dev usa `http://localhost:3000/v1`).
- A URL não pode conter credenciais (`user:pass@`), query string ou fragmento.
- Barras finais são normalizadas.

No dispositivo físico usa-se o **IP da LAN** (`http://192.168.x.x:3000/v1`), nunca `localhost` — e o `CORS_ORIGINS` do backend tem de incluir `exp://192.168.x.x:8081`.

---

## Estrutura

```
app/                       # rotas (expo-router)
├── _layout.tsx            # Stack.Protected por role, SecureStore, notificações/VoIP
├── (auth)/                # onboarding · login · registo · order-success
├── (tabs)/                # cliente: Home · Restaurantes · Acompanhar · Pedidos · Perfil
├── (delivery)/            # entregador: dashboard · detalhe · histórico · ganhos · perfil · chat
├── (restaurant)/          # painel de restaurante (app separada — ver nota abaixo)
└── *.tsx                  # modais e ecrãs partilhados: carrinho, checkout, chat, chamada…

src/
├── components/ui/         # Button, Input, ProductCard, RestaurantCard, TrackingMap…
├── features/              # delivery-profile/ e tracking/ (componentes + hooks por domínio)
├── hooks/                 # useApi, useTheme, useDriverLocationPublisher, …
├── services/              # api, apiSlice (RTK Query), session, realtime, voip, notifications…
├── store/                 # slices Redux: auth, cart, orders, chat, favorites…
├── theme/                 # tokens MD3, cores, espaçamento, tipografia
├── types/                 # tipos de domínio partilhados com a API
└── utils/                 # storage, sounds, shadow

plugins/withVoipNative.js  # config plugin nativo (CallKit/PushKit/WebRTC)
docs/                      # arquitectura, layout e notas de iOS/VoIP
```

### Navegação por perfil

`app/_layout.tsx` monta o `Stack` com `<Stack.Protected guard={...}>` por role e redirecciona via `router.replace`:

| `SessionRole` | `user.role` (API) | Destino |
| --- | --- | --- |
| `client` | `cliente` | `/(tabs)` |
| `delivery` | `entregador` | `/(delivery)` |
| — | `restaurante` | rejeitado em `roleFromUser` ("aplicação separada") |

`app/(restaurant)/` mantém-se no repositório como referência do painel de restaurante, mas está **inalcançável** nesta app.

---

## Autenticação e sessão

- **Server-authoritative.** `POST /auth/register` e `POST /auth/login` devolvem `{ user, token, refreshToken }` — o registo é directo, **sem OTP**.
- Sessão persistida em `expo-secure-store` com `WHEN_UNLOCKED_THIS_DEVICE_ONLY`; nunca em `AsyncStorage` em claro.
- `src/services/session.ts` valida a sessão (`validateSession`) e deriva o role (`roleFromUser`).
- `src/services/api.ts` injecta `Authorization: Bearer` em todas as chamadas excepto `isPublicAuthUrl` (`/auth/login|register|refresh`); refresca o token em *single-flight* via `POST /auth/refresh { refreshToken }`.
- `onSessionChange` limpa Redux + RTK Query + Socket.IO em logout ou troca de conta.
- O registo público cria apenas contas `cliente`.

---

## Voz, notificações e localização

- **Chamadas 1-1** cliente ↔ entregador sobre LiveKit (`src/services/voip.ts`): CallKit no iOS, `ConnectionService` no Android, PushKit para chamada recebida em background, áudio CallKit↔RTCAudioSessionisolado por chamada.
- **Realtime** via Socket.IO (`src/services/realtime.ts`): estado do pedido, chat, localização do entregador (`validCoordinates` valida lat/lng antes de emitir).
- **Localização**: `expo-location` com `isIosBackgroundLocationEnabled` / `isAndroidBackgroundLocationEnabled` e `useDriverLocationPublisher` sobre `expo-task-manager` (`BACKGROUND_TASK`).
- As notas de resolução dos pontos de iOS/ATS/LiveKit estão em [`docs/IOS_LIVEKIT_VOIP.md`](docs/IOS_LIVEKIT_VOIP.md).

---

## Scripts

| Comando | Acção |
| --- | --- |
| `npm start` | dev server Expo |
| `npm run ios` / `npm run android` / `npm run web` | correr a app |
| `npm test` | testes (Jest) |
| `npm run test:watch` / `test:changed` | testes interactivos / só alterados |
| `npm run test:coverage` | testes + cobertura (thresholds por módulo) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` / `lint:fix` | ESLint |
| `npm run format` / `format:check` | Prettier |
| `npm run dev:build:android` / `dev:build:ios` | build EAS de desenvolvimento (development client) |
| `npm run dev:build:android:sim` / `dev:build:ios:sim` | build EAS para simulador/emulador |
| `npm run dev:prebuild` + `dev:run:*` | gerar e correr o projecto nativo sem cloud |
| `npm run eas:login` / `eas:init` | autenticação EAS |

> `npm install` pode pedir `--legacy-peer-deps` (as config-plugins de VoIP/WebRTC
> ainda não publicam os peer deps para o RN 0.86) — é o mesmo modo usado pelo
> `run_tests.sh`.

`./run_tests.sh` é um atalho que instala dependências em falta e corre a bateria completa de testes.

### Builds EAS

Perfis em [`eas.json`](eas.json): `development` (APK interno), `development-simulator` (iOS simulator), `preview` (APK interno) e `production` (stores). Detalhes em [`DEVELOPMENT_BUILDS.md`](DEVELOPMENT_BUILDS.md) e [`DEV_BUILD_CONFIG.md`](DEV_BUILD_CONFIG.md).

---

## Testes e qualidade

O CI (`.github/workflows/ci.yml`, em cada push/PR para `main`) corre:

```
npm ci → typecheck → lint → format:check → test:coverage --ci
```

Os thresholds de cobertura vivem em `jest.config.js`: piso global (`statements`/`lines` 0.75) como rede de segurança, e limites estritos por módulo com testes (`cartSlice`, `cartSelectors`, `paymentMethodsSlice`, `restaurantOrdersSlice`, `favorites`) — qualquer regressão nesses ficheiros falha o build.

As regras de `react-hooks` do React Compiler estão em `warn` (código legado); promover a `error` à medida que forem corrigidas.

---

## Documentação

| Ficheiro | Conteúdo |
| --- | --- |
| [`situation.md`](situation.md) | Contexto funcional do frontend e contrato com o backend |
| [`docs/ARQUITETURA_MULTI_TENANT.md`](docs/ARQUITETURA_MULTI_TENANT.md) | Modelo multi-tenant, RLS e isolamento PostgreSQL |
| [`docs/LAYOUT_SISTEMA.md`](docs/LAYOUT_SISTEMA.md) | Tokens de layout, navegação e densidade por perfil |
| [`docs/IOS_LIVEKIT_VOIP.md`](docs/IOS_LIVEKIT_VOIP.md) | Pontos de atenção iOS/LiveKit/VoIP e estado de cada um |
| [`backlog.md`](backlog.md) | Backlog do produto |

---

## Repositórios relacionados

- **Backend API** — https://github.com/MilvendasAO/backend-pedeja
- **Painel web** — https://github.com/NiltonCarlosdawg/Pede-J-
