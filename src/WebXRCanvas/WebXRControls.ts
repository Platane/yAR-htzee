import * as React from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

export const WebXRControls = ({
  webXRSession,
  worldSize = 1,
  onPoseFound,
  onCameraFeedDisplayed,
}: {
  webXRSession: XRSession;
  worldSize?: number;

  onPoseFound?: () => void;
  onCameraFeedDisplayed?: () => void;
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

  // let webXR control the render loop
  // ie: do nothing on react-three-fiber render loop
  useFrame(() => {
    // do nothing
  }, 1);

  React.useLayoutEffect(() => {
    const gl = renderer.getContext();

    const originalRenderTarget = renderer.getRenderTarget();

    //
    // create the XRWebGLLayer, bind three render target to it
    gl.makeXRCompatible()
      .then(() => {
        const baseLayer = new XRWebGLLayer(webXRSession, gl);

        const newRenderTarget = new THREE.WebGLRenderTarget(
          baseLayer.framebufferWidth,
          baseLayer.framebufferHeight,
          {
            format: THREE.RGBAFormat,
            type: THREE.UnsignedByteType,
            colorSpace: renderer.outputColorSpace as THREE.ColorSpace,
            stencilBuffer: gl.getContextAttributes()?.stencil,
          }
        );

        // @ts-ignore
        renderer.setRenderTargetFramebuffer(
          newRenderTarget,
          baseLayer.framebuffer
        );
        renderer.setRenderTarget(newRenderTarget);

        return webXRSession.updateRenderState({ baseLayer });
      })
      .catch(setError);

    //
    // ask webXR for a local reference, (which we can then use to have the camera transform)
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

    let cancelAnimationFrame: number;
    let lastTimestampMs: number;
    let renderCount = 0;
    let poseFound = false;

    const onXRFrame: XRFrameRequestCallback = (timestampMs, frame) => {
      const pose = localReference && frame.getViewerPose(localReference);

      const view = pose?.views[0];
      const glLayer = webXRSession.renderState.baseLayer;

      // check view exist (ie: tracking is ready)
      if (view && glLayer) {
        const viewport = glLayer.getViewport(view)!;

        renderer.setViewport(
          viewport.x,
          viewport.y,
          viewport.width,
          viewport.height
        );

        camera.position.set(
          view.transform.position.x * worldSize,
          view.transform.position.y * worldSize,
          view.transform.position.z * worldSize
        );
        camera.quaternion.set(
          view.transform.orientation.x,
          view.transform.orientation.y,
          view.transform.orientation.z,
          view.transform.orientation.w
        );

        for (let i = 16; i--; )
          camera.projectionMatrix.elements[i] = view.projectionMatrix[i];
        camera.projectionMatrixInverse.copy(camera.projectionMatrix).invert();

        camera.matrixWorldNeedsUpdate = true;

        if (!poseFound) {
          onPoseFound?.();
          poseFound = true;
        }

        const dt = (timestampMs - (lastTimestampMs ?? timestampMs)) / 1000;
        lastTimestampMs = timestampMs;
        advance(dt);

        renderer.clearDepth();
        renderer.render(scene, camera);
      }

      // there must be a better way to know when the camera feed is drawn
      if (renderCount >= 10) {
        onCameraFeedDisplayed?.();
        renderCount++;
      } else renderCount++;

      cancelAnimationFrame = webXRSession.requestAnimationFrame(onXRFrame);
    };

    cancelAnimationFrame = webXRSession.requestAnimationFrame(onXRFrame);
    setFrameloop("never");

    // the renderer.domElement is no longer receiving events,
    // connect to window instead
    events.connect?.(window);

    console.log(webXRSession.supportedFrameRates, webXRSession.domOverlayState);
    webXRSession.addEventListener("visibilitychange", () =>
      console.log(webXRSession.visibilityState)
    );
    webXRSession.addEventListener("end", () => console.log("end"));

    return () => {
      renderer.setRenderTarget(originalRenderTarget);

      setFrameloop("always");
      webXRSession.cancelAnimationFrame(cancelAnimationFrame);
    };
  }, [webXRSession, renderer]);

  return null;
};
