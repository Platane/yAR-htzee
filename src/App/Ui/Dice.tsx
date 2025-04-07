import * as React from "react";

type Props = {
  diceColor?: string;
  lineColor?: string;
  value: 1 | 2 | 3 | 4 | 5 | 6 | "blank" | "rolling";
} & React.HTMLAttributes<SVGElement>;

/**
 * svg dice faces
 */
export const Dice = ({
  value,
  diceColor = "#f8f8f8",
  lineColor = "#333",
  ...props
}: Props & {}) => (
  <svg width={28} height={28} {...props} viewBox="-50 -50 200 200">
    <rect
      x={-40}
      y={-40}
      width={180}
      height={180}
      rx={15}
      fill={diceColor}
      stroke={lineColor}
      strokeWidth={8}
    />

    {typeof value === "number" &&
      dots[value].map(({ x, y }, i) => (
        <circle key={i} cx={x} cy={y} r={16} fill={lineColor} />
      ))}

    {value === "rolling" && (
      <>
        <mask id="myMask">
          <rect x={-50} y={-50} width={200} height={200} fill="black" />
          <rect x={-20} y={-20} width={140} height={140} fill="white" rx={15} />
        </mask>
        <style>{`
              @keyframes dice_value_roll {
                0% { transform: translateY(0) }
                38% { transform: translateY(${-100 * 3 * 1.15}%) }
                100% { transform: translateY(${-100 * 6 * 1.15}%) }
              }
            `}</style>
        <g mask="url(#myMask)">
          {([1, 2, 3, 4, 5, 6, 1] as const).flatMap((dot, i) =>
            dots[dot].map(({ x, y }, j) => (
              <circle
                key={i * 10 + j}
                cx={x}
                cy={y + i * 200 * 1.15}
                r={16}
                fill={lineColor}
                style={{
                  // filter: "blur(10px)",
                  animation: "dice_value_roll 800ms infinite linear",
                }}
              />
            ))
          )}
        </g>
      </>
    )}
  </svg>
);

const dots = {
  1: [
    //
    { x: 50, y: 50 },
  ],
  2: [
    { x: 0, y: 0 },
    { x: 100, y: 100 },
  ],
  3: [
    { x: 0, y: 0 },
    { x: 50, y: 50 },
    { x: 100, y: 100 },
  ],
  4: [
    { x: 0, y: 100 },
    { x: 100, y: 100 },
    { x: 100, y: 0 },
    { x: 0, y: 0 },
  ],
  5: [
    { x: 0, y: 100 },
    { x: 100, y: 100 },
    { x: 100, y: 0 },
    { x: 0, y: 0 },
    { x: 50, y: 50 },
  ],
  6: [
    { x: 0, y: 100 },
    { x: 100, y: 100 },
    { x: 100, y: 0 },
    { x: 0, y: 0 },
    { x: 100, y: 50 },
    { x: 0, y: 50 },
  ],
};
