const {
  withAppDelegate,
  withInfoPlist,
  AndroidConfig,
  createRunOncePlugin,
} = require('expo/config-plugins');

/**
 * Completa a config nativa VoIP:
 * - iOS: microfone + PushKit hooks no AppDelegate (Swift e Obj-C)
 * - Android: permissões extra para ConnectionService / full-screen intent
 */

// ─── iOS: AppDelegate (Obj-C) ────────────────────────────────────────
function patchObjCAppDelegate(contents) {
  if (contents.includes('RNVoipPushNotificationManager.h')) {
    return contents;
  }

  contents = contents.replace(
    /#import "AppDelegate.h"/,
    `#import "AppDelegate.h"
#import <PushKit/PushKit.h>
#import "RNVoipPushNotificationManager.h"
#import "RNCallKeep.h"`,
  );

  if (!contents.includes('voipRegistration')) {
    contents = contents.replace(
      /(- \(BOOL\)application:\(UIApplication \*\)application didFinishLaunchingWithOptions:\(NSDictionary \*\)launchOptions\s*\{)/,
      `$1
  [RNVoipPushNotificationManager voipRegistration];`,
    );
  }

  if (!contents.includes('pushRegistry:didUpdatePushCredentials')) {
    contents = contents.replace(
      /@end\s*$/,
      `
// MARK: - PushKit
- (void)pushRegistry:(PKPushRegistry *)registry didUpdatePushCredentials:(PKPushCredentials *)credentials forType:(PKPushType)type {
  [RNVoipPushNotificationManager didUpdatePushCredentials:credentials forType:(NSString *)type];
}

- (void)pushRegistry:(PKPushRegistry *)registry didInvalidatePushTokenForType:(PKPushType)type {
  // Token inválido — o JS re-regista no próximo launch.
}

- (void)pushRegistry:(PKPushRegistry *)registry
didReceiveIncomingPushWithPayload:(PKPushPayload *)payload
                         forType:(PKPushType)type
           withCompletionHandler:(void (^)(void))completion {
  NSDictionary *data = payload.dictionaryPayload ?: @{};
  NSString *uuid = data[@"uuid"] ?: data[@"callId"] ?: [[NSUUID UUID] UUIDString];
  NSString *callerName = data[@"callerName"] ?: data[@"title"] ?: @"PedeJá";
  NSString *handle = data[@"handle"] ?: data[@"orderId"] ?: @"pedeja";

  [RNVoipPushNotificationManager addCompletionHandler:uuid completionHandler:completion];
  [RNVoipPushNotificationManager didReceiveIncomingPushWithPayload:payload forType:(NSString *)type];

  [RNCallKeep reportNewIncomingCall:uuid
                             handle:handle
                         handleType:@"generic"
                           hasVideo:NO
                localizedCallerName:callerName
                        fromPushKit:YES
                            payload:data
              withCompletionHandler:completion];
}

@end
`,
    );
  }

  return contents;
}

// ─── iOS: AppDelegate (Swift) ────────────────────────────────────────
function patchSwiftAppDelegate(contents) {
  if (contents.includes('PKPushRegistryDelegate')) {
    return contents;
  }

  if (!contents.includes('import PushKit')) {
    contents = contents.replace(/^(import\s+Expo)/m, `import PushKit\n$1`);
  }

  contents = contents.replace(
    /public class AppDelegate:\s*ExpoAppDelegate/,
    'public class AppDelegate: ExpoAppDelegate, PKPushRegistryDelegate',
  );

  if (!contents.includes('voipRegistration')) {
    contents = contents.replace(
      /(return\s+super\.application\(application,\s*didFinishLaunchingWithOptions:\s*launchOptions\))/,
      `RNVoipPushNotificationManager.voipRegistration()\n    $1`,
    );
  }

  const pushKitExtension = `
// MARK: - PushKit
extension AppDelegate {
  public func pushRegistry(_ registry: PKPushRegistry, didUpdate pushCredentials: PKPushCredentials, for type: PKPushType) {
    RNVoipPushNotificationManager.didUpdate(pushCredentials, forType: type.rawValue)
  }

  public func pushRegistry(_ registry: PKPushRegistry, didInvalidatePushTokenFor type: PKPushType) {
    // Token inválido — o JS re-regista no próximo launch.
  }

  public func pushRegistry(_ registry: PKPushRegistry, didReceiveIncomingPushWith payload: PKPushPayload, for type: PKPushType, completionHandler: @escaping () -> Void) {
    let data = payload.dictionaryPayload as? [String: Any] ?? [:]
    let uuid = (data["uuid"] as? String) ?? (data["callId"] as? String) ?? UUID().uuidString
    let callerName = (data["callerName"] as? String) ?? (data["title"] as? String) ?? "PedeJá"
    let handle = (data["handle"] as? String) ?? (data["orderId"] as? String) ?? "pedeja"

    RNVoipPushNotificationManager.addCompletionHandler(uuid, completionHandler: completionHandler)
    RNVoipPushNotificationManager.didReceiveIncomingPush(with: payload, forType: type.rawValue)

    RNCallKeep.reportNewIncomingCall(
      uuid,
      handle: handle,
      handleType: "generic",
      hasVideo: false,
      localizedCallerName: callerName,
      fromPushKit: true,
      payload: data,
      withCompletionHandler: completionHandler
    )
  }
}
`;
  contents = contents.trimEnd() + '\n' + pushKitExtension;

  return contents;
}

function withVoipAppDelegate(config) {
  return withAppDelegate(config, (cfg) => {
    const lang = cfg.modResults.language;

    if (lang === 'swift') {
      cfg.modResults.contents = patchSwiftAppDelegate(cfg.modResults.contents);
    } else if (lang === 'objc' || lang === 'objcpp') {
      cfg.modResults.contents = patchObjCAppDelegate(cfg.modResults.contents);
    }

    return cfg;
  });
}

function withVoipInfoPlist(config) {
  return withInfoPlist(config, (cfg) => {
    cfg.modResults.NSMicrophoneUsageDescription =
      cfg.modResults.NSMicrophoneUsageDescription ||
      'O PedeJá precisa do microfone para chamadas de voz com o entregador/cliente.';

    if (!Array.isArray(cfg.modResults.UIBackgroundModes)) {
      cfg.modResults.UIBackgroundModes = [];
    }
    for (const mode of ['voip', 'audio', 'remote-notification']) {
      if (!cfg.modResults.UIBackgroundModes.includes(mode)) {
        cfg.modResults.UIBackgroundModes.push(mode);
      }
    }
    return cfg;
  });
}

const withVoipNative = (config) => {
  config = withVoipInfoPlist(config);
  config = withVoipAppDelegate(config);
  config = AndroidConfig.Permissions.withPermissions(config, [
    'android.permission.BIND_TELECOM_CONNECTION_SERVICE',
    'android.permission.FOREGROUND_SERVICE',
    'android.permission.FOREGROUND_SERVICE_PHONE_CALL',
    'android.permission.MANAGE_OWN_CALLS',
    'android.permission.READ_PHONE_STATE',
    'android.permission.CALL_PHONE',
    'android.permission.RECORD_AUDIO',
    'android.permission.USE_FULL_SCREEN_INTENT',
    'android.permission.VIBRATE',
    'android.permission.WAKE_LOCK',
  ]);
  return config;
};

module.exports = createRunOncePlugin(withVoipNative, 'with-voip-native', '2.0.0');
