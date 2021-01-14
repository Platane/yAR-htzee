import * as React from "react";
import { useState } from "react";
import { Dice } from "../Dice";
import { XR8Canvas } from "../XR8Canvas/XR8Canvas";

const xr8ApiKey = process.env.XR8_API_KEY!;

export const App = ({ visible, onReady }: any) => {
  const [error, setError] = useState<Error>();
  if (error) throw error;

  return (
    <>
      <XR8Canvas
        xr8ApiKey={xr8ApiKey}
        onReady={onReady}
        onError={setError as any}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: visible ? 1 : 0,
        }}
      >
        <ErrorBoundary onError={setError}>
          <ambientLight />
          <pointLight position={[10, 10, 10]} />
          <mesh position={[1, 0, 2]}>
            <boxBufferGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color={"orange"} />
          </mesh>

          <Dice />
        </ErrorBoundary>
      </XR8Canvas>

      {visible && (
        <div style={{ position: "absolute", left: 0, top: 0, zIndex: 1 }}>
          <h1>app</h1>
        </div>
      )}
    </>
  );
};

class ErrorBoundary extends React.Component<{
  onError: (error: Error) => void;
}> {
  componentDidCatch(error: Error) {
    this.props.onError(error);
  }

  render() {
    return this.props.children;
  }
}

export default App;
