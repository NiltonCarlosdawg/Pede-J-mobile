import { Audio } from "expo-av";

let successSound: Audio.Sound | null = null;
let notificationSound: Audio.Sound | null = null;
let statusSound: Audio.Sound | null = null;

async function loadSound(uri: string): Promise<Audio.Sound | null> {
  try {
    const { sound } = await Audio.Sound.createAsync(
      { uri },
      { shouldPlay: false }
    );
    return sound;
  } catch {
    return null;
  }
}

export async function initSounds() {
  try {
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
    });
  } catch {
    // ignore
  }
}

export async function playPaymentSuccess() {
  try {
    if (!successSound) {
      // Som de coleta de moeda estilo retro (8-bit)
      successSound = await loadSound("https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3");
    }
    if (successSound) {
      await successSound.setPositionAsync(0);
      await successSound.playAsync();
    }
  } catch {
    // ignore audio errors
  }
}

export async function playNewOrder() {
  try {
    if (!notificationSound) {
      // Som de "plim" / notificação curta
      notificationSound = await loadSound("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3");
    }
    if (notificationSound) {
      await notificationSound.setPositionAsync(0);
      await notificationSound.playAsync();
    }
  } catch {
    // ignore audio errors
  }
}

export async function playStatusChange() {
  try {
    if (!statusSound) {
      // Beep curto e simples
      statusSound = await loadSound("https://assets.mixkit.co/active_storage/sfx/2868/2868-preview.mp3");
    }
    if (statusSound) {
      await statusSound.setPositionAsync(0);
      await statusSound.playAsync();
    }
  } catch {
    // ignore audio errors
  }
}

export async function unloadSounds() {
  try {
    if (successSound) {
      await successSound.unloadAsync();
      successSound = null;
    }
    if (notificationSound) {
      await notificationSound.unloadAsync();
      notificationSound = null;
    }
    if (statusSound) {
      await statusSound.unloadAsync();
      statusSound = null;
    }
  } catch {
    // ignore
  }
}
