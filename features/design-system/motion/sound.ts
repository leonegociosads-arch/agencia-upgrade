/**
 * Sound design (Fase Motion Design → Fase GSAP e Transições → Fase Microinterações). As duas
 * fases anteriores prepararam a arquitetura e os pontos de chamada com `playSound` inerte
 * (nenhum arquivo de áudio existia no projeto). Esta fase (Etapa 24, Seção 36: "agora pode
 * começar a implementar sound design leve") liga o corpo de `playSound` a sons de verdade — mas
 * SINTETIZADOS em tempo real via Web Audio API (osciladores curtos com envelope), nunca um
 * arquivo de áudio carregado.
 *
 * Por quê síntese em vez de um asset gravado (briefing Seção 41: "usar somente assets próprios,
 * licenciados, royalty-free... documentar fonte/licença; não copiar áudios do Nodeck"): um tom
 * gerado por osciladores no próprio navegador não tem ORIGEM nenhuma para licenciar — é matemática
 * (uma onda senoidal/triangular com um envelope de volume), 100% original, sem nenhum arquivo
 * externo. Isso também resolve de graça a Seção 42 ("não carregar biblioteca enorme; pré-carregar
 * só sons pequenos") — não existe nenhum asset para pré-carregar.
 */
export type SoundEvent =
  | "card_select"
  | "scene_advance"
  | "scene_back"
  | "confirm"
  | "service_complete"
  | "panel_open"
  | "panel_close"
  | "ui_press"
  | "success"
  | "hover_special";

const STORAGE_KEY = "upgrade:sound-enabled";
/** Disparado no `window` a cada `setSoundEnabled` — `useSoundEnabled()` assina isto para
 * componentes reagirem (ex.: `SoundToggle`) sem precisar de um Context dedicado só para um
 * booleano guardado em `localStorage`. */
export const SOUND_ENABLED_CHANGE_EVENT = "upgrade:sound-enabled-change";

/**
 * Opt-in, não opt-out — som começa DESLIGADO até o usuário ligar explicitamente pelo controle de
 * mute (`SoundToggle`, briefing Seção 39/40: "ativar somente após uma interação clara do usuário...
 * não assustar usuário ao abrir o site"). O clique no próprio controle já É essa interação clara.
 */
export function isSoundEnabled(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

export function setSoundEnabled(enabled: boolean): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, String(enabled));
  } catch {
    // Storage indisponível (modo privado, cota cheia) — som simplesmente continua desligado.
  }
  window.dispatchEvent(new CustomEvent(SOUND_ENABLED_CHANGE_EVENT, { detail: enabled }));
}

interface Tone {
  /** Frequência inicial, em Hz. */
  frequency: number;
  /** Segunda frequência, para um tom curto de duas notas (ex.: "success"). Ausente = nota única. */
  frequencyTo?: number;
  duration: number;
  type: OscillatorType;
  /** Ganho de pico — sempre baixo (Seção 37: "volume baixo"); nunca perto de 1. */
  gain: number;
}

/** Um tom por evento — nunca mais de uma nota curta (Seção 37: "curtos, discretos"). Nenhum efeito
 * de UI usa mais de um `SoundEvent`; nenhum `SoundEvent` é reaproveitado com significado diferente
 * em lugares diferentes (briefing Seção 59: "não inventar uma linguagem nova por seção"). */
const TONES: Record<SoundEvent, Tone> = {
  ui_press: { frequency: 720, duration: 0.05, type: "sine", gain: 0.05 },
  card_select: { frequency: 560, duration: 0.07, type: "sine", gain: 0.06 },
  scene_advance: { frequency: 620, frequencyTo: 780, duration: 0.09, type: "triangle", gain: 0.05 },
  scene_back: { frequency: 520, frequencyTo: 380, duration: 0.09, type: "triangle", gain: 0.05 },
  confirm: { frequency: 600, duration: 0.08, type: "sine", gain: 0.06 },
  service_complete: { frequency: 660, frequencyTo: 880, duration: 0.16, type: "sine", gain: 0.07 },
  panel_open: { frequency: 500, duration: 0.07, type: "sine", gain: 0.05 },
  panel_close: { frequency: 420, duration: 0.06, type: "sine", gain: 0.05 },
  success: { frequency: 660, frequencyTo: 990, duration: 0.18, type: "sine", gain: 0.07 },
  hover_special: { frequency: 900, duration: 0.04, type: "sine", gain: 0.035 },
};

let sharedAudioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AudioContextCtor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextCtor) return null; // navegador sem Web Audio — som simplesmente não toca (Seção 55: nunca a única confirmação).
  if (!sharedAudioContext) sharedAudioContext = new AudioContextCtor();
  return sharedAudioContext;
}

function playTone(tone: Tone): void {
  const context = getAudioContext();
  if (!context) return;
  // Navegadores suspendem o AudioContext até um gesto do usuário — `playSound` só é chamado a
  // partir de handlers de clique/interação (nunca no mount), então este `resume()` sempre roda
  // dentro de um gesto real (Seção 38: "não iniciar áudio automaticamente").
  if (context.state === "suspended") void context.resume();

  const oscillator = context.createOscillator();
  const gainNode = context.createGain();
  const now = context.currentTime;

  oscillator.type = tone.type;
  oscillator.frequency.setValueAtTime(tone.frequency, now);
  if (tone.frequencyTo) {
    oscillator.frequency.linearRampToValueAtTime(tone.frequencyTo, now + tone.duration);
  }

  gainNode.gain.setValueAtTime(tone.gain, now);
  // Decaimento exponencial (nunca corte seco) — o motivo de terminar em 0.0001, não 0: uma rampa
  // exponencial para exatamente zero não é matematicamente válida na Web Audio API.
  gainNode.gain.exponentialRampToValueAtTime(0.0001, now + tone.duration);

  oscillator.connect(gainNode).connect(context.destination);
  oscillator.start(now);
  oscillator.stop(now + tone.duration + 0.02);
}

/**
 * Chamado nos pontos de interação já mapeados. Reforço, nunca única confirmação (Seção 55) — toda
 * ação que toca um som já tem uma mudança visual equivalente por conta própria.
 */
export function playSound(event: SoundEvent): void {
  if (!isSoundEnabled()) return;
  playTone(TONES[event]);
}
