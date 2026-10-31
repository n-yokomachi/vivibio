// glitch のロケット。発射・移動・排気の粒子・描画を持つ。canvas とループは使う側が持つ。

export type RGB = readonly [number, number, number];

export type RocketColors = {
  flame: readonly [string, string, string, string]; // 噴射口に近い順
  core: string;
  fin: string;
  body: string;
  belly: string;
  nose: string;
  port: string;
  portInner: string;
  band: string;
  exhaustFrom: RGB; // 出たばかりの排気
  exhaustTo: RGB; // 冷えた排気
};

export const ROCKET_DARK: RocketColors = {
  flame: ['#fff', '#ffd200', '#ff5733', '#ff2d8d'],
  core: '#fff',
  fin: '#ff2d8d',
  body: '#16f0ff',
  belly: 'rgba(255,255,255,0.65)',
  nose: '#fff',
  port: '#ffd200',
  portInner: '#07010d',
  band: 'rgba(7,1,13,0.5)',
  exhaustFrom: [255, 45, 141],
  exhaustTo: [22, 240, 255],
};

// 白い部分を背景 #fafafa に負けない色に替えたもの
export const ROCKET_LIGHT: RocketColors = {
  flame: ['#ff8a00', '#ffb000', '#ff5733', '#d4237a'],
  core: '#ff8a00',
  fin: '#d4237a',
  body: '#0fb8c9',
  belly: 'rgba(0,0,0,0.15)',
  nose: '#333',
  port: '#ffb000',
  portInner: '#07010d',
  band: 'rgba(7,1,13,0.5)',
  exhaustFrom: [212, 35, 122],
  exhaustTo: [15, 150, 170],
};

export const ROCKET_RADIUS = 110;

export type Pushable = { x: number; y: number; vx: number; vy: number };
type Exhaust = Pushable & { r: number; ttl: number; maxTtl: number };

const MAX_EXHAUST = 1950;
const FADE_FRAMES = 90;

export type Rocket = ReturnType<typeof createRocket>;

export function createRocket() {
  let active = false;
  let x = -100;
  let y = 0;
  let vx = 0;
  let vy = 0;
  let nextLaunchAt = Infinity;
  const exhaust: Exhaust[] = [];

  function launch(w: number, h: number) {
    active = true;
    // 画面の外 50px の4辺のどれかから出す
    const side = Math.floor(Math.random() * 4);
    let sx = 0;
    let sy = 0;
    if (side === 0) { sx = Math.random() * w; sy = -50; }
    else if (side === 1) { sx = w + 50; sy = Math.random() * h; }
    else if (side === 2) { sx = Math.random() * w; sy = h + 50; }
    else { sx = -50; sy = Math.random() * h; }
    x = sx;
    y = sy;
    const targetX = w - sx + (Math.random() - 0.5) * w * 0.5;
    const targetY = h - sy + (Math.random() - 0.5) * h * 0.5;
    const dx = targetX - sx;
    const dy = targetY - sy;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
    // 狭い画面では横切る時間が同じくらいになるよう遅くする
    const speed = w < 700 ? 1.8 + Math.random() * 1.0 : 2.5 + Math.random() * 1.0;
    vx = (dx / dist) * speed;
    vy = (dy / dist) * speed;
  }

  // now + delayMs 以降の update() で発射し、その後は 7〜13 秒ごとに発射する
  function armLaunch(now: number, delayMs: number) {
    nextLaunchAt = now + delayMs;
  }

  function repel(p: Pushable) {
    if (!active) return;
    const dx = p.x - x;
    const dy = p.y - y;
    const d2 = dx * dx + dy * dy;
    if (d2 < ROCKET_RADIUS * ROCKET_RADIUS && d2 > 1) {
      const d = Math.sqrt(d2);
      const force = 1.6 * (1 - d / ROCKET_RADIUS);
      p.vx += (dx / d) * force;
      p.vy += (dy / d) * force;
    }
  }

  function spawnExhaust(w: number, h: number) {
    const speed = Math.sqrt(vx * vx + vy * vy) || 1;
    const ux = vx / speed;
    const uy = vy / speed;
    const perpX = -uy;
    const perpY = ux;
    for (let n = 0; n < 2; n++) {
      // 上限では寿命が最も短い排気を消して場所を空ける
      if (exhaust.length >= MAX_EXHAUST) {
        let minIdx = 0;
        for (let i = 1; i < exhaust.length; i++) {
          if (exhaust[i].ttl < exhaust[minIdx].ttl) minIdx = i;
        }
        exhaust.splice(minIdx, 1);
      }
      const back = 24 + Math.random() * 90;
      const halfWidth = back * 0.22;
      const side = (Math.random() - 0.5) * 2 * halfWidth;
      const radialSign = side >= 0 ? 1 : -1;
      const radial = 0.35 + Math.random() * 0.6;
      const fwd = -0.25 - Math.random() * 0.35;
      const px = x - ux * back + perpX * side;
      const py = y - uy * back + perpY * side;
      if (px < -40 || px > w + 40 || py < -40 || py > h + 40) continue;
      const maxTtl = 1080 + Math.floor(Math.random() * 600);
      exhaust.push({
        x: px,
        y: py,
        vx: ux * fwd + perpX * radial * radialSign,
        vy: uy * fwd + perpY * radial * radialSign,
        r: Math.random() * 1.4 + 0.4,
        ttl: maxTtl,
        maxTtl,
      });
    }
  }

  function update(w: number, h: number, now: number) {
    if (now >= nextLaunchAt) {
      if (!active && w > 0 && h > 0) launch(w, h);
      nextLaunchAt = now + 7000 + Math.random() * 6000;
    }
    if (active) {
      x += vx;
      y += vy;
      if (x < -100 || x > w + 100 || y < -100 || y > h + 100) {
        active = false;
      } else {
        spawnExhaust(w, h);
      }
    }
    for (let i = exhaust.length - 1; i >= 0; i--) {
      const p = exhaust[i];
      p.ttl--;
      if (p.ttl <= 0) {
        exhaust.splice(i, 1);
        continue;
      }
      repel(p);
      p.vx *= 0.992;
      p.vy *= 0.992;
      p.vx += (Math.random() - 0.5) * 0.02;
      p.vy += (Math.random() - 0.5) * 0.02;
      const v = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
      if (v > 4) {
        p.vx = (p.vx / v) * 4;
        p.vy = (p.vy / v) * 4;
      }
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < -120 || p.x > w + 120 || p.y < -120 || p.y > h + 120) exhaust.splice(i, 1);
    }
  }

  function drawExhaust(ctx: CanvasRenderingContext2D, c: RocketColors) {
    for (const p of exhaust) {
      // 時間とともに exhaustFrom から exhaustTo へ冷え、最後の FADE_FRAMES で消える
      let alpha = 0.7;
      let [cr, cg, cb] = c.exhaustFrom;
      const age = 1 - p.ttl / p.maxTtl;
      if (age > 0.15) {
        const t = Math.min(1, (age - 0.15) / 0.45);
        const eased = t * t * (3 - 2 * t);
        cr = Math.round(c.exhaustFrom[0] + (c.exhaustTo[0] - c.exhaustFrom[0]) * eased);
        cg = Math.round(c.exhaustFrom[1] + (c.exhaustTo[1] - c.exhaustFrom[1]) * eased);
        cb = Math.round(c.exhaustFrom[2] + (c.exhaustTo[2] - c.exhaustFrom[2]) * eased);
      }
      if (p.ttl < FADE_FRAMES) alpha *= p.ttl / FADE_FRAMES;
      ctx.fillStyle = `rgb(${cr},${cg},${cb})`;
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawBody(ctx: CanvasRenderingContext2D, c: RocketColors) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(Math.atan2(vy, vx));

    const FLAME_LEN = 36;
    for (let i = 0; i < FLAME_LEN; i++) {
      const t = i / FLAME_LEN;
      const tx = -i * 3.2 + (Math.random() - 0.5) * 2.5;
      const ty = (Math.random() - 0.5) * (3 + i * 0.32);
      const tr = Math.max(0.4, 5.5 - i * 0.13);
      ctx.fillStyle = i < 3 ? c.flame[0] : i < 9 ? c.flame[1] : i < 18 ? c.flame[2] : c.flame[3];
      ctx.globalAlpha = Math.max(0, 0.95 - t * 0.92);
      ctx.beginPath();
      ctx.arc(tx, ty, tr, 0, Math.PI * 2);
      ctx.fill();
    }
    for (let i = 0; i < 8; i++) {
      ctx.fillStyle = c.core;
      ctx.globalAlpha = 0.6 + Math.random() * 0.4;
      ctx.beginPath();
      ctx.arc(-2 + (Math.random() - 0.5) * 4, (Math.random() - 0.5) * 6, 1.5 + Math.random() * 2, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalAlpha = 1;
    ctx.fillStyle = c.fin;
    ctx.beginPath();
    ctx.moveTo(0, -3);
    ctx.lineTo(-6, -7);
    ctx.lineTo(4, -3);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(0, 3);
    ctx.lineTo(-6, 7);
    ctx.lineTo(4, 3);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = c.body;
    ctx.fillRect(0, -3, 16, 6);
    ctx.fillStyle = c.belly;
    ctx.fillRect(0, 1, 16, 2);
    ctx.fillStyle = c.nose;
    ctx.beginPath();
    ctx.moveTo(16, -3);
    ctx.lineTo(24, 0);
    ctx.lineTo(16, 3);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = c.port;
    ctx.beginPath();
    ctx.arc(11, -0.5, 1.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = c.portInner;
    ctx.beginPath();
    ctx.arc(11, -0.5, 0.7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = c.band;
    ctx.fillRect(5, -3, 1, 6);

    ctx.restore();
  }

  function draw(ctx: CanvasRenderingContext2D, c: RocketColors) {
    drawExhaust(ctx, c);
    if (active) drawBody(ctx, c);
    ctx.globalAlpha = 1;
  }

  function reset() {
    active = false;
    exhaust.length = 0;
    nextLaunchAt = Infinity;
  }

  return {
    get active() { return active; },
    get x() { return x; },
    get y() { return y; },
    launch,
    armLaunch,
    update,
    repel,
    draw,
    reset,
  };
}
