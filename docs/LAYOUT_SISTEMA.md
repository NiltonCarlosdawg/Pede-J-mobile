# PedeJá — Sistema de Layout (Mobile)

> Proposta para os três perfis manterem a mesma marca, mas cada um com densidade de informação adequada à tarefa. O tema já centraliza `lightColors/darkColors` em `src/theme/index.ts` — este guia diz como usá-lo.

## 1. Princípios

- **Cor com propósito:** laranja `#f95a0d` apenas em acção primária, preço e estado activo. Fundos neutros (`surfaceContainerLowest`, `surfaceContainer`) para cartões.
- **Fotografia consistente:** todas as imagens de pratos/restaurantes com mesma proporção, overlay suave e fallback com ícone quando falha.
- **Texto legível:** `typography` central (Arvo) para títulos, `bodySm` para detalhes. Preço, prazo e próxima acção sempre acima da dobra.
- **Toque confortável:** botões 48–56px de altura, `hitSlop` 14px em linhas de selecção (já aplicado em `checkout.tsx` e `endereco.tsx`).
- **Feedback honesto:** carregamento com esqueleto, erro com mensagem accionável e “última actualização” para localização/pagamento. Nunca inventar estado.

## 2. Tokens (já existentes)

- Cores: `primary[500]`, `secondary[500]`, `neutral`, `surface*`, `error/success/warning/info`.
- Espaçamento: `xs 4 / sm 8 / md 16 / lg 24 / xl 32 / gutter 16`.
- Raios: `md 12 / lg 16 / xl 24 / full 9999`.
- Sombras: `shadowStyle` para elevação 4–8 em mapas e CTAs flutuantes.

## 3. Estrutura por perfil

### Cliente — `Início · Explorar · Pedidos · Conta`
- **Header:** localização actual + sino com badge + avatar. Sempre com `showBack` quando molar.
- **Início:** hero com “Olá, {nome}” + barra de pesquisa + categorias em chip + restaurantes em lista com `FlatList` virtualizada.
- **Restaurante:** tabs `Cardápio | Avaliações | Info` com sticky header; observações alimentares destacadas.
- **Carrinho:** linha com `+ / -` e nota por item; aviso antes de trocar de restaurante.
- **Checkout:** cartão hero + selecção de endereço + itens + pagamento + cupom + resumo. Erro preserva carrinho (já corrigido).
- **Rastreamento:** mapa 300px + handle + chips de pedidos activos + cartão do restaurante + timeline + histórico. Estado “Aguardando localização” quando `lastKnown` é nulo.

### Restaurante — `Operação · Cardápio · Resultados · Conta`
- **Operação:** 3 colunas filtráveis: `Novos → Em preparação → Prontos`. Cartão grande com tempo decorrido, total e observações. Botão primário muda de “Aceitar (12 min)” para “Pronto para recolha”.
- **Cardápio:** grelha com disponibilidade (`isAvailable`) e destaque (`isFeatured`); edição rápida de preço com validação.
- **Conta:** pausa de pedidos (`toggleOpen`), horários por dia e taxa de entrega editáveis.

### Entregador — `Trabalho · Ganhos · Histórico · Conta`
- **Trabalho:** uma oferta de cada vez com mapa, distância, remuneração e dois CTAs: `Aceitar` / `Recusar`. Durante entrega: mapa + destino + instruções + “Ligar” + “Chat” + botão grande `Confirmar recolha → Iniciar entrega → Confirmar entrega`.
- **Ganhos:** filtros `Hoje/Semana/Mês` com barras e lista de corridas.
- **Conta:** switch “Partilhar localização” ligado ao `deliveryApi.toggleLocationSharing` e ao `BACKGROUND_TASK`.

## 4. Componentes chave

- **Button:** `primary` (laranja), `secondary` (outline), `ghost` (texto). `loading` desactiva clique duplo.
- **RestaurantCard / ProductCard:** imagem 16:9, selo “Grátis” quando `deliveryFee === 0`, estrelas com `ratingCount`.
- **TrackingMap:** três marcadores (loja, cliente, entregador) + rota quando `route[]` existe. Botão “Minha localização” apenas com permissão.
- **Estados vazios:** ilustração + título + acção. Ex.: “Nenhum pedido em andamento — Explorar restaurantes”.
- **Confirmação:** `ConfirmDialog` para logout, troca de carrinho e cancelamento de pedido.

## 5. Detalhes que elevam a qualidade

- Teclado: `KeyboardAvoidingView` com `keyboardVerticalOffset` 90–100 e `keyboardShouldPersistTaps="handled"`.
- Safe area: `edges=["top","bottom"]` em listas com footer fixo (checkout/pagamento).
- Acessibilidade: `accessibilityLabel` em ícones, contraste AA em `neutral[700]` sobre `surface`.
- Performance: virtualizar `Home`, `Cardápio` e `Histórico`; memoizar `styles` com `useMemo` por `colors`; limitar `maxToRenderPerBatch`.

## 6. O que falta desenhar (próximo sprint)

- **Modo cozinha** para restaurante (tipografia 2×, cores de urgência por tempo).
- **Código de entrega** para entregador/cliente (4–6 dígitos validado no servidor).
- **Onboarding de restaurante/entregador** com validação de documentos e `role` no registo.
