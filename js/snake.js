const OPPOSITE = {
  UP: 'DOWN',
  DOWN: 'UP',
  LEFT: 'RIGHT',
  RIGHT: 'LEFT',
};

export class Snake {
  constructor(gridW, gridH) {
    this.gridW = gridW;
    this.gridH = gridH;
    this.reset();
  }

  reset() {
    const cx = Math.floor(this.gridW / 2);
    const cy = Math.floor(this.gridH / 2);
    this.body = [
      { x: cx, y: cy },
      { x: cx - 1, y: cy },
      { x: cx - 2, y: cy },
    ];
    this.direction = 'RIGHT';
    this.nextDirection = 'RIGHT';
    this.growing = false;
  }

  setDirection(dir) {
    if (dir !== OPPOSITE[this.direction]) {
      this.nextDirection = dir;
    }
  }

  move() {
    this.direction = this.nextDirection;
    const head = { ...this.body[0] };

    switch (this.direction) {
      case 'UP':    head.y -= 1; break;
      case 'DOWN':  head.y += 1; break;
      case 'LEFT':  head.x -= 1; break;
      case 'RIGHT': head.x += 1; break;
    }

    this.body.unshift(head);
    if (this.growing) {
      this.growing = false;
    } else {
      this.body.pop();
    }
  }

  grow() {
    this.growing = true;
  }

  getHead() {
    return this.body[0];
  }

  isOutOfBounds() {
    const h = this.getHead();
    return h.x < 0 || h.x >= this.gridW || h.y < 0 || h.y >= this.gridH;
  }

  isSelfCollision() {
    const h = this.getHead();
    for (let i = 1; i < this.body.length; i++) {
      if (this.body[i].x === h.x && this.body[i].y === h.y) {
        return true;
      }
    }
    return false;
  }

  occupies(x, y) {
    return this.body.some(seg => seg.x === x && seg.y === y);
  }

  getOccupiedSet() {
    return new Set(this.body.map(s => `${s.x},${s.y}`));
  }
}
