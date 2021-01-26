import * as React from "react";
import { Hand } from "./Hand";

const style = `

@keyframes pick-hint-animation-tic {
  0%,
  35%,
  50%,
  100% {
    opacity: 0;
  }
  38%,
  48% {
    opacity: 1;
  }
}
@keyframes pick-hint-animation {
  0%,
  100% {
    opacity: 0;
    transform: translate(50px, 40px) rotate(-10deg);
  }
  10% {
    opacity: 1;
    transform: translate(0, 40px) rotate(-10deg);
  }
  35% {
    opacity: 1;
    transform: translate(-30px, -40px) rotate(14deg);
  }
  38% {
    opacity: 1;
    transform: translate(-30px, -40px) scale(0.8);
  }
  48% {
    opacity: 1;
    transform: translate(-30px, -40px) scale(0.8);
  }
  50% {
    opacity: 1;
    transform: translate(-30px, -40px) scale(1);
  }
  70% {
    opacity: 1;
    transform: translate(0, 40px) rotate(-10deg);
  }
  80% {
    opacity: 0;
    transform: translate(0, 40px) rotate(-10deg);
  }
}

.pick-hint,
.pick-hint * {
    pointer-events:none;
}

.pick-hint > svg {
    animation: pick-hint-animation 2s linear infinite;
}
.pick-hint > svg > .tic {
    animation: pick-hint-animation-tic 2s linear infinite;
}
`;

export const PickHint = () => {
  return (
    <>
      <style>{style}</style>
      <div
        className="pick-hint"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          overflow: "hidden",
          zIndex: 2,

          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Hand
          style={{
            width: "200px",
            height: "200px",
            marginBottom: "100px",
            fill: "#fff",
            filter:
              "drop-shadow(1px 1px 4px black) drop-shadow(-1px -1px 4px black)",
          }}
          tic
        />
        <div
          style={{
            textAlign: "center",
            padding: "10px",
            fontWeight: "bold",
            fontSize: "2em",
            color: "#fff",
            textShadow: "1px 1px 4px black, -1px -1px 4px black",
          }}
        >
          Tap dices you want to re-roll.
        </div>
      </div>
    </>
  );
};
