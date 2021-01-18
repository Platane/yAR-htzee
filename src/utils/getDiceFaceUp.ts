import * as THREE from "three";

const normals = [
  { value: 1, normal: new THREE.Vector3(0, 1, 0) },
  { value: 2, normal: new THREE.Vector3(1, 0, 0) },
  { value: 3, normal: new THREE.Vector3(0, 0, -1) },
  { value: 4, normal: new THREE.Vector3(0, 0, 1) },
  { value: 5, normal: new THREE.Vector3(-1, 0, 0) },
  { value: 6, normal: new THREE.Vector3(0, -1, 0) },
];

const m = new THREE.Matrix3();
const up = new THREE.Vector3(0, 1, 0);
const tmp = new THREE.Vector3();

export const getDiceUpFace = (object: THREE.Object3D) => {
  m.setFromMatrix4(object.matrixWorld);

  const [{ value }] = normals
    .map(({ value, normal }) => {
      const h = tmp.copy(normal).applyMatrix3(m).dot(up);
      return { h, value };
    })
    .sort((a, b) => b.h - a.h);

  return value;
};
