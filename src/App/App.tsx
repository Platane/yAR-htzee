import * as React from "react";
import { Environment, useProgress } from "@react-three/drei";
import { Board } from "./Scene/Board";
import * as THREE from "three";
import { Target } from "./Scene/Target";
import { ScoreSheet } from "./Ui/ScoreSheet/ScoreSheet";
import { useStore } from "./useGame";
import { Overlay } from "./Ui/Overlay";
import { Ground } from "./Scene/Ground";
import { Header } from "./Ui/Header";
import { ThrowHint } from "./Ui/Hints/ThrowHint";
import { PickHint } from "./Ui/Hints/PickHint";
import { PullHint } from "./Ui/Hints/PullHint";
import { useDelay } from "./Ui/useDelay";
import { GithubLogo } from "./Ui/GithubLogo";
import { Canvas } from "@react-three/fiber";
import { XR8Controls } from "../XR8Canvas/XR8Controls";
import { useXR8 } from "../XR8Canvas/useXR8";
// @ts-ignore
import { Visualizer } from "react-touch-visualizer";
import { xr8Hosted } from "../XR8Canvas/getXR8";

const xr8ApiKey = process.env.XR8_API_KEY!;
const touchSupported = "ontouchend" in document;

type Props = {
  started: boolean;
  onReady: () => void;
  onProgress?: (x: number) => void;
};

const useHint = ({ status, k, dicesToReroll, roundKey }: any) => {
  if (roundKey > 1 || k > 1) return null;

  if (status === "pre-roll") return "throw" as const;

  if (status === "picking") {
    if (dicesToReroll.length === 0) return "pick" as const;
    else return "pull" as const;
  }
};

export const App = ({ onReady, onProgress, started }: Props) => {
  const [error, setError] = React.useState<Error>();
  if (error) throw error;

  const {
    k,
    status,
    roundKey,
    roll,
    scoreSheet,
    scoreSheetOpened,
    dicesToReroll,
    openScoreSheet,
    closeScoreSheet,
    selectCategoryForRoll,
    toggleDiceReroll,
    onRollStatusChanged,
    reset,
  } = useStore();

  const h = useHint({ k, status, roundKey, dicesToReroll });
  const dicesToRerollStable = !!useDelay(dicesToReroll, 1000);
  const hint = useDelay(
    !scoreSheetOpened && started && dicesToRerollStable && h,
    2000
  );

  const [xr8Ready, setXr8Ready] = React.useState(false);

  const xr8Supported = (xr8ApiKey || xr8Hosted) && touchSupported;

  const xr8 = xr8Supported ? useXR8(xr8ApiKey) : null;

  {
    const { active, progress, total } = useProgress();
    const ready = (!xr8Supported || xr8Ready) && !active;

    const globalProgress =
      // loading the asses account for 70%
      (total > 1 ? progress / 100 : 0) * 0.7 +
      //
      // loading the renderer account for 20%
      (!xr8Supported || xr8Ready ? 1 : 0) * 0.2 +
      //
      // loading this component account for 10%
      0.1;

    React.useEffect(() => void onProgress?.(globalProgress), [globalProgress]);
    React.useEffect(() => void (ready && onReady()), [ready]);
  }

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

            <Board
              status={status}
              roundKey={roundKey}
              onStatusChanged={onRollStatusChanged}
              dicesToReroll={dicesToReroll}
              toggleDiceReroll={toggleDiceReroll}
            />
          </React.Suspense>

          <directionalLight position={[10, 8, 6]} intensity={0} castShadow />

          <Target />

          <Ground />
        </ErrorBoundary>
      </Canvas>

      {started && (
        <>
          <Header
            k={k}
            status={status}
            roll={roll}
            toggleDiceReroll={toggleDiceReroll}
          />

          {!scoreSheetOpened && (
            <button
              style={{
                position: "absolute",
                width: "160px",
                height: "40px",
                bottom: "10px",
                right: "60px",
                zIndex: 1,
              }}
              onClick={openScoreSheet}
            >
              score sheet
            </button>
          )}

          <a href="https://github.com/platane/yAR-htzee" title="github">
            <button
              style={{
                position: "absolute",
                width: "40px",
                height: "40px",
                bottom: "10px",
                right: "10px",
                zIndex: 1,
              }}
            >
              <GithubLogo />
            </button>
          </a>

          {scoreSheetOpened && (
            <Overlay>
              <ScoreSheet
                style={{ width: "calc( 100% - 40px )", maxWidth: "600px" }}
                scoreSheet={scoreSheet}
                onClose={closeScoreSheet}
                onSelectCategory={
                  status === "picking" ? selectCategoryForRoll : undefined
                }
                rollCandidate={roll}
                reset={reset}
              />
            </Overlay>
          )}

          {hint === "throw" && <ThrowHint />}
          {hint === "pick" && <PickHint />}
          {hint === "pull" && <PullHint />}
        </>
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
