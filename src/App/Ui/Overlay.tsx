import * as React from "react";

export const Overlay = ({ children }: any) => (
  <div
    style={{
      position: "absolute",
      // display: "flex",
      // flexDirection: "column",
      // alignItems: "center",
      // justifyContent: "center",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 1,
      height: "100%",
      backgroundColor: "rgba(0,0,0,0.1)",
      overflow: "auto",
      pointerEvents: "auto",
    }}
  >
    {children}
  </div>
);
