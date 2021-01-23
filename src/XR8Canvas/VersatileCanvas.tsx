import { OrbitControls } from "drei";
import * as React from "react";
import { Canvas } from "react-three-fiber";
import { Props, XR8Canvas } from "./XR8Canvas";

export const VersatileCanvas = ({
  children,
  xr8ApiKey,
  onReady,
  onError,
  ...props
}: Props) => {
  if ("ontouchend" in document && xr8ApiKey)
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
