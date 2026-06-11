export class Food {
  constructor(gridW, gridH) {
    this.gridW = gridW;
    this.gridH = gridH;
    this.x = 0;
    this.y = 0;
    this.animTimer = 0;
  }

  spawn(occupiedSet) {
    const free = [];
    for (let x = 0; x < this.gridW; x++) {
      for (let y = 0; y < this.gridH; y++) {
        if (!occupiedSet.has(`${x},${y}`)) {
          free.push({ x, y });
        }
      }
    }
    if (free.length === 0) return false;
    const pos = free[Math.floor(Math.random() * free.length)];
    this.x = pos.x;
    this.y = pos.y;
    this.animTimer = 0;
    return true;
  }

  isAt(x, y) {
    return this.x === x && this.y === y;
  }

  update(dt) {
    this.animTimer += dt;
  }

  getScale() {
    const t = this.animTimer % 600;
    if (t < 150) return 1 + 0.15 * (t / 150);
    if (t < 300) return 1.15 - 0.15 * ((t - 150) / 150);
    return 1;
  }
}
