export const FOOD_TYPES = [
  {
    type: 'apple',
    color: '#ff4757',
    highlight: '#ff6b7a',
    stemColor: '#2ecc71',
    score: 10,
    grow: 1,
    chance: 0.5,
    particleColor: '#ff4757',
  },
  {
    type: 'golden',
    color: '#ffd700',
    highlight: '#ffec8b',
    stemColor: '#e67e22',
    score: 30,
    grow: 2,
    chance: 0.15,
    particleColor: '#ffd700',
  },
  {
    type: 'speed',
    color: '#00d2ff',
    highlight: '#7ee8ff',
    stemColor: '#0099cc',
    score: 15,
    grow: 1,
    chance: 0.2,
    particleColor: '#00d2ff',
    effect: 'speed',
  },
  {
    type: 'slow',
    color: '#a29bfe',
    highlight: '#c4bffd',
    stemColor: '#6c5ce7',
    score: 5,
    grow: 1,
    chance: 0.15,
    particleColor: '#a29bfe',
    effect: 'slow',
  },
];

export class Food {
  constructor(gridW, gridH) {
    this.gridW = gridW;
    this.gridH = gridH;
    this.x = 0;
    this.y = 0;
    this.animTimer = 0;
    this.foodType = FOOD_TYPES[0];
  }

  _pickType() {
    const rand = Math.random();
    let cumulative = 0;
    for (const ft of FOOD_TYPES) {
      cumulative += ft.chance;
      if (rand <= cumulative) {
        return ft;
      }
    }
    return FOOD_TYPES[0];
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
    this.foodType = this._pickType();
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

  getScore() {
    return this.foodType.score;
  }

  getGrowAmount() {
    return this.foodType.grow;
  }

  getEffect() {
    return this.foodType.effect || null;
  }

  getColor() {
    return this.foodType.color;
  }

  getHighlightColor() {
    return this.foodType.highlight;
  }

  getStemColor() {
    return this.foodType.stemColor;
  }

  getParticleColor() {
    return this.foodType.particleColor;
  }
}
