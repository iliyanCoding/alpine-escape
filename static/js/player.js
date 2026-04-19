import { GAME } from "./config.js";

class Player {
  constructor(image) {
    this.image = image;
    this.x = GAME.CANVAS_WIDTH / 2 - 16;
    this.y = GAME.CANVAS_HEIGHT / 9;
    this.width = GAME.TILE_SIZE;
    this.height = GAME.TILE_SIZE;
    this.speed = 0.25;
    this.xVelocity = 0;
    this.friction = 0.97;
    this.hp = 3;
    this.hitCooldown = 0;
    this.frame = 70;
    this.animTimer = 0;
    this.animSpeed = 20;

    this.holdTimer = 0;
    this.particles = [];
    this.shakeTimer = 0;
    this.shakeIntensity = 3;
    this.onTrack = false;
    this.prevDirection = 0;
    this.lean = 0;
    this.invincible = false;
  }

  reset() {
    this.x = GAME.CANVAS_WIDTH / 2 - 16;
    this.y = GAME.CANVAS_HEIGHT / 9;
    this.xVelocity = 0;
    this.hp = 3;
    this.hitCooldown = 0;
    this.holdTimer = 0;
    this.particles = [];
    this.shakeTimer = 0;
    this.lean = 0;
    this.prevDirection = 0;
    this.invincible = false;
  }

  update(moveLeft, moveRight, scrollSpeed) {
    if (this.hitCooldown > 0) this.hitCooldown--;
    if (this.shakeTimer > 0) this.shakeTimer--;

    this.animSpeed = Math.floor(20 * (GAME.SCROLL_SPEED / scrollSpeed));

    // going faster = harder to turn
    const steerFactor = GAME.SCROLL_SPEED / scrollSpeed;

    if (moveLeft || moveRight) {
      this.holdTimer = Math.min(this.holdTimer + 1, 60);
    } else {
      this.holdTimer = 0;
    }
    const ramp = 1 + this.holdTimer / 120;
    const currentSpeed = this.speed * steerFactor * ramp;

    if (moveLeft) this.xVelocity -= currentSpeed;
    if (moveRight) this.xVelocity += currentSpeed;

    if (this.onTrack) {
      this.xVelocity *= 0.98;
    } else {
      this.xVelocity *= 0.88;
    }

    const currentDirection = Math.sign(this.xVelocity);
    if (currentDirection !== 0 && currentDirection !== this.prevDirection) {
      this.lean = this.xVelocity * 0.15;
    } else {
      this.lean *= 0.9;
    }
    this.prevDirection = currentDirection;

    const maxSpeed = 3;
    if (this.xVelocity > maxSpeed) this.xVelocity = maxSpeed;
    if (this.xVelocity < -maxSpeed) this.xVelocity = -maxSpeed;

    this.x += this.xVelocity;

    if (this.x < 0) {
      this.x = 0;
      this.xVelocity *= -0.5;
    } else if (this.x + this.width > GAME.CANVAS_WIDTH) {
      this.x = GAME.CANVAS_WIDTH - this.width;
      this.xVelocity *= -0.5;
    }

    if (this.y < 0) {
      this.y = 0;
    } else if (this.y > 2 * GAME.CANVAS_HEIGHT / 3) {
      this.y = 2 * GAME.CANVAS_HEIGHT / 3;
    }

    if (Math.abs(this.xVelocity) > 0.3) {
      this.particles.push({
        x: this.x + this.width / 2,
        y: this.y + this.height,
        life: 30,
        dx: (Math.random() - 0.5) * 0.5,
        dy: -Math.random() * 1.5
      });
    }

    for (let i = this.particles.length - 1; i >= 0; i--) {
      this.particles[i].life--;
      this.particles[i].x += this.particles[i].dx;
      this.particles[i].y += this.particles[i].dy;
      if (this.particles[i].life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  hit() {
    this.shakeTimer = 15;
  }

  draw(ctx) {
    this.animTimer++;
    if (this.animTimer >= this.animSpeed) {
      this.frame = this.frame === 70 ? 71 : 70;
      this.animTimer = 0;
    }

    let shakeX = 0;
    let shakeY = 0;
    if (this.shakeTimer > 0) {
      shakeX = (Math.random() - 0.5) * this.shakeIntensity * 2;
      shakeY = (Math.random() - 0.5) * this.shakeIntensity * 2;
    }

    for (const p of this.particles) {
      const alpha = p.life / 30;
      ctx.fillStyle = "rgba(255, 255, 255, " + alpha + ")";
      ctx.fillRect(p.x + shakeX, p.y + shakeY, 3, 3);
    }

    if (this.hitCooldown > 0 && Math.floor(this.hitCooldown / 4) % 2 === 0) {
      return;
    }

    const srcX = (this.frame % GAME.TILES_PER_ROW) * GAME.TILE_SIZE;
    const srcY = Math.floor(this.frame / GAME.TILES_PER_ROW) * GAME.TILE_SIZE;

    ctx.save();
    ctx.translate(this.x + this.width / 2 + shakeX, this.y + this.height / 2 + shakeY);
    ctx.rotate(this.lean);

    // Glow via canvas shadow: https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/shadowBlur
    if (this.invincible) {
      ctx.shadowColor = "gold";
      ctx.shadowBlur = 15;
    }

    ctx.drawImage(
      this.image,
      srcX, srcY, GAME.TILE_SIZE, GAME.TILE_SIZE,
      -this.width / 2, -this.height / 2, this.width, this.height
    );
    ctx.restore();
  }
}

export { Player };
