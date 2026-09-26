import { AudioPlayer, createAudioPlayer, setAudioModeAsync } from 'expo-audio';

let successSound: AudioPlayer | null = null;
let notificationSound: AudioPlayer | null = null;
let statusSound: AudioPlayer | null = null;

async function loadSound(uri: string): Promise<AudioPlayer | null> {
  try {
    return createAudioPlayer(uri);
  } catch {
    return null;
  }
}

export async function initSounds() {
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
