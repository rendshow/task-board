import * as THREE from "three";
import { groundHeight } from "./math.js";

const TAU = Math.PI * 2;
const UP = new THREE.Vector3(0, 1, 0);

function markDynamic(object) {
  object.traverse((child) => {
    child.userData.dynamic = true;
  });
  return object;
}

function material(color, roughness = 0.7, metalness = 0) {
  return new THREE.MeshStandardMaterial({ color, roughness, metalness });
}

function cylinderBetween(a, b, radius, mat, segments = 6) {
  const direction = new THREE.Vector3().subVectors(b, a);
  const mesh = new THREE.Mesh(
    new THREE.CylinderGeometry(radius, radius * 0.82, direction.length(), segments),
    mat,
  );
  mesh.position.copy(a).add(b).multiplyScalar(0.5);
  mesh.quaternion.setFromUnitVectors(UP, direction.normalize());
  return mesh;
}

function addWhiskers(headBone) {
  const lineMaterial = new THREE.LineBasicMaterial({ color: 0xb7a277, transparent: true, opacity: 0.75 });
  const anchors = [
    [0.04, 0.025, 0.08, 0.29, 0.075, 0.18],
    [0.04, 0.025, -0.08, 0.29, 0.075, -0.18],
    [0.055, -0.025, 0.075, 0.27, -0.08, 0.17],
    [0.055, -0.025, -0.075, 0.27, -0.08, -0.17],
  ];
  for (const [x1, y1, z1, x2, y2, z2] of anchors) {
    const geometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(x1, y1, z1),
      new THREE.Vector3(x2, y2, z2),
    ]);
    const line = new THREE.Line(geometry, lineMaterial);
    headBone.add(line);
  }
}

function loachGeometry(length, ringCount, sideCount, boneCount) {
  const positions = [];
  const colors = [];
  const skinIndices = [];
  const skinWeights = [];
  const indices = [];
  for (let ring = 0; ring <= ringCount; ring += 1) {
    const t = ring / ringCount;
    const x = length * (0.5 - t);
    const radius = 0.026 + Math.sin(Math.PI * Math.pow(t, 0.72)) * (0.118 - t * 0.026);
    const boneFloat = t * (boneCount - 1);
    const lower = Math.min(boneCount - 1, Math.floor(boneFloat));
    const upper = Math.min(boneCount - 1, lower + 1);
    const upperWeight = boneFloat - lower;
    for (let side = 0; side < sideCount; side += 1) {
      const angle = side / sideCount * TAU;
      const y = Math.cos(angle) * radius * 0.66;
      const z = Math.sin(angle) * radius;
      positions.push(x, y, z);
      const belly = THREE.MathUtils.smoothstep(-y / Math.max(radius, 0.001), 0.05, 0.72);
      const mottled = Math.sin(ring * 1.73 + side * 2.21) * 0.035 + Math.sin(ring * 0.47 - side) * 0.025;
      colors.push(
        THREE.MathUtils.clamp(0.34 + belly * 0.32 + mottled, 0, 1),
        THREE.MathUtils.clamp(0.28 + belly * 0.27 + mottled * 0.7, 0, 1),
        THREE.MathUtils.clamp(0.155 + belly * 0.18 + mottled * 0.35, 0, 1),
      );
      skinIndices.push(lower, upper, 0, 0);
      skinWeights.push(1 - upperWeight, upperWeight, 0, 0);
    }
  }
  for (let ring = 0; ring < ringCount; ring += 1) {
    for (let side = 0; side < sideCount; side += 1) {
      const next = (side + 1) % sideCount;
      const a = ring * sideCount + side;
      const b = ring * sideCount + next;
      const c = (ring + 1) * sideCount + side;
      const d = (ring + 1) * sideCount + next;
      indices.push(a, c, b, b, c, d);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geometry.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(skinIndices, 4));
  geometry.setAttribute('skinWeight', new THREE.Float32BufferAttribute(skinWeights, 4));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function finGeometry(points) {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(points.flat(), 3));
  geometry.setIndex([0, 1, 2]);
  geometry.computeVertexNormals();
  return geometry;
}

function createLoach() {
  const group = new THREE.Group();
  group.name = "常驻小泥鳅";
  const length = 1.85;
  const boneCount = 8;
  const bones = [];
  const spacing = length / (boneCount - 1);
  for (let index = 0; index < boneCount; index += 1) {
    const bone = new THREE.Bone();
    bone.name = index === 0 ? '泥鳅头骨' : `泥鳅脊骨 ${index}`;
    bone.position.x = index === 0 ? length * 0.5 : -spacing;
    if (index) bones[index - 1].add(bone);
    bones.push(bone);
  }
  const bodyMaterial = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.8,
    metalness: 0,
    emissive: 0x211607,
    emissiveIntensity: 0.12,
  });
  const body = new THREE.SkinnedMesh(loachGeometry(length, 32, 12, boneCount), bodyMaterial);
  body.add(bones[0]);
  body.bind(new THREE.Skeleton(bones));
  body.castShadow = true;
  body.receiveShadow = true;
  body.frustumCulled = false;
  group.add(body);

  const headMaterial = new THREE.MeshStandardMaterial({ color: 0x766443, roughness: 0.78, emissive: 0x211607, emissiveIntensity: 0.1 });
  const darkMaterial = material(0x1c211d, 0.58);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.13, 14, 9), headMaterial);
  head.scale.set(1.32, 0.76, 0.92);
  head.position.set(-0.065, 0, 0);
  bones[0].add(head);

  for (const z of [-0.095, 0.095]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.022, 8, 6), darkMaterial);
    eye.position.set(-0.015, 0.062, z);
    bones[0].add(eye);
  }
  addWhiskers(bones[0]);

  const finMaterial = new THREE.MeshStandardMaterial({
    color: 0x8f7950,
    roughness: 0.75,
    transparent: true,
    opacity: 0.82,
    side: THREE.DoubleSide,
  });
  for (const side of [-1, 1]) {
    const fin = new THREE.Mesh(finGeometry([
      [-0.18, -0.015, side * 0.07],
      [-0.42, -0.07, side * 0.28],
      [-0.34, 0.035, side * 0.1],
    ]), finMaterial);
    bones[1].add(fin);
  }
  const dorsal = new THREE.Mesh(finGeometry([
    [0.06, 0.065, 0],
    [-0.27, 0.22, 0],
    [-0.34, 0.06, 0],
  ]), finMaterial);
  bones[3].add(dorsal);
  const tail = new THREE.Mesh(finGeometry([
    [0.02, 0, 0],
    [-0.31, 0.18, 0],
    [-0.31, -0.18, 0],
  ]), finMaterial);
  bones[boneCount - 1].add(tail);

  markDynamic(group);
  const resident = { kind: "loach", label: "小泥鳅", group, bones, pickables: [] };
  group.traverse((child) => {
    if (child.isMesh || child.isLine) {
      child.userData.resident = resident;
      resident.pickables.push(child);
    }
  });
  return resident;
}

function createShrimp(index) {
  const group = markDynamic(new THREE.Group());
  group.name = `小虾 ${index + 1}`;
  const shell = material(index ? 0xd88965 : 0xe5a173, 0.62);
  const pale = material(0xffd8b0, 0.75);
  const dark = material(0x32261f, 0.5);
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 5), shell);
  body.scale.set(1.45, 0.7, 0.78);
  group.add(body);
  for (let i = 0; i < 3; i += 1) {
    const stripe = new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.012, 4, 12), pale);
    stripe.rotation.y = Math.PI / 2;
    stripe.position.x = -0.12 + i * 0.11;
    group.add(stripe);
  }
  const tail = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.25, 6), shell);
  tail.rotation.z = Math.PI / 2;
  tail.position.x = -0.27;
  group.add(tail);
  const eye = new THREE.Mesh(new THREE.SphereGeometry(0.018, 5, 4), dark);
  eye.position.set(0.19, 0.055, 0.08);
  group.add(eye);
  const resident = { kind: "shrimp", label: `小虾 ${index + 1}`, group, pickables: [] };
  for (const side of [-1, 1]) {
    for (let leg = 0; leg < 3; leg += 1) {
      const a = new THREE.Vector3(-0.08 + leg * 0.09, -0.05, side * 0.08);
      const b = new THREE.Vector3(-0.08 + leg * 0.09, -0.15, side * 0.22);
      const foot = cylinderBetween(a, b, 0.012, pale, 5);
      group.add(foot);
    }
  }
  group.traverse((child) => {
    if (child.isMesh) {
      child.userData.resident = resident;
      resident.pickables.push(child);
    }
  });
  return resident;
}

function createCrab(index, hermit = false) {
  const group = markDynamic(new THREE.Group());
  group.name = hermit ? `缺更寄居蟹 ${index + 1}` : `螃蟹 ${index + 1}`;
  const shell = material(hermit ? 0xb9835c : index ? 0xc36e55 : 0xe19b67, 0.78);
  const legMaterial = material(0x6d4938, 0.82);
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 5), shell);
  body.scale.set(1.32, 0.55, 0.88);
  group.add(body);
  if (hermit) {
    const shellCap = new THREE.Mesh(new THREE.SphereGeometry(0.17, 7, 5), material(0x9f765d, 0.9));
    shellCap.scale.set(1.15, 0.78, 1.02);
    shellCap.position.set(-0.06, 0.12, 0);
    group.add(shellCap);
  }
  for (const side of [-1, 1]) {
    for (let leg = 0; leg < 3; leg += 1) {
      const a = new THREE.Vector3(-0.08 + leg * 0.08, -0.05, side * 0.1);
      const b = new THREE.Vector3(-0.08 + leg * 0.08, -0.15, side * (0.24 + leg * 0.02));
      group.add(cylinderBetween(a, b, 0.017, legMaterial, 5));
    }
    const claw = new THREE.Mesh(new THREE.SphereGeometry(0.07, 6, 4), shell);
    claw.scale.set(1.25, 0.8, 0.8);
    claw.position.set(0.25, -0.01, side * 0.18);
    group.add(claw);
  }
  const resident = { kind: hermit ? "hermit" : "crab", label: group.name, group, pickables: [] };
  group.traverse((child) => {
    if (child.isMesh) {
      child.userData.resident = resident;
      resident.pickables.push(child);
    }
  });
  return resident;
}

function place(resident, x, z, scale = 1) {
  resident.group.position.set(x, groundHeight(x, z) + 0.16, z);
  resident.group.scale.setScalar(scale);
  resident.home = resident.group.position.clone();
}

export function createCritters(scene, { missingDays = 0 } = {}) {
  const loach = createLoach();
  const shrimp = [createShrimp(0), createShrimp(1)];
  const crabs = [createCrab(0), createCrab(1)];
  const hermits = Array.from({ length: Math.min(Math.max(missingDays, 0), 7) }, (_, index) => createCrab(index, true));
  const residents = [loach, ...shrimp, ...crabs, ...hermits];
  residents.forEach((resident) => scene.add(resident.group));

  place(loach, -1.4, 1.95, 1.06);
  place(shrimp[0], -4.7, 0.55, 0.95);
  place(shrimp[1], 4.6, 1.2, 0.9);
  place(crabs[0], -2.8, 2.15, 0.95);
  place(crabs[1], 3.3, 2.35, 0.9);
  hermits.forEach((resident, index) => place(resident, -5.7 + index * 1.75, 2.7 + (index % 2) * 0.18, 0.72));

  let loachT = 0.08;
  let loachAlert = 0;
  let loachStartle = 0;
  let loachDirection = 1;
  const path = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-5.2, 0, 2.25),
    new THREE.Vector3(-3.4, 0, 2.8),
    new THREE.Vector3(-0.7, 0, 2.45),
    new THREE.Vector3(2.1, 0, 2.75),
    new THREE.Vector3(5.1, 0, 2.2),
    new THREE.Vector3(2.5, 0, 1.65),
    new THREE.Vector3(-0.8, 0, 1.75),
  ], true, "catmullrom", 0.55);
  const nextPoint = new THREE.Vector3();
  const otherPoint = new THREE.Vector3();
  const direction = new THREE.Vector3();
  function updateLoach(dt, time, pointer) {
    let proximity = 0;
    if (pointer) {
      const distance = pointer.position.distanceTo(loach.group.position);
      proximity = 1 - THREE.MathUtils.smoothstep(distance, 1.15, 2.65);
      if (proximity > 0.12) {
        path.getPointAt((loachT + 0.018) % 1, nextPoint);
        path.getPointAt((loachT - 0.018 + 1) % 1, otherPoint);
        loachDirection = nextPoint.distanceTo(pointer.position) >= otherPoint.distanceTo(pointer.position) ? 1 : -1;
      }
    }
    const response = proximity > loachAlert ? 9 : 2.4;
    loachAlert += (proximity - loachAlert) * (1 - Math.exp(-dt * response));
    loachStartle = Math.max(0, loachStartle - dt * 1.7);
    const escape = Math.max(loachAlert, loachStartle);
    loachT = (loachT + loachDirection * dt * (0.0018 + escape * 0.036) + 1) % 1;
    const point = path.getPointAt(loachT);
    path.getPointAt((loachT + loachDirection * 0.002 + 1) % 1, nextPoint);
    direction.subVectors(nextPoint, point).normalize();
    const y = groundHeight(point.x, point.z) + 0.24 + Math.sin(time * 1.15) * 0.012;
    loach.group.position.set(point.x, y, point.z);
    loach.group.rotation.y = Math.atan2(-direction.z, direction.x);
    loach.group.rotation.z = Math.sin(time * 1.1) * 0.008;
    const gait = 0.72 + escape * 10.5;
    loach.bones.forEach((bone, index) => {
      const tailWeight = Math.pow(index / (loach.bones.length - 1), 1.45);
      bone.rotation.y = Math.sin(time * gait - index * 0.7) * (0.003 + tailWeight * (0.018 + escape * 0.16));
      bone.rotation.z = Math.sin(time * gait * 0.48 - index * 0.43) * tailWeight * (0.002 + escape * 0.024);
    });
  }
  function updateStationary(resident, time, index) {
    resident.group.position.y = resident.home.y + Math.sin(time * (1.2 + index * 0.07) + index) * 0.018;
    resident.group.rotation.y = Math.sin(time * 0.6 + index) * 0.08;
    resident.group.rotation.z = Math.sin(time * 1.7 + index) * 0.03;
  }
  function update(dt, time, pointer) {
    updateLoach(dt, time, pointer);
    shrimp.forEach((resident, index) => updateStationary(resident, time, index + 1));
    crabs.forEach((resident, index) => updateStationary(resident, time, index + 3));
    hermits.forEach((resident, index) => updateStationary(resident, time, index + 6));
  }
  function react(resident) {
    if (!resident) return;
    if (resident.kind === "loach") {
      loachStartle = 0.7;
    }
    resident.flash = 1;
  }
  return {
    residents,
    pickables: residents.flatMap((resident) => resident.pickables),
    update,
    react,
  };
}
