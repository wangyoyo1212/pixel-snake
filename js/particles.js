export class Particle {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    const angle = Math.random() * Math.PI * 2;
    const speed = 40 + Math.random() * 80;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.life = 0.4 + Math.random() * 0.3;
    this.maxLife = this.life;
    this.size = 2 + Math.random() * 3;
    this.color = color;
  }

  update(dt) {
    const sec = dt / 1000;
    this.x += this.vx * sec;
    this.y += this.vy * sec;
    this.vy += 120 * sec;
    this.life -= sec;
  }

  isDead() {
    return this.life <= 0;
  }

  draw(ctx) {
    const alpha = Math.max(0, this.life / this.maxLife);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = this.color;
    const s = this.size * alpha;
    ctx.fillRect(Math.floor(this.x - s / 2), Math.floor(this.y - s / 2), Math.ceil(s), Math.ceil(s));
    ctx.globalAlpha = 1;
  }
}

export class ParticleSystem {
  constructor() {
    this.particles = [];
  }

  emit(x, y, color, count) {
    for (let i = 0; i < count; i++) {
      this.particles.push(new Particle(x, y, color));
    }
  }

  update(dt) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      this.particles[i].update(dt);
      if (this.particles[i].isDead()) {
        this.particles.splice(i, 1);
      }
    }
  }

  draw(ctx) {
    for (const p of this.particles) {
      p.draw(ctx);
    }
  }

  clear() {
    this.particles = [];
  }
}
