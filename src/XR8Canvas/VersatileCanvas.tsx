import { OrbitControls } from "drei";
import * as React from "react";
import { Canvas } from "react-three-fiber";
import { xr8Hosted } from "./getXR8";
import { Props, XR8Canvas } from "./XR8Canvas";

/**
 * delegate to XR8Canvas if possible ( ie: the device is mobile (lazy test) and 8thwall sdk can be loaded )
 * fallback to react-three-fiber simple canvas otherwise
 */
export const VersatileCanvas = ({
  children,
  xr8ApiKey,
  onReady,
  onError,
  ...props
}: Props) => {
  if ("ontouchend" in document && (xr8ApiKey || xr8Hosted))
    return (
      <XR8Canvas
        xr8ApiKey={xr8ApiKey}
        onReady={onReady}
        onError={onError}
        {...props}
      >
        {children}
      </XR8Canvas>
    );

  React.useEffect(() => {
    onReady?.();
  }, []);

  return (
    <Canvas {...props}>
      {false && <OrbitControls />}
      {children}
    </Canvas>
  );
};
