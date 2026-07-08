const SKINS = {
  classic: {
    snakeHead: '#00ff88',
    snakeBody: '#00cc6e',
    snakeBodyAlt: '#00aa5c',
    snakeEye: '#0f0e17',
    deathHead: '#ff4757',
    deathBody: '#cc2233',
  },
  fire: {
    snakeHead: '#ff6b35',
    snakeBody: '#e74c3c',
    snakeBodyAlt: '#c0392b',
    snakeEye: '#0f0e17',
    deathHead: '#8b0000',
    deathBody: '#5c0000',
  },
  ice: {
    snakeHead: '#74b9ff',
    snakeBody: '#0984e3',
    snakeBodyAlt: '#0652dd',
    snakeEye: '#0f0e17',
    deathHead: '#636e72',
    deathBody: '#2d3436',
  },
  gold: {
    snakeHead: '#ffd700',
    snakeBody: '#f1c40f',
    snakeBodyAlt: '#d4ac0d',
    snakeEye: '#0f0e17',
    deathHead: '#e67e22',
    deathBody: '#d35400',
  },
  purple: {
    snakeHead: '#e056fd',
    snakeBody: '#be2edd',
    snakeBodyAlt: '#9b59b6',
    snakeEye: '#0f0e17',
    deathHead: '#8e44ad',
    deathBody: '#6c3483',
  },
};

const COLORS = {
  bg: '#1a1a2e',
  grid: '#22223a',
  wall: '#3d3d5c',
  wallHighlight: '#52527a',
  score: '#00ff88',
};

const SEASONS = {
  spring: {
    bg: '#2d3a2d',
    grid: '#3d4a3d',
    wall: '#4a5a4a',
    wallHighlight: '#5e705e',
    deco: ['#ff9ecd', '#ffb7dd', '#7ee08a', '#9cf0a6'],
  },
  summer: {
    bg: '#1a3a4a',
    grid: '#2a4a5a',
    wall: '#3d5a6a',
    wallHighlight: '#4f6f7f',
    deco: ['#ffd93d', '#6bcb77', '#4d96ff', '#ffffff'],
  },
  autumn: {
    bg: '#3d2a1e',
    grid: '#4d3a2e',
    wall: '#5c4638',
    wallHighlight: '#6f5646',
    deco: ['#e67e22', '#d35400', '#c0392b', '#f1c40f'],
  },
  winter: {
    bg: '#1e2a3a',
    grid: '#2e3a4a',
    wall: '#3d4a5a',
    wallHighlight: '#4f5d6f',
    deco: ['#dfe6e9', '#b2bec3', '#74b9ff', '#a29bfe'],
  },
};

export class Renderer {
  constructor(canvas, gridW, gridH) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.gridW = gridW;
    this.gridH = gridH;
    this.cellSize = 0;
    this.offsetX = 0;
    this.offsetY = 0;
    this.skin = 'classic';
    this.season = 'spring';
    this.resize();
  }

  setSkin(skinName) {
    this.skin = skinName;
  }

  getSkinColors() {
    return SKINS[this.skin] || SKINS.classic;
  }

  setSeason(seasonName) {
    this.season = seasonName;
  }

  getSeasonColors() {
    return SEASONS[this.season] || SEASONS.spring;
  }

  resize() {
    const container = this.canvas.parentElement;
    const maxW = Math.min(container.clientWidth - 24, 420);
    const maxH = Math.min(window.innerHeight - 200, 420);
    const maxSize = Math.min(maxW, maxH);
    this.cellSize = Math.floor(maxSize / this.gridW);
    const canvasW = this.cellSize * this.gridW;
    const canvasH = this.cellSize * this.gridH;
    this.canvas.width = canvasW;
    this.canvas.height = canvasH;
    this.canvas.style.width = canvasW + 'px';
    this.canvas.style.height = canvasH + 'px';
    this.ctx.imageSmoothingEnabled = false;
  }

  clear() {
    const colors = this.getSeasonColors();
    this.ctx.fillStyle = colors.bg;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  drawGrid() {
    const colors = this.getSeasonColors();
    this.ctx.fillStyle = colors.grid;
    for (let x = 0; x < this.gridW; x++) {
      for (let y = 0; y < this.gridH; y++) {
        if ((x + y) % 2 === 0) {
          this.ctx.fillRect(
            x * this.cellSize,
            y * this.cellSize,
            this.cellSize,
            this.cellSize
          );
        }
      }
    }
  }

  drawWalls() {
    const cs = this.cellSize;
    const colors = this.getSeasonColors();
    this.ctx.fillStyle = colors.wall;
    this.ctx.fillRect(0, 0, this.canvas.width, cs / 4);
    this.ctx.fillRect(0, this.canvas.height - cs / 4, this.canvas.width, cs / 4);
    this.ctx.fillRect(0, 0, cs / 4, this.canvas.height);
    this.ctx.fillRect(this.canvas.width - cs / 4, 0, cs / 4, this.canvas.height);

    this.ctx.fillStyle = colors.wallHighlight;
    for (let x = 0; x < this.gridW; x++) {
      if (x % 2 === 0) {
        this.ctx.fillRect(x * cs, 0, cs, cs / 4);
        this.ctx.fillRect(x * cs, this.canvas.height - cs / 4, cs, cs / 4);
      }
    }
    for (let y = 0; y < this.gridH; y++) {
      if (y % 2 === 0) {
        this.ctx.fillRect(0, y * cs, cs / 4, cs);
        this.ctx.fillRect(this.canvas.width - cs / 4, y * cs, cs / 4, cs);
      }
    }
  }

  drawSeasonDecorations() {
    const colors = this.getSeasonColors();
    const cs = this.cellSize;
    const deco = colors.deco;
    const ctx = this.ctx;

    for (let x = 0; x < this.gridW; x++) {
      for (let y = 0; y < this.gridH; y++) {
        if ((x * 7 + y * 13) % 23 !== 0) continue;
        if (x === 0 || y === 0 || x === this.gridW - 1 || y === this.gridH - 1) continue;

        const cx = x * cs;
        const cy = y * cs;
        const color = deco[(x + y) % deco.length];
        ctx.fillStyle = color;

        if (this.season === 'spring') {
          ctx.fillRect(cx + cs * 0.25, cy + cs * 0.25, cs * 0.5, cs * 0.5);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(cx + cs * 0.375, cy + cs * 0.375, cs * 0.25, cs * 0.25);
        } else if (this.season === 'summer') {
          ctx.fillRect(cx + cs * 0.3, cy + cs * 0.2, cs * 0.4, cs * 0.6);
          ctx.fillStyle = '#2d6a4f';
          ctx.fillRect(cx + cs * 0.1, cy + cs * 0.6, cs * 0.8, cs * 0.2);
        } else if (this.season === 'autumn') {
          ctx.fillRect(cx + cs * 0.2, cy + cs * 0.3, cs * 0.6, cs * 0.4);
          ctx.fillRect(cx + cs * 0.4, cy + cs * 0.1, cs * 0.2, cs * 0.8);
        } else if (this.season === 'winter') {
          const flake = cs * 0.35;
          ctx.fillRect(cx + cs * 0.5 - flake * 0.5, cy + cs * 0.15, flake, cs * 0.7);
          ctx.fillRect(cx + cs * 0.15, cy + cs * 0.5 - flake * 0.5, cs * 0.7, flake);
        }
      }
    }
  }

  drawSnake(snake) {
    const cs = this.cellSize;
    const pad = Math.max(1, cs * 0.08);
    const skin = this.getSkinColors();

    for (let i = snake.body.length - 1; i >= 0; i--) {
      const seg = snake.body[i];
      const isHead = i === 0;
      const color = isHead
        ? skin.snakeHead
        : i % 2 === 0
          ? skin.snakeBody
          : skin.snakeBodyAlt;

      this.ctx.fillStyle = color;
      this.ctx.fillRect(
        seg.x * cs + pad,
        seg.y * cs + pad,
        cs - pad * 2,
        cs - pad * 2
      );

      if (isHead) {
        this._drawEyes(seg, snake.direction, cs, pad);
      }
    }
  }

  _drawEyes(head, dir, cs, pad) {
    const eyeSize = Math.max(2, cs * 0.18);
    const cx = head.x * cs + cs / 2;
    const cy = head.y * cs + cs / 2;
    let e1x, e1y, e2x, e2y;

    switch (dir) {
      case 'UP':
        e1x = cx - cs * 0.2; e1y = cy - cs * 0.15;
        e2x = cx + cs * 0.2; e2y = cy - cs * 0.15;
        break;
      case 'DOWN':
        e1x = cx - cs * 0.2; e1y = cy + cs * 0.15;
        e2x = cx + cs * 0.2; e2y = cy + cs * 0.15;
        break;
      case 'LEFT':
        e1x = cx - cs * 0.15; e1y = cy - cs * 0.2;
        e2x = cx - cs * 0.15; e2y = cy + cs * 0.2;
        break;
      case 'RIGHT':
        e1x = cx + cs * 0.15; e1y = cy - cs * 0.2;
        e2x = cx + cs * 0.15; e2y = cy + cs * 0.2;
        break;
    }

    const skin = this.getSkinColors();
    this.ctx.fillStyle = skin.snakeEye;
    this.ctx.fillRect(Math.floor(e1x - eyeSize / 2), Math.floor(e1y - eyeSize / 2), eyeSize, eyeSize);
    this.ctx.fillRect(Math.floor(e2x - eyeSize / 2), Math.floor(e2y - eyeSize / 2), eyeSize, eyeSize);
  }

  drawFood(food) {
    const cs = this.cellSize;
    const scale = food.getScale();
    const cx = food.x * cs + cs / 2;
    const cy = food.y * cs + cs / 2;
    const halfSize = (cs * 0.4) * scale;

    this.ctx.fillStyle = food.getColor();
    this.ctx.fillRect(
      Math.floor(cx - halfSize),
      Math.floor(cy - halfSize),
      Math.ceil(halfSize * 2),
      Math.ceil(halfSize * 2)
    );

    this.ctx.fillStyle = food.getHighlightColor();
    const hlSize = halfSize * 0.4;
    this.ctx.fillRect(
      Math.floor(cx - halfSize + 2),
      Math.floor(cy - halfSize + 2),
      Math.ceil(hlSize),
      Math.ceil(hlSize)
    );

    this.ctx.fillStyle = food.getStemColor();
    this.ctx.fillRect(
      Math.floor(cx - 1),
      Math.floor(cy - halfSize - cs * 0.12),
      Math.ceil(cs * 0.12),
      Math.ceil(cs * 0.12)
    );

    if (food.foodType.type === 'golden') {
      this.ctx.fillStyle = '#ffffff';
      this.ctx.globalAlpha = 0.6;
      const sparkleSize = cs * 0.08;
      this.ctx.fillRect(
        Math.floor(cx + halfSize * 0.3 - sparkleSize / 2),
        Math.floor(cy - halfSize * 0.3 - sparkleSize / 2),
        sparkleSize,
        sparkleSize
      );
      this.ctx.globalAlpha = 1;
    }

    if (food.foodType.type === 'speed') {
      this.ctx.fillStyle = '#ffffff';
      this.ctx.globalAlpha = 0.7;
      const boltSize = cs * 0.15;
      this.ctx.fillRect(
        Math.floor(cx - boltSize / 2),
        Math.floor(cy - boltSize * 1.2),
        boltSize,
        boltSize * 2.4
      );
      this.ctx.globalAlpha = 1;
    }

    if (food.foodType.type === 'slow') {
      this.ctx.fillStyle = '#ffffff';
      this.ctx.globalAlpha = 0.7;
      const dotSize = cs * 0.1;
      this.ctx.fillRect(
        Math.floor(cx - dotSize / 2),
        Math.floor(cy - dotSize / 2),
        dotSize,
        dotSize
      );
      this.ctx.globalAlpha = 1;
    }
  }

  drawDeathEffect(snake, progress) {
    const cs = this.cellSize;
    const pad = Math.max(1, cs * 0.08);
    const visibleCount = Math.floor(snake.body.length * (1 - progress));
    const skin = this.getSkinColors();

    for (let i = snake.body.length - 1; i >= 0; i--) {
      if (i >= visibleCount) continue;
      const seg = snake.body[i];
      const alpha = 0.3 + 0.7 * ((visibleCount - i) / visibleCount);
      this.ctx.globalAlpha = alpha;
      this.ctx.fillStyle = i % 2 === 0 ? skin.deathHead : skin.deathBody;
      this.ctx.fillRect(
        seg.x * cs + pad,
        seg.y * cs + pad,
        cs - pad * 2,
        cs - pad * 2
      );
    }
    this.ctx.globalAlpha = 1;
  }
}

export function getSkinList() {
  return Object.keys(SKINS);
}

export function getSeasonList() {
  return Object.keys(SEASONS);
}
