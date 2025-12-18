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
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;

    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.value = frequency;
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + duration / 1000);
    setTimeout(() => {
        osc.stop();
        ctx.close();
    }, duration);
};