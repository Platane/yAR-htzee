import * as React from "react";
import { LoadingScreen } from "./Ui/LoadingScreen";
import loadable from "@loadable/component";

const LazyApp = loadable(() => import("./App"));

export const Boot = () => {
  const [loadingStatus, setLoadingStatus] = React.useState<
    "ready" | { progress: number }
  >({ progress: 0 });
  const [started, setStarted] = React.useState(false);

  return (
    <ErrorBoundary>
      <React.Suspense fallback={null}>
        <LazyApp
          started={started}
          onReady={() => setLoadingStatus("ready")}
          onProgress={(progress) =>
            setLoadingStatus((s) => (s === "ready" ? s : { progress }))
          }
        />
      </React.Suspense>

      {!started && (
        <LoadingScreen
          loading={loadingStatus !== "ready"}
          loadingProgress={
            loadingStatus !== "ready" ? loadingStatus.progress : 1
          }
          onClose={() => setStarted(true)}
        />
      )}
    </ErrorBoundary>
  );
};

class ErrorBoundary extends React.Component {
  state: { error?: Error } = {};

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    if (this.state.error) return <h1>something bad happened</h1>;
    return this.props.children;
  }
}
