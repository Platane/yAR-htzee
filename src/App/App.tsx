import * as React from "react";
import { Environment, Stats, useProgress } from "drei";
import { Board } from "./Scene/Board";
import * as THREE from "three";
import { VersatileCanvas } from "../XR8Canvas/VersatileCanvas";
import { Target } from "./Scene/Target";
import { ScoreSheet } from "./Ui/ScoreSheet/ScoreSheet";
import { useStore } from "./useGame";
import { Overlay } from "./Ui/Overlay";
import { Ground } from "./Scene/Ground";
import { Header } from "./Ui/Header";

const xr8ApiKey = process.env.XR8_API_KEY!;

type Props = { onReady: () => void; started: boolean };

export const App = ({ onReady, started }: Props) => {
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
  } = useStore();

  const [rendererReady, setRendererReady] = React.useState(false);
  {
    const { active } = useProgress();
    const r = rendererReady && !active;
    React.useEffect(() => void (r && onReady()), [r]);
  }

  return (
    <>
      <Stats />

      <VersatileCanvas
        xr8ApiKey={xr8ApiKey}
        onReady={() => setRendererReady(true)}
        onError={setError as any}
        camera={{ position: new THREE.Vector3(0, 6, 6) }}
        shadowMap
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: started ? 1 : 0,
          // display: started ? "auto" : "none",
          touchAction: "none",
        }}
      >
        <ErrorBoundary onError={setError}>
          <directionalLight position={[10, 8, 6]} intensity={0} castShadow />
          <React.Suspense fallback={null}>
            <Environment path={"assets/"} files={"lebombo_1k.hdr"} />

            <Board
              roundKey={roundKey}
              onStatusChanged={onRollStatusChanged}
              dicesToReroll={dicesToReroll}
              toggleDiceReroll={toggleDiceReroll}
            />
          </React.Suspense>

          <Ground />

          <Target />
        </ErrorBoundary>
      </VersatileCanvas>

      {started && (
        <Header
          k={k}
          status={status}
          roll={roll}
          toggleDiceReroll={toggleDiceReroll}
        />
      )}

      {started && !scoreSheetOpened && (
        <button
          style={{
            position: "absolute",
            width: "160px",
            height: "40px",
            bottom: "10px",
            right: "10px",
            zIndex: 1,
          }}
          onClick={openScoreSheet}
        >
          score sheet
        </button>
      )}

      {started && scoreSheetOpened && (
        <Overlay>
          <ScoreSheet
            style={{ width: "calc( 100% - 40px )", maxWidth: "600px" }}
            scoreSheet={scoreSheet}
            onClose={closeScoreSheet}
            onSelectCategory={
              status === "picking" ? selectCategoryForRoll : undefined
            }
            rollCandidate={roll}
          />
        </Overlay>
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
