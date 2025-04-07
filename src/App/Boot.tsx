import * as React from "react";
import { LoadingScreen } from "./Ui/LoadingScreen";
import loadable from "@loadable/component";

const LazyApp = loadable(() => import("./App"));

export const Boot = () => {
  const [status, setStatus] = React.useState<
    "ready" | { progressValue: number; progressLabel: string }
  >({ progressValue: 0, progressLabel: "loading app" });

  const [started, setStarted] = React.useState(false);

  return (
    <ErrorBoundary>
      <React.Suspense fallback={null}>
        <LazyApp
          started={started}
          onReady={() => setStatus("ready")}
          onProgress={(progressValue, progressLabel) =>
            setStatus((s) =>
              s === "ready" ? s : { progressValue, progressLabel }
            )
          }
        />
      </React.Suspense>

      {!started && (
        <LoadingScreen status={status} onClose={() => setStarted(true)} />
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
