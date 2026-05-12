# Development Build - PedeJá Mobile

O projeto foi configurado para usar **Expo Development Builds**, permitindo testar notificações push e outros módulos nativos sem as limitações do Expo Go.

## O que foi configurado

1. ✅ `expo-dev-client` instalado
2. ✅ `eas.json` com profiles para development builds
3. ✅ Scripts no `package.json` para facilitar o uso

## Pré-requisitos

### 1. Instalar EAS CLI globalmente

```bash
npm install -g eas-cli
```

### 2. Fazer login na sua conta Expo

```bash
eas login
```

Ou criar uma conta se não tiver:
```bash
eas register
```

### 3. Configurar o projeto no EAS

```bash
eas init
```

## Como usar

### Opção 1: Build na nuvem (EAS Build) - RECOMENDADO

Para dispositivo físico Android:
```bash
npm run dev:build:android
```

Para simulador Android:
```bash
npm run dev:build:android:sim
```

Para dispositivo físico iOS:
```bash
npm run dev:build:ios
```

Para simulador iOS:
```bash
npm run dev:build:ios:sim
```

O EAS irá construir o app na nuvem e gerar um QR code/ link para download.

### Opção 2: Build local

```bash
# Android
npm run dev:prebuild
npm run dev:run:android

# iOS
npm run dev:prebuild
npm run dev:run:ios
```

> ⚠️ **Requer Android Studio (Android) ou Xcode (iOS)** instalados e configurados.

## Diferença para o Expo Go

| Recurso | Expo Go | Development Build |
|---------|---------|-------------------|
| Tamanho | ~50MB+ | ~20MB+ (só o que usa) |
| Notificações push | ❌ Limitado | ✅ Completo |
| Módulos nativos custom | ❌ Não | ✅ Sim |
| Performance | Lento | Nativo |
| Deep linking | Limitado | Completo |

## Solução de problemas

### Erro: "You must be logged in to run this command"
Execute: `eas login` e faça login com sua conta Expo.

### Erro: "Project not found"
Execute: `eas init` para vincular o projeto ao EAS.

### Build falha no iOS
Certifique-se de ter uma conta Apple Developer ativa ($99/ano) para builds em dispositivos físicos.

### Notificações ainda não funcionam
Após instalar o development build, verifique se:
1. O app tem permissão de notificações
2. Você está usando o token correto (não o do Expo Go)
3. O backend está configurado com o Expo Push Token

## Próximos passos

1. Execute `eas login`
2. Execute `eas init`
3. Execute `npm run dev:build:android` (ou iOS)
4. Instale o APK/IPA gerado no seu dispositivo
5. Execute `expo start --dev-client` para iniciar o Metro bundler
6. Abra o app instalado e escaneie o QR code ou digite a URL manualmente

---

**Nota**: A partir do Expo SDK 53, notificações push no Android foram removidas do Expo Go. O Development Build é a única forma de testar notificações push completas.
