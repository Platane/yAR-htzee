import * as React from "react";
import { Dice } from "./Dice";
import { Api, Physics, useBox, usePlane } from "@react-three/cannon";
import { useFrame } from "react-three-fiber";
import { getDiceUpFace } from "../utils/getDiceFaceUp";

type Props = {};

export const Game = ({}: Props) => {
  return (
    <>
      <Physics>
        <Plane />
        <Dices />
      </Physics>
    </>
  );
};

const useSystemStability = (boxes: Api[], onStable: () => void) => {
  const sleep = React.useRef({ stableVelocities: [false], k: 0 });

  useFrame(() => {
    if (sleep.current.stableVelocities.every(Boolean)) sleep.current.k++;
    else sleep.current.k = 0;

    if (sleep.current.k === 10) onStable();
  });

  React.useEffect(() => {
    const unsubscribes: any[] = boxes
      .map(([, api], i) => {
        return [
          api.velocity.subscribe((v) => {
            sleep.current.stableVelocities[i * 2 + 0] = Math.hypot(...v) < 0.04;
          }),
          api.angularVelocity.subscribe((v) => {
            sleep.current.stableVelocities[i * 2 + 1] = Math.hypot(...v) < 0.12;
          }),
        ];
      })
      .flat();

    const unsubscribeAll = () => unsubscribes.forEach((u) => u());

    return unsubscribeAll;
  }, []);
};

const Dices = () => {
  const boxes = Array.from({ length: 6 }, () =>
    useBox(() => ({
      mass: 1,
      args: [0.2, 0.2, 0.2],
    }))
  );

  const roll = () => {
    boxes.forEach(([_, api]) => {
      api.position.set(
        (Math.random() - 0.5) * 0.5,
        1 + Math.random() * 1,
        (Math.random() - 0.5) * 0.5 + 2
      );
      api.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );
      api.velocity.set(0, 0, -3.5);
      api.angularVelocity.set(Math.random(), 0, 0);
    });
  };

  React.useEffect(roll, []);

  useSystemStability(boxes, () => {
    console.log(boxes.map(([ref]) => getDiceUpFace(ref.current)));
    roll();
  });

  return (
    <>
      {boxes.map(([ref], i) => (
        <group ref={ref} key={i}>
          <Dice scale={[0.1, 0.1, 0.1]}></Dice>
        </group>
      ))}
    </>
  );
};

const Plane = () => {
  const [ref] = usePlane(() => ({ rotation: [-Math.PI / 2, 0, 0] }));

  return (
    <mesh ref={ref} visible={false}>
      <planeBufferGeometry attach="geometry" args={[1009, 1000]} />
      <meshStandardMaterial attach="material" color="#171717" />
    </mesh>
  );
};
