import * as React from "react";
import { useThree, useFrame } from "@react-three/fiber";
import type * as THREE from "three";
import type { XR8, XR8Pipeline } from "./XR8";

export const XR8Controls = ({
  onReady,
  xr8,
}: {
  xr8: XR8;
  onReady?: () => void;
}) => {
  const [error, setError] = React.useState<Error>();
  if (error) throw error;

  const { gl, scene, camera } = useThree();

  // start / stop
  React.useLayoutEffect(() => {
    if (!xr8) return;

    gl.autoClear = false;

    xr8.clearCameraPipelineModules();
    xr8.addCameraPipelineModules([
      //
      xr8.GlTextureRenderer.pipelineModule(),
      xr8.XrController.pipelineModule(),
      createCustomPipeline(
        gl as any,
        camera,
        scene,
        xr8,

        setError,
        onReady
      ),
    ]);

    xr8.run({ canvas: gl.domElement, ownRunLoop: true });

    return () => {
      gl.autoClear = true;
      xr8.stop();
    };
  }, []);

  // pause on blur
  React.useLayoutEffect(() => {
    if (!xr8) return;

    const onBlur = () => xr8.pause();
    const onFocus = () => xr8.resume();
    window.addEventListener("blur", onBlur);
    window.addEventListener("focus", onFocus);

    return () => {
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("focus", onFocus);
    };
  }, [xr8]);

  useFrame(({ gl }, dt) => {
    if (xr8 && !xr8.isPaused() && (gl as any).xr8Started) {
      xr8.runPreRender(dt);
      xr8.runPostRender(dt);
    }
  }, 1);

  return null;
};

const createCustomPipeline = (
  renderer: THREE.WebGLRenderer & { xr8Started: boolean },
  camera: THREE.Camera,
  scene: THREE.Scene,
  xr8: XR8,

  onError: (error: Error) => void,
  onTrackingReady?: () => void
) => {
  let trackingReadyCalled = false;

  (renderer as any).xr8Started = false;

  const pipeline: XR8Pipeline = {
    name: "custom-three-fiber",
    onException: onError,
    onStart: ({ GLctx, canvasWidth, canvasHeight }) => {
      if (GLctx !== renderer.getContext())
        throw new Error("context do not match");

      renderer.setSize(canvasWidth, canvasHeight);

      xr8.XrController.updateCameraProjectionMatrix({
        origin: camera.position,
        facing: camera.quaternion,
      });

      (renderer as any).xr8Started = true;
    },
    onDetach: () => {
      (renderer as any).xr8Started = false;
    },

    onCanvasSizeChange: ({ canvasWidth, canvasHeight }) => {
      renderer.setSize(canvasWidth, canvasHeight);
    },
    onUpdate: ({ processCpuResult }) => {
      // update camera position
      if (processCpuResult?.reality) {
        const {
          reality: { rotation, position, intrinsics, trackingStatus },
        } = processCpuResult;

        for (let i = 0; i < 16; i += 1)
          camera.projectionMatrix.elements[i] = intrinsics[i];
        camera.projectionMatrixInverse.copy(camera.projectionMatrix).invert();

        if (rotation) camera.setRotationFromQuaternion(rotation as any);
        if (position) camera.position.copy(position as any);
        camera.matrixWorldNeedsUpdate = true;

        if (
          !trackingReadyCalled &&
          (trackingStatus === "NORMAL" || trackingStatus === "LIMITED")
        ) {
          trackingReadyCalled = true;
          onTrackingReady?.();
        }
      }
    },
    onRender: () => {
      if (!renderer) return;

      renderer.clearDepth();
      renderer.render(scene, camera);
    },
  };

  return pipeline;
};
