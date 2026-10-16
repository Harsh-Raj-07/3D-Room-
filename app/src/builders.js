import * as THREE from 'three';
import {
  woodFloorTexture, woodPaintTexture, wallpaperTexture, rugTexture,
  postcardTexture, spineTexture, vinylLabelTexture,
} from './textures.js';

const M = {};
export function materials(day) {
  if (Object.keys(M).length) return M;
  M.floor = new THREE.MeshStandardMaterial({ map: woodFloorTexture(), roughness: 0.75, metalness: 0.05 });
  M.wall = new THREE.MeshStandardMaterial({ map: wallpaperTexture(day), roughness: 0.95 });
  M.woodDark = new THREE.MeshStandardMaterial({ map: woodPaintTexture('#7a4a26', 3), roughness: 0.65 });
  M.woodMid = new THREE.MeshStandardMaterial({ map: woodPaintTexture('#96653a', 8), roughness: 0.6 });
  M.woodLight = new THREE.MeshStandardMaterial({ map: woodPaintTexture('#b98a5a', 5), roughness: 0.7 });
  M.paper = new THREE.MeshStandardMaterial({ color: '#f7ecd9', roughness: 0.9 });
  M.ceramic = new THREE.MeshStandardMaterial({ color: '#c97a5a', roughness: 0.35 });
  M.leaf = new THREE.MeshStandardMaterial({ color: '#5a7d4a', roughness: 0.9 });
  M.pot = new THREE.MeshStandardMaterial({ color: '#a3552f', roughness: 0.8 });
  M.black = new THREE.MeshStandardMaterial({ color: '#241a12', roughness: 0.5 });
  M.metal = new THREE.MeshStandardMaterial({ color: '#8a8378', roughness: 0.35, metalness: 0.7 });
  M.shade = new THREE.MeshStandardMaterial({
    color: '#f2dfba', roughness: 0.9, side: THREE.DoubleSide,
    emissive: new THREE.Color('#ffb35c'), emissiveIntensity: 0.0,
  });
  return M;
}

const box = (w, h, d, mat) => {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.castShadow = true; m.receiveShadow = true;
  return m;
};
const cyl = (rt, rb, h, mat, seg = 24) => {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat);
  m.castShadow = true; m.receiveShadow = true;
  return m;
};

// ------------------------------------------------------------------- room
export function buildRoom(day) {
  const m = materials(day);
  const g = new THREE.Group();
  const W = 11, D = 8, H = 4.6;

  const floor = new THREE.Mesh(new THREE.PlaneGeometry(W, D), m.floor);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  g.add(floor);

  const back = new THREE.Mesh(new THREE.PlaneGeometry(W, H), m.wall);
  back.position.set(0, H / 2, -D / 2);
  back.receiveShadow = true;
  g.add(back);

  const left = new THREE.Mesh(new THREE.PlaneGeometry(D, H), m.wall);
  left.rotation.y = Math.PI / 2;
  left.position.set(-W / 2, H / 2, 0);
  left.receiveShadow = true;
  g.add(left);

  // baseboards
  const bb1 = box(W, 0.28, 0.06, m.woodLight); bb1.position.set(0, 0.14, -D / 2 + 0.03); g.add(bb1);
  const bb2 = box(0.06, 0.28, D, m.woodLight); bb2.position.set(-W / 2 + 0.03, 0.14, 0); g.add(bb2);

  // rug
  const rug = new THREE.Mesh(new THREE.CircleGeometry(2.1, 48), new THREE.MeshStandardMaterial({ map: rugTexture(), roughness: 0.95 }));
  rug.rotation.x = -Math.PI / 2;
  rug.position.set(0.4, 0.012, 0.6);
  rug.receiveShadow = true;
  g.add(rug);

  return g;
}

// --------------------------------------------------------------- bookshelf
export function buildBookshelf(books, clickables, day) {
  const m = materials(day);
  const g = new THREE.Group();
  const W = 3.4, H = 3.3, D = 0.72, T = 0.09;
  const shelfYs = [0.06, 1.06, 2.06, 3.24];

  const sideL = box(T, H, D, m.woodMid); sideL.position.set(-W / 2 + T / 2, H / 2, 0);
  const sideR = box(T, H, D, m.woodMid); sideR.position.set(W / 2 - T / 2, H / 2, 0);
  const back = box(W, H, 0.05, m.woodDark); back.position.set(0, H / 2, -D / 2 + 0.025);
  const top = box(W, T, D, m.woodMid); top.position.set(0, H - T / 2, 0);
  g.add(sideL, sideR, back, top);
  shelfYs.slice(0, 3).forEach((y) => {
    const s = box(W - 2 * T, T, D - 0.06, m.woodMid);
    s.position.set(0, y + T / 2, 0.01);
    g.add(s);
  });
  // plinth
  const plinth = box(W, 0.12, D - 0.04, m.woodDark); plinth.position.set(0, 0.06, 0); g.add(plinth);

  // ---- books on the three shelves ----
  const rand = mulberry(7);
  const palette = ['#7d9b76', '#4f6d8f', '#b4552d', '#d9a441', '#5e8a8a', '#8a5f7e', '#a3552f', '#c98b3f'];
  let bi = 0;
  const clickableIds = new Set(books.map((b) => b.id));
  shelfYs.slice(0, 3).forEach((sy, shelfIdx) => {
    let x = -W / 2 + T + 0.12;
    const end = W / 2 - T - 0.15;
    while (x < end - 0.14) {
      if (rand() > 0.86 && x < end - 0.6) {
        // horizontal stack
        const n = 2 + Math.floor(rand() * 2);
        for (let i = 0; i < n; i++) {
          const bw = 0.42 + rand() * 0.12;
          const bh = 0.07;
          const b = box(bw, bh, 0.5, new THREE.MeshStandardMaterial({ color: palette[Math.floor(rand() * palette.length)], roughness: 0.85 }));
          b.position.set(x + bw / 2, sy + T + 0.06 + i * (bh + 0.008), 0.05);
          b.rotation.y = (rand() - 0.5) * 0.12;
          g.add(b);
        }
        x += 0.6;
        continue;
      }
      const bw = 0.11 + rand() * 0.09;
      const bh = 0.52 + rand() * 0.3;
      const bd = 0.44 + rand() * 0.08;
      let mesh;
      if (bi < books.length) {
        // a real clickable book
        const book = books[bi];
        const tex = spineTexture(book);
        const sideMat = new THREE.MeshStandardMaterial({ color: book.color, roughness: 0.85 });
        const spineMat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.85 });
        mesh = new THREE.Mesh(
          new THREE.BoxGeometry(bw, bh, bd),
          [sideMat, sideMat, sideMat, sideMat, spineMat, sideMat]
        );
        mesh.position.set(x + bw / 2, sy + T + bh / 2 + 0.01, 0.03);
        mesh.rotation.z = (rand() - 0.5) * 0.04;
        mesh.userData = { kind: 'book', id: book.id, title: book.title };
        clickables.push(mesh);
        g.add(mesh);
        bi++;
      } else {
        const c = palette[Math.floor(rand() * palette.length)];
        mesh = box(bw, bh, bd, new THREE.MeshStandardMaterial({ color: c, roughness: 0.85 }));
        mesh.position.set(x + bw / 2, sy + T + bh / 2 + 0.01, 0.03);
        mesh.rotation.z = (rand() - 0.5) * 0.04;
        g.add(mesh);
      }
      x += bw + 0.015 + rand() * 0.03;
      if (rand() > 0.93) x += 0.12;
      void shelfIdx;
    }
  });

  // ---- top of shelf: plant + candle + leaning frame ----
  const pot = cyl(0.09, 0.07, 0.14, m.pot); pot.position.set(-1.25, H + 0.07, 0); g.add(pot);
  for (let i = 0; i < 6; i++) {
    const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 8), m.leaf);
    leaf.position.set(-1.25 + Math.cos(i * 1.1) * 0.07, H + 0.2 + (i % 3) * 0.06, Math.sin(i * 1.1) * 0.07);
    leaf.castShadow = true;
    g.add(leaf);
  }
  const frame = box(0.34, 0.44, 0.03, m.woodDark);
  frame.position.set(1.3, H + 0.24, -0.1);
  frame.rotation.x = -0.18; frame.rotation.y = -0.15;
  g.add(frame);
  const frameArt = new THREE.Mesh(new THREE.PlaneGeometry(0.26, 0.36), m.paper);
  frameArt.position.set(0, 0, 0.017); frame.add(frameArt);

  return g;
}

// ------------------------------------------------------------ record corner
export function buildRecordCorner(records, clickables, day) {
  const m = materials(day);
  const g = new THREE.Group();
  const W = 2.6, H = 0.92, D = 0.8;

  // sideboard
  const body = box(W, H - 0.1, D, m.woodMid); body.position.y = (H - 0.1) / 2 + 0.1; g.add(body);
  const top = box(W + 0.08, 0.08, D + 0.08, m.woodDark); top.position.y = H - 0.04; g.add(top);
  const legFL = cyl(0.035, 0.045, 0.14, m.woodDark); legFL.position.set(-W / 2 + 0.15, 0.07, D / 2 - 0.12); g.add(legFL);
  const legFR = legFL.clone(); legFR.position.x = W / 2 - 0.15; g.add(legFR);
  const legBL = legFL.clone(); legBL.position.z = -D / 2 + 0.12; g.add(legBL);
  const legBR = legFR.clone(); legBR.position.z = -D / 2 + 0.12; g.add(legBR);
  // drawer faces + knobs
  [-0.65, 0.65].forEach((x) => {
    const face = box(1.14, 0.3, 0.04, m.woodLight); face.position.set(x, 0.62, D / 2 + 0.005); g.add(face);
    const knob = new THREE.Mesh(new THREE.SphereGeometry(0.03, 12, 12), m.metal);
    knob.position.set(x, 0.62, D / 2 + 0.045); knob.castShadow = true; g.add(knob);
  });

  // turntable
  const tt = new THREE.Group();
  tt.position.set(-0.55, H, 0.02);
  const plinth = box(0.85, 0.1, 0.68, m.black); plinth.position.y = 0.05; tt.add(plinth);
  const platter = cyl(0.27, 0.27, 0.025, m.black, 40); platter.position.set(-0.08, 0.115, 0); tt.add(platter);
  const rec = records[0];
  const vinyl = new THREE.Mesh(
    new THREE.CylinderGeometry(0.25, 0.25, 0.012, 40),
    [new THREE.MeshStandardMaterial({ color: '#181210', roughness: 0.4 }),
     new THREE.MeshStandardMaterial({ map: vinylLabelTexture(rec), roughness: 0.6 }),
     new THREE.MeshStandardMaterial({ color: '#181210', roughness: 0.4 })]
  );
  vinyl.position.set(-0.08, 0.135, 0);
  vinyl.castShadow = true;
  tt.add(vinyl);
  const tonearm = cyl(0.012, 0.012, 0.42, m.metal, 10);
  tonearm.rotation.z = Math.PI / 2 - 0.35;
  tonearm.position.set(0.28, 0.17, 0.1);
  tt.add(tonearm);
  const pivot = cyl(0.035, 0.035, 0.05, m.metal); pivot.position.set(0.32, 0.15, 0.12); tt.add(pivot);
  // whole turntable is the clickable for record 1
  plinth.userData = { kind: 'record', id: rec.id, title: rec.title };
  vinyl.userData = plinth.userData;
  clickables.push(plinth, vinyl);
  g.add(tt);

  // record crate on the right of the sideboard top
  const crate = new THREE.Group();
  crate.position.set(0.75, H, 0);
  const cB = box(0.78, 0.34, 0.6, m.woodLight); cB.position.y = 0.17; crate.add(cB);
  // leaning records
  records.forEach((r, i) => {
    const sleeve = box(0.5, 0.5, 0.018, new THREE.MeshStandardMaterial({ color: r.color, roughness: 0.8 }));
    sleeve.position.set(-0.18 + i * 0.19, 0.36, 0);
    sleeve.rotation.z = -0.28 + i * 0.06;
    sleeve.userData = { kind: 'record', id: r.id, title: r.title };
    clickables.push(sleeve);
    crate.add(sleeve);
  });
  g.add(crate);

  // speaker on the floor to the side
  const spk = new THREE.Group();
  spk.position.set(W / 2 + 0.45, 0, 0.1);
  const spkB = box(0.5, 0.85, 0.42, m.woodDark); spkB.position.y = 0.425; spk.add(spkB);
  const cone1 = cyl(0.15, 0.15, 0.03, m.black, 24); cone1.rotation.x = Math.PI / 2; cone1.position.set(0, 0.58, 0.2); spk.add(cone1);
  const cone2 = cyl(0.08, 0.08, 0.03, m.black, 20); cone2.rotation.x = Math.PI / 2; cone2.position.set(0, 0.25, 0.2); spk.add(cone2);
  g.add(spk);

  return g;
}

// ----------------------------------------------------------- postcard wall
export function buildPostcardWall(cards, clickables, day) {
  const m = materials(day);
  const g = new THREE.Group();
  const rand = mulberry(23);
  const cols = 4, cw = 0.62, ch = 0.78;
  cards.forEach((card, i) => {
    const col = i % cols, row = Math.floor(i / cols);
    const holder = new THREE.Group();
    holder.position.set(
      -((cols - 1) / 2) * (cw + 0.28) + col * (cw + 0.28),
      1.65 + (1 - row) * (ch + 0.3),
      0.02
    );
    holder.rotation.z = (rand() - 0.5) * 0.12;
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(cw, ch),
      new THREE.MeshStandardMaterial({ map: postcardTexture(card, day), roughness: 0.9 })
    );
    mesh.castShadow = true;
    mesh.userData = { kind: 'postcard', id: card.id, title: card.place, holder };
    holder.add(mesh);
    // pin
    const pin = new THREE.Mesh(new THREE.SphereGeometry(0.025, 10, 10), new THREE.MeshStandardMaterial({ color: '#b4552d', roughness: 0.4 }));
    pin.position.set(0, ch / 2 - 0.02, 0.015);
    holder.add(pin);
    clickables.push(mesh);
    g.add(holder);
  });
  // a little string of washi tape pieces between cards (decorative)
  const tape = new THREE.Mesh(new THREE.PlaneGeometry(0.16, 0.05), new THREE.MeshStandardMaterial({ color: '#d9a441', roughness: 0.9, transparent: true, opacity: 0.85 }));
  g.children.forEach((h) => {
    const t2 = tape.clone();
    t2.position.set(0, h.children[0].geometry.parameters.height / 2 + 0.02, 0.01);
    t2.rotation.z = (rand() - 0.5) * 0.5;
    h.add(t2);
  });
  void m;
  return g;
}

// -------------------------------------------------------- armchair + table
export function buildSeating(day) {
  const m = materials(day);
  const g = new THREE.Group();

  const chair = new THREE.Group();
  const fabric = new THREE.MeshStandardMaterial({ color: '#a34a28', roughness: 0.95 });
  const cushion = new THREE.MeshStandardMaterial({ color: '#c97a4e', roughness: 0.95 });
  const seat = box(0.95, 0.28, 0.9, cushion); seat.position.y = 0.5; chair.add(seat);
  const back = box(0.95, 0.85, 0.24, fabric); back.position.set(0, 1.0, -0.33); back.rotation.x = 0.12; chair.add(back);
  const armL = box(0.2, 0.4, 0.85, fabric); armL.position.set(-0.55, 0.72, 0); chair.add(armL);
  const armR = armL.clone(); armR.position.x = 0.55; chair.add(armR);
  [[-0.4, -0.35], [0.4, -0.35], [-0.4, 0.35], [0.4, 0.35]].forEach(([x, z]) => {
    const leg = cyl(0.03, 0.04, 0.36, m.woodDark); leg.position.set(x, 0.18, z); chair.add(leg);
  });
  chair.position.set(0.5, 0, 1.9);
  chair.rotation.y = Math.PI + 0.5;
  g.add(chair);

  // side table
  const table = new THREE.Group();
  const ttop = cyl(0.42, 0.42, 0.05, m.woodMid, 32); ttop.position.y = 0.62; table.add(ttop);
  const tleg = cyl(0.035, 0.035, 0.6, m.woodDark); tleg.position.y = 0.31; table.add(tleg);
  const tbase = cyl(0.2, 0.24, 0.04, m.woodDark); tbase.position.y = 0.02; table.add(tbase);
  const cup = cyl(0.055, 0.045, 0.1, m.ceramic, 18); cup.position.set(0.14, 0.7, 0.08); table.add(cup);
  const book1 = box(0.3, 0.045, 0.22, new THREE.MeshStandardMaterial({ color: '#5e8a8a', roughness: 0.85 }));
  book1.position.set(-0.12, 0.67, -0.05); book1.rotation.y = 0.4; table.add(book1);
  table.position.set(1.7, 0, 1.35);
  g.add(table);

  return g;
}

// ----------------------------------------------------------------- lamp
export function buildLamp(day) {
  const m = materials(day);
  const g = new THREE.Group();
  const base = cyl(0.2, 0.26, 0.06, m.metal); base.position.y = 0.03; g.add(base);
  const pole = cyl(0.022, 0.022, 1.55, m.metal, 12); pole.position.y = 0.85; g.add(pole);
  const shade = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.3, 0.36, 28, 1, true), m.shade);
  shade.position.y = 1.72;
  shade.castShadow = false;
  g.add(shade);
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 12),
    new THREE.MeshStandardMaterial({ color: '#fff2d0', emissive: new THREE.Color('#ffca7a'), emissiveIntensity: 0 }));
  bulb.position.y = 1.66;
  g.add(bulb);
  const light = new THREE.PointLight('#ffb35c', 0, 9, 1.8);
  light.position.y = 1.66;
  light.castShadow = true;
  light.shadow.mapSize.set(512, 512);
  light.shadow.bias = -0.005;
  g.add(light);
  g.position.set(3.6, 0, -2.6);
  return { group: g, light, bulb, shadeMat: m.shade };
}

// ------------------------------------------------------- window (left wall)
export function buildWindow(day) {
  const m = materials(day);
  const g = new THREE.Group();
  const W = 2.2, H = 1.8;
  const frameMat = m.woodLight;
  const fT = box(W + 0.16, 0.1, 0.12, frameMat); fT.position.y = H / 2 + 0.05; g.add(fT);
  const fB = fT.clone(); fB.position.y = -H / 2 - 0.05; g.add(fB);
  const fL = box(0.1, H + 0.2, 0.12, frameMat); fL.position.x = -W / 2 - 0.05; g.add(fL);
  const fR = fL.clone(); fR.position.x = W / 2 + 0.05; g.add(fR);
  const mullionV = box(0.05, H, 0.06, frameMat); g.add(mullionV);
  const mullionH = box(W, 0.05, 0.06, frameMat); g.add(mullionH);
  // glass glow plane — re-tinted for day/night
  const glass = new THREE.Mesh(new THREE.PlaneGeometry(W, H),
    new THREE.MeshBasicMaterial({ color: day ? '#cfe4ec' : '#1c2740' }));
  glass.position.z = -0.04;
  g.add(glass);
  // sill
  const sill = box(W + 0.3, 0.07, 0.24, frameMat); sill.position.set(0, -H / 2 - 0.12, 0.08); g.add(sill);
  g.position.set(-5.44, 2.4, -0.6);
  g.rotation.y = Math.PI / 2;
  return { group: g, glass };
}

// ------------------------------------------- string lights along back wall
export function buildStringLights(day) {
  const g = new THREE.Group();
  const bulbs = [];
  const N = 14, W = 8.4;
  for (let i = 0; i < N; i++) {
    const t = i / (N - 1);
    const x = -W / 2 + t * W;
    const y = 4.1 - Math.sin(t * Math.PI) * 0.55;
    const b = new THREE.Mesh(new THREE.SphereGeometry(0.045, 10, 10),
      new THREE.MeshStandardMaterial({ color: '#ffe1a8', emissive: new THREE.Color('#ffca7a'), emissiveIntensity: 0 }));
    b.position.set(x, y, -3.86);
    g.add(b);
    bulbs.push(b);
  }
  // cord
  const pts = bulbs.map((b) => b.position.clone());
  const curve = new THREE.CatmullRomCurve3(pts);
  const cord = new THREE.Mesh(new THREE.TubeGeometry(curve, 48, 0.012, 6),
    new THREE.MeshStandardMaterial({ color: '#4a3626', roughness: 0.9 }));
  g.add(cord);
  void day;
  return { group: g, bulbs };
}

function mulberry(seed) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
