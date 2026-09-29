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

function addWhiskers(group, materialRef) {
  const lineMaterial = new THREE.LineBasicMaterial({ color: 0xb7a277, transparent: true, opacity: 0.75 });
  const anchors = [
    [0.13, 0.035, 0.09, 0.35, 0.1, 0.17],
    [0.13, 0.035, -0.09, 0.35, 0.1, -0.17],
    [0.1, -0.015, 0.09, 0.31, -0.08, 0.16],
    [0.1, -0.015, -0.09, 0.31, -0.08, -0.16],
  ];
  for (const [x1, y1, z1, x2, y2, z2] of anchors) {
    const geometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(x1, y1, z1),
      new THREE.Vector3(x2, y2, z2),
    ]);
    const line = new THREE.Line(geometry, lineMaterial);
    line.userData.dynamic = true;
    line.userData.whiskerMaterial = materialRef;
    group.add(line);
  }
}

function createLoach() {
  const group = markDynamic(new THREE.Group());
  group.name = "常驻小泥鳅";
  const bodyMaterial = material(0x746544, 0.86);
  const bellyMaterial = material(0xb6a27a, 0.92);
  const darkMaterial = material(0x1c211d, 0.58);
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.14, 0.76, 4, 10), bodyMaterial);
  body.rotation.z = Math.PI / 2;
  body.scale.set(1, 0.72, 0.72);
  body.position.x = -0.02;
  group.add(body);

  const belly = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 5), bellyMaterial);
  belly.scale.set(2.7, 0.52, 0.8);
  belly.position.set(0.08, -0.055, 0);
  group.add(belly);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.16, 9, 6), bodyMaterial);
  head.scale.set(1.15, 0.82, 0.82);
  head.position.x = 0.45;
  group.add(head);

  const tail = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.36, 7), bodyMaterial);
  tail.rotation.z = -Math.PI / 2;
  tail.position.x = -0.58;
  tail.scale.set(1, 0.72, 0.72);
  group.add(tail);

  for (const z of [-0.095, 0.095]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.026, 6, 4), darkMaterial);
    eye.position.set(0.54, 0.07, z);
    group.add(eye);
  }
  addWhiskers(group, bodyMaterial);

  const resident = { kind: "loach", label: "小泥鳅", group, pickables: [] };
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

  place(loach, -1.4, 1.95, 1.28);
  place(shrimp[0], -4.7, 0.55, 0.95);
  place(shrimp[1], 4.6, 1.2, 0.9);
  place(crabs[0], -2.8, 2.15, 0.95);
  place(crabs[1], 3.3, 2.35, 0.9);
  hermits.forEach((resident, index) => place(resident, -5.7 + index * 1.75, 2.7 + (index % 2) * 0.18, 0.72));

  let loachT = 0.08;
  let loachDash = 0;
  let loachFlash = 0;
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
  const direction = new THREE.Vector3();
  function updateLoach(dt, time, pointer) {
    if (pointer && pointer.position.distanceTo(loach.group.position) < 2.2) loachDash = Math.max(loachDash, 0.65);
    loachDash = Math.max(0, loachDash - dt * 0.22);
    loachT = (loachT + dt * (0.012 + loachDash * 0.042)) % 1;
    const point = path.getPointAt(loachT);
    path.getPointAt((loachT + 0.002) % 1, nextPoint);
    direction.subVectors(nextPoint, point).normalize();
    const y = groundHeight(point.x, point.z) + 0.22 + Math.sin(time * 4.2) * 0.024;
    loach.group.position.set(point.x, y, point.z);
    loach.group.rotation.y = Math.atan2(-direction.z, direction.x);
    loach.group.rotation.z = Math.sin(time * 8.5) * 0.035 + loachDash * Math.sin(time * 25) * 0.12;
    loach.group.scale.setScalar(1.28 + Math.sin(time * 3.5) * 0.015 + loachFlash * 0.12);
    loachFlash = Math.max(0, loachFlash - dt * 1.8);
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
      loachDash = 1.2;
      loachFlash = 1;
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
