import * as React from "react";

const m = 20;

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

type Props = {
  value: 1 | 2 | 3 | 4 | 5 | 6;
  diceColor?: string;
  lineColor?: string;
} & React.HTMLAttributes<SVGElement>;

export const Dice = ({
  value,
  diceColor = "#f8f8f8",
  lineColor = "#333",
  ...props
}: Props) => (
  <svg width={26} height={26} {...props} viewBox="-50 -50 200 200">
    <rect
      x="-40"
      y="-40"
      width="180"
      height="180"
      rx="15"
      fill={diceColor}
      stroke={lineColor}
      strokeWidth={8}
    />

    {dots[value].map(({ x, y }, i) => (
      <circle key={i} cx={x} cy={y} r={16} fill={lineColor} />
    ))}
  </svg>
);
