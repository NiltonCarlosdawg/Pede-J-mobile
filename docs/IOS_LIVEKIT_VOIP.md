# iOS — LiveKit / VoIP: pontos de atenção

Registo dos pontos levantados na revisão do suporte iOS às chamadas LiveKit
(1‑1 cliente ↔ entregador) e o estado de cada um.

---

## 4. ATS e `ws://` em dev (LAN) — ✅ sem alteração necessária

**Alerta original:** o `Info.plist` tem `NSAllowsArbitraryLoads = false` e só
`NSAllowsLocalNetworking = true`; supunha‑se que `LIVEKIT_URL=ws://192.168.x.x:7880`
seria bloqueado no iPhone.

**Verificado na documentação oficial da Apple** (Information Property List Key
Reference → *App Transport Security → Availability of ATS for Remote and Local
Connections*):

> "ATS applies only to connections made to **public host names**. The system does
> not provide ATS protection to connections made to: **IP addresses**, Unqualified
> host names, Local hosts employing the .local top‑level domain."

Consequências para este projecto:

| Destino | ATS | Estado |
| --- | --- | --- |
| `ws://192.168.x.x:7880` (LiveKit em dev) | não se aplica (IP) | ✅ funciona |
| `http://192.168.x.x:3000` (`EXPO_PUBLIC_API_URL`) | não se aplica (IP) | ✅ funciona |
| `ws://mac.local:7880` (mDNS) | exige `NSAllowsLocalNetworking` | ✅ já está `true` |
| `wss://livekit.pedeja.ao` / `https://` (produção) | aplicável (domínio público) | ✅ TLS obrigatório — correcto |

Ainda por cima, o React Native abre o WebSocket com SocketRocket
(`RCTWebSocketModule.mm` → `SRWebSocket`), uma API de nível baixo, que o ATS nem
sequer cobre.

**Conclusão:** a configuração actual (`NSAllowsArbitraryLoads = false` +
`NSAllowsLocalNetworking = true`) é a correcta — **não é preciso ligar o
`NSAllowsArbitraryLoads`**. A regra prática mantém‑se: IP/LAN em dev, `wss://` em
produção. Documentado também no `README.md` do backend.

---

## 5. `expo-doctor` — "Unsupported / Untested on New Architecture" — ✅ resolvido

O projecto corre com **New Architecture em ambas as plataformas**
(`android/gradle.properties: newArchEnabled=true` e iOS por defeito no RN 0.86 —
o `Podfile.properties.json` não define `newArchEnabled`).

`npx expo-doctor` falhava em 1 das 21 verificações:

- `Untested on New Architecture: react-native-callkeep, react-native-voip-push-notification`
- `No metadata available: @livekit/react-native-expo-plugin`

Tratava‑se de **metadata em falta no directório RN**, não de um bug: o
`@livekit/react-native` já não é sinalizado, e os dois libs de VoIP são módulos
nativos antigos que funcionam pela *interop layer* do RN. Foi adicionado ao
`package.json`:

```json
"expo": {
  "doctor": {
    "reactNativeDirectoryCheck": {
      "exclude": [
        "@livekit/react-native-expo-plugin",
        "react-native-callkeep",
        "react-native-voip-push-notification"
      ]
    }
  }
}
```

Resultado: **`npx expo-doctor` → 21/21 verificações passam.**

> ⚠️ O `exclude` silencia o aviso, não valida o código: **callkeep e
> voip-push-notification têm de ser validados em device físico** (chamada real com
> app em background) já que não têm testes em New Architecture.

---

## 6. Screenshare no iOS — ⬜ não aplicável (áudio)

O PedeJá faz **chamadas de voz**, e para áudio nada disto é necessário. Fica o
registo para o dia em que houver vídeo/screenshare:

- **Screenshare no iOS** exige uma **Broadcast Upload Extension** (ReplayKit) no
  projecto nativo + integração `ScreenCapturePickerView`.
- **Câmara em background (iOS 18+)**: opção `ios.enableMultitaskingCameraAccess` do
  `@livekit/react-native-expo-plugin` + `UIBackgroundModes: ["voip"]` (já activo).
- **Simulador iOS não publica mic/câmara** — qualquer teste de chamada é sempre em
  device físico.

---

## 7. `voip` background mode e auditoria da Apple — ✅ verificado + corrigido

A Apple rejeita apps que declaram `UIBackgroundModes: ["voip"]` sem usarem
PushKit **e** reportarem cada push via **CallKit**. Verificado no
`ios/PedeJ/AppDelegate.swift`:

- `RNVoipPushNotificationManager.voipRegistration()` no arranque ✅
- `pushRegistry(_:didUpdate:for:)` regista o token VoIP ✅
- `pushRegistry(_:didReceiveIncomingPushWith:...)` chama
  `RNCallKeep.reportNewIncomingCall(...)` imediatamente ✅
- `UIBackgroundModes = ["voip", "audio", "remote-notification", "location"]` ✅
- `NSMicrophoneUsageDescription` presente ✅

### Correcção aplicada: completionHandler do PushKit invocado 2×❌→✅

O `completionHandler` do PushKit era entregue **aos dois** libs:

```swift
RNVoipPushNotificationManager.addCompletionHandler(uuid, completionHandler: completionHandler) // guarda p/ o JS
RNCallKeep.reportNewIncomingCall(..., withCompletionHandler: completionHandler)                // chama já
```

- o **RNCallKeep chama‑o logo** no callback do CallKit
  (`RNCallKeep.m` → `reportNewIncomingCallWithUUID:completion:` → `completion()`);
- o **RNVoipPushNotificationManager guarda‑o** e o JS volta a chamá‑lo em
  `voip.voipPush.onVoipNotificationCompleted(uuid)` (`src/services/voip.ts`).

Resultado: **duas invocações do mesmo bloco**, quando a Apple exige *exactamente
uma*. Resolvido dando a propriedade **só ao CallKit** (chamada imediata, sem
dependência do JS) — removido o `addCompletionHandler` em:

- `plugins/withVoipNative.js` (templates Swift **e** Obj‑C — fonte do prebuild)
- `ios/PedeJ/AppDelegate.swift` (gerado; `ios/` não está versionado)

`onVoipNotificationCompleted(uuid)` continua a ser chamado pelo JS e passa a ser
um *no‑op* inofensivo ("handler not found" apenas em debug).

---

Ver também: áudio da chamada no iOS — ponte CallKit ↔ `RTCAudioSession` e
isolamento do `AVAudioSession` do expo‑audio durante a chamada (ver
`src/services/voip.ts`, `app/call.tsx`, `src/utils/sounds.ts`).
