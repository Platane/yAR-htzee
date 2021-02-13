import * as React from "react";
import { PageRules } from "./PageRules";

type Props = { onClose: () => void; loading: boolean; loadingProgress: number };

export const LoadingScreen = ({ onClose, loading, loadingProgress }: Props) => (
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

    <button
      style={{
        width: "160px",
        height: "40px",
        marginTop: "60px",
        alignSelf: "center",
      }}
      onClick={loading ? undefined : onClose}
      disabled={loading}
    >
      {loading &&
        `loading ${(loadingProgress * 100).toFixed(0).padStart(3, " ")}% ...`}
      {!loading && "Start"}
    </button>
  </div>
);
