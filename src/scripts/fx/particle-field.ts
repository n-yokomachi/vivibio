// particle テーマの星と粒子。カーソルへの反応・文字の形に集める処理・押しのけ・描画を持つ。
// canvas とループは使う側が持つ。

export type RGB = readonly [number, number, number];

export type FieldColors = {
  star: RGB;
  starLink: RGB;
  palette: readonly RGB[]; // 6色。粒子は番号で持つ
  particleLink: RGB;
  swarmHalo: RGB;
  swarmCore: RGB;
};

export const FIELD_DARK: FieldColors = {
  star: [255, 255, 255],
  starLink: [180, 220, 255],
  palette: [
    [200, 230, 255],
    [200, 230, 255],
    [200, 230, 255],
    [180, 200, 255],
    [200, 180, 240],
    [240, 180, 220],
  ],
  particleLink: [120, 180, 240],
  swarmHalo: [126, 200, 255],
  swarmCore: [226, 239, 255],
};

// 背景 #fafafa で見えるように明るい色を濃い色に替えたもの
export const FIELD_LIGHT: FieldColors = {
  star: [40, 50, 70],
  starLink: [60, 90, 140],
  palette: [
    [40, 90, 160],
    [40, 90, 160],
    [40, 90, 160],
    [60, 70, 170],
    [110, 60, 160],
    [170, 60, 120],
  ],
  particleLink: [40, 80, 140],
  swarmHalo: [40, 110, 190],
  swarmCore: [20, 60, 120],
};

type Star = { x: number; y: number; vx: number; vy: number; r: number; phase: number; sparkleT: number };
type Particle = { x: number; y: number; vx: number; vy: number; r: number; phase: number; tint: number };
type SwarmDot = {
  x: number; y: number; tx: number; ty: number; vx: number; vy: number;
  alpha: number; r: number;
  state: 0 | 1 | 2; // 0: 集合中、1: 拡散中、2: 消滅
};

const STAR_COUNT = 100;
const SPARKLE_FRAMES = 36;
const SPARKLE_TRIGGER = 0.0009;
const STAR_MAX_V = 0.18;
const STAR_BROWNIAN = 0.006;
const MOUSE_REPEL_RADIUS = 100;
const MOUSE_REPEL_FORCE = 0.4;
const STAR_LINK_DIST = 130;
const LINK_DIST = 55;

const rgba = (c: RGB, a: number) => `rgba(${c[0]}, ${c[1]}, ${c[2]}, ${a})`;

export type ParticleField = ReturnType<typeof createParticleField>;

export function createParticleField() {
  let w = 0;
  let h = 0;
  let lastW = -1;
  let t = 0;
  const stars: Star[] = [];
  const particles: Particle[] = [];
  const swarm: SwarmDot[] = [];
  let swarmText = '';
  const mouse = { x: -9999, y: -9999, active: false };
  const pushes: Array<{ x: number; y: number; r: number }> = [];

  const offCanvas = document.createElement('canvas');
  const offCtx = offCanvas.getContext('2d', { willReadFrequently: true });

  function spawnStars() {
    stars.length = 0;
    for (let i = 0; i < STAR_COUNT; i++) {
      stars.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.12,
        vy: (Math.random() - 0.5) * 0.12,
        r: Math.random() * 0.7 + 0.3,
        phase: Math.random() * Math.PI * 2,
        sparkleT: 0,
      });
    }
  }

  function spawnParticles() {
    const n = Math.floor((w * h) / 1800);
    particles.length = 0;
    for (let i = 0; i < n; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.18,
        vy: (Math.random() - 0.5) * 0.18,
        r: Math.random() * 1.1 + 0.3,
        phase: Math.random() * Math.PI * 2,
        tint: Math.floor(Math.random() * 6),
      });
    }
  }

  // 幅が 60px を超えて変わったときだけ作り直す（モバイルの URL バーの開閉で高さだけ変わるため）
  function resize(nw: number, nh: number) {
    w = nw;
    h = nh;
    if (lastW < 0 || Math.abs(w - lastW) > 60) {
      lastW = w;
      spawnStars();
      spawnParticles();
    }
  }

  function setPointer(x: number, y: number) {
    mouse.x = x;
    mouse.y = y;
    mouse.active = true;
  }

  function clearPointer() {
    mouse.active = false;
  }

  function swarmTo(rawText: string) {
    if (!offCtx) return;
    const text = rawText.toUpperCase();
    if (text === swarmText) return;
    swarmText = text;

    const isNarrow = w < 640;
    const maxWidth = Math.min(w * 0.85, 700);
    let fontSize = isNarrow ? 56 : 110;
    offCtx.font = `900 ${fontSize}px 'Inter', 'Helvetica Neue', sans-serif`;
    while (offCtx.measureText(text).width > maxWidth && fontSize > 22) {
      fontSize -= 4;
      offCtx.font = `900 ${fontSize}px 'Inter', 'Helvetica Neue', sans-serif`;
    }

    const tw = Math.ceil(offCtx.measureText(text).width) + 20;
    const th = Math.ceil(fontSize * 1.3);
    offCanvas.width = tw;
    offCanvas.height = th;
    offCtx.font = `900 ${fontSize}px 'Inter', 'Helvetica Neue', sans-serif`;
    offCtx.fillStyle = '#fff';
    offCtx.textBaseline = 'middle';
    offCtx.textAlign = 'left';
    offCtx.fillText(text, 10, th / 2);

    const sampleStep = isNarrow ? 2 : 3;
    const data = offCtx.getImageData(0, 0, tw, th).data;
    const targets: Array<[number, number]> = [];
    for (let yy = 0; yy < th; yy += sampleStep) {
      for (let xx = 0; xx < tw; xx += sampleStep) {
        if (data[(yy * tw + xx) * 4 + 3] > 128) {
          targets.push([w / 2 - tw / 2 + xx, h / 2 - th / 2 + yy]);
        }
      }
    }
    if (targets.length === 0) {
      swarm.length = 0;
      return;
    }

    const desired = Math.min(targets.length, isNarrow ? 2400 : 4000);
    for (let i = 0; i < Math.min(swarm.length, desired); i++) {
      const tg = targets[Math.floor(Math.random() * targets.length)];
      swarm[i].tx = tg[0];
      swarm[i].ty = tg[1];
      swarm[i].state = 0;
    }
    while (swarm.length < desired) {
      const tg = targets[Math.floor(Math.random() * targets.length)];
      swarm.push({
        x: Math.random() * w,
        y: Math.random() * h,
        tx: tg[0],
        ty: tg[1],
        vx: 0,
        vy: 0,
        alpha: 0,
        r: 0.45 + Math.random() * 0.35,
        state: 0,
      });
    }
    for (let i = desired; i < swarm.length; i++) {
      if (swarm[i].state === 0) swarm[i].state = 1;
    }
  }

  function scatter() {
    swarmText = '';
    for (const d of swarm) {
      if (d.state === 2) continue;
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random() * 2.5;
      d.vx = Math.cos(angle) * speed;
      d.vy = Math.sin(angle) * speed;
      d.state = 1;
    }
  }

  function clearSwarm() {
    swarm.length = 0;
    swarmText = '';
  }

  // 次の update() で、(x, y) から半径 r の粒子を押しのける
  function repel(x: number, y: number, r: number) {
    pushes.push({ x, y, r });
  }

  function update() {
    t += 0.008;

    for (const s of stars) {
      s.vx += (Math.random() - 0.5) * STAR_BROWNIAN;
      s.vy += (Math.random() - 0.5) * STAR_BROWNIAN;
      const sv = Math.hypot(s.vx, s.vy);
      if (sv > STAR_MAX_V) {
        s.vx = (s.vx / sv) * STAR_MAX_V;
        s.vy = (s.vy / sv) * STAR_MAX_V;
      }
      s.x += s.vx;
      s.y += s.vy;
      if (s.x < 0) s.x += w;
      if (s.x > w) s.x -= w;
      if (s.y < 0) s.y += h;
      if (s.y > h) s.y -= h;
      if (s.sparkleT === 0 && Math.random() < SPARKLE_TRIGGER) s.sparkleT = SPARKLE_FRAMES;
      else if (s.sparkleT > 0) s.sparkleT--;
    }

    const cx = w / 2;
    const cy = h * 0.42;
    for (const p of particles) {
      const dx = cx - p.x;
      const dy = cy - p.y;
      const d = Math.hypot(dx, dy) + 0.1;
      p.vx += (dx / d) * 0.0015;
      p.vy += (dy / d) * 0.0015;

      if (mouse.active) {
        const mdx = p.x - mouse.x;
        const mdy = p.y - mouse.y;
        const md = Math.hypot(mdx, mdy);
        if (md < MOUSE_REPEL_RADIUS && md > 0.1) {
          p.vx += (mdx / md) * MOUSE_REPEL_FORCE * (1 - md / MOUSE_REPEL_RADIUS);
          p.vy += (mdy / md) * MOUSE_REPEL_FORCE * (1 - md / MOUSE_REPEL_RADIUS);
        }
      }
      for (const q of pushes) {
        const qx = p.x - q.x;
        const qy = p.y - q.y;
        const q2 = qx * qx + qy * qy;
        if (q2 < q.r * q.r && q2 > 1) {
          const qd = Math.sqrt(q2);
          const force = 1.6 * (1 - qd / q.r);
          p.vx += (qx / qd) * force;
          p.vy += (qy / qd) * force;
        }
      }

      p.vx *= 0.97;
      p.vy *= 0.97;
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0) p.x += w;
      if (p.x > w) p.x -= w;
      if (p.y < 0) p.y += h;
      if (p.y > h) p.y -= h;
    }
    pushes.length = 0;

    for (let i = swarm.length - 1; i >= 0; i--) {
      const d = swarm[i];
      if (d.state === 0) {
        d.x += (d.tx - d.x) * 0.22;
        d.y += (d.ty - d.y) * 0.22;
        d.alpha = Math.min(1, d.alpha + 0.1);
      } else if (d.state === 1) {
        d.x += d.vx;
        d.y += d.vy;
        d.vx *= 0.96;
        d.vy *= 0.96;
        d.alpha -= 0.025;
        if (d.alpha <= 0) {
          d.alpha = 0;
          d.state = 2;
        }
      }
      if (d.state === 2) swarm.splice(i, 1);
    }
  }

  function draw(ctx: CanvasRenderingContext2D, c: FieldColors) {
    ctx.lineWidth = 0.3;
    for (let i = 0; i < stars.length; i++) {
      for (let j = i + 1; j < stars.length; j++) {
        const dx = stars[i].x - stars[j].x;
        const dy = stars[i].y - stars[j].y;
        const d2 = dx * dx + dy * dy;
        if (d2 < STAR_LINK_DIST * STAR_LINK_DIST) {
          ctx.strokeStyle = rgba(c.starLink, 0.13 * (1 - Math.sqrt(d2) / STAR_LINK_DIST));
          ctx.beginPath();
          ctx.moveTo(stars[i].x, stars[i].y);
          ctx.lineTo(stars[j].x, stars[j].y);
          ctx.stroke();
        }
      }
    }

    for (const s of stars) {
      const a = 0.3 + Math.sin(t * 1.2 + s.phase) * 0.4;
      ctx.fillStyle = rgba(c.star, Math.max(0, a));
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
      if (s.sparkleT > 0) {
        const env = Math.sin((1 - s.sparkleT / SPARKLE_FRAMES) * Math.PI);
        const len = 2 + env * 4;
        ctx.strokeStyle = rgba(c.star, env * 0.8);
        ctx.lineWidth = 0.4;
        ctx.beginPath();
        ctx.moveTo(s.x - len, s.y);
        ctx.lineTo(s.x + len, s.y);
        ctx.moveTo(s.x, s.y - len);
        ctx.lineTo(s.x, s.y + len);
        ctx.stroke();
        ctx.fillStyle = rgba(c.star, env * 0.95);
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r + env * 0.8, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    for (const p of particles) {
      const a = 0.45 + Math.sin(t * 2 + p.phase) * 0.3;
      ctx.fillStyle = rgba(c.palette[p.tint], Math.max(0, a));
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.lineWidth = 0.3;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const d2 = dx * dx + dy * dy;
        if (d2 < LINK_DIST * LINK_DIST) {
          ctx.strokeStyle = rgba(c.particleLink, 0.07 * (1 - Math.sqrt(d2) / LINK_DIST));
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }

    for (const d of swarm) {
      if (d.alpha <= 0.02) continue;
      ctx.fillStyle = rgba(c.swarmHalo, d.alpha * 0.22);
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r * 1.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = rgba(c.swarmCore, d.alpha);
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  return { resize, setPointer, clearPointer, swarmTo, scatter, clearSwarm, repel, update, draw };
}
