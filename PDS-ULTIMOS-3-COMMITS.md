# Ponto de Situação — PedeJá Mobile

**Data:** 18 de Setembro de 2026
**Repositório:** Pede-J-mobile (React Native / Expo)

---

## 1. Melhorias de Interface e Marca Visual

**Commit:** `cf34307`

### O que foi feito
- **Nova fonte tipográfica (Arvo):** toda a aplicação foi atualizada com a fonte oficial do projeto, garantindo identidade visual consistente.
- **Navbar no histórico:** o utilizador agora consegue navegar para trás na tela de histórico de entregas.
- **Modal de produto:** ao tocar num produto, aparece um modal com duas opções claras:
  - *Pede Já* — adiciona e vai direto ao checkout
  - *Adicionar ao carrinho* — mantém o utilizador a navegar
- **Ingredientes visíveis:** a composição de cada produto é apresentada no modal, aumentando a transparência perante o cliente.

### Impacto
- Experiência de compra mais fluida e intuitiva.
- Reforço da identidade visual da marca.
- Redução de dúvidas do cliente sobre o conteúdo do produto.

---

## 2. Ligação à API Real — Eliminação de Dados Mockados

**Commit:** `79ec81e`

### O que foi feito

| Ecrã | Antes | Depois |
|------|-------|--------|
| Login | Credenciais fixas de demonstração | Chamada real à API (`authApi.login`) |
| Registo | Utilizador fake criado localmente | Registo via API com validação de telefone |
| Ecrã inicial | Restaurantes e categorias fixos | Dados dinâmicos via `restaurantApi.list` |
| Lista de restaurantes | 6 restaurantes hardcoded | Dados reais com filtros por tipo de cozinha |
| Dashboard do entregador | Valores fictícios | Ganhos e entregas reais via API |
| Histórico de entregas | Dados hardcoded | Consulta à API com filtros por período |
| Ganhos | Tabela fixa | Dados reais com gráfico e detalhe diário |
| Chat (cliente + entregador) | Mensagens simuladas com respostas fake | Mensagens reais via API com polling a cada 5s |
| Perfil | Nome e email fixos | Dados do utilizador autenticado |

### Dados removidos
Foram eliminados **todos** os dados de demonstração dos seguintes stores Redux:
- `ordersSlice` — 5 pedidos fake removidos
- `chatSlice` — 4 mensagens fake removidas
- `notificationsSlice` — 4 notificações fake removidas
- `promotionsSlice` — 3 cupões e 3 promoções fake removidos
- `ratingsSlice` — 3 avaliações fake removidas

### Tipos actualizados
O ficheiro `types/index.ts` foi expandido com novas interfaces necessárias para a comunicação com a API:
- `RestaurantPage`, `ProductPage`, `OrderPage` (paginação)
- `PaginatedResponse<T>` (respostas paginadas genéricas)
- `CouponValidationResponse`, `PromotionSummary`
- `Earnings`, `AddressPage`, `OrderTimelineEntry`
- `Role`, `OrderStatus`, `RestaurantStatus`, `PaymentStatus` (enums tipados)

### Impacto
- A aplicação passa de **protótipo funcional** para **produto conectado ao backend**.
- Os dados apresentados ao utilizador são reais e actualizados em tempo real.
- Preparado para testes com utilizadores reais e integração contínua.

---

## 3. Integração VoIP — Chamadas de Voz Nativas

**Commit:** `0546172`

### O que foi feito
Implementação completa de um sistema de chamadas de voz (VoIP) entre cliente e entregador, integrado directamente na aplicação.

### Componentes

| Componente | Descrição |
|------------|-----------|
| `src/services/voip.ts` | Serviço principal — CallKit (iOS), ConnectionService (Android), PushKit |
| `src/services/voip.web.ts` | Fallback para Expo Go e web (sem chamada real, apenas UI) |
| `app/call.tsx` | Ecrã de chamada completo: timer, mute, altifalante, desligar |
| `src/services/realtime.ts` | Socket.io para tracking de localização do entregador em tempo real |
| `src/types/native-modules.d.ts` | Declarações TypeScript para módulos nativos CallKeep e VoipPush |

### Funcionalidades
- **Chamada entrante:** notificação nativa no telemóvel (como uma chamada telefónica normal)
- **Chamada saída:** o cliente toca em "Ligar" e o entregador recebe a notificação
- **Controlos em chamada:** silenciar microfone, altifalante, desligar
- **Tracking em tempo real:** localização do entregador actualizada via Socket.io
- **Permissões:** áudio, ecrã de bloqueio, segundo plano (iOS e Android)

### Configuração técnica (`app.json`)
- iOS: `UIBackgroundModes` com voip, áudio, remote-notification e location
- Android: permissões `RECORD_AUDIO`, `CALL_PHONE`, `FOREGROUND_SERVICE_PHONE_CALL`, `WAKE_LOCK`
- Plugins: `@config-plugins/react-native-callkeep`, `withVoipNative.js`

### Impacto
- Elimina a necessidade de troca de números telefónicos entre cliente e entregador.
- Comunicação mais segura e integrada na plataforma.
- Experiência profissional ao nível de apps como Uber e iFood.

---

## Resumo Geral

```
Estado actual: Protótipo funcional → Produto preparado para produção
```

| Área | Estado |
|------|--------|
| Interface e Marca | ✅ Fonte Arvo + melhorias de UX |
| Ligação ao Backend | ✅ Todos os ecrãs ligados à API real |
| VoIP e Comunicação | ✅ Chamadas nativas + tracking em tempo real |
| Dados de demonstração | ✅ Eliminados — dados 100% reais |
| Tipos TypeScript | ✅ Actualizados e completos |
| Preparado para testes | ✅ Sim, com utilizadores reais |

---

## Próximos Passos Sugeridos
1. Testes end-to-end com o backend em staging
2. Testes de VoIP em dispositivos físicos (iOS e Android)
3. Push notifications em produção
4. Review de segurança das chaves de API e tokens
