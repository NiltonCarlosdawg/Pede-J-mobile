declare module 'react-native-callkeep' {
  export type CallKeepEvent =
    | 'answerCall'
    | 'endCall'
    | 'didDisplayIncomingCall'
    | 'didPerformSetMutedCallAction'
    | 'didToggleHoldCallAction'
    | 'didPerformDTMFAction'
    | 'didLoadWithEvents'
    | 'didChangeAudioRoute'
    | 'checkReachability'
    | 'showIncomingCallUi'
    | 'silenceIncomingCall';

  interface CallKeepOptions {
    ios: {
      appName: string;
      imageName?: string;
      supportsVideo?: boolean;
      maximumCallGroups?: string;
      maximumCallsPerCallGroup?: string;
      includesCallsInRecents?: boolean;
    };
    android: {
      alertTitle: string;
      alertDescription: string;
      cancelButton: string;
      okButton: string;
      imageName?: string;
      additionalPermissions?: string[];
      selfManaged?: boolean;
      foregroundService?: {
        channelId: string;
        channelName: string;
        notificationTitle: string;
        notificationIcon?: string;
      };
    };
  }

  const RNCallKeep: {
    setup: (options: CallKeepOptions) => Promise<boolean>;
    displayIncomingCall: (
      uuid: string,
      handle: string,
      localizedCallerName?: string,
      handleType?: string,
      hasVideo?: boolean,
      options?: object | null,
    ) => void;
    startCall: (
      uuid: string,
      handle: string,
      contactIdentifier?: string,
      handleType?: string,
      hasVideo?: boolean,
    ) => void;
    endCall: (uuid: string) => void;
    endAllCalls: () => void;
    rejectCall: (uuid: string) => void;
    setMutedCall: (uuid: string, muted: boolean) => void;
    setOnHold: (uuid: string, hold: boolean) => void;
    reportEndCallWithUUID: (uuid: string, reason: number) => void;
    updateDisplay: (uuid: string, displayName: string, handle: string) => void;
    backToForeground: () => void;
    checkPhoneAccountEnabled: () => Promise<boolean>;
    hasPhoneAccount: () => Promise<boolean>;
    addEventListener: (type: CallKeepEvent, handler: (event: any) => void) => void;
    removeEventListener: (type: CallKeepEvent) => void;
  };

  export default RNCallKeep;
}

declare module 'react-native-voip-push-notification' {
  type VoipEvent = 'register' | 'notification' | 'didLoadWithEvents';

  const VoipPushNotification: {
    addEventListener: (type: VoipEvent, handler: (data: any) => void) => void;
    removeEventListener: (type: VoipEvent) => void;
    registerVoipToken: () => void;
    onVoipNotificationCompleted: (uuid: string) => void;
  };

  export default VoipPushNotification;
}
