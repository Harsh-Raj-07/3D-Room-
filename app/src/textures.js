import * as THREE from 'three';

// Deterministic pseudo-random so textures look the same every load.
function mulberry(seed) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function canvasTex(size, draw, { repeat = [1, 1], aniso = 4 } = {}) {
  const c = document.createElement('canvas');
  c.width = size; c.height = size;
  draw(c.getContext('2d'), size);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(repeat[0], repeat[1]);
  t.anisotropy = aniso;
  return t;
}

function grain(ctx, size, rand, n, alpha, dark = '#3a2412') {
  ctx.fillStyle = dark;
  for (let i = 0; i < n; i++) {
    ctx.globalAlpha = alpha * rand();
    ctx.fillRect(rand() * size, rand() * size, 1 + rand() * 2, 1 + rand() * 2);
  }
  ctx.globalAlpha = 1;
}

// ---------------------------------------------------------------- wood floor
export function woodFloorTexture() {
  return canvasTex(512, (ctx, s) => {
    const rand = mulberry(42);
    ctx.fillStyle = '#a06a3c'; ctx.fillRect(0, 0, s, s);
    const plankH = s / 8;
    for (let r = 0; r < 8; r++) {
      const y = r * plankH;
      const base = 0.82 + rand() * 0.36;
      ctx.fillStyle = `rgb(${Math.round(158 * base)},${Math.round(104 * base)},${Math.round(58 * base)})`;
      ctx.fillRect(0, y, s, plankH - 2);
      // grain lines
      for (let g = 0; g < 26; g++) {
        ctx.strokeStyle = `rgba(70,40,18,${0.05 + rand() * 0.1})`;
        ctx.lineWidth = 0.6 + rand() * 1.4;
        ctx.beginPath();
        const gy = y + rand() * plankH;
        ctx.moveTo(0, gy);
        for (let x = 0; x <= s; x += 32) {
          ctx.lineTo(x, gy + Math.sin(x * 0.02 + r * 3 + g) * 1.6 + (rand() - 0.5) * 2);
        }
        ctx.stroke();
      }
      // plank seams
      ctx.fillStyle = 'rgba(40,22,10,.55)';
      ctx.fillRect(0, y + plankH - 2, s, 2);
      const joint = ((r * 197) % 512);
      ctx.fillRect(joint, y, 3, plankH - 2);
      // knots
      if (rand() > 0.5) {
        const kx = rand() * s, ky = y + plankH * (0.3 + rand() * 0.4);
        const kr = 4 + rand() * 7;
        const grad = ctx.createRadialGradient(kx, ky, 1, kx, ky, kr);
        grad.addColorStop(0, 'rgba(60,34,14,.7)');
        grad.addColorStop(0.6, 'rgba(90,55,26,.35)');
        grad.addColorStop(1, 'rgba(90,55,26,0)');
        ctx.fillStyle = grad;
        ctx.beginPath(); ctx.arc(kx, ky, kr, 0, 7); ctx.fill();
      }
    }
    grain(ctx, s, rand, 900, 0.07);
  }, { repeat: [2.2, 2.2] });
}

// ------------------------------------------------------- plain painted wood
export function woodPaintTexture(hex = '#8a5a34', seed = 7) {
  return canvasTex(256, (ctx, s) => {
    const rand = mulberry(seed);
    ctx.fillStyle = hex; ctx.fillRect(0, 0, s, s);
    for (let g = 0; g < 60; g++) {
      ctx.strokeStyle = `rgba(255,235,205,${0.03 + rand() * 0.05})`;
      ctx.lineWidth = 0.5 + rand();
      ctx.beginPath();
      const gy = rand() * s;
      ctx.moveTo(0, gy);
      for (let x = 0; x <= s; x += 24) ctx.lineTo(x, gy + Math.sin(x * 0.03 + g) * 2);
      ctx.stroke();
    }
    for (let g = 0; g < 40; g++) {
      ctx.strokeStyle = `rgba(40,20,8,${0.04 + rand() * 0.05})`;
      ctx.lineWidth = 0.6 + rand();
      ctx.beginPath();
      const gy = rand() * s;
      ctx.moveTo(0, gy);
      for (let x = 0; x <= s; x += 28) ctx.lineTo(x, gy + Math.cos(x * 0.025 + g) * 2);
      ctx.stroke();
    }
    grain(ctx, s, rand, 350, 0.06);
  });
}

// --------------------------------------------------------------- paper wall
export function wallpaperTexture(day = true) {
  return canvasTex(512, (ctx, s) => {
    const rand = mulberry(11);
    ctx.fillStyle = day ? '#e9d9bd' : '#d8c9b2';
    ctx.fillRect(0, 0, s, s);
    // subtle vertical stripes
    for (let x = 0; x < s; x += 32) {
      ctx.fillStyle = 'rgba(160,120,80,.08)';
      ctx.fillRect(x, 0, 14, s);
    }
    // tiny sprig motif
    ctx.strokeStyle = 'rgba(150,105,65,.22)';
    ctx.fillStyle = 'rgba(150,105,65,.22)';
    for (let y = 16; y < s; y += 64) {
      for (let x = 24; x < s; x += 64) {
        ctx.beginPath();
        ctx.moveTo(x, y + 8);
        ctx.quadraticCurveTo(x + 5, y - 4, x + 1, y - 10);
        ctx.stroke();
        ctx.beginPath(); ctx.arc(x + 1, y - 11, 2, 0, 7); ctx.fill();
      }
    }
    grain(ctx, s, rand, 700, 0.05, '#8a6a44');
  }, { repeat: [2, 1.2] });
}

// ---------------------------------------------------------------------- rug
export function rugTexture() {
  return canvasTex(512, (ctx, s) => {
    const rand = mulberry(99);
    ctx.fillStyle = '#b4552d'; ctx.fillRect(0, 0, s, s);
    const rings = ['#c97a4e', '#d9a441', '#a34a28', '#e0b96a', '#8f3f20'];
    for (let i = 0; i < 5; i++) {
      ctx.strokeStyle = rings[i];
      ctx.lineWidth = 22 - i * 3;
      ctx.beginPath();
      ctx.arc(s / 2, s / 2, 236 - i * 44, 0, 7);
      ctx.stroke();
    }
    // diamond center
    ctx.fillStyle = '#e8d5ae';
    ctx.save(); ctx.translate(s / 2, s / 2); ctx.rotate(Math.PI / 4);
    ctx.fillRect(-52, -52, 104, 104);
    ctx.strokeStyle = '#8f3f20'; ctx.lineWidth = 5;
    ctx.strokeRect(-52, -52, 104, 104);
    ctx.strokeRect(-30, -30, 60, 60);
    ctx.restore();
    // border dashes
    ctx.strokeStyle = '#f2e2c0'; ctx.lineWidth = 6; ctx.setLineDash([16, 12]);
    ctx.beginPath(); ctx.arc(s / 2, s / 2, 246, 0, 7); ctx.stroke();
    ctx.setLineDash([]);
    grain(ctx, s, rand, 1400, 0.08, '#4a2410');
  });
}

// -------------------------------------------------- postcard front (wall art)
export function postcardTexture(card, day = true) {
  const key = `pc:${card.id}:${day ? 'd' : 'n'}`;
  const t = canvasTex(256, (ctx, s) => {
    const rand = mulberry(card.id.length * 31 + 5);
    // paper base
    ctx.fillStyle = '#f7ecd9'; ctx.fillRect(0, 0, s, s);
    // tint frame
    ctx.fillStyle = card.tint;
    ctx.fillRect(10, 10, s - 20, s - 20);
    ctx.fillStyle = shade(card.tint, -18);
    ctx.fillRect(16, 16, s - 32, s - 32);
    // simple landscape doodle
    const sky = ctx.createLinearGradient(0, 30, 0, 140);
    sky.addColorStop(0, day ? '#cfe4e8' : '#2e3a55');
    sky.addColorStop(1, day ? '#f2e0b8' : '#7a6a8a');
    ctx.fillStyle = sky;
    ctx.fillRect(22, 22, s - 44, 118);
    ctx.fillStyle = day ? '#6a8a5a' : '#3a4a4a';
    ctx.beginPath();
    ctx.moveTo(22, 140);
    for (let x = 0; x <= s - 44; x += 20) {
      ctx.lineTo(22 + x, 140 - 18 - Math.abs(Math.sin(x * 0.09 + rand() * 6)) * 42);
    }
    ctx.lineTo(s - 22, 140); ctx.closePath(); ctx.fill();
    // sun / moon
    ctx.fillStyle = day ? '#f4c95d' : '#e8e4d8';
    ctx.beginPath(); ctx.arc(60 + rand() * 120, 52 + rand() * 24, 11, 0, 7); ctx.fill();
    // caption band
    ctx.fillStyle = '#f7ecd9';
    ctx.fillRect(10, 148, s - 20, s - 158);
    ctx.fillStyle = '#3a2a1c';
    ctx.font = 'bold 21px Georgia, serif';
    ctx.textAlign = 'center';
    fitText(ctx, card.place.toUpperCase(), s / 2, 184, s - 40, 21);
    ctx.font = '15px Georgia, serif';
    ctx.fillStyle = '#8a6a4a';
    ctx.fillText(card.date, s / 2, 212);
    // stamp corner
    ctx.strokeStyle = '#b4552d'; ctx.lineWidth = 2;
    ctx.setLineDash([4, 3]);
    ctx.strokeRect(s - 66, 24, 40, 46);
    ctx.setLineDash([]);
    ctx.fillStyle = '#b4552d';
    ctx.font = 'italic 10px Georgia, serif';
    ctx.fillText('PAR', s - 46, 44);
    ctx.fillText('AVION', s - 46, 56);
    grain(ctx, s, rand, 260, 0.06);
  });
  t.name = key;
  return t;
}

function fitText(ctx, text, x, y, maxW, startSize) {
  let size = startSize;
  ctx.font = `bold ${size}px Georgia, serif`;
  while (ctx.measureText(text).width > maxW && size > 8) {
    size -= 1;
    ctx.font = `bold ${size}px Georgia, serif`;
  }
  ctx.fillText(text, x, y);
}

function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.max(0, Math.min(255, (n >> 16) + amt));
  const g = Math.max(0, Math.min(255, ((n >> 8) & 255) + amt));
  const b = Math.max(0, Math.min(255, (n & 255) + amt));
  return `rgb(${r},${g},${b})`;
}

// ------------------------------------------------------------ book spine
export function spineTexture(book) {
  return canvasTex(128, (ctx, s) => {
    const rand = mulberry(book.id.length * 13 + 2);
    ctx.fillStyle = book.color; ctx.fillRect(0, 0, s, s);
    // top & bottom bands
    ctx.fillStyle = 'rgba(255,240,210,.28)';
    ctx.fillRect(0, 8, s, 5); ctx.fillRect(0, s - 13, s, 5);
    ctx.fillStyle = 'rgba(30,15,5,.25)';
    ctx.fillRect(0, 0, s, 3); ctx.fillRect(0, s - 3, s, 3);
    // title
    ctx.save();
    ctx.translate(s / 2, s / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillStyle = '#f7ecd9';
    ctx.textAlign = 'center';
    let size = 17;
    ctx.font = `bold ${size}px Georgia, serif`;
    while (ctx.measureText(book.title).width > s - 44 && size > 7) {
      size--; ctx.font = `bold ${size}px Georgia, serif`;
    }
    ctx.fillText(book.title, 0, 4);
    ctx.restore();
    grain(ctx, s, rand, 120, 0.1);
  });
}

// ------------------------------------------------------------- vinyl label
export function vinylLabelTexture(record) {
  return canvasTex(128, (ctx, s) => {
    ctx.fillStyle = record.color; ctx.fillRect(0, 0, s, s);
    ctx.strokeStyle = 'rgba(255,240,210,.5)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(s / 2, s / 2, 44, 0, 7); ctx.stroke();
    ctx.fillStyle = '#f7ecd9';
    ctx.textAlign = 'center';
    ctx.font = 'bold 13px Georgia, serif';
    fitText(ctx, record.title.toUpperCase(), s / 2, s / 2 - 22, 96, 13);
    ctx.font = '10px Georgia, serif';
    fitText(ctx, record.artist, s / 2, s / 2 + 30, 96, 10);
  });
}
