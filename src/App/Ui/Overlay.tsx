import * as React from "react";

export const Overlay = ({ children }: any) => (
  <div
    style={{
      position: "absolute",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      left: 0,
      right: 0,
      top: 0,
      zIndex: 1,
      height: "100%",
      backgroundColor: "rgba(0,0,0,0.1)",
    }}
  >
    {children}
  </div>
);
