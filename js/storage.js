const STORAGE_KEYS = {
  BEST_SCORE: 'snake_best_score',
  SOUND_ENABLED: 'snake_sound_enabled',
  DIFFICULTY: 'snake_difficulty',
  SKIN: 'snake_skin',
  SEASON: 'snake_season',
  LEADERBOARD: 'snake_leaderboard',
};

const LEADERBOARD_MAX = 10;

export function getLeaderboard() {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEYS.LEADERBOARD) || '[]');
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export function addLeaderboardEntry(score, difficulty) {
  const board = getLeaderboard();
  const entry = {
    score,
    difficulty,
    date: new Date().toLocaleDateString('zh-CN'),
  };
  board.push(entry);
  board.sort((a, b) => b.score - a.score);
  const trimmed = board.slice(0, LEADERBOARD_MAX);
  localStorage.setItem(STORAGE_KEYS.LEADERBOARD, JSON.stringify(trimmed));
  return trimmed;
}

export function isHighScore(score) {
  const board = getLeaderboard();
  if (board.length < LEADERBOARD_MAX) return true;
  return score > board[board.length - 1].score;
}

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

export function getSeason() {
  return localStorage.getItem(STORAGE_KEYS.SEASON) || 'spring';
}

export function setSeason(season) {
  localStorage.setItem(STORAGE_KEYS.SEASON, season);
}
