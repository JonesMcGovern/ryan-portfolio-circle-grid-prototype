import * as THREE from "./assets/vendor/three.module.js";
import { SNAKE_OIL_LABEL_DATA_URL } from "./snake-oil-label-data.js";

const CAN_PROFILE = [
  { y: -2.45, r: 1.13, primary: true },
  { y: -2.36, r: 1.25, primary: true },
  { y: -2.26, r: 1.36, primary: true },
  { y: -2.08, r: 1.42 },
  { y: -1.72, r: 1.42 },
  { y: -1.36, r: 1.42 },
  { y: -1.02, r: 1.42 },
  { y: -0.68, r: 1.42 },
  { y: -0.34, r: 1.42 },
  { y: 0, r: 1.42, accent: true },
  { y: 0.34, r: 1.42 },
  { y: 0.68, r: 1.42 },
  { y: 1.02, r: 1.42 },
  { y: 1.36, r: 1.42 },
  { y: 1.72, r: 1.42 },
  { y: 2.08, r: 1.42 },
  { y: 2.26, r: 1.36, primary: true },
  { y: 2.36, r: 1.25, primary: true },
  { y: 2.45, r: 1.13, primary: true },
];
const RIM_DETAIL_RINGS = [
  { y: -2.42, r: 0.94 },
  { y: -2.39, r: 1.04 },
  { y: 2.39, r: 1.04 },
  { y: 2.42, r: 0.94 },
];
const RADIAL_SEGMENTS = 144;
const VERTICAL_COUNT = 28;

function getCssColor(name, fallback) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
}

function makeFallbackSkinTexture() {
  const textureCanvas = document.createElement("canvas");
  textureCanvas.width = 2;
  textureCanvas.height = 2;
  const texture = new THREE.CanvasTexture(textureCanvas);
  return prepareTexture(texture);
}

function prepareTexture(texture, renderer) {
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.anisotropy = renderer ? renderer.capabilities.getMaxAnisotropy() : 8;
  texture.needsUpdate = true;
  return texture;
}

function initializeCylinderStage(stage) {
  const canvas = stage.querySelector(".cylinder-canvas");
  if (!canvas || canvas.dataset.cylinderInitialized === "true") return;
  canvas.dataset.cylinderInitialized = "true";

  const isPreview = stage.dataset.cylinderMode === "preview";
  const skinToggle = stage.querySelector("[data-skin-toggle]");
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
  camera.position.set(0, isPreview ? 0.08 : 0.2, isPreview ? 8.3 : 8.5);

  const cylinder = new THREE.Group();
  scene.add(cylinder);

  const primaryMaterial = new THREE.LineBasicMaterial({ transparent: true, opacity: 0.96 });
  const secondaryMaterial = new THREE.LineBasicMaterial({ transparent: true, opacity: 0.42 });
  const accentMaterial = new THREE.LineBasicMaterial({ transparent: true, opacity: 0.72 });
  const wireOpacity = {
    primary: primaryMaterial.opacity,
    secondary: secondaryMaterial.opacity,
    accent: accentMaterial.opacity,
  };
  const skinUniforms = {
    skinMap: { value: makeFallbackSkinTexture() },
    reveal: { value: 0 },
    opacity: { value: 0 },
  };
  const skinMaterial = new THREE.ShaderMaterial({
    uniforms: skinUniforms,
    transparent: true,
    side: THREE.FrontSide,
    depthTest: true,
    depthWrite: true,
    vertexShader: `
      varying vec2 vUv;

      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D skinMap;
      uniform float reveal;
      uniform float opacity;
      varying vec2 vUv;

      void main() {
        vec4 label = texture2D(skinMap, vUv);
        float edge = smoothstep(reveal - 0.12, reveal, vUv.x);
        float hardClip = step(vUv.x, reveal);
        float revealMask = max(hardClip, edge * step(vUv.x, reveal + 0.02));
        float alpha = label.a * opacity * revealMask;

        if (alpha < 0.02) {
          discard;
        }

        gl_FragColor = vec4(label.rgb, alpha);
      }
    `,
  });
  const metalMaterial = new THREE.MeshBasicMaterial({ color: 0x8bbdca, transparent: true, opacity: 0 });
  const centerScreen = new THREE.Vector3();

  const snakeOilLabelSource = SNAKE_OIL_LABEL_DATA_URL || "./assets/images/snake-oil-label.png";
  new THREE.TextureLoader().load(snakeOilLabelSource, (texture) => {
    const previousTexture = skinUniforms.skinMap.value;
    skinUniforms.skinMap.value = prepareTexture(texture, renderer);
    if (previousTexture && previousTexture !== skinUniforms.skinMap.value) previousTexture.dispose?.();
  }, undefined, () => {
    skinUniforms.skinMap.value = makeFallbackSkinTexture();
  });

  function syncWireColor() {
    const lineColor = new THREE.Color(getCssColor("--line", "#F77F3F"));
    primaryMaterial.color.copy(lineColor);
    secondaryMaterial.color.copy(lineColor);
    accentMaterial.color.copy(lineColor);
  }

  function makeLine(points, material) {
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const line = new THREE.Line(geometry, material);
    cylinder.add(line);
  }

  function circlePoints(y, ringRadius) {
    const points = [];
    for (let index = 0; index <= RADIAL_SEGMENTS; index += 1) {
      const angle = (index / RADIAL_SEGMENTS) * Math.PI * 2;
      points.push(new THREE.Vector3(Math.cos(angle) * ringRadius, y, Math.sin(angle) * ringRadius));
    }
    return points;
  }

  function verticalPoints(angle) {
    return CAN_PROFILE.map(({ y, r }) => new THREE.Vector3(Math.cos(angle) * r, y, Math.sin(angle) * r));
  }

  CAN_PROFILE.forEach(({ y, r, primary, accent }) => {
    makeLine(circlePoints(y, r), primary ? primaryMaterial : accent ? accentMaterial : secondaryMaterial);
  });
  RIM_DETAIL_RINGS.forEach(({ y, r }) => makeLine(circlePoints(y, r), secondaryMaterial));
  for (let index = 0; index < VERTICAL_COUNT; index += 1) {
    const angle = (index / VERTICAL_COUNT) * Math.PI * 2;
    makeLine(verticalPoints(angle), index % 7 === 0 ? primaryMaterial : secondaryMaterial);
  }

  const profile = CAN_PROFILE.map(({ y, r }) => new THREE.Vector2(r, y));
  const body = new THREE.Mesh(new THREE.LatheGeometry(profile, 192), skinMaterial);
  body.renderOrder = 4;
  cylinder.add(body);
  const capGeometry = new THREE.CircleGeometry(1.08, 192);
  const top = new THREE.Mesh(capGeometry, metalMaterial);
  top.rotation.x = -Math.PI / 2;
  top.position.y = 2.452;
  top.renderOrder = 5;
  cylinder.add(top);
  const bottom = new THREE.Mesh(capGeometry.clone(), metalMaterial);
  bottom.rotation.x = Math.PI / 2;
  bottom.position.y = -2.452;
  bottom.renderOrder = 5;
  cylinder.add(bottom);

  const state = {
    dragging: false,
    previousX: 0,
    previousY: 0,
    previousAngle: 0,
    velocityX: 0,
    velocityY: isPreview ? 0.0065 : 0,
    velocityZ: 0,
    targetX: isPreview ? -0.62 : -0.22,
    targetY: isPreview ? 0.72 : 0.48,
    targetZ: isPreview ? -0.42 : 0.04,
    skinTarget: 0,
    skinProgress: 0,
    skinRoll: 0,
    skinSpin: 0,
  };
  cylinder.rotation.set(state.targetX, state.targetY, state.targetZ);

  function nearestRestingAngle(angle) {
    const step = Math.PI / 12;
    return Math.round(angle / step) * step;
  }

  function setSkinMode(enabled) {
    state.skinTarget = enabled ? 1 : 0;
    state.skinSpin += enabled ? 0.12 : -0.08;
    state.velocityY += enabled ? 0.025 : -0.015;
    state.velocityZ += enabled ? 0.006 : -0.004;
    skinToggle?.setAttribute("aria-pressed", String(enabled));
    if (skinToggle) skinToggle.textContent = enabled ? "Skin Off" : "Skin On";
  }

  function resize() {
    const rect = stage.getBoundingClientRect();
    const width = Math.max(rect.width, 1);
    const height = Math.max(rect.height, 1);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    const scale = isPreview ? (width < 520 ? 0.78 : 0.7) : (width < 700 ? 0.82 : 1);
    cylinder.scale.setScalar(scale);
  }

  function getScreenCenter() {
    const rect = canvas.getBoundingClientRect();
    centerScreen.set(0, 0, 0).project(camera);
    return {
      x: rect.left + (centerScreen.x * 0.5 + 0.5) * rect.width,
      y: rect.top + (-centerScreen.y * 0.5 + 0.5) * rect.height,
    };
  }

  function pointerAngle(event) {
    const center = getScreenCenter();
    return Math.atan2(event.clientY - center.y, event.clientX - center.x);
  }

  function onPointerDown(event) {
    if (isPreview) return;
    state.dragging = true;
    state.previousX = event.clientX;
    state.previousY = event.clientY;
    state.previousAngle = pointerAngle(event);
    state.velocityX = 0;
    state.velocityY = 0;
    state.velocityZ = 0;
    stage.classList.add("is-dragging");
    stage.setPointerCapture?.(event.pointerId);
  }

  function onPointerMove(event) {
    if (!state.dragging) return;
    event.preventDefault();
    const deltaX = event.clientX - state.previousX;
    const deltaY = event.clientY - state.previousY;
    state.previousX = event.clientX;
    state.previousY = event.clientY;
    const nextAngle = pointerAngle(event);
    let deltaAngle = nextAngle - state.previousAngle;
    if (deltaAngle > Math.PI) deltaAngle -= Math.PI * 2;
    if (deltaAngle < -Math.PI) deltaAngle += Math.PI * 2;
    state.previousAngle = nextAngle;
    state.velocityY = deltaX * 0.008;
    state.velocityX = deltaY * 0.008;
    state.velocityZ = deltaAngle * 0.65;
    cylinder.rotation.y += state.velocityY;
    cylinder.rotation.x += state.velocityX;
    cylinder.rotation.z += state.velocityZ;
    cylinder.rotation.x = THREE.MathUtils.clamp(cylinder.rotation.x, -Math.PI * 0.46, Math.PI * 0.46);
  }

  function onPointerUp(event) {
    if (!state.dragging) return;
    state.dragging = false;
    state.targetX = nearestRestingAngle(cylinder.rotation.x);
    state.targetY = nearestRestingAngle(cylinder.rotation.y);
    state.targetZ = nearestRestingAngle(cylinder.rotation.z);
    stage.classList.remove("is-dragging");
    if (event?.pointerId != null && stage.hasPointerCapture?.(event.pointerId)) stage.releasePointerCapture(event.pointerId);
  }

  function animate() {
    window.requestAnimationFrame(animate);
    syncWireColor();
    if (isPreview) {
      cylinder.rotation.x += (-0.62 - cylinder.rotation.x) * 0.035;
      cylinder.rotation.y += 0.0065;
      cylinder.rotation.z += (-0.42 - cylinder.rotation.z) * 0.035;
    } else if (!state.dragging) {
      cylinder.rotation.x += state.velocityX;
      cylinder.rotation.y += state.velocityY;
      cylinder.rotation.z += state.velocityZ;
      cylinder.rotation.y += state.skinSpin;
      state.skinSpin *= 0.9;
      state.velocityX *= 0.92;
      state.velocityY *= 0.92;
      state.velocityZ *= 0.9;
      if (Math.abs(state.velocityX) < 0.004 && Math.abs(state.velocityY) < 0.004 && Math.abs(state.velocityZ) < 0.004) {
        state.targetX = nearestRestingAngle(cylinder.rotation.x);
        state.targetY = nearestRestingAngle(cylinder.rotation.y);
        state.targetZ = nearestRestingAngle(cylinder.rotation.z);
        cylinder.rotation.x += (state.targetX - cylinder.rotation.x) * 0.055;
        cylinder.rotation.y += (state.targetY - cylinder.rotation.y) * 0.055;
        cylinder.rotation.z += (state.targetZ - cylinder.rotation.z) * 0.055;
      }
    }

    state.skinProgress += (state.skinTarget - state.skinProgress) * 0.12;
    state.skinRoll += (state.skinTarget - state.skinRoll) * 0.075;
    const easedMix = THREE.MathUtils.smootherstep(state.skinProgress, 0, 1);
    const wireMix = 1 - easedMix * 0.58;
    primaryMaterial.opacity = wireOpacity.primary * wireMix;
    secondaryMaterial.opacity = wireOpacity.secondary * wireMix;
    accentMaterial.opacity = wireOpacity.accent * wireMix;
    skinUniforms.opacity.value = state.skinProgress < 0.985 ? state.skinProgress * 0.98 : 1;
    skinUniforms.reveal.value = THREE.MathUtils.clamp(state.skinRoll * 1.16, 0, 1);
    body.scale.setScalar(THREE.MathUtils.lerp(0.94, 1.006, easedMix));
    metalMaterial.opacity = state.skinProgress < 0.985 ? state.skinProgress * 0.88 : 0.9;
    top.scale.setScalar(THREE.MathUtils.lerp(0.94, 1.01, easedMix));
    bottom.scale.setScalar(THREE.MathUtils.lerp(0.94, 1.01, easedMix));
    renderer.render(scene, camera);
  }

  resize();
  syncWireColor();
  window.addEventListener("resize", resize);
  new ResizeObserver(resize).observe(stage);
  document.fonts?.ready.then(resize);
  window.addEventListener("load", resize, { once: true });
  skinToggle?.addEventListener("pointerdown", (event) => {
    event.stopPropagation();
  });
  skinToggle?.addEventListener("pointerup", (event) => {
    event.stopPropagation();
  });
  skinToggle?.addEventListener("click", (event) => {
    event.stopPropagation();
    setSkinMode(state.skinTarget < 0.5);
  });
  if (!isPreview) {
    stage.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);
  }
  animate();
}

document.querySelectorAll(".can-field").forEach(initializeCylinderStage);
