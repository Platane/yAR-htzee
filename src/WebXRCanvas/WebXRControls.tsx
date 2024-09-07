import * as React from "react";
import { useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * true if webXR is supported
 */
export const useIsWebXRSupported = () => {
  const [isSupported, setIsSupported] = React.useState<boolean | "loading">(
    "loading"
  );
  React.useLayoutEffect(() => {
    if (!navigator.xr) setIsSupported(false);
    else navigator.xr.isSessionSupported("immersive-ar").then(setIsSupported);
  }, []);
  return isSupported;
};

/**
 *
 */
export const useWebXRSession = (options?: XRSessionInit) => {
  const [session, setSession] = React.useState<XRSession>();

  const [error, setError] = React.useState<Error>();
  if (error) throw error;

  const init = React.useCallback(async () => {
    const navigatorXR = navigator.xr;

    if (
      !navigatorXR ||
      (await navigatorXR.isSessionSupported("immersive-ar")) !== true
    ) {
      setError(new Error("webxr unsupported"));
      return;
    }

    return navigatorXR
      .requestSession("immersive-ar", options)
      .then(setSession)
      .catch(setError);
  }, []);

  return { init, session };
};

export const WebXRControls = ({
  webXRSession,
  onPoseFound,
}: {
  webXRSession: XRSession;
  onPoseFound?: () => void;
}) => {
  const [error, setError] = React.useState<Error>();
  if (error) throw error;

  const {
    gl: renderer,
    scene,
    camera,
    advance,
    setFrameloop,
    events,
  } = useThree();

  const viewRef = React.useRef<XRView>();

  useFrame(() => {
    const view = viewRef.current;

    if (view) {
      const glLayer = webXRSession.renderState.baseLayer!;

      const gl = renderer.getContext();

      const viewport = glLayer.getViewport(view)!;

      renderer.setViewport(
        viewport.x,
        viewport.y,
        viewport.width,
        viewport.height
      );

      // TODO create this outside the loop
      const newRenderTarget = new THREE.WebGLRenderTarget(
        glLayer.framebufferWidth,
        glLayer.framebufferHeight,
        {
          format: THREE.RGBAFormat,
          type: THREE.UnsignedByteType,
          colorSpace: renderer.outputColorSpace,
          stencilBuffer: gl.getContextAttributes()?.stencil,
        }
      );

      // console.log("render");

      renderer.setRenderTargetFramebuffer(newRenderTarget, glLayer.framebuffer);
      renderer.setRenderTarget(newRenderTarget);

      renderer.render(scene, camera);
    }
  }, 1);

  React.useLayoutEffect(() => {
    const gl = renderer.getContext();

    gl.makeXRCompatible()
      .then(() => {
        webXRSession.updateRenderState({
          baseLayer: new XRWebGLLayer(webXRSession, gl),
        });
      })
      .catch(setError);

    let localReference: XRReferenceSpace;

    webXRSession
      .requestReferenceSpace("local-floor")
      .then((r) => {
        localReference = r;

        localReference.addEventListener("reset", ({ transform }) => {
          if (transform)
            localReference = localReference.getOffsetReferenceSpace(transform);
        });
      })
      .catch(setError);

    let cancel: number;
    let lastTime: number;
    let origin: THREE.Vector3 | undefined;

    const projectionMatrix = new THREE.Matrix4();
    const depthCorrection = new THREE.Matrix4();
    depthCorrection.makeScale(1, 1, 0.001);

    const onXRFrame = (t: number, frame: XRFrame) => {
      const dt = t - (lastTime ?? t);
      lastTime = t;

      const pose = localReference && frame.getViewerPose(localReference);

      if (pose) {
        const view = pose.views[0];
        viewRef.current = view;

        const l = 4;
        camera.position.set(
          view.transform.position.x * l,
          view.transform.position.y * l,
          view.transform.position.z * l
        );
        camera.quaternion.set(
          view.transform.orientation.x,
          view.transform.orientation.y,
          view.transform.orientation.z,
          view.transform.orientation.w
        );

        camera.updateMatrix();
        camera.updateMatrixWorld();

        if (!origin) {
          // define origin,
          // a point on the ground
          const v = new THREE.Vector3(0, 0, -1);
          v.applyQuaternion(camera.quaternion);
          v.normalize();

          const t = -camera.position.y / v.y;

          if (t > 0) {
            origin = new THREE.Vector3()
              .copy(camera.position)
              .addScaledVector(v, t);

            console.log("found");
            onPoseFound?.();
          }
        }

        projectionMatrix
          .set(...view.projectionMatrix)
          .multiply(depthCorrection);

        // camera.projectionMatrix.copy(projectionMatrix);
        // camera.projectionMatrixInverse.copy(camera.projectionMatrix).invert();

        advance(dt);
      }

      cancel = webXRSession.requestAnimationFrame(onXRFrame);
    };

    cancel = webXRSession.requestAnimationFrame(onXRFrame);
    setFrameloop("never");

    events.connect?.(window);

    return () => {
      setFrameloop("always");
      webXRSession.cancelAnimationFrame(cancel);
    };
  }, [webXRSession, renderer]);

  return null;
};
