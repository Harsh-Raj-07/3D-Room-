import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { PROFILE, BOOKS, RECORDS, POSTCARDS, ALL_ITEMS } from './content.js';
import { postcardTexture } from './textures.js';
import {
  buildRoom, buildBookshelf, buildRecordCorner, buildPostcardWall,
  buildSeating, buildLamp, buildWindow, buildStringLights, materials,
} from './builders.js';

const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const STORE_KEY = 'littleroom.content.v1';

// ---------------------------------------------------------------- content
function loadContent() {
  let overrides = {};
  try { overrides = JSON.parse(localStorage.getItem(STORE_KEY) || '{}'); } catch { /* fresh start */ }
  const apply = (list) => list.map((it) => ({ ...it, ...(overrides[it.id] || {}) }));
  return {
    overrides,
    books: apply(BOOKS),
    records: apply(RECORDS),
    postcards: apply(POSTCARDS),
    find(kind, id) {
      const src = kind === 'book' ? this.books : kind === 'record' ? this.records : this.postcards;
      return src.find((x) => x.id === id);
    },
    save(id, patch) {
      const cur = { ...(this.overrides[id] || {}) };
      Object.entries(patch).forEach(([k, v]) => {
        if (v && v.trim()) cur[k] = v; else delete cur[k];
      });
      this.overrides[id] = cur;
      localStorage.setItem(STORE_KEY, JSON.stringify(this.overrides));
      const item = ALL_ITEMS.find((x) => x.id === id);
      Object.assign(item, cur);
      const live = this.find(patchKindOf(id), id);
      Object.assign(live, cur);
    },
  };
}
function patchKindOf(id) {
  if (BOOKS.some((b) => b.id === id)) return 'book';
  if (RECORDS.some((r) => r.id === id)) return 'record';
  return 'postcard';
}

const content = loadContent();
document.querySelector('#brand h1').textContent = PROFILE.name;
document.querySelector('#brand p').textContent = PROFILE.tagline;

// ---------------------------------------------------------------- renderer
let renderer;
try {
  renderer = new THREE.WebGLRenderer({ antialias: true });
} catch (e) {
  document.querySelector('#poster .card p').textContent = 'WebGL is not available in this browser.';
  throw e;
}
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.06;
document.getElementById('stage').appendChild(renderer.domElement);

const scene = new THREE.Scene();
const DAY_BG = new THREE.Color('#efdcbd');
const NIGHT_BG = new THREE.Color('#191423');
scene.background = DAY_BG.clone();
scene.fog = new THREE.Fog(scene.background.clone(), 14, 30);

const camera = new THREE.PerspectiveCamera(42, innerWidth / innerHeight, 0.1, 60);
camera.position.set(6.4, 4.3, 7.6);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.07;
controls.enablePan = false;
controls.minDistance = 3.2;
controls.maxDistance = 16;
controls.minPolarAngle = 0.3;
controls.maxPolarAngle = 1.46;

// home framing — wider/higher on narrow portrait screens so the whole
// diorama (bookshelf + postcard wall) fits at first glance
const home = { pos: new THREE.Vector3(6.4, 4.3, 7.6), target: new THREE.Vector3(0, 1.35, -0.3), fov: 42 };
function frameFor(aspect) {
  if (aspect < 0.75) {
    home.pos.set(4.6, 4.9, 11.6);
    home.target.set(0.9, 1.6, -1.1);
    home.fov = 50;
  } else if (aspect < 1.1) {
    home.pos.set(5.6, 4.6, 9.4);
    home.target.set(0.4, 1.45, -0.7);
    home.fov = 46;
  } else {
    home.pos.set(6.4, 4.3, 7.6);
    home.target.set(0, 1.35, -0.3);
    home.fov = 42;
  }
}
function applyHome() {
  camera.fov = home.fov;
  camera.updateProjectionMatrix();
  camera.position.copy(home.pos);
  controls.target.copy(home.target);
  controls.update();
}
frameFor(camera.aspect);
applyHome();

// ------------------------------------------------------------------ lights
const hemi = new THREE.HemisphereLight('#fff2dc', '#8a6a4a', 0.75);
scene.add(hemi);

const key = new THREE.DirectionalLight('#ffe3b0', 1.7);
key.position.set(-8.5, 5.5, 1.5);
key.castShadow = true;
key.shadow.mapSize.set(2048, 2048);
key.shadow.camera.left = -9; key.shadow.camera.right = 9;
key.shadow.camera.top = 9; key.shadow.camera.bottom = -6;
key.shadow.camera.far = 30;
key.shadow.bias = -0.002;
scene.add(key);
key.target.position.set(1.5, 0.5, -0.5);
scene.add(key.target);

// ------------------------------------------------------------------- room
let isDay = true;
const clickables = [];
const postcardMeshes = new Map();

scene.add(buildRoom(isDay));

const shelf = buildBookshelf(content.books, clickables, isDay);
shelf.position.set(-3.1, 0, -3.58);
scene.add(shelf);

const recordsCorner = buildRecordCorner(content.records, clickables, isDay);
recordsCorner.position.set(-5.42, 0, 2.1);
recordsCorner.rotation.y = Math.PI / 2;
scene.add(recordsCorner);

const wall = buildPostcardWall(content.postcards, clickables, isDay);
wall.position.set(2.4, 0, -3.93);
scene.add(wall);
wall.traverse((o) => {
  if (o.userData?.kind === 'postcard') postcardMeshes.set(o.userData.id, o);
});

scene.add(buildSeating(isDay));

const lamp = buildLamp(isDay);
scene.add(lamp.group);

const win = buildWindow(isDay);
win.group.position.z = -1.1;
scene.add(win.group);

const stringLights = buildStringLights(isDay);
scene.add(stringLights.group);

// --------------------------------------------------------- day / night rig
const LIGHT_STATE = {
  day: {
    bg: DAY_BG, hemiSky: new THREE.Color('#fff2dc'), hemiGround: new THREE.Color('#8a6a4a'),
    hemiI: 0.75, keyColor: new THREE.Color('#ffe3b0'), keyI: 1.7,
    lampI: 0.0, lampEmissive: 0.0, bulbEmissive: 0.15, stringEmissive: 0.0,
    glass: new THREE.Color('#cfe4ec'), exposure: 1.06,
  },
  night: {
    bg: NIGHT_BG, hemiSky: new THREE.Color('#31406b'), hemiGround: new THREE.Color('#141009'),
    hemiI: 0.4, keyColor: new THREE.Color('#7f9bd4'), keyI: 0.5,
    lampI: 14, lampEmissive: 0.65, bulbEmissive: 2.4, stringEmissive: 2.2,
    glass: new THREE.Color('#1c2740'), exposure: 1.0,
  },
};
const lightNow = JSON.parse(JSON.stringify({}));
const lerpTarget = { t: 1, from: null, to: LIGHT_STATE.day };
function snapshot(s) {
  return {
    bg: s.bg.clone(), hemiSky: s.hemiSky.clone(), hemiGround: s.hemiGround.clone(),
    hemiI: s.hemiI, keyColor: s.keyColor.clone(), keyI: s.keyI,
    lampI: s.lampI, lampEmissive: s.lampEmissive, bulbEmissive: s.bulbEmissive,
    stringEmissive: s.stringEmissive, glass: s.glass.clone(), exposure: s.exposure,
  };
}
function applyLightState(a, b, t) {
  scene.background.copy(a.bg).lerp(b.bg, t);
  scene.fog.color.copy(scene.background);
  hemi.color.copy(a.hemiSky).lerp(b.hemiSky, t);
  hemi.groundColor.copy(a.hemiGround).lerp(b.hemiGround, t);
  hemi.intensity = THREE.MathUtils.lerp(a.hemiI, b.hemiI, t);
  key.color.copy(a.keyColor).lerp(b.keyColor, t);
  key.intensity = THREE.MathUtils.lerp(a.keyI, b.keyI, t);
  lamp.light.intensity = THREE.MathUtils.lerp(a.lampI, b.lampI, t);
  lamp.shadeMat.emissiveIntensity = THREE.MathUtils.lerp(a.lampEmissive, b.lampEmissive, t);
  lamp.bulb.material.emissiveIntensity = THREE.MathUtils.lerp(a.bulbEmissive, b.bulbEmissive, t);
  stringLights.bulbs.forEach((bulb) => {
    bulb.material.emissiveIntensity = THREE.MathUtils.lerp(a.stringEmissive, b.stringEmissive, t);
  });
  win.glass.material.color.copy(a.glass).lerp(b.glass, t);
  renderer.toneMappingExposure = THREE.MathUtils.lerp(a.exposure, b.exposure, t);
}
const currentState = snapshot(LIGHT_STATE.day);
applyLightState(currentState, currentState, 0);

const btnNight = document.getElementById('btn-night');
const nightLabel = document.getElementById('night-label');
btnNight.addEventListener('click', () => {
  isDay = !isDay;
  lerpTarget.from = snapshot(currentState);
  lerpTarget.to = isDay ? LIGHT_STATE.day : LIGHT_STATE.night;
  lerpTarget.t = 0;
  btnNight.setAttribute('aria-pressed', String(!isDay));
  btnNight.classList.toggle('active', !isDay);
  nightLabel.textContent = isDay ? 'Night' : 'Day';
});

// ------------------------------------------------------------ raycast/tap
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let downPos = null, downTime = 0, userMoved = false;

renderer.domElement.addEventListener('pointerdown', (e) => {
  downPos = [e.clientX, e.clientY];
  downTime = performance.now();
});
renderer.domElement.addEventListener('pointerup', (e) => {
  if (!downPos) return;
  const dx = e.clientX - downPos[0], dy = e.clientY - downPos[1];
  const dist = Math.hypot(dx, dy);
  const dt = performance.now() - downTime;
  downPos = null;
  if (dist > 9 || dt > 500) return; // it was a drag, not a tap
  pointer.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObjects(clickables, false);
  if (hits.length) openModal(hits[0].object.userData);
});
// hover cursor (desktop only)
if (matchMedia('(hover: hover)').matches) {
  let hoverTick = 0;
  renderer.domElement.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    const now = performance.now();
    if (now - hoverTick < 90) return;
    hoverTick = now;
    pointer.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
    raycaster.setFromCamera(pointer, camera);
    renderer.domElement.style.cursor = raycaster.intersectObjects(clickables, false).length ? 'pointer' : 'grab';
  });
}
controls.addEventListener('start', () => { userMoved = true; renderer.domElement.style.cursor = 'grabbing'; });
controls.addEventListener('end', () => { renderer.domElement.style.cursor = 'grab'; });

// -------------------------------------------------------------- modal + edit
const wrap = document.getElementById('modal-wrap');
const elKicker = document.getElementById('modal-kicker');
const elTitle = document.getElementById('modal-title');
const elSub = document.getElementById('modal-sub');
const elBody = document.getElementById('modal-body');
const elStamp = document.getElementById('stamp');
const elPlayrow = document.getElementById('playrow');
const btnEdit = document.getElementById('btn-edit');
let current = null; // {kind, id}
let editing = false;

const KIND_META = {
  book: { kicker: 'From the bookshelf', bodyLabel: 'story' },
  record: { kicker: 'From the record crate', bodyLabel: 'note' },
  postcard: { kicker: 'Postcard', bodyLabel: 'story' },
};

function openModal(ud) {
  const item = content.find(ud.kind, ud.id);
  if (!item) return;
  current = { kind: ud.kind, id: ud.id };
  editing = false;
  const meta = KIND_META[ud.kind];
  elKicker.textContent = meta.kicker;
  elTitle.textContent = item.title ?? item.place;
  elSub.textContent = ud.kind === 'book' ? `by ${item.author}`
    : ud.kind === 'record' ? `${item.artist} · vinyl`
    : `${item.date}`;
  elBody.textContent = item.story ?? item.note;
  elStamp.hidden = ud.kind !== 'postcard';
  elPlayrow.hidden = ud.kind !== 'record';
  stopAudio();
  setEditing(false);
  wrap.classList.add('open');
  hideHint();
  document.getElementById('modal-close').focus({ preventScroll: true });
}

function setEditing(on) {
  editing = on;
  [elTitle, elSub, elBody].forEach((el) => {
    el.contentEditable = on ? 'true' : 'false';
    el.spellcheck = false;
  });
  btnEdit.textContent = on ? 'Save changes' : 'Edit this story';
  btnEdit.classList.toggle('primary', on);
  if (on) {
    const range = document.createRange();
    range.selectNodeContents(elBody);
    range.collapse(true);
    const sel = getSelection();
    sel.removeAllRanges(); sel.addRange(range);
    elBody.focus();
  }
}

btnEdit.addEventListener('click', () => {
  if (!current) return;
  if (!editing) { setEditing(true); return; }
  const { kind, id } = current;
  const patch = {};
  if (kind === 'postcard') {
    patch.place = elTitle.textContent.trim();
    patch.date = elSub.textContent.trim();
    patch.story = elBody.textContent.trim();
  } else if (kind === 'book') {
    patch.title = elTitle.textContent.trim();
    patch.author = elSub.textContent.replace(/^by\s+/i, '').trim();
    patch.story = elBody.textContent.trim();
  } else {
    patch.title = elTitle.textContent.trim();
    patch.artist = elSub.textContent.split('·')[0].trim();
    patch.note = elBody.textContent.trim();
  }
  content.save(id, patch);
  clickables.forEach((c) => { if (c.userData.id === id) c.userData.title = patch.title ?? patch.place; });
  const pm = postcardMeshes.get(id);
  if (pm) {
    pm.material.map = postcardTexture(content.find('postcard', id), isDay);
    pm.material.needsUpdate = true;
  }
  setEditing(false);
  toast('Saved — your version of this story lives in this browser.');
});

function closeModal() {
  wrap.classList.remove('open');
  stopAudio();
  setEditing(false);
  current = null;
}
document.getElementById('modal-close').addEventListener('click', closeModal);
document.getElementById('modal-backdrop').addEventListener('click', closeModal);
addEventListener('keydown', (e) => { if (e.key === 'Escape' && wrap.classList.contains('open')) closeModal(); });

document.getElementById('btn-reset').addEventListener('click', () => {
  localStorage.removeItem(STORE_KEY);
  toast('Stories restored to the originals — reloading…');
  setTimeout(() => location.reload(), 700);
});

let toastTimer;
function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2600);
}

// ------------------------------------------------------------------- audio
// A tiny generative "record player": soft detuned pad, started only by the
// user pressing Play, stopped by Stop or closing the modal. Never autoplays.
let audioCtx = null, audioNodes = null;
const btnPlay = document.getElementById('btn-play');

function startAudio() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  audioCtx.resume();
  const master = audioCtx.createGain();
  master.gain.value = 0;
  const filter = audioCtx.createBiquadFilter();
  filter.type = 'lowpass'; filter.frequency.value = 900; filter.Q.value = 0.4;
  filter.connect(master).connect(audioCtx.destination);
  const freqs = [220, 277.18, 329.63, 440]; // A major-ish voicing
  const oscs = freqs.map((f, i) => {
    const o = audioCtx.createOscillator();
    o.type = i === 3 ? 'triangle' : 'sine';
    o.frequency.value = f;
    o.detune.value = (i - 1.5) * 5;
    const g = audioCtx.createGain();
    g.gain.value = i === 3 ? 0.1 : 0.16;
    o.connect(g).connect(filter);
    o.start();
    return o;
  });
  // slow breathing on the filter
  const lfo = audioCtx.createOscillator();
  lfo.frequency.value = 0.08;
  const lfoGain = audioCtx.createGain();
  lfoGain.gain.value = 350;
  lfo.connect(lfoGain).connect(filter.frequency);
  lfo.start();
  master.gain.linearRampToValueAtTime(0.5, audioCtx.currentTime + 1.6);
  audioNodes = { master, oscs, lfo };
  vinylSpinning = true;
  elPlayrow.classList.add('playing');
  btnPlay.textContent = 'Stop';
}
function stopAudio() {
  if (!audioCtx || !audioNodes) return;
  const { master, oscs, lfo } = audioNodes;
  master.gain.cancelScheduledValues(audioCtx.currentTime);
  master.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.5);
  setTimeout(() => { oscs.forEach((o) => o.stop()); lfo.stop(); }, 600);
  audioNodes = null;
  vinylSpinning = false;
  elPlayrow.classList.remove('playing');
  btnPlay.textContent = 'Play';
}
btnPlay.addEventListener('click', () => (audioNodes ? stopAudio() : startAudio()));

// ------------------------------------------------------------------ loop
let vinylSpinning = false;
let vinylMesh = null;
recordsCorner.traverse((o) => {
  if (o.userData?.kind === 'record' && o.geometry?.type === 'CylinderGeometry' && !vinylMesh) vinylMesh = o;
});

const hint = document.getElementById('hint');
let hintHidden = false;
function hideHint() {
  if (hintHidden) return;
  hintHidden = true;
  hint.classList.add('gone');
}
setTimeout(hideHint, 9000);

const clock = new THREE.Clock();
let firstFrame = true;

renderer.setAnimationLoop(() => {
  const dt = Math.min(clock.getDelta(), 0.05);
  const t = clock.elapsedTime;

  // day/night blend
  if (lerpTarget.t < 1) {
    lerpTarget.t = Math.min(1, lerpTarget.t + dt / 1.4);
    const k = lerpTarget.t * lerpTarget.t * (3 - 2 * lerpTarget.t);
    applyLightState(lerpTarget.from, lerpTarget.to, k);
    // keep `currentState` tracking the visible state for future transitions
    Object.assign(currentState, {
      hemiI: hemi.intensity, keyI: key.intensity, lampI: lamp.light.intensity,
      lampEmissive: lamp.shadeMat.emissiveIntensity, bulbEmissive: lamp.bulb.material.emissiveIntensity,
      stringEmissive: stringLights.bulbs[0].material.emissiveIntensity,
      exposure: renderer.toneMappingExposure,
    });
    currentState.bg.copy(scene.background);
    currentState.hemiSky.copy(hemi.color);
    currentState.hemiGround.copy(hemi.groundColor);
    currentState.keyColor.copy(key.color);
    currentState.glass.copy(win.glass.material.color);
  }

  if (!reducedMotion && !userMoved) {
    const sway = Math.sin(t * 0.25) * 0.14;
    camera.position.x += (home.pos.x + sway - camera.position.x) * 0.01;
  }

  if (vinylMesh && vinylSpinning) vinylMesh.rotation.y += dt * 2.6;

  controls.update();
  renderer.render(scene, camera);

  if (firstFrame) {
    firstFrame = false;
    document.getElementById('poster').classList.add('gone');
    window.__SCENE_READY__ = true;
  }
});

// lightweight hook for automated checks (not part of the UI)
window.__ROOM__ = {
  scene, camera, clickables,
  screenPos(id) {
    const obj = clickables.find((c) => c.userData.id === id);
    if (!obj) return null;
    const v = obj.getWorldPosition(new THREE.Vector3()).project(camera);
    return { x: (v.x * 0.5 + 0.5) * innerWidth, y: (-v.y * 0.5 + 0.5) * innerHeight };
  },
  snap() { lerpTarget.t = 1; applyLightState(lerpTarget.from, lerpTarget.to, 1); },
};

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  frameFor(camera.aspect);
  if (!userMoved) applyHome();
  else camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});
void materials;
