# Expo Development Build - Configuração Completa

## ✅ O que foi configurado

1. **`expo-dev-client`** instalado (`~6.0.21`)
2. **`eas.json`** criado com profiles:
   - `development` → para dispositivos físicos com development client
   - `development-simulator` → para simuladores
   - `preview` → build de teste interno
   - `production` → build para loja
3. **Scripts** adicionados ao `package.json`:
   - `dev:build:android` / `dev:build:ios`
   - `dev:build:android:sim` / `dev:build:ios:sim`
   - `dev:prebuild`, `dev:run:android`, `dev:run:ios`
4. **Documentação** criada em `DEVELOPMENT_BUILDS.md`

## 🚀 Próximos passos

### 1. Instalar EAS CLI
```bash
npm install -g eas-cli
```

### 2. Login na Expo
```bash
eas login
# ou eas register se não tiver conta
```

### 3. Inicializar projeto no EAS
```bash
eas init
```

### 4. Criar development build

**Para dispositivo Android:**
```bash
npm run dev:build:android
```

**Para simulador Android:**
```bash
npm run dev:build:android:sim
```

**Para iOS (requer Apple Developer):**
```bash
npm run dev:build:ios
```

### 5. Instalar e executar

1. Baixe o APK/IPA gerado
2. Instale no dispositivo/simulador
3. Execute: `expo start --dev-client`
4. Abra o app instalado e conecte ao Metro bundler

## 📱 Diferença para Expo Go

| Recurso | Expo Go | Development Build |
|---------|---------|-------------------|
| Push Notifications | ❌ Removido (SDK 53) | ✅ Completo |
| Deep Linking | Limitado | Completo |
| Módulos nativos | Só os do Expo Go | Todos os instalados |
| Tamanho | ~50MB+ | ~20MB+ |

## ⚠️ Nota importante

O erro `expo-notifications` que você está vendo no Expo Go é **esperado** a partir do SDK 53. Para testar notificações push reais, você **deve** usar o development build.

## 📄 Arquivos modificados/criados

- ✅ `package.json` - Adicionados scripts e dependência
- ✅ `eas.json` - Configuração do EAS Build (novo)
- ✅ `DEVELOPMENT_BUILDS.md` - Documentação completa (novo)

---

**Dúvidas?** Consulte `DEVELOPMENT_BUILDS.md` para troubleshooting completo.
