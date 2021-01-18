import { useGLTF } from "drei";
import * as React from "react";

const diceUrl = "/dice.glb";

useGLTF.preload(diceUrl);

export const Dice = (props: any) => {
  const gltf = useGLTF(diceUrl);

  React.useEffect(() => {
    gltf.scene.traverse((o) => {
      o.castShadow = true;
      // o.receiveShadow = true;
    });
  }, [gltf.scene]);

  return <primitive scale={[0.2, 0.2, 0.2]} {...props} object={gltf.scene} />;
};

// import { useLoader } from "react-three-fiber";
// import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
// import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter";
// import * as THREE from "three";
// const loader = new GLTFLoader();
// loader
//   .loadAsync(diceUrl)
//   .then(async ({ scene }) => {
//     const e = new GLTFExporter();
//     const binary = await new Promise<any>((resolve) =>
//       e.parse(scene, resolve, { binary: true })
//     );

//     // Create an invisible A element
//     const a = document.createElement("a");
//     a.style.display = "none";
//     document.body.appendChild(a);

//     // Set the HREF to a Blob representation of the data to be downloaded
//     a.href = window.URL.createObjectURL(new Blob([binary]));

//     // Use download attribute to set set desired file name
//     a.setAttribute("download", "a.glb");

//     // Trigger the download by simulating click
//     a.click();

//     // Cleanup
//     window.URL.revokeObjectURL(a.href);
//     document.body.removeChild(a);
//   })
//   .catch(console.error);
