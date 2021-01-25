import * as React from "react";
import { Hand } from "./Hand";

const style = `


@keyframes pull-hint-animation-tic {
  0%,
  26%,
  62%,
  100% {
    opacity: 0;
  }
  30%,
  58% {
    opacity: 1;
  }
}

@keyframes pull-hint-animation {
  0%,
  100% {
    opacity: 0;
    transform: translate(50px, -80px) rotate(-10deg);
  }
  10% {
    opacity: 1;
    transform: translate(0, -80px) rotate(-10deg);
  }
  27% {
    opacity: 1;
    transform: translate(0, -80px) scale(1.05);
  }
  30% {
    opacity: 1;
    transform: translate(0, -80px) scale(0.8);
  }
  38% {
    opacity: 1;
    transform: translate(0, -80px) scale(0.8);
  }
  58% {
    opacity: 1;
    transform: translate(0, 100px) scale(0.8) rotate(10deg);
  }
  63% {
    opacity: 1;
    transform: translate(0, 100px) scale(1.05) rotate(10deg);
  }
  66% {
    opacity: 1;
    transform: translate(0, 100px) rotate(10deg);
  }
  76% {
    opacity: 1;
    transform: translate(0, 100px) rotate(10deg);
  }
  86% {
    opacity: 0;
    transform: translate(40px, 100px) rotate(5deg);
  }
}

.pull-hint,
.pull-hint * {
    pointer-events:none;
}

.pull-hint > svg {
    animation: pull-hint-animation 2s linear infinite;
}
.pull-hint > svg > .tic {
    animation: pull-hint-animation-tic 2s linear infinite;
}
`;

export const PullHint = () => {
  return (
    <>
      <style>{style}</style>
      <div
        className="pull-hint"
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
            fontSize: "2em",
            color: "#fff",
            textShadow: "1px 1px 4px black, -1px -1px 4px black",
          }}
        >
          Swipe down to grab the dice to re-roll.
        </div>
      </div>
    </>
  );
};
