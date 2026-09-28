import { AudioPlayer, createAudioPlayer, setAudioModeAsync } from 'expo-audio';

let successSound: AudioPlayer | null = null;
let notificationSound: AudioPlayer | null = null;
let statusSound: AudioPlayer | null = null;

/**
 * Enquanto os sons da app estão suprimidos (chamada LiveKit em curso), não se
 * toca nada: o expo-audio mexe no AVAudioSession e, se roubar a sessão ao
 * WebRTC durante a chamada, o áudio deixa de funcionar no iOS (LiveKit #286).
 * Ex.: `playStatusChange()` dispara a cada actualização de estado do pedido,
 * exactamente enquanto o utilizador está a falar com o entregador.
 */
let soundsSuppressed = false;

export function setAppSoundsSuppressed(suppressed: boolean) {
  soundsSuppressed = suppressed;
}

async function loadSound(uri: string): Promise<AudioPlayer | null> {
  try {
    return createAudioPlayer(uri);
  } catch {
    return null;
  }
}

export async function initSounds() {
  if (soundsSuppressed) return;
  try {
    await setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: false,
    });
  } catch {
    // ignore
  }
}

export async function playPaymentSuccess() {
  if (soundsSuppressed) return;
  try {
    if (!successSound) {
      // Som de coleta de moeda estilo retro (8-bit)
      successSound = await loadSound(
        'https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3',
      );
    }
    if (successSound) {
      await successSound.seekTo(0);
      successSound.play();
    }
  } catch {
    // ignore audio errors
  }
}

export async function playNewOrder() {
  if (soundsSuppressed) return;
  try {
    if (!notificationSound) {
      // Som de "plim" / notificação curta
      notificationSound = await loadSound(
        'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3',
      );
    }
    if (notificationSound) {
      await notificationSound.seekTo(0);
      notificationSound.play();
    }
  } catch {
    // ignore audio errors
  }
}

export async function playStatusChange() {
  if (soundsSuppressed) return;
  try {
    if (!statusSound) {
      // Beep curto e simples
      statusSound = await loadSound(
        'https://assets.mixkit.co/active_storage/sfx/2868/2868-preview.mp3',
      );
    }
    if (statusSound) {
      await statusSound.seekTo(0);
      statusSound.play();
    }
  } catch {
    // ignore audio errors
  }
}

export async function unloadSounds() {
  try {
    if (successSound) {
      successSound.remove();
      successSound = null;
    }
    if (notificationSound) {
      notificationSound.remove();
      notificationSound = null;
    }
    if (statusSound) {
      statusSound.remove();
      statusSound = null;
    }
  } catch {
    // ignore
  }
}
