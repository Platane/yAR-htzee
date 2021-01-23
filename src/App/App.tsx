import * as React from "react";
import { Environment, Stats, useProgress } from "drei";
import { Board } from "./Board";
import * as THREE from "three";
import { VersatileCanvas } from "../XR8Canvas/VersatileCanvas";

const xr8ApiKey = process.env.XR8_API_KEY!;

type Props = { onReady: () => void };

export const App = ({ onReady }: Props) => {
  const [error, setError] = React.useState<Error>();
  if (error) throw error;

  const [placed, setPlaced] = React.useState(false);

  const [xr8Ready, setXr8Ready] = React.useState(false);
  const { active } = useProgress();
  const ready = xr8Ready && !active;
  React.useEffect(() => {
    if (ready) onReady();
  }, [ready]);

  return (
    <>
      <Stats />

      <VersatileCanvas
        xr8ApiKey={xr8ApiKey}
        onReady={() => setXr8Ready(true)}
        onError={setError as any}
        camera={{ position: new THREE.Vector3(0, 6, 6) }}
        shadowMap
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: ready ? 1 : 0,
        }}
      >
        <ErrorBoundary onError={setError}>
          <directionalLight position={[10, 10, 10]} castShadow />

          {false && (
            <React.Suspense fallback={null}>
              <Environment preset="apartment" />
            </React.Suspense>
          )}

          <React.Suspense fallback={null}>
            <Board placed={placed} onPlace={() => setPlaced(true)} />
          </React.Suspense>
        </ErrorBoundary>
      </VersatileCanvas>

      {ready && (
        <div style={{ position: "absolute", left: 0, top: 0, zIndex: 1 }}>
          <h1>app</h1>
          <button
            style={{ padding: "10px" }}
            onClick={() => setPlaced((x) => !x)}
          >
            {placed ? "reposition board" : "place board"}
          </button>
        </div>
      )}
    </>
  );
};

// <Board placed={placed} />

class ErrorBoundary extends React.Component<{
  onError: (error: Error) => void;
}> {
  static getDerivedStateFromError = (error: Error) => ({ error });

  state: { error?: Error } = {};

  componentDidCatch(error: Error) {
    this.props.onError(error);
  }

  render() {
    if (this.state.error) return null;
    return this.props.children;
  }
}

export default App;
