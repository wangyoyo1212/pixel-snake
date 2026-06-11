export class InputHandler {
  constructor() {
    this.directionCallback = null;
    this.actionCallback = null;
    this._onKeyDown = this._onKeyDown.bind(this);
    this._onTouchStart = this._onTouchStart.bind(this);
    this._onTouchEnd = this._onTouchEnd.bind(this);
    this.touchStartX = 0;
    this.touchStartY = 0;
    this.enabled = false;
  }

  enable() {
    if (this.enabled) return;
    this.enabled = true;
    document.addEventListener('keydown', this._onKeyDown);
    this.canvas = document.getElementById('game-canvas');
    if (this.canvas) {
      this.canvas.addEventListener('touchstart', this._onTouchStart, { passive: false });
      this.canvas.addEventListener('touchend', this._onTouchEnd, { passive: false });
    }
    this._bindTouchButtons();
  }

  disable() {
    this.enabled = false;
    document.removeEventListener('keydown', this._onKeyDown);
    if (this.canvas) {
      this.canvas.removeEventListener('touchstart', this._onTouchStart);
      this.canvas.removeEventListener('touchend', this._onTouchEnd);
    }
  }

  onDirection(cb) {
    this.directionCallback = cb;
  }

  onAction(cb) {
    this.actionCallback = cb;
  }

  _onKeyDown(e) {
    const key = e.key;
    let dir = null;
    let action = null;

    switch (key) {
      case 'ArrowUp': case 'w': case 'W': dir = 'UP'; break;
      case 'ArrowDown': case 's': case 'S': dir = 'DOWN'; break;
      case 'ArrowLeft': case 'a': case 'A': dir = 'LEFT'; break;
      case 'ArrowRight': case 'd': case 'D': dir = 'RIGHT'; break;
      case ' ': action = 'PAUSE'; break;
      case 'r': case 'R': action = 'RESTART'; break;
      case 'm': case 'M': action = 'MUTE'; break;
      case 'Enter': action = 'START'; break;
    }

    if (dir) {
      e.preventDefault();
      if (this.directionCallback) this.directionCallback(dir);
    }
    if (action) {
      e.preventDefault();
      if (this.actionCallback) this.actionCallback(action);
    }
  }

  _onTouchStart(e) {
    if (e.touches.length === 1) {
      this.touchStartX = e.touches[0].clientX;
      this.touchStartY = e.touches[0].clientY;
    }
  }

  _onTouchEnd(e) {
    const touch = e.changedTouches[0];
    const dx = touch.clientX - this.touchStartX;
    const dy = touch.clientY - this.touchStartY;
    const minSwipe = 20;

    if (Math.abs(dx) < minSwipe && Math.abs(dy) < minSwipe) return;

    e.preventDefault();

    if (Math.abs(dx) > Math.abs(dy)) {
      if (this.directionCallback) this.directionCallback(dx > 0 ? 'RIGHT' : 'LEFT');
    } else {
      if (this.directionCallback) this.directionCallback(dy > 0 ? 'DOWN' : 'UP');
    }
  }

  _bindTouchButtons() {
    const btns = document.querySelectorAll('.touch-btn');
    btns.forEach(btn => {
      const dir = btn.dataset.dir;
      btn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        if (this.directionCallback) this.directionCallback(dir);
      });
      btn.addEventListener('mousedown', (e) => {
        e.preventDefault();
        if (this.directionCallback) this.directionCallback(dir);
      });
    });
  }
}
