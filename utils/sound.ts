let audioContext: AudioContext | null = null;

export const initializeAudio = () => {
  const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioContext) return;

  if (!audioContext) {
    audioContext = new AudioContext();
  }

  if (audioContext.state === 'suspended') {
    audioContext.resume().catch((e) => console.warn("Audio resume failed", e));
  }
};

export const speak = (text: string) => {
  if (!('speechSynthesis' in window)) return;
  
  // Cancel any currently playing speech to avoid overlap lag
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 1.2; // Slightly faster for urgency
  utterance.pitch = 1.0;
  window.speechSynthesis.speak(utterance);
};

export const playBeep = (frequency = 440, duration = 100) => {
    // Ensure we have a context (fallback if global unlock failed or wasn't triggered)
    if (!audioContext) initializeAudio();
    if (!audioContext) return;

    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();

    osc.type = 'sine';
    osc.frequency.value = frequency;
    osc.connect(gain);
    gain.connect(audioContext.destination);
    
    const now = audioContext.currentTime;
    osc.start(now);
    
    // Explicitly set start volume to 1 (full) then ramp down
    gain.gain.setValueAtTime(1, now);
    gain.gain.exponentialRampToValueAtTime(0.00001, now + duration / 1000);
    
    osc.stop(now + duration / 1000);
    
    // Cleanup nodes after they are done playing
    setTimeout(() => {
        osc.disconnect();
        gain.disconnect();
    }, duration + 50);
};