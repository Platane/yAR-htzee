import * as React from "react";
import { LoadingScreen } from "./Ui/LoadingScreen";
import loadable from "@loadable/component";
import {
  useIsWebXRSupported,
  useWebXRSession,
} from "../WebXRCanvas/WebXRControls";

const LazyApp = loadable(() => import("./App"));

export const Boot = () => {
  const [loadingStatus, setLoadingStatus] = React.useState<
    "ready" | { progress: number }
  >({ progress: 0 });
  const [started, setStarted] = React.useState(false);

  const arSupported = useIsWebXRSupported();

  const webXR = useWebXRSession({
    optionalFeatures: [
      "dom-overlay",
      "local-floor",
      // "light-estimation",
      // "hit-test",
    ],
    domOverlay: { root: document.getElementById("overlay")! },
  });

  return (
    <ErrorBoundary>
      <React.Suspense fallback={null}>
        <LazyApp
          started={started}
          webXRSession={webXR.session}
          onReady={() => setLoadingStatus("ready")}
          onProgress={(progress) =>
            setLoadingStatus((s) => (s === "ready" ? s : { progress }))
          }
        />
      </React.Suspense>

      {!started && (
        <LoadingScreen
          arSupported={arSupported}
          loading={loadingStatus !== "ready" || arSupported === "loading"}
          loadingProgress={
            loadingStatus !== "ready" ? loadingStatus.progress : 1
          }
          onStart={async (ar: boolean) => {
            if (ar) await webXR.init();
            setStarted(true);
          }}
        />
      )}
    </ErrorBoundary>
  );
};

class ErrorBoundary extends React.Component<{ children: any }> {
  state: { error?: Error } = {};

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    if (this.state.error) return <h1>something bad happened</h1>;
    return this.props.children;
  }
}
