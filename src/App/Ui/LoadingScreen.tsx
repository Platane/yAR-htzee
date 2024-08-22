import * as React from "react";
import { PageRules } from "./PageRules";

type Props = {
  onStart: (ar: boolean) => void;
  loading: boolean;
  loadingProgress: number;
  arSupported: boolean | "loading";
};

export const LoadingScreen = ({
  onStart,
  loading,
  loadingProgress,
  arSupported,
}: Props) => (
  <div
    style={{
      padding: "10px",
      display: "flex",
      flexDirection: "column",
      position: "relative",
      zIndex: 2,
    }}
  >
    <PageRules />

    {loading && (
      <Button disabled>{`loading ${(loadingProgress * 100)
        .toFixed(0)
        .padStart(3, " ")}% ...`}</Button>
    )}

    {!loading && !arSupported && (
      <Button onClick={() => onStart(false)}>Start</Button>
    )}

    {!loading && arSupported && (
      <>
        <Button onClick={() => onStart(true)}>Start AR</Button>
        <Button onClick={() => onStart(false)} style={{ opacity: 0.7 }}>
          Start flat
        </Button>
      </>
    )}
  </div>
);

const Button = ({ children, style, ...props }: any) => (
  <button
    {...props}
    style={{
      width: "160px",
      height: "40px",
      marginTop: "60px",
      alignSelf: "center",
      ...style,
    }}
  >
    {children}
  </button>
);
