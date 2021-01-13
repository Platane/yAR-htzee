import * as React from "react";
import * as THREE from "three";
import { useRef, useEffect } from "react";
import {
  Canvas,
  CanvasProps,
  useFrame,
  useThree,
  stateContext,
} from "react-three-fiber";
import { loadXR8 } from "./getXR8";
import { XR8 } from "./XR8";

export const XR8Canvas = ({
  children,
  xr8ApiKey,
  onReady,
  onError,
  ...props
}: XR8Props & CanvasProps & React.HTMLAttributes<HTMLDivElement>) => (
  <Canvas {...props}>
    <InsideCanvas onReady={onReady} onError={onError} xr8ApiKey={xr8ApiKey} />
    {children}
  </Canvas>
);

type XR8Props = {
  xr8ApiKey: string;
  onReady?: () => void;
  onError?: (error: Error) => void;
};

const InsideCanvas = ({ onReady, onError, xr8ApiKey }: XR8Props) => {
  const { gl: renderer, scene, subscribe, camera } = useThree();

  // as we subscribe with a priority,
  // react-tree-fiber allows us to replace the render function
  // replace it with a void function, as the render loop is handled by XR8
  const voidRenderCallback = useRef(() => undefined);
  useEffect(() => subscribe(voidRenderCallback, 1), [subscribe]);
  const canvas = renderer.domElement;

  // config renderer
  renderer.autoClear = false;

  // hold callback as reference, to have the latest version in the next closure
  const callbackEvents = useRef({ onReady, onError });
  callbackEvents.current.onReady = onReady;
  callbackEvents.current.onError = onError;

  useEffect(() => {
    let canceled = false;
    let trackingReadyCalled = false;
    let xr8: XR8;

    loadXR8(xr8ApiKey)
      .then((x) => {
        if (canceled) return;

        xr8 = x;

        xr8.clearCameraPipelineModules();
        xr8.addCameraPipelineModules([
          //
          xr8.GlTextureRenderer.pipelineModule(),
          xr8.XrController.pipelineModule(),
          {
            name: "custom-three-fiber",
            onException: onError,
            onStart: ({ GLctx, canvasWidth, canvasHeight }) => {
              if (GLctx !== renderer.context)
                throw new Error("context do not match");

              renderer.setSize(canvasWidth, canvasHeight);
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
                camera.projectionMatrixInverse
                  .copy(camera.projectionMatrix)
                  .invert();

                if (rotation) camera.setRotationFromQuaternion(rotation as any);
                if (position) camera.position.copy(position as any);
                camera.matrixWorldNeedsUpdate = true;

                if (
                  !trackingReadyCalled &&
                  (trackingStatus === "NORMAL" || trackingStatus === "LIMITED")
                ) {
                  trackingReadyCalled = true;
                  callbackEvents.current.onReady?.();
                }
              }
            },
            onRender: () => {
              if (!renderer) return;

              renderer.clearDepth();
              renderer.render(scene, camera);
            },
          },
        ]);

        xr8.run({
          canvas,
          // cameraConfig: {
          //   direction: XR8.XrConfig.camera().BACK,
          // },
          // glContextConfig: webglOptions,
        });
      })
      .catch((error) => {
        if (canceled) return;
        callbackEvents.current.onError?.(error);
      });

    return () => {
      canceled = true;
      xr8.stop();
    };
  }, [canvas, xr8ApiKey]);

  return null;
};
