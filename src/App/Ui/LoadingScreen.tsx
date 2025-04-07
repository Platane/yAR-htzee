import * as React from "react";
import { PageRules } from "./PageRules";

type Props = {
  onClose: () => void;
  status: "ready" | { progressValue: number; progressLabel: string };
};

export const LoadingScreen = ({ onClose, status }: Props) => (
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
      onClick={onClose}
      disabled={status != "ready"}
    >
      {status === "ready"
        ? "Start"
        : `${status.progressLabel} ${(status.progressValue * 100)
            .toFixed(0)
            .padStart(3, " ")}% ...`}
    </button>
  </div>
);
