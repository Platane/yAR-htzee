import * as THREE from "three";
import { useFrame } from "react-three-fiber";

const isDirectional = (o: any): o is THREE.DirectionalLight =>
  o.isDirectionalLight;

export const useShadowResize = () => {
  useFrame(({ scene }) => {
    let shadowCamera: THREE.OrthographicCamera | undefined;
    scene.traverse((o) => {
      if (isDirectional(o) && o.castShadow) shadowCamera = o.shadow.camera;
    });

    box.setFromObject(scene.children[0]);

    if (!box.isEmpty() && shadowCamera) resizeCamera(shadowCamera, box);
  });
};

const getBoxCorner = (box: THREE.Box3, i: number, target: THREE.Vector3) =>
  target.set(
    (i >> 0) % 2 ? box.min.x : box.max.x,
    (i >> 1) % 2 ? box.min.y : box.max.y,
    (i >> 2) % 2 ? box.min.z : box.max.z
  );

const box = new THREE.Box3();
const frustum = new THREE.Box3();
const c = new THREE.Vector3();
const p = new THREE.Vector3();
const direction = new THREE.Vector3();

export const resizeCamera = (
  camera: THREE.OrthographicCamera,
  box: THREE.Box3
) => {
  camera.getWorldDirection(direction);

  frustum.makeEmpty();

  for (let i = 8; i--; ) {
    getBoxCorner(box, i, c);

    {
      p.copy(c);
      p.applyMatrix4(camera.matrixWorldInverse);
      frustum.expandByPoint(p);
    }

    {
      p.copy(c);
      const t = p.y / direction.y;
      p.addScaledVector(direction, -t);
      p.applyMatrix4(camera.matrixWorldInverse);
      frustum.expandByPoint(p);
    }
  }

  camera.left = frustum.min.x;
  camera.right = frustum.max.x;
  camera.top = frustum.min.y;
  camera.bottom = frustum.max.y;
  camera.far = -frustum.min.z + 0.01;
  camera.near = -frustum.max.z;

  camera.updateProjectionMatrix();
};
