import { Snake } from './snake.js';
import { Food } from './food.js';
import { Renderer, getSkinList } from './renderer.js';
import { InputHandler } from './input.js';
import { ParticleSystem } from './particles.js';
import { playEat, playDie, isSoundEnabled, toggleSound } from './audio.js';
import { getBestScore, setBestScore, getDifficulty, setDifficulty, getSkin, setSkin, getSeason, setSeason, getLeaderboard, addLeaderboardEntry, isHighScore } from './storage.js';

const GRID_W = 20;
const GRID_H = 20;

const SPEED_TABLE = [
  { score: 0,   interval: 150 },
  { score: 50,  interval: 130 },
  { score: 150, interval: 110 },
  { score: 300, interval: 90 },
  { score: 500, interval: 75 },
];

const DIFFICULTY_OFFSETS = {
  easy: 30,
  normal: 0,
  hard: -30,
};

const State = {
  MENU: 'MENU',
  PLAYING: 'PLAYING',
  PAUSED: 'PAUSED',
  DYING: 'DYING',
  GAMEOVER: 'GAMEOVER',
};

export class Game {
  constructor() {
    this.canvas = document.getElementById('game-canvas');
    this.snake = new Snake(GRID_W, GRID_H);
    this.food = new Food(GRID_W, GRID_H);
    this.renderer = new Renderer(this.canvas, GRID_W, GRID_H);
    this.input = new InputHandler();
    this.particles = new ParticleSystem();

    this.state = State.MENU;
    this.score = 0;
    this.level = 1;
    this.bestScore = getBestScore();
    this.tickInterval = 150;
    this.tickAccumulator = 0;
    this.lastTime = 0;
    this.deathTimer = 0;
    this.deathDuration = 800;
    this.effectTimer = 0;
    this.baseTickInterval = 150;

    this._updateHUD();
    this._updateBestDisplay();
    this._setupUI();
    this._setupInput();
    this._applyDifficulty(getDifficulty());
    this._applySkin(getSkin());
    this._applySeason(getSeason());

    this.input.enable();
    this._loop(0);
  }

  _setupUI() {
    this.overlay = document.getElementById('overlay');
    this.overlayTitle = document.getElementById('overlay-title');
    this.overlaySubtitle = document.getElementById('overlay-subtitle');
    this.overlayBtn = document.getElementById('overlay-btn');
    this.overlayInstructions = document.getElementById('overlay-instructions');
    this.diffBtns = document.querySelectorAll('.diff-btn');
    this.skinBtns = document.querySelectorAll('.skin-btn');
    this.seasonBtns = document.querySelectorAll('.season-btn');
    this.soundBtn = document.getElementById('sound-btn');
    this.pauseBtn = document.getElementById('pause-btn');
    this.leaderboardBtn = document.getElementById('leaderboard-btn');
    this.leaderboardPanel = document.getElementById('leaderboard-panel');
    this.leaderboardList = document.getElementById('leaderboard-list');
    this.leaderboardClose = document.getElementById('leaderboard-close');

    this.overlayBtn.addEventListener('click', () => this._onAction('START'));

    this.diffBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        this.diffBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const diff = btn.dataset.diff;
        setDifficulty(diff);
        this._applyDifficulty(diff);
      });
    });

    this.skinBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        this.skinBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const skin = btn.dataset.skin;
        setSkin(skin);
        this._applySkin(skin);
      });
    });

    this.seasonBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        this.seasonBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const season = btn.dataset.season;
        setSeason(season);
        this._applySeason(season);
      });
    });

    this.soundBtn.addEventListener('click', () => {
      const enabled = toggleSound();
      this.soundBtn.textContent = enabled ? '🔊' : '🔇';
    });

    this.pauseBtn.addEventListener('click', () => {
      if (this.state === State.PLAYING) this._onAction('PAUSE');
      else if (this.state === State.PAUSED) this._onAction('PAUSE');
    });

    this.leaderboardBtn.addEventListener('click', () => {
      this._showLeaderboard();
    });

    this.leaderboardClose.addEventListener('click', () => {
      this._hideLeaderboard();
    });

    window.addEventListener('resize', () => {
      this.renderer.resize();
    });

    this._showOverlay('PIXEL SNAKE', '', 'START');
  }

  _setupInput() {
    this.input.onDirection((dir) => {
      if (this.state === State.PLAYING) {
        this.snake.setDirection(dir);
      }
    });

    this.input.onAction((action) => this._onAction(action));
  }

  _onAction(action) {
    switch (action) {
      case 'START':
        if (this.state === State.MENU || this.state === State.GAMEOVER) {
          this._startGame();
        } else if (this.state === State.PAUSED) {
          this._resume();
        }
        break;
      case 'PAUSE':
        if (this.state === State.PLAYING) this._pause();
        else if (this.state === State.PAUSED) this._resume();
        break;
      case 'RESTART':
        if (this.state === State.GAMEOVER) this._startGame();
        break;
      case 'MUTE':
        const enabled = toggleSound();
        this.soundBtn.textContent = enabled ? '🔊' : '🔇';
        break;
    }
  }

  _applyDifficulty(diff) {
    const offset = DIFFICULTY_OFFSETS[diff] || 0;
    this.difficultyOffset = offset;
  }

  _applySkin(skin) {
    this.renderer.setSkin(skin);
  }

  _applySeason(season) {
    this.renderer.setSeason(season);
    this.seasonBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.season === season);
    });
  }

  _getTickInterval() {
    let interval = SPEED_TABLE[0].interval;
    for (const tier of SPEED_TABLE) {
      if (this.score >= tier.score) {
        interval = tier.interval;
      }
    }
    let result = Math.max(50, interval + (this.difficultyOffset || 0));
    if (this.effectTimer > 0) {
      result = this.baseTickInterval;
    }
    return result;
  }

  _getLevel() {
    for (let i = SPEED_TABLE.length - 1; i >= 0; i--) {
      if (this.score >= SPEED_TABLE[i].score) return i + 1;
    }
    return 1;
  }

  _startGame() {
    this.snake.reset();
    this.score = 0;
    this.level = 1;
    this.tickInterval = this._getTickInterval();
    this.baseTickInterval = this.tickInterval;
    this.tickAccumulator = 0;
    this.particles.clear();
    this.deathTimer = 0;
    this.effectTimer = 0;

    const occupied = this.snake.getOccupiedSet();
    this.food.spawn(occupied);
    this.food.animTimer = 0;

    this.state = State.PLAYING;
    this._hideOverlay();
    this._updateHUD();
  }

  _pause() {
    this.state = State.PAUSED;
    this._showOverlay('PAUSED', 'Press SPACE to continue', 'RESUME');
  }

  _resume() {
    this.state = State.PLAYING;
    this._hideOverlay();
    this.lastTime = performance.now();
  }

  _die() {
    this.state = State.DYING;
    this.deathTimer = 0;
    playDie();
  }

  _gameOver() {
    this.state = State.GAMEOVER;
    const isNewBest = this.score > this.bestScore;
    if (isNewBest) {
      this.bestScore = this.score;
      setBestScore(this.bestScore);
      this._updateBestDisplay();
    }
    // 分数大于 0 时写入排行榜
    if (this.score > 0) {
      addLeaderboardEntry(this.score, getDifficulty());
    }
    const subtitle = isNewBest
      ? `NEW RECORD! ${this.score}`
      : `Score: ${this.score}`;
    this._showOverlay('GAME OVER', subtitle, 'RESTART');
  }

  _showOverlay(title, subtitle, btnText) {
    this.overlayTitle.textContent = title;
    this.overlaySubtitle.textContent = subtitle;
    this.overlayBtn.textContent = btnText;
    this.overlay.classList.add('visible');

    const isMenu = this.state === State.MENU;
    const isGameOver = this.state === State.GAMEOVER;
    this.overlayInstructions.style.display = (isMenu || isGameOver) ? 'block' : 'none';
    document.getElementById('difficulty-select').style.display = isMenu ? 'flex' : 'none';
    document.getElementById('skin-select').style.display = isMenu ? 'flex' : 'none';
    document.getElementById('season-select').style.display = isMenu ? 'flex' : 'none';
  }

  _hideOverlay() {
    this.overlay.classList.remove('visible');
  }

  _updateHUD() {
    document.getElementById('score-display').textContent =
      `SCORE: ${String(this.score).padStart(4, '0')}`;
    document.getElementById('level-display').textContent =
      `LV: ${this.level}`;
  }

  _updateBestDisplay() {
    document.getElementById('best-display').textContent =
      `BEST: ${String(this.bestScore).padStart(4, '0')}`;
  }

  _showLeaderboard() {
    const board = getLeaderboard();
    this.leaderboardList.innerHTML = '';

    if (board.length === 0) {
      const empty = document.createElement('li');
      empty.className = 'empty';
      empty.textContent = '暂无记录，快来挑战吧！';
      this.leaderboardList.appendChild(empty);
    } else {
      const diffNames = { easy: 'EASY', normal: 'NORM', hard: 'HARD' };
      board.forEach((entry, i) => {
        const li = document.createElement('li');
        li.innerHTML =
          `<span class="rank">#${i + 1}</span>` +
          `<span class="score">${String(entry.score).padStart(4, '0')}</span>` +
          `<span class="diff">${diffNames[entry.difficulty] || 'NORM'}</span>`;
        this.leaderboardList.appendChild(li);
      });
    }

    this.leaderboardPanel.classList.remove('hidden');
  }

  _hideLeaderboard() {
    this.leaderboardPanel.classList.add('hidden');
  }

  _tick() {
    this.snake.move();

    if (this.snake.isOutOfBounds() || this.snake.isSelfCollision()) {
      this._die();
      return;
    }

    const head = this.snake.getHead();
    if (this.food.isAt(head.x, head.y)) {
      const growAmount = this.food.getGrowAmount();
      for (let i = 0; i < growAmount; i++) {
        this.snake.grow();
      }
      this.score += this.food.getScore();
      this.level = this._getLevel();

      const effect = this.food.getEffect();
      if (effect === 'speed') {
        this.baseTickInterval = Math.max(40, this.tickInterval - 40);
        this.effectTimer = 5000;
      } else if (effect === 'slow') {
        this.baseTickInterval = this.tickInterval + 50;
        this.effectTimer = 5000;
      } else {
        this.baseTickInterval = this._getTickInterval();
        this.effectTimer = 0;
      }
      this.tickInterval = this._getTickInterval();

      const cs = this.renderer.cellSize;
      this.particles.emit(
        this.food.x * cs + cs / 2,
        this.food.y * cs + cs / 2,
        this.food.getParticleColor(),
        12
      );

      playEat();

      const occupied = this.snake.getOccupiedSet();
      if (!this.food.spawn(occupied)) {
        this._win();
        return;
      }

      this._updateHUD();
    }
  }

  _win() {
    this.state = State.GAMEOVER;
    if (this.score > 0) {
      addLeaderboardEntry(this.score, getDifficulty());
    }
    this._showOverlay('YOU WIN!', `Score: ${this.score}`, 'RESTART');
  }

  _loop(timestamp) {
    const dt = timestamp - this.lastTime;
    this.lastTime = timestamp;

    if (this.state === State.PLAYING) {
      if (this.effectTimer > 0) {
        this.effectTimer -= dt;
        if (this.effectTimer <= 0) {
          this.effectTimer = 0;
          this.baseTickInterval = this._getTickInterval();
          this.tickInterval = this.baseTickInterval;
        }
      }

      this.tickAccumulator += dt;
      while (this.tickAccumulator >= this.tickInterval) {
        this._tick();
        this.tickAccumulator -= this.tickInterval;
        if (this.state !== State.PLAYING) break;
      }
      this.food.update(dt);
      this.particles.update(dt);
    }

    if (this.state === State.DYING) {
      this.deathTimer += dt;
      if (this.deathTimer >= this.deathDuration) {
        this._gameOver();
      }
    }

    this._render();
    requestAnimationFrame((t) => this._loop(t));
  }

  _render() {
    this.renderer.clear();
    this.renderer.drawGrid();
    this.renderer.drawSeasonDecorations();
    this.renderer.drawWalls();

    if (this.state === State.DYING) {
      const progress = Math.min(1, this.deathTimer / this.deathDuration);
      this.renderer.drawDeathEffect(this.snake, progress);
    } else if (this.state !== State.MENU) {
      this.renderer.drawFood(this.food);
      this.renderer.drawSnake(this.snake);
    } else {
      this.renderer.drawSnake(this.snake);
    }

    this.particles.draw(this.renderer.ctx);
  }
}
