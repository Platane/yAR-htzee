import * as React from "react";

const LazyApp = React.lazy(() => import("./App"));

export const Boot = () => {
  const [ready, setReady] = React.useState(false);

  return (
    <ErrorBoundary>
      <React.Suspense fallback={null}>
        <LazyApp onReady={() => setReady(true)} ready={ready} />
      </React.Suspense>

      {!ready && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          loading...
        </div>
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
