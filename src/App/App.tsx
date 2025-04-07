import * as React from "react";
import * as THREE from "three";
import { Environment, useProgress } from "@react-three/drei";
import { GithubLogo } from "./Ui/GithubLogo";
import { Canvas, createPortal, useFrame, useThree } from "@react-three/fiber";
import { XR8Controls } from "../XR8Canvas/XR8Controls";
import { useXR8 } from "../XR8Canvas/useXR8";
import { xr8Hosted } from "../XR8Canvas/getXR8";
import { Game } from "./Game";
import { Dice } from "./Scene/Dice";
// @ts-ignore
import { Visualizer } from "react-touch-visualizer";
import tunnel from "tunnel-rat";
import { Ground } from "./Scene/Ground";

// @ts-ignore
const xr8ApiKey: string | undefined = import.meta.env.VITE_XR8_API_KEY;
const touchSupported = "ontouchend" in document;

type Props = {
  started: boolean;
  onReady: () => void;
  onProgress?: (x: number, label: string) => void;
};

export const App = ({ onReady, onProgress, started }: Props) => {
  const [error, setError] = React.useState<Error>();
  if (error) throw error;

  const [xr8Ready, setXr8Ready] = React.useState(false);

  const xr8Supported = (xr8ApiKey || xr8Hosted) && touchSupported;

  const xr8 = xr8Supported ? useXR8(xr8ApiKey) : null;

  const { active, progress, total } = useProgress();
  const ready = (!xr8Supported || xr8Ready) && !active;

  let progressValue = total > 1 ? progress / 100 : 0;
  let progressLabel = "loading assets";

  if (xr8Supported) {
    if (progressValue < 1) {
      progressValue *= 0.6;
    } else {
      if (!xr8) {
        progressValue = 0.6;
        progressLabel = "loading xr8 library";
      } else {
        progressValue = 0.8;
        progressLabel = "tracking in progress";
      }
    }
  }

  React.useEffect(
    () => void onProgress?.(progressValue, progressLabel),
    [progressValue, progressLabel]
  );
  React.useEffect(() => void (ready && onReady()), [ready]);

  const uiTunnel = React.useMemo(tunnel, []);

  return (
    <>
      {false && <Visualizer />}

      <Canvas
        camera={{ position: new THREE.Vector3(0, 6, 6) }}
        shadows
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: started ? 1 : 0,
          touchAction: "none",
        }}
      >
        <ErrorBoundary onError={setError}>
          {xr8 && <XR8Controls xr8={xr8} onReady={() => setXr8Ready(true)} />}

          <React.Suspense fallback={null}>
            <Environment path={"assets/"} files={"lebombo_1k.hdr"} />

            {started && <Game UiPortal={uiTunnel.In} />}

            {active && <Dice value={1} /> /* ensure the model is loaded */}
          </React.Suspense>

          <directionalLight position={[10, 8, 6]} intensity={0} castShadow />

          <Ground />
        </ErrorBoundary>
      </Canvas>

      <a href="https://github.com/platane/yAR-htzee" title="github">
        <button
          style={{
            position: "absolute",
            width: "40px",
            height: "40px",
            bottom: "10px",
            right: "10px",
            pointerEvents: "auto",
            zIndex: 1,
          }}
        >
          <GithubLogo />
        </button>
      </a>

      {React.createElement(uiTunnel.Out)}
    </>
  );
};

class ErrorBoundary extends React.Component<{
  onError: (error: Error) => void;
  children?: any;
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
