// Elai's birthday page: floating hearts, a surprise reveal, and a tiny synthesized melody.
const heartLayer = document.querySelector(".floating-hearts");
const heartSymbols = ["♡", "♥", "✦", "♡"];
function floatHeart() {
  if (!heartLayer || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const heart = document.createElement("span");
  heart.textContent = heartSymbols[Math.floor(Math.random() * heartSymbols.length)];
  heart.style.left = `${Math.random() * 100}vw`;
  heart.style.fontSize = `${12 + Math.random() * 20}px`;
  const duration = 7 + Math.random() * 7;
  heart.style.animationDuration = `${duration}s`;
  heartLayer.appendChild(heart);
  window.setTimeout(() => heart.remove(), duration * 1000);
}
window.setInterval(floatHeart, 850);

const surpriseButton = document.getElementById("surpriseButton");
const reveal = document.getElementById("surpriseReveal");
surpriseButton?.addEventListener("click", () => {
  const opening = reveal.hidden;
  reveal.hidden = !opening;
  surpriseButton.textContent = opening ? "Aww, close my surprise ♡" : "Tap to open your surprise ✨";
  if (opening) reveal.scrollIntoView({ behavior: "smooth", block: "nearest" });
});

// Web Audio melody: no external music file or download required. Browsers require a user click.
const musicButton = document.getElementById("musicToggle");
let audioContext = null;
let masterGain = null;
let melodyTimer = null;
let noteIndex = 0;
const melody = [
  [523.25, .24], [659.25, .24], [783.99, .38], [659.25, .24],
  [698.46, .24], [783.99, .24], [880.00, .42], [783.99, .3],
  [659.25, .24], [523.25, .24], [587.33, .38], [523.25, .48]
];
function playNote() {
  if (!audioContext || !masterGain) return;
  const [frequency, length] = melody[noteIndex % melody.length];
  noteIndex++;
  const now = audioContext.currentTime;
  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(frequency, now);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.11, now + 0.025);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + length);
  osc.connect(gain);
  gain.connect(masterGain);
  osc.start(now);
  osc.stop(now + length + 0.03);
}
async function startMusic() {
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) {
    musicButton.querySelector("span").textContent = "Music not supported";
    return;
  }
  audioContext = audioContext || new AudioCtx();
  await audioContext.resume();
  masterGain = audioContext.createGain();
  masterGain.gain.value = 0.35;
  masterGain.connect(audioContext.destination);
  playNote();
  melodyTimer = window.setInterval(playNote, 360);
  musicButton.setAttribute("aria-pressed", "true");
  musicButton.innerHTML = "♫ <span>Pause music</span>";
}
function stopMusic() {
  if (melodyTimer) window.clearInterval(melodyTimer);
  melodyTimer = null;
  if (masterGain && audioContext) {
    const oldGain = masterGain;
    oldGain.gain.setTargetAtTime(0.0001, audioContext.currentTime, 0.04);
    window.setTimeout(() => { try { oldGain.disconnect(); } catch (_) {} }, 250);
  }
  masterGain = null;
  musicButton.setAttribute("aria-pressed", "false");
  musicButton.innerHTML = "♫ <span>Play music</span>";
}
musicButton?.addEventListener("click", () => {
  if (musicButton.getAttribute("aria-pressed") === "true") stopMusic();
  else startMusic().catch(() => {
    musicButton.innerHTML = "♫ <span>Tap to play</span>";
  });
});
