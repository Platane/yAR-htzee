import * as React from "react";
import { Environment } from "drei";
import { XR8Canvas } from "../XR8Canvas/XR8Canvas";
import { Board } from "./Board";

const xr8ApiKey = process.env.XR8_API_KEY!;
const envmapUrl = "equirectangular.png";

type Props = { ready: boolean; onReady: () => void };

export const App = ({ ready, onReady }: Props) => {
  const [error, setError] = React.useState<Error>();
  if (error) throw error;

  const [placed, setPlaced] = React.useState(false);

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
          opacity: ready ? 1 : 0,
        }}
      >
        <ErrorBoundary onError={setError}>
          {false && <ambientLight />}

          {false && <directionalLight position={[10, 10, 10]} />}

          <React.Suspense fallback={null}>
            <Environment preset="apartment" />
          </React.Suspense>

          <Board placed={placed} onPlace={() => setPlaced(true)} />
        </ErrorBoundary>
      </XR8Canvas>

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
