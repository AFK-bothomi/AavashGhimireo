// Beautiful Web Audio API Music Box Synthesizer
// No external assets required. Completely standalone, reliable and interactive.

let audioCtx: AudioContext | null = null;
let currentBpsNodes: { oscs: OscillatorNode[]; gains: GainNode[] }[] = [];
let happyBirthdayPlaying = false;
let playbackTimeoutIds: number[] = [];

// Ensure audio context is initialized on user gesture
export function initAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// Sound Maker: Music Box Tines
// A musicbox timbre is a sine wave at fundamental + weak higher harmonics, 
// wrapped in an instantaneous attack and long exponential decay.
function playMusicBoxTine(ctx: AudioContext, frequency: number, time: number, volume = 0.5, duration = 2.0) {
  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator(); // 1st overtone for metallic sparkle
  const gainNode = ctx.createGain();

  osc1.type = 'sine';
  osc1.frequency.setValueAtTime(frequency, time);

  // Overtone frequency is 2.76x of fundamental (characteristic of metal prongs)
  osc2.type = 'sine';
  osc2.frequency.setValueAtTime(frequency * 2.76, time);

  gainNode.gain.setValueAtTime(0, time);
  // Extremely quick attack
  gainNode.gain.linearRampToValueAtTime(volume * 0.45, time + 0.015);
  // Long Exponential Decay
  gainNode.gain.exponentialRampToValueAtTime(0.0001, time + duration);

  osc1.connect(gainNode);
  osc2.connect(gainNode);
  
  // Weak overtone volume
  const overtoneGain = ctx.createGain();
  overtoneGain.gain.setValueAtTime(0.12, time);
  osc2.disconnect(gainNode);
  osc2.connect(overtoneGain);
  overtoneGain.connect(gainNode);

  gainNode.connect(ctx.destination);

  osc1.start(time);
  osc2.start(time);

  osc1.stop(time + duration);
  osc2.stop(time + duration);

  return { oscs: [osc1, osc2], gains: [gainNode] };
}

// Gentle "Whff/Pop" sound when a candle flame is blown out
export function playCandleBlow() {
  const ctx = initAudioContext();
  const now = ctx.currentTime;

  // 1. Air whoosh (white noise)
  const bufferSize = ctx.sampleRate * 0.15; // 150ms
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }

  const noiseNode = ctx.createBufferSource();
  noiseNode.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 800;
  filter.Q.value = 1.0;

  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(0.2, now);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

  noiseNode.connect(filter);
  filter.connect(noiseGain);
  noiseGain.connect(ctx.destination);

  noiseNode.start(now);
  noiseNode.stop(now + 0.16);

  // 2. Sweet little fairy "twinkle"
  playMusicBoxTine(ctx, 880, now, 0.4, 0.6); // A5
  playMusicBoxTine(ctx, 1318.51, now + 0.04, 0.3, 0.8); // E6
}

// Play a glittering celebratory chime arpeggio
export function playCelebrationChime() {
  const ctx = initAudioContext();
  const now = ctx.currentTime;

  // Let's play a sparkling G Major 9th chime sequence:
  // G4 -> B4 -> D5 -> F#5 -> A5 -> B5 -> D6
  const notes = [392.00, 493.88, 587.33, 739.99, 880.00, 987.77, 1174.66];
  
  notes.forEach((freq, idx) => {
    const playTime = now + idx * 0.085;
    playMusicBoxTine(ctx, freq, playTime, 0.35, 1.8);
  });
}

// Music Box song representation of "Happy Birthday" with support chords
const HAPPY_BIRTHDAY_MELODY = [
  { note: 'C5', freq: 523.25, beat: 0.75 },
  { note: 'C5', freq: 523.25, beat: 0.25 },
  { note: 'D5', freq: 587.33, beat: 1.0 },
  { note: 'C5', freq: 523.25, beat: 1.0 },
  { note: 'F5', freq: 698.46, beat: 1.0 },
  { note: 'E5', freq: 659.25, beat: 2.0 },

  { note: 'C5', freq: 523.25, beat: 0.75 },
  { note: 'C5', freq: 523.25, beat: 0.25 },
  { note: 'D5', freq: 587.33, beat: 1.0 },
  { note: 'C5', freq: 523.25, beat: 1.0 },
  { note: 'G5', freq: 783.99, beat: 1.0 },
  { note: 'F5', freq: 698.46, beat: 2.0 },

  { note: 'C5', freq: 523.25, beat: 0.75 },
  { note: 'C5', freq: 523.25, beat: 0.25 },
  { note: 'C6', freq: 1046.50, beat: 1.0 },
  { note: 'A5', freq: 880.00, beat: 1.0 },
  { note: 'F5', freq: 698.46, beat: 1.0 },
  { note: 'E5', freq: 659.25, beat: 1.0 },
  { note: 'D5', freq: 587.33, beat: 2.0 },

  { note: 'Bb5', freq: 932.33, beat: 0.75 },
  { note: 'Bb5', freq: 932.33, beat: 0.25 },
  { note: 'A5', freq: 880.00, beat: 1.0 },
  { note: 'F5', freq: 698.46, beat: 1.0 },
  { note: 'G5', freq: 783.99, beat: 1.0 },
  { note: 'F5', freq: 698.46, beat: 2.5 },
];

// Accompanying chords (played softly at the start of key bars)
const CHORDS = [
  { timeBeat: 0.0, freqs: [261.63, 329.63, 392.00], vol: 0.15 }, // C Major
  { timeBeat: 2.0, freqs: [261.63, 329.63, 392.00], vol: 0.12 },
  { timeBeat: 4.0, freqs: [196.00, 246.94, 293.66], vol: 0.15 }, // G Major
  { timeBeat: 6.0, freqs: [196.00, 246.94, 293.66], vol: 0.12 },
  
  { timeBeat: 8.0, freqs: [196.00, 246.94, 293.66], vol: 0.15 }, // G Major
  { timeBeat: 10.0, freqs: [196.00, 246.94, 293.66], vol: 0.12 },
  { timeBeat: 12.0, freqs: [261.63, 329.63, 392.00], vol: 0.15 }, // C Major
  { timeBeat: 14.0, freqs: [261.63, 329.63, 392.00], vol: 0.12 },

  { timeBeat: 16.0, freqs: [261.63, 329.63, 392.00], vol: 0.15 }, // C Major
  { timeBeat: 18.0, freqs: [349.23, 440.00, 523.25], vol: 0.15 }, // F Major
  { timeBeat: 20.0, freqs: [261.63, 329.63, 392.00], vol: 0.12 }, // C Major
  { timeBeat: 21.0, freqs: [196.00, 293.66, 392.00], vol: 0.12 }, // Gsus4

  { timeBeat: 22.0, freqs: [466.16, 587.33, 698.46], vol: 0.12 }, // Bb Major
  { timeBeat: 24.0, freqs: [349.23, 440.00, 523.25], vol: 0.15 }, // F Major
  { timeBeat: 26.0, freqs: [196.00, 246.94, 293.66, 349.23], vol: 0.15 }, // G7
  { timeBeat: 28.0, freqs: [261.63, 329.63, 392.00, 523.25], vol: 0.18 }  // C Major crescendo
];

export function playHappyBirthday(loop = true, onFinish?: () => void) {
  if (happyBirthdayPlaying) return;
  
  const ctx = initAudioContext();
  happyBirthdayPlaying = true;
  currentBpsNodes = [];
  playbackTimeoutIds = [];

  const beatDuration = 0.52; // Tempo (~115 BPM)
  const startTime = ctx.currentTime + 0.1;

  // 1. Schedule Melody
  let currentBeatOffset = 0;
  HAPPY_BIRTHDAY_MELODY.forEach((note) => {
    const playTime = startTime + currentBeatOffset * beatDuration;
    
    // Play with gentle swing/humanized velocity variation
    const volume = 0.35 + Math.random() * 0.05;
    
    // Schedule a timer slightly in advance to make sure nodes are tracked
    const noteNodes = playMusicBoxTine(ctx, note.freq, playTime, volume, 1.8);
    currentBpsNodes.push(noteNodes);

    currentBeatOffset += note.beat;
  });

  // 2. Schedule Soft Chords Harmony
  CHORDS.forEach((chord) => {
    const playTime = startTime + chord.timeBeat * beatDuration;
    chord.freqs.forEach((freq, idx) => {
      // Arpeggiate the chords slightly for classical music box realism
      const arpDelay = idx * 0.015;
      const tNode = playMusicBoxTine(ctx, freq, playTime + arpDelay, chord.vol, 2.5);
      currentBpsNodes.push(tNode);
    });
  });

  // Total song beats is currentBeatOffset (sum of notes which is 24-28-ish beats total)
  const songLengthMs = currentBeatOffset * beatDuration * 1000;

  // Cleanup or Loop
  const timeoutId = window.setTimeout(() => {
    happyBirthdayPlaying = false;
    currentBpsNodes = [];
    
    if (loop && happyBirthdayPlaying) {
      playHappyBirthday(true, onFinish);
    } else if (onFinish) {
      onFinish();
    }
  }, songLengthMs + 500);

  playbackTimeoutIds.push(timeoutId);
}

export function stopHappyBirthday() {
  happyBirthdayPlaying = false;
  
  // Clear timeouts
  playbackTimeoutIds.forEach((id) => clearTimeout(id));
  playbackTimeoutIds = [];

  // Stop active oscillator nodes safely
  currentBpsNodes.forEach((nodeGroup) => {
    nodeGroup.oscs.forEach((osc) => {
      try {
        osc.stop();
      } catch (e) {
        // Safe check if already stopped
      }
    });
    nodeGroup.gains.forEach((gain) => {
      try {
        gain.disconnect();
      } catch (e) {
        // Safe check
      }
    });
  });

  currentBpsNodes = [];
}

export function isHappyBirthdayPlaying() {
  return happyBirthdayPlaying;
}
