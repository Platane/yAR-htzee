import * as React from "react";
import {
  Canvas,
  CanvasProps,
  useThree,
  stateContext,
  RenderCallback,
  CanvasContext,
} from "react-three-fiber";
import { loadXR8 } from "./getXR8";
import { XR8 } from "./XR8";

export type Props = XR8Props &
  CanvasProps &
  React.HTMLAttributes<HTMLDivElement>;

/**
 * a react-three-fiber canvas,
 * - draw the camera feed on canvas, then draw the 3d world over
 * - update the camera with 8thwall world tracking info
 *
 *
 * Implementation:
 * Use 8thwall render loop.
 * Disable react-three-fiber internal loop, still allows for subscription to frame update with mock to use 8thwall update instead.
 * Use the same canvas for 8thwall gl context, and react-three-fiber renderer. Assume the context is the same as long as we pass the same canvas.
 */
export const XR8Canvas = ({
  children,
  xr8ApiKey,
  onReady,
  onError,
  ...props
}: Props) => (
  <Canvas {...props}>
    <InsideCanvas onReady={onReady} onError={onError} xr8ApiKey={xr8ApiKey}>
      {children}
    </InsideCanvas>
  </Canvas>
);

type XR8Props = {
  xr8ApiKey: string;
  onReady?: () => void;
  onError?: (error: Error) => void;
};

const InsideCanvas = ({
  onReady,
  onError,
  xr8ApiKey,
  children,
}: XR8Props & { children: any }) => {
  const { gl: renderer, scene, subscribe, camera } = useThree();

  // as we subscribe with a priority,
  // react-tree-fiber allows us to replace the render function
  // replace it with a void function, as the render loop is handled by XR8
  const contextRef = React.useRef<CanvasContext>();
  const voidRenderCallback = React.useRef((c: CanvasContext) => {
    contextRef.current = c;
  });
  React.useEffect(() => subscribe(voidRenderCallback, 1), [subscribe]);
  const canvas = renderer.domElement;

  // config renderer
  renderer.autoClear = false;

  // hold callback as reference, to have the latest version in the next closure
  const callbackEvents = React.useRef({ onReady, onError });
  callbackEvents.current.onReady = onReady;
  callbackEvents.current.onError = onError;

  React.useEffect(() => {
    let canceled = false;
    let trackingReadyCalled = false;
    let xr8: XR8;

    const onBlur = () => xr8?.pause();
    const onFocus = () => xr8?.resume();
    window.addEventListener("blur", onBlur);
    window.addEventListener("focus", onFocus);

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

              xr8.XrController.updateCameraProjectionMatrix({
                origin: camera.position,
                facing: camera.quaternion,
              });
            },
            onCanvasSizeChange: ({ canvasWidth, canvasHeight }) => {
              renderer.setSize(canvasWidth, canvasHeight);
            },
            onUpdate: ({ processCpuResult, fps }) => {
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

                const context = contextRef.current;
                if (context)
                  subscribers.current.forEach(({ ref }) =>
                    ref.current(context, 1 / fps)
                  );
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
        });
      })
      .catch((error) => {
        if (canceled) return;
        callbackEvents.current.onError?.(error);
      });

    return () => {
      canceled = true;
      xr8?.stop();
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("focus", onFocus);
    };
  }, [canvas, xr8ApiKey]);

  const subscribers = React.useRef<
    { ref: React.MutableRefObject<RenderCallback>; priority: number }[]
  >([]);

  const originalContext = React.useContext(stateContext);

  const patchedContext = {
    ...originalContext,

    subscribe: (ref: React.MutableRefObject<RenderCallback>, priority = 0) => {
      subscribers.current.push({ ref, priority: priority });
      subscribers.current.sort((a, b) => a.priority - b.priority);

      return () => {
        const i = subscribers.current.findIndex((x) => x.ref === ref);
        if (i >= 0) subscribers.current.splice(i, 1);
      };
    },
  };

  return (
    <stateContext.Provider value={patchedContext}>
      {children}
    </stateContext.Provider>
  );
};
