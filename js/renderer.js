const COLORS = {
  bg: '#1a1a2e',
  grid: '#22223a',
  wall: '#3d3d5c',
  wallHighlight: '#52527a',
  snakeHead: '#00ff88',
  snakeBody: '#00cc6e',
  snakeBodyAlt: '#00aa5c',
  snakeEye: '#0f0e17',
  food: '#ff4757',
  foodHighlight: '#ff6b7a',
  score: '#00ff88',
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
    this.resize();
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
    this.ctx.fillStyle = COLORS.bg;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  drawGrid() {
    this.ctx.fillStyle = COLORS.grid;
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
    this.ctx.fillStyle = COLORS.wall;
    this.ctx.fillRect(0, 0, this.canvas.width, cs / 4);
    this.ctx.fillRect(0, this.canvas.height - cs / 4, this.canvas.width, cs / 4);
    this.ctx.fillRect(0, 0, cs / 4, this.canvas.height);
    this.ctx.fillRect(this.canvas.width - cs / 4, 0, cs / 4, this.canvas.height);

    this.ctx.fillStyle = COLORS.wallHighlight;
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

  drawSnake(snake) {
    const cs = this.cellSize;
    const pad = Math.max(1, cs * 0.08);

    for (let i = snake.body.length - 1; i >= 0; i--) {
      const seg = snake.body[i];
      const isHead = i === 0;
      const color = isHead
        ? COLORS.snakeHead
        : i % 2 === 0
          ? COLORS.snakeBody
          : COLORS.snakeBodyAlt;

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

    this.ctx.fillStyle = COLORS.snakeEye;
    this.ctx.fillRect(Math.floor(e1x - eyeSize / 2), Math.floor(e1y - eyeSize / 2), eyeSize, eyeSize);
    this.ctx.fillRect(Math.floor(e2x - eyeSize / 2), Math.floor(e2y - eyeSize / 2), eyeSize, eyeSize);
  }

  drawFood(food) {
    const cs = this.cellSize;
    const scale = food.getScale();
    const cx = food.x * cs + cs / 2;
    const cy = food.y * cs + cs / 2;
    const halfSize = (cs * 0.4) * scale;

    this.ctx.fillStyle = COLORS.food;
    this.ctx.fillRect(
      Math.floor(cx - halfSize),
      Math.floor(cy - halfSize),
      Math.ceil(halfSize * 2),
      Math.ceil(halfSize * 2)
    );

    this.ctx.fillStyle = COLORS.foodHighlight;
    const hlSize = halfSize * 0.4;
    this.ctx.fillRect(
      Math.floor(cx - halfSize + 2),
      Math.floor(cy - halfSize + 2),
      Math.ceil(hlSize),
      Math.ceil(hlSize)
    );

    this.ctx.fillStyle = '#2ecc71';
    this.ctx.fillRect(
      Math.floor(cx - 1),
      Math.floor(cy - halfSize - cs * 0.12),
      Math.ceil(cs * 0.12),
      Math.ceil(cs * 0.12)
    );
  }

  drawDeathEffect(snake, progress) {
    const cs = this.cellSize;
    const pad = Math.max(1, cs * 0.08);
    const visibleCount = Math.floor(snake.body.length * (1 - progress));

    for (let i = snake.body.length - 1; i >= 0; i--) {
      if (i >= visibleCount) continue;
      const seg = snake.body[i];
      const alpha = 0.3 + 0.7 * ((visibleCount - i) / visibleCount);
      this.ctx.globalAlpha = alpha;
      this.ctx.fillStyle = i % 2 === 0 ? '#ff4757' : '#cc2233';
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
