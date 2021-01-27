import * as React from "react";
import { useFrame } from "react-three-fiber";
import * as THREE from "three";
import { stepSpring } from "../../game/spring";
import { path as refreshIconPath } from "../Ui/RefreshIcon";

const springParams = { tension: 120, friction: 8 };

const createTexture = async () => {
  const width = 256;
  const height = 256;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const img = new Image();
  const svg = `<svg viewBox="0 0 100 100" width="100" height="100" xmlns="http://www.w3.org/2000/svg"><path d="${refreshIconPath}" fill="#888"/></svg>`;
  const src = `data:image/svg+xml;base64,${btoa(svg)}`;

  await new Promise((resolve, reject) => {
    img.addEventListener("load", resolve);
    img.addEventListener("error", reject);
    img.src = src;
  });

  const ctx = canvas.getContext("2d")!;

  ctx.scale(width / 100, height / 100);

  ctx.beginPath();
  ctx.fillStyle = "#fff";
  ctx.arc(50, 50, 49, 0, 2 * Math.PI);
  ctx.fill();

  ctx.drawImage(img, 15, 15, 70, 70);

  return canvas;
};

let texture: THREE.Texture;
createTexture().then((t) => {
  texture = new THREE.CanvasTexture(
    t,
    THREE.UVMapping,
    THREE.ClampToEdgeWrapping,
    THREE.ClampToEdgeWrapping,
    THREE.LinearFilter,
    THREE.LinearFilter,
    THREE.RGBEFormat
  );
  texture.generateMipmaps = true;
});

export const SelectedDiceHint = ({ selected }: any) => {
  const spring = React.useRef({ x: 0, v: 0, target: 0 });
  spring.current.target = selected ? 1 : 0;

  useFrame(({ camera }, dt) => {
    stepSpring(spring.current, springParams, spring.current.target, dt);

    const [tube, panel] = ref.current?.children ?? [];

    if (!tube || !panel) return;

    const { x } = spring.current;

    const kTube = Math.min(0.5, x) / 0.5;
    const kPanel = Math.max(0, (x - 0.5) / 0.5);

    tube.position.y = kTube * 0.5;
    tube.scale.setScalar(Math.max(0.001, kTube));
    panel.scale.setScalar(Math.max(0.001, kPanel));

    panel.lookAt(camera.position);
  });

  const ref = React.useRef<THREE.Object3D>();

  return (
    <group ref={ref}>
      <mesh rotation={[0, 0, 0]} position={[0, 0.5, 0]}>
        <cylinderBufferGeometry args={[0.04, 0.04, 1.6, 5]} />
        <meshBasicMaterial color={"orange"} />
      </mesh>

      <group position={[0, 1.4, 0]}>
        <mesh>
          <planeBufferGeometry args={[0.6, 0.6, 1, 1]} />
          <meshBasicMaterial map={texture} transparent />
        </mesh>

        <mesh position={[0, 0, -0.01]}>
          <circleBufferGeometry args={[0.4, 32]} />
          <meshBasicMaterial color="orange" />
        </mesh>
      </group>
    </group>
  );
};
