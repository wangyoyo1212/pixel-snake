const STORAGE_KEYS = {
  BEST_SCORE: 'snake_best_score',
  SOUND_ENABLED: 'snake_sound_enabled',
  DIFFICULTY: 'snake_difficulty',
  SKIN: 'snake_skin',
};

export function getBestScore() {
  return parseInt(localStorage.getItem(STORAGE_KEYS.BEST_SCORE) || '0', 10);
}

export function setBestScore(score) {
  localStorage.setItem(STORAGE_KEYS.BEST_SCORE, String(score));
}

export function getSoundEnabled() {
  const val = localStorage.getItem(STORAGE_KEYS.SOUND_ENABLED);
  return val === null ? true : val === 'true';
}

export function setSoundEnabled(enabled) {
  localStorage.setItem(STORAGE_KEYS.SOUND_ENABLED, String(enabled));
}

export function getDifficulty() {
  return localStorage.getItem(STORAGE_KEYS.DIFFICULTY) || 'normal';
}

export function setDifficulty(diff) {
  localStorage.setItem(STORAGE_KEYS.DIFFICULTY, diff);
}

export function getSkin() {
  return localStorage.getItem(STORAGE_KEYS.SKIN) || 'classic';
}

export function setSkin(skin) {
  localStorage.setItem(STORAGE_KEYS.SKIN, skin);
}
